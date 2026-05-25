const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: "" },
    businessEmail: { type: String, default: "" },
    businessPhone: { type: String, default: "" },
    businessAddress: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    gstin: { type: String, default: "" },
    panNumber: { type: String, default: "" },
    logo: { type: String, default: "" },
    currency: { type: String, default: "" },
    currencySymbol: { type: String, default: "" },
    invoicePrefix: { type: String, default: "" },
    invoiceCounter: { type: Number, default: 1 }, // keep counter as 1, it's functional not display
    defaultTaxRate: { type: Number, default: null },
    termsAndConditions: { type: String, default: "" },
    bankDetails: {
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      accountHolderName: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Settings", settingsSchema);
