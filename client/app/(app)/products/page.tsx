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
  AlertTriangle,
  Package,
  X,
  Filter,
  Boxes,
  Tag,
  Barcode,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  sellingPrice: number;
  purchasePrice: number;
  stock: number;
  lowStockAlert: number;
  gstRate: number;
  unit: string;
  isActive: boolean;
  isLowStock: boolean;
}

const initialForm = {
  name: "",
  sku: "",
  barcode: "",
  category: "",
  description: "",
  purchasePrice: 0,
  sellingPrice: 0,
  gstRate: 18,
  unit: "pcs",
  stock: 0,
  lowStockAlert: 10,
};

const LIMIT = 15;
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    sellingPrice?: string;
  }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (globalError) {
      const timer = setTimeout(() => setGlobalError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [globalError]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: LIMIT };
      if (search) params.search = search;
      if (category) params.category = category;

      const r = await api.get("/products", { params });
      const list = r.data?.data;
      setProducts(Array.isArray(list) ? list : []);
      setTotal(r.data?.total ?? 0);
    } catch (e: any) {
      setProducts([]);
      setTotal(0);
      setGlobalError(
        e.response?.data?.message || "Failed to fetch inventory matrix data.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api
      .get("/products/categories")
      .then((r) => {
        const cats = r.data?.data;
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(() => setCategories([]));
  }, []);

  const openAdd = () => {
    setEditProduct(null);
    setForm(initialForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setErrors({});
    setForm({
      name: p.name,
      sku: p.sku || "",
      barcode: p.barcode || "",
      category: p.category || "",
      description: "",
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      gstRate: p.gstRate ?? 0,
      unit: p.unit,
      stock: p.stock,
      lowStockAlert: p.lowStockAlert,
    });
    setShowModal(true);
  };

  const validateForm = () => {
    const tempErrors: { name?: string; sellingPrice?: string } = {};
    let isValid = true;

    if (!form.name.trim()) {
      tempErrors.name = "Product name architecture parameter is required.";
      isValid = false;
    }
    if (!form.sellingPrice || form.sellingPrice <= 0) {
      tempErrors.sellingPrice =
        "Valid retail selling price distribution value is required.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, form);
      } else {
        await api.post("/products", form);
      }
      setShowModal(false);
      fetchProducts();
    } catch (e: any) {
      setGlobalError(
        e.response?.data?.message || "Failed to finalize catalog records save.",
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
      await api.delete(`/products/${deleteId}`);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchProducts();
    } catch (e: any) {
      setGlobalError(
        e.response?.data?.message ||
          "Operational system failed to perform product elimination.",
      );
    }
  };

  const lowStockCount = products.filter((p) => p.isLowStock).length;

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
      <div className="min-h-screen bg-[#F5F5F5] text-[#334155] antialiased pb-16 font-sans relative">
        {/* Global Error Toast Notification Layout */}
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
              Products Inventory
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="hover:text-slate-800 cursor-pointer">🏠</span>
              <span>/</span>
              <span className="hover:text-slate-800 cursor-pointer">
                Catalog
              </span>
              <span>/</span>
              <span className="text-slate-600 font-semibold">
                Products List
              </span>
            </div>
          </div>

          {/* High Visibility Stock Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <motion.div
              variants={itemVariants}
              className="bg-white border border-slate-200/60 p-4 sm:p-6 rounded-lg shadow-sm flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Total Products
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-[#1e293b] block tracking-tight">
                  {total}
                </span>
              </div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shadow-2xs">
                <Boxes className="w-4 h-4 text-slate-500" />
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white border border-slate-200/60 p-4 sm:p-6 rounded-lg shadow-sm flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Low Stock Items
                </span>
                <span
                  className={`text-2xl sm:text-3xl font-bold block tracking-tight ${lowStockCount > 0 ? "text-rose-600" : "text-[#1e293b]"}`}
                >
                  {lowStockCount}
                </span>
              </div>
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg border flex items-center justify-center shadow-2xs ${lowStockCount > 0 ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-slate-50 border-slate-200 text-slate-400"}`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white border border-slate-200/60 p-4 sm:p-6 rounded-lg shadow-sm flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Active Categories
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-[#1e293b] block tracking-tight">
                  {categories.length}
                </span>
              </div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shadow-2xs">
                <Tag className="w-4 h-4 text-slate-500" />
              </div>
            </motion.div>
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
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                  placeholder="Search products by name, SKU..."
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-[200px] shrink-0">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-md bg-white text-sm font-semibold text-slate-600 focus:outline-none focus:border-slate-400 appearance-none cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-slate-400">
                    ▼
                  </span>
                </div>

                <button
                  onClick={openAdd}
                  className="flex items-center justify-center gap-2 bg-[#007676] hover:bg-[#005f5f] text-white px-5 py-2 rounded-md text-sm font-bold tracking-wide transition-all shadow-xs w-full sm:w-auto shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> Add Product
                </button>
              </div>
            </div>

            {/* Inventory Data Table Module (Horizontal Scroll on Mobile) */}
            <div className="overflow-x-auto -mx-4 sm:mx-6">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#f8fafc]">
                    <th className="pl-6 px-4 py-4.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none w-1/3">
                      PRODUCT DETAILS
                    </th>
                    <th className="px-4 py-4.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none text-center">
                      CATEGORY
                    </th>
                    <th className="px-4 py-4.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none text-center">
                      PURCHASE COST
                    </th>
                    <th className="px-4 py-4.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none text-center">
                      SELLING PRICE
                    </th>
                    <th className="px-4 py-4.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none text-center">
                      GST RATE
                    </th>
                    <th className="px-4 py-4.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none text-center">
                      CURRENT STOCK
                    </th>
                    <th className="pr-6 px-4 py-4.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none text-center w-32">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-slate-200 border-t-[#007676] rounded-full animate-spin" />
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-20">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Package className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-400">
                          No product data records found matching parameters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr
                        key={p._id}
                        className="hover:bg-slate-50/40 transition-colors duration-100 group"
                      >
                        <td className="pl-6 px-4 py-5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-lg bg-[#eff6ff] flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                              <Boxes className="w-5 h-5 text-[#4f46e5]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-[#0f172a] tracking-wide truncate max-w-[200px] sm:max-w-none">
                                {p.name}
                              </p>
                              {p.sku && (
                                <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                                  SKU: {p.sku.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#334155] bg-[#f1f5f9] border border-slate-200 px-3 py-1 rounded-md min-w-[80px]">
                            {p.category || "GENERAL"}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-center text-sm font-medium text-slate-500">
                          {formatCurrency(p.purchasePrice)}
                        </td>
                        <td className="px-4 py-5 text-center">
                          <span className="inline-block text-sm font-bold text-[#0f172a] bg-[#f8fafc] border border-slate-100 px-3 py-1.5 rounded-lg shadow-2xs font-sans">
                            {formatCurrency(p.sellingPrice)}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-center text-sm font-semibold text-[#475569]">
                          {p.gstRate ?? 0}%
                        </td>
                        <td className="px-4 py-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span
                              className={`text-sm font-bold ${p.isLowStock ? "text-rose-600 font-black" : "text-slate-800"}`}
                            >
                              {p.stock}{" "}
                              <span className="text-[11px] text-slate-400 font-normal lowercase">
                                {p.unit}
                              </span>
                            </span>
                            {p.isLowStock && (
                              <span className="relative flex h-2 w-2 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="pr-6 px-4 py-5 text-center">
                          <div className="flex items-center justify-center gap-4">
                            <button
                              onClick={() => openEdit(p)}
                              className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                            >
                              <Edit2 className="w-4 h-4 stroke-[1.8]" />
                            </button>
                            <button
                              onClick={() => triggerDelete(p._id)}
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

            {/* Pagination Controllers Row (Responsive Flex Layout) */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-4">
                <span className="text-sm text-slate-500 font-medium order-2 sm:order-1 text-center sm:text-left w-full sm:w-auto">
                  Showing {page} to {totalPages} of {total} entries
                </span>
                <div className="flex items-center gap-1.5 order-1 sm:order-2 justify-center sm:justify-end w-full sm:w-auto">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors text-slate-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none px-1">
                    {getPageNumbers().map((p, i) =>
                      p === "..." ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="px-1 text-slate-400 text-sm font-bold select-none"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`px-3 py-1 text-sm font-bold border rounded-md transition-all shrink-0 ${page === p ? "bg-[#007676] text-white border-[#007676]" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  </div>
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

      {/* Slide-out Panel Overlay */}
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
                <h2 className="font-bold text-sm text-slate-900 tracking-wide">
                  {editProduct ? "Edit Product Details" : "Add New Product"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-900 border border-slate-200 rounded transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Form Input Container */}
              <div className="p-5 space-y-4 flex-1 overflow-y-auto bg-white">
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, name: e.target.value }));
                        if (errors.name)
                          setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      className={`w-full px-3 py-2 rounded border ${errors.name ? "border-rose-400 bg-rose-50/10" : "border-slate-200 bg-slate-50/50"} text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none transition-all`}
                      placeholder="e.g. Premium Office Desk"
                    />
                    {errors.name && (
                      <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={form.category}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, category: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none transition-all"
                        placeholder="e.g. Furniture"
                        list="drawer-categories-list"
                      />
                      <datalist id="drawer-categories-list">
                        {categories.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Measurement Unit
                      </label>
                      <select
                        value={form.unit}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, unit: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-600 focus:bg-white focus:border-slate-400 focus:outline-none appearance-none cursor-pointer"
                      >
                        {[
                          "pcs",
                          "kg",
                          "g",
                          "l",
                          "ml",
                          "box",
                          "dozen",
                          "set",
                        ].map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        SKU Identification
                      </label>
                      <input
                        type="text"
                        value={form.sku}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, sku: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none transition-all"
                        placeholder="SKU string"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Barcode Value
                      </label>
                      <div className="relative">
                        <Barcode className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={form.barcode}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, barcode: e.target.value }))
                          }
                          className="w-full pl-8 pr-3 py-2 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none transition-all"
                          placeholder="Universal ID"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-slate-100" />

                {/* Pricing Metrics */}
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Purchase Cost (₹)
                      </label>
                      <input
                        type="number"
                        value={form.purchasePrice}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            purchasePrice: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={form.sellingPrice}
                        onChange={(e) => {
                          setForm((p) => ({
                            ...p,
                            sellingPrice: parseFloat(e.target.value) || 0,
                          }));
                          if (errors.sellingPrice)
                            setErrors((prev) => ({
                              ...prev,
                              sellingPrice: undefined,
                            }));
                        }}
                        className={`w-full px-3 py-2 rounded border ${errors.sellingPrice ? "border-rose-400 bg-rose-50/10" : "border-slate-200 bg-slate-50/50"} text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none transition-all`}
                      />
                      {errors.sellingPrice && (
                        <p className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{" "}
                          {errors.sellingPrice}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        GST Slab
                      </label>
                      <select
                        value={form.gstRate}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            gstRate: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-1.5 py-1.5 rounded border border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-600 focus:bg-white focus:border-slate-400 focus:outline-none"
                      >
                        {["0", "5", "12", "18", "28"].map((r) => (
                          <option key={r} value={r}>
                            {r}%
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Stock Vol
                      </label>
                      <input
                        type="number"
                        value={form.stock}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            stock: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-2 py-1.5 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 truncate">
                        Alert Limit
                      </label>
                      <input
                        type="number"
                        value={form.lowStockAlert}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            lowStockAlert: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-2 py-1.5 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Sticky Footer Actions */}
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
                  className="flex-1 px-4 py-2 rounded bg-[#007676] hover:bg-[#005f5f] text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
                >
                  {saving ? "Saving..." : editProduct ? "Save" : "Create"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Deletion Modal Section */}
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
                    Delete Product Profile?
                  </h3>
                  <p className="text-xs font-medium text-slate-400 px-2 leading-relaxed">
                    Are you sure you want to remove this catalog item
                    permanently? This action cannot be undone.
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
