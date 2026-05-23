import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

let _tid = 1;
function tid() { return `toast-${_tid++}`; }

type UIState = {
  notificationDrawerOpen: boolean;
  emergencyLoading: boolean;
  emergencyActivated: boolean;
  toasts: Toast[];
};

type UIActions = {
  openNotificationDrawer: () => void;
  closeNotificationDrawer: () => void;
  setEmergencyLoading: (v: boolean) => void;
  setEmergencyActivated: (v: boolean) => void;
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
};

export const useUIStore = create<UIState & UIActions>((set, get) => ({
  notificationDrawerOpen: false,
  emergencyLoading: false,
  emergencyActivated: false,
  toasts: [],

  openNotificationDrawer: () => set({ notificationDrawerOpen: true }),
  closeNotificationDrawer: () => set({ notificationDrawerOpen: false }),

  setEmergencyLoading: (v) => set({ emergencyLoading: v }),
  setEmergencyActivated: (v) => set({ emergencyActivated: v }),

  addToast: (message, type = "info", duration = 3500) => {
    const id = tid();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }].slice(-5) }));
    setTimeout(() => get().removeToast(id), duration);
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  clearToasts: () => set({ toasts: [] }),
}));
