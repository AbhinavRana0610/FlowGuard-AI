"use client";

import Link from "next/link";
import { useDashboardStore } from "@/store/dashboardStore";
import type { Zone } from "@/store/dashboardStore";

// ── Helpers ───────────────────────────────────────────────────────────────

function riskColor(risk: Zone["risk"]) {
  if (risk === "critical") return "#ffb4ab";
  if (risk === "warning") return "#ffb596";
  return "#b4c5ff";
}

function riskFill(risk: Zone["risk"]) {
  if (risk === "critical") return "rgba(255,180,171,0.18)";
  if (risk === "warning") return "rgba(255,181,150,0.15)";
  return "rgba(180,197,255,0.10)";
}

function riskLabel(risk: Zone["risk"]) {
  if (risk === "critical") return "Critical";
  if (risk === "warning") return "Warning";
  return "Clear";
}

function waitFromOccupancy(occ: number) {
  if (occ < 35) return "2 min";
  if (occ < 60) return "4 min";
  if (occ < 80) return "8 min";
  return "12+ min";
}

// ── Bottom nav shared ─────────────────────────────────────────────────────

const NAV_ITEMS = [
  { icon: "home",                label: "Home",   href: "/" },
  { icon: "confirmation_number", label: "Ticket", href: "/fan-app",      fill: true },
  { icon: "explore",             label: "Map",    href: "/fan-app/map",  fill: false, active: true },
  { icon: "support_agent",       label: "Help",   href: "/fan-app/help", fill: false },
];

// ── Gate SVG positions ────────────────────────────────────────────────────

const GATE_POSITIONS: Record<string, { cx: number; cy: number; labelX: number; labelY: number; anchor: string }> = {
  gateA: { cx: 100, cy: 175, labelX: 18,  labelY: 175, anchor: "start" },
  gateB: { cx: 250, cy:  45, labelX: 250, labelY:  24, anchor: "middle" },
  gateC: { cx: 400, cy: 175, labelX: 470, labelY: 175, anchor: "end" },
  gateD: { cx: 250, cy: 305, labelX: 250, labelY: 326, anchor: "middle" },
};

const GATE_LABELS: Record<string, string> = {
  gateA: "Gate A",
  gateB: "Gate B",
  gateC: "Gate C",
  gateD: "Gate D",
};

// ── Component ─────────────────────────────────────────────────────────────

export default function FanMap() {
  const { zones, notifications } = useDashboardStore();

  // Detect assigned gate (surge → Gate D, else Gate B)
  const msg = notifications[0]?.message ?? "";
  const isSurge = msg.includes("surge") || msg.includes("Crowd");
  const assignedGateId = isSurge ? "gateD" : "gateB";
  const assignedZone = zones.find((z) => z.id === assignedGateId)!;

  return (
    <div className="bg-surface text-on-surface font-body-md overflow-x-hidden no-scrollbar min-h-screen">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-full h-full bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-secondary-container/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-primary/20 flex justify-between items-center px-6 py-4">
        <Link href="/" className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight hover:text-primary transition-colors">
          FlowGuard AI
        </Link>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 font-label-caps text-[10px] text-primary">
            LIVE MAP
          </span>
        </div>
      </header>

      <main className="relative z-10 pt-24 pb-32 px-6 space-y-6 max-w-[32rem] mx-auto">

        {/* Assigned gate banner */}
        <div className={`glass-card shimmer-border rounded-xl p-4 flex items-center gap-4 border-l-4 ${isSurge ? "border-tertiary bg-gradient-to-r from-tertiary/10 to-transparent" : "border-primary bg-gradient-to-r from-primary/10 to-transparent"}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSurge ? "bg-tertiary/20" : "bg-primary/20"}`}>
            <span className={`material-symbols-outlined text-[20px] ${isSurge ? "text-tertiary" : "text-primary"}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              near_me
            </span>
          </div>
          <div>
            <p className={`font-label-caps text-label-caps mb-0.5 ${isSurge ? "text-tertiary" : "text-primary"}`}>YOUR ASSIGNED GATE</p>
            <p className="font-headline-sm text-headline-sm text-on-surface">{GATE_LABELS[assignedGateId]}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Wait: {waitFromOccupancy(assignedZone.occupancy)} · {riskLabel(assignedZone.risk)}</p>
          </div>
        </div>

        {/* Stadium SVG Map */}
        <div className="glass-card shimmer-border rounded-2xl p-4">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase">Stadium Overview</p>
          <svg viewBox="0 0 500 350" className="w-full" style={{ height: "260px" }}>
            {/* Outer ring */}
            <ellipse cx="250" cy="175" rx="230" ry="155" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            {/* Inner pitch */}
            <ellipse cx="250" cy="175" rx="90" ry="60" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeDasharray="4 3" strokeWidth="1" />
            <text x="250" y="179" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="10" fontFamily="monospace">PITCH</text>

            {/* Gate zones — quadrant fills */}
            {zones.map((zone) => {
              const pos = GATE_POSITIONS[zone.id];
              if (!pos) return null;
              const isAssigned = zone.id === assignedGateId;
              return (
                <g key={zone.id}>
                  {/* Connector line from gate dot to center area */}
                  <line
                    x1={pos.cx} y1={pos.cy}
                    x2={250} y2={175}
                    stroke={riskColor(zone.risk)}
                    strokeWidth={isAssigned ? 2 : 1}
                    strokeDasharray={isAssigned ? "none" : "4 4"}
                    opacity={isAssigned ? 0.7 : 0.3}
                  />
                  {/* Gate circle */}
                  <circle
                    cx={pos.cx} cy={pos.cy}
                    r={isAssigned ? 18 : 14}
                    fill={isAssigned ? riskColor(zone.risk) : riskFill(zone.risk)}
                    stroke={riskColor(zone.risk)}
                    strokeWidth={isAssigned ? 2.5 : 1.5}
                    opacity={isAssigned ? 1 : 0.8}
                  />
                  {/* Gate label inside circle */}
                  <text
                    x={pos.cx} y={pos.cy + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isAssigned ? "#11131b" : riskColor(zone.risk)}
                    fontSize={isAssigned ? "9" : "8"}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {zone.id.replace("gate", "").toUpperCase()}
                  </text>
                  {/* Occupancy label outside */}
                  <text
                    x={pos.labelX} y={pos.labelY}
                    textAnchor={pos.anchor as "start" | "middle" | "end"}
                    fill={riskColor(zone.risk)}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {zone.occupancy}%
                  </text>
                  {/* Assigned pin pulse ring */}
                  {isAssigned && (
                    <circle
                      cx={pos.cx} cy={pos.cy}
                      r="24"
                      fill="none"
                      stroke={riskColor(zone.risk)}
                      strokeWidth="1.5"
                      opacity="0.4"
                      style={{ animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite" }}
                    />
                  )}
                </g>
              );
            })}

            {/* YOU ARE HERE marker */}
            <circle cx="250" cy="230" r="6" fill="#b4c5ff" />
            <circle cx="250" cy="230" r="10" fill="none" stroke="#b4c5ff" strokeWidth="1" opacity="0.4" />
            <text x="262" y="234" fill="#b4c5ff" fontSize="8" fontFamily="monospace">YOU</text>
          </svg>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
            {[["#b4c5ff", "Clear"], ["#ffb596", "Warning"], ["#ffb4ab", "Critical"]].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] font-label-caps text-on-surface-variant">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gate status list */}
        <div className="glass-card shimmer-border rounded-2xl p-4">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase">All Gates</p>
          <div className="space-y-3">
            {zones.map((zone) => {
              const isAssigned = zone.id === assignedGateId;
              return (
                <div key={zone.id} className={`flex items-center justify-between p-3 rounded-xl transition-all ${isAssigned ? "bg-primary/10 border border-primary/20" : "bg-white/3"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${riskColor(zone.risk)}20`, border: `1px solid ${riskColor(zone.risk)}40` }}>
                      <span className="font-bold text-[11px]" style={{ color: riskColor(zone.risk) }}>
                        {zone.id.replace("gate", "").toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-label-caps text-[12px] text-on-surface flex items-center gap-2">
                        {GATE_LABELS[zone.id]}
                        {isAssigned && <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-bold">YOUR GATE</span>}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">{waitFromOccupancy(zone.occupancy)} wait</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono-data text-[13px] font-bold" style={{ color: riskColor(zone.risk) }}>{zone.occupancy}%</p>
                    <p className="text-[10px]" style={{ color: riskColor(zone.risk) }}>{riskLabel(zone.risk)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/fan-app"
          className="w-full py-4 px-8 rounded-2xl bg-primary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
          Back to My Ticket
        </Link>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-surface-container/80 backdrop-blur-lg border-t border-white/10">
        {NAV_ITEMS.map(({ icon, label, href, active, fill }) => (
          <Link
            key={label}
            href={href}
            className={`flex flex-col items-center justify-center p-2 rounded-xl active:scale-90 transition-all ${
              active ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined" style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}>{icon}</span>
            <span className="font-label-caps text-label-caps">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
