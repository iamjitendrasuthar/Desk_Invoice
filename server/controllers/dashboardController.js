const Invoice = require("../models/Invoice");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");
const { scopeToTenant } = require("../utils/tenantQuery");
const mongoose = require("mongoose");

const tenantMatch = (req, extra = {}) => {
  const filter = scopeToTenant(req, extra);
  if (filter.tenantId) {
    filter.tenantId = new mongoose.Types.ObjectId(filter.tenantId);
  }
  return filter;
};

const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

    const saleBase = tenantMatch(req, { type: "sale", isActive: true });
    const tenantFilter = scopeToTenant(req, { isActive: true });

    // 1. Today's sales
    const todaySalesAgg = await Invoice.aggregate([
      { $match: { ...saleBase, invoiceDate: { $gte: startOfToday } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
    ]);

    // 2. Monthly sales
    const monthlySalesAgg = await Invoice.aggregate([
      { $match: { ...saleBase, invoiceDate: { $gte: startOfMonth } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
    ]);

    // 3. Yearly sales
    const yearlySalesAgg = await Invoice.aggregate([
      { $match: { ...saleBase, invoiceDate: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]);

    // 4. Last month sales (for trend comparison)
    const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const lastMonthSalesAgg = await Invoice.aggregate([
      {
        $match: {
          ...saleBase,
          invoiceDate: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
    ]);

    // 5. Counts
    const [totalCustomers, totalProducts, totalSuppliers, lowStockCount] =
      await Promise.all([
        Customer.countDocuments(tenantFilter),
        Product.countDocuments(tenantFilter),
        Supplier.countDocuments(tenantFilter),
        Product.countDocuments({
          ...tenantFilter,
          $expr: { $lte: ["$stock", "$lowStockAlert"] },
        }),
      ]);

    // 6. Monthly revenue chart (last 6 months)
    const rawMonthlyChart = await Invoice.aggregate([
      { $match: { ...saleBase, invoiceDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$invoiceDate" },
            month: { $month: "$invoiceDate" },
          },
          total: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthlyRevenue = rawMonthlyChart.map((m) => ({
      _id: { month: m._id.month },
      revenue: m.total,
      orders: m.count,
    }));

    // 7. Category breakdown (dynamic)
    const rawCategories = await Product.aggregate([
      { $match: tenantMatch(req, { isActive: true }) },
      { $group: { _id: "$category", value: { $sum: 1 } } },
      { $match: { _id: { $ne: null } } },
      { $sort: { value: -1 } },
      { $limit: 6 },
    ]);

    const totalCatProducts = rawCategories.reduce((sum, c) => sum + c.value, 0);
    const categoryBreakdown = rawCategories.map((c) => ({
      name: c._id,
      value:
        totalCatProducts > 0
          ? Math.round((c.value / totalCatProducts) * 100)
          : 0,
      count: c.value,
    }));

    // 8. Payment methods breakdown
    const paymentMethodsAgg = await Invoice.aggregate([
      { $match: saleBase },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // 9. Top selling products
    const topProducts = await Invoice.aggregate([
      { $match: saleBase },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQty: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);

    const topSellingProducts = topProducts.map((p) => ({
      name: p._id,
      totalSold: p.totalQty,
      revenue: p.totalRevenue,
    }));

    // 10. Peak sales hours
    const bestSalesHours = await Invoice.aggregate([
      { $match: saleBase },
      { $group: { _id: { $hour: "$invoiceDate" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]);

    // 11. Low stock products list
    const lowStockProducts = await Product.find({
      ...tenantFilter,
      $expr: { $lte: ["$stock", "$lowStockAlert"] },
    })
      .select("name stock lowStockAlert")
      .limit(10);

    // 12. Recent invoices
    const rawInvoices = await Invoice.find(
      scopeToTenant(req, { isActive: true }),
    )
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "invoiceNumber grandTotal paymentStatus invoiceDate customer customerName type",
      );

    const recentInvoices = rawInvoices.map((inv) => ({
      _id: inv._id,
      invoiceNumber: inv.invoiceNumber,
      grandTotal: inv.grandTotal,
      paymentStatus: inv.paymentStatus,
      invoiceDate: inv.invoiceDate,
      customerName: inv.customer
        ? inv.customer.name
        : inv.customerName || "Walk-in",
    }));

    // 13. Outstanding balance total
    const outstandingAgg = await Invoice.aggregate([
      {
        $match: tenantMatch(req, {
          isActive: true,
          paymentStatus: { $in: ["pending", "partial"] },
        }),
      },
      { $group: { _id: null, total: { $sum: "$balanceDue" } } },
    ]);

    // Trend calculations
    const currentMonthTotal = monthlySalesAgg[0]?.total || 0;
    const lastMonthTotal = lastMonthSalesAgg[0]?.total || 0;
    const monthlyTrend =
      lastMonthTotal > 0
        ? (
            ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) *
            100
          ).toFixed(1)
        : 0;

    res.json({
      success: true,
      data: {
        summary: {
          todaySales: todaySalesAgg[0]?.total || 0,
          monthlySales: currentMonthTotal,
          yearlySales: yearlySalesAgg[0]?.total || 0,
          totalCustomers,
          totalProducts,
          totalSuppliers,
          outstandingBalance: outstandingAgg[0]?.total || 0,
        },
        stats: {
          todayOrders: todaySalesAgg[0]?.count || 0,
          monthlyOrders: monthlySalesAgg[0]?.count || 0,
          monthlyTrend: parseFloat(monthlyTrend),
        },
        monthlyRevenue,
        categoryBreakdown,
        paymentMethods: paymentMethodsAgg,
        aiInsights: {
          topSellingProducts,
          bestSalesHours,
          lowStockCount,
        },
        lowStockProducts,
        recentInvoices,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    const match = tenantMatch(req, { type: "sale", isActive: true });
    if (startDate) match.invoiceDate = { $gte: new Date(startDate) };
    if (endDate)
      match.invoiceDate = { ...match.invoiceDate, $lte: new Date(endDate) };

    let groupId;
    if (groupBy === "month")
      groupId = {
        year: { $year: "$invoiceDate" },
        month: { $month: "$invoiceDate" },
      };
    else if (groupBy === "year") groupId = { year: { $year: "$invoiceDate" } };
    else
      groupId = {
        year: { $year: "$invoiceDate" },
        month: { $month: "$invoiceDate" },
        day: { $dayOfMonth: "$invoiceDate" },
      };

    const report = await Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupId,
          totalSales: { $sum: "$grandTotal" },
          totalPaid: { $sum: "$amountPaid" },
          totalBalance: { $sum: "$balanceDue" },
          invoiceCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard, getSalesReport };
