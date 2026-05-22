const express = require("express");
const router = express.Router();
const { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, recordPayment, downloadInvoicePDF } = require("../controllers/invoiceController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, getInvoices)
  .post(protect, createInvoice);

router.route("/:id")
  .get(protect, getInvoice)
  .put(protect, updateInvoice)
  .delete(protect, deleteInvoice);

router.post("/:id/payment", protect, recordPayment);
router.get("/:id/pdf", protect, downloadInvoicePDF);

module.exports = router;
