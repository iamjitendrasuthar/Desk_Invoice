"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
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

// Framer Motion Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState("admin@jsinteriors.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please try again.",
      );
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden">
      {/* Ambient Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-purple-400/20 blur-[140px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Brand Header */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-6 shadow-xl shadow-indigo-500/30">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            JS Interiors
          </h1>
          <p className="text-slate-500 font-medium mt-2 tracking-wide uppercase text-xs">
            Studio Management Portal
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 sm:p-10 relative overflow-hidden"
        >
          {/* Subtle Card Glare Effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-transparent" />

          <h2 className="text-xl font-extrabold text-slate-900 mb-6">
            Welcome back
          </h2>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-sm font-bold flex items-start gap-3 overflow-hidden"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all placeholder:text-slate-400 placeholder:font-medium"
                  placeholder="admin@jsinteriors.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all placeholder:text-slate-400 placeholder:font-medium"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-300 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer Text */}
        <motion.div variants={itemVariants} className="text-center mt-8">
          <p className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/50 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Online • v2.0.4
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
