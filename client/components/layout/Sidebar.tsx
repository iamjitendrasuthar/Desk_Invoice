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
  X,
  Truck,
  ChevronRight,
  Layers,
  Grid,
} from "lucide-react";

const navigationGroups = [
  {
    title: "GENERAL",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/products", icon: Package, label: "Products" },
      { href: "/customers", icon: Users, label: "Customers" },
    ],
  },
  {
    title: "APPLICATIONS",
    items: [
      { href: "/billing", icon: FileText, label: "Billing" },
      { href: "/sales", icon: BarChart3, label: "Sales" },
      { href: "/suppliers", icon: Truck, label: "Suppliers" },
      { href: "/settings", icon: Settings, label: "Settings" },
    ],
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  user?: { name?: string; role?: string } | null;
  logout?: () => void;
}

// ─── INTERNAL WRAPPER FOR CONTENT REUSE ───
function SidebarContent({
  pathname,
  onClose,
  user,
  logout,
}: {
  pathname: string;
  onClose: () => void;
  user: any;
  logout: any;
}) {
  return (
    <div className="flex flex-col h-full w-[300px] bg-[#006666] text-white lg:rounded-tr-[25px] lg:rounded-br-[25px] pb-6 relative overflow-hidden font-sans antialiased select-none">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between pl-7 pr-6 pt-8 pb-6 border-b border-white/[0.06] mx-2">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          onClick={onClose}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm rotate-6">
            <Layers className="w-5 h-5 text-[#006666] stroke-[2.5] -rotate-6" />
          </div>
          <div>
            <span className="block font-bold text-[24px] tracking-wide text-white leading-none">
              Desk<span className="text-amber-400 font-medium">Invoice</span>
            </span>
          </div>
        </Link>

        {/* Desktop Grid Button */}
        <div className="hidden lg:flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer p-1.5 hover:bg-white/5 rounded-lg">
          <Grid className="w-[18px] h-[18px] stroke-[2.2]" />
        </div>

        {/* Mobile Close Button (image_e679da.png ke cross mark ko handle karne ke liye) */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* NAVIGATION INDICATORS */}
      <div className="flex-1 px-5 py-7 space-y-7 overflow-y-auto custom-scrollbar">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-3.5">
            <h3 className="px-3.5 text-[12px] font-bold tracking-[0.15em] text-white/50 uppercase">
              {group.title}
            </h3>

            <nav className="space-y-1.5">
              {group.items.map(({ href, icon: Icon, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-150 group relative text-[15px]",
                      active
                        ? "bg-[#1f7a7a] text-white font-medium shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                        : "text-white/80 font-normal hover:text-white hover:bg-white/[0.04]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-[18px] h-[18px] shrink-0 transition-colors stroke-[2.2]",
                        active
                          ? "text-white"
                          : "text-white/60 group-hover:text-white",
                      )}
                    />
                    <span className="flex-1 tracking-wide font-medium text-[14.5px]">
                      {label}
                    </span>
                    {active ? (
                      <ChevronRight className="w-4 h-4 text-white/70 rotate-90 transition-transform stroke-[2.5]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-all stroke-[2.5]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* CAPSULE PROFILE */}
      <div className="px-5 mt-auto">
        <div className="bg-[#004d4e]/60 border border-white/5 rounded-2xl p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3.5 mb-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-amber-400 font-bold text-base shrink-0">
              {user?.name?.[0]?.toUpperCase() || "J"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {user?.name || "Admin User"}
              </p>
              <p className="text-[11px] font-medium text-white/40 capitalize mt-0.5">
                {user?.role || "Management"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-150 active:scale-[0.98]"
          >
            <LogOut className="w-[14px] h-[14px]" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT SIDEBAR ENTRY ───
export default function Sidebar({
  mobileOpen,
  setMobileOpen,
  user,
  logout,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── DESKTOP LEFT SIDEBAR ─── */}
      <aside className="hidden lg:flex flex-col w-[300px] fixed inset-y-0 left-0 z-30 bg-transparent">
        <SidebarContent
          pathname={pathname}
          onClose={() => setMobileOpen(false)}
          user={user}
          logout={logout}
        />
      </aside>

      {/* ─── MOBILE DRAWER PANEL SLIDE-IN (Left view setup) ─── */}
      <aside
        className={cn(
          "lg:hidden flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out shadow-2xl h-full",
          mobileOpen ? "translate-x-0" : "-translate-x-full", // Left drawer movement fix
        )}
      >
        <SidebarContent
          pathname={pathname}
          onClose={() => setMobileOpen(false)}
          user={user}
          logout={logout}
        />
      </aside>
    </>
  );
}
