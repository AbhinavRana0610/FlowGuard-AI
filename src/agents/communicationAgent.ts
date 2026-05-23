import type { AgentOutput } from "./types";

type SurgeCtx = { fans: number };
type MedicalCtx = { fans: number };
type RainCtx = { fans: number };

function ts() {
  return new Date().toISOString();
}

export const communicationAgent = {
  async onSurge({ fans }: SurgeCtx): Promise<AgentOutput> {
    const affected = Math.floor(fans * 0.015);
    return {
      agent: "Communications AI",
      decision: `Broadcast Gate D reroute advisory to ${affected.toLocaleString()} affected fans`,
      reason:
        "Gate B surge requires immediate fan redistribution. Push notification + PA system coordinated",
      confidence: Math.floor(Math.random() * 2) + 97,
      timestamp: ts(),
    };
  },

  async onMedical({ fans }: MedicalCtx): Promise<AgentOutput> {
    const sector = Math.floor(fans * 0.003);
    return {
      agent: "Communications AI",
      decision: `Send medical corridor hold notice to ${sector.toLocaleString()} fans near Sector 4B`,
      reason:
        "Emergency access route must remain clear. Fan guidance issued for safety compliance",
      confidence: Math.floor(Math.random() * 2) + 97,
      timestamp: ts(),
    };
  },

  async onRain({ fans }: RainCtx): Promise<AgentOutput> {
    return {
      agent: "Communications AI",
      decision: `Push shelter advisory and nearest covered route to all ${fans.toLocaleString()} in-stadium fans`,
      reason:
        "Weather event requires coordinated fan guidance to prevent hazardous outdoor crowding",
      confidence: Math.floor(Math.random() * 3) + 96,
      timestamp: ts(),
    };
  },
};
