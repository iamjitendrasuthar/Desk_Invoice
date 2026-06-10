const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: { type: String, required: true },
  sku: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: "pcs" },
  price: { type: Number, required: true }, // selling price per unit
  taxRate: { type: Number, default: 0 }, // GST %
  taxAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 }, // absolute discount amount per line
  total: { type: Number, required: true }, // (price * qty) - discount + taxAmount
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["sale", "purchase", "credit_note", "debit_note"],
      default: "sale",
    },

    // Core Relations
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String }, // NEW: Added to support walk-in customers
    customerPhone: { type: String }, // NEW: Added to support walk-in customers
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },

    items: [invoiceItemSchema],

    // Calculations
    subTotal: { type: Number, default: 0 }, // before tax & discount
    totalDiscount: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "bank_transfer", "cheque", "card", "credit"],
      default: "cash",
    },

    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    notes: { type: String },
    termsAndConditions: { type: String },
    isActive: { type: Boolean, default: true },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

invoiceSchema.pre("save", function (next) {
  this.balanceDue = this.grandTotal - this.amountPaid;
  if (this.amountPaid <= 0) this.paymentStatus = "unpaid";
  else if (this.amountPaid >= this.grandTotal) this.paymentStatus = "paid";
  else this.paymentStatus = "partial";
  next();
});

module.exports = mongoose.model("Invoice", invoiceSchema);
