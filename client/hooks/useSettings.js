// hooks/useSettings.js
// Custom hook to manage settings state, fetching, and saving

import { useState, useEffect, useCallback } from "react";
import { fetchSettings, updateSettings } from "@/services/settingsService";

/**
 * Maps flat DB settings to our UI form state shape
 */
const mapDbToForm = (data) => ({
  profile: {
    name: data.businessName || "",
    email: data.businessEmail || "",
    phone: data.businessPhone || "",
    role: "Admin",
  },
  business: {
    companyName: data.businessName || "",
    gstin: data.gstin || "",
    panNumber: data.panNumber || "",
    currency: data.currency
      ? `${data.currency} (${data.currencySymbol || ""})`
      : "",
    address: data.businessAddress?.street || "",
    city: data.businessAddress?.city || "",
    state: data.businessAddress?.state || "",
    pincode: data.businessAddress?.pincode || "",
  },
  billing: {
    invoicePrefix: data.invoicePrefix || "",
    defaultTaxRate: data.defaultTaxRate ?? "",
    termsAndConditions: data.termsAndConditions || "",
    bankName: data.bankDetails?.bankName || "",
    accountNumber: data.bankDetails?.accountNumber || "",
    ifscCode: data.bankDetails?.ifscCode || "",
    accountHolderName: data.bankDetails?.accountHolderName || "",
  },
  logoUrl: data.logo || "",
});

/**
 * Maps UI form state back to DB payload shape
 */
const mapFormToDb = (forms) => ({
  businessName: forms.business.companyName || forms.profile.name,
  businessEmail: forms.profile.email,
  businessPhone: forms.profile.phone,
  gstin: forms.business.gstin,
  panNumber: forms.business.panNumber,
  invoicePrefix: forms.billing.invoicePrefix,
  defaultTaxRate: Number(forms.billing.defaultTaxRate),
  termsAndConditions: forms.billing.termsAndConditions,
  businessAddress: {
    street: forms.business.address,
    city: forms.business.city,
    state: forms.business.state,
    pincode: forms.business.pincode,
    country: "India",
  },
  bankDetails: {
    bankName: forms.billing.bankName,
    accountNumber: forms.billing.accountNumber,
    ifscCode: forms.billing.ifscCode,
    accountHolderName: forms.billing.accountHolderName,
  },
});

export function useSettings() {
  const [forms, setForms] = useState({
    profile: { name: "", email: "", phone: "", role: "Admin" },
    business: {
      companyName: "",
      gstin: "",
      panNumber: "",
      currency: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
    billing: {
      invoicePrefix: "",
      defaultTaxRate: "",
      termsAndConditions: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      accountHolderName: "",
    },
    logoUrl: "",
  });

  const [logoFile, setLogoFile] = useState(null); // File object for new upload
  const [logoPreview, setLogoPreview] = useState(null); // Local preview URL
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load settings from DB on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchSettings();
        setForms(mapDbToForm(data));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Handle logo file selection
  const handleLogoChange = useCallback((file) => {
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  // Update a specific tab's form fields
  const updateForm = useCallback((tab, updates) => {
    setForms((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], ...updates },
    }));
  }, []);

  // Save all settings to DB
  const save = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      const payload = mapFormToDb(forms);
      const updated = await updateSettings(payload, logoFile);
      // Refresh forms from saved data
      setForms(mapDbToForm(updated));
      setLogoFile(null);
      setLogoPreview(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, [forms, logoFile]);

  return {
    forms,
    updateForm,
    logoPreview,
    handleLogoChange,
    loading,
    saving,
    error,
    showSuccess,
    save,
  };
}
