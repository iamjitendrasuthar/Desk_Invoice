const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["customer_added", "payment_received", "low_stock"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    // Optional references for deep-linking
    refId: { type: mongoose.Schema.Types.ObjectId, default: null },
    refModel: { type: String, default: null }, // "Customer", "Invoice", "Product"
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }, // extra data (e.g. amount, stock qty)
  },
  { timestamps: true },
);

// Index for fast unread queries
notificationSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
