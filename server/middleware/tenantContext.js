const Tenant = require("../models/Tenant");

const tenantContext = async (req, res, next) => {
  if (req.role === "superadmin") {
    req.tenantId = null;
    return next();
  }

  if (!req.tenantId) {
    return res
      .status(403)
      .json({ success: false, message: "Tenant not assigned" });
  }

  next();
};

module.exports = tenantContext;
