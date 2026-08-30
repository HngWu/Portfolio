import { create } from 'zustand'

export type LoaderPhase = "booting" | "collapsing" | "igniting" | "settled"

export interface HeroAnchorRect {
  x: number
  y: number
  width: number
  height: number
}

interface SiteLoaderState {
  progress: number
  isModelReady: boolean
  isBootFinished: boolean
  isLoaded: boolean
  phase: LoaderPhase
  heroAnchorRect: HeroAnchorRect | null
  markModelReady: () => void
  setBootFinished: (finished: boolean) => void
  setProgress: (progress: number) => void
  setHeroAnchorRect: (rect: HeroAnchorRect | null) => void
  startTransition: () => void
  triggerIgnition: () => void
  completeTransition: () => void
  forceComplete: () => void
}

export const useSiteLoaderStore = create<SiteLoaderState>()((set, get) => ({
  progress: 0,
  isModelReady: false,
  isBootFinished: false,
  isLoaded: false,
  phase: "booting",
  heroAnchorRect: null,
  markModelReady: () => {
    const { isBootFinished } = get()
    set({ isModelReady: true, isLoaded: isBootFinished })
  },
  setBootFinished: (finished) => {
    const { isModelReady } = get()
    set({ 
      isBootFinished: finished, 
      isLoaded: isModelReady && finished,
      phase: isModelReady && finished ? "igniting" : get().phase
    })
  },
  setProgress: (p) => {
    const { progress } = get()
    if (p <= progress) return // Prevent backward progress
    set({ progress: p })
  },
  setHeroAnchorRect: (rect) => {
    set({ heroAnchorRect: rect })
  },
  startTransition: () => {
    set({ phase: "collapsing" })
  },
  triggerIgnition: () => {
    set({ phase: "igniting", isLoaded: true, isBootFinished: true })
  },
  completeTransition: () => {
    set({ phase: "settled", isLoaded: true, isBootFinished: true })
  },
  forceComplete: () => {
    set({ progress: 100, isModelReady: true, isBootFinished: true, isLoaded: true, phase: "settled" })
  }
}))
