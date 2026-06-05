
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, Star, Moon, Search } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onMenuToggle?: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const scrollEl = document.querySelector(".scroll-container");

    const handleScroll = () => {
      setIsScrolled((scrollEl?.scrollTop ?? window.scrollY) > 10);
    };

    const target = scrollEl ?? window;
    target.addEventListener("scroll", handleScroll);
    return () => target.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300 select-none font-sans",
        isScrolled
          ? "bg-[#F5F5F5] backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)]"
          : "bg-[#F5F5F5] border-b border-transparent",
      )}
    >
      <div className="px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-between gap-4 w-full">
        {/* ─── DESKTOP LEFT: SIMPLE CLEAN TEXT ─── */}
        <div className="hidden sm:flex flex-col text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            Welcome Alex{" "}
            <span className="text-amber-400 animate-bounce">👋</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">
            Here's what's happening with your store today.
          </p>
        </div>

        {/* ─── MOBILE LEFT: MENU TOGGLE & SEPARATOR ─── */}
        <div className="flex sm:hidden items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 text-slate-500 hover:text-slate-900 active:scale-95 transition-all rounded-xl hover:bg-slate-100"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="w-px h-4 bg-slate-200" />
        </div>

        {/* ─── RIGHT CONTROLS: ACTION STRIP ─── */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 ml-auto sm:ml-0">
          {/* Plain Search Field */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="w-60 xl:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors shadow-xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Mobile Search Action Circle */}
          <button className="flex md:hidden w-8.5 h-8.5 items-center justify-center bg-white border border-slate-200 text-slate-500 rounded-xl hover:text-slate-900 active:scale-95 transition-all shadow-xs">
            <Search className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Star Button */}
          <button className="w-8.5 h-8.5 sm:w-9 sm:h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-xl active:scale-95 transition-all shadow-xs">
            <Star className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Theme Transition Switch */}
          <button className="w-8.5 h-8.5 sm:w-9 sm:h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-xl active:scale-95 transition-all shadow-xs">
            <Moon className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Notification Button Shell Override */}
          <div className="text-slate-500 [&_button]:bg-white [&_button]:border [&_button]:border-slate-200 [&_button]:rounded-xl [&_button]:w-8.5 [&_button]:h-8.5 sm:[&_button]:w-9 sm:[&_button]:h-9 [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:shadow-xs hover:[&_button]:text-slate-900">
            <NotificationBell />
          </div>

          <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block" />

          {/* ─── IDENTITY NODE PROFILE VALUE ─── */}
          <div className="flex items-center gap-2.5 pl-1 shrink-0">
            <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl overflow-hidden ring-1 ring-slate-200 shrink-0">
              <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold tracking-wider">
                AM
              </div>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-none">
                Alex Mora
              </p>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
