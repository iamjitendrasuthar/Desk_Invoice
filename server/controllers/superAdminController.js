const Tenant = require("../models/Tenant");
const User = require("../models/User");
const Settings = require("../models/Settings");
const generateToken = require("../utils/generateToken");

// ─── Create tenant + first admin ──────────────────────────────────────────────
// @route  POST /api/superadmin/tenants
const createTenant = async (req, res) => {
  try {
    const {
      businessName,
      adminName,
      adminEmail,
      adminPassword,
      plan = "trial",
      maxUsers = 3,
    } = req.body;

    if (!businessName || !adminName || !adminEmail || !adminPassword) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "businessName, adminName, adminEmail, adminPassword required",
        });
    }

    // Check email already exists
    const emailExists = await User.findOne({ email: adminEmail });
    if (emailExists) {
      return res
        .status(400)
        .json({ success: false, message: "Admin email already registered" });
    }

    // 1. Tenant create karo
    const tenant = await Tenant.create({ businessName, plan, maxUsers });

    // 2. Tenant ka pehla admin user create karo
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "tenant_admin",
      tenantId: tenant._id,
    });

    // 3. Default settings bhi create karo (blank slate)
    await Settings.create({
      tenantId: tenant._id,
      businessName,
      currency: "INR",
      currencySymbol: "₹",
      invoicePrefix: "INV",
    });

    res.status(201).json({
      success: true,
      message: "Tenant and admin created",
      data: {
        tenant: {
          _id: tenant._id,
          businessName: tenant.businessName,
          slug: tenant.slug,
          plan: tenant.plan,
        },
        admin: {
          _id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get all tenants ───────────────────────────────────────────────────────────
// @route  GET /api/superadmin/tenants
const getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });

    // Har tenant ke user count bhi attach karo
    const tenantsWithStats = await Promise.all(
      tenants.map(async (t) => {
        const userCount = await User.countDocuments({ tenantId: t._id });
        return { ...t.toObject(), userCount };
      }),
    );

    res.json({ success: true, count: tenants.length, data: tenantsWithStats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update tenant (plan, status, maxUsers) ───────────────────────────────────
// @route  PUT /api/superadmin/tenants/:id
const updateTenant = async (req, res) => {
  try {
    const { plan, isActive, maxUsers, businessName } = req.body;
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant)
      return res
        .status(404)
        .json({ success: false, message: "Tenant not found" });

    if (plan) tenant.plan = plan;
    if (typeof isActive === "boolean") tenant.isActive = isActive;
    if (maxUsers) tenant.maxUsers = maxUsers;
    if (businessName) tenant.businessName = businessName;

    await tenant.save();
    res.json({ success: true, message: "Tenant updated", data: tenant });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Delete tenant (and all its users/settings) ───────────────────────────────
// @route  DELETE /api/superadmin/tenants/:id
const deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant)
      return res
        .status(404)
        .json({ success: false, message: "Tenant not found" });

    // Cascade delete
    await User.deleteMany({ tenantId: tenant._id });
    await Settings.deleteMany({ tenantId: tenant._id });
    await Tenant.findByIdAndDelete(tenant._id);

    res.json({
      success: true,
      message: "Tenant and all associated data deleted",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Platform stats ───────────────────────────────────────────────────────────
// @route  GET /api/superadmin/stats
const getStats = async (req, res) => {
  try {
    const [totalTenants, activeTenants, totalUsers] = await Promise.all([
      Tenant.countDocuments(),
      Tenant.countDocuments({ isActive: true }),
      User.countDocuments({ role: { $ne: "superadmin" } }),
    ]);

    const byPlan = await Tenant.aggregate([
      { $group: { _id: "$plan", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: { totalTenants, activeTenants, totalUsers, byPlan },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createTenant,
  getAllTenants,
  updateTenant,
  deleteTenant,
  getStats,
};
