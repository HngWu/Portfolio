import { LayerContext, lerpRGBA, rgbaToString } from '../types'

/**
 * 12 Elder Futhark runes that materialize sequentially clockwise as hover intensity rises.
 */
const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ'] as const

/**
 * 4 Cardinal Elemental Nodes inscribed at outer vertices:
 * North (270° / -π/2): △ Fire
 * East (0°): 🜁 Air
 * South (90° / π/2): ▽ Water
 * West (180° / π): 🜃 Earth
 */
interface ElementalNode {
  readonly s: string
  readonly a: number
}

const ELEMENTAL_NODES: readonly ElementalNode[] = [
  { s: '△', a: -Math.PI / 2 },
  { s: '🜁', a: 0 },
  { s: '▽', a: Math.PI / 2 },
  { s: '🜃', a: Math.PI },
] as const

/**
 * Precomputed 16 points for the 8-pointed octagram star polygon (outer 0.88, inner 0.72)
 * alternating at intervals of π/8 at module scope for zero-allocation rendering.
 */
interface OctagramPoint {
  readonly x: number
  readonly y: number
}

const OCTAGRAM_POINTS_16: readonly OctagramPoint[] = (() => {
  const points: OctagramPoint[] = []
  for (let j = 0; j < 16; j++) {
    const angle = (j * Math.PI) / 8
    const r = j % 2 === 0 ? 0.88 : 0.72
    points.push({
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
    })
  }
  return Object.freeze(points)
})()

/**
 * 48 perimeter vernier degree micro-ticks along outer ring (1.00R).
 */
const TICKS_COUNT = 48
interface TickCoordinate {
  readonly cos: number
  readonly sin: number
  readonly innerR: number
  readonly outerR: number
}

const TICKS_COORDINATES: readonly TickCoordinate[] = (() => {
  const ticks: TickCoordinate[] = []
  for (let k = 0; k < TICKS_COUNT; k++) {
    const angle = (k * Math.PI * 2) / TICKS_COUNT
    const isMajor = k % 6 === 0
    ticks.push({
      cos: Math.cos(angle),
      sin: Math.sin(angle),
      innerR: isMajor ? 0.95 : 0.97,
      outerR: 1.0,
    })
  }
  return Object.freeze(ticks)
})()

const AMETHYST_DASH: number[] = [6, 6]
const EMPTY_DASH: number[] = []

// Static trail offsets and alphas for the comet spark to avoid runtime allocations
const TRAIL_OFFSETS = [0.0698, 0.1396, 0.2094] as const // 4°, 8°, 12° in rad
const TRAIL_SIZES = [2.0, 1.4, 0.9] as const
const TRAIL_ALPHAS = [0.65, 0.4, 0.2] as const

/**
 * Renders a 4-Tier Sacred Transmutation Seal Mandala around the hovered Bento tile:
 * - Tier 1: Outer Sweeping Solar Arc with 48 Vernier Ticks and Radiant Comet Tip
 * - Tier 2: Counter-Rotating 8-Pointed Octagram Star with 4 Cardinal Elemental Nodes
 * - Tier 3: 12 Sequential Elder Futhark Runes Materializing with Hover Intensity
 * - Tier 4: Concentric Resonance Pulse Wave Ripple
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
  const radiusPadding = config?.intensity?.spellCircleRadiusPadding || 28
  const radius = Math.hypot(rect.width, rect.height) * 0.5 + radiusPadding

  // Safe palette fallback
  const secondaryColor = palette.secondaryAmethyst ?? palette.accentSoft ?? palette.accent
  const goldColor = lerpRGBA(palette.accent, palette.accentBright, 0.7)

  const outerSpeed = 0.45
  const innerSpeed = 0.35
  const runeSpinSpeed = 0.15

  const outerRotation = reducedMotion ? 0 : safeTime * outerSpeed
  const innerRotation = reducedMotion ? 0 : -safeTime * innerSpeed
  const runeRotation = reducedMotion ? 0 : safeTime * runeSpinSpeed

  c.save()
  c.translate(cx, cy)

  // -------------------------------------------------------------
  // 1. Sweeping Outer Gold Arc & 48 Vernier Micro-Ticks
  // -------------------------------------------------------------
  const sweepAngle = Math.PI * 2 * Math.min(1, intensity * 1.2)

  c.save()
  c.rotate(outerRotation)

  // 48 perimeter vernier micro-ticks drawn in a single path
  c.beginPath()
  for (let k = 0; k < TICKS_COUNT; k++) {
    const t = TICKS_COORDINATES[k]
    c.moveTo(t.cos * radius * t.innerR, t.sin * radius * t.innerR)
    c.lineTo(t.cos * radius * t.outerR, t.sin * radius * t.outerR)
  }
  c.strokeStyle = rgbaToString(palette.accent, baseAlpha * 0.35)
  c.lineWidth = 0.8
  c.stroke()

  // Faint guide circle
  c.beginPath()
  c.arc(0, 0, radius, 0, Math.PI * 2)
  c.strokeStyle = rgbaToString(palette.accent, baseAlpha * 0.2)
  c.lineWidth = 1.0
  c.stroke()

  // Active sweeping arc
  if (sweepAngle > 0.001) {
    c.beginPath()
    c.arc(0, 0, radius, 0, sweepAngle)
    c.strokeStyle = rgbaToString(goldColor, baseAlpha)
    c.lineWidth = 1.8
    c.stroke()

    // Leading glowing comet spark at the sweep tip
    if (sweepAngle > 0.05) {
      const tipX = Math.cos(sweepAngle) * radius
      const tipY = Math.sin(sweepAngle) * radius

      c.beginPath()
      c.arc(tipX, tipY, 3.0, 0, Math.PI * 2)
      c.fillStyle = rgbaToString(palette.accentBright, baseAlpha)
      c.shadowColor = rgbaToString(palette.accentBright, baseAlpha)
      c.shadowBlur = 8
      c.fill()
      c.shadowBlur = 0

      // Trailing spark motes (spaced by 4°, 8°, 12° behind tip)
      if (!reducedMotion) {
        for (let t = 0; t < TRAIL_OFFSETS.length; t++) {
          const trailAngle = sweepAngle - TRAIL_OFFSETS[t]
          if (trailAngle > 0) {
            const tx = Math.cos(trailAngle) * radius
            const ty = Math.sin(trailAngle) * radius
            c.beginPath()
            c.arc(tx, ty, TRAIL_SIZES[t], 0, Math.PI * 2)
            c.fillStyle = rgbaToString(palette.accentBright, baseAlpha * TRAIL_ALPHAS[t])
            c.fill()
          }
        }
      }
    }
  }

  c.restore()

  // -------------------------------------------------------------
  // 2. Counter-Rotating 8-Pointed Octagram & 4 Elemental Nodes
  // -------------------------------------------------------------
  const innerRadius = radius * 0.88

  c.save()
  c.rotate(innerRotation)

  // Rotating dashed amethyst inner ring
  c.beginPath()
  c.arc(0, 0, innerRadius, 0, Math.PI * 2)
  c.setLineDash(AMETHYST_DASH)
  c.strokeStyle = rgbaToString(secondaryColor, baseAlpha * 0.85)
  c.lineWidth = 1.2
  c.stroke()
  c.setLineDash(EMPTY_DASH)

  // Inscribed counter-rotating 8-pointed octagram star polygon
  c.beginPath()
  c.moveTo(OCTAGRAM_POINTS_16[0].x * radius, OCTAGRAM_POINTS_16[0].y * radius)
  for (let j = 1; j < OCTAGRAM_POINTS_16.length; j++) {
    c.lineTo(OCTAGRAM_POINTS_16[j].x * radius, OCTAGRAM_POINTS_16[j].y * radius)
  }
  c.closePath()
  c.strokeStyle = rgbaToString(secondaryColor, baseAlpha * 0.65)
  c.lineWidth = 1.0
  c.stroke()

  // 4 Cardinal Elemental Nodes (△ Fire, 🜁 Air, ▽ Water, 🜃 Earth)
  for (let n = 0; n < ELEMENTAL_NODES.length; n++) {
    const node = ELEMENTAL_NODES[n]
    const nx = Math.cos(node.a) * innerRadius
    const ny = Math.sin(node.a) * innerRadius

    // Circular boss (r ≈ 5px)
    c.beginPath()
    c.arc(nx, ny, 5, 0, Math.PI * 2)
    c.fillStyle = rgbaToString(palette.accent, baseAlpha * 0.15)
    c.fill()
    c.strokeStyle = rgbaToString(secondaryColor, baseAlpha * 0.8)
    c.lineWidth = 1.0
    c.stroke()

    // Centered elemental glyph
    c.save()
    c.translate(nx, ny)
    c.font = '9px "Segoe UI Historic", serif'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillStyle = rgbaToString(palette.accentBright, baseAlpha * 0.9)
    c.fillText(node.s, 0, 0)
    c.restore()
  }

  c.restore()

  // -------------------------------------------------------------
  // 3. Perimeter Elder Futhark Runes (12 Runes, Sequential)
  // -------------------------------------------------------------
  const runeRadius = radius * 0.94
  const runeCount = RUNES.length
  c.font = '12px NotoSansRunic-Regular, "Segoe UI Historic", serif'
  c.textAlign = 'center'
  c.textBaseline = 'middle'

  for (let i = 0; i < runeCount; i++) {
    const threshold = i / runeCount
    const runeProgress = Math.min(1, Math.max(0, (intensity * 1.25 - threshold) * runeCount))
    if (runeProgress <= 0.01) {
      continue
    }

    const angle = (i * Math.PI * 2) / runeCount + runeRotation

    c.save()
    c.rotate(angle)
    c.translate(0, -runeRadius)
    c.fillStyle = rgbaToString(palette.accentBright, baseAlpha * runeProgress)
    c.fillText(RUNES[i], 0, 0)
    c.restore()
  }

  // -------------------------------------------------------------
  // 4. Concentric Resonance Pulse Wave Ripple
  // -------------------------------------------------------------
  if (!reducedMotion && intensity > 0.05) {
    const pulsePhase = (safeTime * 1.2) % 1.0
    const pulseRadius = radius * (0.85 + pulsePhase * 0.35)
    const pulseAlpha = baseAlpha * 0.25 * (1 - pulsePhase)
    if (pulseAlpha > 0.005) {
      c.beginPath()
      c.arc(0, 0, pulseRadius, 0, Math.PI * 2)
      c.strokeStyle = rgbaToString(secondaryColor, pulseAlpha)
      c.lineWidth = 1.0
      c.stroke()
    }
  }

  c.restore()
}
