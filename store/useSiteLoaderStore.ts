import { create } from 'zustand'

interface SiteLoaderState {
  progress: number
  isModelReady: boolean
  isBootFinished: boolean
  isLoaded: boolean
  markModelReady: () => void
  setBootFinished: (finished: boolean) => void
  setProgress: (progress: number) => void
  forceComplete: () => void
}

export const useSiteLoaderStore = create<SiteLoaderState>()((set, get) => ({
  progress: 0,
  isModelReady: false,
  isBootFinished: false,
  isLoaded: false,
  markModelReady: () => {
    const { isBootFinished } = get()
    set({ isModelReady: true, isLoaded: isBootFinished })
  },
  setBootFinished: (finished) => {
    const { isModelReady } = get()
    set({ isBootFinished: finished, isLoaded: isModelReady && finished })
  },
  setProgress: (p) => {
    const { progress } = get()
    if (p <= progress) return // Prevent backward progress
    set({ progress: p })
  },
  forceComplete: () => {
    set({ progress: 100, isModelReady: true, isBootFinished: true, isLoaded: true })
  }
}))
