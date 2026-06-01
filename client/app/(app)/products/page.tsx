"use client";
import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { Variants } from "framer-motion";

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
const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } },
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

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 15 };
      if (search) params.search = search;
      if (category) params.category = category;

      const r = await api.get("/products", { params });

      // ✅ Backend returns: { success, data: [...], total }
      const list = r.data?.data;
      setProducts(Array.isArray(list) ? list : []);
      setTotal(r.data?.total ?? 0);
    } catch (e) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.get("/products/categories").then((r) => {
      // ✅ Backend returns: { success, data: [...] }
      const cats = r.data?.data;
      setCategories(Array.isArray(cats) ? cats : []);
    });
  }, []);

  const openAdd = () => {
    setEditProduct(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
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

  const handleSave = async () => {
    if (!form.name || !form.sellingPrice) {
      alert("Product name and selling price are required");
      return;
    }
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
      alert(e.response?.data?.message || "Error saving product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (e: any) {
      alert(e.response?.data?.message || "Error deleting product");
    }
  };

  return (
    <AppLayout>
      <div className="relative min-h-screen bg-[#f8fafc] text-slate-900 overflow-hidden rounded-3xl font-sans">
        <div className="absolute top-[-5%] left-[10%] w-[500px] h-[500px] rounded-full bg-emerald-400/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[140px] pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2"
          >
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                Inventory
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-2">
                Managing{" "}
                <span className="font-bold text-slate-700">
                  {total} active products
                </span>
              </p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Product
            </button>
          </motion.div>

          {/* Filters */}
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
            <div className="flex-1 flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white/50 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                  placeholder="Search by name, SKU, or barcode..."
                />
              </div>
              <div className="relative min-w-[200px]">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-11 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-white/50 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-2 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    {[
                      "Product Info",
                      "Category",
                      "Cost",
                      "Price",
                      "GST",
                      "Stock",
                      "Actions",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider ${i >= 2 ? "text-right" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Package className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-bold">
                          No products found
                        </p>
                        <p className="text-slate-400 text-sm mt-1">
                          Try adjusting your filters or add a new product
                        </p>
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr
                        key={p._id}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-slate-200 group-hover:scale-105 transition-transform">
                              <Boxes className="w-5 h-5 text-slate-500" />
                            </div>
                            <div>
                              <p className="font-extrabold text-sm text-slate-900">
                                {p.name}
                              </p>
                              {p.sku && (
                                <p className="text-xs font-bold text-slate-400 mt-0.5">
                                  SKU: {p.sku}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                            {p.category || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-slate-500">
                            {formatCurrency(p.purchasePrice)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-extrabold text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                            {formatCurrency(p.sellingPrice)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-slate-500">
                          {p.gstRate ?? 0}%
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span
                              className={`text-sm font-extrabold ${p.isLowStock ? "text-rose-600" : "text-slate-700"}`}
                            >
                              {p.stock}{" "}
                              <span className="text-xs text-slate-400 font-bold">
                                {p.unit}
                              </span>
                            </span>
                            {p.isLowStock && (
                              <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <AlertTriangle className="relative inline-flex rounded-full h-3 w-3 text-rose-500" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
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

            {total > 15 && (
              <div className="flex items-center justify-between mt-6 px-2">
                <span className="text-sm font-bold text-slate-500">
                  Page {page} of {Math.ceil(total / 15)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.ceil(total / 15)}
                    className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
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
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-xl text-slate-900">
                        {editProduct ? "Edit Product" : "New Product"}
                      </h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                        {editProduct ? "Update Catalog Item" : "Add to Catalog"}
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

                {/* Modal Body */}
                <div className="p-6 md:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, name: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        placeholder="Enter product name..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Category
                      </label>
                      <input
                        type="text"
                        value={form.category}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, category: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        placeholder="e.g. Furniture, Decor"
                        list="categories-list"
                      />
                      <datalist id="categories-list">
                        {categories.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Unit
                      </label>
                      <select
                        value={form.unit}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, unit: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
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
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={form.sku}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, sku: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        placeholder="Stock Keeping Unit"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Barcode
                      </label>
                      <div className="relative">
                        <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={form.barcode}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, barcode: e.target.value }))
                          }
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          placeholder="Scan or enter barcode"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-slate-100" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Purchase Price (₹)
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
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={form.sellingPrice}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            sellingPrice: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        GST Rate (%)
                      </label>
                      <select
                        value={form.gstRate}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            gstRate: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                      >
                        {["0", "5", "12", "18", "28"].map((r) => (
                          <option key={r} value={r}>
                            {r}%
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Stock Qty
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
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 truncate">
                          Alert Level
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
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-4 p-6 md:p-8 border-t border-slate-100 bg-slate-50/50 mt-auto rounded-b-3xl">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 transition-all duration-300"
                  >
                    {saving
                      ? "Saving..."
                      : editProduct
                        ? "Update Product"
                        : "Save Product"}
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
