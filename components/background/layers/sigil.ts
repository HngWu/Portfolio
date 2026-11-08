import { LayerContext, rgbaToString, computeGearToothCoordinates, PlanetaryOrbitConfig, getShortestAngleDelta } from '../types'

const ELDER_FUTHARK = [
  'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ',
  'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ',
  'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ',
] as const

const POINT_CENTER = { x: 0, y: 0 }
const POINT_TILE = { x: 0, y: 0 }

const UNIT_SPUR_TEETH_24 = computeGearToothCoordinates(24, 0.66, 0.74)
const DASH_AMETHYST = [3, 4]
const DASH_SOLID: number[] = []

let currentNeedleAngle = -Math.PI / 2

/**
 * Renders the Sacred Celestial Orrery Sigil (4 Harmonic Tiers) & Ley-Line Conduit.
 * Fades out and scales down as mix approaches 0.85 (Deep Dive mode).
 */
export function renderSigil(ctx: LayerContext): void {
  // 1. Early exit when ctx.mix > 0.85 || ctx.width <= 0 || ctx.height <= 0
  if (ctx.mix > 0.85 || ctx.width <= 0 || ctx.height <= 0) {
    return
  }

  // 2. Compute morph scale and opacity
  const morphScale = 1.0 - 0.15 * ctx.mix
  const morphAlpha = Math.max(0, 1.0 - ctx.mix / 0.85)
  const alpha = morphAlpha * (ctx.palette.isLight ? 0.08 : 0.16)
  if (alpha <= 0.001) {
    return
  }

  const { ctx: c, width, height, time, palette, pointer, tile, reducedMotion } = ctx

  // 3. Anchor orrery at cx = width * 0.72, cy = height * 0.48, clamped between 260 and 480
  const cx = width * 0.72
  const cy = height * 0.48
  const baseR = Math.max(260, Math.min(480, Math.min(width, height) * 0.38))

  // 4. Scale by R = baseR * morphScale
  const R = baseR * morphScale

  // 5. Hoist color strings
  const goldColor = rgbaToString(palette.accent, 1.0)
  const secondary = palette.secondary ?? palette.secondaryAmethyst ?? palette.accent
  const amethystColor = rgbaToString(secondary, 1.0)
  const brightColor = rgbaToString(palette.accentBright, 1.0)

  // 6. Calculate angles
  const safeTime = Number.isFinite(time) ? time : 0
  const outerAngle = reducedMotion ? 0 : safeTime * 0.045
  const gearAngle = reducedMotion ? 0 : -safeTime * 0.056

  // 7. Calculate needleAngle
  if (reducedMotion) {
    currentNeedleAngle = -Math.PI / 2
  } else {
    const targetAngle =
      pointer.active && !pointer.isCoarse
        ? Math.atan2(pointer.y - cy, pointer.x - cx)
        : -Math.PI / 2 + Math.sin(safeTime * 0.8) * 0.08
    const delta = getShortestAngleDelta(currentNeedleAngle, targetAngle)
    const dtSafe = Math.max(0.001, Math.min(ctx.dt, 0.1))
    const lerpFactor = 1 - Math.exp(-dtSafe * 4.5)
    currentNeedleAngle += delta * lerpFactor
  }

  POINT_CENTER.x = cx
  POINT_CENTER.y = cy

  // 8. Ley-Line Conduit
  if (tile.intensity > 0.005 && tile.rect) {
    POINT_TILE.x = tile.rect.left + tile.rect.width / 2
    POINT_TILE.y = tile.rect.top + tile.rect.height / 2
    renderLeyLineConduit(c, POINT_CENTER, POINT_TILE, tile.intensity, safeTime, goldColor, alpha, reducedMotion)
  }

  // 9. Center transformation: Compose 4 tiers
  c.save()
  c.translate(cx, cy)

  // Tier 1: Outer Zodiac Ring (Clockwise Rotation)
  c.save()
  c.rotate(outerAngle)

  // Guideline circles
  c.beginPath()
  c.arc(0, 0, R, 0, Math.PI * 2)
  c.strokeStyle = goldColor
  c.lineWidth = 1.2 * morphScale
  c.globalAlpha = 0.8 * alpha
  c.stroke()

  c.beginPath()
  c.arc(0, 0, R * 0.95, 0, Math.PI * 2)
  c.strokeStyle = goldColor
  c.lineWidth = 0.8 * morphScale
  c.globalAlpha = 0.45 * alpha
  c.stroke()

  c.beginPath()
  c.arc(0, 0, R * 0.84, 0, Math.PI * 2)
  c.strokeStyle = goldColor
  c.lineWidth = 1.0 * morphScale
  c.globalAlpha = 0.75 * alpha
  c.stroke()

  // 48 ray ticks
  c.beginPath()
  for (let i = 0; i < 48; i++) {
    const angle = (i * 2 * Math.PI) / 48
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const isMajor = i % 4 === 0
    const rStart = isMajor ? R * 0.935 : R * 0.96
    c.moveTo(cos * rStart, sin * rStart)
    c.lineTo(cos * R, sin * R)
  }
  c.strokeStyle = goldColor
  c.lineWidth = 0.9 * morphScale
  c.globalAlpha = 0.7 * alpha
  c.stroke()

  // 24 runes rotated by outerAngle
  const rRune = R * 0.895
  const runeFontSize = Math.max(10, Math.round(14 * morphScale))
  c.font = `${runeFontSize}px NotoSansRunic-Regular, serif`
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillStyle = brightColor
  c.globalAlpha = 0.9 * alpha

  for (let i = 0; i < 24; i++) {
    const angle = (i * 2 * Math.PI) / 24
    c.save()
    c.rotate(angle)
    c.translate(0, -rRune)
    c.fillText(ELDER_FUTHARK[i], 0, 0)
    c.restore()
  }

  c.restore() // End Tier 1

  // Tier 2: Spur Gear Rim
  renderOrreryGear(c, R, gearAngle, goldColor, amethystColor, alpha)

  // Tier 3: Planetary Epicycles
  renderPlanetaryEpicycles(c, R, safeTime, pointer, POINT_CENTER, goldColor, amethystColor, brightColor, alpha, reducedMotion)

  // Tier 4: Compass Needle
  renderCompassNeedle(c, R, currentNeedleAngle, goldColor, amethystColor, alpha)

  c.restore() // End Center Transform
}



/**
 * Renders Tier 2: Machined spur gear ring with involute teeth and spoke cutouts.
 * Counter-rotates to simulate mechanical engagement with the celestial astrolabe.
 */
export function renderOrreryGear(
  c: CanvasRenderingContext2D,
  radius: number,
  rotationAngle: number,
  goldColor: string,
  amethystColor: string,
  alphaMult: number
): void {
  const safeAlpha = Math.max(0, Math.min(1, alphaMult))
  if (radius <= 0 || !Number.isFinite(radius) || safeAlpha <= 0.001) {
    return
  }

  c.save()
  c.rotate(rotationAngle)

  // 1. 24-tooth gear contour (root: 0.66R, tip: 0.74R)
  c.beginPath()
  if (UNIT_SPUR_TEETH_24.length > 0) {
    c.moveTo(UNIT_SPUR_TEETH_24[0].x * radius, UNIT_SPUR_TEETH_24[0].y * radius)
    for (let i = 1; i < UNIT_SPUR_TEETH_24.length; i++) {
      c.lineTo(UNIT_SPUR_TEETH_24[i].x * radius, UNIT_SPUR_TEETH_24[i].y * radius)
    }
    c.closePath()
  }
  c.strokeStyle = goldColor
  c.lineWidth = 1.0
  c.globalAlpha = 0.85 * safeAlpha
  c.stroke()

  // 2. Inner rim guide tracks
  c.beginPath()
  c.arc(0, 0, radius * 0.66, 0, Math.PI * 2)
  c.arc(0, 0, radius * 0.58, 0, Math.PI * 2)
  c.strokeStyle = goldColor
  c.lineWidth = 0.8
  c.globalAlpha = 0.5 * safeAlpha
  c.stroke()

  // Dashed amethyst concentric track
  c.beginPath()
  c.arc(0, 0, radius * 0.62, 0, Math.PI * 2)
  c.strokeStyle = amethystColor
  c.lineWidth = 0.75
  c.setLineDash(DASH_AMETHYST)
  c.globalAlpha = 0.45 * safeAlpha
  c.stroke()
  c.setLineDash(DASH_SOLID)

  // 3. 6 circular lightening cutouts & 12 micro-rivet studs
  const cutoutR = radius * 0.042
  const cutoutTrack = radius * 0.62
  c.beginPath()
  for (let k = 0; k < 6; k++) {
    const angle = (k * Math.PI) / 3
    const x = Math.cos(angle) * cutoutTrack
    const y = Math.sin(angle) * cutoutTrack
    c.moveTo(x + cutoutR, y)
    c.arc(x, y, cutoutR, 0, Math.PI * 2)
  }
  c.strokeStyle = goldColor
  c.lineWidth = 0.8
  c.globalAlpha = 0.65 * safeAlpha
  c.stroke()

  // Micro-rivets (drawn as tiny dots in a single batched path)
  const rivetTrack = radius * 0.595
  c.fillStyle = goldColor
  c.globalAlpha = 0.7 * safeAlpha
  c.beginPath()
  for (let k = 0; k < 12; k++) {
    const angle = (k * Math.PI) / 6
    const x = Math.cos(angle) * rivetTrack
    const y = Math.sin(angle) * rivetTrack
    c.moveTo(x + 1.2, y)
    c.arc(x, y, 1.2, 0, Math.PI * 2)
  }
  c.fill()

  c.restore()
}

export const PLANETARY_ORBITS: readonly PlanetaryOrbitConfig[] = [
  {
    symbol: '♃',
    name: 'Jupiter',
    radiusRatio: 0.56,
    angularSpeed: 0.09,
    initialAngle: 0.4,
    dotRadius: 4.0,
    colorToken: 'amethyst',
  },
  {
    symbol: '☉',
    name: 'Sun',
    radiusRatio: 0.47,
    angularSpeed: 0.14,
    initialAngle: 1.8,
    dotRadius: 5.5,
    colorToken: 'accent',
  },
  {
    symbol: '☿',
    name: 'Mercury',
    radiusRatio: 0.39,
    angularSpeed: 0.24,
    initialAngle: 3.2,
    dotRadius: 3.2,
    colorToken: 'bright',
  },
  {
    symbol: '☽',
    name: 'Moon',
    radiusRatio: 0.32,
    angularSpeed: 0.35,
    initialAngle: 4.6,
    dotRadius: 3.8,
    colorToken: 'bright',
  },
] as const

const DASH_ORBIT = [2, 5]

export function renderPlanetaryEpicycles(
  c: CanvasRenderingContext2D,
  radius: number,
  time: number,
  pointer: { x: number; y: number; active: boolean },
  orreryCenter: { x: number; y: number },
  goldColor: string,
  amethystColor: string,
  brightColor: string,
  alphaMult: number,
  reducedMotion: boolean
): void {
  const safeAlpha = Math.max(0, Math.min(1, alphaMult))
  if (radius <= 0 || !Number.isFinite(radius) || safeAlpha <= 0.001) {
    return
  }

  c.save()

  // 1. Draw dashed concentric orbit tracks
  c.setLineDash(DASH_ORBIT)
  c.lineWidth = 0.75
  for (let i = 0; i < PLANETARY_ORBITS.length; i++) {
    const orbit = PLANETARY_ORBITS[i]
    const r = radius * orbit.radiusRatio
    c.beginPath()
    c.arc(0, 0, r, 0, Math.PI * 2)
    c.strokeStyle = orbit.colorToken === 'amethyst' ? amethystColor : goldColor
    c.globalAlpha = 0.35 * safeAlpha
    c.stroke()
  }
  c.setLineDash(DASH_SOLID)

  // 2. Draw trailing wakes, planetary body nodes, and symbols
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.font = '10px serif'

  const wakeArcLength = 0.44 // ~25 degrees trailing wake

  for (let i = 0; i < PLANETARY_ORBITS.length; i++) {
    const orbit = PLANETARY_ORBITS[i]
    const r = radius * orbit.radiusRatio
    const currentAngle = reducedMotion
      ? orbit.initialAngle
      : orbit.initialAngle + time * orbit.angularSpeed

    // Trailing orbital wake arc
    if (!reducedMotion) {
      c.beginPath()
      c.arc(0, 0, r, currentAngle - wakeArcLength, currentAngle, false)
      c.strokeStyle = orbit.colorToken === 'amethyst' ? amethystColor : goldColor
      c.lineWidth = 1.2
      c.globalAlpha = 0.22 * safeAlpha
      c.stroke()
    }

    // Planetary body position relative to orrery center (in local canvas coordinates)
    const px = Math.cos(currentAngle) * r
    const py = Math.sin(currentAngle) * r

    // World position of the planet
    const worldX = orreryCenter.x + px
    const worldY = orreryCenter.y + py

    // Cursor proximity flare check
    let flareBoost = 0
    if (pointer.active) {
      const dist = Math.hypot(worldX - pointer.x, worldY - pointer.y)
      if (dist < 180) {
        flareBoost = (1 - dist / 180) * 0.6
      }
    }

    const nodeColor =
      orbit.colorToken === 'amethyst'
        ? amethystColor
        : orbit.colorToken === 'bright'
        ? brightColor
        : goldColor

    // Soft outer glow halo
    c.beginPath()
    c.arc(px, py, orbit.dotRadius + 3 + flareBoost * 4, 0, Math.PI * 2)
    c.fillStyle = nodeColor
    c.globalAlpha = (0.2 + flareBoost * 0.3) * safeAlpha
    c.fill()

    // Solid core dot
    c.beginPath()
    c.arc(px, py, orbit.dotRadius, 0, Math.PI * 2)
    c.fillStyle = nodeColor
    c.globalAlpha = (0.85 + flareBoost * 0.15) * safeAlpha
    c.fill()

    // Celestial symbol offset or overlaid
    c.fillStyle = goldColor
    c.globalAlpha = (0.9 + flareBoost * 0.1) * safeAlpha
    // For small nodes, offset symbol slightly outward radially so it's readable
    const labelDist = r + orbit.dotRadius + 7
    const lx = Math.cos(currentAngle) * labelDist
    const ly = Math.sin(currentAngle) * labelDist
    c.fillText(orbit.symbol, lx, ly)
  }

  c.restore()
}

/**
 * Precomputed 8-pointed star rosette unit coordinates (outer r: 0.22, inner r: 0.14)
 */
const ROSETTE_POINTS_8: readonly { x: number; y: number }[] = (() => {
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8
    const r = i % 2 === 0 ? 0.22 : 0.14
    pts.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r })
  }
  return pts
})()

/**
 * Renders Tier 4: Dynamic alchemical magnetic compass needle and rosette hub.
 * Points toward cursor angle with spring damping, rotating on an amethyst jewel boss.
 */
export function renderCompassNeedle(
  c: CanvasRenderingContext2D,
  radius: number,
  needleAngle: number,
  goldColor: string,
  amethystColor: string,
  alphaMult: number
): void {
  const safeAlpha = Math.max(0, Math.min(1, alphaMult))
  if (radius <= 0 || !Number.isFinite(radius) || safeAlpha <= 0.001) {
    return
  }

  c.save()

  // 1. Static 8-pointed star rosette housing
  c.beginPath()
  if (ROSETTE_POINTS_8.length > 0) {
    c.moveTo(ROSETTE_POINTS_8[0].x * radius, ROSETTE_POINTS_8[0].y * radius)
    for (let i = 1; i < ROSETTE_POINTS_8.length; i++) {
      c.lineTo(ROSETTE_POINTS_8[i].x * radius, ROSETTE_POINTS_8[i].y * radius)
    }
    c.closePath()
  }
  c.strokeStyle = goldColor
  c.lineWidth = 1.0
  c.globalAlpha = 0.55 * safeAlpha
  c.stroke()

  c.fillStyle = amethystColor
  c.globalAlpha = 0.08 * safeAlpha
  c.fill()

  // Housing guide ring
  c.beginPath()
  c.arc(0, 0, radius * 0.18, 0, Math.PI * 2)
  c.strokeStyle = goldColor
  c.lineWidth = 0.75
  c.globalAlpha = 0.45 * safeAlpha
  c.stroke()

  // 2. Pivoting Magnetic Needle (rotated by needleAngle)
  c.save()
  c.rotate(needleAngle)

  const nLen = radius * 0.26 // North pointer length
  const sLen = radius * 0.12 // South counterweight length
  const shoulder = radius * 0.032 // Needle half-width at pivot

  // North Pointer facet (Left - Gold leaf)
  c.beginPath()
  c.moveTo(0, -nLen)
  c.lineTo(-shoulder, 0)
  c.lineTo(0, 0)
  c.closePath()
  c.fillStyle = goldColor
  c.globalAlpha = 0.9 * safeAlpha
  c.fill()

  // North Pointer facet (Right - Darker Gold shading for 3D bevel)
  c.beginPath()
  c.moveTo(0, -nLen)
  c.lineTo(0, 0)
  c.lineTo(shoulder, 0)
  c.closePath()
  c.fillStyle = goldColor
  c.globalAlpha = 0.65 * safeAlpha
  c.fill()

  // South Counterweight (Amethyst/Gold diamond)
  c.beginPath()
  c.moveTo(0, 0)
  c.lineTo(-shoulder * 0.75, radius * 0.05)
  c.lineTo(0, sLen)
  c.lineTo(shoulder * 0.75, radius * 0.05)
  c.closePath()
  c.fillStyle = amethystColor
  c.globalAlpha = 0.8 * safeAlpha
  c.fill()

  // Needle perimeter stroke
  c.beginPath()
  c.moveTo(0, -nLen)
  c.lineTo(-shoulder, 0)
  c.lineTo(-shoulder * 0.75, radius * 0.05)
  c.lineTo(0, sLen)
  c.lineTo(shoulder * 0.75, radius * 0.05)
  c.lineTo(shoulder, 0)
  c.closePath()
  c.strokeStyle = goldColor
  c.lineWidth = 1.0
  c.globalAlpha = 0.95 * safeAlpha
  c.stroke()

  c.restore() // End needle rotation

  // 3. Central Brass Bearing Hub & Faceted Jewel Boss
  const hubR = radius * 0.035
  c.beginPath()
  c.arc(0, 0, hubR, 0, Math.PI * 2)
  c.fillStyle = goldColor
  c.globalAlpha = 0.95 * safeAlpha
  c.fill()

  c.beginPath()
  c.arc(0, 0, hubR * 0.7, 0, Math.PI * 2)
  c.fillStyle = amethystColor
  c.globalAlpha = 0.95 * safeAlpha
  c.fill()

  // Specular pin reflection
  c.beginPath()
  c.arc(-hubR * 0.25, -hubR * 0.25, hubR * 0.25, 0, Math.PI * 2)
  c.fillStyle = '#FFFFFF'
  c.globalAlpha = 0.9 * safeAlpha
  c.fill()

  c.restore()
}

const DASH_LEYLINE = [4, 6]

/**
 * Renders an ethereal filigree ley-line conduit between the Orrery hub and hovered tile.
 * Features a dual golden line with moving mana pulse beads entering the tile spell circle.
 */
export function renderLeyLineConduit(
  c: CanvasRenderingContext2D,
  orreryCenter: { x: number; y: number },
  tileCenter: { x: number; y: number },
  intensity: number,
  time: number,
  goldColor: string,
  alphaMult: number,
  reducedMotion: boolean
): void {
  const safeAlpha = Number.isFinite(alphaMult) ? Math.max(0, Math.min(1, alphaMult)) : 0
  const safeIntensity = Number.isFinite(intensity) ? Math.max(0, Math.min(1, intensity)) : 0
  if (
    safeIntensity <= 0.005 ||
    safeAlpha <= 0.001 ||
    !Number.isFinite(orreryCenter.x) ||
    !Number.isFinite(orreryCenter.y) ||
    !Number.isFinite(tileCenter.x) ||
    !Number.isFinite(tileCenter.y)
  ) {
    return
  }

  const dx = tileCenter.x - orreryCenter.x
  const dy = tileCenter.y - orreryCenter.y
  const dist = Math.hypot(dx, dy)
  if (dist < 10) return

  c.save()

  const lineAlpha = safeIntensity * safeAlpha

  // 1. Dual Filigree Conduit Beam
  // Main dashed conduit line
  c.beginPath()
  c.moveTo(orreryCenter.x, orreryCenter.y)
  c.lineTo(tileCenter.x, tileCenter.y)
  c.strokeStyle = goldColor
  c.lineWidth = 0.8
  c.globalAlpha = 0.35 * lineAlpha
  c.setLineDash(DASH_LEYLINE)
  c.stroke()
  c.setLineDash(DASH_SOLID)

  // Inner ethereal hairline
  c.beginPath()
  c.moveTo(orreryCenter.x, orreryCenter.y)
  c.lineTo(tileCenter.x, tileCenter.y)
  c.strokeStyle = goldColor
  c.lineWidth = 0.4
  c.globalAlpha = 0.5 * lineAlpha
  c.stroke()

  // 2. Traveling Mana Pulse Beads
  if (!reducedMotion) {
    const safeTime = Number.isFinite(time) ? time : 0
    c.fillStyle = goldColor

    for (let k = 0; k < 3; k++) {
      // Progress 0 -> 1 along the conduit
      const progress = ((safeTime * 0.35 + k / 3) % 1.0 + 1.0) % 1.0
      const bx = orreryCenter.x + dx * progress
      const by = orreryCenter.y + dy * progress

      // Soft envelope (fade in near orrery, fade out near tile)
      const envelope = Math.sin(progress * Math.PI)

      // Outer soft halo
      c.beginPath()
      c.arc(bx, by, 4.0, 0, Math.PI * 2)
      c.globalAlpha = 0.25 * envelope * lineAlpha
      c.fill()

      // Bright core bead
      c.beginPath()
      c.arc(bx, by, 2.0, 0, Math.PI * 2)
      c.globalAlpha = 0.85 * envelope * lineAlpha
      c.fill()
    }
  }

  c.restore()
}
