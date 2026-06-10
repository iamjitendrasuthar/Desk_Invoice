const Invoice = require("../models/Invoice");
const { scopeToTenant } = require("../utils/tenantQuery");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const generateInvoiceNumber = require("../utils/generateInvoiceNumber");
const {
  notifyPaymentReceived,
  notifyLowStock,
} = require("../services/notificationService");

const LOW_STOCK_THRESHOLD = 10; // Yahan apna threshold change kar sakte ho

// Helper: calculate invoice totals
const calculateTotals = (items) => {
  let subTotal = 0,
    totalDiscount = 0,
    totalTax = 0;

  const processedItems = items.map((item) => {
    const lineTotal = item.price * item.quantity;
    const discount = item.discount || 0;
    const taxable = lineTotal - discount;
    const taxAmount = parseFloat(
      ((taxable * (item.taxRate || 0)) / 100).toFixed(2),
    );
    const total = taxable + taxAmount;

    subTotal += lineTotal;
    totalDiscount += discount;
    totalTax += taxAmount;

    return {
      ...item,
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  });

  const grandTotal = parseFloat(
    (subTotal - totalDiscount + totalTax).toFixed(2),
  );
  return {
    processedItems,
    subTotal: parseFloat(subTotal.toFixed(2)),
    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
    totalTax: parseFloat(totalTax.toFixed(2)),
    grandTotal,
  };
};

// @desc   Get all invoices
// @route  GET /api/invoices
const getInvoices = async (req, res) => {
  try {
    const {
      search,
      type,
      paymentStatus,
      startDate,
      endDate,
      customer,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = scopeToTenant(req, { isActive: true });
    if (type) filter.type = type;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (customer) filter.customer = customer;
    if (search) filter.invoiceNumber = { $regex: search, $options: "i" };
    if (startDate || endDate) {
      filter.invoiceDate = {};
      if (startDate) filter.invoiceDate.$gte = new Date(startDate);
      if (endDate) filter.invoiceDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .populate("customer", "name email phone")
      .populate("supplier", "name email phone")
      .populate("items.product", "name sku")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, count: invoices.length, total, data: invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get single invoice
// @route  GET /api/invoices/:id
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customer")
      .populate("supplier")
      .populate("items.product");
    if (!invoice)
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Update invoice
// @route  PUT /api/invoices/:id
const updateInvoice = async (req, res) => {
  try {
    const {
      items,
      amountPaid,
      paymentMethod,
      notes,
      dueDate,
      termsAndConditions,
    } = req.body;

    const invoice = await Invoice.findOne(
      scopeToTenant(req, { _id: req.params.id }),
    );
    if (!invoice)
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });

    if (items && items.length > 0) {
      const { processedItems, subTotal, totalDiscount, totalTax, grandTotal } =
        calculateTotals(items);
      invoice.items = processedItems;
      invoice.subTotal = subTotal;
      invoice.totalDiscount = totalDiscount;
      invoice.totalTax = totalTax;
      invoice.grandTotal = grandTotal;
    }

    if (amountPaid !== undefined) invoice.amountPaid = amountPaid;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    if (notes !== undefined) invoice.notes = notes;
    if (dueDate) invoice.dueDate = dueDate;
    if (termsAndConditions !== undefined)
      invoice.termsAndConditions = termsAndConditions;

    await invoice.save();
    res.json({ success: true, message: "Invoice updated", data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Delete invoice (soft)
// @route  DELETE /api/invoices/:id
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      scopeToTenant(req, { _id: req.params.id }),
      { isActive: false },
      { new: true },
    );
    if (!invoice)
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    res.json({ success: true, message: "Invoice deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Record payment on invoice
// @route  POST /api/invoices/:id/payment
const recordPayment = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice)
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });

    const prevBalance = invoice.balanceDue;
    invoice.amountPaid += parseFloat(amount);
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    await invoice.save();

    // 🔔 Payment notification — har payment par fire karo
    notifyPaymentReceived(invoice, parseFloat(amount));

    // Update customer outstanding balance
    if (invoice.customer) {
      const paid = Math.min(parseFloat(amount), prevBalance);
      await Customer.findByIdAndUpdate(invoice.customer, {
        $inc: { outstandingBalance: -paid },
      });
    }

    res.json({ success: true, message: "Payment recorded", data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE INVOICE
const createInvoice = async (req, res) => {
  try {
    const {
      customer,
      customerName,
      customerPhone,
      supplier,
      items,
      amountPaid = 0,
      paymentMethod,
      invoiceDate,
      dueDate,
      notes,
      termsAndConditions,
      type = "sale",
    } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one item is required" });
    }

    const invoiceNumber = await generateInvoiceNumber();
    const { processedItems, subTotal, totalDiscount, totalTax, grandTotal } =
      calculateTotals(items);

    const invoice = await Invoice.create({
      invoiceNumber,
      type,
      tenantId: req.tenantId,
      customer,
      customerName,
      customerPhone,
      supplier,
      items: processedItems,
      subTotal,
      totalDiscount,
      totalTax,
      grandTotal,
      amountPaid,
      paymentMethod,
      invoiceDate,
      dueDate,
      notes,
      termsAndConditions,
    });

    if (type === "sale") {
      for (const item of processedItems) {
        if (item.product) {
          // Stock deduct karo aur updated product fetch karo
          const updatedProduct = await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -item.quantity } },
            { new: true }, // updated document wapas lo
          );

          // 🔔 Low stock check — agar stock threshold ke andar aa gaya
          if (updatedProduct && updatedProduct.stock <= LOW_STOCK_THRESHOLD) {
            notifyLowStock(updatedProduct, LOW_STOCK_THRESHOLD);
          }
        }
      }
    }

    if (customer && invoice.balanceDue > 0) {
      await Customer.findByIdAndUpdate(customer, {
        $inc: { outstandingBalance: invoice.balanceDue },
      });
    }

    // 🔔 Agar invoice create karte waqt hi full payment ho gayi (amountPaid >= grandTotal)
    if (parseFloat(amountPaid) >= grandTotal && grandTotal > 0) {
      notifyPaymentReceived(invoice, parseFloat(amountPaid));
    }

    res
      .status(201)
      .json({ success: true, message: "Invoice created", data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PDF GENERATOR
const downloadInvoicePDF = async (req, res) => {
  try {
    const PDFDocument = require("pdfkit");
    const Settings = require("../models/Settings");

    const invoice = await Invoice.findById(req.params.id)
      .populate("customer")
      .populate("items.product");

    if (!invoice)
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });

    const settings = (await Settings.findOne()) || {};
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${invoice.invoiceNumber}.pdf`,
    );
    doc.pipe(res);

    doc
      .fontSize(20)
      .text(settings.businessName || "JS Interiors", { align: "left" });
    doc
      .fontSize(10)
      .text(settings.businessAddress?.street || "", { align: "left" });
    doc.moveDown();

    doc.fontSize(16).text("INVOICE", { align: "right" });
    doc
      .fontSize(10)
      .text(`Invoice #: ${invoice.invoiceNumber}`, { align: "right" });
    doc.text(
      `Date: ${new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}`,
      { align: "right" },
    );

    doc.moveDown();
    doc.fontSize(12).text("Bill To:");

    if (invoice.customer) {
      doc.fontSize(10).text(invoice.customer.name);
      if (invoice.customer.phone) doc.text(invoice.customer.phone);
    } else {
      doc.fontSize(10).text(invoice.customerName || "Walk-in Customer");
      if (invoice.customerPhone) doc.text(invoice.customerPhone);
    }

    doc.moveDown();

    const tableTop = doc.y;
    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("#", 50, tableTop);
    doc.text("Item", 70, tableTop);
    doc.text("Qty", 280, tableTop);
    doc.text("Price", 330, tableTop);
    doc.text("Tax%", 390, tableTop);
    doc.text("Total", 450, tableTop);
    doc
      .moveTo(50, doc.y + 2)
      .lineTo(560, doc.y + 2)
      .stroke();

    doc.font("Helvetica").fontSize(9);
    invoice.items.forEach((item, i) => {
      const y = doc.y + 5;
      doc.text(i + 1, 50, y);
      doc.text(item.name, 70, y, { width: 200 });
      doc.text(item.quantity, 280, y);
      doc.text(`Rs. ${item.price}`, 330, y);
      doc.text(`${item.taxRate || 0}%`, 390, y);
      doc.text(`Rs. ${item.total}`, 450, y);
      doc.moveDown(0.5);
    });

    doc
      .moveTo(50, doc.y + 2)
      .lineTo(560, doc.y + 2)
      .stroke();
    doc.moveDown();

    doc.font("Helvetica").fontSize(10);
    doc.text(`Subtotal: Rs. ${invoice.subTotal}`, { align: "right" });
    if (invoice.totalTax > 0)
      doc.text(`Tax: Rs. ${invoice.totalTax}`, { align: "right" });
    doc
      .font("Helvetica-Bold")
      .text(`Grand Total: Rs. ${invoice.grandTotal}`, { align: "right" });

    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  recordPayment,
  downloadInvoicePDF,
};
