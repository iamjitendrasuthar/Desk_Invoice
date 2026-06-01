"use client";
import { useRef, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useSettings } from "@/hooks/useSettings";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  User,
  Building2,
  ShieldCheck,
  Settings as SettingsIcon,
  Camera,
  Save,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Bell,
  Receipt,
  Landmark,
  AlertCircle,
  Loader2,
} from "lucide-react";

// ─── Framer Motion Variants ────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
};
const tabContentVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
  exit: { opacity: 0, y: -10, scale: 0.99, transition: { duration: 0.15 } },
};

const SETTINGS_TABS = [
  {
    id: "profile",
    label: "My Profile",
    icon: User,
    desc: "Personal information",
  },
  {
    id: "business",
    label: "Brand Details",
    icon: Building2,
    desc: "Brand & tax info",
  },
  {
    id: "billing",
    label: "Billing & Bank",
    icon: Receipt,
    desc: "Invoice & bank info",
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheck,
    desc: "Password & auth",
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: SettingsIcon,
    desc: "App behavior",
  },
];

// ─── Reusable Field Components ─────────────────────────────────────────────
const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all";
const disabledCls =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-500 cursor-not-allowed";

const IconInput = ({
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder = "",
  disabled = false,
}: {
  icon: React.ElementType;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) => (
  <div className="relative">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`${inputCls} pl-11 ${disabled ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""}`}
    />
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const {
    forms,
    updateForm,
    logoPreview,
    handleLogoChange,
    loading,
    saving,
    error,
    showSuccess,
    save,
  } = useSettings();

  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center rounded-3xl">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-bold">Loading settings…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const logoSrc = logoPreview || forms.logoUrl || null;
  const initials = forms.profile.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <AppLayout>
      <div className="relative min-h-screen bg-[#f8fafc] text-slate-900 overflow-hidden rounded-3xl font-sans">
        {/* Soft orbs */}
        <div className="absolute top-[-5%] right-[10%] w-[500px] h-[500px] rounded-full bg-purple-400/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[140px] pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* ── Header ── */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2"
          >
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                System Settings
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-2">
                Manage your studio preferences and configurations
              </p>
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-300"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 stroke-[2.5]" />
              )}
              {saving ? "Saving Changes…" : "Save Changes"}
            </button>
          </motion.div>

          {/* ── Error Banner ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-2xl shadow-sm"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-sm font-bold">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Success Toast ── */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-8 right-8 z-50 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/10"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold">
                  Settings updated successfully!
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ── Sidebar ── */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-3 space-y-2"
            >
              {SETTINGS_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 scale-[1.02]"
                        : "hover:bg-white/50 text-slate-500 hover:text-slate-900 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p
                        className={`text-sm font-extrabold ${isActive ? "text-indigo-900" : "text-slate-600"}`}
                      >
                        {tab.label}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        {tab.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </motion.div>

            {/* ── Content ── */}
            <motion.div variants={itemVariants} className="lg:col-span-9">
              <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[500px]">
                <AnimatePresence mode="wait">
                  {/* ════ PROFILE TAB ════ */}
                  {activeTab === "profile" && (
                    <motion.div
                      key="profile"
                      variants={tabContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-8"
                    >
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">
                          Personal Information
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                          Update your photo and personal details.
                        </p>
                      </div>

                      {/* Avatar Upload */}
                      <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                        <div
                          className="relative group cursor-pointer w-24 h-24"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {logoSrc ? (
                            <img
                              src={logoSrc}
                              alt="Studio Logo"
                              className="w-24 h-24 rounded-3xl object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-white shadow-sm flex items-center justify-center text-3xl font-extrabold text-indigo-600">
                              {initials}
                            </div>
                          )}
                          <div className="absolute inset-0 rounded-3xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        </div>

                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleLogoChange(file);
                            }}
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm font-bold bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                          >
                            Change Logo / Avatar
                          </button>
                          <p className="text-xs font-semibold text-slate-400 mt-2">
                            JPG, GIF, PNG or WebP. Max 2MB.
                          </p>
                          {logoPreview && (
                            <p className="text-xs font-semibold text-indigo-500 mt-1">
                              ✓ New image selected — save to apply
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label="Business Name">
                          <IconInput
                            icon={Building2}
                            value={forms.business.companyName}
                            onChange={(v) =>
                              updateForm("business", { companyName: v })
                            }
                          />
                        </Field>

                        <Field label="Email Address">
                          <IconInput
                            icon={Mail}
                            type="email"
                            value={forms.profile.email}
                            onChange={(v) =>
                              updateForm("profile", { email: v })
                            }
                          />
                        </Field>

                        <Field label="Phone Number">
                          <IconInput
                            icon={Phone}
                            value={forms.profile.phone}
                            onChange={(v) =>
                              updateForm("profile", { phone: v })
                            }
                          />
                        </Field>

                        <Field label="System Role">
                          <input
                            type="text"
                            value={forms.profile.role}
                            disabled
                            className={disabledCls}
                          />
                        </Field>
                      </div>
                    </motion.div>
                  )}

                  {/* ════ BUSINESS TAB ════ */}
                  {activeTab === "business" && (
                    <motion.div
                      key="business"
                      variants={tabContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-8"
                    >
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">
                          Brand Details
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                          Manage your brand's legal and contact information.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label="Brand / Studio Name">
                          <div className="md:col-span-2">
                            <IconInput
                              icon={Building2}
                              value={forms.business.companyName}
                              onChange={(v) =>
                                updateForm("business", { companyName: v })
                              }
                            />
                          </div>
                        </Field>

                        <Field label="GSTIN Number">
                          <input
                            type="text"
                            value={forms.business.gstin}
                            onChange={(e) =>
                              updateForm("business", { gstin: e.target.value })
                            }
                            className={`${inputCls} uppercase`}
                            placeholder="22AAAAA0000A1Z5"
                          />
                        </Field>

                        <Field label="PAN Number">
                          <input
                            type="text"
                            value={forms.business.panNumber}
                            onChange={(e) =>
                              updateForm("business", {
                                panNumber: e.target.value,
                              })
                            }
                            className={`${inputCls} uppercase`}
                            placeholder="AAAAA0000A"
                          />
                        </Field>

                        <Field label="Default Currency">
                          <input
                            type="text"
                            value={forms.business.currency}
                            disabled
                            className={disabledCls}
                          />
                        </Field>

                        <div className="md:col-span-2">
                          <Field label="Primary Address">
                            <div className="relative">
                              <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
                              <textarea
                                value={forms.business.address}
                                onChange={(e) =>
                                  updateForm("business", {
                                    address: e.target.value,
                                  })
                                }
                                rows={2}
                                placeholder="Street / Area"
                                className={`${inputCls} pl-11 resize-none`}
                              />
                            </div>
                          </Field>
                        </div>

                        <Field label="City">
                          <input
                            type="text"
                            value={forms.business.city}
                            onChange={(e) =>
                              updateForm("business", { city: e.target.value })
                            }
                            className={inputCls}
                          />
                        </Field>

                        <Field label="State">
                          <input
                            type="text"
                            value={forms.business.state}
                            onChange={(e) =>
                              updateForm("business", { state: e.target.value })
                            }
                            className={inputCls}
                          />
                        </Field>

                        <Field label="Pincode">
                          <input
                            type="text"
                            value={forms.business.pincode}
                            onChange={(e) =>
                              updateForm("business", {
                                pincode: e.target.value,
                              })
                            }
                            className={inputCls}
                            placeholder="000000"
                          />
                        </Field>
                      </div>
                    </motion.div>
                  )}

                  {/* ════ BILLING & BANK TAB ════ */}
                  {activeTab === "billing" && (
                    <motion.div
                      key="billing"
                      variants={tabContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-8"
                    >
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">
                          Billing & Bank Details
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                          Invoice settings and payment information printed on
                          invoices.
                        </p>
                      </div>

                      {/* Invoice Settings */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                          Invoice Settings
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Field label="Invoice Prefix">
                            <input
                              type="text"
                              value={forms.billing.invoicePrefix}
                              onChange={(e) =>
                                updateForm("billing", {
                                  invoicePrefix: e.target.value,
                                })
                              }
                              className={inputCls}
                              placeholder="INV"
                            />
                          </Field>

                          <Field label="Default Tax Rate (%)">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={forms.billing.defaultTaxRate}
                              onChange={(e) =>
                                updateForm("billing", {
                                  defaultTaxRate: e.target.value,
                                })
                              }
                              className={inputCls}
                            />
                          </Field>

                          <div className="md:col-span-2">
                            <Field label="Terms & Conditions">
                              <textarea
                                value={forms.billing.termsAndConditions}
                                onChange={(e) =>
                                  updateForm("billing", {
                                    termsAndConditions: e.target.value,
                                  })
                                }
                                rows={3}
                                placeholder="Payment due within 30 days of invoice date…"
                                className={`${inputCls} resize-none`}
                              />
                            </Field>
                          </div>
                        </div>
                      </div>

                      {/* Bank Details */}
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                          Bank Details
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Field label="Bank Name">
                            <IconInput
                              icon={Landmark}
                              value={forms.billing.bankName}
                              onChange={(v) =>
                                updateForm("billing", { bankName: v })
                              }
                              placeholder="State Bank of India"
                            />
                          </Field>

                          <Field label="Account Holder Name">
                            <IconInput
                              icon={User}
                              value={forms.billing.accountHolderName}
                              onChange={(v) =>
                                updateForm("billing", { accountHolderName: v })
                              }
                            />
                          </Field>

                          <Field label="Account Number">
                            <input
                              type="text"
                              value={forms.billing.accountNumber}
                              onChange={(e) =>
                                updateForm("billing", {
                                  accountNumber: e.target.value,
                                })
                              }
                              className={inputCls}
                              placeholder="XXXX XXXX XXXX"
                            />
                          </Field>

                          <Field label="IFSC Code">
                            <input
                              type="text"
                              value={forms.billing.ifscCode}
                              onChange={(e) =>
                                updateForm("billing", {
                                  ifscCode: e.target.value.toUpperCase(),
                                })
                              }
                              className={`${inputCls} uppercase`}
                              placeholder="SBIN0000123"
                            />
                          </Field>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ════ SECURITY TAB ════ */}
                  {activeTab === "security" && (
                    <motion.div
                      key="security"
                      variants={tabContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-8"
                    >
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">
                          Security Settings
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                          Ensure your account is using a long, random password
                          to stay secure.
                        </p>
                      </div>

                      <div className="max-w-md space-y-6">
                        <Field label="Current Password">
                          <input
                            type="password"
                            className={inputCls}
                            placeholder="••••••••"
                          />
                        </Field>
                        <Field label="New Password">
                          <input
                            type="password"
                            className={inputCls}
                            placeholder="••••••••"
                          />
                        </Field>
                        <Field label="Confirm New Password">
                          <input
                            type="password"
                            className={inputCls}
                            placeholder="••••••••"
                          />
                        </Field>
                        <button className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors mt-2">
                          Update Password
                        </button>
                        <p className="text-xs text-slate-400 font-semibold text-center">
                          Password change calls your auth endpoint separately —
                          not part of the main Save button.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* ════ PREFERENCES TAB ════ */}
                  {activeTab === "preferences" && (
                    <motion.div
                      key="preferences"
                      variants={tabContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-8"
                    >
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">
                          App Preferences
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                          Customize your dashboard experience.
                        </p>
                      </div>

                      <div className="space-y-4 max-w-xl">
                        <ToggleRow
                          icon={Bell}
                          iconColor="text-indigo-500"
                          title="Low Stock Alerts"
                          desc="Receive notifications when inventory is low"
                          defaultOn
                        />
                        <ToggleRow
                          icon={Globe}
                          iconColor="text-emerald-500"
                          title="Live Syncing"
                          desc="Automatically sync data across all devices"
                          defaultOn
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}

// ─── Toggle Row Helper ─────────────────────────────────────────────────────
function ToggleRow({
  icon: Icon,
  iconColor,
  title,
  desc,
  defaultOn = false,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  desc: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <p className="font-extrabold text-sm text-slate-900">{title}</p>
          <p className="text-xs font-bold text-slate-500">{desc}</p>
        </div>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${on ? (iconColor.includes("indigo") ? "bg-indigo-500" : "bg-emerald-500") : "bg-slate-200"}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${on ? "right-1" : "left-1"}`}
        />
      </button>
    </div>
  );
}
