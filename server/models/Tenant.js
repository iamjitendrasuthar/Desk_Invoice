const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    plan: { type: String, enum: ["trial", "basic", "pro"], default: "trial" },
    isActive: { type: Boolean, default: true },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    maxUsers: { type: Number, default: 3 },
  },
  { timestamps: true },
);

tenantSchema.pre("validate", function (next) {
  if (this.isNew && !this.slug) {
    this.slug = this.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

module.exports = mongoose.model("Tenant", tenantSchema);
