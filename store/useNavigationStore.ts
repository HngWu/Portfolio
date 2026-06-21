import { create } from 'zustand'

/**
 * Serialized DOMRect of the element that initiated a navigation (e.g. the
 * clicked bento tile). The page-entry overlay reads this so the gold/blue
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

interface NavigationStore {
  originTileId: string | null
  setOriginTileId: (id: string | null) => void
  originRect: OriginRect | null
  setOriginRect: (rect: OriginRect | null) => void
  bentoTilesBounds: Record<string, OriginRect> | null
  setBentoTilesBounds: (bounds: Record<string, OriginRect> | null) => void
  curtainState: 'idle' | 'covering' | 'revealing'
  setCurtainState: (state: 'idle' | 'covering' | 'revealing') => void
  isPageLoaded: boolean
  setPageLoaded: (loaded: boolean) => void
}

export const useNavigationStore = create<NavigationStore>((set) => ({
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
}))
