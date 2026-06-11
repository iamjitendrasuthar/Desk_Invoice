const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Get auth token from localStorage
 */
const getToken = () => localStorage.getItem("token");

/**
 * Fetch current settings from DB
 * @returns {Promise<Object>} settings data
 */
export const fetchSettings = async () => {
  const res = await fetch(`${API_BASE}/settings`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const json = await res.json();
  if (!json.success)
    throw new Error(json.message || "Failed to fetch settings");
  return json.data;
};

/**
 * Update settings (supports logo file upload via multipart/form-data)
 * @param {Object} fields - All settings fields to update
 * @param {File|null} logoFile - Optional logo file
 * @returns {Promise<Object>} updated settings data
 */
export const updateSettings = async (fields, logoFile = null) => {
  const formData = new FormData();

  // Append logo file if provided
  if (logoFile) {
    formData.append("logo", logoFile);
  }

  // Flatten nested objects for FormData
  // businessAddress and bankDetails are nested — send as JSON string
  const { businessAddress, bankDetails, logoUrl, ...rest } = fields;

  Object.entries(rest).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      formData.append(key, val);
    }
  });

  if (businessAddress) {
    // Send nested objects as JSON strings; backend merges them
    Object.entries(businessAddress).forEach(([key, val]) => {
      formData.append(`businessAddress[${key}]`, val ?? "");
    });
  }

  if (bankDetails) {
    Object.entries(bankDetails).forEach(([key, val]) => {
      formData.append(`bankDetails[${key}]`, val ?? "");
    });
  }

  const res = await fetch(`${API_BASE}/settings`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      // NOTE: Do NOT set Content-Type manually for FormData — browser handles boundary
    },
    body: formData,
  });

  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to save settings");
  return json.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ currentPassword, password: newPassword }),
  });
  const json = await res.json();
  if (!json.success)
    throw new Error(json.message || "Failed to update password");
  return json.data;
};

/**
 * Step 1: Email pe OTP bhejo
 */
export const sendForgotPasswordOTP = async (email) => {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to send OTP");
  return json; // { success, message, devOtp? }
};

/**
 * Step 2: OTP verify karo
 */
export const verifyForgotPasswordOTP = async (email, otp) => {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Invalid OTP");
  return json; // { success, resetToken }
};

/**
 * Step 3: Naya password set karo
 */
export const resetPassword = async (email, resetToken, newPassword) => {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, resetToken, newPassword }),
  });
  const json = await res.json();
  if (!json.success)
    throw new Error(json.message || "Failed to reset password");
  return json;
};
