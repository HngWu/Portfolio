import { create } from 'zustand'

interface ViewModeStore {
  mode: 'quick' | 'deep'
  setMode: (mode: 'quick' | 'deep') => void
}

export const useViewModeStore = create<ViewModeStore>((set) => ({
  mode: 'quick',
  setMode: (mode) => set({ mode }),
}))
