"use client";
import { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/layout/AppLayout";
import api from "@/lib/api";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Zap,
  Clock,
  Star,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
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

const pulseVariants: Variants = {
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(168, 85, 247, 0.4)",
      "0 0 0 10px rgba(168, 85, 247, 0)",
    ],
    transition: { duration: 1.5, repeat: Infinity },
  },
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.get("/dashboard");
        const dashboardData = response.data?.data || response.data || {};
        setData(dashboardData);
      } catch (error) {
        console.log("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[80vh] bg-[#f8fafc]">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-16 h-16 border-4 border-indigo-200 rounded-full animate-ping" />
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const revenueChartData =
    data?.monthlyRevenue?.map((d: any) => ({
      name: MONTHS[d._id.month - 1],
      revenue: d.revenue,
      orders: d.orders,
    })) || [];

  return (
    <AppLayout>
      <div className="relative min-h-screen bg-[#f8fafc] text-slate-900 overflow-hidden rounded-3xl font-sans">
        {/* Ambient Orbs — pointer-events-none so they never block taps */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] rounded-full bg-purple-400/10 blur-[110px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-emerald-400/10 blur-[120px] pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto space-y-5 p-4 sm:p-6 lg:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* ── HEADER ── */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col xs:flex-row xs:items-end justify-between gap-3"
          >
            <div>
              {/* FIX: text-4xl → text-2xl sm:text-4xl — mobile pe bada tha */}
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-1">
                Overview
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm font-medium">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <motion.div
              variants={pulseVariants}
              animate="animate"
              className="self-start xs:self-auto flex items-center gap-2 px-3 py-1.5 bg-white border border-purple-100 rounded-full text-xs font-bold tracking-wide text-purple-700 shadow-sm uppercase cursor-default shrink-0"
            >
              <div className="w-2 h-2 rounded-full bg-purple-600" />
              Live Sync Active
            </motion.div>
          </motion.div>

          {/* ── STATS GRID ──
              FIX: grid-cols-4 → grid-cols-2 on mobile
              2 columns on mobile fits naturally without overflow
          */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {[
              {
                label: "Today's Sales",
                value: formatCurrency(data?.summary?.todaySales || 0),
                sub: `${data?.stats?.todayOrders || 0} orders`,
                icon: TrendingUp,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                border: "border-emerald-100",
              },
              {
                label: "Monthly Revenue",
                value: formatCurrency(data?.summary?.monthlySales || 0),
                sub: `${data?.stats?.monthlyOrders || 0} orders`,
                icon: ShoppingCart,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
                border: "border-indigo-100",
              },
              {
                label: "Customers",
                value: data?.summary?.totalCustomers || 0,
                sub: "Total active",
                icon: Users,
                color: "text-purple-600",
                bg: "bg-purple-50",
                border: "border-purple-100",
              },
              {
                label: "Products",
                value: data?.summary?.totalProducts || 0,
                sub: `${data?.aiInsights?.lowStockCount || 0} low stock`,
                icon: Package,
                color: "text-rose-600",
                bg: "bg-rose-50",
                border: "border-rose-100",
              },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="relative group overflow-hidden bg-white/70 backdrop-blur-2xl border border-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-300 hover:bg-white hover:scale-[1.02] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer"
              >
                {/* FIX: icon + arrow row — arrow hidden on mobile to save space */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div
                    className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${stat.bg} flex items-center justify-center border ${stat.border} shrink-0`}
                  >
                    <stat.icon
                      className={`w-4 h-4 sm:w-6 sm:h-6 ${stat.color}`}
                    />
                  </div>
                  <div className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  {/* FIX: text-sm → text-xs on mobile */}
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-1 leading-tight">
                    {stat.label}
                  </p>
                  {/* FIX: text-3xl → text-xl on mobile */}
                  <p className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2 leading-none">
                    {stat.value}
                  </p>
                  <span className="inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                    {stat.sub}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── CHARTS ROW ──
              FIX: lg:grid-cols-3 — on mobile both cards stack full width
          */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Revenue Bar Chart */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 relative overflow-hidden bg-white/80 backdrop-blur-2xl border border-white/60 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between mb-5 sm:mb-8">
                <div>
                  <h3 className="font-extrabold text-base sm:text-xl text-slate-900 tracking-tight">
                    Revenue Trends
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    Last 6 months performance
                  </p>
                </div>
              </div>

              {/* FIX: h-[300px] → h-[220px] sm:h-[300px] */}
              <div className="h-[220px] sm:h-[300px] w-full">
                {revenueChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueChartData}
                      margin={{ top: 10, right: 0, left: 0, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient
                          id="barGradientPremium"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#a78bfa" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f5f9"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 11,
                          fill: "#94a3b8",
                          fontWeight: 600,
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickMargin={12}
                      />
                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: "#94a3b8",
                          fontWeight: 600,
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) =>
                          v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                        }
                        tickMargin={8}
                        width={48}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(139, 92, 246, 0.06)" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #f8fafc",
                          backgroundColor: "rgba(255,255,255,0.95)",
                          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
                          padding: "10px 16px",
                        }}
                        itemStyle={{
                          color: "#8b5cf6",
                          fontWeight: 700,
                          fontSize: "14px",
                        }}
                        labelStyle={{ color: "#64748b", fontWeight: 600 }}
                        formatter={(v: any) => [formatCurrency(v), "Revenue"]}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="url(#barGradientPremium)"
                        radius={[8, 8, 8, 8]}
                        barSize={24}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <Activity className="w-10 h-10 mb-2 opacity-20" />
                    <p className="font-bold text-sm">No revenue data</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* AI Insights */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 backdrop-blur-2xl border border-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-5 sm:mb-8 relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white/20" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    AI Analysis
                  </h3>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Smart Insights
                  </p>
                </div>
              </div>

              <div className="space-y-5 flex-1 relative z-10">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Top Selling Items
                  </h4>
                  <div className="space-y-2">
                    {data?.aiInsights?.topSellingProducts
                      ?.slice(0, 2)
                      .map((p: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-2.5 shadow-sm"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            </div>
                            {/* FIX: truncate so long names don't overflow */}
                            <span className="text-sm font-bold text-slate-700 truncate">
                              {p.name}
                            </span>
                          </div>
                          <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg shrink-0 ml-2">
                            {p.totalSold}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Peak Activity
                  </h4>
                  {/* FIX: flex-wrap so badges wrap on narrow screens */}
                  <div className="flex flex-wrap gap-2">
                    {data?.aiInsights?.bestSalesHours
                      ?.slice(0, 2)
                      .map((h: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-xl px-3 py-1.5 shadow-sm"
                        >
                          <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                            {h._id}:00 – {h._id + 1}:00
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {data?.aiInsights?.lowStockCount > 0 && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-auto pt-2"
                  >
                    <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-100 rounded-xl p-3">
                      <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      </div>
                      <span className="text-xs font-bold text-rose-700 leading-snug">
                        {data.aiInsights.lowStockCount} products are critically
                        low on stock
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* ── BOTTOM ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Invoices */}
            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-2xl border border-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-extrabold text-base sm:text-xl text-slate-900">
                  Recent Invoices
                </h3>
                <Link href="/billing?tab=history">
                  <button className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">
                    View All
                  </button>
                </Link>
              </div>

              <div className="space-y-1">
                {data?.recentInvoices?.map((inv: any) => (
                  <div
                    key={inv._id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group gap-3"
                  >
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-extrabold text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                        {inv.customerName?.charAt(0) || "W"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-slate-900 truncate">
                          {inv.customerName || "Walk-in Customer"}
                        </p>
                        <p className="text-xs font-medium text-slate-400 truncate">
                          {inv.invoiceNumber}
                        </p>
                      </div>
                    </div>

                    {/* Amount + status — FIX: flex-col on very small screens */}
                    <div className="flex flex-col xs:flex-row items-end xs:items-center gap-1 xs:gap-3 shrink-0">
                      <p className="text-sm font-extrabold text-slate-900 whitespace-nowrap">
                        {formatCurrency(inv.grandTotal)}
                      </p>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-lg font-bold bg-slate-100 text-slate-600 whitespace-nowrap">
                        {inv.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Low Stock */}
            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-2xl border border-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-extrabold text-base sm:text-xl text-slate-900">
                  Low Stock Alert
                </h3>
              </div>

              <div className="space-y-3">
                {data?.lowStockProducts?.map((p: any) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white border border-slate-100 shadow-sm gap-3"
                  >
                    {/* Icon + name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-rose-500" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 truncate">
                        {p.name}
                      </span>
                    </div>

                    {/* Stock count + button — FIX: always row, button shrinks on mobile */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
                          Left
                        </p>
                        <p className="text-sm font-extrabold text-rose-600">
                          {p.stock}
                        </p>
                      </div>
                      <Link href="/suppliers">
                        <button className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-5 py-2 rounded-xl font-bold transition-colors cursor-pointer whitespace-nowrap">
                          Restock
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}

                {!data?.lowStockProducts?.length && (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <Package className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm font-bold text-slate-500">
                      All products well stocked
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
