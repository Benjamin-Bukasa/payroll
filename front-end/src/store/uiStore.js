import { create } from "zustand";

export const useUIStore = create((set) => ({
  open: true,
  setOpen: (value) => set({ open: value }),
  toggleOpen: () =>
    set((state) => ({ open: !state.open })),
}));
