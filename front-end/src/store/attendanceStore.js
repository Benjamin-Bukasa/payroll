import { create } from "zustand";
import {
  getAttendances,
  getAttendancesTable,
} from "../api/attendance";

export const useAttendanceStore = create((set) => ({
  attendances: [],
  attendancesTable: [],
  loading: false,
  error: null,
  tableLoading: false,
  tableError: null,

  fetchAttendances: async () => {
    try {
      set({ loading: true, error: null });

      const response = await getAttendances();
      const rows = Array.isArray(response)
        ? response
        : response?.data ?? [];

      set({
        attendances: Array.isArray(rows) ? rows : [],
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error:
          err.response?.data?.message ||
          "Erreur lors du chargement des pointages",
      });
    }
  },

  fetchAttendancesTable: async (params = {}) => {
    try {
      set({ tableLoading: true, tableError: null });

      const res = await getAttendancesTable(params);
      const rows = res?.data ?? [];

      set({
        attendancesTable: Array.isArray(rows) ? rows : [],
        tableLoading: false,
      });
    } catch (err) {
      set({
        tableLoading: false,
        tableError:
          err.response?.data?.message ||
          "Erreur lors du chargement du tableau de pointages",
      });
    }
  },

  clearAttendanceError: () =>
    set({ error: null, tableError: null }),
}));
