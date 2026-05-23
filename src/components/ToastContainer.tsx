"use client";

import { useUIStore } from "@/store/uiStore";

const STYLES = {
  success: { bg: "bg-primary/90",                    text: "text-on-primary",   icon: "check_circle", border: "border-primary/30"   },
  error:   { bg: "bg-error/90",                      text: "text-on-error",     icon: "error",        border: "border-error/30"     },
  warning: { bg: "bg-tertiary/90",                   text: "text-white",        icon: "warning",      border: "border-tertiary/30"  },
  info:    { bg: "bg-surface-container-high/95",     text: "text-on-surface",   icon: "info",         border: "border-white/10"     },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((toast) => {
        const s = STYLES[toast.type];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-xl shadow-black/30 min-w-[240px] max-w-[320px] ${s.bg} ${s.text} ${s.border}`}
            style={{ animation: "slideInRight 0.25s ease-out" }}
          >
            <span
              className="material-symbols-outlined text-[18px] shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {s.icon}
            </span>
            <p className="font-body-sm text-body-sm flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
