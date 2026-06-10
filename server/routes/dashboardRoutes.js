const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getSalesReport,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const tenantContext = require("../middleware/tenantContext");

router.use(protect, tenantContext);

router.get("/", getDashboard);
router.get("/report", getSalesReport);

module.exports = router;
