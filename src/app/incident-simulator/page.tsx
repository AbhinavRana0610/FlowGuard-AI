"use client";

import { useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import EmergencyButton from "@/components/EmergencyButton";
import { useDashboardStore } from "@/store/dashboardStore";
import { orchestrator } from "@/agents/orchestrator";
import { useDemoStore } from "@/store/demoStore";

export default function IncidentSimulator() {
  const {
    congestionScore,
    zones,
    alerts,
    systemHealth,
    clearSimulation,
  } = useDashboardStore();

  const { status: demoStatus, stepName } = useDemoStore();
  const isDemo = demoStatus === "running";

  const nodeGridRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  // Derive display values from store
  const gateB = zones.find((z) => z.id === "gateB")!;
  const criticalAlerts = alerts.filter((a) => a.severity === "critical" && a.status !== "completed");
  const risk = congestionScore;
  const velocity = Math.max(0.3, 2.0 - (congestionScore / 100) * 1.5);
  const evacTime = `${Math.floor(4 + (congestionScore / 100) * 10)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`;
  const density = (2.0 + (congestionScore / 100) * 4.5).toFixed(1) + "/m²";
  const vignetteActive = systemHealth === "critical";

  const nodeColor =
    systemHealth === "critical"
      ? "bg-error pulse-red"
      : systemHealth === "warning"
      ? "bg-secondary"
      : congestionScore > 60
      ? "bg-primary"
      : "bg-primary/40";
  const nodeSize = congestionScore > 30 ? "w-1.5 h-1.5" : "w-1 h-1";

  function spawnRipple() {
    if (!rippleRef.current) return;
    const ripple = document.createElement("div");
    ripple.style.cssText =
      "position:absolute;border-radius:50%;background:rgba(180,197,255,0.1);transform:scale(0);animation:ripple 1.5s ease-out forwards;width:200px;height:200px;left:calc(50% - 100px);top:calc(50% - 100px);pointer-events:none;";
    rippleRef.current.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1500);
  }

  function handleSurge() {
    spawnRipple();
    orchestrator.generateFans();
  }

  function handleEmergency() {
    spawnRipple();
    orchestrator.triggerCrowdSurge();
  }

  function handleMedical() {
    spawnRipple();
    orchestrator.triggerMedical();
  }

  function handleRain() {
    spawnRipple();
    orchestrator.triggerRain();
  }

  // Populate node grid on mount
  useEffect(() => {
    if (!nodeGridRef.current) return;
    nodeGridRef.current.innerHTML = "";
    for (let i = 0; i < 100; i++) {
      const node = document.createElement("div");
      node.className = "w-1 h-1 rounded-full bg-primary/40 transition-all duration-700";
      nodeGridRef.current.appendChild(node);
    }
  }, []);

  // Update nodes on state change
  useEffect(() => {
    if (!nodeGridRef.current) return;
    const nodes = nodeGridRef.current.children;
    Array.from(nodes).forEach((node, i) => {
      setTimeout(() => {
        (node as HTMLElement).className = `${nodeSize} rounded-full ${nodeColor} transition-all duration-500`;
      }, i * 5);
    });
  }, [nodeColor, nodeSize]);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Cinematic Vignette */}
      <div className={`vignette-overlay ${vignetteActive ? "vignette-active" : ""}`}></div>

      <Sidebar />

      {/* TopAppBar */}
      <header className="fixed top-0 left-64 right-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-primary/20 flex justify-between items-center px-gutter py-4">
        <div className="flex items-center gap-8">
          <span className="font-headline-md text-headline-md font-bold text-on-surface">FlowGuard AI</span>
          <div className="hidden lg:flex gap-6">
            {[["Dashboard", "/"], ["Map", "#"], ["Simulate", "/incident-simulator", true], ["Architecture", "/architecture"]].map(([label, href, active]) => (
              <a
                key={String(label)}
                href={String(href)}
                className={`font-body-md text-body-md px-3 py-1 rounded-lg transition-colors ${active ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:bg-white/5"}`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <EmergencyButton className="px-4 py-2 bg-error text-on-error font-label-caps text-label-caps rounded-full" />
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
            {criticalAlerts.length > 0 ? "notifications_active" : "notifications"}
          </span>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">settings</span>
          <img
            alt="Operator Profile"
            className="w-10 h-10 rounded-full border-2 border-primary/20"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvDQ1ratXGC4L7_b1oTAnOhU6rXUW-AmZxbJ_geY3jS5oYpDzArAOwR9xfukz1WymdfzjurY-y03rDMrx1jigkfn-QKSs0IcVrHyBS9b22SeVAswVCaqRnz0el4_Cu5JX5XNbnLiu0KposDWVsGvgjskA4IDHvDM_cty2XKsojr_opynswsl6Kp2pRjjsT17zAtYOclaoK9MVDiEJSQ22TIJC61tp6HPC4Rdo1Ausytu4IPUdo-elWwphogBp9h_1mkKwXNQtfxa31"
          />
        </div>
      </header>

      {/* Main Grid */}
      <main className="ml-64 mt-20 p-gutter flex-1 grid grid-cols-12 gap-gutter overflow-y-auto min-h-[calc(100vh-5rem)]">
        {/* Simulation Controls */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
          <div className="glass-card shimmer-edge rounded-3xl p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md text-on-surface">Incident Controls</h2>
              {isDemo && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-label-caps text-[10px] text-primary">AUTO</span>
                </div>
              )}
            </div>

            {/* Demo active banner */}
            {isDemo && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <span className="material-symbols-outlined text-primary text-[18px] animate-spin" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
                <div>
                  <p className="font-label-caps text-[10px] text-primary mb-0.5">DEMO MODE ACTIVE</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{stepName || "Initializing..."}</p>
                </div>
              </div>
            )}

            <div className={`grid grid-cols-1 gap-4 transition-opacity duration-300 ${isDemo ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
              <button
                onClick={handleSurge}
                disabled={isDemo}
                className="group relative flex items-center justify-between p-5 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all text-left disabled:cursor-not-allowed"
              >
                <div>
                  <p className="font-headline-sm text-headline-sm text-primary">Generate 5,000 Fans</p>
                  <p className="text-on-surface-variant font-body-sm text-body-sm">Simulate heavy arrival surge at North Gates</p>
                </div>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">groups</span>
              </button>
              <button
                onClick={handleEmergency}
                disabled={isDemo}
                className="group relative flex items-center justify-between p-5 rounded-2xl bg-error/10 border border-error/20 hover:bg-error/20 transition-all text-left disabled:cursor-not-allowed"
              >
                <div>
                  <p className="font-headline-sm text-headline-sm text-error">Trigger Crowd Surge</p>
                  <p className="text-on-surface-variant font-body-sm text-body-sm">Simulate panic-driven movement in Tier 1</p>
                </div>
                <span className="material-symbols-outlined text-error group-hover:scale-110 transition-transform">warning</span>
              </button>
              <button
                onClick={handleMedical}
                disabled={isDemo}
                className="group relative flex items-center justify-between p-5 rounded-2xl bg-tertiary-container/10 border border-tertiary-container/20 hover:bg-tertiary-container/20 transition-all text-left disabled:cursor-not-allowed"
              >
                <div>
                  <p className="font-headline-sm text-headline-sm text-tertiary">Medical Emergency</p>
                  <p className="text-on-surface-variant font-body-sm text-body-sm">Deploy first response unit to Sector 4B</p>
                </div>
                <span className="material-symbols-outlined text-tertiary">medical_services</span>
              </button>
              <button
                onClick={handleRain}
                disabled={isDemo}
                className="group relative flex items-center justify-between p-5 rounded-2xl bg-secondary-container/10 border border-secondary-container/20 hover:bg-secondary-container/20 transition-all text-left disabled:cursor-not-allowed"
              >
                <div>
                  <p className="font-headline-sm text-headline-sm text-secondary">Trigger Rain Event</p>
                  <p className="text-on-surface-variant font-body-sm text-body-sm">Calculate friction loss and shelter seeking</p>
                </div>
                <span className="material-symbols-outlined text-secondary">rainy</span>
              </button>
            </div>
            <button
              onClick={clearSimulation}
              disabled={isDemo}
              className="mt-4 flex items-center justify-center gap-2 p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-on-surface-variant font-label-caps text-label-caps disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              Reset System
            </button>
          </div>

          {/* System Impact */}
          <div className="glass-card shimmer-edge rounded-3xl p-6">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase">System Impact Analysis</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Congestion Risk</span>
                <span className="font-mono-data text-mono-data text-primary">{risk}%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${risk >= 75 ? "bg-error" : risk >= 50 ? "bg-tertiary" : "bg-primary"}`}
                  style={{ width: `${risk}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-end mt-6">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Flow Velocity</span>
                <span className="font-mono-data text-mono-data text-secondary">{velocity.toFixed(1)} m/s</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-secondary transition-all duration-1000" style={{ width: `${velocity * 40}%` }}></div>
              </div>

              {/* Gate B live status */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-end">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Gate B Occupancy</span>
                  <span className={`font-mono-data text-mono-data ${gateB.risk === "critical" ? "text-error" : gateB.risk === "warning" ? "text-tertiary" : "text-primary"}`}>
                    {gateB.occupancy}%
                  </span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all duration-1000 ${gateB.risk === "critical" ? "bg-error" : gateB.risk === "warning" ? "bg-tertiary" : "bg-primary"}`}
                    style={{ width: `${gateB.occupancy}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization Canvas */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-gutter">
          <div className="glass-card shimmer-edge rounded-3xl p-8 flex-1 relative flex flex-col overflow-hidden">
            <div className="scanline"></div>
            <div className="flex justify-between items-center mb-8 relative z-20">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Stadium Simulation Matrix</h2>
                <p className="text-on-surface-variant font-body-sm text-body-sm">Real-time ripple effect visualization</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary font-mono-data text-[12px] uppercase">
                  Node Active: 1,402
                </span>
              </div>
            </div>
            <div className="flex-1 relative bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center min-h-[400px]">
              <div className="absolute inset-0 pointer-events-none" ref={rippleRef}></div>
              <div className="relative w-4/5 aspect-square max-h-[500px]">
                <svg className="w-full h-full opacity-30 stroke-primary fill-none" strokeWidth="0.5" viewBox="0 0 100 100">
                  <ellipse cx="50" cy="50" rx="45" ry="35" />
                  <ellipse cx="50" cy="50" rx="25" ry="18" />
                  <line x1="50" x2="50" y1="15" y2="32" />
                  <line x1="50" x2="50" y1="68" y2="85" />
                  <line x1="5" x2="25" y1="50" y2="50" />
                  <line x1="75" x2="95" y1="50" y2="50" />
                </svg>
                <div
                  ref={nodeGridRef}
                  className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-2 p-8 opacity-60"
                ></div>
              </div>
              <div className="absolute bottom-4 left-4 flex gap-4 bg-surface-container/60 backdrop-blur-md p-3 rounded-xl border border-white/5">
                {[["Normal", "#b4c5ff"], ["Increased", "#ffb596"], ["Critical", "#ffb4ab"]].map(([label, color]) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="text-[10px] font-label-caps text-on-surface-variant uppercase">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Footer */}
          <div className="grid grid-cols-3 gap-gutter">
            {[
              { label: "Evac Time", value: evacTime, color: "text-primary" },
              { label: "Density", value: density, color: "text-secondary" },
              { label: "Bot Confidence", value: "98.2%", color: "text-on-surface" },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card shimmer-edge rounded-2xl p-4 text-center">
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">{label}</p>
                <p className={`font-headline-sm text-headline-sm ${color} transition-all duration-700`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
