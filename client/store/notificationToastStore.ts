import { create } from "zustand";

export type ToastItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  duration?: number;
};

type Store = {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
};

export const useNotificationToastStore = create<Store>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((s) => ({
      toasts: [
        ...s.toasts.slice(-2), // max 3 toasts at once
        { ...toast, id: crypto.randomUUID() },
      ],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
