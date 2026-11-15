"use client"

import { create } from "zustand"

export type DeityHotspotId = "halo" | "core" | "sword" | null

export interface MechanicalDeityState {
  isHovered: boolean
  activeHotspot: DeityHotspotId
  normalizedMouse: { x: number; y: number }
  cursorPixel: { x: number; y: number }
  overdrive: boolean
  reducedMotion: boolean
  soundEnabled: boolean

  setHovered: (isHovered: boolean) => void
  setActiveHotspot: (hotspot: DeityHotspotId) => void
  setMouseCoordinates: (normX: number, normY: number, pixelX?: number, pixelY?: number) => void
  setOverdrive: (active: boolean) => void
  triggerOverdrive: (durationMs?: number) => void
  setReducedMotion: (enabled: boolean) => void
  toggleSound: () => void
  reset: () => void
}

let overdriveTimeout: ReturnType<typeof setTimeout> | null = null

export const useMechanicalDeityStore = create<MechanicalDeityState>((set, get) => ({
  isHovered: false,
  activeHotspot: null,
  normalizedMouse: { x: 0, y: 0 },
  cursorPixel: { x: 0, y: 0 },
  overdrive: false,
  reducedMotion: false,
  soundEnabled: false,

  setHovered: (isHovered: boolean) => set({ isHovered }),

  setActiveHotspot: (activeHotspot: DeityHotspotId) => set({ activeHotspot }),

  setMouseCoordinates: (normX: number, normY: number, pixelX?: number, pixelY?: number) => {
    const clampedX = Math.max(-1, Math.min(1, normX))
    const clampedY = Math.max(-1, Math.min(1, normY))
    set((state) => ({
      normalizedMouse: { x: clampedX, y: clampedY },
      cursorPixel: {
        x: pixelX !== undefined ? pixelX : state.cursorPixel.x,
        y: pixelY !== undefined ? pixelY : state.cursorPixel.y,
      },
    }))
  },

  setOverdrive: (overdrive: boolean) => {
    if (overdriveTimeout) {
      clearTimeout(overdriveTimeout)
      overdriveTimeout = null
    }
    set({ overdrive })
  },

  triggerOverdrive: (durationMs = 4000) => {
    if (overdriveTimeout) {
      clearTimeout(overdriveTimeout)
    }
    set({ overdrive: true })
    overdriveTimeout = setTimeout(() => {
      set({ overdrive: false })
      overdriveTimeout = null
    }, durationMs)
  },

  setReducedMotion: (reducedMotion: boolean) => set({ reducedMotion }),

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  reset: () => {
    if (overdriveTimeout) {
      clearTimeout(overdriveTimeout)
      overdriveTimeout = null
    }
    set({
      isHovered: false,
      activeHotspot: null,
      normalizedMouse: { x: 0, y: 0 },
      cursorPixel: { x: 0, y: 0 },
      overdrive: false,
      reducedMotion: false,
      soundEnabled: false,
    })
  },
}))
