"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Truck,
  ChevronRight,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import NotificationBell from "@/components/notifications/NotificationBell";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/products", icon: Package, label: "Products" },
  { href: "/customers", icon: Users, label: "Customers" },
  { href: "/billing", icon: FileText, label: "Billing" },
  { href: "/sales", icon: BarChart3, label: "Sales" },
  { href: "/suppliers", icon: Truck, label: "Suppliers" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/90 backdrop-blur-3xl pb-8">
      {/* --- Logo + Mobile Close --- */}
      <div className="flex items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="block font-extrabold text-xl tracking-tight text-slate-900 leading-none">
              Desk Invoice
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-indigo-500 mt-1">
              Admin Dashboard
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2.5 -mr-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* --- Nav Links --- */}
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm transition-all duration-300 group relative",
                active
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-bold shadow-[0_4px_15px_rgba(99,102,241,0.05)] border border-indigo-100/50"
                  : "text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-50 hover:scale-[1.02]",
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              )}
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  active
                    ? "text-indigo-600"
                    : "text-slate-400 group-hover:text-indigo-500",
                )}
              />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-4 h-4 text-indigo-400" />}
            </Link>
          );
        })}
      </nav>

      {/* --- User Profile & Logout --- */}
      <div className="p-4 mt-auto">
        <div className="bg-slate-50/80 border border-slate-100/80 rounded-3xl p-4 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 font-extrabold text-sm shadow-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || "J"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-slate-900 truncate">
                {user?.name || "Admin User"}
              </p>
              <p className="text-xs font-bold text-slate-400 capitalize mt-0.5">
                {user?.role || "Management"}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 bg-white border border-rose-100 shadow-sm hover:bg-rose-50 hover:border-rose-200 transition-all duration-300 active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── MOBILE TOP BAR ── */}
      {!mobileOpen && (
        <div className="lg:hidden fixed top-0 inset-x-0 w-full z-50 bg-white/85 backdrop-blur-2xl border-b border-slate-200/60 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
          {/* Left — Logo + Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <span className="text-white font-extrabold text-sm tracking-wider">
                JS
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                Studio Portal
              </p>
              <h2 className="text-sm font-extrabold text-slate-900 leading-none">
                {user?.name || "Admin"}
              </h2>
            </div>
          </div>

          {/* Right — Bell + Hamburger */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-200/60 shadow-sm hover:bg-white hover:text-indigo-600 transition-all active:scale-95"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-transparent border-r border-slate-200/60 fixed inset-y-0 left-0 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar (right side) */}
      <aside
        className={cn(
          "lg:hidden flex flex-col w-[85%] max-w-sm bg-white fixed inset-y-0 right-0 z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[-10px_0_40px_rgba(0,0,0,0.08)]",
          mobileOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
