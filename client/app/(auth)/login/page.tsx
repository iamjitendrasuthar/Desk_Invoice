"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Layers,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@jsinteriors.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center pt-15 p-4 font-sans antialiased">
      {" "}
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#006666]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[100px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] z-10"
      >
        {/* Brand Header */}
        <div className="mb-10 text-center">
          <div className="w-16 h-16 rounded-[2rem] bg-white mx-auto flex items-center justify-center border border-slate-200 shadow-xl shadow-black/5 mb-6">
            <Layers className="w-8 h-8 text-[#006666]" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Desk<span className="text-[#006666]">Invoice</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium tracking-wide">
            Enterprise Billing Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await login(email, password);
                router.push("/dashboard");
              } catch {
                setError("Authentication failed");
              }
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#006666]/30 focus:ring-4 focus:ring-[#006666]/5 outline-none transition-all"
                placeholder="admin@jsinteriors.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[10px] font-bold text-[#006666] hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#006666]/30 focus:ring-4 focus:ring-[#006666]/5 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#006666] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#005555] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#006666]/20"
            >
              {isLoading ? "Signing in..." : "Continue to Dashboard"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-[10px] font-bold mt-8 uppercase tracking-[0.3em]">
          Secured by JS DeskInvoice
        </p>
      </motion.div>
    </div>
  );
}
