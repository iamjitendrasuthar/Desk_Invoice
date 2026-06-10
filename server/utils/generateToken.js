const jwt = require("jsonwebtoken");

const generateToken = (id, tenantId, role) => {
  return jwt.sign(
    { id, tenantId, role },
    process.env.JWT_SECRET || "deskinvoice_secret_change_in_prod",
    { expiresIn: process.env.JWT_EXPIRE || "7d" },
  );
};

module.exports = generateToken;
