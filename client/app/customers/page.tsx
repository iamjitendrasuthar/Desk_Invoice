"use client";
import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  X,
  Phone,
  Mail,
  MapPin,
  Briefcase,
} from "lucide-react";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  gstin: string;
  type: string;
  totalPurchases: number;
  totalOrders: number;
  address: { city: string; state: string; pincode?: string; street?: string };
}

const initForm = {
  name: "",
  email: "",
  phone: "",
  gstin: "",
  type: "retail",
  address: { street: "", city: "", state: "", pincode: "" },
  notes: "",
};

// Framer Motion Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants : Variants= {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
};

const modalVariants : Variants= {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } },
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<any>(initForm);
  const [saving, setSaving] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);

    try {
      const params: any = {
        page,
        limit: 15,
      };

      if (search) params.search = search;

      const r = await api.get("/customers", { params });

      // SAFE ARRAY HANDLING
      const customerList = Array.isArray(r?.data?.customers)
        ? r.data.customers
        : Array.isArray(r?.data?.data)
          ? r.data.data
          : Array.isArray(r?.data)
            ? r.data
            : [];

      setCustomers(customerList);

      setTotal(
        typeof r?.data?.total === "number" ? r.data.total : customerList.length,
      );
    } catch (error) {
      console.error("Customers fetch error:", error);

      // IMPORTANT
      setCustomers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openAdd = () => {
    setEditCustomer(null);
    setForm(initForm);
    setShowModal(true);
  };

  const openEdit = (c: Customer) => {
    setEditCustomer(c);
    setForm({
      name: c.name,
      email: c.email || "",
      phone: c.phone || "",
      gstin: c.gstin || "",
      type: c.type,
      address: c.address || { street: "", city: "", state: "", pincode: "" },
      notes: "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editCustomer) await api.put(`/customers/${editCustomer._id}`, form);
      else await api.post("/customers", form);
      setShowModal(false);
      fetchCustomers();
    } catch (e: any) {
      alert(e.response?.data?.message || "Error saving");
    } finally {
      setSaving(false);
    }
  };

  const typeColors: Record<string, string> = {
    retail: "bg-blue-50 text-blue-600 border border-blue-100",
    wholesale: "bg-purple-50 text-purple-600 border border-purple-100",
    regular: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  };

  return (
    <AppLayout>
      {/* Light Background with Soft Pastel Orbs */}
      <div className="relative min-h-screen bg-[#f8fafc] text-slate-900 overflow-hidden rounded-3xl font-sans">
        <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-400/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-400/10 blur-[140px] pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8"
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
                Client Roster
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-2 flex items-center gap-2">
                Managing{" "}
                <span className="font-bold text-slate-700">
                  {total} active clients
                </span>
              </p>
            </div>

            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Client
            </button>
          </motion.div>

          {/* Search Bar */}
          <motion.div variants={itemVariants} className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white bg-white/70 backdrop-blur-xl text-sm font-medium text-slate-900 shadow-[0_4px_20px_rgb(0,0,0,0.03)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
              placeholder="Search clients by name, email, or phone..."
            />
          </motion.div>

          {/* Data Table */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-2 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-right">
                      Total Spent
                    </th>
                    <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-right">
                      Orders
                    </th>
                    <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                      </td>
                    </tr>
                  ) : !customers || customers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-bold">
                          No clients found
                        </p>
                        <p className="text-slate-400 text-sm mt-1">
                          Try adjusting your search criteria
                        </p>
                      </td>
                    </tr>
                  ) : (
                    (customers || []).map((c) => (
                      <tr
                        key={c._id}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100/50 flex items-center justify-center text-sm font-extrabold shadow-sm group-hover:scale-105 transition-transform">
                              {c.name[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-extrabold text-sm text-slate-900">
                                {c.name}
                              </p>
                              {c.gstin && (
                                <p className="text-xs font-bold text-slate-400 mt-0.5">
                                  GST: {c.gstin}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1.5">
                            {c.phone && (
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                {c.phone}
                              </div>
                            )}
                            {c.email && (
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {c.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs px-3 py-1 rounded-lg font-extrabold uppercase tracking-wider ${typeColors[c.type] || "bg-slate-100 text-slate-600 border border-slate-200"}`}
                          >
                            {c.type || "retail"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-extrabold text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                            {formatCurrency(c.totalPurchases)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-slate-500">
                          {c.totalOrders}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(c)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (
                                  confirm(
                                    "Are you sure you want to delete this client?",
                                  )
                                ) {
                                  await api.delete(`/customers/${c._id}`);
                                  fetchCustomers();
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Add / Edit Modal Overlay */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white rounded-3xl border border-white shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto flex flex-col"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-xl text-slate-900">
                        {editCustomer
                          ? "Edit Client Profile"
                          : "New Client Profile"}
                      </h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                        {editCustomer ? "Update Information" : "Create Record"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl transition-all shadow-sm hover:shadow"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body (Form) */}
                <div className="p-6 md:p-8 space-y-6">
                  {/* Grid 1: Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Full Name / Company Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm((p: any) => ({ ...p, name: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        placeholder="e.g. Acme Corp or Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm((p: any) => ({ ...p, email: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        placeholder="jane@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={form.phone}
                        onChange={(e) =>
                          setForm((p: any) => ({ ...p, phone: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        GST Number
                      </label>
                      <input
                        type="text"
                        value={form.gstin}
                        onChange={(e) =>
                          setForm((p: any) => ({
                            ...p,
                            gstin: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all uppercase"
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Client Type
                      </label>
                      <select
                        value={form.type}
                        onChange={(e) =>
                          setForm((p: any) => ({ ...p, type: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                      >
                        <option value="retail">Retail</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="regular">Regular</option>
                      </select>
                    </div>
                  </div>

                  <div className="h-px w-full bg-slate-100" />

                  {/* Grid 2: Address */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800 mb-4">
                      <MapPin className="w-4 h-4 text-indigo-500" /> Location
                      Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Street Address
                        </label>
                        <input
                          value={form.address?.street || ""}
                          onChange={(e) =>
                            setForm((p: any) => ({
                              ...p,
                              address: { ...p.address, street: e.target.value },
                            }))
                          }
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          placeholder="123 Design Studio St."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          City
                        </label>
                        <input
                          value={form.address.city}
                          onChange={(e) =>
                            setForm((p: any) => ({
                              ...p,
                              address: { ...p.address, city: e.target.value },
                            }))
                          }
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          placeholder="Mumbai"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          State
                        </label>
                        <input
                          value={form.address.state}
                          onChange={(e) =>
                            setForm((p: any) => ({
                              ...p,
                              address: { ...p.address, state: e.target.value },
                            }))
                          }
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          placeholder="Maharashtra"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Pincode
                        </label>
                        <input
                          value={form.address.pincode || ""}
                          onChange={(e) =>
                            setForm((p: any) => ({
                              ...p,
                              address: {
                                ...p.address,
                                pincode: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          placeholder="400001"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer (Actions) */}
                <div className="flex gap-4 p-6 md:p-8 border-t border-slate-100 bg-slate-50/50 mt-auto rounded-b-3xl">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-300"
                  >
                    {saving
                      ? "Saving..."
                      : editCustomer
                        ? "Update Client"
                        : "Save Client"}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
