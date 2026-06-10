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
  Wallet,
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
import { useTheme } from "@/hooks/useTheme";

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
const BAR_COLORS = [
  "#007676",
  "#4f46e5",
  "#10b981",
  "#f59e0b",
  "#64748b",
  "#e11d48",
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
  // @ts-ignore
  show: { opacity: 1, y: 0, transition: springTransition },
};

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
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
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
        stroke="currentColor"
        strokeWidth={3}
        className="text-slate-100 dark:text-slate-700"
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

const ChartTooltip = ({ active, payload, label, isDark }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={`rounded-lg px-4 py-2.5 shadow-xl text-xs font-sans border ${
        isDark
          ? "bg-slate-800 border-slate-700 text-slate-200"
          : "bg-white border-slate-200/60 text-slate-700"
      }`}
    >
      <p className="font-bold mb-2 uppercase tracking-wider text-[10px] text-slate-400">
        {label}
      </p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-3 my-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span
            className={`capitalize font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            {p.dataKey}:
          </span>
          <span
            className={`font-bold ml-auto pl-4 ${isDark ? "text-white" : "text-[#0f172a]"}`}
          >
            {p.dataKey === "revenue"
              ? formatCurrency(p.value)
              : p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

const Counter = ({ value }: { value: string }) => (
  <motion.span
    key={value}
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className="tabular-nums font-bold text-[#0f172a] dark:text-white tracking-tight text-2xl block"
  >
    {value}
  </motion.span>
);

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeRange, setActiveRange] = useState<"3M" | "6M" | "1Y">("1Y");
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
        <div className="flex items-center justify-center min-h-[75vh] bg-[#F5F5F5] dark:bg-[#0f172a]">
          <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-slate-200 dark:border-slate-700 border-t-[#007676] rounded-full animate-spin" />
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

  // Dynamic category data from API
  const catData = data?.categoryBreakdown?.length ? data.categoryBreakdown : [];

  // Dynamic sparklines from monthly revenue
  const buildSpark = (final: number) => {
    const base = final * 0.6;
    return [0.5, 0.6, 0.7, 0.65, 0.8, 0.9, 1].map((m) =>
      Math.round(base * m + (final - base) * m),
    );
  };

  const monthlyTrend = data?.stats?.monthlyTrend || 0;

  const statCards = [
    {
      label: "Today's Sales",
      value: formatCurrency(data?.summary?.todaySales || 0),
      sub: `${data?.stats?.todayOrders || 0} orders today`,
      trend: `${data?.stats?.todayOrders > 0 ? "+" : ""}${data?.stats?.todayOrders || 0} orders`,
      up: (data?.stats?.todayOrders || 0) > 0,
      icon: TrendingUp,
      color: "#007676",
      spark: buildSpark(data?.summary?.todaySales || 0),
      pct: Math.min(
        Math.round(
          ((data?.summary?.todaySales || 0) /
            Math.max(data?.summary?.monthlySales || 1, 1)) *
            100,
        ),
        100,
      ),
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(data?.summary?.monthlySales || 0),
      sub: `${data?.stats?.monthlyOrders || 0} invoices this month`,
      trend: `${monthlyTrend >= 0 ? "+" : ""}${monthlyTrend}%`,
      up: monthlyTrend >= 0,
      icon: ShoppingCart,
      color: "#007676",
      spark: buildSpark(data?.summary?.monthlySales || 0),
      pct: Math.min(Math.abs(monthlyTrend), 100),
    },
    {
      label: "Total Customers",
      value: (data?.summary?.totalCustomers || 0).toLocaleString(),
      sub: `${data?.summary?.totalSuppliers || 0} suppliers`,
      trend: `${data?.summary?.totalCustomers || 0} active`,
      up: true,
      icon: Users,
      color: "#64748b",
      spark: buildSpark(data?.summary?.totalCustomers || 0),
      pct: 61,
    },
    {
      label: "Active Products",
      value: (data?.summary?.totalProducts || 0).toLocaleString(),
      sub: `${data?.aiInsights?.lowStockCount || 0} items low stock`,
      trend: `${data?.aiInsights?.lowStockCount || 0} low stock`,
      up: (data?.aiInsights?.lowStockCount || 0) === 0,
      icon: Package,
      color: "#64748b",
      spark: buildSpark(data?.summary?.totalProducts || 0),
      pct: 32,
    },
  ];

  const axisColor = isDark ? "#475569" : "#64748b";
  const gridColor = isDark ? "#1e293b" : "#e2e8f0";

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0f172a] text-[#334155] dark:text-slate-300 antialiased pb-16 font-sans transition-colors duration-200">
        <motion.div
          className="w-full mx-auto px-4 sm:px-8 py-6 space-y-5"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1e293b] dark:text-white">
                Store Overview
              </h1>
              <p className="hidden sm:block text-xs font-medium text-slate-400 mt-0.5">
                Monitor real-time sales curves, invoices, metrics and stock
                levels updates.
              </p>
            </div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>🏠</span>
              <span>/</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                Dashboard
              </span>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {statCards.map((s) => (
              <motion.div
                key={s.label}
                variants={cardVariants}
                className="group bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 rounded-lg p-5 shadow-sm transition-all duration-150 relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-lg bg-[#eff6ff] dark:bg-slate-700 flex items-center justify-center text-[#4f46e5] font-bold shrink-0">
                    <s.icon className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`flex items-center gap-0.5 text-[10px] font-bold px-3 py-1 rounded-md border ${
                        s.up
                          ? "text-emerald-700 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400"
                          : "text-rose-700 bg-rose-50 border-rose-100 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400"
                      }`}
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
                      <span className="absolute text-[9px] font-bold text-slate-400 dark:text-slate-500">
                        {s.pct}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    {s.label}
                  </p>
                  <Counter value={s.value} />
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    {s.sub}
                  </p>
                </div>
                <Sparkline data={s.spark} color={s.color} />
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Sales Area Chart */}
            <motion.div
              variants={cardVariants}
              className="xl:col-span-7 bg-white dark:bg-slate-800/70 rounded-2xl p-5 sm:p-7 border border-slate-200/50 dark:border-slate-700/50 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white tracking-tight">
                    Sales Analytics
                  </h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                    Revenue vs orders comparison
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-50/80 dark:bg-slate-700/50 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-600/50 self-start sm:self-auto">
                  {(["3M", "6M", "1Y"] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setActiveRange(range)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                        activeRange === range
                          ? "bg-[#007676] text-white shadow-md"
                          : "bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[260px] sm:h-[300px] w-full text-xs">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 20, right: -30, left: -10, bottom: 0 }}
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
                            offset="5%"
                            stopColor="#007676"
                            stopOpacity={isDark ? 0.35 : 0.25}
                          />
                          <stop
                            offset="95%"
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
                            offset="5%"
                            stopColor="#4f46e5"
                            stopOpacity={isDark ? 0.35 : 0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor="#4f46e5"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke={gridColor}
                        vertical={false}
                        opacity={0.6}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 11,
                          fill: axisColor,
                          fontWeight: 500,
                        }}
                        axisLine={false}
                        tickLine={false}
                        dy={12}
                      />
                      <YAxis
                        yAxisId="rev"
                        tick={{
                          fontSize: 11,
                          fill: axisColor,
                          fontWeight: 500,
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                        dx={-8}
                      />
                      <YAxis
                        yAxisId="ord"
                        orientation="right"
                        tick={{
                          fontSize: 11,
                          fill: axisColor,
                          fontWeight: 500,
                        }}
                        axisLine={false}
                        tickLine={false}
                        dx={8}
                      />
                      <Tooltip
                        content={(props) => (
                          <ChartTooltip {...props} isDark={isDark} />
                        )}
                        cursor={{
                          stroke: isDark ? "#334155" : "#cbd5e1",
                          strokeWidth: 1.5,
                          strokeDasharray: "4 4",
                        }}
                      />
                      <Area
                        yAxisId="rev"
                        type="natural"
                        dataKey="revenue"
                        stroke="#007676"
                        strokeWidth={3}
                        fill="url(#gBrandRevenue)"
                        activeDot={{
                          r: 6,
                          fill: "#007676",
                          stroke: isDark ? "#1e293b" : "#fff",
                          strokeWidth: 3,
                        }}
                      />
                      <Area
                        yAxisId="ord"
                        type="natural"
                        dataKey="orders"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        fill="url(#gBrandOrders)"
                        activeDot={{
                          r: 6,
                          fill: "#4f46e5",
                          stroke: isDark ? "#1e293b" : "#fff",
                          strokeWidth: 3,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-700/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-600">
                    <Activity className="w-8 h-8 mb-3 animate-pulse text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-medium">No sales data yet</p>
                  </div>
                )}
              </div>
              {/* Summary row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                {[
                  {
                    label: "Monthly Sales",
                    val: formatCurrency(data?.summary?.monthlySales || 0),
                    trend: `${monthlyTrend >= 0 ? "+" : ""}${monthlyTrend}%`,
                    up: monthlyTrend >= 0,
                    bg: "bg-teal-50/50 dark:bg-teal-900/20",
                  },
                  {
                    label: "Yearly Sales",
                    val: formatCurrency(data?.summary?.yearlySales || 0),
                    trend: "YTD",
                    up: true,
                    bg: "bg-slate-50/80 dark:bg-slate-700/30",
                  },
                  {
                    label: "Outstanding",
                    val: formatCurrency(data?.summary?.outstandingBalance || 0),
                    trend: "Pending",
                    up: false,
                    bg: "bg-indigo-50/50 dark:bg-indigo-900/20",
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    className={`${m.bg} p-4 rounded-xl border border-slate-100/80 dark:border-slate-600/40 flex flex-col justify-center`}
                  >
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate mb-1">
                      {m.label}
                    </span>
                    <div className="flex items-end justify-between">
                      <span className="text-lg font-bold text-slate-800 dark:text-white tracking-tight truncate">
                        {m.val}
                      </span>
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                          m.up
                            ? "text-emerald-700 bg-emerald-100/50 dark:text-emerald-400 dark:bg-emerald-900/30"
                            : "text-rose-700 bg-rose-100/50 dark:text-rose-400 dark:bg-rose-900/30"
                        }`}
                      >
                        {m.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Category Breakdown — fully dynamic */}
            <motion.div
              variants={cardVariants}
              className="xl:col-span-5 bg-white dark:bg-slate-800/70 rounded-2xl p-5 sm:p-7 border border-slate-200/50 dark:border-slate-700/50 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white tracking-tight">
                      Category Breakdown
                    </h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                      {catData.length > 0
                        ? `${catData.length} categories · ${data?.summary?.totalProducts || 0} products`
                        : "No products yet"}
                    </p>
                  </div>
                </div>
                {catData.length > 0 ? (
                  <div className="h-[160px] w-full my-6 text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={catData}
                        margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
                        barSize={16}
                      >
                        <CartesianGrid
                          strokeDasharray="4 4"
                          stroke={isDark ? "#1e293b" : "#f1f5f9"}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{
                            fontSize: 11,
                            fill: axisColor,
                            fontWeight: 500,
                          }}
                          axisLine={false}
                          tickLine={false}
                          dy={10}
                        />
                        <YAxis
                          tick={{
                            fontSize: 11,
                            fill: axisColor,
                            fontWeight: 500,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{
                            fill: isDark
                              ? "rgba(30,41,59,0.4)"
                              : "rgba(241,245,249,0.4)",
                          }}
                          contentStyle={{
                            borderRadius: "8px",
                            border: isDark ? "1px solid #334155" : "none",
                            background: isDark ? "#1e293b" : "#fff",
                            color: isDark ? "#e2e8f0" : "#0f172a",
                          }}
                        />
                        <Bar
                          dataKey="value"
                          radius={[4, 4, 4, 4]}
                          background={{
                            fill: isDark ? "#1e293b" : "#f8fafc",
                            radius: 4,
                          }}
                        >
                          {catData.map((_: any, i: number) => (
                            <Cell
                              key={i}
                              fill={BAR_COLORS[i % BAR_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[160px] flex items-center justify-center text-slate-400 text-sm">
                    No category data
                  </div>
                )}
              </div>
              <div className="space-y-4 mt-2">
                {catData.map((c: any, i: number) => (
                  <div key={c.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="text-slate-600 dark:text-slate-300">
                        {c.name}
                      </span>
                      <span
                        className="font-bold"
                        style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}
                      >
                        {c.value}%{" "}
                        <span className="text-slate-400 font-normal text-xs">
                          ({c.count})
                        </span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100/80 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: BAR_COLORS[i % BAR_COLORS.length],
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${c.value}%` }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.05,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Lower Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-5">
            {/* Smart Insights */}
            <motion.div
              variants={cardVariants}
              className="xl:col-span-3 bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white tracking-tight">
                    Smart Insights
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Active Store Analysis
                  </p>
                </div>
              </div>
              <div className="space-y-3 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Top Selling Products
                </span>
                {data?.aiInsights?.topSellingProducts?.length > 0 ? (
                  data.aiInsights.topSellingProducts
                    .slice(0, 3)
                    .map((p: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50 rounded-lg px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-current shrink-0" />
                          <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold truncate">
                            {p.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-md shrink-0">
                          {p.totalSold} sold
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No sales data yet
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Peak Hours
                </span>
                <div className="flex flex-wrap gap-2">
                  {data?.aiInsights?.bestSalesHours?.length > 0 ? (
                    data.aiInsights.bestSalesHours
                      .slice(0, 2)
                      .map((h: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                        >
                          <Clock className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                          {h._id}:00 – {h._id + 1}:00
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-slate-400">No data yet</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Low Stock Alert */}
            <motion.div
              variants={cardVariants}
              className="xl:col-span-3 bg-white dark:bg-slate-800/70 rounded-lg p-5 border border-slate-200/60 dark:border-slate-700/50 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <h3 className="font-bold text-sm text-[#1e293b] dark:text-white tracking-tight">
                      Low Stock Alert
                    </h3>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">
                      Items requiring restock
                    </p>
                  </div>
                  {(data?.aiInsights?.lowStockCount || 0) > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-md">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                      {data.aiInsights.lowStockCount} items
                    </span>
                  )}
                </div>
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {data?.lowStockProducts?.length > 0 ? (
                    data.lowStockProducts.map((p: any) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between p-2 rounded-md bg-slate-50/60 dark:bg-slate-700/40 border border-slate-200/40 dark:border-slate-600/40 gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Stock:{" "}
                              <span className="text-rose-600 dark:text-rose-400 font-bold">
                                {p.stock}
                              </span>
                              {p.lowStockAlert && (
                                <span className="text-slate-300">
                                  {" "}
                                  / {p.lowStockAlert} min
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <Link href="/suppliers" className="shrink-0">
                          <button className="text-[10px] bg-[#007676] hover:bg-[#005f5f] text-white px-2.5 py-1.5 rounded font-bold transition-colors">
                            Restock
                          </button>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                      <Package className="w-8 h-8 mb-2 text-slate-300" />
                      <p className="text-xs font-medium">All stocks healthy</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Recent Invoices */}
            <motion.div
              variants={cardVariants}
              className="lg:col-span-2 xl:col-span-6 bg-white dark:bg-slate-800/70 rounded-lg border border-slate-200/60 dark:border-slate-700/50 shadow-sm overflow-hidden"
            >
              <div className="p-4 sm:p-6 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#1e293b] dark:text-white tracking-tight">
                    Recent Invoices
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    Latest transactions
                  </p>
                </div>
                <Link href="/billing?tab=history">
                  <button className="flex items-center gap-0.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#007676] transition-colors">
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-700/40">
                      {["CUSTOMER", "INVOICE", "DATE", "AMOUNT", "STATUS"].map(
                        (h, i) => (
                          <th
                            key={h}
                            className={`${i === 0 ? "pl-6" : ""} ${i === 4 ? "pr-6 text-right" : ""} ${i === 3 ? "text-right" : ""} ${i === 2 ? "hidden sm:table-cell" : ""} px-4 py-3.5 text-xs font-bold text-[#475569] dark:text-slate-400 uppercase tracking-wider`}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-white dark:bg-transparent">
                    {data?.recentInvoices?.length > 0 ? (
                      data.recentInvoices.map((inv: any) => (
                        <tr
                          key={inv._id}
                          className="hover:bg-slate-50/40 dark:hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="pl-6 px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-300 text-[10px] font-bold shrink-0">
                                {inv.customerName?.charAt(0) || "W"}
                              </div>
                              <span className="text-xs font-bold text-[#0f172a] dark:text-slate-100 truncate max-w-[110px]">
                                {inv.customerName || "Walk-in"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">
                              {inv.invoiceNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                              {inv.invoiceDate
                                ? new Date(inv.invoiceDate).toLocaleDateString(
                                    "en-IN",
                                    { month: "short", day: "numeric" },
                                  )
                                : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs font-bold text-[#0f172a] dark:text-slate-100">
                              {formatCurrency(inv.grandTotal)}
                            </span>
                          </td>
                          <td className="pr-6 px-4 py-3 text-right">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block border ${
                                inv.paymentStatus === "paid"
                                  ? "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400"
                                  : inv.paymentStatus === "pending"
                                    ? "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400"
                                    : "bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-400"
                              }`}
                            >
                              {inv.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-8 text-slate-400 text-sm"
                        >
                          No invoices yet
                        </td>
                      </tr>
                    )}
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
