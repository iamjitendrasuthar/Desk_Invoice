// services/notificationService.js
// Call these helpers from any controller to fire notifications

const Notification = require("../models/Notification");

/**
 * Create a notification
 * @param {Object} opts
 * @param {"customer_added"|"payment_received"|"low_stock"} opts.type
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {ObjectId} [opts.refId]
 * @param {string}   [opts.refModel]
 * @param {Object}   [opts.meta]
 */
const createNotification = async ({
  type,
  title,
  message,
  refId = null,
  refModel = null,
  meta = {},
}) => {
  try {
    await Notification.create({ type, title, message, refId, refModel, meta });
  } catch (err) {
    // Never crash the parent operation due to notification failure
    console.error("⚠️  Notification create failed:", err.message);
  }
};

// ── Shortcuts ──────────────────────────────────────────────────────────────

/**
 * Fire when a new customer is added
 * @param {Object} customer - saved customer document
 */
const notifyCustomerAdded = (customer) =>
  createNotification({
    type: "customer_added",
    title: "New Customer Added",
    message: `${customer.name} has been added to your customer list.`,
    refId: customer._id,
    refModel: "Customer",
    meta: { email: customer.email, phone: customer.phone },
  });

/**
 * Fire when a payment is received / invoice marked paid
 * @param {Object} invoice - saved invoice document
 * @param {number} amount  - payment amount received
 */
const notifyPaymentReceived = (invoice, amount) =>
  createNotification({
    type: "payment_received",
    title: "Payment Received",
    message: `₹${Number(amount).toLocaleString("en-IN")} received for Invoice #${invoice.invoiceNumber}.`,
    refId: invoice._id,
    refModel: "Invoice",
    meta: { invoiceNumber: invoice.invoiceNumber, amount },
  });

/**
 * Fire when a product's stock falls at or below threshold
 * @param {Object} product   - product document
 * @param {number} threshold - stock level that triggered the alert
 */
const notifyLowStock = (product, threshold = 10) =>
  createNotification({
    type: "low_stock",
    title: "Low Stock Alert",
    message: `"${product.name}" is running low — only ${product.stock} unit(s) left.`,
    refId: product._id,
    refModel: "Product",
    meta: { productName: product.name, stock: product.stock, threshold },
  });

module.exports = {
  createNotification,
  notifyCustomerAdded,
  notifyPaymentReceived,
  notifyLowStock,
};
