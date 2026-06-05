"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  Zap,
  Clock,
  Star,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Download,
  Filter,
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
  Cell,
} from "recharts";
import Link from "next/link";

// ─────────────────────────────────────────
// CONSTANTS & TIMINGS
// ─────────────────────────────────────────
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

const springTransition = { type: "spring", stiffness: 240, damping: 26 };

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.02, delayChildren: 0.01 },
  },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: springTransition },
};

// ─────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────

/** Clean Brand Sparkline for Summary Cards */
const Sparkline = ({ data, color }: { data: number[]; color: string }) => (
  <div className="h-[44px] w-full mt-2 -mb-2 -mx-1 opacity-80 group-hover:opacity-100 transition-opacity">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data.map((v, i) => ({ i, v }))}
        margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
      >
        <defs>
          <linearGradient
            id={`spark-${color.replace("#", "")}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={color} stopOpacity={0.12} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.8}
          fill={`url(#spark-${color.replace("#", "")})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

/** Minimal Radial Ring Progress Indicator */
const RingChart = ({
  pct,
  color,
  size = 42,
}: {
  pct: number;
  color: string;
  size?: number;
}) => {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth={3}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
};

/** High-Contrast Premium Glass Tooltip */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200/60 rounded-lg px-4 py-2.5 shadow-xl text-xs font-sans">
      <p className="font-bold text-slate-400 mb-2 uppercase tracking-wider text-[10px]">
        {label}
      </p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-3 my-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-slate-500 capitalize font-medium">
            {p.dataKey}:
          </span>
          <span className="font-bold text-[#0f172a] ml-auto pl-4">
            {p.dataKey === "revenue"
              ? formatCurrency(p.value)
              : p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

/** Framer Counter displays with strict style tracking */
const Counter = ({ value }: { value: string }) => (
  <motion.span
    key={value}
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className="tabular-nums font-bold text-[#0f172a] tracking-tight text-2xl block"
  >
    {value}
  </motion.span>
);

// ─────────────────────────────────────────
// MAIN DASHBOARD CONSOLE
// ─────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeRange, setActiveRange] = useState<"3M" | "6M" | "1Y">("1Y");

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setData(res.data?.data || res.data || {}))
      .catch((err) => console.error("Dashboard error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[75vh] bg-[#F5F5F5]">
          <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-slate-200 border-t-[#007676] rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const allChartData =
    data?.monthlyRevenue?.map((d: any) => ({
      name: MONTHS[d._id.month - 1],
      revenue: d.revenue,
      orders: d.orders,
    })) || [];
  const rangeMap = { "3M": 3, "6M": 6, "1Y": 12 };
  const chartData = allChartData.slice(-rangeMap[activeRange]);

  const sparks = {
    today: [
      2100,
      2800,
      2400,
      3500,
      3100,
      4200,
      data?.summary?.todaySales || 4280,
    ],
    monthly: [
      38000,
      42000,
      45000,
      41000,
      50000,
      52000,
      data?.summary?.monthlySales || 56265,
    ],
    customers: [
      900,
      950,
      980,
      1020,
      1080,
      1150,
      data?.summary?.totalCustomers || 1240,
    ],
    products: [
      410,
      405,
      400,
      398,
      392,
      388,
      data?.summary?.totalProducts || 384,
    ],
  };

  const catData = [
    { name: "Electronics", value: 38 },
    { name: "Grocery", value: 62 },
    { name: "Apparel", value: 45 },
    { name: "Home", value: 29 },
    { name: "Beauty", value: 51 },
  ];

  const BAR_COLORS = ["#007676", "#4f46e5", "#10b981", "#f59e0b", "#64748b"];

  const statCards = [
    {
      label: "Today's Sales",
      value: formatCurrency(data?.summary?.todaySales || 0),
      sub: `${data?.stats?.todayOrders || 0} orders received`,
      trend: "+12.4%",
      up: true,
      icon: TrendingUp,
      color: "#007676",
      bg: "bg-slate-50 border-slate-200 text-slate-700",
      spark: sparks.today,
      pct: 74,
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(data?.summary?.monthlySales || 0),
      sub: `${data?.stats?.monthlyOrders || 0} invoices cleared`,
      trend: "+40.15%",
      up: true,
      icon: ShoppingCart,
      color: "#007676",
      bg: "bg-slate-50 border-slate-200 text-slate-700",
      spark: sparks.monthly,
      pct: 88,
    },
    {
      label: "Total Customers",
      value: (data?.summary?.totalCustomers || 0).toLocaleString(),
      sub: "Active consumer base",
      trend: "+8.2%",
      up: true,
      icon: Users,
      color: "#64748b",
      bg: "bg-slate-50 border-slate-200 text-slate-700",
      spark: sparks.customers,
      pct: 61,
    },
    {
      label: "Active Products",
      value: (data?.summary?.totalProducts || 0).toLocaleString(),
      sub: `${data?.aiInsights?.lowStockCount || 0} items low stock`,
      trend: "-2.1%",
      up: false,
      icon: Package,
      color: "#64748b",
      bg: "bg-slate-50 border-slate-200 text-slate-700",
      spark: sparks.products,
      pct: 32,
    },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F5F5] text-[#334155] antialiased pb-16 font-sans">
        <motion.div
          className="w-full mx-auto px-4 sm:px-8 py-6 space-y-5"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Top Navbar Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1e293b]">
                Store Overview
              </h1>
              <p className="hidden sm:block text-xs font-medium text-slate-400 mt-0.5">
                Monitor real-time sales curves, invoices, metrics and stock
                levels updates.
              </p>
            </div>
            <div className="text-sm font-medium text-slate-500 flex items-center gap-2 sm:order-none">
              <span className="hover:text-slate-800 cursor-pointer">🏠</span>
              <span>/</span>
              <span className="hover:text-slate-800 cursor-pointer">
                Dashboard
              </span>
              <span>/</span>
              <span className="text-slate-600 font-semibold">Overview</span>
            </div>
          </div>

          {/* High Visibility Stats Blocks Array */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {statCards.map((s) => (
              <motion.div
                key={s.label}
                variants={cardVariants}
                className="group bg-white border border-slate-200/60 rounded-lg p-5 shadow-sm transition-all duration-150 relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#4f46e5] font-bold text-base shrink-0 shadow-xs">
                    <s.icon className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`flex items-center gap-0.5 text-[10px] font-bold px-3 py-1 rounded-md border ${s.up ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-rose-700 bg-rose-50 border-rose-100"}`}
                    >
                      {s.up ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {s.trend}
                    </span>
                    <div className="relative flex items-center justify-center">
                      <RingChart pct={s.pct} color={s.color} />
                      <span className="absolute text-[9px] font-bold text-slate-400">
                        {s.pct}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {s.label}
                  </p>
                  <Counter value={s.value} />
                  <p className="text-[11px] font-medium text-slate-400">
                    {s.sub}
                  </p>
                </div>

                <Sparkline data={s.spark} color={s.color} />
              </motion.div>
            ))}
          </div>

          {/* Core Analytical Panels Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            {/* Sales Volume Stream Chart */}
            <motion.div
              variants={cardVariants}
              className="xl:col-span-7 bg-white rounded-lg p-4 sm:p-6 border border-slate-200/60 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-base text-[#1e293b] tracking-tight">
                    Sales Analytics Chart
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    Comparing revenue volume metrics against cleared store
                    orders tracking indexes.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-md border border-slate-200/60 self-start sm:self-auto">
                  {(["3M", "6M", "1Y"] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setActiveRange(range)}
                      className={`px-3 py-1 text-sm font-bold border rounded-md transition-all ${activeRange === range ? "bg-[#007676] text-white border-[#007676]" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[240px] sm:h-[280px] w-full text-xs">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 5, left: -22, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="gBrandRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#007676"
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#007676"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="gBrandOrders"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#4f46e5"
                            stopOpacity={0.12}
                          />
                          <stop
                            offset="100%"
                            stopColor="#4f46e5"
                            stopOpacity={0}
                          />
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
                          fontSize: 10,
                          fill: "#94a3b8",
                          fontWeight: 500,
                        }}
                        axisLine={false}
                        tickLine={false}
                        dy={8}
                      />
                      <YAxis
                        yAxisId="rev"
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                      />
                      <YAxis
                        yAxisId="ord"
                        orientation="right"
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={<ChartTooltip />}
                        cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                      />
                      <Area
                        yAxisId="rev"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#007676"
                        strokeWidth={2.5}
                        fill="url(#gBrandRevenue)"
                        activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
                      />
                      <Area
                        yAxisId="ord"
                        type="monotone"
                        dataKey="orders"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        fill="url(#gBrandOrders)"
                        activeDot={{ r: 4, stroke: "#fff", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <Activity className="w-6 h-6 mb-2 animate-pulse" />
                    <p className="text-xs font-semibold">
                      No operational records identified
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-100">
                {[
                  {
                    label: "Total Sales",
                    val: formatCurrency(data?.summary?.monthlySales || 56265),
                    d: "+40.15%",
                    up: true,
                  },
                  {
                    label: "Total Purchases",
                    val: formatCurrency(
                      (data?.summary?.todaySales || 4280) * 3.5,
                    ),
                    d: "-20.25%",
                    up: false,
                  },
                  {
                    label: "Total Returns",
                    val: formatCurrency(
                      (data?.aiInsights?.lowStockCount || 5) * 800,
                    ),
                    d: "+18.15%",
                    up: true,
                  },
                ].map((m) => (
                  <div key={m.label} className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block truncate">
                      {m.label}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#0f172a] block tracking-tight truncate">
                      {m.val}
                    </span>
                    <span
                      className={`text-[11px] font-semibold block ${m.up ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {m.d}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Category Performance Framework */}
            <motion.div
              variants={cardVariants}
              className="xl:col-span-5 bg-white rounded-lg p-5 sm:p-6 border border-slate-200/60 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base text-[#1e293b] tracking-tight">
                      Category Breakdown
                    </h3>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">
                      Current active monthly stock allocation distributions
                      records
                    </p>
                  </div>
                  <button className="p-2.5 border border-slate-200 rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>

                <div className="h-[140px] w-full my-4 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={catData}
                      margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                      barSize={12}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f5f9"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 10,
                          fill: "#94a3b8",
                          fontWeight: 500,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />{" "}
                      <YAxis
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip cursor={{ fill: "rgba(241,245,249,0.2)" }} />
                      <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                        {catData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={BAR_COLORS[i % BAR_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                {catData.map((c, i) => (
                  <div key={c.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">{c.name}</span>
                      <span
                        className="font-bold"
                        style={{ color: BAR_COLORS[i] }}
                      >
                        {c.value}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: BAR_COLORS[i] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${c.value}%` }}
                        transition={{ duration: 0.6, delay: i * 0.03 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Lower Section Management Blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-5">
            {/* AI Smart Insights Panel */}
            <motion.div
              variants={cardVariants}
              className="xl:col-span-3 bg-[#1e293b] border border-slate-800 rounded-lg p-5 text-white flex flex-col justify-between space-y-5 shadow-sm"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shadow-inner">
                  <Zap className="w-4 h-4 text-amber-400 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white tracking-tight">
                    Smart Insights
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    Active Store Analysis
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Top Selling Products
                </span>
                {data?.aiInsights?.topSellingProducts
                  ?.slice(0, 3)
                  .map((p: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-md px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-current shrink-0" />
                        <span className="text-xs text-slate-200 font-medium truncate">
                          {p.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded shrink-0">
                        {p.totalSold} sold
                      </span>
                    </div>
                  ))}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Peak Hours Matrix
                </span>
                <div className="flex flex-wrap gap-2">
                  {data?.aiInsights?.bestSalesHours
                    ?.slice(0, 2)
                    .map((h: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-slate-300"
                      >
                        <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        {h._id}:00 – {h._id + 1}:00
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>

            {/* Low Stock Alerts Module */}
            <motion.div
              variants={cardVariants}
              className="xl:col-span-3 bg-white rounded-lg p-5 border border-slate-200/60 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm text-[#1e293b] tracking-tight">
                      Low Stock Alert
                    </h3>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">
                      Items requiring logistics restock
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-rose-50 border border-rose-100 text-rose-600 px-3 py-1 rounded-md">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                    Alert
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {data?.lowStockProducts?.map((p: any) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between p-2 rounded-md bg-slate-50/60 border border-slate-200/40 gap-2 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-rose-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Stock:{" "}
                            <span className="text-rose-600 font-bold">
                              {p.stock}
                            </span>
                          </p>
                        </div>
                      </div>
                      <Link href="/suppliers" className="shrink-0">
                        <button className="text-[10px] bg-[#007676] hover:bg-[#005f5f] text-white px-2.5 py-1.5 rounded font-bold shadow-2xs transition-colors">
                          Restock
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recent Invoices Ledger Table Module */}
            <motion.div
              variants={cardVariants}
              className="lg:col-span-2 xl:col-span-6 bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden"
            >
              <div className="p-4 sm:p-6 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#1e293b] tracking-tight">
                    Recent Invoices
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    Latest business store ledger logs metrics
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-2 border border-slate-200 rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <Link href="/billing?tab=history">
                    <button className="flex items-center gap-0.5 text-xs font-bold text-slate-700 hover:text-[#007676] transition-colors">
                      View all <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Table Framework synchronized with Product Page Layout */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-[#f8fafc]">
                      <th className="pl-6 px-4 py-3.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none">
                        CUSTOMER
                      </th>
                      <th className="px-4 py-3.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none">
                        INVOICE
                      </th>
                      <th className="px-4 py-3.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none hidden sm:table-cell">
                        DATE
                      </th>
                      <th className="px-4 py-3.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none text-right">
                        AMOUNT
                      </th>
                      <th className="pr-6 px-4 py-3.5 text-xs font-bold text-[#475569] uppercase tracking-wider select-none text-right">
                        STATUS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {data?.recentInvoices?.map((inv: any) => (
                      <tr
                        key={inv._id}
                        className="hover:bg-slate-50/40 transition-colors group"
                      >
                        <td className="pl-6 px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-[10px] font-bold shadow-inner shrink-0">
                              {inv.customerName?.charAt(0) || "W"}
                            </div>
                            <span className="text-xs font-bold text-[#0f172a] truncate max-w-[110px]">
                              {inv.customerName || "Walk-in Buyer"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono font-medium text-slate-400">
                            {inv.invoiceNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-xs text-slate-400 font-medium">
                            {inv.date
                              ? new Date(inv.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs font-bold text-[#0f172a]">
                            {formatCurrency(inv.grandTotal)}
                          </span>
                        </td>
                        <td className="pr-6 px-4 py-3 text-right">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block border ${
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
