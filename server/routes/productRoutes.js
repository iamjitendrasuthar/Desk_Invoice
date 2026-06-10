const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getCategories,
} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const tenantContext = require("../middleware/tenantContext");
const upload = require("../middleware/uploadMiddleware");

router.use(protect, tenantContext);

router.get("/low-stock", getLowStockProducts);
router.get("/categories", getCategories);

router.route("/").get(getProducts).post(upload.single("image"), createProduct);

router
  .route("/:id")
  .get(getProduct)
  .put(upload.single("image"), updateProduct)
  .delete(deleteProduct);

module.exports = router;
