const Settings = require("../models/Settings");

// @desc   Get settings (singleton)
// @route  GET /api/settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Update settings
// @route  PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      // Merge nested fields properly
      const updates = { ...req.body };

      // Handle nested address
      if (updates.businessAddress) {
        updates.businessAddress = { ...settings.businessAddress.toObject?.() || settings.businessAddress, ...updates.businessAddress };
      }
      if (updates.bankDetails) {
        updates.bankDetails = { ...settings.bankDetails.toObject?.() || settings.bankDetails, ...updates.bankDetails };
      }

      if (req.file) updates.logo = `/uploads/${req.file.filename}`;

      settings = await Settings.findByIdAndUpdate(settings._id, { $set: updates }, { new: true, runValidators: true });
    }

    res.json({ success: true, message: "Settings updated", data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSettings, updateSettings };
