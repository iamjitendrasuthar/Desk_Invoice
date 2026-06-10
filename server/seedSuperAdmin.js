/**
 * Run once: node scripts/seedSuperAdmin.js
 *
 * .env mein yeh variables set karo:
 *   SUPERADMIN_EMAIL=your@email.com
 *   SUPERADMIN_PASSWORD=strongpassword123
 *   MONGODB_URI=mongodb://localhost:27017/deskinvoice
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const seed = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI,
    );
    console.log("MongoDB connected");

    const existing = await User.findOne({ role: "superadmin" });
    if (existing) {
      console.log("SuperAdmin already exists:", existing.email);
      process.exit(0);
    }

    const superAdmin = await User.create({
      name: "Super Admin",
      email: process.env.SUPERADMIN_EMAIL || "superadmin@deskinvoice.com",
      password: process.env.SUPERADMIN_PASSWORD || "superadmin123",
      role: "superadmin",
      tenantId: null,
    });

    console.log("SuperAdmin created successfully!");
    console.log("Email:", superAdmin.email);
    console.log(
      "Password:",
      process.env.SUPERADMIN_PASSWORD || "superadmin123",
    );
    console.log("\nAb apne existing tenant ke liye admin banao:");
    console.log(
      "POST /api/superadmin/tenants with { businessName, adminName, adminEmail, adminPassword }",
    );

    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
