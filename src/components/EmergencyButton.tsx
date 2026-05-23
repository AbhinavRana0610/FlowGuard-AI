"use client";

import { useState } from "react";
import { useDashboardStore } from "@/store/dashboardStore";

type Props = {
  className?: string;
};

export default function EmergencyButton({ className = "" }: Props) {
  const { triggerEmergencyProtocol } = useDashboardStore();
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);

  async function handleClick() {
    if (loading || activated) return;
    setLoading(true);
    await new Promise<void>((r) => setTimeout(r, 1400));
    triggerEmergencyProtocol();
    setLoading(false);
    setActivated(true);
    setTimeout(() => setActivated(false), 9000);
  }

  const icon = loading ? "sync" : activated ? "check_circle" : "emergency";
  const label = loading ? "Activating..." : activated ? "Response Activated" : "Emergency Protocol";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 active:scale-95 transition-all disabled:cursor-not-allowed ${className}`}
    >
      <span
        className={`material-symbols-outlined text-[18px] ${loading ? "animate-spin" : ""}`}
        style={activated ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}
