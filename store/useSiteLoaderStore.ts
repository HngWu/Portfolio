import { create } from 'zustand'

interface SiteLoaderState {
  progress: number
  isModelReady: boolean
  isBootFinished: boolean
  isLoaded: boolean
  markModelReady: () => void
  setBootFinished: (finished: boolean) => void
  setProgress: (progress: number) => void
}

export const useSiteLoaderStore = create<SiteLoaderState>((set, get) => ({
  progress: 0,
  isModelReady: false,
  isBootFinished: false,
  isLoaded: false,
  markModelReady: () => {
    set({ isModelReady: true })
    if (get().progress >= 90) {
      set({ progress: 100, isBootFinished: true, isLoaded: true })
    }
  },
  setBootFinished: (finished) => {
    const { isModelReady } = get()
    set({ isBootFinished: finished, isLoaded: isModelReady && finished })
  },
  setProgress: (p) => {
    const { isModelReady } = get()
    if (p >= 100) {
      set({ progress: 100, isBootFinished: true, isLoaded: isModelReady })
    } else {
      set({ progress: p })
    }
  }
}))
