const express = require("express");
const router = express.Router();
const {
  login,
  getMe,
  updateProfile,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/authController");
const {
  forgotPassword,
  verifyOTP,
  resetPassword,
} = require("../controllers/forgotPasswordController");
const { protect, requireRole } = require("../middleware/authMiddleware");

// ─── Public ───────────────────────────────────────────────────────────────────
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// ─── Authenticated (any role) ─────────────────────────────────────────────────
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

// ─── Tenant Admin + Superadmin — user management ──────────────────────────────
router.get(
  "/users",
  protect,
  requireRole("tenant_admin", "superadmin"),
  getUsers,
);
router.post("/users", protect, requireRole("tenant_admin"), createUser);
router.put("/users/:id", protect, requireRole("tenant_admin"), updateUser);
router.delete("/users/:id", protect, requireRole("tenant_admin"), deleteUser);

module.exports = router;
