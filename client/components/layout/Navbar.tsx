"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, Moon, Sun, User, Mail, LogOut, ChevronDown } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

interface NavbarProps {
  onMenuToggle?: () => void;
  logout?: () => void;
}

export default function Navbar({ onMenuToggle, logout }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuthStore();

  const displayName = user?.name || "User";
  const displayRole = user?.role?.replace(/_/g, " ") || "User";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const actionBtnClass =
    "w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 rounded-full hover:border-slate-300 dark:hover:border-slate-600 transition-colors";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="sticky top-0 z-40 w-full bg-[#F5F5F5] dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 transition-colors duration-200"
    >
      <div className="px-6 py-4 flex items-center justify-between gap-4 w-full">
        {/* Left — greeting */}
        <div className="hidden sm:flex flex-col">
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Welcome {displayName} <span className="text-amber-400">👋</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Here's what's happening with your store today.
          </p>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="sm:hidden p-2 text-slate-500 dark:text-slate-400"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Right — actions */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={actionBtnClass}
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-[18px] h-[18px] text-amber-400" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
          </button>

          <div className={cn(actionBtnClass, "relative")}>
            <NotificationBell className="w-6 h-6" />
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="flex items-center gap-2 pl-2 outline-none">
              {/* Avatar — initials fallback */}
              <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-[#007676]/10 dark:bg-[#007676]/20 flex items-center justify-center text-[#007676] font-extrabold text-sm shrink-0">
                {avatarInitial}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-none">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                  {displayRole}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
              className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 w-56 mt-2 mr-6 shadow-lg"
              sideOffset={5}
            >
              {/* User info header */}
              <div className="px-3 py-2.5 mb-1 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-400 capitalize mt-0.5">
                  {displayRole}
                </p>
              </div>

              <Link href="/settings">
                <DropdownMenu.Item className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer text-slate-600 dark:text-slate-300 text-sm outline-none">
                  <User className="w-4 h-4" /> My Profile
                </DropdownMenu.Item>
              </Link>

              <Link href="/notifications">
                <DropdownMenu.Item className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer text-slate-600 dark:text-slate-300 text-sm outline-none">
                  <Mail className="w-4 h-4" /> Inbox
                </DropdownMenu.Item>
              </Link>

              <div className="my-2 border-t border-slate-100 dark:border-slate-700" />

              <DropdownMenu.Item
                onClick={logout}
                className="flex items-center justify-center p-3 text-emerald-800 dark:text-emerald-400 font-medium border border-emerald-600 dark:border-emerald-700 rounded-full cursor-pointer text-sm mt-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 outline-none"
              >
                <LogOut className="w-4 h-4 mr-2" /> Log Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </motion.div>
  );
}
