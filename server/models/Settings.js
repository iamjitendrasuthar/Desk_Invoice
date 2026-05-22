const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: "My Business" },
    businessEmail: { type: String, default: "" },
    businessPhone: { type: String, default: "" },
    businessAddress: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      country: { type: String, default: "India" },
    },
    gstin: { type: String, default: "" },
    panNumber: { type: String, default: "" },
    logo: { type: String, default: "" },
    currency: { type: String, default: "INR" },
    currencySymbol: { type: String, default: "₹" },
    invoicePrefix: { type: String, default: "INV" },
    invoiceCounter: { type: Number, default: 1 },
    defaultTaxRate: { type: Number, default: 18 },
    termsAndConditions: { type: String, default: "" },
    bankDetails: {
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      accountHolderName: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
