const express = require("express");
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getLowStockProducts, getCategories } = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/low-stock", protect, getLowStockProducts);
router.get("/categories", protect, getCategories);

router.route("/")
  .get(protect, getProducts)
  .post(protect, upload.single("image"), createProduct);

router.route("/:id")
  .get(protect, getProduct)
  .put(protect, upload.single("image"), updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;
