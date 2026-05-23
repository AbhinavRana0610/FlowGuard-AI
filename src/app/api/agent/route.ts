import { NextRequest, NextResponse } from "next/server";

type Zone = { id: string; occupancy: number; risk: string };
type Body = { scenario: string; congestion: number; zones: Zone[]; fans: number };

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

function ruleEngine(body: Body) {
  const { scenario, congestion, zones } = body;
  const critical = zones.filter((z) => z.risk === "critical");
  if (congestion >= 85 || critical.length >= 2) {
    return {
      decision: "EMERGENCY PROTOCOL",
      reason: `${congestion}% congestion with ${critical.length} critical zones. Immediate action required.`,
      confidence: 97,
      recommendation: "Activate full emergency protocol and evacuate to Gate D",
    };
  }
  if (scenario === "surge" || congestion >= 70) {
    return {
      decision: "REDIRECT TRAFFIC",
      reason: `Elevated congestion at ${congestion}%. Load balancing across gates needed.`,
      confidence: 91,
      recommendation: "Redirect crowd from critical gates to low-occupancy zones",
    };
  }
  if (scenario === "medical") {
    return {
      decision: "MEDICAL RESPONSE",
      reason: "Medical incident requires immediate area clearance and responder access.",
      confidence: 94,
      recommendation: "Cordon Sector 4B and route fans via Gate B North Entry",
    };
  }
  return {
    decision: "MONITOR",
    reason: `System nominal at ${congestion}% congestion. No intervention needed.`,
    confidence: 88,
    recommendation: "Continue passive monitoring",
  };
}

export async function POST(req: NextRequest) {
  const body: Body = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ...ruleEngine(body), source: "rule-engine" });
  }

  const prompt = `You are FlowGuard AI, a crowd management system for a stadium with ${body.fans.toLocaleString()} fans.

Current state: scenario=${body.scenario}, congestion=${body.congestion}%, zones=${JSON.stringify(body.zones)}

Respond ONLY with valid JSON matching this schema exactly:
{ "decision": string, "reason": string, "confidence": number, "recommendation": string }`;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 200, temperature: 0.3 },
      }),
    });

    if (!res.ok) throw new Error(`Gemini ${res.status}`);

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON");

    return NextResponse.json({ ...JSON.parse(match[0]), source: "gemini" });
  } catch {
    return NextResponse.json({ ...ruleEngine(body), source: "rule-engine-fallback" });
  }
}
