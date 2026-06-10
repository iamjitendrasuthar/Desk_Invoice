const express = require("express");
const router = express.Router();
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const { protect } = require("../middleware/authMiddleware");
const tenantContext = require("../middleware/tenantContext");

router.use(protect, tenantContext);

router.route("/").get(getCustomers).post(createCustomer);

router
  .route("/:id")
  .get(getCustomer)
  .put(updateCustomer)
  .delete(deleteCustomer);

module.exports = router;
