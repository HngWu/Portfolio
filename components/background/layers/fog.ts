import { LayerContext, lerpRGBA, rgbaToString, RGBA } from '../types'

const VOID_QUICK: Readonly<RGBA> = Object.freeze({ r: 5, g: 4, b: 9, a: 1 }) // #050409
const VOID_DEEP: Readonly<RGBA> = Object.freeze({ r: 6, g: 8, b: 14, a: 1 }) // #06080e
const LIGHT_WASH: Readonly<RGBA> = Object.freeze({ r: 250, g: 250, b: 252, a: 0.35 })
const LIGHT_WASH_STR = rgbaToString(LIGHT_WASH)

const TWILIGHT_INDIGO: Readonly<RGBA> = Object.freeze({ r: 26, g: 16, b: 60, a: 1 }) // #1A103C
const TWILIGHT_INDIGO_ZERO = rgbaToString(TWILIGHT_INDIGO, 0)

const LATITUDE_ROTATION = 0.384 // 22 degrees in radians

const LATITUDE_RATIOS: ReadonlyArray<readonly [number, number]> = Object.freeze([
  [0.7, 0.28],
  [1.1, 0.44],
  [1.5, 0.60],
])

// 512x512 Offscreen Radial Sprite Caching for moving nebulae
const SPRITE_SIZE = 512
const SPRITE_HALF = 256

interface RadialSpriteHolder {
  canvas: HTMLCanvasElement | null
  ctx: CanvasRenderingContext2D | null
  colorKey: string
}

const goldSpriteHolder: RadialSpriteHolder = { canvas: null, ctx: null, colorKey: '' }
const amethystSpriteHolder: RadialSpriteHolder = { canvas: null, ctx: null, colorKey: '' }
const veilSpriteHolder: RadialSpriteHolder = { canvas: null, ctx: null, colorKey: '' }

function getRadialSprite(holder: RadialSpriteHolder, color: RGBA): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null

  const colorKey = `${color.r},${color.g},${color.b}`
  if (holder.canvas && holder.ctx && holder.colorKey === colorKey) {
    return holder.canvas
  }

  if (!holder.canvas) {
    holder.canvas = document.createElement('canvas')
    holder.canvas.width = SPRITE_SIZE
    holder.canvas.height = SPRITE_SIZE
    holder.ctx = holder.canvas.getContext('2d')
  }

  const sCtx = holder.ctx
  if (!sCtx) return null

  sCtx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE)
  const grad = sCtx.createRadialGradient(SPRITE_HALF, SPRITE_HALF, 0, SPRITE_HALF, SPRITE_HALF, SPRITE_HALF)
  grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 1)`)
  grad.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`)
  grad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)

  sCtx.fillStyle = grad
  sCtx.beginPath()
  sCtx.arc(SPRITE_HALF, SPRITE_HALF, SPRITE_HALF, 0, Math.PI * 2)
  sCtx.fill()

  holder.colorKey = colorKey
  return holder.canvas
}

// Static foundational indigo mist cached gradient
let cachedIndigoGradient: CanvasGradient | null = null
let cachedIndigoWidth = 0
let cachedIndigoHeight = 0
let cachedIndigoCtx: CanvasRenderingContext2D | null = null

function getCachedIndigoGradient(
  c: CanvasRenderingContext2D,
  width: number,
  height: number
): CanvasGradient | null {
  if (
    cachedIndigoGradient &&
    cachedIndigoCtx === c &&
    cachedIndigoWidth === width &&
    cachedIndigoHeight === height
  ) {
    return cachedIndigoGradient
  }

  const cx0 = width * 0.5
  const cy0 = height * 0.5
  const r0 = Math.max(width, height) * 0.6
  const g0 = c.createRadialGradient(cx0, cy0, 0, cx0, cy0, r0)
  g0.addColorStop(0, rgbaToString(TWILIGHT_INDIGO, 1))
  g0.addColorStop(0.5, rgbaToString(TWILIGHT_INDIGO, 0.5))
  g0.addColorStop(1, TWILIGHT_INDIGO_ZERO)

  cachedIndigoGradient = g0
  cachedIndigoWidth = width
  cachedIndigoHeight = height
  cachedIndigoCtx = c

  return g0
}

// Deep Dive Arcane Edge Fog cached gradient
let cachedEdgeGradient: CanvasGradient | null = null
let cachedEdgeWidth = 0
let cachedEdgeHeight = 0
let cachedEdgeCtx: CanvasRenderingContext2D | null = null
let cachedEdgeColorKey = ''

function getCachedEdgeGradient(
  c: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: RGBA
): CanvasGradient | null {
  const colorKey = `${color.r},${color.g},${color.b}`
  if (
    cachedEdgeGradient &&
    cachedEdgeCtx === c &&
    cachedEdgeWidth === width &&
    cachedEdgeHeight === height &&
    cachedEdgeColorKey === colorKey
  ) {
    return cachedEdgeGradient
  }

  const cx = width * 0.5
  const cy = height * 0.5
  const rEdge = Math.max(50, Math.hypot(width, height) * 0.5)

  const gEdge = c.createRadialGradient(cx, cy, rEdge * 0.25, cx, cy, rEdge)
  gEdge.addColorStop(0, rgbaToString(color, 0))
  gEdge.addColorStop(0.6, rgbaToString(color, 0.35))
  gEdge.addColorStop(1, rgbaToString(color, 1))

  cachedEdgeGradient = gEdge
  cachedEdgeWidth = width
  cachedEdgeHeight = height
  cachedEdgeCtx = c
  cachedEdgeColorKey = colorKey

  return gEdge
}

/**
 * Renders atmospheric background void and ambient volumetric alchemical nebulae & armillary coordinate grid.
 * Quick Pitch: Lerps void color, displays 4 volumetric gas cores (Foundational Twilight Indigo Mist,
 * Molten Solar Gold Core, Arcane Amethyst Abyss Core, Quicksilver Mouse Veil), and renders celestial
 * armillary coordinate arcs (3 concentric latitude ellipses and 3 rotating meridian arcs).
 * Deep Dive: Renders a faint arcane-violet edge vignette against the deep indigo void.
 */
export function renderFog(ctx: LayerContext): void {
  const { ctx: c, width, height, time, mix, palette, pointer, reducedMotion } = ctx

  if (width <= 0 || height <= 0 || !Number.isFinite(width) || !Number.isFinite(height)) {
    return
  }

  c.save()

  // 1. Background Void Fill
  c.clearRect(0, 0, width, height)

  if (palette.isLight) {
    c.fillStyle = LIGHT_WASH_STR
    c.fillRect(0, 0, width, height)
  } else {
    const voidColor = lerpRGBA(VOID_QUICK, VOID_DEEP, mix)
    c.fillStyle = rgbaToString(voidColor)
    c.fillRect(0, 0, width, height)
  }

  // Freeze time offsets when reducedMotion is enabled
  const t = reducedMotion ? 0 : (Number.isFinite(time) ? time : 0)

  // 2. Quick Pitch Volumetric Alchemical Nebulae & Celestial Armillary Grid (mix < 0.85)
  if (mix < 0.85) {
    const quickFade = 1 - mix
    const lightMult = palette.isLight ? 0.5 : 1.0

    // Core 1: Foundational Twilight Indigo Mist (cached static gradient)
    const indigoAlpha = 0.12 * quickFade * lightMult
    if (indigoAlpha > 0.001) {
      const cx0 = width * 0.5
      const cy0 = height * 0.5
      const r0 = Math.max(width, height) * 0.6
      const g0 = getCachedIndigoGradient(c, width, height)
      if (g0) {
        c.save()
        c.globalAlpha = indigoAlpha
        c.fillStyle = g0
        c.beginPath()
        c.arc(cx0, cy0, r0, 0, Math.PI * 2)
        c.fill()
        c.restore()
      }
    }

    // Core 2: Molten Solar Gold Core (cached 512x512 radial sprite blit)
    const goldAlpha = 0.14 * quickFade * lightMult
    if (goldAlpha > 0.001) {
      const xGold = width * 0.72 + Math.sin(t * 0.12) * 30
      const yGold = height * 0.32 + Math.cos(t * 0.15) * 20
      const rGold = Math.max(20, Math.min(width, height) * 0.52)
      const accentSoft = palette.accentSoft ?? palette.accent
      const sprite = getRadialSprite(goldSpriteHolder, accentSoft)
      if (sprite) {
        c.save()
        c.globalAlpha = goldAlpha
        c.drawImage(sprite, xGold - rGold, yGold - rGold, 2 * rGold, 2 * rGold)
        c.restore()
      } else {
        const gGold = c.createRadialGradient(xGold, yGold, 0, xGold, yGold, rGold)
        gGold.addColorStop(0, rgbaToString(accentSoft, goldAlpha))
        gGold.addColorStop(0.5, rgbaToString(accentSoft, goldAlpha * 0.5))
        gGold.addColorStop(1, rgbaToString(accentSoft, 0))
        c.fillStyle = gGold
        c.beginPath()
        c.arc(xGold, yGold, rGold, 0, Math.PI * 2)
        c.fill()
      }
    }

    // Core 3: Arcane Amethyst Abyss Core (cached 512x512 radial sprite blit)
    const amethystAlpha = 0.12 * quickFade * lightMult
    if (amethystAlpha > 0.001) {
      const xAmethyst = width * 0.25 - Math.cos(t * 0.14) * 25
      const yAmethyst = height * 0.68 - Math.sin(t * 0.11) * 20
      const rAmethyst = Math.max(20, Math.min(width, height) * 0.48)
      const amethystColor = palette.secondaryAmethyst ?? palette.secondary ?? palette.accent
      const sprite = getRadialSprite(amethystSpriteHolder, amethystColor)
      if (sprite) {
        c.save()
        c.globalAlpha = amethystAlpha
        c.drawImage(sprite, xAmethyst - rAmethyst, yAmethyst - rAmethyst, 2 * rAmethyst, 2 * rAmethyst)
        c.restore()
      } else {
        const gAmethyst = c.createRadialGradient(xAmethyst, yAmethyst, 0, xAmethyst, yAmethyst, rAmethyst)
        gAmethyst.addColorStop(0, rgbaToString(amethystColor, amethystAlpha))
        gAmethyst.addColorStop(0.5, rgbaToString(amethystColor, amethystAlpha * 0.5))
        gAmethyst.addColorStop(1, rgbaToString(amethystColor, 0))
        c.fillStyle = gAmethyst
        c.beginPath()
        c.arc(xAmethyst, yAmethyst, rAmethyst, 0, Math.PI * 2)
        c.fill()
      }
    }

    // Core 4: Quicksilver Mouse Veil (cached 512x512 radial sprite blit)
    const veilAlpha = 0.05 * quickFade * lightMult
    if (veilAlpha > 0.001) {
      const px = pointer && pointer.active && Number.isFinite(pointer.x) ? pointer.x : width * 0.5
      const py = pointer && pointer.active && Number.isFinite(pointer.y) ? pointer.y : height * 0.5
      const rVeil = 320
      const accentBright = palette.accentBright ?? palette.accent
      const sprite = getRadialSprite(veilSpriteHolder, accentBright)
      if (sprite) {
        c.save()
        c.globalAlpha = veilAlpha
        c.drawImage(sprite, px - rVeil, py - rVeil, 2 * rVeil, 2 * rVeil)
        c.restore()
      } else {
        const gVeil = c.createRadialGradient(px, py, 0, px, py, rVeil)
        gVeil.addColorStop(0, rgbaToString(accentBright, veilAlpha))
        gVeil.addColorStop(0.5, rgbaToString(accentBright, veilAlpha * 0.5))
        gVeil.addColorStop(1, rgbaToString(accentBright, 0))
        c.fillStyle = gVeil
        c.beginPath()
        c.arc(px, py, rVeil, 0, Math.PI * 2)
        c.fill()
      }
    }

    // Celestial Armillary Coordinate Arcs
    const armillaryAlpha = 0.05 * quickFade * lightMult
    if (armillaryAlpha > 0.001) {
      c.save()
      const orreryX = width * 0.72
      const orreryY = height * 0.48
      const R = Math.max(10, Math.min(width, height) * 0.38)
      const accentSoft = palette.accentSoft ?? palette.accent

      c.strokeStyle = rgbaToString(accentSoft, armillaryAlpha)
      c.lineWidth = 0.7

      // 3 concentric latitude ellipses rotated by 22 deg (0.384 rad)
      for (const [rxRatio, ryRatio] of LATITUDE_RATIOS) {
        c.beginPath()
        c.ellipse(orreryX, orreryY, R * rxRatio, R * ryRatio, LATITUDE_ROTATION, 0, Math.PI * 2)
        c.stroke()
      }

      // 3 meridian longitude arcs that slowly rotate at omega ≈ 0.015 rad/s
      const meridianRot = reducedMotion ? 0 : t * 0.015
      for (let i = 0; i < 3; i++) {
        const startAngle = meridianRot + (i * Math.PI * 2) / 3
        c.beginPath()
        c.arc(orreryX, orreryY, R * 1.5, startAngle, startAngle + Math.PI * 0.6)
        c.stroke()
      }
      c.restore()
    }
  }

  // 3. Deep Dive Arcane Edge Fog (Vignette with cached static gradient)
  const deepAlpha = mix * (palette.isLight ? 0.03 : 0.07)
  if (deepAlpha > 0.001) {
    const violetColor = palette.secondaryAmethyst ?? palette.accentSoft ?? palette.accent
    const gEdge = getCachedEdgeGradient(c, width, height, violetColor)
    if (gEdge) {
      c.save()
      c.globalAlpha = deepAlpha
      c.fillStyle = gEdge
      c.fillRect(0, 0, width, height)
      c.restore()
    }
  }

  c.restore()
}
