import { create } from "zustand";

export interface Toast {
    id: string;
    type: "success" | "error" | "info";
    message: string;
}

interface UIState {
    toasts: Toast[];

    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
}

let toastId = 0;

export const useUIStore = create<UIState>()((set, get) => ({
    toasts: [],

    addToast: (toast) => {
        const id = `toast-${++toastId}-${Date.now()}`;
        set((s) => ({
            toasts: [...s.toasts.slice(-4), { ...toast, id }],
        }));
        setTimeout(() => {
            get().removeToast(id);
        }, 4000);
    },

    removeToast: (id) =>
        set((s) => ({
            toasts: s.toasts.filter((t) => t.id !== id),
        })),
}));
