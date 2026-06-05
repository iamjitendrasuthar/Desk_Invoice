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
      const timer = setTimeout(() => setGlobalError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [globalError]);

  useEffect(() => {
    if (validationError) {
      const timer = setTimeout(() => setValidationError(null), 4000);
      return () => clearTimeout(timer);
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
        .catch((err) => {
          console.error("Invoices fetch error:", err);
          setGlobalError(
            "Failed to import transactional historical ledger matrices.",
          );
        })
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
    } catch (e) {
      console.error("Error fetching products:", e);
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
    } catch (e) {
      console.error("Error fetching customers:", e);
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

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F5F5] text-[#334155] antialiased pb-16 font-sans relative">
        {/* API Stack Dynamic Error Ribbon Banner */}
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
          {/* Header Block Matches Customer/Product List Format */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#1e293b]">
              Billing Terminal
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <span className="hover:text-slate-800 cursor-pointer">🏠</span>
              <span>/</span>
              <span className="hover:text-slate-800 cursor-pointer">
                Finance
              </span>
              <span>/</span>
              <span className="text-slate-600 font-semibold">
                Billing Terminal
              </span>
            </div>
          </div>

          {/* Segmented Controls Layer Below Header Block */}
          <div className="flex bg-white border border-slate-200 p-1 rounded-md shadow-2xs w-full sm:w-fit">
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
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {t === "create" ? "New Invoice" : "History"}
              </button>
            ))}
          </div>

          {/* Switch Grid Interface */}
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
                {/* LEFT SYSTEM FORMS MAP */}
                <div className="lg:col-span-2 space-y-5 w-full min-w-0">
                  {/* Select Customer Component Block */}
                  <div className="bg-white border border-slate-200/60 p-5 rounded-lg shadow-sm relative z-20">
                    <label className="block text-[11px] font-bold text-slate-500 mb-2">
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
                        className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                        placeholder="Search customer name or mobile number..."
                        readOnly={!!selectedCustomer}
                      />
                      {selectedCustomer && (
                        <button
                          onClick={() => {
                            setSelectedCustomer(null);
                            setCustomerSearch("");
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}

                      {/* Dropdown Menu List */}
                      {customers.length > 0 && !selectedCustomer && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-30 overflow-hidden">
                          {customers.map((c) => (
                            <button
                              key={c._id}
                              onClick={() => {
                                setSelectedCustomer(c);
                                setCustomers([]);
                                setCustomerSearch("");
                              }}
                              className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors border-b border-slate-100 last:border-0"
                            >
                              <div className="w-8 h-8 rounded bg-[#eff6ff] flex items-center justify-center text-xs font-bold uppercase text-[#4f46e5] shadow-2xs">
                                {c.name ? c.name[0] : "C"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  {c.name || "Walk-in"}
                                </p>
                                <p className="text-[10px] font-medium text-slate-400">
                                  {c.phone || "No phone linked"}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Lookup Registry */}
                  <div className="bg-white border border-slate-200/60 p-5 rounded-lg shadow-sm relative z-10">
                    <label className="block text-[11px] font-bold text-slate-500 mb-2">
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
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                        placeholder="Search product items by name or SKU identity..."
                      />

                      {/* Dropdown Search Results */}
                      {products.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-30 overflow-hidden">
                          {products.map((p) => (
                            <button
                              key={p._id}
                              onClick={() => {
                                addItem(p);
                              }}
                              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 text-left border-b border-slate-100 last:border-0 group transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 bg-slate-50 border border-slate-200 rounded flex items-center justify-center text-slate-400 group-hover:bg-[#007676] group-hover:text-white transition-colors">
                                  <Plus className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate">
                                    {p.name}
                                  </p>
                                  <p className="text-[10px] font-semibold text-slate-400">
                                    Stock Available: {p.stock || 0}{" "}
                                    {p.unit || "pcs"}
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs font-bold text-slate-900 shrink-0">
                                {formatCurrency(p.sellingPrice || p.price || 0)}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Inline UI Validation Alert Container */}
                    <AnimatePresence>
                      {validationError && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-md flex items-center gap-2 text-rose-700"
                        >
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span className="text-xs font-semibold">
                            {validationError}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Selected Active Basket Billing Array Grid */}
                    {items.length > 0 && (
                      <div className="mt-5 border border-slate-100 rounded-md overflow-hidden bg-white shadow-2xs">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[540px]">
                            <thead>
                              <tr className="border-b border-slate-100 bg-[#f8fafc]">
                                <th className="px-4 py-3 text-xs font-bold text-[#475569] uppercase tracking-wider select-none">
                                  Item Details
                                </th>
                                <th className="px-4 py-3 text-xs font-bold text-[#475569] uppercase tracking-wider select-none text-center w-28">
                                  Quantity
                                </th>
                                <th className="px-4 py-3 text-xs font-bold text-[#475569] uppercase tracking-wider select-none text-center">
                                  Price Rate
                                </th>
                                <th className="px-4 py-3 text-xs font-bold text-[#475569] uppercase tracking-wider select-none text-center">
                                  Total
                                </th>
                                <th className="px-4 py-3 text-xs font-bold text-[#475569] uppercase tracking-wider select-none text-center w-12"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {items.map((item, i) => (
                                <tr
                                  key={i}
                                  className="hover:bg-slate-50/40 transition-colors duration-100 group"
                                >
                                  <td className="px-4 py-3 text-xs font-bold text-[#0f172a] tracking-wide">
                                    {item.name}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={() =>
                                          updateItemQty(i, item.quantity - 1)
                                        }
                                        className="w-6 h-6 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="w-5 text-center text-xs font-bold text-slate-900">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() =>
                                          updateItemQty(i, item.quantity + 1)
                                        }
                                        className="w-6 h-6 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center text-xs font-semibold text-slate-500">
                                    {formatCurrency(item.sellingPrice)}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="inline-block text-xs font-bold text-[#0f172a] bg-[#f8fafc] border border-slate-100 px-2 py-1 rounded shadow-2xs font-sans">
                                      {formatCurrency(item.total)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() => removeItem(i)}
                                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
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
                      <div className="mt-5 border border-dashed border-slate-200 rounded-md p-8 text-center bg-slate-50/40">
                        <div className="w-12 h-12 bg-white border border-slate-200/60 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-2xs">
                          <Package className="w-5 h-5 text-slate-300" />
                        </div>
                        <p className="text-xs font-semibold text-slate-400">
                          Search and include items above to build an invoice
                          statement.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT PANEL SUMMARY LOGISTICS */}
                <div className="space-y-5 w-full shrink-0">
                  <div className="bg-white border border-slate-200/60 p-5 rounded-lg shadow-sm space-y-5">
                    <h3 className="font-bold text-sm text-[#1e293b] border-b border-slate-100 pb-2.5 tracking-wide">
                      Order Summary
                    </h3>

                    <div className="space-y-3 text-xs font-medium">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Subtotal</span>
                        <span className="text-slate-800 font-semibold">
                          {formatCurrency(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>GST Tax Amount</span>
                        <span className="text-slate-800 font-semibold">
                          {formatCurrency(totalGST)}
                        </span>
                      </div>
                      <div className="h-px bg-slate-200 border-dashed border-b border-slate-100" />
                      <div className="flex justify-between items-center pt-1">
                        <span className="font-bold text-slate-900 text-sm">
                          Total Amount
                        </span>
                        <span className="text-lg font-bold text-slate-950 font-sans">
                          {formatCurrency(grandTotal)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                          Payment Mode
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md bg-white text-sm font-semibold text-slate-600 focus:outline-none focus:border-slate-400 appearance-none cursor-pointer"
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
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                          Invoice Notes
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none resize-none placeholder:text-slate-400"
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

                  {/* Success PDF Actions State Node */}
                  <AnimatePresence>
                    {savedInvoice && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-emerald-50 border border-emerald-100 rounded-lg p-5 space-y-4 shadow-2xs"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-emerald-900">
                              Invoice Created Successfully
                            </p>
                            <p className="text-[11px] font-mono text-emerald-600 mt-0.5">
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
              /* --- INVOICE HISTORY TAB MATRIX --- */
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200/60 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[960px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-[#f8fafc]">
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
                            className={`px-6 py-4.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none ${
                              i === 3 || i === 6 ? "text-right" : ""
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-slate-200 border-t-[#007676] rounded-full animate-spin" />
                          </td>
                        </tr>
                      ) : (
                        invoices.map((inv) => (
                          <tr
                            key={inv._id}
                            className="hover:bg-slate-50/40 transition-colors duration-100 group"
                          >
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                                {inv.invoiceNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-[#0f172a] tracking-wide">
                              {inv.customerName || "Walk-in Customer"}
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                              {formatDate(inv.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-block text-sm font-bold text-[#0f172a] bg-[#f8fafc] border border-slate-100 px-3 py-1.5 rounded-lg shadow-2xs font-sans">
                                {formatCurrency(inv.grandTotal)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#334155] bg-[#f1f5f9] border border-slate-200 px-2.5 py-0.5 rounded-md">
                                {inv.paymentMethod}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md inline-block border ${
                                  inv.paymentStatus === "paid"
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                    : inv.paymentStatus === "pending"
                                      ? "bg-amber-50 border-amber-100 text-amber-700"
                                      : "bg-rose-50 border-rose-100 text-rose-700"
                                }`}
                              >
                                {inv.paymentStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity duration-150">
                                <button
                                  onClick={() => downloadPDF(inv._id)}
                                  className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
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
                    <div className="text-center py-16 text-sm font-semibold text-slate-400 bg-white">
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
