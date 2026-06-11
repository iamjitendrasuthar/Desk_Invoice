const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// ─── Nodemailer Transporter ────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Transporter verify failed:", error);
  } else {
    console.log("✅ Gmail connected, ready to send");
  }
});
// ─── OTP Email Template ────────────────────────────────────────────────────────
const sendOTPEmail = async (email, name, otp) => {
  console.log(email, otp, name);
  await transporter.sendMail({
    from: `"DeskInvoice" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Password Reset OTP — DeskInvoice",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:#006666;padding:32px 40px;text-align:center;">
                      <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                        Desk<span style="opacity:0.75;">Invoice</span>
                      </p>
                      <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.65);font-weight:500;letter-spacing:0.05em;">
                        PASSWORD RESET REQUEST
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:36px 40px;">
                      <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#1e293b;">
                        Hi ${name || "there"},
                      </p>
                      <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.6;">
                        We received a request to reset your DeskInvoice account password. Use the OTP below to continue.
                      </p>

                      <!-- OTP Box -->
                      <div style="background:#f0fafa;border:1.5px dashed #006666;border-radius:14px;padding:24px;text-align:center;margin-bottom:28px;">
                        <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#006666;letter-spacing:0.15em;text-transform:uppercase;">
                          Your One-Time Password
                        </p>
                        <p style="margin:0;font-size:40px;font-weight:800;letter-spacing:14px;color:#006666;font-family:'Courier New',monospace;">
                          ${otp}
                        </p>
                        <p style="margin:10px 0 0;font-size:12px;color:#94a3b8;font-weight:500;">
                          Valid for <strong style="color:#475569;">10 minutes</strong>
                        </p>
                      </div>

                      <p style="margin:0 0 6px;font-size:13px;color:#64748b;line-height:1.6;">
                        If you did not request a password reset, please ignore this email. Your password will remain unchanged.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px 32px;border-top:1px solid #f1f5f9;">
                      <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;font-weight:500;">
                        🔒 Do not share this OTP with anyone.<br/>
                        This email was sent by DeskInvoice — Enterprise Billing Portal.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
};

// ─── In-memory OTP store ───────────────────────────────────────────────────────
// Production mein Redis use karo
const otpStore = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─── Step 1: Send OTP ──────────────────────────────────────────────────────────
// @route  POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("📧 Forgot password request for:", email); // ← add karo
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Security: same response whether user exists or not (prevent enumeration)
    if (!user) {
      return res.json({
        success: true,
        message: "If this email exists, an OTP has been sent.",
      });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    otpStore.set(email.toLowerCase().trim(), {
      otp,
      expiresAt,
      attempts: 0,
      userId: user._id,
    });

    try {
      await sendOTPEmail(email, user.name, otp);
      console.log(`✅ OTP email sent to ${email}`);
    } catch (emailErr) {
      console.log(`🔑 Fallback OTP for ${email}: ${otp}`);
    }

    res.json({
      success: true,
      message: "If this email exists, an OTP has been sent.",
      // Development only — production mein remove karo
      ...(process.env.NODE_ENV === "development" && { devOtp: otp }),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Step 2: Verify OTP ────────────────────────────────────────────────────────
// @route  POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const record = otpStore.get(email.toLowerCase().trim());

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or already used. Please request a new one.",
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email.toLowerCase().trim());
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(email.toLowerCase().trim());
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    if (record.otp !== otp.toString().trim()) {
      record.attempts += 1;
      return res.status(400).json({
        success: false,
        message: `Incorrect OTP. ${MAX_ATTEMPTS - record.attempts} attempts remaining.`,
      });
    }

    // ✅ OTP sahi — resetToken generate karo
    const resetToken = crypto.randomBytes(32).toString("hex");

    otpStore.set(email.toLowerCase().trim(), {
      ...record,
      otp: null,
      verified: true,
      resetToken,
      resetTokenExpiresAt: Date.now() + 15 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "OTP verified successfully.",
      resetToken,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Step 3: Reset Password ────────────────────────────────────────────────────
// @route  POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset token, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const record = otpStore.get(email.toLowerCase().trim());

    if (!record || !record.verified || record.resetToken !== resetToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset session. Please start over.",
      });
    }

    if (Date.now() > record.resetTokenExpiresAt) {
      otpStore.delete(email.toLowerCase().trim());
      return res.status(400).json({
        success: false,
        message: "Reset session expired. Please request a new OTP.",
      });
    }

    // ✅ findById ki jagah direct findByIdAndUpdate — pre-save hook bypass issue fix
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await User.findByIdAndUpdate(
      record.userId,
      { $set: { password: hashedPassword } },
      { new: true },
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    otpStore.delete(email.toLowerCase().trim());

    console.log(`✅ Password reset successful for ${email}`);

    res.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { forgotPassword, verifyOTP, resetPassword };
