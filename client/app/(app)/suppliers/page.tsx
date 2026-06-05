"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  MapPin,
  Search,
  Filter,
  AlertCircle,
  ChevronRight,
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
  address: { city: "", state: "" },
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

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [errors, setErrors] = useState<{ name?: string }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (globalError) {
      const timer = setTimeout(() => setGlobalError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [globalError]);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/suppliers", { params: { search } });
      const list =
        response.data?.suppliers || response.data?.data || response.data || [];
      setSuppliers(Array.isArray(list) ? list : []);
    } catch (error: any) {
      console.error(error);
      setSuppliers([]);
      setGlobalError(
        "Failed to fetch commercial suppliers dataset components.",
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const openAdd = () => {
    setForm(initForm);
    setErrors({});
    setEditSupplier(null);
    setShowModal(true);
  };

  const openEdit = (supplier: Supplier) => {
    setErrors({});
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
    setEditSupplier(supplier);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setErrors({ name: "Supplier baseline identity name title is required." });
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
      setGlobalError(
        error?.response?.data?.message ||
          "Operational supplier asset storage transaction failed.",
      );
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
      await api.delete(`/suppliers/${deleteId}`);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchSuppliers();
    } catch (error: any) {
      setGlobalError(
        error?.response?.data?.message ||
          "Operational pipeline execution failed to erase source metrics.",
      );
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F5F5] text-[#334155] antialiased pb-16 font-sans relative">
        {/* Universal Ribbon Message Status Toast Panel */}
        <AnimatePresence>
          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 max-w-xl w-full px-4"
            >
              <div className="bg-rose-50 border border-rose-200 shadow-xl rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-rose-900 leading-tight">
                    System Operational Alert
                  </p>
                  <p className="text-[11px] font-medium text-rose-600 mt-1">
                    {globalError}
                  </p>
                </div>
                <button
                  onClick={() => setGlobalError(null)}
                  className="p-1 hover:bg-rose-100 rounded text-rose-400 hover:text-rose-700 transition-colors"
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
            <h1 className="text-2xl font-bold tracking-tight text-[#1e293b]">
              Suppliers Directory
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <span className="hover:text-slate-800 cursor-pointer">🏠</span>
              <span>/</span>
              <span className="hover:text-slate-800 cursor-pointer">
                Logistics
              </span>
              <span>/</span>
              <span className="text-slate-600 font-semibold">
                Suppliers List
              </span>
            </div>
          </div>

          {/* Main Workspace Frame Card Sheet Layout */}
          <motion.div
            variants={itemVariants}
            className="bg-white border border-slate-200/60 rounded-lg shadow-sm p-4 sm:p-6 space-y-6"
          >
            {/* Action Bar / Controls Bar Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search logistical suppliers profiles..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                />
              </div>

              <button
                onClick={openAdd}
                className="flex items-center justify-center gap-2 bg-[#007676] hover:bg-[#005f5f] text-white px-5 py-2 rounded-md text-sm font-bold tracking-wide transition-all shadow-xs w-full sm:w-auto shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Add Supplier
              </button>
            </div>

            {/* Supplier Grid Framework Component */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-slate-200 border-t-[#007676] rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {suppliers.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="w-12 h-12 bg-slate-100 border border-slate-200/60 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
                      <Truck className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500">
                      No active supplier records resolved
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Map down your first procurement source parameters node
                      configuration card to initialize.
                    </p>
                  </div>
                ) : (
                  suppliers.map((supplier) => (
                    <div
                      key={supplier._id}
                      className="group bg-white border border-slate-200/60 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-150 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
                    >
                      <div>
                        {/* Upper Card Header */}
                        <div className="flex items-start justify-between mb-3.5">
                          <div className="w-11 h-11 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#4f46e5] font-bold text-base shrink-0 shadow-xs">
                            <Truck className="w-5 h-5 text-[#4f46e5]" />
                          </div>

                          <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity duration-150">
                            <button
                              onClick={() => openEdit(supplier)}
                              className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                            >
                              <Edit2 className="w-4 h-4 stroke-[1.8]" />
                            </button>
                            <button
                              onClick={() => triggerDelete(supplier._id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4 stroke-[1.8]" />
                            </button>
                          </div>
                        </div>

                        {/* Metadata Content */}
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm text-[#0f172a] tracking-wide truncate">
                            {supplier.name}
                          </h3>
                          {supplier.contactPerson && (
                            <p className="text-[11px] font-medium text-slate-400 truncate">
                              Rep: {supplier.contactPerson}
                            </p>
                          )}
                        </div>

                        {/* Contacts and Location Metrics */}
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs font-medium text-[#475569]">
                          {supplier.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-slate-400 shrink-0 stroke-[1.8]" />
                              <span>{supplier.phone}</span>
                            </div>
                          )}
                          {supplier.email && (
                            <div className="flex items-center gap-2 min-w-0">
                              <Mail className="w-4 h-4 text-slate-400 shrink-0 stroke-[1.8]" />
                              <span className="truncate">{supplier.email}</span>
                            </div>
                          )}
                          {(supplier.address?.city ||
                            supplier.address?.state) && (
                            <div className="flex items-center gap-2 min-w-0">
                              <MapPin className="w-4 h-4 text-slate-400 shrink-0 stroke-[1.8]" />
                              <span className="truncate">
                                {supplier.address?.city}
                                {supplier.address?.city &&
                                supplier.address?.state
                                  ? ", "
                                  : ""}
                                {supplier.address?.state}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Lower Badges Split Row */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
                        {supplier.gstin ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono text-slate-400 block">
                              GSTIN: {supplier.gstin.toUpperCase()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400 italic">
                            No GST Registered
                          </span>
                        )}
                        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#334155] bg-[#f1f5f9] border border-slate-200 px-2.5 py-0.5 rounded-md">
                          {supplier.paymentTerms || "STANDARD"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Slide-out Form Drawer Overlay */}
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
              className="fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-md bg-white border-l border-slate-200 flex flex-col pointer-events-auto shadow-2xl text-slate-800"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
                <div>
                  <h2 className="font-bold text-sm text-slate-900 tracking-wide">
                    {editSupplier
                      ? "Edit Supplier Details"
                      : "Add New Supplier"}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-900 border border-slate-200 rounded transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Form Input Parameters Workspace Container */}
              <div className="p-5 space-y-4 flex-1 overflow-y-auto bg-white">
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Supplier / Organization Title *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, name: e.target.value }));
                        if (errors.name) setErrors({});
                      }}
                      className={`w-full px-3 py-2 rounded border ${errors.name ? "border-rose-400 bg-rose-50/10" : "border-slate-200 bg-slate-50/50"} text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none transition-all`}
                      placeholder="e.g. Sterling Trading Hub"
                    />
                    {errors.name && (
                      <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Contact Representative Name
                    </label>
                    <input
                      type="text"
                      value={form.contactPerson}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          contactPerson: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none transition-all"
                      placeholder="e.g. Johnathan Doe"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={form.phone}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, phone: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none transition-all"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, email: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none transition-all"
                        placeholder="corporate@domain.com"
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
                          setForm((p) => ({ ...p, gstin: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50/50 text-xs font-mono font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none uppercase transition-all"
                        placeholder="Tax lookup system ID"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Payment Configuration
                      </label>
                      <select
                        value={form.paymentTerms}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            paymentTerms: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-600 focus:bg-white focus:border-slate-400 focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="Immediate">Immediate</option>
                        <option value="Net 15">Net 15 Days</option>
                        <option value="Net 30">Net 30 Days</option>
                        <option value="Net 45">Net 45 Days</option>
                        <option value="Net 60">Net 60 Days</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-slate-100" />

                {/* Regional Logistics Configuration Segment */}
                <div className="space-y-3">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />{" "}
                    Regional Node Logistics
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        City Location
                      </label>
                      <input
                        type="text"
                        value={form.address.city}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            address: { ...p.address, city: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        State Zone
                      </label>
                      <input
                        type="text"
                        value={form.address.state}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            address: { ...p.address, state: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Control Actions Footer */}
              <div className="flex gap-2 p-5 border-t border-slate-200 bg-slate-50/80 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded border border-slate-200 bg-white text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-all shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded bg-[#007676] hover:bg-[#005f5f] text-white text-xs font-semibold transition-all shadow-xs"
                >
                  {saving
                    ? "Saving..."
                    : editSupplier
                      ? "Save Changes"
                      : "Create Supplier"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Modal Pop-Up Section */}
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
                    Delete Supplier Profile?
                  </h3>
                  <p className="text-xs font-medium text-slate-400 px-2 leading-relaxed">
                    Are you sure you want to remove this source pipeline asset
                    permanently from memory? This action cannot be undone.
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
