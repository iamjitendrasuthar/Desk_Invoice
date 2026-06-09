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
  Truck,
  ChevronRight,
  Layers,
  ChevronLeft,
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
}

function SidebarContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col h-full w-[300px] bg-[#006666] dark:bg-slate-900 text-white lg:rounded-tr-[25px] lg:rounded-br-[25px] pb-6 relative overflow-hidden font-sans antialiased select-none border-r border-transparent dark:border-slate-700/50">
      {/* HEADER */}
      <div className="flex items-center justify-between pl-7 pr-6 pt-8 pb-6 border-b border-white/[0.300] dark:border-slate-700/60 mx-2">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          onClick={onClose}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm rotate-6">
            <Layers className="w-5 h-5 text-[#006666] dark:text-slate-900 stroke-[2.5] -rotate-6" />
          </div>
          <span className="block font-bold text-[24px] tracking-wide text-white leading-none">
            Desk<span className="text-amber-400 font-medium">Invoice</span>
          </span>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 dark:hover:bg-slate-700/50 rounded-xl transition-all"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5] ml-6" />
        </button>
      </div>

      {/* NAV */}
      <div className="flex-1 px-5 py-7 space-y-7 overflow-y-auto custom-scrollbar">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-3.5">
            <h3 className="px-3.5 text-[12px] font-bold tracking-[0.15em] text-white/50 dark:text-slate-500 uppercase">
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
                        ? "bg-white/[0.07] dark:bg-slate-700/60 text-white font-medium"
                        : "text-white/70 dark:text-slate-400 hover:text-white hover:bg-white/[0.04] dark:hover:bg-slate-700/40 dark:hover:text-slate-100",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] bg-amber-400 rounded-r-full" />
                    )}

                    <Icon
                      className={cn(
                        "w-[18px] h-[18px] shrink-0 stroke-[2.2]",
                        active
                          ? "text-white dark:text-slate-100"
                          : "text-white/55 dark:text-slate-500 group-hover:text-white dark:group-hover:text-slate-200",
                      )}
                    />

                    <span className="flex-1 tracking-wide font-medium text-[14.5px]">
                      {label}
                    </span>

                    {active && (
                      <span className="text-[11px] font-semibold bg-amber-400/15 text-amber-400 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className="hidden lg:flex flex-col w-[300px] fixed inset-y-0 left-0 z-30">
        <SidebarContent
          pathname={pathname}
          onClose={() => setMobileOpen(false)}
        />
      </aside>
      <aside
        className={cn(
          "lg:hidden flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out shadow-2xl h-full",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent
          pathname={pathname}
          onClose={() => setMobileOpen(false)}
        />
      </aside>
    </>
  );
}
