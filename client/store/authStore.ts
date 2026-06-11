import { create } from "zustand";
import api from "@/lib/api";

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
  tenant: TenantInfo | null;
  token: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => void;

  isSuperAdmin: () => boolean;
  isTenantAdmin: () => boolean;
  isStaff: () => boolean;
  canManageUsers: () => boolean;
  canManageSettings: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,

  loadUser: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData || userData === "undefined") return;
    try {
      const user = JSON.parse(userData) as User;
      set({ token, user });
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const userData: User = data.data;
      localStorage.setItem("token", userData.token);
      localStorage.setItem("user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
      set({ user: userData, token: userData.token, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      // ✅ Raw Axios error nahi — clean string message throw karo
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    set({ user: null, token: null });
    window.location.href = "/login";
  },

  isSuperAdmin: () => get().user?.role === "superadmin",
  isTenantAdmin: () => get().user?.role === "tenant_admin",
  isStaff: () => get().user?.role === "staff",
  canManageUsers: () =>
    ["superadmin", "tenant_admin"].includes(get().user?.role ?? ""),
  canManageSettings: () =>
    ["superadmin", "tenant_admin"].includes(get().user?.role ?? ""),
}));
