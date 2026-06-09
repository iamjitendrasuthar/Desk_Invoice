"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  UserPlus,
  IndianRupee,
  PackageX,
  Trash2,
  CheckCheck,
  X,
  Loader2,
  BellOff,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification as AppNotification } from "@/types/notification";
import { cn } from "@/lib/utils";

const TYPE_CONFIG = {
  customer_added: {
    icon: UserPlus,
    bg: "bg-sky-100 dark:bg-sky-900/40",
    text: "text-sky-600 dark:text-sky-400",
    ring: "ring-sky-200 dark:ring-sky-800",
    dot: "bg-sky-500",
    label: "Customer",
  },
  payment_received: {
    icon: IndianRupee,
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-200 dark:ring-emerald-800",
    dot: "bg-emerald-500",
    label: "Payment",
  },
  low_stock: {
    icon: PackageX,
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-200 dark:ring-amber-800",
    dot: "bg-amber-500",
    label: "Stock",
  },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className }: NotificationBellProps) {
  const {
    notifications,
    unreadCount,
    loading,
    open,
    toggleOpen,
    close,
    markOneRead,
    markAllRead,
    deleteOne,
    clearRead,
  } = useNotifications();

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [close]);

  const typedNotifications = notifications as AppNotification[];
  const hasRead = typedNotifications.some((n) => n.isRead);

  return (
    <div ref={wrapperRef} className="relative">
      {/* ── Bell Button ── */}
      <button
        onClick={toggleOpen}
        aria-label="Notifications"
        className="flex items-center justify-center w-full h-full"
      >
        <Bell
          className={`w-5 h-5 transition-colors ${
            open
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
          }`}
        />

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-sm shadow-red-300 ring-2 ring-white dark:ring-slate-800"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {unreadCount > 0 && !open && (
          <span className="absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full bg-red-400 animate-ping opacity-40 pointer-events-none" />
        )}
      </button>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed lg:absolute inset-x-2 lg:inset-x-auto lg:right-0 top-16 lg:top-14 w-[calc(100vw-16px)] lg:w-[380px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)] overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50/50 dark:bg-slate-700/40 border-b border-slate-100 dark:border-slate-700/60">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Notifications
                </h3>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-full transition-colors"
                >
                  Mark all read
                </button>
              )}
              {hasRead && (
                <button
                  onClick={clearRead}
                  title="Clear read notifications"
                  className="flex items-center gap-1 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 bg-slate-50 dark:bg-slate-700/50 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-indigo-500 dark:text-indigo-400" />
                </div>
              ) : typedNotifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No new updates
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {typedNotifications.map((n) => {
                    const cfg =
                      // @ts-ignore
                      TYPE_CONFIG[n.type as NotificationType] ??
                      TYPE_CONFIG.customer_added;
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={n._id}
                        className={cn(
                          "flex gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors",
                          !n.isRead && "bg-indigo-50/30 dark:bg-indigo-900/10",
                        )}
                        onClick={() => !n.isRead && markOneRead(n._id)}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                            cfg.bg,
                            cfg.text,
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {n.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2 block">
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteOne(n._id);
                          }}
                          className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
