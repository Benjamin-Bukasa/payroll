import { create } from "zustand";
import {
  getPayrollPeriods,
  createPayrollPeriod,
  closePayrollPeriod,
  reopenPayrollPeriod,
} from "../api/payrollPeriod";

export const usePayrollPeriodStore = create((set) => ({
  periods: [],
  loading: false,
  error: null,
  creating: false,
  createError: null,
  updating: false,
  updateError: null,
  clearUpdateError: () => set({ updateError: null }),

  fetchPayrollPeriods: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const data = await getPayrollPeriods(params);
      set({
        periods: Array.isArray(data) ? data : [],
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          "Erreur lors du chargement des périodes",
      });
    }
  },

  createPayrollPeriod: async (payload) => {
    try {
      set({ creating: true, createError: null });
      const data = await createPayrollPeriod(payload);
      set((state) => ({
        periods: [data, ...state.periods],
        creating: false,
      }));
      return data;
    } catch (err) {
      set({
        creating: false,
        createError:
          err?.response?.data?.message ||
          "Erreur lors de la creation",
      });
      return null;
    }
  },

  closePayrollPeriod: async (periodId) => {
    try {
      set({ updating: true, updateError: null });
      const data = await closePayrollPeriod(periodId);
      const updated = data?.period || data;
      set((state) => ({
        periods: state.periods.map((period) =>
          period.id === updated.id ? updated : period
        ),
        updating: false,
      }));
      return updated;
    } catch (err) {
      set({
        updating: false,
        updateError:
          err?.response?.data?.message ||
          "Erreur lors de la mise a jour",
      });
      return null;
    }
  },

  reopenPayrollPeriod: async (periodId) => {
    try {
      set({ updating: true, updateError: null });
      const data = await reopenPayrollPeriod(periodId);
      const updated = data?.period || data;
      set((state) => ({
        periods: state.periods.map((period) =>
          period.id === updated.id ? updated : period
        ),
        updating: false,
      }));
      return updated;
    } catch (err) {
      set({
        updating: false,
        updateError:
          err?.response?.data?.message ||
          "Erreur lors de la mise a jour",
      });
      return null;
    }
  },
}));
