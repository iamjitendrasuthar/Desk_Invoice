"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import api from "@/lib/api";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Truck,
  X,
  Phone,
  Mail,
  Building2,
  CreditCard,
  User,
  MapPin,
  Search,
  Filter,
} from "lucide-react";

interface Supplier {
  _id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  paymentTerms?: string;
  notes?: string;
  address?: {
    city?: string;
    state?: string;
  };
}

const initForm = {
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  gstin: "",
  paymentTerms: "Net 30",
  notes: "",
  address: {
    city: "",
    state: "",
  },
};

const containerVariants : Variants= {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants : Variants= {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);

  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get("/suppliers", {
        params: {
          search,
        },
      });

      const list =
        response.data?.suppliers || response.data?.data || response.data || [];

      setSuppliers(Array.isArray(list) ? list : []);
    } catch (error) {
      console.log(error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const openAdd = () => {
    setEditSupplier(null);
    setForm(initForm);
    setShowModal(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditSupplier(supplier);

    setForm({
      name: supplier.name || "",
      contactPerson: supplier.contactPerson || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      gstin: supplier.gstin || "",
      paymentTerms: supplier.paymentTerms || "Net 30",
      notes: supplier.notes || "",
      address: {
        city: supplier.address?.city || "",
        state: supplier.address?.state || "",
      },
    });

    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("Supplier name is required");
      return;
    }

    setSaving(true);

    try {
      if (editSupplier) {
        await api.put(`/suppliers/${editSupplier._id}`, form);
      } else {
        await api.post("/suppliers", form);
      }

      setShowModal(false);
      fetchSuppliers();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Error saving supplier");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this supplier?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Error deleting supplier");
    }
  };

  return (
    <AppLayout>
      <div className="relative min-h-screen bg-[#f8fafc] text-slate-900 overflow-hidden rounded-3xl font-sans">
        {/* Background Blur */}
        <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[140px] pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
          >
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                Suppliers
              </h1>

              <p className="text-slate-500 text-sm font-medium mt-2">
                Managing{" "}
                <span className="font-bold text-slate-700">
                  {suppliers.length} suppliers
                </span>
              </p>
            </div>

            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Add Supplier
            </button>
          </motion.div>

          {/* Search */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-4 bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex items-center gap-2 pr-4 md:border-r border-slate-200">
              <Filter className="w-5 h-5 text-indigo-500" />

              <span className="font-extrabold text-sm text-slate-700">
                Filters
              </span>
            </div>

            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search supplier..."
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white/50 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
              />
            </div>
          </motion.div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {suppliers.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white/50 backdrop-blur-md rounded-3xl border border-white shadow-sm">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                    <Truck className="w-10 h-10 text-slate-300" />
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 mb-1">
                    No Suppliers Found
                  </h3>

                  <p className="text-slate-500 font-medium text-sm">
                    Add your first supplier to manage your business.
                  </p>
                </div>
              ) : (
                suppliers.map((supplier) => (
                  <motion.div
                    key={supplier._id}
                    variants={itemVariants}
                    className="group bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Top */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border border-indigo-100/50 group-hover:scale-105 transition-transform">
                          <Truck className="w-6 h-6 text-indigo-600" />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(supplier)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(supplier._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900 truncate">
                        {supplier.name}
                      </h3>
                    </div>

                    {/* Contact */}
                    <div className="mt-5 space-y-2.5">
                      {supplier.phone && (
                        <div className="flex items-center gap-2.5 text-sm font-bold text-slate-600">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <Phone className="w-3.5 h-3.5" />
                          </div>

                          {supplier.phone}
                        </div>
                      )}

                      {supplier.email && (
                        <div className="flex items-center gap-2.5 text-sm font-bold text-slate-600">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <Mail className="w-3.5 h-3.5" />
                          </div>

                          <span className="truncate">{supplier.email}</span>
                        </div>
                      )}

                      {(supplier.address?.city || supplier.address?.state) && (
                        <div className="flex items-center gap-2.5 text-sm font-bold text-slate-600">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>

                          <span>
                            {supplier.address?.city}
                            {supplier.address?.city && supplier.address?.state
                              ? ", "
                              : ""}
                            {supplier.address?.state}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      {supplier.gstin ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            GST
                          </span>

                          <span className="text-xs font-bold text-slate-700">
                            {supplier.gstin}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 italic">
                          No GST
                        </span>
                      )}

                      <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md">
                        {supplier.paymentTerms || "Standard"}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Modal */}
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
                {/* Header */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                      <Building2 className="w-6 h-6" />
                    </div>

                    <div>
                      <h2 className="font-extrabold text-xl text-slate-900">
                        {editSupplier ? "Edit Supplier" : "New Supplier"}
                      </h2>

                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                        {editSupplier ? "Update Supplier" : "Add Supplier"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl transition-all shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Supplier Name *
                      </label>

                      <input
                        value={form.name}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        placeholder="Enter supplier name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Phone
                      </label>

                      <input
                        value={form.phone}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            phone: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Email
                      </label>

                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            email: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        GST Number
                      </label>

                      <input
                        value={form.gstin}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            gstin: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Payment Terms
                      </label>

                      <select
                        value={form.paymentTerms}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            paymentTerms: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
                      >
                        <option value="Immediate">Immediate</option>

                        <option value="Net 15">Net 15 Days</option>

                        <option value="Net 30">Net 30 Days</option>

                        <option value="Net 45">Net 45 Days</option>

                        <option value="Net 60">Net 60 Days</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        City
                      </label>

                      <input
                        value={form.address.city}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            address: {
                              ...p.address,
                              city: e.target.value,
                            },
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
                        value={form.address.state}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            address: {
                              ...p.address,
                              state: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-4 p-6 md:p-8 border-t border-slate-100 bg-slate-50/50 mt-auto rounded-b-3xl">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-60 transition-all duration-300"
                  >
                    {saving
                      ? "Saving..."
                      : editSupplier
                        ? "Update Supplier"
                        : "Save Supplier"}
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
