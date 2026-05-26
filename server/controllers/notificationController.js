// controllers/notificationController.js
const Notification = require("../models/Notification");

// @desc   Get all notifications (latest 50), unread count
// @route  GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find().sort({ createdAt: -1 }).limit(50).lean(),
      Notification.countDocuments({ isRead: false }),
    ]);
    res.json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Mark a single notification as read
// @route  PATCH /api/notifications/:id/read
const markOneRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Mark ALL notifications as read
// @route  PATCH /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Delete a single notification
// @route  DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Delete all read notifications (cleanup)
// @route  DELETE /api/notifications/clear-read
const clearReadNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getNotifications,
  markOneRead,
  markAllRead,
  deleteNotification,
  clearReadNotifications,
};
