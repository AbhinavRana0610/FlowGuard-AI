"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "dashboard", label: "Command Center" },
  { href: "/fan-app", icon: "route", label: "Fan Routing" },
  { href: "/incident-simulator", icon: "security", label: "Incident Lab" },
  { href: "/architecture", icon: "schema", label: "System Arch" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-white/[0.12] backdrop-blur-2xl border-r border-white/10 shadow-2xl flex flex-col py-8 px-4 z-50">
      <div className="mb-10 px-2">
        <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
          FlowGuard AI
        </h1>
        <div className="flex items-center gap-3 mt-6 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <span className="material-symbols-outlined text-primary">hub</span>
          </div>
          <div>
            <p className="font-label-caps text-label-caps text-on-surface">Sector A-1</p>
            <p className="text-[10px] text-primary uppercase font-bold tracking-widest">Operational</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map(({ href, icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 px-4 py-3 font-label-caps text-label-caps hover:translate-x-1 transition-all rounded-l-xl ${
                active
                  ? "bg-primary/20 text-primary border-r-4 border-primary"
                  : "text-on-surface-variant hover:bg-white/10"
              }`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              {label}
            </Link>
          );
        })}
        <Link
          href="#"
          className="flex items-center gap-4 px-4 py-3 text-on-surface-variant font-label-caps text-label-caps hover:bg-white/10 hover:translate-x-1 transition-all"
        >
          <span className="material-symbols-outlined">settings</span>
          Settings
        </Link>
      </nav>

      <div className="mt-auto space-y-2 pt-6 border-t border-white/5">
        <button className="w-full bg-primary text-on-primary py-3 rounded-xl font-label-caps text-label-caps shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-transform">
          Launch AI Agent
        </button>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[20px]">help</span>
            <span className="text-[9px] font-label-caps">Support</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[20px]">terminal</span>
            <span className="text-[9px] font-label-caps">Logs</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
