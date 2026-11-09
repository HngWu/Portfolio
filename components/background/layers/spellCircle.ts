import { LayerContext, rgbaToString } from '../types'

/**
 * 12 Elder Futhark runes split into top and bottom cartouche rails:
 * Top (6 runes): ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ
 * Bottom (6 runes): ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ
 */
const RUNES_TOP = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ'] as const
const RUNES_BOTTOM = ['ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ'] as const

/**
 * Astrolabe Corner Quadrant Gear configuration:
 * Radius: 24px, 16 teeth miniature spur profile.
 * Precomputed at module scope for zero heap allocations during the render loop.
 */
const GEAR_RADIUS = 24
const GEAR_TEETH_COUNT = 16

interface GearToothPoint {
  readonly cos: number
  readonly sin: number
  readonly r: number
  readonly x: number
  readonly y: number
}

/**
 * Precomputed tooth profile with outer radius 24, inner pitch 19.5, root 17.5.
 */
const CORNER_GEAR_PROFILE: readonly GearToothPoint[] = (() => {
  const points: GearToothPoint[] = []
  const step = (Math.PI * 2) / GEAR_TEETH_COUNT
  const tipHalfWidth = step * 0.12
  const pitchHalfWidth = step * 0.22
  const rootHalfGap = step * 0.36

  for (let i = 0; i < GEAR_TEETH_COUNT; i++) {
    const midAngle = i * step
    const aRoot1 = midAngle - rootHalfGap
    const aPitch1 = midAngle - pitchHalfWidth
    const aTip1 = midAngle - tipHalfWidth
    const aTip2 = midAngle + tipHalfWidth
    const aPitch2 = midAngle + pitchHalfWidth
    const aRoot2 = midAngle + rootHalfGap

    const toothPoints = [
      { a: aRoot1, r: 17.5 },
      { a: aPitch1, r: 19.5 },
      { a: aTip1, r: 24.0 },
      { a: aTip2, r: 24.0 },
      { a: aPitch2, r: 19.5 },
      { a: aRoot2, r: 17.5 },
    ]

    for (let k = 0; k < toothPoints.length; k++) {
      const { a, r } = toothPoints[k]
      const cos = Math.cos(a)
      const sin = Math.sin(a)
      points.push({
        cos,
        sin,
        r,
        x: cos * r,
        y: sin * r,
      })
    }
  }
  return Object.freeze(points)
})()

/**
 * Corner definitions seated at the 4 astrolabe quadrant corners:
 * - TL: Fire △ (Clockwise rotation)
 * - TR: Air 🜁 (Counter-Clockwise rotation)
 * - BR: Water ▽ (Clockwise rotation)
 * - BL: Earth 🜃 (Counter-Clockwise rotation)
 */
interface CornerDef {
  readonly signX: number
  readonly signY: number
  readonly isCW: boolean
  readonly symbol: string
}

const CORNER_DEFS: readonly CornerDef[] = [
  { signX: -1, signY: -1, isCW: true, symbol: '△' }, // TL: Fire
  { signX: 1, signY: -1, isCW: false, symbol: '🜁' }, // TR: Air
  { signX: 1, signY: 1, isCW: true, symbol: '▽' }, // BR: Water
  { signX: -1, signY: 1, isCW: false, symbol: '🜃' }, // BL: Earth
] as const

const AMETHYST_DASH: number[] = [6, 6]
const EMPTY_DASH: number[] = []

/**
 * Draws a rounded rectangle path using standard canvas arc commands.
 */
function drawRoundedRect(
  c: CanvasRenderingContext2D,
  left: number,
  top: number,
  right: number,
  bottom: number,
  radius: number
): void {
  const r = Math.max(0, Math.min(radius, (right - left) * 0.5, (bottom - top) * 0.5))
  c.moveTo(left + r, top)
  c.lineTo(right - r, top)
  c.arc(right - r, top + r, r, -Math.PI / 2, 0)
  c.lineTo(right, bottom - r)
  c.arc(right - r, bottom - r, r, 0, Math.PI / 2)
  c.lineTo(left + r, bottom)
  c.arc(left + r, bottom - r, r, Math.PI / 2, Math.PI)
  c.lineTo(left, top + r)
  c.arc(left + r, top + r, r, Math.PI, Math.PI * 1.5)
  c.closePath()
}

/**
 * Renders the Conformal Celestial Cartouche & Astrolabe framing system around the hovered Bento tile:
 * - Conformal Cartouche Geometry hugging tile bounds with radius padding
 * - Astrolabe Corner Quadrant Gears (16-tooth, counter-meshing kinematics)
 * - Brass rivet bosses and 4 Cardinal Elemental Nodes (Fire △, Air 🜁, Water ▽, Earth 🜃)
 * - Outer Vernier Rail & Concentric Dashed Astrolabe Rail
 * - Vernier Micro-Ticks along horizontal and vertical rails
 * - Inscribed Elder Futhark Runes materializing progressively with hover intensity
 * - Concentric Cartouche Resonance Pulse Wave ripple
 *
 * Bails early in Deep Dive mode (mix > 0.85) or when hover intensity is near zero.
 */
export function renderSpellCircle(ctx: LayerContext): void {
  if (
    ctx.mix > 0.85 ||
    ctx.tile.intensity <= 0.005 ||
    !ctx.tile.rect ||
    ctx.width <= 0 ||
    ctx.height <= 0
  ) {
    return
  }

  const { rect, intensity } = ctx.tile
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return
  }

  const baseAlpha = (1 - ctx.mix) * intensity * (ctx.palette.isLight ? 0.35 : 0.75)
  if (baseAlpha <= 0.001) {
    return
  }

  const { ctx: c, palette, time, reducedMotion, config } = ctx
  const safeTime = Number.isFinite(time) ? time : 0

  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  c.save()
  c.translate(cx, cy)

  const pad = config?.intensity?.spellCircleRadiusPadding
    ? Math.min(config.intensity.spellCircleRadiusPadding, 24)
    : 20
  const halfW = rect.width * 0.5 + pad
  const halfH = rect.height * 0.5 + pad

  const secondaryColor = palette.secondaryAmethyst ?? palette.accentSoft ?? palette.accent

  // -------------------------------------------------------------
  // 1. Conformal Vernier Rail & Concentric Dashed Astrolabe Rail
  // -------------------------------------------------------------
  // Outer Vernier Rail
  c.beginPath()
  drawRoundedRect(c, -halfW, -halfH, halfW, halfH, GEAR_RADIUS)
  c.strokeStyle = rgbaToString(palette.accent, baseAlpha * 0.4)
  c.lineWidth = 1.0
  c.stroke()

  // Inner Dashed Astrolabe Rail (inset by 4px)
  const innerHalfW = halfW - 4
  const innerHalfH = halfH - 4
  const innerR = Math.max(1, GEAR_RADIUS - 4)

  c.beginPath()
  drawRoundedRect(c, -innerHalfW, -innerHalfH, innerHalfW, innerHalfH, innerR)
  c.setLineDash(AMETHYST_DASH)
  c.strokeStyle = rgbaToString(secondaryColor, baseAlpha * 0.5)
  c.lineWidth = 1.0
  c.stroke()
  c.setLineDash(EMPTY_DASH)

  // -------------------------------------------------------------
  // 2. Vernier Micro-Ticks (Inward every 12px, major every 36px)
  // -------------------------------------------------------------
  c.beginPath()
  const tickStep = 12
  const startX = -halfW + GEAR_RADIUS
  const endX = halfW - GEAR_RADIUS
  for (let x = startX + tickStep, idx = 1; x <= endX - tickStep * 0.5; x += tickStep, idx++) {
    const isMajor = idx % 3 === 0
    const tickLen = isMajor ? 6 : 3
    c.moveTo(x, -halfH)
    c.lineTo(x, -halfH + tickLen)
    c.moveTo(x, halfH)
    c.lineTo(x, halfH - tickLen)
  }

  const startY = -halfH + GEAR_RADIUS
  const endY = halfH - GEAR_RADIUS
  for (let y = startY + tickStep, idx = 1; y <= endY - tickStep * 0.5; y += tickStep, idx++) {
    const isMajor = idx % 3 === 0
    const tickLen = isMajor ? 6 : 3
    c.moveTo(-halfW, y)
    c.lineTo(-halfW + tickLen, y)
    c.moveTo(halfW, y)
    c.lineTo(halfW - tickLen, y)
  }
  c.strokeStyle = rgbaToString(palette.accent, baseAlpha * 0.35)
  c.lineWidth = 0.8
  c.stroke()

  // -------------------------------------------------------------
  // 3. Astrolabe Corner Quadrant Gears & Brass Rivet Bosses
  // -------------------------------------------------------------
  const rotCW = reducedMotion ? 0 : safeTime * 0.5
  const rotCCW = reducedMotion ? 0 : -safeTime * 0.5

  for (let i = 0; i < CORNER_DEFS.length; i++) {
    const corner = CORNER_DEFS[i]
    const gx = corner.signX * (halfW - GEAR_RADIUS)
    const gy = corner.signY * (halfH - GEAR_RADIUS)
    const rot = corner.isCW ? rotCW : rotCCW

    // Rotating gear teeth & spokes
    c.save()
    c.translate(gx, gy)
    c.rotate(rot)

    c.beginPath()
    c.moveTo(CORNER_GEAR_PROFILE[0].x, CORNER_GEAR_PROFILE[0].y)
    for (let j = 1; j < CORNER_GEAR_PROFILE.length; j++) {
      c.lineTo(CORNER_GEAR_PROFILE[j].x, CORNER_GEAR_PROFILE[j].y)
    }
    c.closePath()

    // Pitch circle and 4 cross-spokes
    c.moveTo(19.5, 0)
    c.arc(0, 0, 19.5, 0, Math.PI * 2)
    c.moveTo(-17.5, 0)
    c.lineTo(17.5, 0)
    c.moveTo(0, -17.5)
    c.lineTo(0, 17.5)

    c.strokeStyle = rgbaToString(secondaryColor, baseAlpha * 0.6)
    c.lineWidth = 1.0
    c.stroke()
    c.restore()

    // Brass rivet boss (r = 4.5)
    c.beginPath()
    c.arc(gx, gy, 4.5, 0, Math.PI * 2)
    c.fillStyle = rgbaToString(palette.accent, baseAlpha * 0.2)
    c.fill()
    c.strokeStyle = rgbaToString(palette.accentBright, baseAlpha * 0.8)
    c.lineWidth = 1.0
    c.stroke()

    // Cardinal Elemental Node glyph (△, 🜁, ▽, 🜃)
    c.font = '9px "Segoe UI Historic", serif'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillStyle = rgbaToString(palette.accentBright, baseAlpha * 0.9)
    c.fillText(corner.symbol, gx, gy)
  }

  // -------------------------------------------------------------
  // 4. Inscribed Elder Futhark Runes
  // -------------------------------------------------------------
  c.font = '12px NotoSansRunic-Regular, "Segoe UI Historic", serif'
  c.textAlign = 'center'
  c.textBaseline = 'middle'

  const runeStartX = -halfW + GEAR_RADIUS + 12
  const runeEndX = halfW - GEAR_RADIUS - 12
  const runeSpan = runeEndX - runeStartX

  // Top runes along y = -halfH
  for (let i = 0; i < 6; i++) {
    const threshold = i / 6
    const runeProgress = Math.min(1, Math.max(0, (intensity * 1.25 - threshold) * 6))
    if (runeProgress > 0.01) {
      const rx = runeSpan > 0 ? runeStartX + (i / 5) * runeSpan : 0
      c.fillStyle = rgbaToString(palette.accentBright, baseAlpha * runeProgress)
      c.fillText(RUNES_TOP[i], rx, -halfH)
    }
  }

  // Bottom runes along y = halfH
  for (let i = 0; i < 6; i++) {
    const threshold = i / 6
    const runeProgress = Math.min(1, Math.max(0, (intensity * 1.25 - threshold) * 6))
    if (runeProgress > 0.01) {
      const rx = runeSpan > 0 ? runeStartX + (i / 5) * runeSpan : 0
      c.fillStyle = rgbaToString(palette.accentBright, baseAlpha * runeProgress)
      c.fillText(RUNES_BOTTOM[i], rx, halfH)
    }
  }

  // -------------------------------------------------------------
  // 5. Concentric Cartouche Resonance Pulse Wave
  // -------------------------------------------------------------
  if (!reducedMotion && intensity > 0.05) {
    const pulsePhase = (safeTime * 1.2) % 1.0
    const expand = pulsePhase * 16
    const pulseAlpha = baseAlpha * 0.25 * (1 - pulsePhase)
    if (pulseAlpha > 0.005) {
      const pulseHalfW = halfW + expand
      const pulseHalfH = halfH + expand
      const pulseR = GEAR_RADIUS + expand
      c.beginPath()
      drawRoundedRect(c, -pulseHalfW, -pulseHalfH, pulseHalfW, pulseHalfH, pulseR)
      c.strokeStyle = rgbaToString(secondaryColor, pulseAlpha)
      c.lineWidth = 1.0
      c.stroke()
    }
  }

  c.restore()
}
