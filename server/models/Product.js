const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, unique: true, sparse: true, trim: true },
    barcode: { type: String, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true },
    unit: { type: String, default: "pcs", trim: true },
    purchasePrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, required: true },
    gstRate: { type: Number, default: 0 }, // frontend gstRate use karta hai
    taxRate: { type: Number, default: 0 }, // backward compat
    stock: { type: Number, default: 0 },
    lowStockAlert: { type: Number, default: 10 },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual: isLowStock — frontend use karta hai
productSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.lowStockAlert;
});

module.exports = mongoose.model("Product", productSchema);
