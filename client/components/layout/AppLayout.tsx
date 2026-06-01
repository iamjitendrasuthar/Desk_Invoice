"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/authStore";
import NotificationBell from "@/components/notifications/NotificationBell";
import NotificationToast from "../notifications/NotificationToast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { token, loadUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (token === null && typeof window !== "undefined") {
      const stored = localStorage.getItem("token");
      if (!stored) router.push("/login");
    }
  }, [token, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop-only header — mobile mein Sidebar ka top bar use hoga */}
      <header className="hidden lg:flex fixed top-0 right-0 left-72 h-[66px] bg-white/80 backdrop-blur-md border-b border-slate-100 z-30 items-center justify-end px-6">
        <NotificationBell />
      </header>
      <Sidebar />
      <main className="lg:pl-72 pt-[25px]">
        <div className="min-h-screen p-4">{children}</div>
      </main>{" "}
      <NotificationToast />
    </div>
  );
}
