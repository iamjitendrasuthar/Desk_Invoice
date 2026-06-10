const Settings = require("../models/Settings");

// ─── Get settings (tenant-scoped) ─────────────────────────────────────────────
// @route  GET /api/settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ tenantId: req.tenantId });

    if (!settings) {
      // Auto-create blank settings for this tenant
      settings = await Settings.create({ tenantId: req.tenantId });
    }

    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update settings (tenant-scoped) ──────────────────────────────────────────
// @route  PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ tenantId: req.tenantId });

    if (!settings) {
      settings = await Settings.create({ tenantId: req.tenantId, ...req.body });
    } else {
      const updates = { ...req.body };

      // Nested merge — partial address/bank updates ko handle karo
      if (updates.businessAddress && settings.businessAddress) {
        updates.businessAddress = {
          ...(settings.businessAddress.toObject?.() ??
            settings.businessAddress),
          ...updates.businessAddress,
        };
      }
      if (updates.bankDetails && settings.bankDetails) {
        updates.bankDetails = {
          ...(settings.bankDetails.toObject?.() ?? settings.bankDetails),
          ...updates.bankDetails,
        };
      }

      // Logo file upload handle
      if (req.file) updates.logo = `/uploads/${req.file.filename}`;

      // tenantId kabhi update nahi hona chahiye
      delete updates.tenantId;

      settings = await Settings.findByIdAndUpdate(
        settings._id,
        { $set: updates },
        { new: true, runValidators: true },
      );
    }

    res.json({ success: true, message: "Settings updated", data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSettings, updateSettings };
