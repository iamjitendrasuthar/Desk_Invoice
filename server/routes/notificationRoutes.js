// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markOneRead,
  markAllRead,
  deleteNotification,
  clearReadNotifications,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getNotifications);
router.patch("/read-all", protect, markAllRead); // BEFORE /:id routes
router.delete("/clear-read", protect, clearReadNotifications);
router.patch("/:id/read", protect, markOneRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;
