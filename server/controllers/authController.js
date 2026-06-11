const User = require("../models/User");
const Tenant = require("../models/Tenant");
const Settings = require("../models/Settings");
const generateToken = require("../utils/generateToken");

// ─── Login ─────────────────────────────────────────────────────────────────────
// @route  POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).populate("tenantId");

    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Contact your admin.",
      });
    }

    // Tenant-level check (skip for superadmin)
    if (user.role !== "superadmin") {
      if (!user.tenantId) {
        return res.status(403).json({
          success: false,
          message: "No business account linked. Contact support.",
        });
      }
      if (!user.tenantId.isActive) {
        return res.status(403).json({
          success: false,
          message: "Your business subscription is inactive.",
        });
      }
    }

    const tenantData = user.tenantId
      ? {
          id: user.tenantId._id,
          name: user.tenantId.businessName,
          plan: user.tenantId.plan,
        }
      : null;

    res.json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant: tenantData,
        token: generateToken(user._id, user.tenantId?._id || null, user.role),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get current user ──────────────────────────────────────────────────────────
// @route  GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("tenantId", "businessName plan isActive");
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update own profile ────────────────────────────────────────────────────────
// @route  PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, password, currentPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;

    // Password change: currentPassword verify karo pehle
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to set a new password",
        });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }
      user.password = password;
    }

    await user.save();
    res.json({
      success: true,
      message: "Profile updated",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get all users of current tenant ──────────────────────────────────────────
// @route  GET /api/auth/users  (tenant_admin sees own tenant, superadmin sees all)
const getUsers = async (req, res) => {
  try {
    let query = {};

    if (req.role === "superadmin") {
      // Superadmin: sab users
      query = {};
    } else {
      // Tenant admin: sirf apne tenant ke users
      query = { tenantId: req.tenantId };
    }

    const users = await User.find(query)
      .select("-password")
      .populate("tenantId", "businessName")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Create staff user (Tenant Admin only) ────────────────────────────────────
// @route  POST /api/auth/users
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Seat limit check
    const tenant = await Tenant.findById(req.tenantId);
    const currentCount = await User.countDocuments({
      tenantId: req.tenantId,
      isActive: true,
    });
    if (currentCount >= tenant.maxUsers) {
      return res.status(403).json({
        success: false,
        message: `User limit reached (${tenant.maxUsers}). Upgrade your plan to add more users.`,
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "staff", // tenant_admin sirf staff create kar sakta hai
      tenantId: req.tenantId, // automatically apne tenant mein
    });

    res.status(201).json({
      success: true,
      message: "Staff user created",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update user (Tenant Admin only) ─────────────────────────────────────────
// @route  PUT /api/auth/users/:id
const updateUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { name, email, password, isActive } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (typeof isActive === "boolean") user.isActive = isActive;

    await user.save();
    res.json({
      success: true,
      message: "User updated",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Delete user (Tenant Admin only) ──────────────────────────────────────────
// @route  DELETE /api/auth/users/:id
const deleteUser = async (req, res) => {
  try {
    // Tenant admin apne aap ko delete nahi kar sakta
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId,
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  login,
  getMe,
  updateProfile,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
