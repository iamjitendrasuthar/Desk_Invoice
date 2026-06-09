"use client";

import { Layers } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700/40 transition-colors duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 sm:px-8 py-3">
        {/* Left — Brand + Copyright */}
        <div className="flex items-center gap-2.5">
          <div className="w-[22px] h-[22px] rounded-md bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center rotate-6 shrink-0">
            <Layers className="w-3 h-3 text-[#006666] dark:text-slate-900 stroke-[2.5] -rotate-6" />
          </div>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Desk<span className="text-amber-500 font-medium">Invoice</span>
          </span>
          <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-700" />
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            © {year} All rights reserved.
          </span>
        </div>

        {/* Right — Status + Version + Links */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            All systems operational
          </span>
          <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-700" />
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600/60 px-2 py-0.5 rounded-md">
            v1.0.0
          </span>
          <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-700" />
          <Link
            href="/settings"
            className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Settings
          </Link>
          <Link
            href="/support"
            className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
