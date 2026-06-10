const express = require("express");
const router = express.Router();
const {
  createTenant,
  getAllTenants,
  updateTenant,
  deleteTenant,
  getStats,
} = require("../controllers/superAdminController");
const { protect, requireRole } = require("../middleware/authMiddleware");

// Sab routes superadmin-only hain
router.use(protect, requireRole("superadmin"));

router.get("/stats", getStats);
router.get("/tenants", getAllTenants);
router.post("/tenants", createTenant);
router.put("/tenants/:id", updateTenant);
router.delete("/tenants/:id", deleteTenant);

module.exports = router;
