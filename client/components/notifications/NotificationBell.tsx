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

// ── Type icon + color per notification type ────────────────────────────────
const TYPE_CONFIG = {
  customer_added: {
    icon: UserPlus,
    bg: "bg-sky-100",
    text: "text-sky-600",
    ring: "ring-sky-200",
    dot: "bg-sky-500",
    label: "Customer",
  },
  payment_received: {
    icon: IndianRupee,
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
    label: "Payment",
  },
  low_stock: {
    icon: PackageX,
    bg: "bg-amber-100",
    text: "text-amber-600",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
    label: "Stock",
  },
};

// ── Relative time helper ────────────────────────────────────────────────────
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

// ── Main Component ─────────────────────────────────────────────────────────
export default function NotificationBell() {
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

  // Close on outside click
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
      {/* ── Bell Button ─────────────────────────────────────────────────── */}
      <button
        onClick={toggleOpen}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 shadow-sm group"
        aria-label="Notifications"
      >
        <Bell
          className={`w-5 h-5 transition-colors ${
            open
              ? "text-indigo-600"
              : "text-slate-500 group-hover:text-indigo-500"
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
              className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-sm shadow-red-300 ring-2 ring-white"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring when there are unread notifications */}
        {unreadCount > 0 && !open && (
          <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-red-400 animate-ping opacity-40 pointer-events-none" />
        )}
      </button>

      {/* ── Dropdown ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed lg:absolute inset-x-2 lg:inset-x-auto lg:right-0 top-16 lg:top-12 w-auto lg:w-[370px] bg-white/95 backdrop-blur-xl ..."
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                <span className="font-extrabold text-slate-900 text-sm">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    title="Mark all as read"
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    All read
                  </button>
                )}
                {hasRead && (
                  <button
                    onClick={clearRead}
                    title="Clear read notifications"
                    className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {loading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  <span className="text-sm font-bold">Loading…</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <BellOff className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold">No notifications yet</p>
                  <p className="text-xs font-medium text-slate-300">
                    Customer, payment & stock alerts appear here
                  </p>
                </div>
              ) : (
                <ul>
                  <AnimatePresence initial={false}>
                    {notifications.map((n) => {
                      const cfg =
                        TYPE_CONFIG[n.type as keyof typeof TYPE_CONFIG] ??
                        TYPE_CONFIG.customer_added;
                      const Icon = cfg.icon;
                      return (
                        <motion.li
                          key={n._id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{
                            opacity: 0,
                            x: 8,
                            height: 0,
                            paddingTop: 0,
                            paddingBottom: 0,
                          }}
                          transition={{ duration: 0.18 }}
                          className={`group relative flex items-start gap-3.5 px-5 py-4 border-b border-slate-50 transition-colors cursor-pointer ${
                            !n.isRead
                              ? "bg-indigo-50/40 hover:bg-indigo-50/70"
                              : "hover:bg-slate-50/70"
                          }`}
                          onClick={() => !n.isRead && markOneRead(n._id)}
                        >
                          {/* Icon */}
                          <div
                            className={`shrink-0 w-9 h-9 rounded-xl ${cfg.bg} ${cfg.text} ring-1 ${cfg.ring} flex items-center justify-center mt-0.5`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`text-sm font-extrabold leading-tight truncate ${
                                  !n.isRead
                                    ? "text-slate-900"
                                    : "text-slate-600"
                                }`}
                              >
                                {n.title}
                              </p>
                              <span className="text-[10px] font-bold text-slate-400 shrink-0 mt-0.5">
                                {timeAgo(n.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                              {n.message}
                            </p>
                            <span
                              className={`inline-block mt-1.5 text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-md ${cfg.bg} ${cfg.text}`}
                            >
                              {cfg.label}
                            </span>
                          </div>

                          {/* Unread dot */}
                          {!n.isRead && (
                            <span
                              className={`absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                            />
                          )}

                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteOne(n._id);
                            }}
                            className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-100 text-slate-300 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100 text-center">
                <p className="text-xs font-bold text-slate-400">
                  Showing last {notifications.length} notification
                  {notifications.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
