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
  ShoppingCart,
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
      setGlobalError(e.response?.data?.message || "Failed to fetch products.");
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
      tempErrors.name = "Product name is required.";
      isValid = false;
    }
    if (!form.sellingPrice || form.sellingPrice <= 0) {
      tempErrors.sellingPrice = "Valid selling price is required.";
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
      setGlobalError(e.response?.data?.message || "Failed to save product.");
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
      setGlobalError(e.response?.data?.message || "Failed to delete product.");
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
      )
        pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const inputClass =
    "w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700/50 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-700 focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none transition-all";

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0f172a] text-[#334155] dark:text-slate-300 antialiased pb-16 font-sans relative transition-colors duration-200">
        {/* Global Error Toast */}
        <AnimatePresence>
          {globalError && (
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
                    System Alert
                  </p>
                  <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 mt-1">
                    {globalError}
                  </p>
                </div>
                <button
                  onClick={() => setGlobalError(null)}
                  className="p-1 hover:bg-rose-100 dark:hover:bg-rose-800/50 rounded text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
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
              Products Inventory
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
                🏠
              </span>
              <span>/</span>
              <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
                Catalog
              </span>
              <span>/</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                Products List
              </span>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                label: "Total Products",
                value: total,
                icon: Boxes,
                color: "text-slate-500 dark:text-slate-400",
                bg: "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600",
              },
              {
                label: "Low Stock Items",
                value: lowStockCount,
                icon: AlertTriangle,
                color:
                  lowStockCount > 0
                    ? "text-rose-500 dark:text-rose-400"
                    : "text-slate-400",
                bg:
                  lowStockCount > 0
                    ? "bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800"
                    : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600",
                valColor:
                  lowStockCount > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-[#1e293b] dark:text-white",
              },
              {
                label: "Active Categories",
                value: categories.length,
                icon: Tag,
                color: "text-slate-500 dark:text-slate-400",
                bg: "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600",
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
                  <span
                    className={`text-2xl sm:text-3xl font-bold block tracking-tight ${"valColor" in s ? s.valColor : "text-[#1e293b] dark:text-white"}`}
                  >
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
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700/50 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
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
                    className="w-full pl-9 pr-10 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700/50 text-sm font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 appearance-none cursor-pointer"
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

            {/* Table */}
            <div className="overflow-x-auto -mx-4 sm:mx-6">
              <table className="w-full text-left border-collapse min-w-[1080px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-700/40">
                    {[
                      "PRODUCT DETAILS",
                      "CATEGORY",
                      "PURCHASE COST",
                      "SELLING PRICE",
                      "GST RATE",
                      "CURRENT STOCK",
                      "ACTIONS",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`${i === 0 ? "pl-6 w-1/3" : ""} ${i === 6 ? "pr-6 text-center w-40" : ""} ${i > 0 && i < 6 ? "text-center" : ""} px-4 py-4 text-xs font-bold text-[#475569] dark:text-slate-400 uppercase tracking-wider select-none`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-white dark:bg-transparent">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-slate-200 dark:border-slate-600 border-t-[#007676] rounded-full animate-spin" />
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-20">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Package className="w-6 h-6 text-slate-300 dark:text-slate-500" />
                        </div>
                        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                          No product records found.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => {
                      const isOut = p.stock <= 0;
                      return (
                        <tr
                          key={p._id}
                          className={`transition-colors duration-100 group ${
                            isOut
                              ? "bg-rose-50/40 dark:bg-rose-900/5 hover:bg-rose-50/70 dark:hover:bg-rose-900/10"
                              : "hover:bg-slate-50/40 dark:hover:bg-slate-700/30"
                          }`}
                        >
                          {/* Product Details */}
                          <td className="pl-6 px-4 py-5">
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold text-base shrink-0 shadow-xs ${
                                  isOut
                                    ? "bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800"
                                    : "bg-[#eff6ff] dark:bg-slate-700"
                                }`}
                              >
                                <Boxes
                                  className={`w-5 h-5 ${isOut ? "text-rose-400 dark:text-rose-500" : "text-[#4f46e5] dark:text-indigo-400"}`}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-[#0f172a] dark:text-slate-100 tracking-wide truncate max-w-[200px] sm:max-w-none">
                                  {p.name}
                                </p>
                                {p.sku && (
                                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 block mt-0.5">
                                    SKU: {p.sku.toUpperCase()}
                                  </span>
                                )}
                                {/* Out of stock tag */}
                                {isOut && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-500 border border-rose-200 dark:border-rose-700 mt-1">
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                                    </span>
                                    Out of Stock
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-5 text-center">
                            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#334155] dark:text-slate-300 bg-[#f1f5f9] dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1 rounded-md min-w-[80px]">
                              {p.category || "GENERAL"}
                            </span>
                          </td>

                          {/* Purchase Cost */}
                          <td className="px-4 py-5 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                            {formatCurrency(p.purchasePrice)}
                          </td>

                          {/* Selling Price */}
                          <td className="px-4 py-5 text-center">
                            <span className="inline-block text-sm font-bold text-[#0f172a] dark:text-slate-100 bg-[#f8fafc] dark:bg-slate-700 border border-slate-100 dark:border-slate-600 px-3 py-1.5 rounded-lg shadow-2xs">
                              {formatCurrency(p.sellingPrice)}
                            </span>
                          </td>

                          {/* GST */}
                          <td className="px-4 py-5 text-center text-sm font-semibold text-[#475569] dark:text-slate-400">
                            {p.gstRate ?? 0}%
                          </td>

                          {/* Stock */}
                          <td className="px-4 py-5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span
                                className={`text-sm font-bold ${
                                  isOut
                                    ? "text-rose-600 dark:text-rose-400 font-black"
                                    : p.isLowStock
                                      ? "text-amber-600 dark:text-amber-400 font-black"
                                      : "text-slate-800 dark:text-slate-200"
                                }`}
                              >
                                {p.stock}{" "}
                                <span className="text-[11px] text-slate-400 font-normal lowercase">
                                  {p.unit}
                                </span>
                              </span>
                              {(p.isLowStock || isOut) && (
                                <span className="relative flex h-2 w-2 shrink-0">
                                  <span
                                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOut ? "bg-rose-400" : "bg-amber-400"}`}
                                  />
                                  <span
                                    className={`relative inline-flex rounded-full h-2 w-2 ${isOut ? "bg-rose-500" : "bg-amber-500"}`}
                                  />
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="pr-6 px-4 py-5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEdit(p)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1"
                                title="Edit product"
                              >
                                <Edit2 className="w-4 h-4 stroke-[1.8]" />
                              </button>

                              {/* Reorder button */}
                              {isOut ? (
                                <a
                                  href={`/suppliers?reorder=${encodeURIComponent(p.name)}`}
                                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2.5 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-sm"
                                  title="Reorder stock"
                                >
                                  <ShoppingCart className="w-3 h-3" />
                                  Reorder
                                </a>
                              ) : (
                                <a
                                  href={`/suppliers?reorder=${encodeURIComponent(p.name)}`}
                                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
                                  title="Reorder stock"
                                >
                                  <ShoppingCart className="w-3 h-3" />
                                  Reorder
                                </a>
                              )}

                              <button
                                onClick={() => triggerDelete(p._id)}
                                className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
                                title="Delete product"
                              >
                                <Trash2 className="w-4 h-4 stroke-[1.8]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700 gap-4">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium order-2 sm:order-1 text-center sm:text-left w-full sm:w-auto">
                  Showing {page} to {totalPages} of {total} entries
                </span>
                <div className="flex items-center gap-1.5 order-1 sm:order-2 justify-center sm:justify-end w-full sm:w-auto">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors text-slate-600 dark:text-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none px-1">
                    {getPageNumbers().map((p, i) =>
                      p === "..." ? (
                        <span
                          key={`e-${i}`}
                          className="px-1 text-slate-400 text-sm font-bold select-none"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`px-3 py-1 text-sm font-bold border rounded-md transition-all shrink-0 ${
                            page === p
                              ? "bg-[#007676] text-white border-[#007676]"
                              : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  </div>
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
              className="fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-md bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col pointer-events-auto shadow-2xl text-slate-800 dark:text-slate-200"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 sticky top-0 z-10">
                <h2 className="font-bold text-sm text-slate-900 dark:text-white tracking-wide">
                  {editProduct ? "Edit Product Details" : "Add New Product"}
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
                      className={`w-full px-3 py-2 rounded border text-xs font-medium focus:outline-none transition-all dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-500 ${errors.name ? "border-rose-400 bg-rose-50/10 dark:border-rose-600" : "border-slate-200 dark:border-slate-600 bg-slate-50/50 focus:bg-white dark:focus:bg-slate-700 focus:border-slate-400 dark:focus:border-slate-500"}`}
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
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={form.category}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, category: e.target.value }))
                        }
                        className={inputClass}
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
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Unit
                      </label>
                      <select
                        value={form.unit}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, unit: e.target.value }))
                        }
                        className={
                          inputClass + " appearance-none cursor-pointer"
                        }
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
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={form.sku}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, sku: e.target.value }))
                        }
                        className={inputClass}
                        placeholder="SKU string"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Barcode
                      </label>
                      <div className="relative">
                        <Barcode className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={form.barcode}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, barcode: e.target.value }))
                          }
                          className={inputClass + " pl-8"}
                          placeholder="Universal ID"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-slate-100 dark:bg-slate-700" />

                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Purchase Cost (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={form.purchasePrice}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            purchasePrice: Math.max(
                              0,
                              parseFloat(e.target.value) || 0,
                            ),
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={form.sellingPrice}
                        onChange={(e) => {
                          setForm((p) => ({
                            ...p,
                            sellingPrice: Math.max(
                              0,
                              parseFloat(e.target.value) || 0,
                            ),
                          }));
                          if (errors.sellingPrice)
                            setErrors((prev) => ({
                              ...prev,
                              sellingPrice: undefined,
                            }));
                        }}
                        className={`w-full px-3 py-2 rounded border text-xs font-medium focus:outline-none transition-all dark:bg-slate-700/50 dark:text-slate-200 ${errors.sellingPrice ? "border-rose-400 bg-rose-50/10 dark:border-rose-600" : "border-slate-200 dark:border-slate-600 bg-slate-50/50 focus:bg-white dark:focus:bg-slate-700 focus:border-slate-400"}`}
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
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
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
                        className={inputClass + " appearance-none"}
                      >
                        {["0", "5", "12", "18", "28"].map((r) => (
                          <option key={r} value={r}>
                            {r}%
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Stock Vol
                      </label>
                      {/* ✅ min=0 aur Math.max(0, ...) — negative stock prevent */}
                      <input
                        type="number"
                        min={0}
                        value={form.stock}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            stock: Math.max(0, parseFloat(e.target.value) || 0),
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 truncate">
                        Alert Limit
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={form.lowStockAlert}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            lowStockAlert: Math.max(
                              0,
                              parseFloat(e.target.value) || 0,
                            ),
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
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
                    Delete Product?
                  </h3>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 px-2 leading-relaxed">
                    This action cannot be undone.
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
