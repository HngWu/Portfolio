import { create } from "zustand"
import * as THREE from "three"

export type DeityMode = "OBSERVER" | "SWARM COMMAND" | "OVERDRIVE" | "CAD SCHEMATIC" | "PURE SHOWCASE"

export interface ShockwavePulse {
  id: string
  origin: THREE.Vector3
  timestamp: number
  maxRadius: number
  speed: number
}

interface DeityControlsState {
  mode: DeityMode
  isHovered: boolean
  isInteracting: boolean
  activeShockwaves: ShockwavePulse[]
  
  // Genesis Assembly Sequence State
  assemblyProgress: number // 0.0 (dormant/scattered) -> 1.0 (fully formed)
  isAssembling: boolean
  assemblyStartTime: number
  assemblyDuration: number // in milliseconds (3800ms)

  // Interactive Kinetic Recoil Pulse State (0 to 1 on click)
  kineticPulse: number

  // Actions
  setMode: (mode: DeityMode) => void
  setHovered: (isHovered: boolean) => void
  setInteracting: (isInteracting: boolean) => void
  triggerShockwave: (origin?: THREE.Vector3) => void
  pruneShockwaves: (now: number, maxAgeMs?: number) => void
  triggerAssembly: () => void
  tickAssembly: (now: number) => void
  triggerKineticPulse: () => void
  tickKineticPulse: (delta: number) => void
  resetControls: () => void
}

export const useDeityControls = create<DeityControlsState>((set, get) => ({
  mode: "OBSERVER",
  isHovered: false,
  isInteracting: false,
  activeShockwaves: [],

  // Genesis Assembly defaults to starting animation on load
  assemblyProgress: 0,
  isAssembling: true,
  assemblyStartTime: typeof performance !== "undefined" ? performance.now() : 0,
  assemblyDuration: 3800,

  // Kinetic pulse on click
  kineticPulse: 0,

  setMode: (mode) => set({ mode }),
  setHovered: (isHovered) => set({ isHovered }),
  setInteracting: (isInteracting) => set({ isInteracting }),

  triggerKineticPulse: () => set({ kineticPulse: 1.0 }),

  tickKineticPulse: (delta: number) => {
    const current = get().kineticPulse
    if (current <= 0) return
    const next = Math.max(0, current - delta * 2.4)
    set({ kineticPulse: next })
  },

  triggerShockwave: (origin = new THREE.Vector3(0, 0, 0)) => {
    const newPulse: ShockwavePulse = {
      id: `pulse_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      origin: origin.clone(),
      timestamp: performance.now(),
      maxRadius: 16,
      speed: 14,
    }
    set({
      activeShockwaves: [...get().activeShockwaves.slice(-3), newPulse],
      kineticPulse: 1.0,
    })
  },

  pruneShockwaves: (now, maxAgeMs = 1500) => {
    const filtered = get().activeShockwaves.filter(
      (pulse) => now - pulse.timestamp < maxAgeMs
    )
    if (filtered.length !== get().activeShockwaves.length) {
      set({ activeShockwaves: filtered })
    }
  },

  triggerAssembly: () => {
    const now = performance.now()
    set({
      isAssembling: true,
      assemblyProgress: 0,
      assemblyStartTime: now,
    })
  },

  tickAssembly: (now: number) => {
    const { isAssembling, assemblyStartTime, assemblyDuration } = get()
    if (!isAssembling) return

    const elapsed = now - assemblyStartTime
    const rawProgress = Math.min(1.0, Math.max(0.0, elapsed / assemblyDuration))
    
    // Smooth cubic bezier easing: easeOutCubic = 1 - (1 - t)^3
    const eased = 1 - Math.pow(1 - rawProgress, 3)

    if (rawProgress >= 1.0) {
      set({ assemblyProgress: 1.0, isAssembling: false })
    } else {
      set({ assemblyProgress: eased })
    }
  },

  resetControls: () =>
    set({
      mode: "OBSERVER",
      isHovered: false,
      isInteracting: false,
      activeShockwaves: [],
      assemblyProgress: 1.0,
      isAssembling: false,
    }),
}))
