// src/store/clientCompanyStore.js
import { create } from "zustand";
import api from "../api/axios";

export const useClientCompanyStore = create((set) => ({
  clientCompanies: [],

  loading: false,

  createError: null,
  fetchError: null,

  clearCreateError: () => set({ createError: null }),
  clearFetchError: () => set({ fetchError: null }),

  /* ===============================
     CREATE
  =============================== */
  createClientCompany: async (payload) => {
    try {
      set({ loading: true, createError: null });

      const res = await api.post(
        "/clientCompany/create",
        payload
      );

      set((state) => ({
        clientCompanies: [
          res.data,
          ...state.clientCompanies,
        ],
        loading: false,
      }));

      return res.data;
    } catch (err) {
      set({
        createError:
          err.response?.data?.message ||
          "Erreur lors de la création",
        loading: false,
      });

      return null;
    }
  },

  /* ===============================
     FETCH
  =============================== */
  fetchClientCompanies: async () => {
    try {
      set({ loading: true, fetchError: null });

      const res = await api.get(
        "/clientCompany/getall"
      );

      set({
        clientCompanies: res.data,
        loading: false,
      });
    } catch {
      set({
        fetchError:
          "Erreur lors du chargement des entreprises",
        loading: false,
      });
    }
  },
}));
