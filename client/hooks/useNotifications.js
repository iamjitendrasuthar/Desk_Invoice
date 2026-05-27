"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchNotifications,
  markOneRead as apiMarkOneRead,
  markAllRead as apiMarkAllRead,
  deleteNotification as apiDelete,
  clearReadNotifications as apiClearRead,
} from "@/services/notificationService";
import { useNotificationToastStore } from "@/store/notificationToastStore";

const POLL_INTERVAL = 5_000;

// ✅ Module level — saare hook instances share karenge
const toastedIds = new Set();
let isInitialLoadDone = false;
let audioCtxUnlocked = false;

const unlockAudio = () => {
  if (audioCtxUnlocked) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    audioCtxUnlocked = true;
  } catch (_) {}
};

const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
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
  } catch (_) {}
};

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const timerRef = useRef(null);
  const prevCountRef = useRef(null);

  const addToastRef = useRef(null);
  const { addToast } = useNotificationToastStore();

  useEffect(() => {
    addToastRef.current = addToast;
  }, [addToast]);

  // iOS audio unlock
  useEffect(() => {
    window.addEventListener("touchstart", unlockAudio, { once: true });
    window.addEventListener("click", unlockAudio, { once: true });
    return () => {
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("click", unlockAudio);
    };
  }, []);

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await fetchNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);

      if (!isInitialLoadDone) {
        // Initial load — seed karo, toast nahi
        data.notifications.forEach((n) => toastedIds.add(n._id));
        isInitialLoadDone = true;
      } else {
        // Polling — sirf naye IDs ka toast
        data.notifications.forEach((n) => {
          if (!toastedIds.has(n._id)) {
            toastedIds.add(n._id);
            addToastRef.current?.({
              type: n.type,
              title: n.title,
              message: n.message,
              duration: 4000,
            });
          }
        });
      }

      if (
        silent &&
        prevCountRef.current !== null &&
        data.unreadCount > prevCountRef.current
      ) {
        playNotificationSound();
      }
      prevCountRef.current = data.unreadCount;
    } catch (err) {
      console.error("load error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    timerRef.current = setInterval(() => load(true), POLL_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [load]);

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

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    prevCountRef.current = 0;
    await apiMarkAllRead();
  }, []);

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
