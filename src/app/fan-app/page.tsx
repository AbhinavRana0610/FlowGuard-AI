"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/store/dashboardStore";
import type { Notification } from "@/store/dashboardStore";

// ── Scenario detection ────────────────────────────────────────────────────

type Scenario = "default" | "surge" | "medical" | "rain";

function detectScenario(notifications: Notification[]): Scenario {
  const msg = notifications[0]?.message ?? "";
  if (msg.includes("surge") || msg.includes("Crowd")) return "surge";
  if (msg.toLowerCase().includes("medical")) return "medical";
  if (msg.toLowerCase().includes("rain")) return "rain";
  return "default";
}

// ── Per-scenario config ───────────────────────────────────────────────────

const BANNER = {
  default: {
    label: "SMART UPDATE",
    message: "AI Updated Your Route to avoid Gate A congestion.",
    labelColor: "text-primary",
    iconColor: "text-primary",
    iconBg: "bg-primary/20",
    border: "border-primary",
    gradient: "from-primary/10",
    icon: "bolt",
  },
  surge: {
    label: "ROUTE UPDATED",
    message: "Heavy congestion detected. You have been redirected to Gate D.",
    labelColor: "text-error",
    iconColor: "text-error",
    iconBg: "bg-error/20",
    border: "border-error",
    gradient: "from-error/10",
    icon: "warning",
  },
  medical: {
    label: "EMERGENCY ALERT",
    message: "Emergency protocol active. Expect brief delays.",
    labelColor: "text-tertiary",
    iconColor: "text-tertiary",
    iconBg: "bg-tertiary/20",
    border: "border-tertiary",
    gradient: "from-tertiary/10",
    icon: "medical_services",
  },
  rain: {
    label: "WEATHER ALERT",
    message: "Weather protocol active. Updated exit route.",
    labelColor: "text-secondary",
    iconColor: "text-secondary",
    iconBg: "bg-secondary/20",
    border: "border-secondary",
    gradient: "from-secondary/10",
    icon: "rainy",
  },
} as const;

const GATE = {
  default: { label: "Gate B", area: "West Perimeter", color: "text-primary" },
  surge:   { label: "Gate D", area: "East Perimeter", color: "text-tertiary" },
  medical: { label: "Gate B", area: "West Perimeter", color: "text-primary" },
  rain:    { label: "Gate B", area: "West Perimeter (Covered)", color: "text-secondary" },
} as const;

const WAIT = {
  default: { mins: "4",  label: "Flowing Fast",   color: "text-tertiary" },
  surge:   { mins: "3",  label: "Flowing Fast",   color: "text-tertiary" },
  medical: { mins: "6",  label: "Brief Delay",    color: "text-secondary" },
  rain:    { mins: "8",  label: "Weather Delay",  color: "text-secondary" },
} as const;

const CTA = {
  default: "View Safe Route",
  surge:   "View Redirected Route",
  medical: "View Emergency Route",
  rain:    "View Updated Route",
} as const;

// ── Component ─────────────────────────────────────────────────────────────

export default function FanExperienceApp() {
  const router = useRouter();
  const { notifications, systemHealth } = useDashboardStore();

  const scenario = detectScenario(notifications);
  const banner = BANNER[scenario];
  const gate = GATE[scenario];
  const wait = WAIT[scenario];
  const ctaLabel = CTA[scenario];

  const showEmergencyBar = scenario === "medical" || scenario === "surge";

  return (
    <div className="bg-surface text-on-surface font-body-md overflow-x-hidden no-scrollbar min-h-screen">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-full h-full bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-secondary-container/10 blur-[120px] rounded-full"></div>
      </div>

      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-primary/20 flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight hover:text-primary transition-colors">
            FlowGuard AI
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative material-symbols-outlined text-on-surface-variant hover:bg-white/5 p-2 rounded-full transition-colors active:scale-95">
            notifications_active
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse"></span>
            )}
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
            <img
              alt="Operator Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEr9zY_1zVq_bPPCDvL2MBfUOtGFb4SbUJPSUNXlBVMlXWaVBHMLWlYYiG66DMOTSbNHZCIGQxXVMwRBoNiiphTXcRyP_sOjAt9tGYHw50q8Mg3UVghEv0z3mttF0Qu6FchyICGz6p4pHvdj0F_vYwAmiCkGxyixXlA0lFr1zKwTxzrFRqEu3FeFpLsHexaajhHamDs0G_Y1dyv-G6LTJNIGO_V8S_2Dt9EVWBc7CwJU_98of8YL_uzdzUce_Q8WULMJGQt8e9lvcw"
            />
          </div>
        </div>
      </header>

      {/* Emergency Bar — slides in for surge / medical */}
      <div
        className={`fixed top-[72px] left-0 w-full z-40 flex items-center gap-3 px-6 py-2.5 transition-all duration-500 ${
          showEmergencyBar
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        } ${scenario === "medical" ? "bg-tertiary/20 border-b border-tertiary/30" : "bg-error/20 border-b border-error/30"}`}
      >
        <span
          className={`material-symbols-outlined text-[18px] animate-pulse ${scenario === "medical" ? "text-tertiary" : "text-error"}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {scenario === "medical" ? "medical_services" : "warning"}
        </span>
        <p className={`font-label-caps text-label-caps ${scenario === "medical" ? "text-tertiary" : "text-error"}`}>
          {scenario === "medical"
            ? "Emergency protocol active — Sector 4B"
            : "Critical congestion — Gate B closed to new arrivals"}
        </p>
        <span className={`ml-auto text-[10px] font-bold uppercase tracking-widest ${scenario === "medical" ? "text-tertiary" : "text-error"}`}>
          {systemHealth.toUpperCase()}
        </span>
      </div>

      <main
        className={`relative z-10 pb-32 px-6 space-y-8 max-w-[32rem] mx-auto transition-all duration-500 ${
          showEmergencyBar ? "pt-32" : "pt-24"
        }`}
      >
        {/* Smart Update / Notification Card — reactive */}
        <div
          key={scenario}
          className={`glass-card shimmer-border rounded-xl p-4 flex items-center gap-4 border-l-4 ${banner.border} bg-gradient-to-r ${banner.gradient} to-transparent transition-all duration-500`}
        >
          <div className={`w-10 h-10 rounded-full ${banner.iconBg} flex items-center justify-center shrink-0 transition-colors duration-500`}>
            <span
              className={`material-symbols-outlined ${banner.iconColor} transition-colors duration-500`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {banner.icon}
            </span>
          </div>
          <div>
            <p className={`font-label-caps text-label-caps ${banner.labelColor} mb-0.5 transition-colors duration-500`}>
              {banner.label}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{banner.message}</p>
          </div>
        </div>

        {/* Digital Ticket */}
        <section className="relative">
          <div className="glass-card shimmer-border rounded-t-3xl p-6 pb-8 bg-surface-container-highest/60 relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">Champions Final</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Luzhniki Stadium • Section 204</p>
              </div>
              <div className="text-right">
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">KICKOFF</p>
                <p className="font-mono-data text-mono-data text-on-surface">20:45 CET</p>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className="space-y-4">
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant">ROW</p>
                  <p className="font-headline-sm text-headline-sm">12</p>
                </div>
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant">SEAT</p>
                  <p className="font-headline-sm text-headline-sm">42</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-inner shadow-black/20">
                <img
                  alt="Ticket QR"
                  className="w-24 h-24 mix-blend-multiply opacity-90"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsmKaIKKinTQ57eQIfcWJBUNncI8WMiQ3uEt4ZMTRfiGy0lwFf30lV6OsI8Ilkdq6vC9g2AvnaooQnDhiaa1vSpO5_o3hsStzyQurNr42FjeRd8weOyOVtWtRZr8QKc9G1jP95O258VGSCt-Ij6k6ptZmEU8_rZ7sGeiD2zKrOph__r7IQ2lfXntEd2-z5phYqsOhVVKYncm3lK4mBAvzKuDp1UV8nlFlWXtNMXEJJTRoS5N-wMQZ7HfBEu2WM5sq_UyWr4PW3YqZq"
                />
              </div>
            </div>
          </div>
          {/* Perforated Edge */}
          <div className="flex justify-between px-6 -mt-3 relative z-20">
            <div className="w-6 h-6 rounded-full bg-surface -ml-9 border border-white/5"></div>
            <div className="flex-1 border-t-2 border-dashed border-white/10 mt-3 mx-2"></div>
            <div className="w-6 h-6 rounded-full bg-surface -mr-9 border border-white/5"></div>
          </div>
          <div className="glass-card shimmer-border rounded-b-3xl p-4 bg-primary/5 text-center -mt-3 pt-8">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Digital Pass Verified</p>
          </div>
        </section>

        {/* Access Info Grid */}
        <section className="grid grid-cols-2 gap-4">
          {/* Assigned Gate — reactive */}
          <div className="glass-card shimmer-border rounded-2xl p-5 flex flex-col justify-between aspect-square">
            <div>
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                <span className={`material-symbols-outlined transition-colors duration-500 ${gate.color}`}>gate</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-label-caps text-label-caps text-on-surface-variant">ASSIGNED GATE</p>
                {scenario === "surge" && (
                  <span className="px-1.5 py-0.5 bg-error/20 text-error text-[8px] font-bold rounded tracking-widest animate-pulse">
                    REDIRECTED
                  </span>
                )}
              </div>
              <p className={`font-headline-md text-headline-md transition-all duration-500 ${gate.color}`}>
                {gate.label}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 transition-all duration-500">
                {gate.area}
              </p>
            </div>
          </div>

          {/* Wait Time — reactive */}
          <div className="glass-card shimmer-border rounded-2xl p-5 flex flex-col justify-between aspect-square">
            <div>
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center relative">
                <div
                  className={`absolute inset-0 rounded-full border-2 animate-ping transition-colors duration-500 ${
                    scenario === "medical"
                      ? "border-tertiary/30"
                      : scenario === "rain"
                      ? "border-secondary/30"
                      : "border-tertiary/30"
                  }`}
                ></div>
                <span
                  className={`material-symbols-outlined relative z-10 transition-colors duration-500 ${
                    scenario === "medical"
                      ? "text-tertiary"
                      : scenario === "rain"
                      ? "text-secondary"
                      : "text-tertiary"
                  }`}
                >
                  timer
                </span>
              </div>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">WAIT TIME</p>
              <div className="flex items-baseline gap-1">
                <p className="font-headline-md text-headline-md text-on-surface transition-all duration-700">
                  {wait.mins}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">mins</p>
              </div>
              <p className={`font-body-sm text-body-sm mt-1 transition-colors duration-500 ${wait.color}`}>
                {wait.label}
              </p>
            </div>
          </div>
        </section>

        {/* Route Recommendation — reactive */}
        {scenario !== "default" && (
          <section className="glass-card shimmer-border rounded-2xl p-5 border border-white/10">
            <p className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase">
              AI Route Recommendation
            </p>
            <div className="flex items-start gap-3">
              <span className={`material-symbols-outlined text-[20px] mt-0.5 ${banner.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                subdirectory_arrow_right
              </span>
              <div>
                {scenario === "surge" && (
                  <>
                    <p className="font-label-caps text-[13px] text-on-surface">Take East Concourse → Gate D</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Estimated walk: 4 min • Low congestion</p>
                  </>
                )}
                {scenario === "medical" && (
                  <>
                    <p className="font-label-caps text-[13px] text-on-surface">Avoid Sector 4B — Use Gate B North Entry</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Emergency corridor active • Keep clear</p>
                  </>
                )}
                {scenario === "rain" && (
                  <>
                    <p className="font-label-caps text-[13px] text-on-surface">Use covered walkway via Concourse C2</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Shelter available • Wet surface protocols active</p>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="space-y-4">
          <button
            onClick={() => router.push("/fan-app/map")}
            className={`w-full py-5 px-8 rounded-2xl text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-3 active:scale-95 transition-all duration-500 ${
              scenario === "medical"
                ? "bg-tertiary glow-tertiary"
                : scenario === "rain"
                ? "bg-secondary"
                : scenario === "surge"
                ? "bg-error"
                : "bg-primary glow-primary"
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              near_me
            </span>
            {ctaLabel}
          </button>
          <p className="text-center font-body-sm text-body-sm text-on-surface-variant opacity-60">
            Powered by FlowGuard AI Real-time Telemetry
          </p>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-surface-container/80 backdrop-blur-lg border-t border-white/10">
        {[
          { icon: "home",                label: "Home",   href: "/",              fill: false },
          { icon: "confirmation_number", label: "Ticket", href: "/fan-app",       fill: true,  active: true },
          { icon: "explore",             label: "Map",    href: "/fan-app/map",   fill: false },
          { icon: "support_agent",       label: "Help",   href: "/fan-app/help",  fill: false },
        ].map(({ icon, label, href, active, fill }) => (
          <Link
            key={label}
            href={href}
            className={`flex flex-col items-center justify-center p-2 rounded-xl active:scale-90 transition-all ${
              active ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined" style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}>
              {icon}
            </span>
            <span className="font-label-caps text-label-caps">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
