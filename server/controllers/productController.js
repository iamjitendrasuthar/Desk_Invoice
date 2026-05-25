const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const { search, category, isActive, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
      ];
    }
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    else filter.isActive = true; // default: only active

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      data: products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      barcode,
      description,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      gstRate,
      taxRate,
      stock,
      lowStockAlert,
    } = req.body;

    if (!name || sellingPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name and selling price are required",
      });
    }

    if (sku) {
      const exists = await Product.findOne({ sku });
      if (exists)
        return res
          .status(400)
          .json({ success: false, message: "SKU already exists" });
    }

    const rate = gstRate ?? taxRate ?? 0; // accept both field names
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const product = await Product.create({
      name,
      sku,
      barcode,
      description,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      gstRate: rate,
      taxRate: rate,
      stock,
      lowStockAlert,
      image,
    });

    res
      .status(201)
      .json({ success: true, message: "Product created", data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.image = `/uploads/${req.file.filename}`;

    // Keep both gstRate and taxRate in sync
    if (updates.gstRate !== undefined) updates.taxRate = updates.gstRate;
    if (updates.taxRate !== undefined) updates.gstRate = updates.taxRate;

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product updated", data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deactivated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ["$stock", "$lowStockAlert"] },
      isActive: true,
    });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { isActive: true });
    res.json({ success: true, data: categories.filter(Boolean) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getCategories,
};
