"use client";

import { Layers } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700/40 transition-colors duration-200">
      <div className="flex items-center justify-center gap-3 px-6 py-4">
        <div className="w-[26px] h-[26px] rounded-md bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center rotate-6 shrink-0">
          <Layers className="w-3.5 h-3.5 text-[#006666] dark:text-slate-900 stroke-[2.5] -rotate-6" />
        </div>
        <span className="text-base font-bold text-slate-700 dark:text-slate-300">
          Desk<span className="text-amber-500 font-medium">Invoice</span>
        </span>
        <span className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
          © {year} All rights reserved.
        </span>
      </div>
    </footer>
  );
}
