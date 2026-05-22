const express = require("express");
const router = express.Router();
const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require("../controllers/customerController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, getCustomers)
  .post(protect, createCustomer);

router.route("/:id")
  .get(protect, getCustomer)
  .put(protect, updateCustomer)
  .delete(protect, deleteCustomer);

module.exports = router;
