import { create } from 'zustand'

interface IgniteStore {
  isIgnited: boolean
  ignite: () => void
  reset: () => void
}

export const useIgniteStore = create<IgniteStore>((set) => ({
  isIgnited: false,
  ignite: () => set({ isIgnited: true }),
  reset: () => set({ isIgnited: false }),
}))
