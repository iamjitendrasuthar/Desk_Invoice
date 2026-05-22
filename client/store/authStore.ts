import { create } from "zustand";
import api from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,

  loadUser: () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData || userData === "undefined") return;

    try {
      const user = JSON.parse(userData);
      set({ token, user });
    } catch (error) {
      console.error("Invalid user data:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      // Backend response structure: { success: true, data: { _id, name, email, role, token } }
      const { data } = await api.post("/auth/login", { email, password });

      const userData = data.data; // ← FIX: data.data, not data.user

      localStorage.setItem("token", userData.token); // ← FIX: userData.token
      localStorage.setItem("user", JSON.stringify(userData)); // ← FIX: userData

      // Axios future requests ke liye token set karo
      api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;

      set({
        user: userData, // ← FIX: userData
        token: userData.token, // ← FIX: userData.token
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];

    set({ user: null, token: null });

    window.location.href = "/login";
  },
}));
