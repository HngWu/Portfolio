import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  primaryColor: string
  setPrimaryColor: (color: string) => void
  togglePrimaryColor: () => void
}

const COLORS = ["#4AFFB4", "#4A8FFF", "#FF4A8F", "#FFB44A"]

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      primaryColor: "#4AFFB4",
      setPrimaryColor: (color) => set({ primaryColor: color }),
      togglePrimaryColor: () => {
        const current = get().primaryColor
        const nextIndex = (COLORS.indexOf(current) + 1) % COLORS.length
        set({ primaryColor: COLORS[nextIndex] })
      },
    }),
    { name: 'theme-storage' }
  )
)
