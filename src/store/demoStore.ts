import { create } from "zustand";

export type DemoStatus = "idle" | "running" | "completed";

type DemoState = {
  status: DemoStatus;
  progress: number;
  progressLabel: string;
  stepName: string;
};

type DemoActions = {
  setStep: (progress: number, progressLabel: string, stepName: string) => void;
  setCompleted: () => void;
  reset: () => void;
};

export const useDemoStore = create<DemoState & DemoActions>((set) => ({
  status: "idle",
  progress: 0,
  progressLabel: "",
  stepName: "",

  setStep: (progress, progressLabel, stepName) =>
    set({ status: "running", progress, progressLabel, stepName }),

  setCompleted: () =>
    set({
      status: "completed",
      progress: 100,
      progressLabel: "Stabilizing System",
      stepName: "FLOWGUARD AI STABILIZED MATCH OPERATIONS",
    }),

  reset: () =>
    set({ status: "idle", progress: 0, progressLabel: "", stepName: "" }),
}));
