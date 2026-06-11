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
  EyeOff,
  Eye,
} from "lucide-react";
import { changePassword } from "@/services/settingsService";

// ─── Framer Motion Variants ────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.02, delayChildren: 0.01 },
  },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 240, damping: 26 },
  },
};
const tabContentVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 240, damping: 26 },
  },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
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
  <div className="space-y-2">
    <label className="block text-xs font-bold text-[#475569] dark:text-slate-400 uppercase tracking-wider select-none">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700/50 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors font-medium";
const disabledCls =
  "w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-[#f8fafc] dark:bg-slate-700 text-sm font-medium text-slate-400 dark:text-slate-500 cursor-not-allowed select-none";

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
    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none stroke-[1.8]" />
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`${inputCls} pl-10 ${disabled ? "bg-[#f8fafc] dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed" : ""}`}
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
  // page.tsx ke top mein import add karo

  // SETTINGS_TABS ke baad ya SettingsPage ke andar — ye state add karo:
  // (SettingsPage component ke andar, useSettings ke neeche)
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  const handlePasswordChange = async () => {
    setPwError(null);
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwError("All fields are required");
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError("New passwords do not match");
      return;
    }
    if (pwForm.next.length < 6) {
      setPwError("Password must be at least 6 characters");
      return;
    }
    try {
      setPwSaving(true);
      await changePassword(pwForm.current, pwForm.next);
      setPwForm({ current: "", next: "", confirm: "" });
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: any) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  };
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[75vh] bg-[#F5F5F5] dark:bg-[#0f172a]">
          <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-slate-200 dark:border-slate-600 border-t-[#007676] rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const logoSrc = logoPreview || forms.logoUrl || null;
  const initials = forms.profile.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0f172a] text-[#334155] dark:text-slate-300 antialiased pb-16 font-sans relative transition-colors duration-200">
        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 max-w-xl w-full px-4"
            >
              <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 shadow-xl rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-rose-900 dark:text-rose-300 leading-tight">
                    System Operational Alert
                  </p>
                  <p className="text-sm font-medium text-rose-600 dark:text-rose-400 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-5 py-3 rounded-lg shadow-lg shadow-emerald-500/10"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span className="text-sm font-bold">
                Settings updated successfully!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="w-full mx-auto px-4 sm:px-8 py-6 space-y-5"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1e293b] dark:text-white">
                System Settings
              </h1>
              <p className="hidden sm:block text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                Manage your studio preferences and terminal configurations.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
                🏠
              </span>
              <span>/</span>
              <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
                Setup
              </span>
              <span>/</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                Settings
              </span>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-1">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-[#007676] hover:bg-[#005f5f] text-white px-6 py-2.5 rounded-md text-sm font-bold tracking-wide transition-all shadow-xs w-full sm:w-auto disabled:opacity-50 shrink-0"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 stroke-[3]" />
              )}
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Nav */}
            <div className="lg:col-span-3 flex flex-col gap-1.5 w-full">
              {SETTINGS_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-md transition-all duration-100 border text-left ${
                      isActive
                        ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm text-[#0f172a] dark:text-white"
                        : "bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 border ${
                        isActive
                          ? "bg-[#eff6ff] dark:bg-slate-700 text-[#4f46e5] dark:text-indigo-400 border-transparent"
                          : "bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 border-transparent"
                      }`}
                    >
                      <tab.icon className="w-4 h-4 stroke-[1.8]" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-bold ${isActive ? "text-[#007676]" : "text-slate-700 dark:text-slate-300"}`}
                      >
                        {tab.label}
                      </p>
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {tab.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Content Panel */}
            <div className="lg:col-span-9 bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 rounded-lg shadow-sm p-6 sm:p-8 min-h-[520px]">
              <AnimatePresence mode="wait">
                {/* ════ PROFILE TAB ════ */}
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-[#1e293b] dark:text-white tracking-wide">
                        Personal Information
                      </h3>
                      <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                        Update your identity photo avatar and personal master
                        parameters.
                      </p>
                    </div>

                    {/* Avatar Upload */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-700">
                      <div
                        className="relative group cursor-pointer w-20 h-20 shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {logoSrc ? (
                          <img
                            src={logoSrc}
                            alt="Studio Logo"
                            className="w-20 h-20 rounded-md object-cover border border-slate-200 dark:border-slate-600 shadow-xs"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-md bg-[#eff6ff] dark:bg-slate-700 border border-slate-100 dark:border-slate-600 shadow-2xs flex items-center justify-center text-3xl font-bold text-[#4f46e5] dark:text-indigo-400">
                            {initials}
                          </div>
                        )}
                        <div className="absolute inset-0 rounded-md bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      <div className="space-y-2">
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
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-2xs"
                        >
                          Change Logo / Avatar
                        </button>
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                          JPG, GIF, PNG or WebP. Max 2MB.
                        </p>
                        {logoPreview && (
                          <p className="text-xs font-bold text-[#007676] mt-1">
                            ✓ New image selected — save changes to finalize
                            apply
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                          onChange={(v) => updateForm("profile", { email: v })}
                        />
                      </Field>
                      <Field label="Phone Number">
                        <IconInput
                          icon={Phone}
                          value={forms.profile.phone}
                          onChange={(v) => updateForm("profile", { phone: v })}
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
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-[#1e293b] dark:text-white tracking-wide">
                        Brand Details
                      </h3>
                      <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                        Manage your brand's legal core identity parameters and
                        location records.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <Field label="Brand / Studio Name">
                          <IconInput
                            icon={Building2}
                            value={forms.business.companyName}
                            onChange={(v) =>
                              updateForm("business", { companyName: v })
                            }
                          />
                        </Field>
                      </div>
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
                            <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none stroke-[1.8]" />
                            <textarea
                              value={forms.business.address}
                              onChange={(e) =>
                                updateForm("business", {
                                  address: e.target.value,
                                })
                              }
                              rows={2}
                              placeholder="Street / Area Location"
                              className={`${inputCls} pl-10 resize-none font-medium text-sm`}
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
                            updateForm("business", { pincode: e.target.value })
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
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-[#1e293b] dark:text-white tracking-wide">
                        Billing & Bank Details
                      </h3>
                      <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                        Invoice configuration properties and payment information
                        logs.
                      </p>
                    </div>

                    <div className="space-y-5">
                      <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block pb-1.5 border-b border-slate-100 dark:border-slate-700">
                        Invoice Generation Rule
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                              placeholder="Payment due metrics inside timeline parameters..."
                              className={`${inputCls} resize-none font-medium text-sm`}
                            />
                          </Field>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5 pt-4">
                      <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block pb-1.5 border-b border-slate-100 dark:border-slate-700">
                        Bank Vault Destination Ledger
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-[#1e293b] dark:text-white tracking-wide">
                        Security Settings
                      </h3>
                      <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                        Update your account password.
                      </p>
                    </div>

                    <div className="max-w-md space-y-5">
                      {/* Error */}
                      {pwError && (
                        <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-md text-sm font-medium">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {pwError}
                        </div>
                      )}
                      {/* Success */}
                      {pwSuccess && (
                        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-md text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          Password updated successfully!
                        </div>
                      )}
                      <Field label="Current Password">
                        <PasswordInput
                          value={pwForm.current}
                          onChange={(v) =>
                            setPwForm((p) => ({ ...p, current: v }))
                          }
                        />
                      </Field>
                      <Field label="New Password">
                        <PasswordInput
                          value={pwForm.next}
                          onChange={(v) =>
                            setPwForm((p) => ({ ...p, next: v }))
                          }
                        />
                      </Field>
                      <Field label="Confirm New Password">
                        <PasswordInput
                          value={pwForm.confirm}
                          onChange={(v) =>
                            setPwForm((p) => ({ ...p, confirm: v }))
                          }
                        />
                      </Field>
                      <button
                        type="button"
                        onClick={handlePasswordChange}
                        disabled={pwSaving}
                        className="w-full bg-[#007676] hover:bg-[#005f5f] text-white px-4 py-2.5 rounded-md text-sm font-bold tracking-wide transition-all shadow-xs mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {pwSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                        {pwSaving ? "Updating..." : "Update Password"}
                      </button>
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
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-[#1e293b] dark:text-white tracking-wide">
                        App Preferences
                      </h3>
                      <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                        Customize your interactive system dashboard runtime
                        experience.
                      </p>
                    </div>

                    <div className="space-y-4 max-w-xl">
                      <ToggleRow
                        icon={Bell}
                        title="Low Stock Alerts"
                        desc="Receive notifications when inventory is low"
                        defaultOn
                      />
                      <ToggleRow
                        icon={Globe}
                        title="Live Syncing"
                        desc="Automatically sync data across all devices"
                        defaultOn
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}

// ─── Toggle Row Helper ─────────────────────────────────────────────────────
function ToggleRow({
  icon: Icon,
  title,
  desc,
  defaultOn = false,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-4 rounded-md border border-slate-200/60 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 shadow-2xs">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-9 h-9 rounded-md bg-[#eff6ff] dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-[#4f46e5] dark:text-indigo-400 stroke-[1.8]" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-[#0f172a] dark:text-slate-100 truncate">
            {title}
          </p>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">
            {desc}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className={`w-10 h-5.5 rounded-full relative transition-colors duration-200 shrink-0 ${on ? "bg-[#007676]" : "bg-slate-200 dark:bg-slate-600"}`}
      >
        <div
          className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all duration-200 ${on ? "left-[21px]" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}
// ─── Password Input with Eye Toggle ───────────────────────────────────────
const PasswordInput = ({
  value,
  onChange,
  placeholder = "••••••••",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} pr-10`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        {show ? (
          <EyeOff className="w-4 h-4 stroke-[1.8]" />
        ) : (
          <Eye className="w-4 h-4 stroke-[1.8]" />
        )}
      </button>
    </div>
  );
};
