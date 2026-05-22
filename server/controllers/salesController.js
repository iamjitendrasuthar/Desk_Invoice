// E:\billing-software\server\controllers\salesController.js

const Invoice = require("../models/Invoice");

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    // 1. Match Stage - Sirf active 'sale' invoices ko filter karein
    const matchStage = {
      isActive: true,
      type: "sale",
    };

    // Date Filtering apply karein
    if (startDate || endDate) {
      matchStage.invoiceDate = {};
      if (startDate) matchStage.invoiceDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of the day
        matchStage.invoiceDate.$lte = end;
      }
    }

    // 2. Group Stage - Bar Chart & Table ke liye (Day ya Month wise)
    let groupId = {
      year: { $year: "$invoiceDate" },
      month: { $month: "$invoiceDate" },
    };

    // Agar day wise filter hai toh 'day' ko group mein add karein
    if (groupBy === "day") {
      groupId.day = { $dayOfMonth: "$invoiceDate" };
    }

    const salesData = await Invoice.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupId,
          revenue: { $sum: "$grandTotal" },
          gst: { $sum: "$totalTax" },
          discount: { $sum: "$totalDiscount" },
          orders: { $sum: 1 }, // Count total invoices
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // 3. Payment Methods Group Stage - Pie Chart ke liye
    const paymentMethods = await Invoice.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$paymentMethod", // cash, upi, card, etc.
          total: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Frontend ke hisaab se response bhejein
    res.json({
      success: true,
      data: {
        salesData,
        paymentMethods,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSalesReport };
