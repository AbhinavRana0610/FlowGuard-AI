import Sidebar from "@/components/Sidebar";
import EmergencyButton from "@/components/EmergencyButton";

export default function ArchitectureView() {
  return (
    <div className="min-h-screen overflow-hidden">
      <Sidebar />

      {/* Ambient Background */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-secondary-container/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-primary/20 flex justify-between items-center px-gutter py-4">
        <div className="flex items-center gap-md">
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">FlowGuard AI</h1>
          <div className="hidden md:flex gap-md ml-lg">
            {[["Dashboard", "/"], ["Map", "#"], ["Simulate", "/incident-simulator"], ["Architecture", "/architecture", true]].map(([label, href, active]) => (
              <a
                key={String(label)}
                href={String(href)}
                className={`font-body-md text-body-md px-2 py-1 rounded transition-colors ${active ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:bg-white/5"}`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-md">
          <EmergencyButton className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-caps text-label-caps" />
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">notifications_active</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">settings</span>
            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline overflow-hidden">
              <img
                alt="Operator Profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuADBYYIa4k31kxca26nEYCC_o7k5SeFPYdRw2rR_SD10td6Qme-byI67iT7At7lmOWloTTj5ZOFComQT5u4A31Y-il5VdqTJNVZAx_Njj1NRj4xqhv3X1mH2ixJtVcNqNuG5AJuIglZnD-MJ4c7RzRCk4rDRcbyQi7_HCaevjN1RU1cGfuIQUNQ8G6Zp4o2Y7UlyO7BVYSWsYqcF1uxvGLlfa7Rics_0LwjlbvcYJ9Ar16RZs705Kqt1SyQgaYk0qXRmGxj7s6GUxke"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 pt-24 min-h-screen relative overflow-hidden">
        <div className="px-margin py-base h-full flex flex-col">
          <header className="mb-lg">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Core System Architecture</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              High-fidelity visualization of real-time data orchestration between our predictive simulators and distributed agent clusters.
            </p>
          </header>

          {/* Architecture Diagram */}
          <div className="flex-1 relative glass-panel rounded-3xl p-lg overflow-hidden border border-white/10 shadow-2xl">
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)" }}></div>

            {/* SVG Flow Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="flowGrad" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="rgba(180, 197, 255, 0.1)" />
                  <stop offset="50%" stopColor="rgba(180, 197, 255, 0.8)" />
                  <stop offset="100%" stopColor="rgba(180, 197, 255, 0.1)" />
                </linearGradient>
              </defs>
              <path className="flow-line" d="M 220 250 L 450 250" fill="none" stroke="url(#flowGrad)" strokeWidth="2" />
              <path className="flow-line" d="M 550 250 L 780 120" fill="none" stroke="url(#flowGrad)" strokeWidth="2" />
              <path className="flow-line" d="M 550 250 L 780 250" fill="none" stroke="url(#flowGrad)" strokeWidth="2" />
              <path className="flow-line" d="M 550 250 L 780 380" fill="none" stroke="url(#flowGrad)" strokeWidth="2" />
              <path className="flow-line" d="M 980 120 L 1150 180" fill="none" stroke="url(#flowGrad)" strokeWidth="2" />
              <path className="flow-line" d="M 980 250 L 1150 250" fill="none" stroke="url(#flowGrad)" strokeWidth="2" />
              <path className="flow-line" d="M 980 380 L 1150 320" fill="none" stroke="url(#flowGrad)" strokeWidth="2" />
            </svg>

            <div className="relative grid grid-cols-4 h-full items-center min-h-[400px]">
              {/* Col 1: Simulator */}
              <div className="flex flex-col items-center">
                <div className="floating-node glass-panel p-6 rounded-2xl w-48 text-center border-t border-white/20">
                  <span className="material-symbols-outlined text-primary text-4xl mb-4 block">settings_input_antenna</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Simulator</h3>
                  <p className="font-label-caps text-[10px] text-on-surface-variant mt-2">VIRTUAL ENVIRONMENT</p>
                  <div className="mt-4 flex gap-1 justify-center">
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                    <div className="w-1 h-1 bg-primary/50 rounded-full"></div>
                    <div className="w-1 h-1 bg-primary/20 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Col 2: Orchestrator */}
              <div className="flex flex-col items-center">
                <div className="glass-panel p-8 rounded-full w-40 h-40 flex flex-col items-center justify-center border-4 border-primary/20 node-pulse">
                  <span className="material-symbols-outlined text-primary text-5xl mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
                  <h3 className="font-label-caps text-label-caps text-primary">Orchestrator</h3>
                </div>
              </div>

              {/* Col 3: Agents */}
              <div className="flex flex-col gap-lg items-center">
                {[
                  { icon: "groups", color: "primary", label: "Crowd AI", status: "Active", delay: "-1s" },
                  { icon: "emergency", color: "error", label: "Emergency AI", status: "Standby", delay: "-3s" },
                  { icon: "forum", color: "tertiary-fixed-dim", label: "Comms AI", status: "Transmitting", delay: "-5s" },
                ].map(({ icon, color, label, status, delay }) => (
                  <div
                    key={label}
                    className={`glass-panel p-4 rounded-xl w-48 flex items-center gap-md border-l-4 border-${color} floating-node`}
                    style={{ animationDelay: delay }}
                  >
                    <div className={`bg-${color}/20 p-2 rounded-lg`}>
                      <span className={`material-symbols-outlined text-${color}`}>{icon}</span>
                    </div>
                    <div>
                      <h4 className="font-label-caps text-label-caps text-on-surface">{label}</h4>
                      <p className={`text-[10px] text-${color}`}>{status}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Col 4: Endpoints */}
              <div className="flex flex-col gap-md items-start pl-lg">
                {[
                  { label: "Dashboard UI", icon: "monitor", pct: "75%" },
                  { label: "Fan Push", icon: "smartphone", pct: "50%" },
                ].map(({ label, icon, pct }) => (
                  <div key={label} className="glass-panel px-6 py-4 rounded-2xl w-56">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-label-caps text-label-caps text-on-surface">{label}</span>
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">{icon}</span>
                    </div>
                    <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: pct }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="mt-lg grid grid-cols-1 md:grid-cols-3 gap-md pb-margin">
            <div className="glass-panel p-md rounded-2xl">
              <h5 className="font-label-caps text-label-caps text-on-surface-variant mb-4">Latency Distribution</h5>
              <div className="flex items-end gap-1 h-24">
                {[60, 40, 90, 50, 70, 30].map((h, i) => (
                  <div key={i} className="bg-primary w-full rounded-t-sm" style={{ height: `${h}%`, opacity: i % 2 === 0 ? 0.4 + (i * 0.1) : 0.8 }}></div>
                ))}
              </div>
            </div>
            <div className="glass-panel p-md rounded-2xl flex flex-col justify-between">
              <h5 className="font-label-caps text-label-caps text-on-surface-variant">Security Protocol</h5>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-headline-sm text-headline-sm text-on-surface">TLS 1.3</p>
                  <p className="font-label-caps text-[10px] text-on-surface-variant">End-to-End Encrypted</p>
                </div>
                <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </div>
            </div>
            <div className="glass-panel p-md rounded-2xl">
              <h5 className="font-label-caps text-label-caps text-on-surface-variant mb-4">Node Health</h5>
              <div className="space-y-3">
                {[["Edge-Cluster-01", "99.9%"], ["Compute-Grid-Alpha", "98.4%"]].map(([node, pct]) => (
                  <div key={node} className="flex justify-between items-center">
                    <span className="text-body-sm text-on-surface">{node}</span>
                    <span className="text-body-sm text-primary font-bold">{pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-surface-container/80 backdrop-blur-lg border-t border-white/10 md:hidden">
        {[{ icon: "home", label: "Home" }, { icon: "confirmation_number", label: "Ticket" }, { icon: "explore", label: "Map", active: true }, { icon: "support_agent", label: "Help" }].map(({ icon, label, active }) => (
          <div key={label} className={`flex flex-col items-center justify-center p-2 rounded-xl active:scale-90 transition-all ${active ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant"}`}>
            <span className="material-symbols-outlined">{icon}</span>
            <span className="font-label-caps text-label-caps">{label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}
