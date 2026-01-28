// src/store/importStoreFactory.js
import { create } from "zustand";

export const createImportStore = (importFn) =>
  create((set) => ({
    loading: false,
    error: null,
    result: null,

    clearError: () => set({ error: null }),
    clearResult: () => set({ result: null }),

    uploadFile: async (file) => {
      try {
        set({ loading: true, error: null });

        const data = await importFn(file);

        set({
          result: data,
          loading: false,
        });

        return data;
      } catch (err) {
        set({
          loading: false,
          error:
            err.response?.data?.message ||
            "Erreur lors de l'import",
        });
        return null;
      }
    },
  }));
