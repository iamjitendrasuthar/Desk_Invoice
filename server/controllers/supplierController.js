const Supplier = require("../models/Supplier");

// @desc   Get all suppliers
// @route  GET /api/suppliers
const getSuppliers = async (req, res) => {
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
    const total = await Supplier.countDocuments(filter);
    const suppliers = await Supplier.find(filter).skip(skip).limit(parseInt(limit)).sort({ name: 1 });

    res.json({ success: true, count: suppliers.length, total, data: suppliers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get single supplier
// @route  GET /api/suppliers/:id
const getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });
    res.json({ success: true, data: supplier });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Create supplier
// @route  POST /api/suppliers
const createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address, gstin, panNumber, bankDetails, notes } = req.body;

    if (!name) return res.status(400).json({ success: false, message: "Supplier name is required" });

    const supplier = await Supplier.create({ name, email, phone, address, gstin, panNumber, bankDetails, notes });
    res.status(201).json({ success: true, message: "Supplier created", data: supplier });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Update supplier
// @route  PUT /api/suppliers/:id
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });
    res.json({ success: true, message: "Supplier updated", data: supplier });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Delete (soft) supplier
// @route  DELETE /api/suppliers/:id
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });
    res.json({ success: true, message: "Supplier deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier };
