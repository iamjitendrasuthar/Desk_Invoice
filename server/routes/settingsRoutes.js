const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");
const { protect, requireRole } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// GET — koi bhi logged-in user dekh sakta hai
// PUT — sirf tenant_admin update kar sakta hai
router
  .route("/")
  .get(protect, getSettings)
  .put(
    protect,
    requireRole("tenant_admin"),
    upload.single("logo"),
    updateSettings,
  );

module.exports = router;
