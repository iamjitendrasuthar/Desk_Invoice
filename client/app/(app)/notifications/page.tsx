"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  IndianRupee,
  PackageX,
  Trash2,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  BellOff,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification as AppNotification } from "@/types/notification";

// ── Config ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

const TYPE_CONFIG = {
  customer_added: {
    icon: UserPlus,
    bg: "bg-sky-100 dark:bg-sky-900/40",
    text: "text-sky-600 dark:text-sky-400",
    badge:
      "bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-sky-100 dark:border-sky-800",
    label: "Customer",
  },
  payment_received: {
    icon: IndianRupee,
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    text: "text-emerald-600 dark:text-emerald-400",
    badge:
      "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
    label: "Payment",
  },
  low_stock: {
    icon: PackageX,
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-600 dark:text-amber-400",
    badge:
      "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800",
    label: "Stock",
  },
};

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "customer_added", label: "Customers" },
  { id: "payment_received", label: "Payments" },
  { id: "low_stock", label: "Stock" },
];

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
    year: "numeric",
  });
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api
      .get("/notifications")
      .then((res) => setNotifications(res.data?.data || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Reset page on filter / search change
  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  // ── API Actions ────────────────────────────────────────────────────────
  const markOneRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error("markOneRead error:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
    } catch (err) {
      console.error("markAllRead error:", err);
    } finally {
      // Always update UI even if API fails
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const deleteOne = async (id: string) => {
    // Optimistic UI — remove immediately
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await api.delete(`/notifications/${id}`);
    } catch (err) {
      console.error("deleteOne error:", err);
      // Rollback on failure — refetch
      api
        .get("/notifications")
        .then((res) => setNotifications(res.data?.data || res.data || []))
        .catch(console.error);
    }
  };

  const clearReadNotifications = async () => {
    try {
      await api.delete("/notifications/clear-read");
      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (err) {
      console.error("clearRead error:", err);
    }
  };

  // ── Filtering ──────────────────────────────────────────────────────────
  const filtered = notifications.filter((n) => {
    const matchFilter =
      filter === "all"
        ? true
        : filter === "unread"
          ? !n.isRead
          : n.type === filter;
    const matchSearch =
      search.trim() === ""
        ? true
        : n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.message.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[75vh] bg-[#F5F5F5] dark:bg-[#0f172a]">
          <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-slate-200 dark:border-slate-600 border-t-[#007676] rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0f172a] text-[#334155] dark:text-slate-300 antialiased pb-16 font-sans transition-colors duration-200">
        <div className="w-full mx-auto px-4 sm:px-8 py-6 space-y-5">
          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1e293b] dark:text-white">
                Notifications
              </h1>
              <p className="hidden sm:block text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                All activity alerts across your store — customers, payments, and
                stock.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span>🏠</span>
              <span>/</span>
              <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
                Dashboard
              </span>
              <span>/</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                Notifications
              </span>
            </div>
          </div>

          {/* ── Toolbar ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-lg p-1 shadow-sm flex-wrap">
              {FILTER_TABS.map((tab) => {
                const count =
                  tab.id === "all"
                    ? notifications.length
                    : tab.id === "unread"
                      ? notifications.filter((n) => !n.isRead).length
                      : notifications.filter((n) => n.type === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-150 flex items-center gap-1.5",
                      filter === tab.id
                        ? "bg-[#007676] text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50",
                    )}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span
                        className={cn(
                          "text-[10px] font-black px-1.5 py-0.5 rounded-full",
                          filter === tab.id
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search + Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notifications..."
                  className="w-full sm:w-56 pl-8 pr-3 py-2 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-lg text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 shadow-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Mark all read — only when unread exist */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#007676] dark:text-teal-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm whitespace-nowrap"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}

              {/* Clear read — only when read notifications exist */}
              {readCount > 0 && (
                <button
                  onClick={clearReadNotifications}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-500 dark:text-rose-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 dark:hover:border-rose-800 transition-colors shadow-sm whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear read
                </button>
              )}
            </div>
          </div>

          {/* ── Main Card ── */}
          <div className="bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 rounded-lg shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-[2fr_3fr_1fr_1fr_80px] gap-4 px-6 py-3.5 bg-[#f8fafc] dark:bg-slate-700/40 border-b border-slate-100 dark:border-slate-700/60">
              {["Type", "Notification", "Status", "Time", ""].map((h) => (
                <span
                  key={h}
                  className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 dark:text-slate-500">
                <BellOff className="w-10 h-10 opacity-30" />
                <p className="text-sm font-medium">No notifications found</p>
                {(filter !== "all" || search) && (
                  <button
                    onClick={() => {
                      setFilter("all");
                      setSearch("");
                    }}
                    className="text-xs font-bold text-[#007676] dark:text-teal-400 hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {paginated.map((n, i) => {
                  const cfg =
                    // @ts-ignore
                    TYPE_CONFIG[n.type] ?? TYPE_CONFIG.customer_added;
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={n._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15, delay: i * 0.02 }}
                      className={cn(
                        "grid grid-cols-1 sm:grid-cols-[2fr_3fr_1fr_1fr_80px] gap-3 sm:gap-4 items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700/40 last:border-0 transition-colors cursor-pointer group",
                        !n.isRead
                          ? "bg-indigo-50/20 dark:bg-indigo-900/5 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10"
                          : "hover:bg-slate-50/60 dark:hover:bg-slate-700/30",
                      )}
                      onClick={() => !n.isRead && markOneRead(n._id)}
                    >
                      {/* Type */}
                      <div className="flex items-center gap-3">
                        {!n.isRead ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 shrink-0" />
                        )}
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                            cfg.bg,
                            cfg.text,
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span
                          className={cn(
                            "text-[11px] font-bold px-2 py-0.5 rounded-md border",
                            cfg.badge,
                          )}
                        >
                          {cfg.label}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 pl-5 sm:pl-0">
                        <p className="text-sm font-bold text-[#0f172a] dark:text-slate-100 truncate">
                          {n.title}
                        </p>
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                          {n.message}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="pl-5 sm:pl-0">
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2.5 py-1 rounded-md border inline-block",
                            n.isRead
                              ? "bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-600"
                              : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800",
                          )}
                        >
                          {n.isRead ? "Read" : "Unread"}
                        </span>
                      </div>

                      {/* Time */}
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 pl-5 sm:pl-0">
                        {timeAgo(n.createdAt)}
                      </p>

                      {/* Delete */}
                      <div className="flex justify-end pl-5 sm:pl-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteOne(n._id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  {filtered.length}
                </span>{" "}
                notifications
              </p>

              <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                  )
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                      acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 text-xs text-slate-400 dark:text-slate-500"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={cn(
                          "w-8 h-8 text-xs font-bold rounded-lg transition-all border shadow-sm",
                          page === p
                            ? "bg-[#007676] text-white border-[#007676]"
                            : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/50",
                        )}
                      >
                        {p}
                      </button>
                    ),
                  )}

                {/* Next */}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
