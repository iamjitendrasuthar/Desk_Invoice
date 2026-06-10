const express = require("express");
const router = express.Router();
const { getSalesReport } = require("../controllers/salesController");
const { protect } = require("../middleware/authMiddleware");
const tenantContext = require("../middleware/tenantContext");

router.use(protect, tenantContext);

router.get("/report", getSalesReport);

module.exports = router;
