"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useUIStore } from "@/store/uiStore";

export default function NotificationDrawer() {
  const { notifications, clearNotifications } = useDashboardStore();
  const { notificationDrawerOpen, closeNotificationDrawer } = useUIStore();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeNotificationDrawer();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeNotificationDrawer]);

  return (
    <>
      {notificationDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={closeNotificationDrawer}
        />
      )}

      <div
        className={`fixed top-[72px] right-0 z-50 w-80 max-h-[calc(100vh-5rem)] flex flex-col transition-all duration-300 ${
          notificationDrawerOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-surface-container/95 backdrop-blur-xl border border-white/10 rounded-l-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden max-h-[calc(100vh-5rem)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                notifications_active
              </span>
              <span className="font-label-caps text-label-caps text-on-surface">Notifications</span>
              {notifications.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-error flex items-center justify-center text-[10px] font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-[10px] font-label-caps text-on-surface-variant hover:text-error transition-colors"
                >
                  CLEAR ALL
                </button>
              )}
              <button
                onClick={closeNotificationDrawer}
                className="p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <span className="material-symbols-outlined text-on-surface-variant text-[48px] mb-3 opacity-30">
                  notifications_off
                </span>
                <p className="font-label-caps text-label-caps text-on-surface-variant opacity-50">
                  No active notifications
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="px-5 py-3 hover:bg-white/3 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    <div>
                      <p className="font-body-sm text-body-sm text-on-surface">{n.message}</p>
                      {n.time && (
                        <p className="text-[10px] text-on-surface-variant mt-0.5 font-mono-data">
                          {n.time}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
