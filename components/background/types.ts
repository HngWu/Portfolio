/**
 * Mode-Aware Arcane Background Types and Color Utilities
 */

export interface RGB {
  r: number
  g: number
  b: number
}

export interface RGBA extends RGB {
  a: number
}

export interface RuntimePalette {
  accent: RGBA
  accentBright: RGBA
  accentDeep: RGBA
  accentSoft: RGBA
  glowRgb: RGB
  secondaryAmethyst: RGBA
  secondary?: RGBA
  lumePrimary: RGBA
  lumeSecondary: RGBA
  isLight: boolean
}

export interface ArcanePointer {
  x: number
  y: number
  targetX: number
  targetY: number
  active: boolean
  isCoarse: boolean
}

export interface ArcaneTrailPoint {
  x: number
  y: number
  alpha: number
}

export interface TileTrackingState {
  rect: DOMRect | null
  targetRect: DOMRect | null
  intensity: number
  targetIntensity: number
  tileId: string | null
}

export interface ArcaneConfig {
  density: {
    dustCount: number
    runeCount: number
    maxPulses: number
    hexRadius: number
  }
  intensity: {
    lanternRadius: number
    lanternFalloff: number
    lightThemeAlphaMult: number
    trailFadeSpeed: number
    spellCircleRadiusPadding: number
  }
  speed: {
    sigilRotationSpeed: number
    dustRiseSpeed: number
    pulseSpeed: number
    morphDurationMs: number
    cursorLerp: number
  }
  stretch: {
    enableRuneCascade: boolean
    enableCrystalOverload: boolean
  }
}

export interface HexCenter {
  x: number
  y: number
  col: number
  row: number
  isCrystal: boolean
}

export interface LayerContext {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  dpr: number
  time: number
  dt: number
  mix: number // 0 = Quick Pitch, 1 = Deep Dive
  palette: RuntimePalette
  pointer: ArcanePointer
  trail: ArcaneTrailPoint[]
  tile: TileTrackingState
  reducedMotion: boolean
  config: ArcaneConfig
  hexLatticePath: Path2D | null
  hexCenters: HexCenter[]
}

export const DEFAULT_CONFIG: ArcaneConfig = {
  density: {
    dustCount: 110,
    runeCount: 36,
    maxPulses: 24,
    hexRadius: 36,
  },
  intensity: {
    lanternRadius: 180,
    lanternFalloff: 0.85,
    lightThemeAlphaMult: 0.5,
    trailFadeSpeed: 0.04,
    spellCircleRadiusPadding: 32,
  },
  speed: {
    sigilRotationSpeed: 0.0006,
    dustRiseSpeed: 24,
    pulseSpeed: 1.2,
    morphDurationMs: 700,
    cursorLerp: 0.12,
  },
  stretch: {
    enableRuneCascade: true,
    enableCrystalOverload: true,
  },
}

const DEFAULT_FALLBACK: Readonly<RGBA> = Object.freeze({ r: 255, g: 255, b: 255, a: 1 })

/**
 * Parses hex strings (#fff, #ffffff, #ffffffff), rgb/rgba strings (rgb(r, g, b), rgba(r, g, b, a)),
 * or bare triplets ("255, 255, 255") to an RGBA object.
 */
export function parseColorToRGBA(colorStr: string | null | undefined, fallback: RGBA = DEFAULT_FALLBACK): RGBA {
  if (!colorStr) return { ...fallback }

  const s = colorStr.trim().toLowerCase()

  // Hex format: #rgb, #rgba, #rrggbb, #rrggbbaa
  if (s.startsWith('#')) {
    const hex = s.slice(1)
    if (!/^[0-9a-fA-F]+$/.test(hex)) return { ...fallback }

    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16)
      const g = parseInt(hex[1] + hex[1], 16)
      const b = parseInt(hex[2] + hex[2], 16)
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
        return { r, g, b, a: 1 }
      }
    } else if (hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16)
      const g = parseInt(hex[1] + hex[1], 16)
      const b = parseInt(hex[2] + hex[2], 16)
      const a = parseInt(hex[3] + hex[3], 16) / 255
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b) && !Number.isNaN(a)) {
        return { r, g, b, a: Math.round(a * 1000) / 1000 }
      }
    } else if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
        return { r, g, b, a: 1 }
      }
    } else if (hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      const a = parseInt(hex.slice(6, 8), 16) / 255
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b) && !Number.isNaN(a)) {
        return { r, g, b, a: Math.round(a * 1000) / 1000 }
      }
    }
    return { ...fallback }
  }

  // Functional rgb() or rgba() format
  const rgbMatch = s.match(/^rgba?\s*\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/i)
  if (rgbMatch) {
    const r = Math.round(Math.max(0, Math.min(255, parseFloat(rgbMatch[1]))))
    const g = Math.round(Math.max(0, Math.min(255, parseFloat(rgbMatch[2]))))
    const b = Math.round(Math.max(0, Math.min(255, parseFloat(rgbMatch[3]))))
    let a = 1
    if (rgbMatch[4] !== undefined) {
      if (rgbMatch[4].endsWith('%')) {
        a = parseFloat(rgbMatch[4]) / 100
      } else {
        a = parseFloat(rgbMatch[4])
      }
      a = Math.max(0, Math.min(1, a))
    }
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b) && !Number.isNaN(a)) {
      return { r, g, b, a: Math.round(a * 1000) / 1000 }
    }
  }

  // Bare triplet: "255, 255, 255" or "255 255 255"
  const tripletMatch = s.match(/^([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)$/)
  if (tripletMatch) {
    const r = Math.round(Math.max(0, Math.min(255, parseFloat(tripletMatch[1]))))
    const g = Math.round(Math.max(0, Math.min(255, parseFloat(tripletMatch[2]))))
    const b = Math.round(Math.max(0, Math.min(255, parseFloat(tripletMatch[3]))))
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
      return { r, g, b, a: 1 }
    }
  }

  return { ...fallback }
}

/**
 * Alias for parseColorToRGBA for backwards-compatibility or alternative naming.
 */
export const hexOrRgbToRgba = parseColorToRGBA

/**
 * Linearly interpolates between two RGBA colors.
 */
export function lerpRGBA(a: RGBA, b: RGBA, t: number): RGBA {
  const safeT = Number.isFinite(t) ? Math.max(0, Math.min(1, t)) : 0
  return {
    r: Math.round(a.r + (b.r - a.r) * safeT),
    g: Math.round(a.g + (b.g - a.g) * safeT),
    b: Math.round(a.b + (b.b - a.b) * safeT),
    a: Math.round((a.a + (b.a - a.a) * safeT) * 1000) / 1000,
  }
}

/**
 * Formats an RGBA object into a CSS rgba(...) string with an optional alpha override.
 */
export function rgbaToString(c: RGBA, alphaOverride?: number): string {
  const alpha =
    alphaOverride !== undefined && Number.isFinite(alphaOverride)
      ? Math.max(0, Math.min(1, alphaOverride))
      : c.a
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`
}

export interface GearToothPoint {
  x: number
  y: number
}

export interface PlanetaryOrbitConfig {
  symbol: string
  name: string
  radiusRatio: number
  angularSpeed: number
  initialAngle: number
  dotRadius: number
  colorToken: "accent" | "amethyst" | "bright"
}

export interface OrreryRenderState {
  needleAngle: number
  targetNeedleAngle: number
}

/**
 * Calculates the shortest signed angular difference to rotate from `current` to `target`.
 * Properly handles wrap-around boundaries and multi-turn angular differences.
 * Returns a value in the range [-PI, PI].
 */
export function getShortestAngleDelta(current: number, target: number): number {
  const twoPi = Math.PI * 2
  let diff = (target - current) % twoPi
  if (diff > Math.PI) diff -= twoPi
  if (diff < -Math.PI) diff += twoPi
  return diff
}

/**
 * Precomputes radial coordinates for involute gear teeth around a circle.
 *
 * @param toothCount Total number of teeth around the gear circumference (minimum 3).
 * @param rootRadius Radial distance to the tooth root valley.
 * @param tipRadius Radial distance to the outer crest of each tooth.
 * @returns Array of GearToothPoint (4 points per tooth: rootL, tipL, tipR, rootR).
 */
export function computeGearToothCoordinates(
  toothCount: number,
  rootRadius: number,
  tipRadius: number
): GearToothPoint[] {
  const count = Math.max(3, Math.floor(toothCount))
  const points: GearToothPoint[] = []
  const step = (Math.PI * 2) / count
  const halfStep = step * 0.5
  const tipWidth = step * 0.22
  const rootGapWidth = step * 0.28

  for (let i = 0; i < count; i++) {
    const midAngle = i * step
    const aRoot1 = midAngle - halfStep + rootGapWidth * 0.5
    const aTip1 = midAngle - tipWidth * 0.5
    const aTip2 = midAngle + tipWidth * 0.5
    const aRoot2 = midAngle + halfStep - rootGapWidth * 0.5

    points.push({ x: Math.cos(aRoot1) * rootRadius, y: Math.sin(aRoot1) * rootRadius })
    points.push({ x: Math.cos(aTip1) * tipRadius, y: Math.sin(aTip1) * tipRadius })
    points.push({ x: Math.cos(aTip2) * tipRadius, y: Math.sin(aTip2) * tipRadius })
    points.push({ x: Math.cos(aRoot2) * rootRadius, y: Math.sin(aRoot2) * rootRadius })
  }
  return points
}

