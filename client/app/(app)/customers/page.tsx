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
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <AppLayout>
      {/* Outer View Canvas Framework Layer */}
      <div className="min-h-screen bg-[#F5F5F5] text-[#334155] antialiased font-sans pb-16">
        <motion.div
          className="w-full mx-auto px-4 sm:px-8 py-6 space-y-5"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Section Breadcrumbs Header Block */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#1e293b]">
              Customer list
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <span className="hover:text-slate-800 cursor-pointer">🏠</span>
              <span>/</span>
              <span className="hover:text-slate-800 cursor-pointer">
                CRM Directory
              </span>
              <span>/</span>
              <span className="text-slate-600 font-semibold">
                Customer List
              </span>
            </div>
          </div>

          {/* Main Workspace Frame Card Sheet Layout */}
          <motion.div
            variants={itemVariants}
            className="bg-white border border-slate-200/60 rounded-lg shadow-sm p-6 space-y-6"
          >
            {/* Action Bar Sub-elements Configuration Menu */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Entries Per Page - Hidden on Mobile, Visible on Desktop */}
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                <div className="relative inline-block">
                  <select className="appearance-none border border-slate-200 rounded-md px-4 py-2 pr-10 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:border-slate-400">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-slate-400">
                    ▼
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-500">
                  entries per page
                </span>
              </div>

              {/* Search and Add Customer Action Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                {/* Search Inputs - Hidden on Mobile, Visible on Desktop */}
                <div className="hidden sm:block relative sm:w-64">
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-2 border border-slate-200 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                    placeholder="Search..."
                  />
                </div>

                {/* Filters Trigger Button - Hidden on Mobile, Visible on Desktop */}
                <button className="hidden sm:block p-2.5 border border-slate-200 rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>

                {/* Add Customer Button - Full width on Mobile, Auto width on Desktop */}
                <button
                  onClick={openAdd}
                  className="flex items-center justify-center gap-2 bg-[#007676] hover:bg-[#005f5f] text-white px-5 py-2 rounded-md text-sm font-bold tracking-wide transition-all shadow-xs w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> Add Customer
                </button>
              </div>
            </div>

            {/* High Visibility Table Module */}
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#f8fafc]">
                    <th className="pl-6 px-4 py-4.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none w-1/4">
                      CUSTOMER
                    </th>
                    <th className="px-4 py-4.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none w-1/4">
                      CONTACT
                    </th>
                    <th className="px-4 py-4.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none text-center">
                      TYPE
                    </th>
                    <th className="px-4 py-4.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none text-center">
                      TOTAL SPENT
                    </th>
                    <th className="px-4 py-4.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none text-center">
                      ORDERS
                    </th>
                    <th className="pr-6 px-4 py-4.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none text-center w-32">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-slate-200 border-t-[#007676] rounded-full animate-spin" />
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Users className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-400">
                          No customer data rows present in register module.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr
                        key={c._id}
                        className="hover:bg-slate-50/40 transition-colors duration-100 group"
                      >
                        {/* CUSTOMER PROFILE ROW CELL */}
                        <td className="pl-6 px-4 py-5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#4f46e5] font-bold text-base shrink-0 shadow-xs">
                              {c.name ? c.name[0].toUpperCase() : "A"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-[#0f172a] tracking-wide">
                                {c.name || "Amit Patel"}
                              </p>
                              {c.gstin && (
                                <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                                  GSTIN: {c.gstin.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* CONTACT FIELD COLUMN ROW CELL */}
                        <td className="px-4 py-5">
                          <div className="flex flex-col space-y-1.5 text-[13px] font-medium text-[#475569]">
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

                        {/* CUSTOMER TYPE CAPSULE PILL CELL */}
                        <td className="px-4 py-5 text-center">
                          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#334155] bg-[#f1f5f9] border border-slate-200 px-3 py-1 rounded-md min-w-[80px]">
                            {c.type || "RETAIL"}
                          </span>
                        </td>

                        {/* TOTAL SPENT VALUE BLOCK LAYER CELL */}
                        <td className="px-4 py-5 text-center">
                          <span className="inline-block text-sm font-bold text-[#0f172a] bg-[#f8fafc] border border-slate-100 px-3 py-1.5 rounded-lg shadow-2xs font-sans">
                            {formatCurrency(c.totalPurchases)}
                          </span>
                        </td>

                        {/* TOTAL ORDERS NUMBER CELL */}
                        <td className="px-4 py-5 text-center text-sm font-semibold text-[#475569]">
                          {c.totalOrders || 0}
                        </td>

                        {/* ACTION PANEL CONTROL INTERACTION CELL */}
                        <td className="pr-6 px-4 py-5 text-center">
                          <div className="flex items-center justify-center gap-4">
                            <button
                              onClick={() => openEdit(c)}
                              className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                            >
                              <Edit2 className="w-4 h-4 stroke-[1.8]" />
                            </button>
                            <button
                              onClick={() => triggerDelete(c._id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
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

            {/* Desktop & Mobile Dashboard Pagination Controllers Row */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-3">
                <span className="text-sm text-slate-500 font-medium order-2 sm:order-1 text-center sm:text-left w-full sm:w-auto">
                  Showing {page} to {totalPages} of {total} entries
                </span>
                <div className="flex items-center gap-1.5 order-1 sm:order-2 justify-end w-full sm:w-auto">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors text-slate-600"
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
                        className={`px-3 py-1 text-sm font-bold border rounded-md transition-all ${page === p ? "bg-[#007676] text-white border-[#007676]" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors text-slate-600"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Slide-Over Menu Panel Sheet View Layer */}
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
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white border-l border-slate-200 flex flex-col pointer-events-auto shadow-2xl text-slate-800"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
                <div>
                  <h2 className="font-bold text-sm text-slate-900 tracking-wide">
                    {editCustomer
                      ? "Edit Customer Details"
                      : "Add New Customer"}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-900 border border-slate-200 rounded transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Form entries layout metrics */}
              <div className="p-5 space-y-4 flex-1 overflow-y-auto bg-white">
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p: any) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none transition-all"
                      placeholder="Full Identity Name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm((p: any) => ({ ...p, email: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none transition-all"
                        placeholder="name@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={form.phone}
                        onChange={(e) =>
                          setForm((p: any) => ({ ...p, phone: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none transition-all"
                        placeholder="Mobile Number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        GSTIN Code
                      </label>
                      <input
                        type="text"
                        value={form.gstin}
                        onChange={(e) =>
                          setForm((p: any) => ({ ...p, gstin: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none uppercase transition-all"
                        placeholder="GST identification lookup"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Customer Type
                      </label>
                      <select
                        value={form.type}
                        onChange={(e) =>
                          setForm((p: any) => ({ ...p, type: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-600 focus:bg-white focus:border-slate-400 focus:outline-none cursor-pointer"
                      >
                        <option value="RETAIL">Retail</option>
                        <option value="WHOLESALE">Wholesale</option>
                        <option value="REGULAR">Regular</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-slate-100" />

                <div className="space-y-3">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Core
                    Location Details
                  </h3>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
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
                      className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={form.address?.city || ""}
                        onChange={(e) =>
                          setForm((p: any) => ({
                            ...p,
                            address: { ...p.address, city: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={form.address?.state || ""}
                        onChange={(e) =>
                          setForm((p: any) => ({
                            ...p,
                            address: { ...p.address, state: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={form.address?.pincode || ""}
                        onChange={(e) =>
                          setForm((p: any) => ({
                            ...p,
                            address: { ...p.address, pincode: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 p-5 border-t border-slate-200 bg-slate-50/80 sticky bottom-0">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded border border-slate-200 bg-white text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-all shadow-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded bg-[#007676] hover:bg-[#005f5f] text-white text-xs font-semibold transition-all shadow-xs"
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

      {/* Confirmation Modal Operations Layout Pop-Up Section */}
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
                className="bg-white rounded border border-slate-200 w-full max-w-sm pointer-events-auto shadow-2xl p-5 text-center space-y-4"
              >
                <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
                  <AlertCircle className="w-5 h-5 stroke-[2.2]" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Delete Customer Record?
                  </h3>
                  <p className="text-xs font-medium text-slate-400 px-2 leading-relaxed">
                    This step removes the dashboard memory ledger instance for
                    this customer completely.
                  </p>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 rounded border border-slate-200 text-xs font-bold text-slate-500 bg-white hover:bg-slate-50 transition-colors"
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
