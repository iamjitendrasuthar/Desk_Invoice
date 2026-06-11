"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Building2,
  Plus,
  Users,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
  Check,
  AlertCircle,
  Crown,
  TrendingUp,
  ShieldAlert,
  Calendar,
  Edit2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

interface Tenant {
  _id: string;
  businessName: string;
  slug: string;
  plan: "trial" | "basic" | "pro";
  isActive: boolean;
  maxUsers: number;
  userCount: number;
  createdAt: string;
  trialEndsAt: string;
}

interface Stats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  byPlan: { _id: string; count: number }[];
}

const PLAN_META: Record<string, { label: string; cls: string }> = {
  trial: {
    label: "Trial",
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  basic: {
    label: "Basic",
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  pro: {
    label: "Pro",
    cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
};

const springTransition = { type: "spring", stiffness: 240, damping: 26 };
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.02, delayChildren: 0.01 },
  },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  // @ts-ignore
  show: { opacity: 1, y: 0, transition: springTransition },
};
const drawerVariants: Variants = {
  hidden: { x: "100%", opacity: 0.95 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", damping: 28, stiffness: 220 },
  },
  exit: {
    x: "100%",
    opacity: 0.95,
    transition: { duration: 0.18, ease: "easeInOut" },
  },
};
const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  // @ts-ignore
  visible: { opacity: 1, scale: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, scale: 0.96, y: -6, transition: { duration: 0.12 } },
};

const initialForm = {
  businessName: "",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
  plan: "trial",
  maxUsers: 3,
};

const inputClass =
  "w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700/50 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-700 focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none transition-all";

export default function SuperAdminPage() {
  const { isSuperAdmin } = useAuthStore();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // hooks ke baad guard
  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const [tenantsRes, statsRes] = await Promise.all([
        api.get("/superadmin/tenants"),
        api.get("/superadmin/stats"),
      ]);
      setTenants(tenantsRes.data.data);
      setStats(statsRes.data.data);
    } catch {
      setGlobalError("Data load nahi hua");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  useEffect(() => {
    if (globalError) {
      const t = setTimeout(() => setGlobalError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [globalError]);

  if (!isSuperAdmin()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-slate-400">
          <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Access denied</p>
        </div>
      </div>
    );
  }

  const openAdd = () => {
    setEditTenant(null);
    setForm(initialForm);
    setShowDrawer(true);
  };

  const openEdit = (tenant: Tenant) => {
    setEditTenant(tenant);
    setForm({
      businessName: tenant.businessName,
      adminName: "",
      adminEmail: "",
      adminPassword: "",
      plan: tenant.plan,
      maxUsers: tenant.maxUsers,
    });
    setShowDrawer(true);
  };

  const handleSave = async () => {
    const { businessName, adminName, adminEmail, adminPassword } = form;
    if (editTenant) {
      // edit mode — sirf plan aur maxUsers update
      if (!businessName) {
        setGlobalError("Business name required");
        return;
      }
    } else {
      if (!businessName || !adminName || !adminEmail || !adminPassword) {
        setGlobalError("Sab fields required hain");
        return;
      }
    }
    try {
      setSaving(true);
      if (editTenant) {
        await api.put(`/superadmin/tenants/${editTenant._id}`, {
          businessName: form.businessName,
          plan: form.plan,
          maxUsers: form.maxUsers,
        });
        setSuccess(`"${form.businessName}" updated!`);
      } else {
        await api.post("/superadmin/tenants", form);
        setSuccess(`"${businessName}" successfully onboard ho gaya!`);
      }
      setShowDrawer(false);
      fetchAll();
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || "Save nahi hua");
    } finally {
      setSaving(false);
    }
  };

  const toggleTenant = async (tenant: Tenant) => {
    try {
      await api.put(`/superadmin/tenants/${tenant._id}`, {
        isActive: !tenant.isActive,
      });
      setSuccess(
        `"${tenant.businessName}" ${!tenant.isActive ? "activated" : "deactivated"}`,
      );
      fetchAll();
    } catch {
      setGlobalError("Status update nahi hua");
    }
  };

  const triggerDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/superadmin/tenants/${deleteId}`);
      setSuccess("Business delete ho gaya");
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchAll();
    } catch {
      setGlobalError("Delete nahi hua");
    }
  };

  const trialDaysLeft = (date: string) =>
    Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86400000));

  const filtered = tenants.filter(
    (t) =>
      t.businessName.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0f172a] text-[#334155] dark:text-slate-300 antialiased pb-16 font-sans relative transition-colors duration-200">
      {/* Global Error Toast */}
      <AnimatePresence>
        {(globalError || success) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 max-w-xl w-full px-4"
          >
            <div
              className={`border shadow-xl rounded-lg p-4 flex items-start gap-3 ${
                success
                  ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800"
              }`}
            >
              {success ? (
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <p
                className={`text-xs font-bold flex-1 ${success ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}
              >
                {success || globalError}
              </p>
              <button
                onClick={() => {
                  setGlobalError(null);
                  setSuccess("");
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
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
          <h1 className="text-2xl font-bold tracking-tight text-[#1e293b] dark:text-white">
            Platform Admin
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>🏠</span>
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-300 font-semibold">
              Super Admin
            </span>
          </div>
        </div>

        {/* Stat Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {[
              {
                label: "Total Businesses",
                value: stats.totalTenants,
                icon: Building2,
                bg: "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600",
                color: "text-[#007676] dark:text-teal-400",
              },
              {
                label: "Active",
                value: stats.activeTenants,
                icon: TrendingUp,
                bg: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800",
                color: "text-emerald-600 dark:text-emerald-400",
              },
              {
                label: "Total Users",
                value: stats.totalUsers,
                icon: Users,
                bg: "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800",
                color: "text-indigo-600 dark:text-indigo-400",
              },
              {
                label: "Inactive",
                value: stats.totalTenants - stats.activeTenants,
                icon: ShieldAlert,
                bg: "bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800",
                color: "text-rose-500 dark:text-rose-400",
              },
            ].map((s) => (
              <motion.div
                key={s.label}
                variants={itemVariants}
                className="bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 p-4 sm:p-6 rounded-lg shadow-sm flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    {s.label}
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold block tracking-tight text-[#1e293b] dark:text-white">
                    {s.value}
                  </span>
                </div>
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg border flex items-center justify-center shadow-2xs ${s.bg}`}
                >
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Main Table Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 rounded-lg shadow-sm p-4 sm:p-6 space-y-6"
        >
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700/50 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                placeholder="Search by business name or slug..."
              />
            </div>
            <button
              onClick={openAdd}
              className="flex items-center justify-center gap-2 bg-[#007676] hover:bg-[#005f5f] text-white px-5 py-2 rounded-md text-sm font-bold tracking-wide transition-all shadow-xs w-full sm:w-auto shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> New Business
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-700/40">
                  {[
                    "BUSINESS",
                    "PLAN",
                    "USERS",
                    "TRIAL / STATUS",
                    "CREATED",
                    "ACTIVE",
                    "ACTIONS",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`${i === 0 ? "pl-6" : ""} ${i === 6 ? "pr-6 text-center" : ""} ${i > 0 && i < 6 ? "text-center" : ""} px-4 py-4 text-xs font-bold text-[#475569] dark:text-slate-400 uppercase tracking-wider select-none`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-white dark:bg-transparent">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-20">
                      <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-slate-200 dark:border-slate-600 border-t-[#007676] rounded-full animate-spin" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-20">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Building2 className="w-6 h-6 text-slate-300 dark:text-slate-500" />
                      </div>
                      <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                        {search
                          ? "Koi match nahi mila"
                          : "Koi business nahi hai abhi"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((tenant) => (
                    <tr
                      key={tenant._id}
                      className={`transition-colors duration-100 group hover:bg-slate-50/40 dark:hover:bg-slate-700/30 ${!tenant.isActive ? "opacity-50" : ""}`}
                    >
                      {/* Business */}
                      <td className="pl-6 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#007676]/10 dark:bg-[#007676]/20 flex items-center justify-center text-[#007676] font-extrabold text-sm shrink-0">
                            {tenant.businessName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#0f172a] dark:text-slate-100">
                              {tenant.businessName}
                            </p>
                            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                              {tenant.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${PLAN_META[tenant.plan]?.cls}`}
                        >
                          {PLAN_META[tenant.plan]?.label}
                        </span>
                      </td>

                      {/* Users */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-[#0f172a] dark:text-slate-100 bg-[#f8fafc] dark:bg-slate-700 border border-slate-100 dark:border-slate-600 px-3 py-1.5 rounded-lg">
                          <Users className="w-3 h-3 text-slate-400" />
                          {tenant.userCount ?? 0}/{tenant.maxUsers}
                        </span>
                      </td>

                      {/* Trial / Status */}
                      <td className="px-4 py-4 text-center">
                        {tenant.plan === "trial" && tenant.trialEndsAt ? (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                              trialDaysLeft(tenant.trialEndsAt) > 0
                                ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                                : "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {trialDaysLeft(tenant.trialEndsAt) > 0
                              ? `${trialDaysLeft(tenant.trialEndsAt)}d left`
                              : "Expired"}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                            —
                          </span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="px-4 py-4 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {new Date(tenant.createdAt).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </td>

                      {/* Toggle */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleTenant(tenant)}
                          className={`transition-colors ${tenant.isActive ? "text-[#007676] hover:text-[#005f5f]" : "text-slate-300 dark:text-slate-600 hover:text-[#007676]"}`}
                        >
                          {tenant.isActive ? (
                            <ToggleRight className="w-7 h-7" />
                          ) : (
                            <ToggleLeft className="w-7 h-7" />
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="pr-6 px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(tenant)}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 stroke-[1.8]" />
                          </button>
                          <button
                            onClick={() => triggerDelete(tenant._id)}
                            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.8]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Add / Edit Drawer ── */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-xs"
              onClick={() => setShowDrawer(false)}
            />
            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-md bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col pointer-events-auto shadow-2xl text-slate-800 dark:text-slate-200"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 sticky top-0 z-10">
                <div>
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white tracking-wide">
                    {editTenant ? "Edit Business" : "New Business Onboard"}
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {editTenant
                      ? "Plan, users aur business name update karo"
                      : "Tenant aur admin account ek saath create hoga"}
                  </p>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-600 rounded transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-5 space-y-4 flex-1 overflow-y-auto bg-white dark:bg-slate-800">
                {/* Business Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, businessName: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="JS Interiors"
                  />
                </div>

                {/* Admin fields — sirf create mode mein */}
                {!editTenant && (
                  <>
                    <div className="h-px w-full bg-slate-100 dark:bg-slate-700" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Admin Account
                    </p>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Admin Name *
                      </label>
                      <input
                        type="text"
                        value={form.adminName}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, adminName: e.target.value }))
                        }
                        className={inputClass}
                        placeholder="Jitendra Sharma"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          Admin Email *
                        </label>
                        <input
                          type="email"
                          value={form.adminEmail}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              adminEmail: e.target.value,
                            }))
                          }
                          className={inputClass}
                          placeholder="admin@business.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          Password *
                        </label>
                        <input
                          type="password"
                          value={form.adminPassword}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              adminPassword: e.target.value,
                            }))
                          }
                          className={inputClass}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="h-px w-full bg-slate-100 dark:bg-slate-700" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Plan & Limits
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Plan
                    </label>
                    <select
                      value={form.plan}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, plan: e.target.value }))
                      }
                      className={inputClass + " appearance-none cursor-pointer"}
                    >
                      <option value="trial">Trial (14 days)</option>
                      <option value="basic">Basic</option>
                      <option value="pro">Pro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Max Users
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={form.maxUsers}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          maxUsers: Number(e.target.value),
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="flex gap-2 p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 sticky bottom-0">
                <button
                  onClick={() => setShowDrawer(false)}
                  className="flex-1 px-4 py-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded bg-[#007676] hover:bg-[#005f5f] text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editTenant
                      ? "Save Changes"
                      : "Create Business"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Delete Modal ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/20 backdrop-blur-xs"
              onClick={() => setShowDeleteModal(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 w-full max-w-sm pointer-events-auto shadow-2xl p-5 text-center space-y-4"
              >
                <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 flex items-center justify-center text-rose-500 dark:text-rose-400 mx-auto">
                  <AlertCircle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    Delete Business?
                  </h3>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 px-2 leading-relaxed">
                    Is business aur uske SARE data ko permanently delete karo?
                    Yeh action undo nahi ho sakta.
                  </p>
                </div>
                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 rounded border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
