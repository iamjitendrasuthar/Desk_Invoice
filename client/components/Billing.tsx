"use client";
import { useState, useEffect } from "react";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const tabParam = searchParams.get("tab");

    if (tabParam === "history") {
      setTab("list");
    } else {
      setTab("create");
    }
  }, [searchParams]);
  useEffect(() => {
    if (tab === "list") {
      setLoading(true);
      api
        .get("/invoices", { params: { limit: 30 } })
        .then((r) => {
          setInvoices(
            Array.isArray(r.data?.data?.invoices)
              ? r.data.data.invoices
              : Array.isArray(r.data?.data) // Added fallback mapping
                ? r.data.data
                : [],
          );
        })
        .catch((err) => console.log(err))
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
      // API response se array nikalne ka sabse safe tarika
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
      // Safe extraction
      const arr =
        r.data?.data?.customers || r.data?.customers || r.data?.data || r.data;
      setCustomers(Array.isArray(arr) ? arr : []);
    } catch (e) {
      console.error("Error fetching customers:", e);
      setCustomers([]);
    }
  };

  const addItem = (product: any) => {
    const existing = items.findIndex((i) => i.product === product._id);

    // Fallbacks: Agar backend me field ka naam "price" ya "taxRate" hai
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
    if (!items.length) return alert("Add at least one item");
    setSaving(true);
    try {
      // FIX: Mapping the payload keys exactly to what the backend schema expects
      const payload = {
        customer: selectedCustomer?._id,
        customerName: selectedCustomer?.name || "Walk-in Customer",
        customerPhone: selectedCustomer?.phone,
        items: items.map((i) => ({
          product: i.product,
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          price: i.sellingPrice, // mapped correctly
          taxRate: i.gstRate, // mapped correctly
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
      alert(e.response?.data?.message || "Error creating invoice");
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
      alert("Error generating PDF");
    }
  };

  return (
    <AppLayout>
      {/* Light Background with Soft Pastel Orbs */}
      <div className="relative min-h-screen bg-[#f8fafc] text-slate-900 overflow-hidden rounded-3xl font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-rose-400/10 blur-[130px] pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Header & Tabs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2"
          >
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                Billing & Invoices
              </h1>
            </div>

            {/* Segmented Control Tabs */}
            <div className="flex bg-white/60 backdrop-blur-xl border border-white rounded-2xl p-1.5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
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
                  className={`relative px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${
                    tab === t
                      ? "text-indigo-700 bg-white shadow-sm border border-slate-100"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
                  }`}
                >
                  {t === "create" ? "New Invoice" : "History"}
                </button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {tab === "create" ? (
              <motion.div
                key="create"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* --- LEFT COLUMN: ITEMS --- */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Customer Selection */}
                  <motion.div
                    variants={itemVariants}
                    className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-20"
                  >
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Client Details (Optional)
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
                        className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                        placeholder="Search client name or phone..."
                        readOnly={!!selectedCustomer}
                      />
                      {selectedCustomer && (
                        <button
                          onClick={() => {
                            setSelectedCustomer(null);
                            setCustomerSearch("");
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}

                      {/* Dropdown */}
                      {customers.length > 0 && !selectedCustomer && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-xl z-30 overflow-hidden">
                          {customers.map((c) => (
                            <button
                              key={c._id}
                              onClick={() => {
                                setSelectedCustomer(c);
                                setCustomers([]);
                                setCustomerSearch("");
                              }}
                              className="w-full flex items-center gap-4 px-5 py-3 hover:bg-slate-50 text-left transition-colors border-b border-slate-50 last:border-0"
                            >
                              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold uppercase">
                                {/* CRASH FIX: Checking if name exists before taking first letter */}
                                {c.name ? c.name[0] : "C"}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">
                                  {c.name || "Unknown Customer"}
                                </p>
                                <p className="text-xs font-semibold text-slate-500">
                                  {c.phone || "No phone"}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Product Search */}
                  <motion.div
                    variants={itemVariants}
                    className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10"
                  >
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Add Products
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        value={productSearch}
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          searchProducts(e.target.value);
                        }}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                        placeholder="Search by product name, SKU..."
                      />

                      {/* Dropdown */}
                      {products.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-xl z-30 overflow-hidden">
                          {products.map((p) => (
                            <button
                              key={p._id}
                              onClick={() => addItem(p)}
                              className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 text-left transition-colors border-b border-slate-50 last:border-0 group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                  <Plus className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900">
                                    {p.name}
                                  </p>
                                  <p className="text-xs font-semibold text-slate-500">
                                    Stock: {p.stock || 0} {p.unit || "pcs"}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm font-extrabold text-indigo-600">
                                {/* CRASH FIX: Handling fallback price */}
                                {formatCurrency(p.sellingPrice || p.price || 0)}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Added Items List */}
                    {items.length > 0 && (
                      <div className="mt-6 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                  Item
                                </th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                                  Qty
                                </th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                                  Rate
                                </th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                                  Total
                                </th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((item, i) => (
                                <tr
                                  key={i}
                                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/30"
                                >
                                  <td className="px-4 py-3 text-sm font-bold text-slate-900">
                                    {item.name}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        onClick={() =>
                                          updateItemQty(i, item.quantity - 1)
                                        }
                                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="w-6 text-center text-sm font-bold text-slate-900">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() =>
                                          updateItemQty(i, item.quantity + 1)
                                        }
                                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-right text-sm font-semibold text-slate-600">
                                    {formatCurrency(item.sellingPrice)}
                                  </td>
                                  <td className="px-4 py-3 text-right text-sm font-extrabold text-indigo-600">
                                    {formatCurrency(item.total)}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() => removeItem(i)}
                                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
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
                      <div className="mt-6 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center bg-slate-50/50">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                          <Package className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">
                          Search and add products to build this invoice
                        </p>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* --- RIGHT COLUMN: SUMMARY --- */}
                <motion.div variants={itemVariants} className="space-y-6">
                  <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h3 className="font-extrabold text-lg text-slate-900 mb-6">
                      Order Summary
                    </h3>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center text-sm font-semibold text-slate-500">
                        <span>Subtotal</span>
                        <span className="text-slate-900">
                          {formatCurrency(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-semibold text-slate-500">
                        <span>GST Amount</span>
                        <span className="text-slate-900">
                          {formatCurrency(totalGST)}
                        </span>
                      </div>

                      <div className="h-px w-full bg-slate-200 border-dashed border-b border-slate-200" />

                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-900 text-lg">
                          Total
                        </span>
                        <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                          {formatCurrency(grandTotal)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Payment Mode
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer"
                          >
                            {["cash", "upi", "card", "credit", "cheque"].map(
                              (m) => (
                                <option
                                  key={m}
                                  value={m}
                                  className="font-medium"
                                >
                                  {m.toUpperCase()}
                                </option>
                              ),
                            )}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Order Notes
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none placeholder:text-slate-400"
                          placeholder="Optional remarks..."
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleCreate}
                      disabled={saving || !items.length}
                      className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-300"
                    >
                      {saving ? "Processing..." : "Generate Invoice"}
                    </button>
                  </div>

                  {/* Success State */}
                  <AnimatePresence>
                    {savedInvoice && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 shadow-sm relative overflow-hidden"
                      >
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-200/40 rounded-full blur-2xl" />

                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-emerald-800 font-extrabold text-sm">
                                Invoice Generated!
                              </p>
                              <p className="text-emerald-600/80 text-xs font-bold">
                                {savedInvoice.invoiceNumber}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => downloadPDF(savedInvoice._id)}
                            className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                          >
                            <Download className="w-4 h-4" /> Download PDF
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ) : (
              /* --- INVOICE LIST TAB --- */
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-2 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                          Invoice #
                        </th>
                        <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-right">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                          </td>
                        </tr>
                      ) : (
                        invoices.map((inv) => (
                          <tr
                            key={inv._id}
                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <span className="font-extrabold text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                {inv.invoiceNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                              {inv.customerName || "Walk-in"}
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-500 text-sm">
                              {formatDate(inv.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-right font-extrabold text-slate-900 text-sm">
                              {formatCurrency(inv.grandTotal)}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                                {inv.paymentMethod}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg ${
                                  inv.paymentStatus === "paid"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : inv.paymentStatus === "pending"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-rose-100 text-rose-700"
                                }`}
                              >
                                {inv.paymentStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => downloadPDF(inv._id)}
                                className="inline-flex items-center justify-center w-9 h-9 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all"
                                title="Download PDF"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  {!loading && invoices.length === 0 && (
                    <div className="text-center py-16 text-slate-500 font-medium">
                      No invoices found.
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
