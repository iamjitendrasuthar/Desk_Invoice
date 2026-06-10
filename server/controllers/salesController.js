const Invoice = require("../models/Invoice");
const { scopeToTenant } = require("../utils/tenantQuery");
const mongoose = require("mongoose");

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    const baseFilter = scopeToTenant(req, { isActive: true, type: "sale" });

    // aggregate ke liye tenantId ObjectId mein convert karo
    if (baseFilter.tenantId) {
      baseFilter.tenantId = new mongoose.Types.ObjectId(baseFilter.tenantId);
    }

    const matchStage = { ...baseFilter };

    if (startDate || endDate) {
      matchStage.invoiceDate = {};
      if (startDate) matchStage.invoiceDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.invoiceDate.$lte = end;
      }
    }

    let groupId = {
      year: { $year: "$invoiceDate" },
      month: { $month: "$invoiceDate" },
    };

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
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const paymentMethods = await Invoice.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

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
