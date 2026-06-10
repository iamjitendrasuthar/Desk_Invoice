const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Tenant = require("../models/Tenant");

// ─── Main auth guard ───────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "deskinvoice_secret_change_in_prod",
    );

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    if (!user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Account deactivated" });
    }

    // Tenant-level active check (superadmin skip)
    if (user.role !== "superadmin" && user.tenantId) {
      const tenant = await Tenant.findById(user.tenantId);
      if (!tenant || !tenant.isActive) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Your subscription is inactive. Contact support.",
          });
      }
    }

    // Inject into req — har controller mein available hoga
    req.user = user;
    req.userId = user._id;
    req.tenantId = user.tenantId; // null for superadmin
    req.role = user.role;

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Token invalid or expired" });
  }
};

// ─── Role guard (use after protect) ───────────────────────────────────────────
// Usage: requireRole("superadmin") or requireRole("tenant_admin", "superadmin")
const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }
    next();
  };

// ─── Legacy aliases (backwards-compatible) ────────────────────────────────────
const adminOnly = requireRole("superadmin", "tenant_admin");
const superAdminOnly = requireRole("superadmin");
const tenantAdminOnly = requireRole("tenant_admin");

module.exports = {
  protect,
  requireRole,
  adminOnly,
  superAdminOnly,
  tenantAdminOnly,
};
