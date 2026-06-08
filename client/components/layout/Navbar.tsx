"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  Star,
  Moon,
  Search,
  User,
  Mail,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface NavbarProps {
  onMenuToggle?: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  // Shared classes: removed shadows, used thin borders
  const actionBtnClass =
    "w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-full hover:border-slate-300 transition-colors";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="sticky top-0 z-40 w-full bg-[#F5F5F5] border-b border-slate-200"
    >
      <div className="px-6 py-4 flex items-center justify-between gap-4 w-full">
        {/* LEFT: Greeting */}
        <div className="hidden sm:flex flex-col">
          <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            Welcome Alex <span className="text-amber-400">👋</span>
          </h1>
          <p className="text-sm text-slate-500">
            Here's what's happening with your store today.
          </p>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button onClick={onMenuToggle} className="sm:hidden p-2 text-slate-500">
          <Menu className="w-6 h-6" />
        </button>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-3">
    

          <button className={actionBtnClass}>
            <Moon className="w-6 h-6" />
          </button>
          <div className={cn(actionBtnClass, "relative")}>
            <NotificationBell className="w-6 h-6" />
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="flex items-center gap-2 pl-2 outline-none">
              <img
                src={`/invoice.png`}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-slate-800 leading-none">
                  Alex Mora
                </p>
                <p className="text-[11px] text-slate-500">Admin</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </DropdownMenu.Trigger>

            {/* Dropdown Content - No shadow, thin border */}
            <DropdownMenu.Content
              className="bg-white p-2 rounded-2xl border border-slate-200 w-56 mt-2 mr-6"
              sideOffset={5}
            >
              <DropdownMenu.Item className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer text-slate-600 text-sm">
                <User className="w-4 h-4" /> My Profile
              </DropdownMenu.Item>
              <DropdownMenu.Item className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer text-slate-600 text-sm">
                <Mail className="w-4 h-4" /> Inbox
              </DropdownMenu.Item>
              <DropdownMenu.Item className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer text-slate-600 text-sm">
                <Settings className="w-4 h-4" /> Settings
              </DropdownMenu.Item>

              <div className="my-2 border-t border-slate-100" />

              <DropdownMenu.Item className="flex items-center justify-center p-3 text-emerald-800 font-medium border border-emerald-600 rounded-full cursor-pointer text-sm mt-2 hover:bg-emerald-50">
                <LogOut className="w-4 h-4 mr-2" /> Log Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </motion.div>
  );
}
