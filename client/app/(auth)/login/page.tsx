"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Layers, ArrowRight, AlertCircle, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import ForgotPasswordModal from "@/components/Forgotpassword";

// ─── Toast Component — Pure CSS, no Framer Motion ─────────────────────────────
function ErrorToast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const DURATION = 2000;
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Slide in after first paint
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Progress bar countdown
  useEffect(() => {
    startRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onCloseRef.current();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? "0px" : "-30px"})`,
        opacity: visible ? 1 : 0,
        transition:
          "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease",
        zIndex: 9999,
        width: "100%",
        maxWidth: "400px",
        padding: "0 16px",
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #fecdd3",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(244,63,94,0.12)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: "2px",
            }}
          >
            <AlertCircle size={16} color="#f43f5e" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: "10px",
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "2px",
              }}
            >
              Login Failed
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: 600,
                color: "#1e293b",
                lineHeight: 1.4,
              }}
            >
              {message}
            </p>
          </div>
          <button
            onClick={() => onCloseRef.current()}
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "8px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              flexShrink: 0,
              marginTop: "2px",
              padding: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>
        <div style={{ height: "3px", background: "#fff1f2" }}>
          <div
            style={{
              height: "100%",
              background: "#f43f5e",
              width: `${progress}%`,
              transition: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Login Page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [toastKey, setToastKey] = useState(0);
  const [forgotOpen, setForgotOpen] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const showError = (msg: string) => {
    setError(msg);
    setToastKey((k) => k + 1);
  };

  const handleSubmit = async () => {
    setError("");

    if (!email.trim()) {
      showError("Please enter your email address.");
      return;
    }
    if (!password) {
      showError("Please enter your password.");
      return;
    }

    try {
      await login(email.trim(), password);
      router.push("/dashboard");
    } catch (err: any) {
      showError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <>
      {/* ── Toast ── */}
      {error && (
        <ErrorToast
          key={toastKey}
          message={error}
          onClose={() => setError("")}
        />
      )}

      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center pt-15 p-4 font-sans antialiased">
        {/* Decorative Background */}
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
            <div className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  autoComplete="email"
                  spellCheck={false}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#006666]/30 focus:ring-4 focus:ring-[#006666]/5 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="text-[10px] font-bold text-[#006666] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    autoComplete="current-password"
                    className="w-full px-5 py-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#006666]/30 focus:ring-4 focus:ring-[#006666]/5 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-[#006666] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#005555] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#006666]/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Continue to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-slate-400 text-[10px] font-bold mt-8 uppercase tracking-[0.3em]">
            Secured by JS DeskInvoice
          </p>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
      />
    </>
  );
}
