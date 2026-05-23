import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Risk = "safe" | "warning" | "critical";
export type SystemHealth = "optimal" | "warning" | "critical";
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "action_required" | "monitoring" | "completed";

export type Zone = {
  id: string;
  occupancy: number;
  risk: Risk;
};

export type Alert = {
  id: string;
  time: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
};

export type Log = {
  id: string;
  agent: string;
  agentType: "primary" | "error" | "secondary" | "tertiary";
  status: string;
  message: string;
  time: string;
  source?: "gemini" | "agent";
};

export type Notification = {
  id: string;
  message: string;
  time?: string;
};

type DashboardState = {
  fans: number;
  congestionScore: number;
  agentActions: number;
  systemHealth: SystemHealth;
  zones: Zone[];
  alerts: Alert[];
  logs: Log[];
  notifications: Notification[];
};

type DashboardActions = {
  generateFans: () => void;
  triggerCrowdSurge: () => void;
  triggerMedical: () => void;
  triggerRain: () => void;
  triggerEmergencyProtocol: () => void;
  applyReroute: (fromId: string, toId: string) => void;
  resolveAlert: (id: string) => void;
  clearSimulation: () => void;
  appendLog: (log: Log) => void;
  appendAlert: (alert: Omit<Alert, "id">) => void;
  clearNotifications: () => void;
};

export const DEFAULT_ZONES: Zone[] = [
  { id: "gateA", occupancy: 15, risk: "safe" },
  { id: "gateB", occupancy: 91, risk: "critical" },
  { id: "gateC", occupancy: 42, risk: "warning" },
  { id: "gateD", occupancy: 28, risk: "safe" },
];

export const DEFAULT_STATE: DashboardState = {
  fans: 84256,
  congestionScore: 24,
  agentActions: 1420,
  systemHealth: "optimal",
  zones: DEFAULT_ZONES,
  alerts: [],
  logs: [],
  notifications: [],
};

function nowTime() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function zoneRisk(occupancy: number): Risk {
  if (occupancy >= 85) return "critical";
  if (occupancy >= 60) return "warning";
  return "safe";
}

let _idCounter = 100;
function uid() {
  return String(_idCounter++);
}

export const useDashboardStore = create<DashboardState & DashboardActions>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      generateFans: () =>
        set((s) => {
          const added = Math.floor(Math.random() * 800) + 200;
          const newLog: Log = {
            id: uid(),
            agent: "Crowd Intelligence",
            agentType: "primary",
            status: "Active Monitoring",
            message: `${added.toLocaleString()} fans arrived via North Gate. Monitoring density in Sector 4B.`,
            time: nowTime(),
          };
          return {
            fans: s.fans + added,
            congestionScore: Math.min(100, s.congestionScore + Math.floor(Math.random() * 4) + 1),
            agentActions: s.agentActions + 1,
            logs: [newLog, ...s.logs].slice(0, 20),
            notifications: [
              { id: uid(), message: `+${added.toLocaleString()} fans arrived`, time: nowTime() },
              ...s.notifications,
            ].slice(0, 10),
          };
        }),

      triggerCrowdSurge: () =>
        set((s) => {
          const updatedZones = s.zones.map((z) => {
            if (z.id === "gateB") return { ...z, occupancy: 97, risk: "critical" as Risk };
            if (z.id === "gateC") return { ...z, occupancy: 78, risk: "warning" as Risk };
            return z;
          });
          const alert: Alert = {
            id: uid(),
            time: nowTime(),
            title: "CRITICAL CROWD SURGE: GATE B",
            message: "Panic-driven movement detected in Tier 1. Manual override requested by AI Agent.",
            severity: "critical",
            status: "action_required",
          };
          const log: Log = {
            id: uid(),
            agent: "Emergency Coordinator",
            agentType: "error",
            status: "Incident Flagged",
            message: "Gate B surge reached 97% threshold. Automated announcements triggered. Rerouting to Gate D.",
            time: nowTime(),
          };
          return {
            zones: updatedZones,
            congestionScore: 87,
            systemHealth: "critical",
            agentActions: s.agentActions + 3,
            alerts: [alert, ...s.alerts].slice(0, 10),
            logs: [log, ...s.logs].slice(0, 20),
            notifications: [
              { id: uid(), message: "CRITICAL: Crowd surge at Gate B", time: nowTime() },
              ...s.notifications,
            ].slice(0, 10),
          };
        }),

      triggerMedical: () =>
        set((s) => {
          const alert: Alert = {
            id: uid(),
            time: nowTime(),
            title: "MEDICAL EMERGENCY: SECTOR 4B",
            message: "First response unit deployed. Area cordoned. AI routing fans around Sector 4B.",
            severity: "warning",
            status: "monitoring",
          };
          const log: Log = {
            id: uid(),
            agent: "Emergency Coordinator",
            agentType: "error",
            status: "Medical Response",
            message: "Medical emergency reported in Sector 4B. First responders en route. ETA 2 min.",
            time: nowTime(),
          };
          return {
            systemHealth: s.systemHealth === "critical" ? "critical" : "warning",
            agentActions: s.agentActions + 2,
            alerts: [alert, ...s.alerts].slice(0, 10),
            logs: [log, ...s.logs].slice(0, 20),
            notifications: [
              { id: uid(), message: "Medical emergency — Sector 4B", time: nowTime() },
              ...s.notifications,
            ].slice(0, 10),
          };
        }),

      triggerRain: () =>
        set((s) => {
          const updatedZones = s.zones.map((z) => {
            const bump = Math.floor(Math.random() * 15) + 8;
            const newOcc = Math.min(99, z.occupancy + bump);
            return { ...z, occupancy: newOcc, risk: zoneRisk(newOcc) };
          });
          const alert: Alert = {
            id: uid(),
            time: nowTime(),
            title: "RAIN EVENT: SHELTER SEEKING DETECTED",
            message: "Friction loss calculated. Fans converging on covered areas. Congestion rising.",
            severity: "warning",
            status: "monitoring",
          };
          const log: Log = {
            id: uid(),
            agent: "Predictive Logic",
            agentType: "secondary",
            status: "Model Update",
            message: "Rain event triggered shelter-seeking patterns. Revised occupancy estimates across all zones.",
            time: nowTime(),
          };
          return {
            zones: updatedZones,
            congestionScore: Math.min(100, s.congestionScore + 22),
            systemHealth: s.systemHealth === "optimal" ? "warning" : s.systemHealth,
            agentActions: s.agentActions + 2,
            alerts: [alert, ...s.alerts].slice(0, 10),
            logs: [log, ...s.logs].slice(0, 20),
            notifications: [
              { id: uid(), message: "Rain event — shelter seeking in progress", time: nowTime() },
              ...s.notifications,
            ].slice(0, 10),
          };
        }),

      // ── PHASE 1: Emergency Protocol ──────────────────────────────────────
      triggerEmergencyProtocol: () =>
        set((s) => {
          const updatedZones = s.zones.map((z) => {
            if (z.id === "gateB") return { ...z, occupancy: 99, risk: "critical" as Risk };
            if (z.id === "gateC") return { ...z, occupancy: 85, risk: "critical" as Risk };
            if (z.id === "gateA") return { ...z, occupancy: 48, risk: "warning" as Risk };
            return z; // Gate D stays as safest redirect
          });
          const t = nowTime();
          const alerts: Alert[] = [
            {
              id: uid(),
              time: t,
              title: "EMERGENCY PROTOCOL ACTIVATED",
              message: "All AI agents deployed. Crowd control active across all zones. Redirecting to Gate D.",
              severity: "critical",
              status: "action_required",
            },
            {
              id: uid(),
              time: t,
              title: "GATE B & C: EVACUATION INITIATED",
              message: "Automated PA announcements active. Security deployed to all access points.",
              severity: "critical",
              status: "action_required",
            },
          ];
          const logs: Log[] = [
            {
              id: uid(),
              agent: "Emergency Coordinator",
              agentType: "error",
              status: "EMERGENCY ACTIVE",
              message: "Emergency Protocol activated. All zones under AI control. Gate D designated safe evacuation point.",
              time: t,
            },
            {
              id: uid(),
              agent: "Crowd Intelligence",
              agentType: "primary",
              status: "Redirect 100% to Gate D",
              message: "All incoming traffic rerouted. Gate D occupancy expanding. Estimated clear time: 8 min.",
              time: t,
            },
            {
              id: uid(),
              agent: "Communications AI",
              agentType: "tertiary",
              status: "Broadcasting Emergency Advisory",
              message: `Broadcasting emergency advisory to all ${s.fans.toLocaleString()} in-stadium fans via push notification and PA.`,
              time: t,
            },
          ];
          return {
            systemHealth: "critical",
            congestionScore: 94,
            agentActions: s.agentActions + 8,
            zones: updatedZones,
            alerts: [...alerts, ...s.alerts].slice(0, 10),
            logs: [...logs, ...s.logs].slice(0, 20),
            notifications: [
              { id: uid(), message: "🚨 EMERGENCY PROTOCOL ACTIVE — Gate D is your safe exit", time: t },
              { id: uid(), message: "All AI agents deployed — system under emergency control", time: t },
              ...s.notifications,
            ].slice(0, 10),
          };
        }),

      // ── PHASE 6: Apply Reroute ───────────────────────────────────────────
      applyReroute: (fromId: string, toId: string) =>
        set((s) => {
          const updatedZones = s.zones.map((z) => {
            if (z.id === fromId) {
              const newOcc = Math.max(15, z.occupancy - Math.floor(Math.random() * 15) - 28);
              return { ...z, occupancy: newOcc, risk: zoneRisk(newOcc) };
            }
            if (z.id === toId) {
              const newOcc = Math.min(72, z.occupancy + Math.floor(Math.random() * 8) + 12);
              return { ...z, occupancy: newOcc, risk: zoneRisk(newOcc) };
            }
            return z;
          });
          const fromLabel = fromId.replace("gate", "Gate ").toUpperCase();
          const toLabel = toId.replace("gate", "Gate ").toUpperCase();
          const log: Log = {
            id: uid(),
            agent: "Crowd Intelligence",
            agentType: "primary",
            status: "Reroute Applied",
            message: `Traffic redirected from ${fromLabel} to ${toLabel}. Density balancing in progress. ETA stabilized: 4 min.`,
            time: nowTime(),
          };
          const newCongestion = Math.max(18, s.congestionScore - Math.floor(Math.random() * 10) - 15);
          return {
            zones: updatedZones,
            congestionScore: newCongestion,
            agentActions: s.agentActions + 2,
            logs: [log, ...s.logs].slice(0, 20),
            notifications: [
              { id: uid(), message: `Reroute applied: ${fromLabel} → ${toLabel}`, time: nowTime() },
              ...s.notifications,
            ].slice(0, 10),
          };
        }),

      resolveAlert: (id: string) =>
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === id ? { ...a, status: "completed" as AlertStatus } : a
          ),
          agentActions: s.agentActions + 1,
        })),

      clearSimulation: () =>
        set({
          ...DEFAULT_STATE,
          zones: DEFAULT_ZONES.map((z) => ({ ...z })),
        }),

      appendLog: (log: Log) =>
        set((s) => ({ logs: [log, ...s.logs].slice(0, 20) })),

      appendAlert: (alert: Omit<Alert, "id">) =>
        set((s) => ({
          alerts: [{ ...alert, id: uid() }, ...s.alerts].slice(0, 10),
          agentActions: s.agentActions + 1,
        })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: "flowguard-dashboard",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : ({
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        } as unknown as Storage)
      ),
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 10),
        alerts: state.alerts,
        congestionScore: state.congestionScore,
        agentActions: state.agentActions,
        zones: state.zones,
        systemHealth: state.systemHealth,
        logs: state.logs.slice(0, 10),
      }),
    }
  )
);
