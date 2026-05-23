"use client";

import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import EmergencyButton from "@/components/EmergencyButton";
import NotificationDrawer from "@/components/NotificationDrawer";
import { useDashboardStore, type Zone, type Alert, type Log } from "@/store/dashboardStore";
import { useUIStore } from "@/store/uiStore";
import { orchestrator } from "@/agents/orchestrator";
import { useDemoStore } from "@/store/demoStore";
import { runFullMatchDay } from "@/services/demoRunner";

// ── Derived helpers ──────────────────────────────────────────────────────────

function zoneLabel(id: string) {
  return id === "gateA" ? "GATE A" : id === "gateB" ? "GATE B" : id === "gateC" ? "GATE C" : "GATE D";
}

function zoneFill(risk: Zone["risk"]) {
  if (risk === "critical") return "rgba(239, 68, 68, 0.2)";
  if (risk === "warning") return "rgba(255, 181, 150, 0.15)";
  return "rgba(180, 197, 255, 0.1)";
}

function zoneStroke(risk: Zone["risk"]) {
  if (risk === "critical") return "#ffb4ab";
  if (risk === "warning") return "#ffb596";
  return "#b4c5ff";
}

function zoneTextColor(risk: Zone["risk"]) {
  if (risk === "critical") return "#ffb4ab";
  if (risk === "warning") return "#ffb596";
  return "#e1e2ed";
}

function healthColor(h: string) {
  if (h === "critical") return "text-error";
  if (h === "warning") return "text-tertiary";
  return "text-primary";
}

function healthDot(h: string) {
  if (h === "critical") return "bg-error shadow-[0_0_15px_#ffb4ab]";
  if (h === "warning") return "bg-tertiary shadow-[0_0_15px_#ffb596]";
  return "bg-primary shadow-[0_0_15px_#b4c5ff]";
}

function alertBorderColor(severity: Alert["severity"]) {
  if (severity === "critical") return "border-l-error";
  if (severity === "warning") return "border-l-tertiary";
  return "border-l-primary";
}

function alertDotColor(severity: Alert["severity"]) {
  if (severity === "critical") return "bg-error pulse-core-red";
  if (severity === "warning") return "bg-tertiary";
  return "bg-primary";
}

function alertBadge(status: Alert["status"], severity: Alert["severity"]) {
  if (status === "completed") return { label: "COMPLETED", cls: "bg-primary/10 text-primary border border-primary/20" };
  if (status === "monitoring") return { label: "MONITORING", cls: "bg-tertiary/10 text-tertiary border border-tertiary/20" };
  return {
    label: "ACTION REQUIRED",
    cls: severity === "critical" ? "bg-error/10 text-error border border-error/20" : "bg-tertiary/10 text-tertiary border border-tertiary/20",
  };
}

function agentIconColor(type: Log["agentType"]) {
  if (type === "error") return { bg: "bg-error/20", text: "text-error", icon: "emergency" };
  if (type === "secondary") return { bg: "bg-secondary/20", text: "text-secondary", icon: "analytics" };
  if (type === "tertiary") return { bg: "bg-tertiary/20", text: "text-tertiary", icon: "forum" };
  return { bg: "bg-primary/20", text: "text-primary", icon: "robot_2" };
}

// ── Static seed logs shown before any simulation ─────────────────────────────

const SEED_LOGS: Log[] = [
  {
    id: "seed-1",
    agent: "Crowd Intelligence",
    agentType: "primary",
    status: "Active Monitoring",
    message: "Analyzing entry flow at North Gate. High density detected in Sector 4B.",
    time: "2m ago",
  },
  {
    id: "seed-2",
    agent: "Emergency Coordinator",
    agentType: "error",
    status: "Incident Flagged",
    message: "Gate B bottleneck reached 90% threshold. Automated announcements triggered.",
    time: "5m ago",
  },
  {
    id: "seed-3",
    agent: "Predictive Logic",
    agentType: "secondary",
    status: "Model Update",
    message: "Updated exit strategy for post-match dispersal based on current traffic patterns.",
    time: "14m ago",
  },
];

// ── Congestion ring math ──────────────────────────────────────────────────────

const CIRC = 2 * Math.PI * 34; // ≈ 213.6

function ringOffset(score: number) {
  return CIRC - (score / 100) * CIRC;
}

// ── Zone paths (fixed positions, data-driven fills) ───────────────────────────

function ZonePath({ zone, d, tx, ty }: { zone: Zone; d: string; tx: number; ty: number }) {
  return (
    <>
      <path
        className="stadium-path"
        d={d}
        fill={zoneFill(zone.risk)}
        stroke={zoneStroke(zone.risk)}
        strokeWidth="2"
        style={{ transition: "fill 0.7s, stroke 0.7s" }}
      />
      <text fill={zoneTextColor(zone.risk)} x={tx} y={ty} fontSize="12" fontWeight={zone.risk === "critical" ? "bold" : "normal"}>
        {zoneLabel(zone.id)} ({zone.occupancy}%)
      </text>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminCommandCenter() {
  const {
    fans,
    congestionScore,
    agentActions,
    systemHealth,
    zones,
    alerts,
    logs,
    notifications,
    generateFans,
    resolveAlert,
    applyReroute,
  } = useDashboardStore();

  const { openNotificationDrawer } = useUIStore();

  const { status: demoStatus, progress, progressLabel, stepName, reset: resetDemo } = useDemoStore();
  const isDemo = demoStatus === "running";

  function handleDemoButton() {
    if (demoStatus === "idle") {
      runFullMatchDay();
    } else if (demoStatus === "completed") {
      useDashboardStore.getState().clearSimulation();
      resetDemo();
    }
  }

  // Passive fan arrival ticker — routed through orchestrator
  useEffect(() => {
    const interval = setInterval(() => {
      orchestrator.generateFans();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const gateA = zones.find((z) => z.id === "gateA")!;
  const gateB = zones.find((z) => z.id === "gateB")!;
  const gateC = zones.find((z) => z.id === "gateC")!;
  const gateD = zones.find((z) => z.id === "gateD")!;

  const criticalGate = zones.find((z) => z.risk === "critical");
  const safeGate = zones
    .filter((z) => z.id !== criticalGate?.id)
    .sort((a, b) => a.occupancy - b.occupancy)[0];
  const displayLogs = logs.length > 0 ? logs.slice(0, 3) : SEED_LOGS;

  const hasNotifications = notifications.length > 0;

  return (
    <div className="min-h-screen">
      <Sidebar />

      {/* TopAppBar */}
      <header className="fixed top-0 left-64 right-0 z-40 bg-white/5 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-gutter py-4 shadow-lg shadow-primary/5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full border border-white/5">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            <span className="font-label-caps text-label-caps text-on-surface tracking-wider">Live: India vs Australia</span>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              className="bg-surface-container-low border border-white/10 rounded-full py-2 pl-10 pr-4 w-64 focus:w-80 transition-all focus:ring-1 focus:ring-primary focus:border-primary outline-none text-body-sm font-body-sm"
              placeholder="Search operational logs..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Demo button */}
          <button
            onClick={handleDemoButton}
            disabled={isDemo}
            className={`px-4 py-2 rounded-lg font-label-caps text-label-caps flex items-center gap-2 transition-all ${
              demoStatus === "running"
                ? "bg-primary/15 text-primary border border-primary/30 cursor-not-allowed"
                : demoStatus === "completed"
                ? "bg-primary/20 text-primary border border-primary/40 hover:brightness-110 active:scale-95"
                : "bg-primary text-on-primary shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 animate-pulse-subtle"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[16px] ${isDemo ? "animate-spin" : ""}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {demoStatus === "running" ? "sync" : demoStatus === "completed" ? "check_circle" : "play_circle"}
            </span>
            {demoStatus === "running"
              ? "DEMO RUNNING..."
              : demoStatus === "completed"
              ? "RESET DEMO"
              : "RUN FULL MATCH DAY"}
          </button>

          <EmergencyButton className="bg-error-container text-on-error-container px-4 py-2 rounded-lg font-label-caps text-label-caps hover:brightness-110" />
          <div className="flex items-center gap-1">
            <button
              onClick={openNotificationDrawer}
              className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors relative"
            >
              <span className="material-symbols-outlined">notifications_active</span>
              {hasNotifications && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse"></span>
              )}
            </button>
            <button className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
            <div className="text-right">
              <p className="font-label-caps text-[11px] text-on-surface">Alex Chen</p>
              <p className="text-[9px] text-on-surface-variant uppercase">Senior Operator</p>
            </div>
            <img
              alt="Operator Profile"
              className="w-10 h-10 rounded-full border border-white/20 object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZJZ6YsI5Yij0CEovKBP63aanQAl79sV9X8c3dbxfBByULsVOxH-D24L0kScY-jNbZWHpjpWp2KDUeeajc9r1I2EZxIGMJevw2tuvrknkhLWRaexmXFtua3uVT3Aq3JgnU9yJdzSSc7_YQYZv4Na97_G2AB-6-vsROKTKBOX8srPkpMWmTVAsrPf0t8_Jhdl9GjwhOr_zvTKFgzmvRKSUo1shbt_XrIoFbYnDzWOi7KPegPHuWqgjQ5bdCMFokGzqjOYAtLNirnGoR"
            />
          </div>
        </div>
      </header>

      {/* Demo Progress Bar — fixed below header, visible when running or completed */}
      <div
        className={`fixed top-[72px] left-64 right-0 z-40 transition-all duration-500 ${
          demoStatus !== "idle" ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`flex items-center justify-between px-gutter py-2.5 border-b border-white/5 ${
            demoStatus === "completed"
              ? "bg-primary/10 backdrop-blur-sm"
              : "bg-surface-container/95 backdrop-blur-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`material-symbols-outlined text-[16px] ${
                demoStatus === "completed"
                  ? "text-primary"
                  : "text-primary animate-pulse"
              }`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {demoStatus === "completed" ? "verified" : "radio_button_checked"}
            </span>
            <span className={`font-label-caps text-label-caps tracking-widest transition-all duration-500 ${demoStatus === "completed" ? "text-primary" : "text-on-surface"}`}>
              {stepName}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono-data text-[11px] text-on-surface-variant">{progressLabel}</span>
            <span className="font-mono-data text-[11px] text-primary font-bold">{progress}%</span>
          </div>
        </div>
        {/* Progress track */}
        <div className="h-[2px] w-full bg-white/5">
          <div
            className={`h-full transition-all duration-1000 ease-out ${
              demoStatus === "completed"
                ? "bg-primary shadow-[0_0_8px_rgba(180,197,255,0.8)]"
                : "bg-primary"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Stage pips */}
        <div className="absolute top-0 left-0 right-0 h-full pointer-events-none">
          {[10, 30, 60, 90, 100].map((pip) => (
            <div
              key={pip}
              className={`absolute top-[calc(100%-1px)] w-px h-2 transition-colors duration-500 ${
                progress >= pip ? "bg-primary/60" : "bg-white/10"
              }`}
              style={{ left: `${pip}%` }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main
        className={`ml-64 p-gutter space-y-gutter transition-[margin-top] duration-300 ${
          demoStatus !== "idle" ? "mt-[122px]" : "mt-20"
        }`}
      >

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Fan count */}
          <div className="glass-panel shimmer rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="font-label-caps text-label-caps text-on-surface-variant">Total Fans In-Stadium</p>
              <span className="material-symbols-outlined text-primary">groups</span>
            </div>
            <div className="flex items-end gap-2">
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface transition-all duration-700">
                {fans.toLocaleString()}
              </h2>
              <span className="text-tertiary text-body-sm mb-2">+1.2k/min</span>
            </div>
            <div className="mt-4 w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(180,197,255,0.5)] transition-all duration-1000"
                style={{ width: `${Math.min(100, (fans / 100000) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Congestion Score */}
          <div className="glass-panel shimmer rounded-xl p-6">
            <div className="flex justify-between items-start mb-2">
              <p className="font-label-caps text-label-caps text-on-surface-variant">Congestion Score</p>
              <span className="material-symbols-outlined text-secondary">speed</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                  <circle className="text-white/5" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="6" />
                  <circle
                    className={congestionScore >= 75 ? "text-error" : congestionScore >= 50 ? "text-tertiary" : "text-secondary"}
                    cx="40"
                    cy="40"
                    fill="transparent"
                    r="34"
                    stroke="currentColor"
                    strokeDasharray={CIRC}
                    strokeDashoffset={ringOffset(congestionScore)}
                    strokeWidth="6"
                    style={{ transition: "stroke-dashoffset 1s ease, color 0.5s" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono-data text-mono-data text-on-surface">{congestionScore}%</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Status</p>
                <p className={`font-headline-sm text-headline-sm ${congestionScore >= 75 ? "text-error" : congestionScore >= 50 ? "text-tertiary" : "text-secondary"}`}>
                  {congestionScore >= 75 ? "Critical" : congestionScore >= 50 ? "Elevated" : "Nominal"}
                </p>
              </div>
            </div>
          </div>

          {/* Agent Actions */}
          <div className="glass-panel shimmer rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="font-label-caps text-label-caps text-on-surface-variant">AI Protocol Actions</p>
              <span className="material-symbols-outlined text-tertiary">psychology</span>
            </div>
            <div className="flex items-end gap-2">
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface transition-all duration-700">
                {agentActions.toLocaleString()}
              </h2>
              <span className="text-primary text-body-sm mb-2">Active Agent</span>
            </div>
            <div className="flex gap-1 mt-4">
              {[0.2, 0.4, 0.6, 1].map((o, i) => (
                <div key={i} className={`h-8 w-1 bg-tertiary rounded-full ${o === 1 ? "animate-pulse" : ""}`} style={{ opacity: o }} />
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="glass-panel shimmer rounded-xl p-6 bg-primary/5">
            <div className="flex justify-between items-start mb-4">
              <p className="font-label-caps text-label-caps text-on-surface-variant">Global System Health</p>
              <span className="material-symbols-outlined text-primary">verified_user</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-primary/30 flex items-center justify-center">
                <div className={`w-4 h-4 rounded-full transition-all duration-700 ${healthDot(systemHealth)}`}></div>
              </div>
              <div>
                <h2 className={`font-headline-sm text-headline-sm font-bold tracking-widest transition-colors duration-700 ${healthColor(systemHealth)}`}>
                  {systemHealth.toUpperCase()}
                </h2>
                <p className="text-[10px] text-on-surface-variant">Latency: 14ms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stadium Viz + Agent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 glass-panel rounded-2xl p-8 relative min-h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">Stadium Live Topology</h3>
                <p className="text-on-surface-variant font-body-sm text-body-sm">Real-time occupancy &amp; security heatmap</p>
              </div>
              <div className="flex gap-2">
                {[["primary", "Safe"], ["tertiary", "Warning"], ["error", "Critical"]].map(([color, label]) => (
                  <span key={label} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[11px] font-label-caps flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color === "primary" ? "#b4c5ff" : color === "tertiary" ? "#ffb596" : "#ffb4ab" }}></span>
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 relative">
              <svg className="w-full max-w-2xl drop-shadow-2xl" viewBox="0 0 500 350">
                <ellipse cx="250" cy="175" fill="none" rx="240" ry="165" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                <ZonePath zone={gateA} d="M250 10 L10 175 L250 175 Z" tx={80} ty={100} />
                <ZonePath zone={gateB} d="M250 10 L490 175 L250 175 Z" tx={310} ty={100} />
                <ZonePath zone={gateC} d="M250 340 L10 175 L250 175 Z" tx={80} ty={270} />
                <ZonePath zone={gateD} d="M250 340 L490 175 L250 175 Z" tx={310} ty={270} />
                <ellipse cx="250" cy="175" fill="rgba(255,255,255,0.02)" rx="80" ry="50" stroke="rgba(255,255,255,0.2)" strokeDasharray="5,5" />
              </svg>

              {/* Alert callout for critical zone */}
              {criticalGate && (
                <div className="absolute top-[8%] right-[4%] glass-panel p-4 rounded-xl animate-bounce">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-error text-[18px]">warning</span>
                    <span className="text-error font-bold text-[12px]">Congestion Alert</span>
                  </div>
                  <p className="text-on-surface text-body-sm">
                    {zoneLabel(criticalGate.id)}: <span className="font-bold">{criticalGate.occupancy}% Occupancy</span>
                  </p>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">AI Recommendation</p>
                    <p className="text-primary text-body-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">subdirectory_arrow_right</span>
                      Redirect to {criticalGate.id === "gateB" ? "Gate D" : "Gate A"}
                    </p>
                    <button
                      onClick={() => criticalGate && safeGate && applyReroute(criticalGate.id, safeGate.id)}
                      className="mt-2 w-full bg-primary/20 text-primary py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary/30 active:scale-95 transition-all"
                    >
                      Apply Reroute
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Agent Activity */}
          <div className="lg:col-span-4">
            <div className="glass-panel rounded-2xl p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Agent Activity</h3>
                <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {displayLogs.map((log) => {
                  const style = agentIconColor(log.agentType);
                  return (
                    <div key={log.id} className={`p-4 rounded-xl bg-white/5 border border-white/5 ${log.agentType === "error" ? "border-l-4 border-l-error" : ""} space-y-3`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${style.bg} rounded-lg`}>
                          <span className={`material-symbols-outlined ${style.text} text-[20px]`}>{style.icon}</span>
                        </div>
                        <div>
                          <p className="font-label-caps text-[13px] text-on-surface">{log.agent}</p>
                          <p className={`text-[10px] ${log.agentType === "error" ? "text-error" : "text-on-surface-variant"}`}>{log.status}</p>
                        </div>
                        <span className="ml-auto text-[10px] text-on-surface-variant font-mono-data">{log.time}</span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant pl-12">{log.message}</p>
                    </div>
                  );
                })}
              </div>
              <button className="mt-6 w-full py-3 rounded-xl border border-white/10 text-on-surface-variant font-label-caps text-label-caps hover:bg-white/5 transition-all">
                View Full Audit Log
              </button>
            </div>
          </div>
        </div>

        {/* Alert Timeline */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Operational Alert Timeline</h3>
            <div className="flex gap-4">
              <select className="bg-surface-container-low border border-white/10 rounded-lg px-4 py-1 text-label-caps text-on-surface-variant outline-none focus:ring-1 focus:ring-primary">
                <option>All Severities</option>
                <option>Critical Only</option>
              </select>
              <button className="p-2 rounded-lg hover:bg-white/5 border border-white/10 text-on-surface-variant">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute top-0 left-6 bottom-0 w-px bg-white/10"></div>
            <div className="space-y-6 relative">

              {/* Dynamic alerts from store */}
              {alerts.map((alert) => {
                const badge = alertBadge(alert.status, alert.severity);
                const isCompleted = alert.status === "completed";
                return (
                  <div key={alert.id} className={`flex gap-6 items-start transition-opacity duration-500 ${isCompleted ? "opacity-60" : ""}`}>
                    <div className="relative z-10 w-12 flex justify-center pt-2">
                      <div className={`w-4 h-4 rounded-full ${alertDotColor(alert.severity)}`}></div>
                    </div>
                    <div className={`flex-1 glass-panel p-4 rounded-xl border-l-4 ${alertBorderColor(alert.severity)} flex items-center justify-between`}>
                      <div className="flex items-center gap-4">
                        <p className="font-mono-data text-mono-data text-on-surface-variant w-16">{alert.time}</p>
                        <div>
                          <p className="font-label-caps text-label-caps text-on-surface">{alert.title}</p>
                          <p className="text-body-sm text-on-surface-variant">{alert.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${badge.cls}`}>{badge.label}</span>
                        {!isCompleted ? (
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-label-caps transition-all"
                          >
                            Resolve
                          </button>
                        ) : (
                          <span className="material-symbols-outlined text-on-surface-variant">check_circle</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Static seed alert — always visible until simulation generates its own */}
              {alerts.length === 0 && (
                <>
                  <div className="flex gap-6 items-start">
                    <div className="relative z-10 w-12 flex justify-center pt-2">
                      <div className="w-4 h-4 rounded-full bg-error pulse-core-red"></div>
                    </div>
                    <div className="flex-1 glass-panel p-4 rounded-xl border-l-4 border-l-error flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <p className="font-mono-data text-mono-data text-on-surface-variant w-16">19:42</p>
                        <div>
                          <p className="font-label-caps text-label-caps text-on-surface">CRITICAL BOTTLENECK: GATE B</p>
                          <p className="text-body-sm text-on-surface-variant">Manual override requested by AI Agent #402</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-error/10 text-error text-[10px] font-bold rounded-full border border-error/20">ACTION REQUIRED</span>
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-label-caps transition-all">Resolve</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="relative z-10 w-12 flex justify-center pt-2">
                      <div className="w-4 h-4 rounded-full bg-tertiary"></div>
                    </div>
                    <div className="flex-1 glass-panel p-4 rounded-xl border-l-4 border-l-tertiary flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <p className="font-mono-data text-mono-data text-on-surface-variant w-16">19:35</p>
                        <div>
                          <p className="font-label-caps text-label-caps text-on-surface">ELEVATED DENSITY DETECTED</p>
                          <p className="text-body-sm text-on-surface-variant">Concourse Sector 7 — Fan flow slowing to 0.4 m/s</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-tertiary/10 text-tertiary text-[10px] font-bold rounded-full border border-tertiary/20">MONITORING</span>
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-label-caps transition-all">Details</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start opacity-60">
                    <div className="relative z-10 w-12 flex justify-center pt-2">
                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                    </div>
                    <div className="flex-1 glass-panel p-4 rounded-xl border-l-4 border-l-primary flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <p className="font-mono-data text-mono-data text-on-surface-variant w-16">19:10</p>
                        <div>
                          <p className="font-label-caps text-label-caps text-on-surface">GATES FULLY OPERATIONAL</p>
                          <p className="text-body-sm text-on-surface-variant">All 64 turnstiles reporting nominal throughput</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20">COMPLETED</span>
                        <span className="material-symbols-outlined text-on-surface-variant">check_circle</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <NotificationDrawer />

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 md:hidden bg-surface-container/80 backdrop-blur-lg border-t border-white/10">
        {[{ icon: "home", label: "Home", active: true }, { icon: "confirmation_number", label: "Ticket" }, { icon: "explore", label: "Map" }, { icon: "support_agent", label: "Help" }].map(({ icon, label, active }) => (
          <button key={label} className={`flex flex-col items-center justify-center p-2 rounded-xl active:scale-90 transition-all ${active ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant"}`}>
            <span className="material-symbols-outlined">{icon}</span>
            <span className="font-label-caps text-[10px]">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
