import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface PerformanceToggles {
  enable3DModel: boolean
  enableCustomCursor: boolean
  enableBackgroundFx: boolean
  enableCardTilt: boolean
}

export interface PerformanceState extends PerformanceToggles {
  // Ephemeral runtime telemetry
  fps: number
  isLagging: boolean
  isPromptOpen: boolean
  hasPrompted: boolean
  neverShowAutoPrompt: boolean

  // Actions
  setFps: (fps: number, isLagging: boolean) => void
  setPromptOpen: (isOpen: boolean) => void
  setToggle: <K extends keyof PerformanceToggles>(key: K, value: boolean) => void
  optimizeAll: () => void
  restoreHighQuality: () => void
  dismissPrompt: (neverShowAgain?: boolean) => void
  reportLag: () => void
}

export const usePerformanceStore = create<PerformanceState>()(
  persist(
    (set, get) => ({
      // Default quality settings
      enable3DModel: true,
      enableCustomCursor: true,
      enableBackgroundFx: true,
      enableCardTilt: true,

      // Ephemeral state
      fps: 60,
      isLagging: false,
      isPromptOpen: false,
      hasPrompted: false,
      neverShowAutoPrompt: false,

      setFps: (fps, isLagging) => set({ fps, isLagging }),

      setPromptOpen: (isPromptOpen) => set({ isPromptOpen }),

      setToggle: (key, value) => set({ [key]: value }),

      optimizeAll: () =>
        set({
          enable3DModel: false,
          enableCustomCursor: false,
          enableBackgroundFx: false,
          enableCardTilt: false,
        }),

      restoreHighQuality: () =>
        set({
          enable3DModel: true,
          enableCustomCursor: true,
          enableBackgroundFx: true,
          enableCardTilt: true,
        }),

      dismissPrompt: (neverShowAgain = false) => {
        set({
          isPromptOpen: false,
          hasPrompted: true,
          neverShowAutoPrompt: neverShowAgain ? true : get().neverShowAutoPrompt,
        })
      },

      reportLag: () => {
        const { hasPrompted, neverShowAutoPrompt, enable3DModel, enableCustomCursor } = get()
        // If the user already suppressed auto prompts or has already been prompted in this session
        if (neverShowAutoPrompt || hasPrompted) return

        // If the user already turned off heavy features manually, don't nag them
        if (!enable3DModel && !enableCustomCursor) return

        set({
          isPromptOpen: true,
          hasPrompted: true,
          isLagging: true,
        })
      },
    }),
    {
      name: "lume-performance-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return window.localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      partialize: (state) => ({
        enable3DModel: state.enable3DModel,
        enableCustomCursor: state.enableCustomCursor,
        enableBackgroundFx: state.enableBackgroundFx,
        enableCardTilt: state.enableCardTilt,
        neverShowAutoPrompt: state.neverShowAutoPrompt,
      }),
    }
  )
)
