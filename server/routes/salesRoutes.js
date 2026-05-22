// E:\billing-software\server\routes\salesRoutes.js

const express = require("express");
const router = express.Router();
const { getSalesReport } = require("../controllers/salesController");

// GET /api/sales/report
router.get("/report", getSalesReport);

module.exports = router;
