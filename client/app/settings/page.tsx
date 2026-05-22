"use client";
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
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
} from "lucide-react";

// Framer Motion Variants
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
  exit: { opacity: 0, y: -10, scale: 0.99, transition: { duration: 0.2 } },
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
    label: "Studio Details",
    icon: Building2,
    desc: "Brand & tax info",
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock Form States (Using your brand context)
  const [profileForm, setProfileForm] = useState({
    name: "Jitendra Suthar",
    email: "admin@jsinteriors.com",
    phone: "+91 98765 43210",
    role: "Studio Admin",
  });

  const [businessForm, setBusinessForm] = useState({
    companyName: "JS Interiors",
    gstin: "22AAAAA0000A1Z5",
    address: "123 Premium Studio Lane",
    city: "Jalore",
    state: "Rajasthan",
    currency: "INR (₹)",
  });

  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <AppLayout>
      {/* Light Background with Soft Pastel Orbs */}
      <div className="relative min-h-screen bg-[#f8fafc] text-slate-900 overflow-hidden rounded-3xl font-sans">
        <div className="absolute top-[-5%] right-[10%] w-[500px] h-[500px] rounded-full bg-purple-400/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[140px] pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Header Section */}
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
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-300"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4 stroke-[2.5]" />
              )}
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </motion.div>

          {/* Success Toast */}
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
            {/* Sidebar Navigation */}
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

            {/* Main Content Area */}
            <motion.div variants={itemVariants} className="lg:col-span-9">
              <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[500px]">
                <AnimatePresence mode="wait">
                  {/* --- PROFILE TAB --- */}
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

                      <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                        <div className="relative group cursor-pointer">
                          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-white shadow-sm flex items-center justify-center text-3xl font-extrabold text-indigo-600 overflow-hidden">
                            {profileForm.name.charAt(0)}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <button className="text-sm font-bold bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                            Change Avatar
                          </button>
                          <p className="text-xs font-semibold text-slate-400 mt-2">
                            JPG, GIF or PNG. Max size of 2MB.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={profileForm.name}
                              onChange={(e) =>
                                setProfileForm((p) => ({
                                  ...p,
                                  name: e.target.value,
                                }))
                              }
                              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="email"
                              value={profileForm.email}
                              onChange={(e) =>
                                setProfileForm((p) => ({
                                  ...p,
                                  email: e.target.value,
                                }))
                              }
                              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={profileForm.phone}
                              onChange={(e) =>
                                setProfileForm((p) => ({
                                  ...p,
                                  phone: e.target.value,
                                }))
                              }
                              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            System Role
                          </label>
                          <input
                            type="text"
                            value={profileForm.role}
                            disabled
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-500 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* --- BUSINESS TAB --- */}
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
                          Studio Details
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                          Manage your brand's legal and contact information.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Brand / Studio Name
                          </label>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={businessForm.companyName}
                              onChange={(e) =>
                                setBusinessForm((p) => ({
                                  ...p,
                                  companyName: e.target.value,
                                }))
                              }
                              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            GSTIN Number
                          </label>
                          <input
                            type="text"
                            value={businessForm.gstin}
                            onChange={(e) =>
                              setBusinessForm((p) => ({
                                ...p,
                                gstin: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Default Currency
                          </label>
                          <input
                            type="text"
                            value={businessForm.currency}
                            disabled
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-500 cursor-not-allowed"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Primary Address
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                            <textarea
                              value={businessForm.address}
                              onChange={(e) =>
                                setBusinessForm((p) => ({
                                  ...p,
                                  address: e.target.value,
                                }))
                              }
                              rows={2}
                              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={businessForm.city}
                            onChange={(e) =>
                              setBusinessForm((p) => ({
                                ...p,
                                city: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            value={businessForm.state}
                            onChange={(e) =>
                              setBusinessForm((p) => ({
                                ...p,
                                state: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* --- SECURITY TAB --- */}
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
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                        <button className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors mt-2">
                          Update Password
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* --- PREFERENCES TAB --- */}
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

                      <div className="space-y-6 max-w-xl">
                        {/* Toggle 1 */}
                        <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                              <Bell className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                              <p className="font-extrabold text-sm text-slate-900">
                                Low Stock Alerts
                              </p>
                              <p className="text-xs font-bold text-slate-500">
                                Receive notifications when inventory is low
                              </p>
                            </div>
                          </div>
                          {/* Custom Toggle Switch */}
                          <div className="w-11 h-6 bg-indigo-500 rounded-full relative cursor-pointer shadow-inner">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                          </div>
                        </div>

                        {/* Toggle 2 */}
                        <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                              <Globe className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                              <p className="font-extrabold text-sm text-slate-900">
                                Live Syncing
                              </p>
                              <p className="text-xs font-bold text-slate-500">
                                Automatically sync data across all devices
                              </p>
                            </div>
                          </div>
                          <div className="w-11 h-6 bg-emerald-500 rounded-full relative cursor-pointer shadow-inner">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                          </div>
                        </div>
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
