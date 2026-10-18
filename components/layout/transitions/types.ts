import type { OriginRect } from "@/store/useNavigationStore"

export type TransitionMode = "quick" | "deep"

export interface TransitionOrigin {
  x: number
  y: number
}

/**
 * Modular canvas renderer interface for page transition presets.
 * Allows presets to manage their own lifecycle, particle state, and rendering phases.
 */
export interface PresetRenderer<TState = unknown> {
  /** Initializes renderer-specific state at the start of a transition */
  initState: (
    mode: TransitionMode,
    w: number,
    h: number,
    origin: TransitionOrigin
  ) => TState
  /** Renders the covering sweep phase (progress p: 0 -> 1) */
  drawCover: (
    ctx: CanvasRenderingContext2D,
    state: TState,
    p: number,
    w: number,
    h: number,
    mode: TransitionMode,
    dt: number
  ) => void
  /** Renders continuous active animation while holding during route swap / page load */
  drawHolding: (
    ctx: CanvasRenderingContext2D,
    state: TState,
    elapsed: number,
    w: number,
    h: number,
    mode: TransitionMode,
    dt: number
  ) => void
  /** Renders the reveal unwinding phase (progress p: 0 -> 1) */
  drawReveal: (
    ctx: CanvasRenderingContext2D,
    state: TState,
    p: number,
    w: number,
    h: number,
    mode: TransitionMode,
    dt: number
  ) => void
  /** Optional cleanup callback invoked when the transition completes or unmounts */
  dispose?: (state: TState) => void
}

/**
 * Clamps a number to the [0, 1] range, with NaN safety.
 */
export function clamp01(t: number): number {
  if (Number.isNaN(t)) return 0
  return t < 0 ? 0 : t > 1 ? 1 : t
}

/**
 * Cubic ease-in-out easing curve optimized to avoid Math.pow allocations in hot loops.
 */
export function easeInOutCubic(t: number): number {
  const clamped = clamp01(t)
  if (clamped < 0.5) {
    return 4 * clamped * clamped * clamped
  }
  const f = -2 * clamped + 2
  return 1 - (f * f * f) / 2
}

/**
 * RGB tuple cache for hex parsing to eliminate substring / parsing allocations
 * during 60FPS canvas draw passes.
 */
const HEX_CACHE = new Map<string, [number, number, number]>()

/**
 * Parses a hex color string into an [r, g, b] tuple, caching parsed results.
 */
function parseHex(hex: string): [number, number, number] {
  const cached = HEX_CACHE.get(hex)
  if (cached) return cached

  let clean = hex.startsWith("#") ? hex.slice(1) : hex
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("")
  }
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)

  const rgb: [number, number, number] = [
    Number.isFinite(r) ? r : 0,
    Number.isFinite(g) ? g : 0,
    Number.isFinite(b) ? b : 0,
  ]

  HEX_CACHE.set(hex, rgb)
  return rgb
}

/**
 * Converts a hex color string (#RRGGBB or #RGB) into an rgba(r, g, b, a) CSS string.
 * Uses cached RGB values and bounds-checked alpha.
 */
export function rgba(hex: string, a: number): string {
  const [r, g, b] = parseHex(hex)
  const safeAlpha = clamp01(a)
  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`
}

/**
 * Resolves the transition effect origin from a clicked tile's bounding rect.
 * Falls back to viewport center ({ x: w / 2, h / 2 }) when rect is null or contains non-finite bounds.
 */
export function resolveOrigin(
  rect: OriginRect | null,
  w: number,
  h: number
): TransitionOrigin {
  const safeW = Number.isFinite(w) && w > 0 ? w : 0
  const safeH = Number.isFinite(h) && h > 0 ? h : 0

  if (
    !rect ||
    !Number.isFinite(rect.left) ||
    !Number.isFinite(rect.top) ||
    !Number.isFinite(rect.width) ||
    !Number.isFinite(rect.height)
  ) {
    return { x: safeW / 2, y: safeH / 2 }
  }

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}
