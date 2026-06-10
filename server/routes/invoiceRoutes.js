const express = require("express");
const router = express.Router();
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  recordPayment,
  downloadInvoicePDF,
} = require("../controllers/invoiceController");
const { protect } = require("../middleware/authMiddleware");
const tenantContext = require("../middleware/tenantContext");

router.use(protect, tenantContext);

router.route("/").get(getInvoices).post(createInvoice);
router.route("/:id").get(getInvoice).put(updateInvoice).delete(deleteInvoice);
router.post("/:id/payment", recordPayment);
router.get("/:id/pdf", downloadInvoicePDF);

module.exports = router;
