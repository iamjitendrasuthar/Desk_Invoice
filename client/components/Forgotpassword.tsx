"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
} from "lucide-react";
import {
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword,
} from "@/services/settingsService";

type Step = "email" | "otp" | "reset" | "done";

interface Props {
  open: boolean;
  onClose: () => void;
}

const inputCls =
  "w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#006666]/40 focus:ring-4 focus:ring-[#006666]/8 outline-none transition-all placeholder:font-normal placeholder:text-slate-400";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function ForgotPasswordModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Resend cooldown timer
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // OTP input refs
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state on open/close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("email");
        setEmail("");
        setOtp(Array(OTP_LENGTH).fill(""));
        setResetToken("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setDevOtp(null);
        setResendTimer(0);
        if (timerRef.current) clearInterval(timerRef.current);
      }, 300);
    }
  }, [open]);

  const startResendTimer = () => {
    setResendTimer(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await sendForgotPasswordOTP(email.trim());
      if (res.devOtp) setDevOtp(res.devOtp); // dev only
      setStep("otp");
      startResendTimer();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    setError("");
    const otpValue = otp.join("");
    if (otpValue.length < OTP_LENGTH) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyForgotPasswordOTP(email.trim(), otpValue);
      setResetToken(res.resetToken);
      setStep("reset");
    } catch (err: any) {
      setError(err.message);
      // OTP wrong hone par fields clear karo
      setOtp(Array(OTP_LENGTH).fill(""));
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError("");
    setOtp(Array(OTP_LENGTH).fill(""));
    setDevOtp(null);
    setLoading(true);
    try {
      const res = await sendForgotPasswordOTP(email.trim());
      if (res.devOtp) setDevOtp(res.devOtp);
      startResendTimer();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ──────────────────────────────────────────────────
  const handleResetPassword = async () => {
    setError("");
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim(), resetToken, newPassword);
      setStep("done");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Input handlers ──────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // sirf numbers
    const updated = [...otp];
    updated[index] = value.slice(-1); // single digit
    setOtp(updated);
    if (error) setError("");
    // Auto-focus next
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && otp.join("").length === OTP_LENGTH) {
      handleVerifyOTP();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const updated = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      updated[i] = char;
    });
    setOtp(updated);
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-8 pt-8 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {step === "email" && "Reset Password"}
                    {step === "otp" && "Verify OTP"}
                    {step === "reset" && "New Password"}
                    {step === "done" && "All Done!"}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {step === "email" && "Enter your registered email"}
                    {step === "otp" && `OTP sent to ${email}`}
                    {step === "reset" && "Choose a strong new password"}
                    {step === "done" && "Your password has been updated"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step indicator */}
              {step !== "done" && (
                <div className="flex items-center gap-1.5 px-8 pb-4">
                  {(["email", "otp", "reset"] as Step[]).map((s, i) => (
                    <div
                      key={s}
                      className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                        step === s
                          ? "bg-[#006666]"
                          : ["email", "otp", "reset"].indexOf(step) > i
                            ? "bg-[#006666]/40"
                            : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Body */}
              <div className="px-8 pb-8 space-y-4">
                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm font-medium flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── STEP 1: Email ── */}
                {step === "email" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                        autoFocus
                        className={`${inputCls} pl-11`}
                        placeholder="you@example.com"
                      />
                    </div>
                    <button
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="w-full bg-[#006666] text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-[#005555] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Send OTP <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {/* ── STEP 2: OTP ── */}
                {step === "otp" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    {/* OTP boxes */}
                    <div
                      className="flex gap-2 justify-between"
                      onPaste={handleOtpPaste}
                    >
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            otpRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          autoFocus={i === 0}
                          className={`w-12 h-14 text-center text-xl font-bold border rounded-2xl outline-none transition-all bg-slate-50 focus:bg-white ${
                            digit
                              ? "border-[#006666] text-[#006666]"
                              : "border-slate-200 text-slate-800"
                          } focus:border-[#006666]/60 focus:ring-4 focus:ring-[#006666]/10`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.join("").length < OTP_LENGTH}
                      className="w-full bg-[#006666] text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-[#005555] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Verify OTP <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Resend */}
                    <div className="text-center">
                      <button
                        onClick={handleResend}
                        disabled={resendTimer > 0 || loading}
                        className="text-xs font-bold text-slate-400 hover:text-[#006666] transition-colors disabled:cursor-not-allowed flex items-center gap-1.5 mx-auto"
                      >
                        <RotateCcw className="w-3 h-3" />
                        {resendTimer > 0
                          ? `Resend OTP in ${resendTimer}s`
                          : "Resend OTP"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 3: New Password ── */}
                {step === "reset" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    {/* New Password */}
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (error) setError("");
                        }}
                        autoFocus
                        className={`${inputCls} pr-11`}
                        placeholder="New password"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showNew ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError("");
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleResetPassword()
                        }
                        className={`${inputCls} pr-11`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Password strength hint */}
                    {newPassword.length > 0 && newPassword.length < 6 && (
                      <p className="text-xs text-amber-500 font-medium">
                        At least 6 characters required
                      </p>
                    )}

                    <button
                      onClick={handleResetPassword}
                      disabled={loading}
                      className="w-full bg-[#006666] text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-[#005555] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Reset Password <KeyRound className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {/* ── STEP 4: Done ── */}
                {step === "done" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-5 py-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-base">
                        Password updated!
                      </p>
                      <p className="text-sm text-slate-400 mt-1 font-medium">
                        You can now log in with your new password.
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-full bg-[#006666] text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-[#005555] transition-all"
                    >
                      Back to Login
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
