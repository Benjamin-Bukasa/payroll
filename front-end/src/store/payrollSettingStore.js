import { create } from "zustand";
import {
  getPayrollSettings,
  getPayrollSettingByClientCompany,
  createPayrollSetting as createPayrollSettingRequest,
  updatePayrollSetting as updatePayrollSettingRequest,
} from "../api/payrollSetting";

export const usePayrollSettingStore = create((set) => ({
  settings: [],
  selectedSetting: null,

  loading: false,
  error: null,

  detailsLoading: false,
  detailsError: null,

  saving: false,
  saveError: null,

  clearErrors: () =>
    set({
      error: null,
      detailsError: null,
      saveError: null,
    }),

  fetchPayrollSettings: async () => {
    try {
      set({ loading: true, error: null });
      const data = await getPayrollSettings();
      set({
        settings: Array.isArray(data) ? data : [],
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error:
          err.response?.data?.message ||
          "Erreur lors du chargement des variables de paie",
      });
    }
  },

  fetchPayrollSettingByClientCompany: async (
    clientCompanyId
  ) => {
    if (!clientCompanyId) {
      set({ selectedSetting: null, detailsError: null });
      return;
    }

    try {
      set({ detailsLoading: true, detailsError: null });
      const data = await getPayrollSettingByClientCompany(
        clientCompanyId
      );
      set({
        selectedSetting: data,
        detailsLoading: false,
      });
    } catch (err) {
      set({
        detailsLoading: false,
        detailsError:
          err.response?.data?.message ||
          "Erreur lors du chargement des variables de paie",
      });
    }
  },

  createPayrollSetting: async (payload) => {
    try {
      set({ saving: true, saveError: null });
      const data = await createPayrollSettingRequest(
        payload
      );
      set({
        saving: false,
        selectedSetting: data,
      });
      return data;
    } catch (err) {
      set({
        saving: false,
        saveError:
          err.response?.data?.message ||
          "Erreur lors de la crÃ©ation des variables",
      });
      return null;
    }
  },

  updatePayrollSetting: async (clientCompanyId, payload) => {
    try {
      set({ saving: true, saveError: null });
      const data = await updatePayrollSettingRequest(
        clientCompanyId,
        payload
      );
      set({
        saving: false,
        selectedSetting: data,
      });
      return data;
    } catch (err) {
      set({
        saving: false,
        saveError:
          err.response?.data?.message ||
          "Erreur lors de la mise Ã  jour des variables",
      });
      return null;
    }
  },
}));
