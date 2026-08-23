import { create } from "zustand"

interface AdminNavState {
  isMobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  toggleMobile: () => void
}

export const useAdminNavStore = create<AdminNavState>((set) => ({
  isMobileOpen: false,
  setMobileOpen: (open) => set({ isMobileOpen: open }),
  toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
}))
