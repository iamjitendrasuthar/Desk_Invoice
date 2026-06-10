import { create } from "zustand";
import api from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────
export type UserRole = "superadmin" | "tenant_admin" | "staff";

export interface TenantInfo {
  id: string;
  name: string;
  plan: "trial" | "basic" | "pro";
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  tenant: TenantInfo | null; // superadmin ke liye null
  token: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => void;

  // Role helpers — components mein easy check ke liye
  isSuperAdmin: () => boolean;
  isTenantAdmin: () => boolean;
  isStaff: () => boolean;
  canManageUsers: () => boolean;
  canManageSettings: () => boolean;
}

// ─── Store ─────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,

  // ─── Load user from localStorage on app start ──────────────────────────────
  loadUser: () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData || userData === "undefined") return;

    try {
      const user = JSON.parse(userData) as User;
      set({ token, user });
      // Axios default header set karo
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  // ─── Login ─────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    set({ isLoading: true });

    try {
      // Response: { success: true, data: { _id, name, email, role, tenant, token } }
      const { data } = await api.post("/auth/login", { email, password });
      const userData: User = data.data;

      localStorage.setItem("token", userData.token);
      localStorage.setItem("user", JSON.stringify(userData));

      api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;

      set({ user: userData, token: userData.token, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // ─── Logout ────────────────────────────────────────────────────────────────
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    set({ user: null, token: null });
    window.location.href = "/login";
  },

  // ─── Role helpers ──────────────────────────────────────────────────────────
  isSuperAdmin: () => get().user?.role === "superadmin",
  isTenantAdmin: () => get().user?.role === "tenant_admin",
  isStaff: () => get().user?.role === "staff",
  canManageUsers: () =>
    ["superadmin", "tenant_admin"].includes(get().user?.role ?? ""),
  canManageSettings: () =>
    ["superadmin", "tenant_admin"].includes(get().user?.role ?? ""),
}));
