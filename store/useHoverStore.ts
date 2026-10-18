import { create } from "zustand"

export interface TileRect {
  left: number
  top: number
  width: number
  height: number
}

interface HoverState {
  hoveredTileId: string | null
  hoveredRect: TileRect | null
  setHoveredTile: (id: string | null, rect?: DOMRect | null) => void
}

export const useHoverStore = create<HoverState>((set) => ({
  hoveredTileId: null,
  hoveredRect: null,
  setHoveredTile: (id, rect) =>
    set({
      hoveredTileId: id,
      hoveredRect: rect
        ? {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          }
        : null,
    }),
}))
