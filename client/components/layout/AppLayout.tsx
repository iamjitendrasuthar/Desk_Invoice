"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/authStore";
import NotificationToast from "../notifications/NotificationToast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { token, loadUser } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-[#F5F5F5] flex relative overflow-hidden">
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col w-full lg:pl-[300px] transition-all duration-300 ease-in-out overflow-y-auto h-screen">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 w-full max-w-full box-border">
          {children}
        </main>
      </div>

      {/* Global Alerts Portal */}
      <NotificationToast />
    </div>
  );
}
