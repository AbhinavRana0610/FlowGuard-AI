import { orchestrator } from "@/agents/orchestrator";
import { useDashboardStore } from "@/store/dashboardStore";
import { useDemoStore } from "@/store/demoStore";

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export async function runFullMatchDay() {
  if (useDemoStore.getState().status === "running") return;

  const demo = useDemoStore.getState;
  const dashboard = useDashboardStore.getState;

  try {
    // ── Step 1 ─────────────────────────────────────────────
    // PRE-MATCH ARRIVAL — 0s
    demo().setStep(10, "Generating Fans", "PRE-MATCH ARRIVAL");
    await orchestrator.generateFans();
    await sleep(4000);

    // ── Step 2 ─────────────────────────────────────────────
    // CROWD SURGE — ~5s
    demo().setStep(30, "Managing Crowd", "CROWD SURGE DETECTED");
    await orchestrator.triggerCrowdSurge();
    await sleep(4000);

    // ── Step 3 ─────────────────────────────────────────────
    // MEDICAL INCIDENT — ~10s
    demo().setStep(60, "Handling Emergency", "EMERGENCY RESPONSE ACTIVE");
    await orchestrator.triggerMedical();
    await sleep(4000);

    // ── Step 4 ─────────────────────────────────────────────
    // WEATHER EVENT — ~15s
    demo().setStep(90, "Executing Protocol", "WEATHER RESPONSE ACTIVE");
    await orchestrator.triggerRain();
    await sleep(6000);

    // ── Step 5 ─────────────────────────────────────────────
    // RESOLUTION — ~22s
    demo().setStep(100, "Stabilizing System", "FLOWGUARD AI STABILIZED MATCH OPERATIONS");

    // Resolve every active alert
    const alerts = dashboard().alerts;
    alerts
      .filter((a) => a.status !== "completed")
      .forEach((a) => dashboard().resolveAlert(a.id));

    // Restore system health and congestion
    useDashboardStore.setState({
      systemHealth: "optimal",
      congestionScore: 24,
    });

    await sleep(1500);
    demo().setCompleted();
  } catch {
    demo().reset();
  }
}
