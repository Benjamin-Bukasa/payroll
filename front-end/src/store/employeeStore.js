// src/store/employeeStore.js
import { create } from "zustand";
import {
  getEmployees,
  createEmployee as createEmployeeApi,
  updateEmployee,
  deleteEmployee,
} from "../api/employee";
import api from "../api/axios";

export const useEmployeeStore = create((set, get) => ({
  /* =========================
     STATE
  ========================= */
  employees: [],
  smig: null,
  loading: false,
  error: null,

  /* =========================
     HELPERS
  ========================= */
  clearError: () => set({ error: null }),

  /* =========================
     FETCH EMPLOYEES
  ========================= */
  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getEmployees();
      set({ employees: data, loading: false });
    } catch (err) {
      set({
        error:
          err?.response?.data?.message ||
          "Erreur chargement employés",
        loading: false,
      });
    }
  },

  /* =========================
     FETCH ACTIVE SMIG
  ========================= */
  fetchActiveSmig: async () => {
    try {
      const res = await api.get("/smig/active");
      set({ smig: res.data });
    } catch {
      set({ smig: null });
    }
  },

  /* =========================
     CREATE EMPLOYEE
     (UTILISÉ PAR LE FORMULAIRE)
  ========================= */
  createEmployee: async (payload) => {
    try {
      set({ loading: true, error: null });

      const employee = await createEmployeeApi(payload);

      set((state) => ({
        employees: [employee, ...state.employees],
        loading: false,
      }));

      return employee; // ✅ IMPORTANT pour le formulaire
    } catch (err) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          "Erreur lors de la création de l’employé",
      });
      return null;
    }
  },

  /* =========================
     UPDATE EMPLOYEE
  ========================= */
  editEmployee: async (id, payload) => {
    try {
      const updated = await updateEmployee(id, payload);
      set((state) => ({
        employees: state.employees.map((e) =>
          e.id === id ? { ...e, ...updated } : e
        ),
      }));
      return updated;
    } catch (err) {
      set({
        error:
          err?.response?.data?.message ||
          "Erreur lors de la modification",
      });
      return null;
    }
  },

  /* =========================
     DELETE EMPLOYEE
  ========================= */
  removeEmployee: async (id) => {
    try {
      await deleteEmployee(id);
      set((state) => ({
        employees: state.employees.filter((e) => e.id !== id),
      }));
    } catch (err) {
      set({
        error:
          err?.response?.data?.message ||
          "Erreur lors de la suppression",
      });
    }
  },
}));
