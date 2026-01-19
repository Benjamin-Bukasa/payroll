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

      rememberMe: true,

      setRememberMe: (value) => set({ rememberMe: value }),

      clearError: () => set({ error: null }),

      // 🔄 Vérifier l'utilisateur connecté
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

          await new Promise((r) => setTimeout(r, 0));
          await get().fetchMe();

          set({ loading: false });
        } catch (err) {
          set({
            error:
              err.response?.data?.message ||
              "Email ou mot de passe incorrect",
            loading: false,
          });
        }
      },

      // 🔐 Google Login
      googleLogin: async (idToken) => {
        try {
          set({ loading: true, error: null });

          await api.post("/auth/google", { token: idToken });

          await new Promise((r) => setTimeout(r, 0));
          await get().fetchMe();

          set({ loading: false });
        } catch {
          set({
            error: "Connexion Google échouée",
            loading: false,
          });
        }
      },

      // 🚪 Logout + sync multi-onglet
      logout: async () => {
        await api.post("/auth/logout");

        // 🔔 notifier les autres onglets
        localStorage.setItem(
          "neopayroll-logout",
          Date.now().toString()
        );

        set({
          user: null,
          isAuthenticated: false,
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
