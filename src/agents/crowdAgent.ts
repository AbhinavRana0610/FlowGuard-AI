import type { Zone } from "@/store/dashboardStore";
import type { AgentOutput } from "./types";

type FanArrivalCtx = { zones: Zone[]; fans: number; congestionScore: number };
type SurgeCtx = { zones: Zone[]; congestionScore: number };
type RainCtx = { zones: Zone[]; congestionScore: number };

function ts() {
  return new Date().toISOString();
}

export const crowdAgent = {
  async onFanArrival({ zones, fans, congestionScore }: FanArrivalCtx): Promise<AgentOutput> {
    const gateB = zones.find((z) => z.id === "gateB");
    const target = gateB && gateB.occupancy > 70 ? "D" : "C";
    const redirect = Math.floor(Math.random() * 20) + 12;
    return {
      agent: "Crowd Intelligence",
      decision: `Redirect ${redirect}% of arriving traffic to Gate ${target}`,
      reason: `Fan count at ${fans.toLocaleString()} — congestion at ${congestionScore}%. Proactive load distribution applied`,
      confidence: Math.floor(Math.random() * 10) + 83,
      timestamp: ts(),
    };
  },

  async onSurge({ zones, congestionScore }: SurgeCtx): Promise<AgentOutput> {
    const gateB = zones.find((z) => z.id === "gateB");
    const redirect = Math.floor(Math.random() * 15) + 30;
    return {
      agent: "Crowd Intelligence",
      decision: `Redirect ${redirect}% of Gate B traffic to Gate D immediately`,
      reason: `Gate B at ${gateB?.occupancy ?? 97}% — critical threshold breached. Emergency dispersal protocol activated`,
      confidence: Math.floor(Math.random() * 5) + 91,
      timestamp: ts(),
    };
  },

  async onRain({ zones, congestionScore }: RainCtx): Promise<AgentOutput> {
    const criticalCount = zones.filter((z) => z.risk === "critical").length;
    return {
      agent: "Crowd Intelligence",
      decision: "Open auxiliary concourse corridors C2 and D3 for overflow capacity",
      reason: `Rain-induced shelter seeking raised density across ${criticalCount} critical zone${criticalCount !== 1 ? "s" : ""}. Congestion now at ${congestionScore}%`,
      confidence: Math.floor(Math.random() * 8) + 85,
      timestamp: ts(),
    };
  },
};
