"use client";

import Link from "next/link";
import { useState } from "react";
import { useDashboardStore } from "@/store/dashboardStore";

const NAV_ITEMS = [
  { icon: "home",                label: "Home",   href: "/" },
  { icon: "confirmation_number", label: "Ticket", href: "/fan-app",      fill: true },
  { icon: "explore",             label: "Map",    href: "/fan-app/map",  fill: false },
  { icon: "support_agent",       label: "Help",   href: "/fan-app/help", fill: false, active: true },
];

const FAQS = [
  {
    q: "How do I find my assigned gate?",
    a: "Your gate is assigned automatically based on real-time crowd density. Check your ticket page — it updates live as conditions change.",
  },
  {
    q: "What happens if my gate changes?",
    a: "You will receive an instant push notification and the FlowGuard AI Smart Update card on your ticket page will show the new gate with a recommended route.",
  },
  {
    q: "Can I enter through a different gate?",
    a: "Your ticket is valid at your assigned gate only. Entering via another gate may cause delays. Follow the AI route recommendation for the fastest entry.",
  },
  {
    q: "What do the occupancy colours mean?",
    a: "Blue = Clear (under 60%), Amber = Warning (60–84%), Red = Critical (85%+). Avoid red gates — the system will automatically reassign you.",
  },
  {
    q: "How accurate is the wait time?",
    a: "Wait times are recalculated every 30 seconds using sensor data from all 64 turnstiles. Accuracy is typically within ±90 seconds.",
  },
];

export default function FanHelp() {
  const { systemHealth, alerts } = useDashboardStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const activeAlerts = alerts.filter((a) => a.status !== "completed");
  const isEmergency = systemHealth === "critical";

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
            SUPPORT
          </span>
        </div>
      </header>

      <main className="relative z-10 pt-24 pb-32 px-6 space-y-6 max-w-[32rem] mx-auto">

        {/* Emergency banner — only when system is critical */}
        {isEmergency && (
          <div className="glass-card shimmer-border rounded-xl p-4 flex items-center gap-4 border-l-4 border-error bg-gradient-to-r from-error/10 to-transparent">
            <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-error text-[20px] animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-error mb-0.5">ACTIVE INCIDENT</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {activeAlerts[0]?.title ?? "Emergency protocol active. Follow staff instructions."}
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase">Quick Actions</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "local_hospital", label: "First Aid",   color: "text-error",     bg: "bg-error/10",     border: "border-error/20" },
              { icon: "security",       label: "Security",    color: "text-tertiary",  bg: "bg-tertiary/10",  border: "border-tertiary/20" },
              { icon: "badge",          label: "Lost Item",   color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/20" },
            ].map(({ icon, label, color, bg, border }) => (
              <button
                key={label}
                className={`glass-card shimmer-border rounded-2xl p-4 flex flex-col items-center gap-2 border ${border} ${bg} active:scale-95 transition-all`}
              >
                <span className={`material-symbols-outlined text-[28px] ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                <span className={`font-label-caps text-[10px] ${color}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Assistant card */}
        <div className="glass-card shimmer-border rounded-2xl p-5 flex items-start gap-4 border border-primary/15">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </div>
          <div className="flex-1">
            <p className="font-label-caps text-label-caps text-primary mb-1">AI ASSISTANT</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
              Ask FlowGuard AI anything about your route, wait times, or stadium services.
            </p>
            <div className="flex gap-2 flex-wrap">
              {["Gate directions", "Wait times", "Exit routes"].map((chip) => (
                <span key={chip} className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-caps text-[10px]">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div>
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase">Contact</p>
          <div className="space-y-3">
            {[
              { icon: "call",          label: "Stadium Control Room", value: "+91 11 2345 6789",   color: "text-primary" },
              { icon: "chat_bubble",   label: "Live Chat Support",    value: "Available 18:00–24:00", color: "text-secondary" },
              { icon: "mail",          label: "Fan Support Email",    value: "fans@flowguard.ai",  color: "text-tertiary" },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="glass-card shimmer-border rounded-xl p-4 flex items-center gap-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-white/5`}>
                  <span className={`material-symbols-outlined text-[18px] ${color}`}>{icon}</span>
                </div>
                <div>
                  <p className="font-label-caps text-[11px] text-on-surface">{label}</p>
                  <p className={`font-body-sm text-body-sm ${color}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase">Frequently Asked</p>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="glass-card shimmer-border rounded-xl overflow-hidden border border-white/5"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-label-caps text-[12px] text-on-surface pr-3">{faq.q}</span>
                  <span className={`material-symbols-outlined text-on-surface-variant text-[18px] shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40 pb-4" : "max-h-0"}`}
                >
                  <p className="font-body-sm text-body-sm text-on-surface-variant px-4">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System status footer */}
        <div className="glass-card shimmer-border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${systemHealth === "optimal" ? "bg-primary animate-pulse" : systemHealth === "warning" ? "bg-tertiary animate-pulse" : "bg-error animate-pulse"}`} />
            <span className="font-label-caps text-[11px] text-on-surface-variant">FlowGuard AI System</span>
          </div>
          <span className={`font-label-caps text-[11px] font-bold ${systemHealth === "optimal" ? "text-primary" : systemHealth === "warning" ? "text-tertiary" : "text-error"}`}>
            {systemHealth.toUpperCase()}
          </span>
        </div>
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
