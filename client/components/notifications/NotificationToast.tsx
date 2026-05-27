"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UserPlus, IndianRupee, PackageX, X } from "lucide-react";
import { useNotificationToastStore } from "@/store/notificationToastStore";

const TYPE_CONFIG = {
  customer_added: {
    icon: UserPlus,
    bg: "bg-sky-100",
    text: "text-sky-600",
    bar: "bg-sky-400",
    label: "Customer",
  },
  payment_received: {
    icon: IndianRupee,
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    bar: "bg-emerald-400",
    label: "Payment",
  },
  low_stock: {
    icon: PackageX,
    bg: "bg-amber-100",
    text: "text-amber-600",
    bar: "bg-amber-400",
    label: "Stock",
  },
};

export default function NotificationToast() {
  const { toasts, removeToast } = useNotificationToastStore();

  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2.5 w-[340px] max-w-[calc(100vw-2rem)] pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const cfg =
            TYPE_CONFIG[toast.type as keyof typeof TYPE_CONFIG] ??
            TYPE_CONFIG.customer_added;
          const Icon = cfg.icon;

          return (
            <motion.div
              key={toast.id}
              initial={{ x: 80, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 80, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="relative bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden pointer-events-auto"
            >
              <div className="flex items-start gap-3 px-4 py-3.5">
                {/* Icon */}
                <div
                  className={`shrink-0 w-9 h-9 rounded-xl ${cfg.bg} ${cfg.text} flex items-center justify-center mt-0.5`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-slate-900 leading-tight truncate">
                      {toast.title}
                    </p>
                    <span
                      className={`shrink-0 text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-md ${cfg.bg} ${cfg.text}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {toast.message}
                  </p>
                </div>

                {/* Close */}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Progress bar */}
              <ProgressBar
                duration={toast.duration ?? 4000}
                colorClass={cfg.bar}
                onComplete={() => removeToast(toast.id)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function ProgressBar({
  duration,
  colorClass,
  onComplete,
}: {
  duration: number;
  colorClass: string;
  onComplete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = `width ${duration}ms linear`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.width = "0%";
      });
    });
    const t = setTimeout(onComplete, duration);
    return () => clearTimeout(t);
  }, [duration, onComplete]);

  return (
    <div className="h-[3px] bg-slate-100">
      <div ref={ref} className={`h-full ${colorClass} w-full`} />
    </div>
  );
}
