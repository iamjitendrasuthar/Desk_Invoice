"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Menu, X, User, Settings, LogOut } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle Scroll Effect for Premium Sticky Navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 lg:pl-56 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* LEFT: Greeting (Desktop) & Brand (Mobile) */}
            <div className="flex items-center gap-3">
              {/* Mobile Only Logo (kuki sidebar mobile pe chhupa ho sakta hai) */}
              <div className="lg:hidden w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-extrabold text-lg tracking-wider">
                  JS
                </span>
              </div>

              {/* Desktop Greeting */}
              <div className="hidden lg:block">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Welcome back
                </p>
                <h2 className="text-xl font-extrabold text-slate-900 leading-none tracking-tight">
                  Jitendra Suthar
                </h2>
              </div>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button className="relative p-2.5 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100/50">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white" />
              </button>

              {/* Desktop User Profile */}
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-extrabold text-slate-900">
                    Jitendra
                  </p>
                  <p className="text-xs font-bold text-slate-400">Admin</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 hover:ring-4 hover:ring-indigo-500/10 transition-all cursor-pointer">
                  <User className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Mobile User/Settings Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2.5 bg-white text-slate-600 rounded-xl border border-slate-200 shadow-sm"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE USER MENU (Since links are gone, this shows profile options) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[72px] z-40 sm:hidden px-4"
          >
            <div className="bg-white/90 backdrop-blur-2xl border border-slate-200 rounded-3xl p-4 shadow-2xl flex flex-col gap-2">
              <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 mb-2">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-slate-900">
                    Jitendra Suthar
                  </p>
                  <p className="text-sm font-bold text-slate-500">Admin</p>
                </div>
              </div>

              <button className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors w-full text-left">
                <Settings className="w-5 h-5 text-slate-400" />
                Account Settings
              </button>

              <button className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors w-full text-left mt-1">
                <LogOut className="w-5 h-5 text-rose-400" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
