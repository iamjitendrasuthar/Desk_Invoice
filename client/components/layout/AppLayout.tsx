"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/authStore";

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
      <Sidebar />
      <main className="lg:pl-56 pt-[66px] lg:pt-0">
        <div className="min-h-screen p-4">{children}</div>
      </main>
    </div>
  );
}
