import { create } from "zustand";
import { getAttendances } from "../api/attendance";

export const useAttendanceStore = create((set) => ({
  attendances: [],
  loading: false,
  error: null,

  fetchAttendances: async () => {
    try {
      set({ loading: true, error: null });
      const data = await getAttendances();

      set({
        attendances: data,
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

  clearAttendanceError: () => set({ error: null }),
}));
