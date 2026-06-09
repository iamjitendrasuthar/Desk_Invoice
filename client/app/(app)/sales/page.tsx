"use client";

import { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/layout/AppLayout";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  TrendingUp,
  Package,
  Zap,
  Filter,
  BarChart3,
  PieChart as PieIcon,
  X,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
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
const PIE_COLORS = ["#007676", "#4f46e5", "#10b981", "#f59e0b", "#64748b"];

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

const ChartTooltip = ({ active, payload, label, isDark }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={`rounded-lg px-4 py-2.5 shadow-xl text-xs font-sans border ${isDark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200/60"}`}
    >
      {label && (
        <p className="font-bold text-slate-400 mb-2 uppercase tracking-wider text-[10px]">
          {label}
        </p>
      )}
      {payload.map((p: any) => (
        <div key={p.dataKey || p.name} className="flex items-center gap-3 my-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color || p.payload?.fill }}
          />
          <span
            className={`capitalize font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            {p.dataKey || p.name}:
          </span>
          <span
            className={`font-bold ml-auto pl-4 ${isDark ? "text-white" : "text-[#0f172a]"}`}
          >
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function SalesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState("day");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (globalError) {
      const t = setTimeout(() => setGlobalError(null), 5000);
      return () => clearTimeout(t);
    }
  }, [globalError]);

  useEffect(() => {
    setLoading(true);
    api
      .get("/sales/report", { params: { startDate, endDate, groupBy } })
      .then((r) => {
        setData(r.data?.data || r.data);
        setLoading(false);
      })
      .catch((err) => {
        setGlobalError("Failed to load sales data.");
        setLoading(false);
      });
  }, [startDate, endDate, groupBy]);

  const chartData =
    data?.salesData?.map((d: any) => ({
      name:
        groupBy === "month"
          ? MONTHS[d._id.month - 1]
          : `${d._id.day || ""} ${MONTHS[(d._id.month || 1) - 1]}`,
      revenue: d.revenue,
      orders: d.orders,
    })) || [];

  const totalRevenue =
    data?.salesData?.reduce((s: number, d: any) => s + d.revenue, 0) || 0;
  const totalOrders =
    data?.salesData?.reduce((s: number, d: any) => s + d.orders, 0) || 0;
  const totalGST =
    data?.salesData?.reduce((s: number, d: any) => s + (d.gst || 0), 0) || 0;
  const paymentData =
    data?.paymentMethods?.map((p: any) => ({
      name: p._id?.toUpperCase() || "OTHER",
      value: p.total,
      count: p.count,
    })) || [];

  const axisColor = isDark ? "#475569" : "#94a3b8";
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";

  const inputClass =
    "w-full px-4 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-sm font-semibold text-slate-700 dark:text-slate-200 rounded-md focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-all cursor-pointer";

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0f172a] text-[#334155] dark:text-slate-300 antialiased pb-16 font-sans relative transition-colors duration-200">
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
                  className="p-1 hover:bg-rose-100 dark:hover:bg-rose-800/50 rounded text-rose-400 hover:text-rose-700 transition-colors"
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
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1e293b] dark:text-white">
                Sales Analytics
              </h1>
              <p className="hidden sm:block text-xs font-medium text-slate-400 mt-0.5">
                Monitor revenue matrices, tax metrics, and payment channels.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
                🏠
              </span>
              <span>/</span>
              <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
                Reports
              </span>
              <span>/</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                Sales Report
              </span>
            </div>
          </div>

          {/* Filters */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 p-4 rounded-lg shadow-sm"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-2 shrink-0 lg:pr-4 lg:border-r border-slate-100 dark:border-slate-700">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
                  Filters
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 w-full">
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => startDateRef.current?.showPicker()}
                >
                  <input
                    ref={startDateRef}
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <span className="hidden sm:block text-slate-300 dark:text-slate-600 font-bold text-sm shrink-0">
                  →
                </span>
                <span className="block sm:hidden text-slate-400 font-bold text-[10px] text-center uppercase tracking-wider">
                  to
                </span>
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => endDateRef.current?.showPicker()}
                >
                  <input
                    ref={endDateRef}
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="hidden lg:block w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="relative w-full sm:w-44 shrink-0">
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700/50 text-sm font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 appearance-none cursor-pointer"
                  >
                    <option value="day">Daily View</option>
                    <option value="month">Monthly View</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-slate-400">
                    ▼
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                label: "Total Revenue",
                value: formatCurrency(totalRevenue),
                icon: TrendingUp,
                color: "text-[#007676]",
                bg: "bg-[#eff6ff] dark:bg-slate-700",
              },
              {
                label: "Total Orders",
                value: totalOrders,
                icon: Package,
                color: "text-slate-700 dark:text-slate-300",
                bg: "bg-slate-50 dark:bg-slate-700",
              },
              {
                label: "GST Collected",
                value: formatCurrency(totalGST),
                icon: Zap,
                color: "text-slate-700 dark:text-slate-300",
                bg: "bg-slate-50 dark:bg-slate-700",
              },
            ].map((s) => (
              <motion.div
                key={s.label}
                variants={itemVariants}
                className="bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 p-5 sm:p-6 rounded-lg shadow-sm flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    {s.label}
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-[#1e293b] dark:text-white block tracking-tight">
                    {s.value}
                  </span>
                </div>
                <div
                  className={`w-11 h-11 rounded-lg ${s.bg} border border-slate-100 dark:border-slate-600 flex items-center justify-center shadow-inner shrink-0`}
                >
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Bar Chart */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 rounded-lg p-5 sm:p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shadow-inner">
                  <BarChart3 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1e293b] dark:text-white tracking-tight">
                    Revenue Chart
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    Financial metrics over selected period.
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-[280px]">
                  <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-slate-200 dark:border-slate-600 border-t-[#007676] rounded-full animate-spin" />
                </div>
              ) : (
                <div className="h-[280px] w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 5, left: -22, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="brandBarGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#007676"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#005f5f"
                            stopOpacity={0.85}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={gridColor}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 10,
                          fill: axisColor,
                          fontWeight: 500,
                        }}
                        axisLine={false}
                        tickLine={false}
                        dy={8}
                      />
                      <YAxis
                        tick={{
                          fontSize: 10,
                          fill: axisColor,
                          fontWeight: 500,
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        cursor={{
                          fill: isDark
                            ? "rgba(255,255,255,0.03)"
                            : "rgba(0,118,118,0.02)",
                        }}
                        content={(props) => (
                          <ChartTooltip {...props} isDark={isDark} />
                        )}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="url(#brandBarGrad)"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>

            {/* Pie Chart */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 rounded-lg p-5 sm:p-6 shadow-sm flex flex-col"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shadow-inner">
                  <PieIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1e293b] dark:text-white tracking-tight">
                    Payment Distribution
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    Channels used during checkout.
                  </p>
                </div>
              </div>
              {paymentData.length > 0 && !loading ? (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="relative h-[160px] w-full flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {paymentData.map((_: any, i: number) => (
                            <Cell
                              key={`cell-${i}`}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={(props) => (
                            <ChartTooltip {...props} isDark={isDark} />
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="pt-4 space-y-2 max-h-[160px] overflow-y-auto pr-0.5">
                    {paymentData.map((p: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50 shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded"
                            style={{
                              background: PIE_COLORS[i % PIE_COLORS.length],
                            }}
                          />
                          <span className="font-bold text-xs text-slate-700 dark:text-slate-200">
                            {p.name}
                          </span>
                        </div>
                        <span className="font-bold text-xs text-[#0f172a] dark:text-white">
                          {formatCurrency(p.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                  <PieIcon className="w-10 h-10 mb-2 opacity-25" />
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                    No payment logs found
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Detailed Table */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 rounded-lg shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-700/30">
              <h3 className="font-bold text-base text-[#1e293b] dark:text-white tracking-tight">
                Detailed Statements
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-700/40">
                    {[
                      "REPORTING PERIOD",
                      "ORDERS COUNT",
                      "GROSS REVENUE",
                      "GST TAX",
                      "DISCOUNT VOLUME",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`${i === 0 ? "pl-6" : ""} ${i === 4 ? "pr-6" : ""} px-4 py-4 text-xs font-bold text-[#475569] dark:text-slate-400 uppercase tracking-wider select-none ${i > 0 ? "text-center" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-white dark:bg-transparent">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-slate-200 dark:border-slate-600 border-t-[#007676] rounded-full animate-spin" />
                      </td>
                    </tr>
                  ) : data?.salesData?.length > 0 ? (
                    data.salesData.map((d: any, i: number) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50/40 dark:hover:bg-slate-700/30 transition-colors duration-100"
                      >
                        <td className="pl-6 px-4 py-4">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2.5 py-0.5 rounded-md">
                            {groupBy === "month"
                              ? MONTHS[d._id.month - 1]
                              : `${d._id.day} ${MONTHS[(d._id.month || 1) - 1]} ${d._id.year}`}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-semibold text-[#475569] dark:text-slate-400">
                          {d.orders}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-block text-sm font-bold text-[#0f172a] dark:text-slate-100 bg-[#f8fafc] dark:bg-slate-700 border border-slate-100 dark:border-slate-600 px-3 py-1.5 rounded-lg shadow-2xs">
                            {formatCurrency(d.revenue)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                          {formatCurrency(d.gst || 0)}
                        </td>
                        <td className="pr-6 px-4 py-4 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                          {formatCurrency(d.discount || 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-20 text-sm font-semibold text-slate-400 dark:text-slate-500"
                      >
                        No sales records found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
