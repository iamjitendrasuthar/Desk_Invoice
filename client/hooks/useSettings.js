// hooks/useSettings.js
import { useState, useEffect, useCallback } from "react";
import { fetchSettings, updateSettings } from "@/services/settingsService";
import { useAuthStore } from "@/store/authStore";
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace("/api", "");

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
  logoUrl: data.logo ? `${API_BASE}${data.logo}` : "",
});

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
  const { user } = useAuthStore();

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

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchSettings();
        const mapped = mapDbToForm(data);

        // Logged-in user ka real naam, email aur role inject karo
        setForms({
          ...mapped,
          profile: {
            ...mapped.profile,
            name: user?.name || mapped.profile.name,
            email: user?.email || mapped.profile.email,
            role: user?.role?.replace(/_/g, " ") || "Admin",
          },
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleLogoChange = useCallback((file) => {
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const updateForm = useCallback((tab, updates) => {
    setForms((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], ...updates },
    }));
  }, []);

  const save = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      const payload = mapFormToDb(forms);
      const updated = await updateSettings(payload, logoFile);
      const mapped = mapDbToForm(updated);

      // Save ke baad bhi user data maintain karo
      setForms({
        ...mapped,
        profile: {
          ...mapped.profile,
          name: user?.name || mapped.profile.name,
          email: user?.email || mapped.profile.email,
          role: user?.role?.replace(/_/g, " ") || "Admin",
        },
      });

      setLogoFile(null);
      setLogoPreview(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, [forms, logoFile, user]);

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
