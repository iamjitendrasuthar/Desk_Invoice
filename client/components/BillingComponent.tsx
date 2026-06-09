"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Plus,
  Search,
  Trash2,
  Download,
  X,
  CheckCircle2,
  CreditCard,
  Minus,
  Package,
  AlertCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface InvoiceItem {
  product: string;
  name: string;
  quantity: number;
  sellingPrice: number;
  gstRate: number;
  discount: number;
  discountType: string;
  subtotal: number;
  gstAmount: number;
  total: number;
  unit: string;
}

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

export default function BillingPage() {
  const [tab, setTab] = useState<"create" | "list">("create");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    setTab(tabParam === "history" ? "list" : "create");
  }, [searchParams]);

  useEffect(() => {
    if (globalError) {
      const t = setTimeout(() => setGlobalError(null), 5000);
      return () => clearTimeout(t);
    }
  }, [globalError]);

  useEffect(() => {
    if (validationError) {
      const t = setTimeout(() => setValidationError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [validationError]);

  useEffect(() => {
    if (tab === "list") {
      setLoading(true);
      api
        .get("/invoices", { params: { limit: 30 } })
        .then((r) => {
          setInvoices(
            Array.isArray(r.data?.data?.invoices)
              ? r.data.data.invoices
              : Array.isArray(r.data?.data)
                ? r.data.data
                : Array.isArray(r.data)
                  ? r.data
                  : [],
          );
        })
        .catch(() =>
          setGlobalError(
            "Failed to import transactional historical ledger matrices.",
          ),
        )
        .finally(() => setLoading(false));
    }
  }, [tab]);

  const searchProducts = async (q: string) => {
    if (!q) {
      setProducts([]);
      return;
    }
    try {
      const r = await api.get("/products", { params: { search: q, limit: 8 } });
      const arr =
        r.data?.data?.products || r.data?.products || r.data?.data || r.data;
      setProducts(Array.isArray(arr) ? arr : []);
    } catch {
      setProducts([]);
    }
  };

  const searchCustomers = async (q: string) => {
    if (!q) {
      setCustomers([]);
      return;
    }
    try {
      const r = await api.get("/customers", {
        params: { search: q, limit: 6 },
      });
      const arr =
        r.data?.data?.customers || r.data?.customers || r.data?.data || r.data;
      setCustomers(Array.isArray(arr) ? arr : []);
    } catch {
      setCustomers([]);
    }
  };

  const addItem = (product: any) => {
    setValidationError(null);
    const existing = items.findIndex((i) => i.product === product._id);
    const pPrice = product.sellingPrice || product.price || 0;
    const pTax = product.gstRate || product.taxRate || 0;
    if (existing >= 0) {
      updateItemQty(existing, items[existing].quantity + 1);
    } else {
      const subtotal = pPrice;
      const gstAmount = (subtotal * pTax) / 100;
      setItems((prev) => [
        ...prev,
        {
          product: product._id,
          name: product.name || "Unknown Item",
          quantity: 1,
          sellingPrice: pPrice,
          gstRate: pTax,
          discount: 0,
          discountType: "percent",
          unit: product.unit || "pcs",
          subtotal,
          gstAmount,
          total: subtotal + gstAmount,
        },
      ]);
    }
    setProductSearch("");
    setProducts([]);
  };

  const updateItemQty = (idx: number, qty: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const q = Math.max(1, qty);
        const discountAmt =
          item.discountType === "amount"
            ? item.discount
            : (item.sellingPrice * q * item.discount) / 100;
        const subtotal = item.sellingPrice * q - discountAmt;
        const gstAmount = (subtotal * item.gstRate) / 100;
        return {
          ...item,
          quantity: q,
          subtotal,
          gstAmount,
          total: subtotal + gstAmount,
        };
      }),
    );
  };

  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const totalGST = items.reduce((s, i) => s + i.gstAmount, 0);
  const grandTotal = subtotal + totalGST;

  const handleCreate = async () => {
    if (!items.length) {
      setValidationError(
        "Cannot register data fields. Please map at least one product item node.",
      );
      return;
    }
    setSaving(true);
    setValidationError(null);
    try {
      const payload = {
        customer: selectedCustomer?._id,
        customerName: selectedCustomer?.name || "Walk-in Customer",
        customerPhone: selectedCustomer?.phone,
        items: items.map((i) => ({
          product: i.product,
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          price: i.sellingPrice,
          taxRate: i.gstRate,
          discount:
            i.discountType === "amount"
              ? i.discount
              : (i.sellingPrice * i.quantity * i.discount) / 100,
        })),
        amountPaid: grandTotal,
        paymentMethod,
        notes,
      };
      const r = await api.post("/invoices", payload);
      setSavedInvoice(r.data?.data);
      setItems([]);
      setSelectedCustomer(null);
      setCustomerSearch("");
      setNotes("");
    } catch (e: any) {
      setGlobalError(
        e.response?.data?.message ||
          "Operational transactional compilation failed.",
      );
    } finally {
      setSaving(false);
    }
  };

  const downloadPDF = async (id: string) => {
    try {
      const r = await api.get(`/invoices/${id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setGlobalError("PDF transformation asset generation failed.");
    }
  };

  const inputCls =
    "w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700/50 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors";

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
                    System Operational Alert
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
              Billing Terminal
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
                🏠
              </span>
              <span>/</span>
              <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
                Finance
              </span>
              <span>/</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                Billing Terminal
              </span>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-md shadow-2xs w-full sm:w-fit">
            {(["create", "list"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  if (t === "list") {
                    router.push("/billing?tab=history");
                  } else {
                    router.push("/billing");
                    setSavedInvoice(null);
                  }
                }}
                className={`flex-1 sm:flex-none text-center px-5 py-1.5 rounded text-xs font-bold transition-all duration-200 ${
                  tab === t
                    ? "text-white bg-[#007676] border border-[#007676] shadow-2xs"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {t === "create" ? "New Invoice" : "History"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === "create" ? (
              <motion.div
                key="create"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start"
              >
                {/* Left — Forms */}
                <div className="lg:col-span-2 space-y-5 w-full min-w-0">
                  {/* Customer Search */}
                  <div className="bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 p-5 rounded-lg shadow-sm relative z-20">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                      Select Customer
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        value={
                          selectedCustomer
                            ? selectedCustomer.name
                            : customerSearch
                        }
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          searchCustomers(e.target.value);
                        }}
                        className={`${inputCls} pl-10 pr-10`}
                        placeholder="Search customer name or mobile number..."
                        readOnly={!!selectedCustomer}
                      />
                      {selectedCustomer && (
                        <button
                          onClick={() => {
                            setSelectedCustomer(null);
                            setCustomerSearch("");
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      {customers.length > 0 && !selectedCustomer && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-30 overflow-hidden">
                          {customers.map((c) => (
                            <button
                              key={c._id}
                              onClick={() => {
                                setSelectedCustomer(c);
                                setCustomers([]);
                                setCustomerSearch("");
                              }}
                              className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                            >
                              <div className="w-8 h-8 rounded bg-[#eff6ff] dark:bg-slate-700 flex items-center justify-center text-xs font-bold uppercase text-[#4f46e5] dark:text-indigo-400 shadow-2xs">
                                {c.name ? c.name[0] : "C"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                  {c.name || "Walk-in"}
                                </p>
                                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                  {c.phone || "No phone linked"}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Search */}
                  <div className="bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 p-5 rounded-lg shadow-sm relative z-10">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                      Search & Add Products
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        value={productSearch}
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          searchProducts(e.target.value);
                        }}
                        className={`${inputCls} pl-10`}
                        placeholder="Search product items by name or SKU identity..."
                      />
                      {products.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-30 overflow-hidden">
                          {products.map((p) => (
                            <button
                              key={p._id}
                              onClick={() => addItem(p)}
                              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-left border-b border-slate-100 dark:border-slate-700 last:border-0 group transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded flex items-center justify-center text-slate-400 group-hover:bg-[#007676] group-hover:text-white transition-colors">
                                  <Plus className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                    {p.name}
                                  </p>
                                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                    Stock Available: {p.stock || 0}{" "}
                                    {p.unit || "pcs"}
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 shrink-0">
                                {formatCurrency(p.sellingPrice || p.price || 0)}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Validation Error */}
                    <AnimatePresence>
                      {validationError && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 rounded-md flex items-center gap-2 text-rose-700 dark:text-rose-400"
                        >
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span className="text-xs font-semibold">
                            {validationError}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Items Table */}
                    {items.length > 0 && (
                      <div className="mt-5 border border-slate-100 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-800/50 shadow-2xs">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[540px]">
                            <thead>
                              <tr className="border-b border-slate-100 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-700/40">
                                {[
                                  "Item Details",
                                  "Quantity",
                                  "Price Rate",
                                  "Total",
                                  "",
                                ].map((h, i) => (
                                  <th
                                    key={i}
                                    className={`px-4 py-3 text-xs font-bold text-[#475569] dark:text-slate-400 uppercase tracking-wider select-none ${i >= 1 ? "text-center" : ""} ${i === 4 ? "w-12" : ""}`}
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-white dark:bg-transparent">
                              {items.map((item, i) => (
                                <tr
                                  key={i}
                                  className="hover:bg-slate-50/40 dark:hover:bg-slate-700/30 transition-colors duration-100 group"
                                >
                                  <td className="px-4 py-3 text-xs font-bold text-[#0f172a] dark:text-slate-100 tracking-wide">
                                    {item.name}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={() =>
                                          updateItemQty(i, item.quantity - 1)
                                        }
                                        className="w-6 h-6 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="w-5 text-center text-xs font-bold text-slate-900 dark:text-slate-100">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() =>
                                          updateItemQty(i, item.quantity + 1)
                                        }
                                        className="w-6 h-6 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    {formatCurrency(item.sellingPrice)}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="inline-block text-xs font-bold text-[#0f172a] dark:text-slate-100 bg-[#f8fafc] dark:bg-slate-700 border border-slate-100 dark:border-slate-600 px-2 py-1 rounded shadow-2xs">
                                      {formatCurrency(item.total)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() => removeItem(i)}
                                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
                                    >
                                      <Trash2 className="w-4 h-4 stroke-[1.8]" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {items.length === 0 && (
                      <div className="mt-5 border border-dashed border-slate-200 dark:border-slate-700 rounded-md p-8 text-center bg-slate-50/40 dark:bg-slate-700/20">
                        <div className="w-12 h-12 bg-white dark:bg-slate-700 border border-slate-200/60 dark:border-slate-600 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-2xs">
                          <Package className="w-5 h-5 text-slate-300 dark:text-slate-500" />
                        </div>
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                          Search and include items above to build an invoice
                          statement.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right — Summary */}
                <div className="space-y-5 w-full shrink-0">
                  <div className="bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 p-5 rounded-lg shadow-sm space-y-5">
                    <h3 className="font-bold text-sm text-[#1e293b] dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2.5 tracking-wide">
                      Order Summary
                    </h3>
                    <div className="space-y-3 text-xs font-medium">
                      <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
                        <span>Subtotal</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">
                          {formatCurrency(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
                        <span>GST Tax Amount</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">
                          {formatCurrency(totalGST)}
                        </span>
                      </div>
                      <div className="h-px bg-slate-200 dark:bg-slate-700 border-dashed border-b border-slate-100 dark:border-slate-700" />
                      <div className="flex justify-between items-center pt-1">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          Total Amount
                        </span>
                        <span className="text-lg font-bold text-slate-950 dark:text-white font-sans">
                          {formatCurrency(grandTotal)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                          Payment Mode
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700/50 text-sm font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 appearance-none cursor-pointer"
                          >
                            {["cash", "upi", "card", "credit", "cheque"].map(
                              (m) => (
                                <option key={m} value={m}>
                                  {m.toUpperCase()}
                                </option>
                              ),
                            )}
                          </select>
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-slate-400">
                            ▼
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                          Invoice Notes
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700/50 text-xs font-medium text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-700 focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          placeholder="Add any remarks or details..."
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleCreate}
                      disabled={saving}
                      className="w-full bg-[#007676] hover:bg-[#005f5f] disabled:opacity-40 text-white px-5 py-2.5 rounded-md text-sm font-bold tracking-wide transition-all shadow-xs"
                    >
                      {saving ? "Generating Entry..." : "Generate Invoice"}
                    </button>
                  </div>

                  {/* Success State */}
                  <AnimatePresence>
                    {savedInvoice && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg p-5 space-y-4 shadow-2xs"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                              Invoice Created Successfully
                            </p>
                            <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                              {savedInvoice.invoiceNumber}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadPDF(savedInvoice._id)}
                          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md text-sm font-bold transition-all shadow-xs"
                        >
                          <Download className="w-4 h-4" /> Download Invoice PDF
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              /* Invoice History */
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[960px]">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-700/40">
                        {[
                          "Invoice ID",
                          "Customer Client",
                          "Billing Timestamp",
                          "Grand Amount",
                          "Method",
                          "State Status",
                          "Action",
                        ].map((h, i) => (
                          <th
                            key={h}
                            className={`px-6 py-4.5 text-xs font-bold text-[#475569] dark:text-slate-400 uppercase tracking-wider select-none ${i === 3 || i === 6 ? "text-right" : ""}`}
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
                      ) : (
                        invoices.map((inv) => (
                          <tr
                            key={inv._id}
                            className="hover:bg-slate-50/40 dark:hover:bg-slate-700/30 transition-colors duration-100 group"
                          >
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2.5 py-0.5 rounded-md">
                                {inv.invoiceNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-[#0f172a] dark:text-slate-100 tracking-wide">
                              {inv.customerName || "Walk-in Customer"}
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-400 dark:text-slate-500">
                              {formatDate(inv.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-block text-sm font-bold text-[#0f172a] dark:text-slate-100 bg-[#f8fafc] dark:bg-slate-700 border border-slate-100 dark:border-slate-600 px-3 py-1.5 rounded-lg shadow-2xs font-sans">
                                {formatCurrency(inv.grandTotal)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#334155] dark:text-slate-300 bg-[#f1f5f9] dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2.5 py-0.5 rounded-md">
                                {inv.paymentMethod}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md inline-block border ${
                                  inv.paymentStatus === "paid"
                                    ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                                    : inv.paymentStatus === "pending"
                                      ? "bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-400"
                                      : "bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800 text-rose-700 dark:text-rose-400"
                                }`}
                              >
                                {inv.paymentStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity duration-150">
                                <button
                                  onClick={() => downloadPDF(inv._id)}
                                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                                >
                                  <Download className="w-4 h-4 stroke-[1.8]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  {!loading && invoices.length === 0 && (
                    <div className="text-center py-16 text-sm font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-transparent">
                      No matching historical invoices logged.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AppLayout>
  );
}
