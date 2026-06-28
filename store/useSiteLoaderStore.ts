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

export const useSiteLoaderStore = create<SiteLoaderState>()((set, get) => ({
  progress: 0,
  isModelReady: false,
  isBootFinished: false,
  isLoaded: false,
  markModelReady: () => {
    const { progress, isBootFinished } = get()
    if (progress >= 90) {
      set({ isModelReady: true, progress: 100, isBootFinished: true, isLoaded: true })
    } else {
      set({ isModelReady: true, isLoaded: isBootFinished })
    }
  },
  setBootFinished: (finished) => {
    const { isModelReady } = get()
    set({ isBootFinished: finished, isLoaded: isModelReady && finished })
  },
  setProgress: (p) => {
    const { progress, isModelReady } = get()
    if (p <= progress) return // Prevent backward progress
    if (p >= 100) {
      set({ progress: 100, isBootFinished: true, isLoaded: isModelReady })
    } else {
      set({ progress: p })
    }
  }
}))
