import { create } from "zustand";
import api from "../api/axios";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  checkingAuth: true, // 👈 IMPORTANT
  error: null,

  clearError: () => set({ error: null }),

  fetchMe: async () => {
    try {
      const res = await api.get("/auth/me");
      set({
        user: res.data,
        isAuthenticated: true,
        checkingAuth: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        checkingAuth: false,
      });
    }
  },

  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      await api.post("/auth/login", credentials);
      const res = await api.get("/auth/me");
      set({
        user: res.data,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          "Email ou mot de passe incorrect",
        loading: false,
      });
    }
  },

  googleLogin: async (idToken) => {
    try {
      set({ loading: true, error: null });
      await api.post("/auth/google", { token: idToken });
      const res = await api.get("/auth/me");
      set({
        user: res.data,
        isAuthenticated: true,
        loading: false,
      });
    } catch {
      set({
        error: "Connexion Google échouée",
        loading: false,
      });
    }
  },

  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null, isAuthenticated: false });
  },
}));
