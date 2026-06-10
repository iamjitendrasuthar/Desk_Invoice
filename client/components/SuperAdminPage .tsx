"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
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

const PLAN_COLORS: Record<string, string> = {
  trial: "bg-amber-100 text-amber-700",
  basic: "bg-blue-100 text-blue-700",
  pro: "bg-purple-100 text-purple-700",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function SuperAdminPage() {
  const { isSuperAdmin } = useAuthStore();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    businessName: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    plan: "trial",
    maxUsers: 3,
  });
  const [formLoading, setFormLoading] = useState(false);

  // ─── Guard — superadmin only ────────────────────────────────────────────────
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

  // ─── Fetch data ─────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [tenantsRes, statsRes] = await Promise.all([
        api.get("/superadmin/tenants"),
        api.get("/superadmin/stats"),
      ]);
      setTenants(tenantsRes.data.data);
      setStats(statsRes.data.data);
    } catch {
      setError("Data load nahi hua");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ─── Auto-clear toasts ──────────────────────────────────────────────────────
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  // ─── Create tenant ──────────────────────────────────────────────────────────
  const handleCreate = async () => {
    const { businessName, adminName, adminEmail, adminPassword } = form;
    if (!businessName || !adminName || !adminEmail || !adminPassword) {
      setError("Sab fields required hain");
      return;
    }
    try {
      setFormLoading(true);
      setError("");
      await api.post("/superadmin/tenants", form);
      setSuccess(`"${businessName}" successfully onboard ho gaya!`);
      setForm({
        businessName: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        plan: "trial",
        maxUsers: 3,
      });
      setShowForm(false);
      fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.message || "Tenant create nahi hua");
    } finally {
      setFormLoading(false);
    }
  };

  // ─── Toggle tenant active status ────────────────────────────────────────────
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
      setError("Status update nahi hua");
    }
  };

  // ─── Delete tenant ──────────────────────────────────────────────────────────
  const handleDelete = async (tenant: Tenant) => {
    if (
      !confirm(
        `"${tenant.businessName}" aur uske SARE data ko permanently delete karo?`,
      )
    )
      return;
    try {
      await api.delete(`/superadmin/tenants/${tenant._id}`);
      setSuccess(`"${tenant.businessName}" delete ho gaya`);
      fetchAll();
    } catch {
      setError("Delete nahi hua");
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#006666]/10 flex items-center justify-center">
            <Crown className="w-5 h-5 text-[#006666]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Platform Admin
            </h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-0.5">
              Super Admin Panel
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setError("");
          }}
          className="flex items-center gap-2 bg-[#006666] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#005555] transition-all shadow-lg shadow-[#006666]/20"
        >
          <Plus className="w-4 h-4" />
          New Business
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Total Businesses",
              value: stats.totalTenants,
              icon: Building2,
              color: "text-[#006666] bg-[#006666]/10",
            },
            {
              label: "Active",
              value: stats.activeTenants,
              icon: TrendingUp,
              color: "text-emerald-600 bg-emerald-100",
            },
            {
              label: "Total Users",
              value: stats.totalUsers,
              icon: Users,
              color: "text-purple-600 bg-purple-100",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}
              >
                <s.icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {s.value}
              </p>
              <p className="text-slate-400 text-xs font-semibold mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {(success || error) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-5 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 ${
              success
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-rose-50 text-rose-600 border border-rose-100"
            }`}
          >
            {success ? (
              <Check className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {success || error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Tenant Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-slate-800">
                New Business Onboard
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Business Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Business Name
                </label>
                <input
                  placeholder="JS Interiors"
                  value={form.businessName}
                  onChange={(e) =>
                    setForm({ ...form, businessName: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#006666]/40 focus:ring-4 focus:ring-[#006666]/5 outline-none transition-all"
                />
              </div>

              {/* Admin Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Admin Name
                </label>
                <input
                  placeholder="Jitendra Sharma"
                  value={form.adminName}
                  onChange={(e) =>
                    setForm({ ...form, adminName: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#006666]/40 focus:ring-4 focus:ring-[#006666]/5 outline-none transition-all"
                />
              </div>

              {/* Admin Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Admin Email
                </label>
                <input
                  type="email"
                  placeholder="admin@jsinteriors.com"
                  value={form.adminEmail}
                  onChange={(e) =>
                    setForm({ ...form, adminEmail: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#006666]/40 focus:ring-4 focus:ring-[#006666]/5 outline-none transition-all"
                />
              </div>

              {/* Admin Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Admin Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.adminPassword}
                  onChange={(e) =>
                    setForm({ ...form, adminPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#006666]/40 focus:ring-4 focus:ring-[#006666]/5 outline-none transition-all"
                />
              </div>

              {/* Plan */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Plan
                </label>
                <select
                  value={form.plan}
                  onChange={(e) => setForm({ ...form, plan: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#006666]/40 focus:ring-4 focus:ring-[#006666]/5 outline-none transition-all"
                >
                  <option value="trial">Trial (14 days)</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                </select>
              </div>

              {/* Max Users */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Max Users
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={form.maxUsers}
                  onChange={(e) =>
                    setForm({ ...form, maxUsers: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#006666]/40 focus:ring-4 focus:ring-[#006666]/5 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCreate}
                disabled={formLoading}
                className="bg-[#006666] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#005555] disabled:opacity-50 transition-all shadow-md shadow-[#006666]/20"
              >
                {formLoading ? "Creating..." : "Create Business"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tenants List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-slate-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-semibold text-sm">Koi business nahi hai abhi</p>
          <p className="text-xs mt-1">
            Upar "New Business" se pehla customer add karo
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tenants.map((tenant) => (
            <motion.div
              key={tenant._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center justify-between bg-white border rounded-2xl px-5 py-4 transition-all ${
                tenant.isActive
                  ? "border-slate-200"
                  : "border-slate-100 opacity-60"
              }`}
            >
              {/* Left */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#006666]/10 flex items-center justify-center text-[#006666] font-extrabold text-sm">
                  {tenant.businessName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 text-sm">
                      {tenant.businessName}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${PLAN_COLORS[tenant.plan]}`}
                    >
                      {tenant.plan}
                    </span>
                    {!tenant.isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 uppercase tracking-wide">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-slate-400 text-xs flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {tenant.userCount}/{tenant.maxUsers} users
                    </p>
                    <p className="text-slate-300 text-xs">
                      {new Date(tenant.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right — actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleTenant(tenant)}
                  title={tenant.isActive ? "Deactivate" : "Activate"}
                  className={`transition-colors ${tenant.isActive ? "text-[#006666] hover:text-[#005555]" : "text-slate-300 hover:text-[#006666]"}`}
                >
                  {tenant.isActive ? (
                    <ToggleRight className="w-6 h-6" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(tenant)}
                  className="text-slate-300 hover:text-rose-500 transition-colors ml-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
