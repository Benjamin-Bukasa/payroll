import { create } from "zustand";
import { getPayrollDashboard } from "../api/payroll";

export const usePayrollDashboardStore = create((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchDashboard: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await getPayrollDashboard(params);
      set({ data, loading: false });
    } catch (err) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          "Erreur lors du chargement de la paie",
      });
    }
  },
}));
