const Invoice = require("../models/Invoice");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");

const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // 1. Sales Calculations
    const monthlySales = await Invoice.aggregate([
      {
        $match: {
          type: "sale",
          isActive: true,
          invoiceDate: { $gte: startOfMonth },
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

    const todayOrdersCount = await Invoice.countDocuments({
      type: "sale",
      isActive: true,
      invoiceDate: { $gte: startOfToday },
    });

    const yearlySales = await Invoice.aggregate([
      {
        $match: {
          type: "sale",
          isActive: true,
          invoiceDate: { $gte: startOfYear },
        },
      },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]);

    // 2. Collections Counts
    const [totalCustomers, totalProducts, totalSuppliers, lowStockCount] =
      await Promise.all([
        Customer.countDocuments({ isActive: true }),
        Product.countDocuments({ isActive: true }),
        Supplier.countDocuments({ isActive: true }),
        // Low stock count calculation
        Product.countDocuments({
          $expr: { $lte: ["$stock", "$lowStockAlert"] },
          isActive: true,
        }),
      ]);

    // 3. REVENUE TRENDS: Monthly sales chart (last 6 months) mapped for frontend
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    const rawMonthlyChart = await Invoice.aggregate([
      {
        $match: {
          type: "sale",
          isActive: true,
          invoiceDate: { $gte: sixMonthsAgo },
        },
      },
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

    // Mapping to match frontend `monthlyRevenue` expectation
    const monthlyRevenue = rawMonthlyChart.map((m) => ({
      _id: { month: m._id.month },
      revenue: m.total,
      orders: m.count,
    }));

    // 4. AI INSIGHTS: Top 5 selling products mapped for frontend
    const topProducts = await Invoice.aggregate([
      { $match: { type: "sale", isActive: true } },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", totalQty: { $sum: "$items.quantity" } } },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);

    const topSellingProducts = topProducts.map((p) => ({
      name: p._id,
      totalSold: p.totalQty,
    }));

    // AI INSIGHTS: Peak Sales Hours
    const bestSalesHours = await Invoice.aggregate([
      { $match: { type: "sale", isActive: true } },
      { $group: { _id: { $hour: "$invoiceDate" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]);

    // 5. LOW STOCK ALERT: Actual product list for the bottom UI
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$stock", "$lowStockAlert"] },
      isActive: true,
    })
      .select("name stock")
      .limit(10);

    // 6. Recent Invoices
    const rawInvoices = await Invoice.find({ isActive: true })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "invoiceNumber grandTotal paymentStatus invoiceDate customer customerName type",
      );

    // Mapping recent invoices so Walk-in vs Saved Customer name logic works seamlessly
    const recentInvoices = rawInvoices.map((inv) => ({
      _id: inv._id,
      invoiceNumber: inv.invoiceNumber,
      grandTotal: inv.grandTotal,
      paymentStatus: inv.paymentStatus,
      customerName: inv.customer
        ? inv.customer.name
        : inv.customerName || "Walk-in",
    }));

    // FINAL RESPONSE BUILDUP (Exactly matching Frontend State)
    res.json({
      success: true,
      data: {
        summary: {
          monthlySales: monthlySales[0]?.total || 0,
          yearlySales: yearlySales[0]?.total || 0,
          totalCustomers,
          totalProducts,
        },
        stats: {
          todayOrders: todayOrdersCount,
          monthlyOrders: monthlySales[0]?.count || 0,
        },
        monthlyRevenue: monthlyRevenue, // Linked to Area Chart
        aiInsights: {
          topSellingProducts: topSellingProducts, // Linked to Top Sellers
          bestSalesHours: bestSalesHours, // Linked to Peak Hours
          lowStockCount: lowStockCount, // Linked to Warning Box
        },
        lowStockProducts: lowStockProducts, // Linked to Low Stock Alert List
        recentInvoices: recentInvoices, // Linked to Recent Invoices List
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get sales report by date range
// @route  GET /api/dashboard/report
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    const match = { type: "sale", isActive: true };
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
