import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      checkingAuth: true,
      error: null,

      rememberMe: false,

      setRememberMe: (value) => set({ rememberMe: value }),
      clearError: () => set({ error: null }),

      // 🔄 Vérifier session
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

      // 🔐 Login
      login: async (credentials) => {
        try {
          set({ loading: true, error: null });

          await api.post("/auth/login", credentials);
          await get().fetchMe();

          set({ loading: false });
          return true;
        } catch (err) {
          set({
            error:
              err.response?.data?.message ||
              "Email ou mot de passe incorrect",
            loading: false,
          });
          return false;
        }
      },

      // 🔐 Google login
      googleLogin: async (idToken) => {
        try {
          set({ loading: true, error: null });

          await api.post("/auth/google", { token: idToken });
          await get().fetchMe();

          set({ loading: false });
          return true;
        } catch {
          set({
            error: "Connexion Google échouée",
            loading: false,
          });
          return false;
        }
      },

      // 🚪 Logout (API optionnelle)
      logout: async (force = false) => {
        try {
          if (!force) {
            await api.post("/auth/logout");
          }
        } catch {
          // ignore
        }

        localStorage.setItem(
          "neopayroll-logout",
          Date.now().toString()
        );

        set({
          user: null,
          isAuthenticated: false,
          checkingAuth: false,
        });
      },
    }),
    {
      name: "neopayroll-auth",
      partialize: (state) => ({
        user: state.rememberMe ? state.user : null,
        isAuthenticated: state.rememberMe
          ? state.isAuthenticated
          : false,
        rememberMe: state.rememberMe,
      }),
    }
  )
);
