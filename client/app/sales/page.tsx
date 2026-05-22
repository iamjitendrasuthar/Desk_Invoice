"use client";
import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
import {
  TrendingUp,
  Package,
  Zap,
  Calendar,
  Filter,
  BarChart3,
  PieChart as PieIcon,
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

// Premium Apple-inspired color palette for the Pie Chart
const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

// Framer Motion Variants
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

export default function SalesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState("day");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    setLoading(true);
    api
      .get("/sales/report", { params: { startDate, endDate, groupBy } })
      .then((r) => {
        // FIX: API response ko safely extract karna
        const responseData = r.data?.data || r.data;
        setData(responseData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Sales data fetch error:", err);
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

  return (
    <AppLayout>
      {/* Light Background with Soft Pastel Orbs */}
      <div className="relative min-h-screen bg-[#f8fafc] text-slate-900 overflow-hidden rounded-3xl font-sans">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-pink-400/10 blur-[130px] pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Header Section */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2"
          >
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                Sales Analytics
              </h1>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold tracking-wide text-indigo-600 uppercase">
              <BarChart3 className="w-4 h-4" />
              Live Reporting
            </div>
          </motion.div>

          {/* Filters Bar - Fully Responsive */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            {/* Desktop: Row | Mobile: Column */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Header inside Filters */}
              <div className="flex items-center gap-2 pb-2 md:pb-0 md:pr-4 md:border-r border-slate-200">
                <Filter className="w-5 h-5 text-indigo-500" />
                <span className="font-extrabold text-sm text-slate-700 uppercase tracking-wider">
                  Filters
                </span>
              </div>

              {/* Date Inputs & Select Container */}
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr,auto] items-center gap-3">
                {/* Start Date */}
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 w-4 h-4 text-slate-400 z-10" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
                  />
                </div>

                <span className="text-slate-400 font-bold text-sm text-center">
                  to
                </span>

                {/* End Date */}
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 w-4 h-4 text-slate-400 z-10" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
                  />
                </div>

                {/* Group By Select */}
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="day">Daily View</option>
                  <option value="month">Monthly View</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Summary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: "Total Revenue",
                value: formatCurrency(totalRevenue),
                icon: TrendingUp,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
                border: "border-indigo-100",
              },
              {
                label: "Total Orders",
                value: totalOrders,
                icon: Package,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                border: "border-emerald-100",
              },
              {
                label: "GST Collected",
                value: formatCurrency(totalGST),
                icon: Zap,
                color: "text-purple-600",
                bg: "bg-purple-50",
                border: "border-purple-100",
              },
            ].map((s, idx) => (
              <motion.div
                key={s.label}
                variants={itemVariants}
                className="relative group bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-6 transition-all duration-300 hover:bg-white hover:scale-[1.02] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-default overflow-hidden"
              >
                <div className="relative z-10 flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center border ${s.border}`}
                  >
                    <s.icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    {s.label}
                  </p>
                  <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {s.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Bar Chart */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900">
                    Revenue Trend
                  </h3>
                  <p className="text-sm font-medium text-slate-500">
                    Performance over selected period
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-[280px]">
                  <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="barGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#6366f1"
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.8}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="#f1f5f9"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 12,
                          fill: "#64748b",
                          fontWeight: 600,
                        }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis
                        tick={{
                          fontSize: 12,
                          fill: "#64748b",
                          fontWeight: 600,
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                        dx={-2}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          backgroundColor: "rgba(255,255,255,1)",
                          color: "#0f172a",
                          boxShadow:
                            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                          padding: "12px 20px",
                        }}
                        itemStyle={{
                          color: "#4f46e5",
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
                        fill="url(#barGrad)"
                        radius={[8, 8, 8, 8]}
                        barSize={32}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>

            {/* Payment Methods Pie Chart */}
            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                  <PieIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-extrabold text-xl text-slate-900">
                  Payment Modes
                </h3>
              </div>

              {paymentData.length > 0 && !loading ? (
                <div className="flex-1 flex flex-col">
                  <div className="relative h-[200px] w-full flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {paymentData.map((_: any, i: number) => (
                            <Cell
                              key={`cell-${i}`}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                              style={{
                                filter:
                                  "drop-shadow(0px 4px 6px rgba(0,0,0,0.1))",
                              }}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            fontWeight: 700,
                          }}
                          formatter={(v: any) => formatCurrency(v)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Styled Legend */}
                  <div className="mt-auto pt-6 space-y-3">
                    {paymentData.map((p: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{
                              background: PIE_COLORS[i % PIE_COLORS.length],
                            }}
                          />
                          <span className="font-extrabold text-sm text-slate-700">
                            {p.name}
                          </span>
                        </div>
                        <span className="font-extrabold text-sm text-slate-900">
                          {formatCurrency(p.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <PieIcon className="w-12 h-12 mb-3 opacity-20" />
                  <p className="font-bold">No payment data found</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Detailed Data Table */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-2 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="px-4 py-4 md:px-2 md:py-2 mb-2">
              <h3 className="font-extrabold text-lg text-slate-900">
                Detailed Report
              </h3>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-right">
                      Orders
                    </th>
                    <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-right">
                      Revenue
                    </th>
                    <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-right">
                      GST
                    </th>
                    <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider text-right">
                      Discount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                      </td>
                    </tr>
                  ) : data?.salesData?.length > 0 ? (
                    data.salesData.map((d: any, i: number) => (
                      <tr
                        key={i}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-extrabold text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
                            {groupBy === "month"
                              ? MONTHS[d._id.month - 1]
                              : `${d._id.day} ${MONTHS[(d._id.month || 1) - 1]} ${d._id.year}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-700 text-sm">
                          {d.orders}
                        </td>
                        <td className="px-6 py-4 text-right font-extrabold text-slate-900 text-sm">
                          {formatCurrency(d.revenue)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-500 text-sm">
                          {formatCurrency(d.gst || 0)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-500 text-sm">
                          {formatCurrency(d.discount || 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-16 text-slate-500 font-bold"
                      >
                        No sales data found for the selected period.
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
