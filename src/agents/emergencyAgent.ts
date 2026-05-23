import type { Zone } from "@/store/dashboardStore";
import type { AgentOutput } from "./types";

type MedicalCtx = { zones: Zone[] };
type RainCtx = { zones: Zone[] };

function ts() {
  return new Date().toISOString();
}

function gateLabel(id: string) {
  return id.replace("gate", "Gate ").replace(/([A-D])$/, (m) => m.toUpperCase());
}

export const emergencyAgent = {
  async onMedical({ zones }: MedicalCtx): Promise<AgentOutput> {
    const safeGate = zones.find((z) => z.risk === "safe");
    const via = safeGate ? gateLabel(safeGate.id) : "Gate A";
    return {
      agent: "Emergency Coordinator",
      decision: `Deploy first response unit via Priority Route 2 — clear path through ${via}`,
      reason: "Medical incident confirmed in Sector 4B. Immediate responder access and fan clearance required",
      confidence: Math.floor(Math.random() * 4) + 94,
      timestamp: ts(),
    };
  },

  async onRain({ zones }: RainCtx): Promise<AgentOutput> {
    const criticalZones = zones
      .filter((z) => z.risk === "critical")
      .map((z) => gateLabel(z.id));
    const scope =
      criticalZones.length > 0 ? criticalZones.join(" and ") : "all gate approaches";
    return {
      agent: "Emergency Coordinator",
      decision: `Activate wet-surface safety protocols at ${scope}`,
      reason:
        "Rain reduces crowd velocity by ~35% and raises slip risk. Surface protocols are mandatory above 60% occupancy",
      confidence: Math.floor(Math.random() * 6) + 88,
      timestamp: ts(),
    };
  },
};
