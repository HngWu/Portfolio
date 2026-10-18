import { create } from 'zustand'
import type { CurtainState, TransitionPreset } from '@/types/transitions'

export type { CurtainState }

/**
 * Normalizes route path by removing query parameters, hash fragments, and trailing slashes.
 */
export function normalizePath(p: string): string {
  const clean = p.split(/[?#]/)[0].trim().toLowerCase()
  return clean.length > 1 && clean.endsWith('/') ? clean.slice(0, -1) : clean
}

/**
 * Checks whether target and current paths match, respecting segment boundaries.
 * Prevents root "/" from matching all subpaths, and prevents partial slug prefixes (e.g. "/proj" vs "/projects").
 */
export function isPathMatch(target: string, current: string): boolean {
  const t = normalizePath(target)
  const c = normalizePath(current)
  if (t === c) return true
  // Check segment boundary so "/" doesn't match everything, and "/proj" doesn't match "/projects"
  if (t !== '/' && c.startsWith(`${t}/`)) return true
  if (c !== '/' && t.startsWith(`${c}/`)) return true
  return false
}

/**
 * Serialized DOMRect of the element that initiated a navigation (e.g. the
 * clicked bento tile). The UnifiedTransitionOverlay reads this so the
 * transition can emanate from the actual card rather than screen center.
 * Coordinates are viewport-relative; consumers must read them before the
 * element is unmounted during the route swap.
 */
export interface OriginRect {
  left: number
  top: number
  width: number
  height: number
  right: number
  bottom: number
}

export interface NavigationStore {
  originTileId: string | null
  setOriginTileId: (id: string | null) => void
  originRect: OriginRect | null
  setOriginRect: (rect: OriginRect | null) => void
  bentoTilesBounds: Record<string, OriginRect> | null
  setBentoTilesBounds: (bounds: Record<string, OriginRect> | null) => void
  /**
   * Page-curtain lifecycle.
   *   idle → covering (canvas paints page A away) → holding (continuous active loading phase) →
   *   peak (screen fully occluded; route swap happens here) →
   *   revealing (canvas unwinds back toward origin, exposing page B) → idle
   */
  curtainState: CurtainState
  setCurtainState: (state: CurtainState) => void
  isPageLoaded: boolean
  setPageLoaded: (loaded: boolean) => void
  setIsPageLoaded: (loaded: boolean) => void
  targetPath: string | null
  setTargetPath: (path: string | null) => void
  activePreset: TransitionPreset | null
  setActivePreset: (preset: TransitionPreset | null) => void
  reportPageLoaded: (path?: string) => void
}

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  originTileId: null,
  setOriginTileId: (id) => set({ originTileId: id }),
  originRect: null,
  setOriginRect: (rect) => set({ originRect: rect }),
  bentoTilesBounds: null,
  setBentoTilesBounds: (bounds) => set({ bentoTilesBounds: bounds }),
  curtainState: 'idle',
  setCurtainState: (state) => set({ curtainState: state }),
  isPageLoaded: false,
  setPageLoaded: (loaded) => set({ isPageLoaded: loaded }),
  setIsPageLoaded: (loaded) => set({ isPageLoaded: loaded }),
  targetPath: null,
  setTargetPath: (path) => set({ targetPath: path }),
  activePreset: null,
  setActivePreset: (preset) => set({ activePreset: preset }),
  reportPageLoaded: (path) => {
    const { targetPath, curtainState, isPageLoaded } = get()
    if (curtainState === 'idle' || isPageLoaded) return
    if (!path || !targetPath || isPathMatch(targetPath, path)) {
      set({ isPageLoaded: true })
    }
  },
}))
