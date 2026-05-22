const Customer = require("../models/Customer");

// @desc   Get all customers (with order count and total spent)
// @route  GET /api/customers
const getCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    const filter = { isActive: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Customer.countDocuments(filter);

    // FIX: Using aggregation to fetch order details from the 'invoices' collection
    const customers = await Customer.aggregate([
      { $match: filter },

      // Link with Invoices collection
      {
        $lookup: {
          from: "invoices", // Database mein collection ka naam
          localField: "_id",
          foreignField: "customer",
          pipeline: [{ $match: { type: "sale", isActive: true } }],
          as: "customerOrders",
        },
      },

      // Calculate total orders & purchases
      {
        $addFields: {
          totalOrders: { $size: "$customerOrders" },
          totalPurchases: { $sum: "$customerOrders.grandTotal" },
        },
      },

      // Remove the heavy array to keep API fast
      {
        $project: {
          customerOrders: 0,
        },
      },

      // Sorting & Pagination (Aapka purana logic)
      { $sort: { name: 1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    res.json({
      success: true,
      count: customers.length,
      total,
      data: customers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get single customer
// @route  GET /api/customers/:id
const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Create customer
// @route  POST /api/customers
const createCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      gstin,
      panNumber,
      creditLimit,
      notes,
    } = req.body;

    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Customer name is required" });

    const customer = await Customer.create({
      name,
      email,
      phone,
      address,
      gstin,
      panNumber,
      creditLimit,
      notes,
    });
    res
      .status(201)
      .json({ success: true, message: "Customer created", data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Update customer
// @route  PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    res.json({ success: true, message: "Customer updated", data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Delete (soft) customer
// @route  DELETE /api/customers/:id
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    res.json({ success: true, message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
