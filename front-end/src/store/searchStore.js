import { create } from "zustand"
import axios from "axios"

export const useSearch = create((set) => ({
  query: "",
  results: [],
  loading: false,

  // action de recherche
  search: async (query) => {
    if (!query) {
      set({ query: "", results: [] })
      return
    }

    set({ loading: true, query })

    try {
      const res = await axios.get(
        `http://localhost:5000/api/search?q=${query}`
      )

      set({
        results: res.data,
        loading: false,
      })
    } catch (error) {
      console.error("Search error:", error)
      set({ loading: false })
    }
  },

  clear: () => set({ query: "", results: [] }),
}))
