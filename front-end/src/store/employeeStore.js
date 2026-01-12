import { create } from "zustand";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../api/employee";

export const useEmployeeStore = create((set, get) => ({
  employees: [],
  loading: false,
  error: null,

  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getEmployees();
      set({ employees: data, loading: false });
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Erreur chargement employés",
        loading: false,
      });
    }
  },

  addEmployee: async (payload) => {
    set({ loading: true });
    const employee = await createEmployee(payload);
    set((state) => ({
      employees: [employee, ...state.employees],
      loading: false,
    }));
  },

  editEmployee: async (id, payload) => {
    const updated = await updateEmployee(id, payload);
    set((state) => ({
      employees: state.employees.map((e) =>
        e.id === id ? { ...e, ...updated } : e
      ),
    }));
  },

  removeEmployee: async (id) => {
    await deleteEmployee(id);
    set((state) => ({
      employees: state.employees.filter((e) => e.id !== id),
    }));
  },
}));
