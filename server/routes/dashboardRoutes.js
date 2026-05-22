const express = require("express");
const router = express.Router();
const { getDashboard, getSalesReport } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getDashboard);
router.get("/report", protect, getSalesReport);

module.exports = router;
