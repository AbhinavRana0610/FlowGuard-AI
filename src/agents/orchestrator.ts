import { useDashboardStore } from "@/store/dashboardStore";
import type { Log } from "@/store/dashboardStore";
import { crowdAgent } from "./crowdAgent";
import { emergencyAgent } from "./emergencyAgent";
import { communicationAgent } from "./communicationAgent";
import type { AgentOutput } from "./types";

export type { AgentOutput };

// ── Internals ──────────────────────────────────────────────────────────────

function randomDelay() {
  return new Promise<void>((r) =>
    setTimeout(r, Math.floor(Math.random() * 400) + 800)
  );
}

function nowTime() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

let _uid = 1000;
function uid() {
  return `agent-${_uid++}`;
}

type AgentType = Log["agentType"];

function toLog(output: AgentOutput, agentType: AgentType): Log {
  return {
    id: uid(),
    agent: output.agent,
    agentType,
    status: output.decision,
    message: `${output.reason} — ${output.confidence}% confidence`,
    time: "just now",
  };
}

function store() {
  return useDashboardStore.getState();
}

// ── Orchestrator ──────────────────────────────────────────────────────────

export const orchestrator = {
  /**
   * generateFans → Crowd Agent
   */
  async generateFans() {
    store().generateFans();

    await randomDelay();

    const ctx = store();
    const output = await crowdAgent.onFanArrival({
      zones: ctx.zones,
      fans: ctx.fans,
      congestionScore: ctx.congestionScore,
    });

    store().appendLog(toLog(output, "primary"));
  },

  /**
   * triggerCrowdSurge → Crowd Agent → Communication Agent
   */
  async triggerCrowdSurge() {
    store().triggerCrowdSurge();

    await randomDelay();

    const ctx = store();
    const [crowdOut, commOut] = await Promise.all([
      crowdAgent.onSurge({ zones: ctx.zones, congestionScore: ctx.congestionScore }),
      communicationAgent.onSurge({ fans: ctx.fans }),
    ]);

    store().appendLog(toLog(crowdOut, "primary"));
    store().appendLog(toLog(commOut, "tertiary"));
    store().appendAlert({
      time: nowTime(),
      title: `CROWD AI: ${crowdOut.decision.toUpperCase()}`,
      message: `${crowdOut.reason} — ${crowdOut.confidence}% confidence`,
      severity: "critical",
      status: "action_required",
    });
  },

  /**
   * triggerMedical → Emergency Agent → Communication Agent
   */
  async triggerMedical() {
    store().triggerMedical();

    await randomDelay();

    const ctx = store();
    const [emerOut, commOut] = await Promise.all([
      emergencyAgent.onMedical({ zones: ctx.zones }),
      communicationAgent.onMedical({ fans: ctx.fans }),
    ]);

    store().appendLog(toLog(emerOut, "error"));
    store().appendLog(toLog(commOut, "tertiary"));
    store().appendAlert({
      time: nowTime(),
      title: `EMERGENCY AI: ${emerOut.decision.toUpperCase()}`,
      message: `${emerOut.reason} — ${emerOut.confidence}% confidence`,
      severity: "warning",
      status: "monitoring",
    });
  },

  /**
   * triggerRain → Emergency Agent → Crowd Agent → Communication Agent
   */
  async triggerRain() {
    store().triggerRain();

    await randomDelay();

    const ctx = store();
    const [emerOut, crowdOut, commOut] = await Promise.all([
      emergencyAgent.onRain({ zones: ctx.zones }),
      crowdAgent.onRain({ zones: ctx.zones, congestionScore: ctx.congestionScore }),
      communicationAgent.onRain({ fans: ctx.fans }),
    ]);

    store().appendLog(toLog(emerOut, "error"));
    store().appendLog(toLog(crowdOut, "primary"));
    store().appendLog(toLog(commOut, "tertiary"));
    store().appendAlert({
      time: nowTime(),
      title: `WEATHER RESPONSE: ${emerOut.decision.toUpperCase()}`,
      message: `${emerOut.reason} — ${emerOut.confidence}% confidence`,
      severity: "warning",
      status: "monitoring",
    });
  },
};
