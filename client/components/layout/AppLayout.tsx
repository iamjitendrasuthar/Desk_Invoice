"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/authStore";
import NotificationToast from "../notifications/NotificationToast";
import { ThemeContext, useThemeState } from "@/hooks/useTheme";
import Footer from "./Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { token, loadUser, logout } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const themeState = useThemeState();

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
    <ThemeContext.Provider value={themeState}>
      <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0f172a] flex relative overflow-hidden transition-colors duration-200">
        <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col w-full lg:pl-[300px] transition-all duration-300 ease-in-out overflow-y-auto h-screen">
          <Navbar onMenuToggle={() => setSidebarOpen(true)} logout={logout} />
          <main className="flex-1 w-full max-w-full box-border">
            {children}
          </main>
          <Footer />
        </div>
        <NotificationToast />
      </div>
    </ThemeContext.Provider>
  );
}
