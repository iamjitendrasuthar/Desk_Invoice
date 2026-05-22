import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind + conditional classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safe Currency Formatter
 */
export function formatCurrency(amount?: number | string, symbol = "₹") {
  const value = Number(amount || 0);

  return `${symbol}${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Safe Date Formatter
 */
export function formatDate(date?: string | Date) {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Safe DateTime Formatter
 */
export function formatDateTime(date?: string | Date) {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "-";

  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Status Badge Colors
 */
export function getStatusColor(status?: string) {
  const map: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    partial: "bg-yellow-100 text-yellow-700",
    unpaid: "bg-red-100 text-red-700",
    draft: "bg-gray-100 text-gray-600",
    sent: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-600",
  };

  return map[status || ""] || "bg-gray-100 text-gray-600";
}

/**
 * Safe GST Calculator
 */
export function calculateGST(
  amount?: number,
  gstRate?: number,
  inclusive = false,
) {
  const amt = Number(amount || 0);
  const gst = Number(gstRate || 0);

  if (inclusive) {
    const gstAmount = amt - (amt * 100) / (100 + gst);

    return {
      gstAmount,
      baseAmount: amt - gstAmount,
      totalAmount: amt,
    };
  }

  const gstAmount = (amt * gst) / 100;

  return {
    gstAmount,
    baseAmount: amt,
    totalAmount: amt + gstAmount,
  };
}
