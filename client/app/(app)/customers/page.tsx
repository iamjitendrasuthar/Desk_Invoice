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
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  SlidersHorizontal,
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

const LIMIT = 10;
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (search) params.search = search;
      const r = await api.get("/customers", { params });
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
    if (!form.name) {
      alert("Customer name is required");
      return;
    }
    setSaving(true);
    try {
      if (editCustomer) await api.put(`/customers/${editCustomer._id}`, form);
      else await api.post("/customers", form);
      setShowModal(false);
      fetchCustomers();
    } catch (e: any) {
      alert(e.response?.data?.message || "Error saving customer records");
    } finally {
      setSaving(false);
    }
  };

  const triggerDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/customers/${deleteId}`);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchCustomers();
    } catch (e: any) {
      alert(e.response?.data?.message || "Error deleting parameter");
    }
  };

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      )
        pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const inputCls =
    "w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700/50 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-700 focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none transition-all";

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0f172a] text-[#334155] dark:text-slate-300 antialiased font-sans pb-16 transition-colors duration-200">
        <motion.div
          className="w-full mx-auto px-4 sm:px-8 py-6 space-y-5"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#1e293b] dark:text-white">
              Customer list
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
                🏠
              </span>
              <span>/</span>
              <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
                CRM Directory
              </span>
              <span>/</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                Customer List
              </span>
            </div>
          </div>

          {/* Main Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 rounded-lg shadow-sm p-6 space-y-6"
          >
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="relative inline-block">
                  <select className="appearance-none border border-slate-200 dark:border-slate-600 rounded-md px-4 py-2 pr-10 bg-white dark:bg-slate-700/50 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-slate-400">
                    ▼
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  entries per page
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <div className="hidden sm:block relative sm:w-64">
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700/50 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                    placeholder="Search..."
                  />
                </div>
                <button className="hidden sm:block p-2.5 border border-slate-200 dark:border-slate-600 rounded-md text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                <button
                  onClick={openAdd}
                  className="flex items-center justify-center gap-2 bg-[#007676] hover:bg-[#005f5f] text-white px-5 py-2 rounded-md text-sm font-bold tracking-wide transition-all shadow-xs w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> Add Customer
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-700/40">
                    {[
                      "CUSTOMER",
                      "CONTACT",
                      "TYPE",
                      "TOTAL SPENT",
                      "ORDERS",
                      "ACTIONS",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`${i === 0 ? "pl-6 w-1/4" : ""} ${i === 5 ? "pr-6 text-center w-32" : ""} ${i >= 2 && i <= 4 ? "text-center" : ""} px-4 py-4.5 text-xs font-bold text-[#475569] dark:text-slate-400 uppercase tracking-wider select-none`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-white dark:bg-transparent">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-slate-200 dark:border-slate-600 border-t-[#007676] rounded-full animate-spin" />
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Users className="w-6 h-6 text-slate-300 dark:text-slate-500" />
                        </div>
                        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                          No customer data rows present in register module.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr
                        key={c._id}
                        className="hover:bg-slate-50/40 dark:hover:bg-slate-700/30 transition-colors duration-100 group"
                      >
                        <td className="pl-6 px-4 py-5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-lg bg-[#eff6ff] dark:bg-slate-700 flex items-center justify-center text-[#4f46e5] dark:text-indigo-400 font-bold text-base shrink-0 shadow-xs">
                              {c.name ? c.name[0].toUpperCase() : "A"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-[#0f172a] dark:text-slate-100 tracking-wide">
                                {c.name || "Amit Patel"}
                              </p>
                              {c.gstin && (
                                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 block mt-0.5">
                                  GSTIN: {c.gstin.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex flex-col space-y-1.5 text-[13px] font-medium text-[#475569] dark:text-slate-400">
                            {c.phone && (
                              <span className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400 shrink-0 stroke-[1.8]" />
                                {c.phone}
                              </span>
                            )}
                            {c.email && (
                              <span className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400 shrink-0 stroke-[1.8]" />
                                {c.email}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#334155] dark:text-slate-300 bg-[#f1f5f9] dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1 rounded-md min-w-[80px]">
                            {c.type || "RETAIL"}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <span className="inline-block text-sm font-bold text-[#0f172a] dark:text-slate-100 bg-[#f8fafc] dark:bg-slate-700 border border-slate-100 dark:border-slate-600 px-3 py-1.5 rounded-lg shadow-2xs font-sans">
                            {formatCurrency(c.totalPurchases)}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-center text-sm font-semibold text-[#475569] dark:text-slate-400">
                          {c.totalOrders || 0}
                        </td>
                        <td className="pr-6 px-4 py-5 text-center">
                          <div className="flex items-center justify-center gap-4">
                            <button
                              onClick={() => openEdit(c)}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1"
                            >
                              <Edit2 className="w-4 h-4 stroke-[1.8]" />
                            </button>
                            <button
                              onClick={() => triggerDelete(c._id)}
                              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700 gap-3">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium order-2 sm:order-1 text-center sm:text-left w-full sm:w-auto">
                  Showing {page} to {totalPages} of {total} entries
                </span>
                <div className="flex items-center gap-1.5 order-1 sm:order-2 justify-end w-full sm:w-auto">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors text-slate-600 dark:text-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {getPageNumbers().map((p, i) =>
                    p === "..." ? (
                      <span
                        key={i}
                        className="px-2 text-slate-400 text-sm font-bold select-none"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`px-3 py-1 text-sm font-bold border rounded-md transition-all ${page === p ? "bg-[#007676] text-white border-[#007676]" : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"}`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors text-slate-600 dark:text-slate-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Add/Edit Drawer */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-xs"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col pointer-events-auto shadow-2xl text-slate-800 dark:text-slate-200"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 sticky top-0 z-10">
                <h2 className="font-bold text-sm text-slate-900 dark:text-white tracking-wide">
                  {editCustomer ? "Edit Customer Details" : "Add New Customer"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-600 rounded transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-5 space-y-4 flex-1 overflow-y-auto bg-white dark:bg-slate-800">
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p: any) => ({ ...p, name: e.target.value }))
                      }
                      className={inputCls}
                      placeholder="Full Identity Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm((p: any) => ({ ...p, email: e.target.value }))
                        }
                        className={inputCls}
                        placeholder="name@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={form.phone}
                        onChange={(e) =>
                          setForm((p: any) => ({ ...p, phone: e.target.value }))
                        }
                        className={inputCls}
                        placeholder="Mobile Number"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        GSTIN Code
                      </label>
                      <input
                        type="text"
                        value={form.gstin}
                        onChange={(e) =>
                          setForm((p: any) => ({ ...p, gstin: e.target.value }))
                        }
                        className={`${inputCls} uppercase`}
                        placeholder="GST identification lookup"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Customer Type
                      </label>
                      <select
                        value={form.type}
                        onChange={(e) =>
                          setForm((p: any) => ({ ...p, type: e.target.value }))
                        }
                        className={`${inputCls} appearance-none cursor-pointer`}
                      >
                        <option value="RETAIL">Retail</option>
                        <option value="WHOLESALE">Wholesale</option>
                        <option value="REGULAR">Regular</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-slate-100 dark:bg-slate-700" />

                <div className="space-y-3">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Core
                    Location Details
                  </h3>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={form.address?.street || ""}
                      onChange={(e) =>
                        setForm((p: any) => ({
                          ...p,
                          address: { ...p.address, street: e.target.value },
                        }))
                      }
                      className={inputCls}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "City", key: "city" },
                      { label: "State", key: "state" },
                      { label: "Pincode", key: "pincode" },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          {label}
                        </label>
                        <input
                          type="text"
                          value={form.address?.[key] || ""}
                          onChange={(e) =>
                            setForm((p: any) => ({
                              ...p,
                              address: { ...p.address, [key]: e.target.value },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700/50 text-xs font-medium text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-700 focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 sticky bottom-0">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all shadow-xs"
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
                    : editCustomer
                      ? "Save Changes"
                      : "Create Customer"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
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
                    Delete Customer Record?
                  </h3>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 px-2 leading-relaxed">
                    This step removes the dashboard memory ledger instance for
                    this customer completely.
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
    </AppLayout>
  );
}
