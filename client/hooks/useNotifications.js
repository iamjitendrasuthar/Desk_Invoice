"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchNotifications,
  markOneRead as apiMarkOneRead,
  markAllRead as apiMarkAllRead,
  deleteNotification as apiDelete,
  clearReadNotifications as apiClearRead,
} from "@/services/notificationService";

const POLL_INTERVAL = 5_000; // 5 seconds

// 🔔 Web Audio API se ding sound generate karo (no external file needed)
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Pehla tone — high ding
    const o1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    o1.connect(g1);
    g1.connect(ctx.destination);
    o1.type = "sine";
    o1.frequency.setValueAtTime(880, ctx.currentTime);
    o1.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);
    g1.gain.setValueAtTime(0.3, ctx.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o1.start(ctx.currentTime);
    o1.stop(ctx.currentTime + 0.4);

    // Doosra tone — low ding (slight delay)
    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    o2.connect(g2);
    g2.connect(ctx.destination);
    o2.type = "sine";
    o2.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    o2.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    g2.gain.setValueAtTime(0.2, ctx.currentTime + 0.1);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o2.start(ctx.currentTime + 0.1);
    o2.stop(ctx.currentTime + 0.5);
  } catch (_) {
    // Sound supported nahi hai toh silently ignore
  }
};
/** @typedef {import("@/types/notification").Notification} AppNotification */

export function useNotifications() {
  /** @type {[AppNotification[], React.Dispatch<React.SetStateAction<AppNotification[]>>]} */
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const prevCountRef = useRef(null); // pichla unread count track karo

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await fetchNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);

      // 🔔 Sound: sirf tab bajao jab naya notification aaya ho (polling ke time)
      // prevCountRef.current === null matlab initial load hai — sound mat bajao
      if (
        silent &&
        prevCountRef.current !== null &&
        data.unreadCount > prevCountRef.current
      ) {
        playNotificationSound();
      }
      prevCountRef.current = data.unreadCount;
    } catch (_) {
      // silently fail on poll errors
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    load();
    timerRef.current = setInterval(() => load(true), POLL_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [load]);

  // Mark one read
  const markOneRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => {
      const next = Math.max(0, c - 1);
      prevCountRef.current = next;
      return next;
    });
    await apiMarkOneRead(id);
  }, []);

  // Mark all read
  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    prevCountRef.current = 0;
    await apiMarkAllRead();
  }, []);

  // Delete one
  const deleteOne = useCallback(
    async (id) => {
      const target = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (target && !target.isRead) {
        setUnreadCount((c) => {
          const next = Math.max(0, c - 1);
          prevCountRef.current = next;
          return next;
        });
      }
      await apiDelete(id);
    },
    [notifications],
  );

  // Clear all read
  const clearRead = useCallback(async () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));
    await apiClearRead();
  }, []);

  const toggleOpen = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  return {
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
    refresh: load,
  };
}
