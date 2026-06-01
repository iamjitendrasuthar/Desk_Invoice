"use client";
import { useState, useEffect } from "react";
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
  MoreHorizontal,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
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

// Softer, more elegant animations
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

        console.log("DASHBOARD RESPONSE:", response.data);

        // support both formats
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
      {/* 
        ULTRA-CLEAN LIGHT BACKGROUND
        Very soft off-white with sweeping, elegant pastel gradients 
      */}
      <div className="relative min-h-screen bg-[#f8fafc] text-slate-900 overflow-hidden rounded-3xl font-sans">
        {/* Soft Ambient Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/10 blur-[140px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-400/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-emerald-400/10 blur-[140px] pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* --- HEADER SECTION --- */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2"
          >
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
                Overview
              </h1>
              <p className="text-slate-500 text-sm flex items-center gap-2 font-medium">
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
              className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-100 rounded-full text-xs font-bold tracking-wide text-purple-700 shadow-sm uppercase cursor-default"
            >
              <div className="w-2 h-2 rounded-full bg-purple-600" />
              Live Sync Active
            </motion.div>
          </motion.div>

          {/* --- STATS BENTO GRID --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "Today's Sales",
                value: formatCurrency(data?.summary?.monthlySales || 0),
                sub: `${data?.stats?.todayOrders || 0} orders`,
                icon: TrendingUp,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                border: "border-emerald-100",
                shadow: "shadow-emerald-500/5",
              },
              {
                label: "Monthly Revenue",
                value: formatCurrency(data?.summary?.monthlySales || 0),
                sub: `${data?.stats?.monthlyOrders || 0} orders`,
                icon: ShoppingCart,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
                border: "border-indigo-100",
                shadow: "shadow-indigo-500/5",
              },
              {
                label: "Customers",
                value: data?.summary?.totalCustomers || 0,
                sub: "Total active",
                icon: Users,
                color: "text-purple-600",
                bg: "bg-purple-50",
                border: "border-purple-100",
                shadow: "shadow-purple-500/5",
              },
              {
                label: "Products",
                value: data?.summary?.totalProducts || 0,
                sub: `${data?.aiInsights?.lowStockCount || 0} low stock`,
                icon: Package,
                color: "text-rose-600",
                bg: "bg-rose-50",
                border: "border-rose-100",
                shadow: "shadow-rose-500/5",
              },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className={`relative group overflow-hidden bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-6 transition-all duration-300 hover:bg-white hover:scale-[1.02] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center border ${stat.border}`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
                    {stat.value}
                  </p>
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                    {stat.sub}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* --- CHARTS & INSIGHTS ROW --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Area Chart */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 relative overflow-hidden bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">
                    Revenue Trends
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Analyzing last 6 months performance
                  </p>
                </div>
                {/* <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-indigo-600 cursor-pointer transition-all hover:scale-105 active:scale-95">
                  <MoreHorizontal className="w-5 h-5 text-slate-400" />
                </div> */}
              </div>

              <div className="h-[300px] w-full relative z-10">
                {revenueChartData && revenueChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueChartData}
                      // FIX: bottom margin ko 0 se badhakar 25 kar diya hai taaki month names properly dikhein
                      margin={{ top: 20, right: 10, left: 0, bottom: 25 }}
                    >
                      <defs>
                        {/* Soft and vibrant gradient for the rounded bar */}
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
                          fontSize: 12,
                          fill: "#94a3b8",
                          fontWeight: 600,
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickMargin={16} // Text bar se kitna door rahega
                      />

                      <YAxis
                        tick={{
                          fontSize: 12,
                          fill: "#94a3b8",
                          fontWeight: 600,
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) =>
                          v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`
                        }
                        tickMargin={12}
                        width={55}
                      />

                      <Tooltip
                        cursor={{ fill: "rgba(139, 92, 246, 0.06)" }}
                        contentStyle={{
                          borderRadius: "16px",
                          border: "1px solid #f8fafc",
                          backgroundColor: "rgba(255, 255, 255, 0.85)",
                          backdropFilter: "blur(16px)",
                          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)",
                          padding: "14px 22px",
                        }}
                        itemStyle={{
                          color: "#8b5cf6",
                          fontWeight: 800,
                          fontSize: "16px",
                        }}
                        labelStyle={{
                          color: "#64748b",
                          fontWeight: 600,
                          marginBottom: "4px",
                        }}
                        formatter={(v: any) => [formatCurrency(v), "Revenue"]}
                      />

                      <Bar
                        dataKey="revenue"
                        fill="url(#barGradientPremium)"
                        radius={[100, 100, 100, 100]} // Full pill-shape top and bottom
                        barSize={32}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  // FIX: Empty State (Jab chart data load na ho ya 0 ho)
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <Activity className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-bold text-sm">
                      No revenue data for this period
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* AI Business Insights Card - Premium Style */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 backdrop-blur-2xl border border-white rounded-3xl p-6 md:p-8 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
            >
              {/* Decorative AI Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/50 rounded-full blur-3xl" />

              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Zap className="w-6 h-6 text-white fill-white/20" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    AI Analysis
                  </h3>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Smart Insights
                  </p>
                </div>
              </div>

              <div className="space-y-6 flex-1 relative z-10">
                {/* Top Performers */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Top Selling Items
                  </h4>
                  <div className="space-y-3">
                    {data?.aiInsights?.topSellingProducts
                      ?.slice(0, 2)
                      .map((p: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 truncate pr-2">
                              {p.name}
                            </span>
                          </div>
                          <span className="text-sm font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">
                            {p.totalSold}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Peak Sales Hours */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Peak Activity
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {data?.aiInsights?.bestSalesHours
                      ?.slice(0, 2)
                      .map((h: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm"
                        >
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-bold text-slate-700">
                            {h._id}:00 - {h._id + 1}:00
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* AI Alerts */}
                {data?.aiInsights?.lowStockCount > 0 && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-auto pt-4"
                  >
                    <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-4">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      </div>
                      <span className="text-sm font-bold text-rose-700 leading-tight">
                        {data.aiInsights.lowStockCount} products are critically
                        low on stock
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* --- BOTTOM BENTO ROW --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Invoices */}
            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-xl text-slate-900">
                  Recent Invoices
                </h3>
                <Link href={"/billing?tab=history"}>
                  <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">
                    View All
                  </button>
                </Link>
              </div>
              <div className="space-y-1">
                {data?.recentInvoices?.map((inv: any) => (
                  <div
                    key={inv._id}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-extrabold text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                        {inv.customerName?.charAt(0) || "W"}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">
                          {inv.customerName || "Walk-in Customer"}
                        </p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                          {inv.invoiceNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <p className="text-sm font-extrabold text-slate-900">
                        {formatCurrency(inv.grandTotal)}
                      </p>
                      <span className="text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-600">
                        {inv.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Low Stock Watchlist */}
            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-xl text-slate-900">
                  Low Stock Alert
                </h3>
              </div>
              <div className="space-y-3">
                {data?.lowStockProducts?.map((p: any) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                        <Package className="w-5 h-5 text-rose-500" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">
                        {p.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                          Left
                        </p>
                        <p className="text-sm font-extrabold text-rose-600">
                          {p.stock}
                        </p>
                      </div>
                      <Link href={"/suppliers"}>
                        <button className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition-colors cursor-pointer">
                          Restock
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
                {!data?.lowStockProducts?.length && (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Package className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-base font-bold text-slate-500">
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
