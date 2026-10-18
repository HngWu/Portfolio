import type { PresetRenderer, TransitionMode, TransitionOrigin } from "./types"
import { rgba, clamp01, easeInOutCubic } from "./types"

const COLOR_VOID = "#040509"
const COLOR_GOLD_CORE = "#FFE875"
const COLOR_GOLD_PLASMA = "#C9A227"
const COLOR_GOLD_EMBER = "#FFB44A"
const COLOR_CYAN_CORE = "#6AFFFF"
const COLOR_CYAN_RING = "#00F0FF"
const COLOR_CYAN_DEEP = "#0A2038"
const COLOR_TEAL_ACCENT = "#4AE3B5"

export interface SingularityParticle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  angle: number
  angularSpeed: number
  distance: number
  size: number
  baseAlpha: number
  color: string
  seed: number
}

export interface SingularityRing {
  baseRadius: number
  speed: number
  maxRadius: number
  lineWidth: number
  color: string
}

export interface SingularityStroke {
  angle: number
  radius: number
  length: number
  speed: number
  width: number
  alpha: number
}

export interface SingularityState {
  origin: TransitionOrigin
  maxRadius: number
  mode: TransitionMode
  particles: SingularityParticle[]
  rings: SingularityRing[]
  strokes: SingularityStroke[]
  hexCoords: string[]
}

const HEX_POOL = [
  "0x4A8F",
  "0x7B21",
  "0x10C4",
  "0xE820",
  "0x09F2",
  "0x3D7A",
  "0xA2F1",
  "0x5CE8",
  "0x89D0",
  "0x2B4E",
  "0xF103",
  "0x6C5A",
]

export const singularityRenderer: PresetRenderer<SingularityState> = {
  initState: (mode, w, h, origin) => {
    // Determine maximum distance from origin to canvas corners
    const dx = Math.max(origin.x, w - origin.x)
    const dy = Math.max(origin.y, h - origin.y)
    const maxRadius = Math.sqrt(dx * dx + dy * dy) + 80

    const particleCount = mode === "quick" ? 90 : 120
    const particles: SingularityParticle[] = new Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + Math.sin(i * 1.7) * 0.5
      const distance = 20 + Math.random() * (maxRadius * 0.85)
      const isGold = mode === "quick" || i % 3 === 0

      particles[i] = {
        x: origin.x + Math.cos(angle) * distance,
        y: origin.y + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        radius: distance,
        angle,
        angularSpeed: (0.4 + Math.random() * 0.8) * (i % 2 === 0 ? 1 : -1),
        distance,
        size: 1.2 + Math.random() * 2.8,
        baseAlpha: 0.35 + Math.random() * 0.55,
        color: isGold
          ? i % 2 === 0
            ? COLOR_GOLD_CORE
            : COLOR_GOLD_EMBER
          : i % 2 === 0
            ? COLOR_CYAN_CORE
            : COLOR_CYAN_RING,
        seed: Math.random() * 100,
      }
    }

    // Rings for deep mode event horizon
    const ringCount = 6
    const rings: SingularityRing[] = new Array(ringCount)
    for (let i = 0; i < ringCount; i++) {
      rings[i] = {
        baseRadius: 40 + i * 55,
        speed: 35 + i * 15,
        maxRadius: Math.min(maxRadius, 500),
        lineWidth: i % 2 === 0 ? 1.5 : 1,
        color: i % 2 === 0 ? COLOR_CYAN_RING : COLOR_TEAL_ACCENT,
      }
    }

    // Rotating geometric strokes for quick mode
    const strokeCount = 14
    const strokes: SingularityStroke[] = new Array(strokeCount)
    for (let i = 0; i < strokeCount; i++) {
      strokes[i] = {
        angle: (i / strokeCount) * Math.PI * 2,
        radius: 60 + (i % 4) * 45,
        length: 25 + (i % 3) * 35,
        speed: 0.35 * (i % 2 === 0 ? 1 : -0.7),
        width: 1.5,
        alpha: 0.4 + (i % 3) * 0.2,
      }
    }

    return {
      origin,
      maxRadius,
      mode,
      particles,
      rings,
      strokes,
      hexCoords: HEX_POOL,
    }
  },

  drawCover: (ctx, state, p, w, h, mode) => {
    ctx.save()
    const eased = easeInOutCubic(p)
    const currentR = eased * state.maxRadius * 1.15
    const ox = state.origin.x
    const oy = state.origin.y

    // Clear prior frame artifacts
    ctx.clearRect(0, 0, w, h)

    // Cosmic void backdrop expanding with progress
    ctx.fillStyle = rgba(COLOR_VOID, clamp01(p * 1.1))
    ctx.fillRect(0, 0, w, h)

    // Radial singularity accretion wash from origin
    if (currentR > 1) {
      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, currentR)
      const rimColor = mode === "quick" ? COLOR_GOLD_CORE : COLOR_CYAN_RING
      const midColor = mode === "quick" ? COLOR_GOLD_PLASMA : COLOR_CYAN_DEEP

      grad.addColorStop(0, rgba(COLOR_VOID, 1))
      grad.addColorStop(0.65, rgba(midColor, clamp01(0.7 * (1 - p * 0.3))))
      grad.addColorStop(0.92, rgba(rimColor, clamp01(0.9 * p)))
      grad.addColorStop(1, rgba(rimColor, 0))

      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(ox, oy, currentR, 0, Math.PI * 2)
      ctx.fill()

      // Luminous leading shockwave edge
      ctx.strokeStyle = rgba(rimColor, clamp01(1 - p * 0.4))
      ctx.lineWidth = 2.5
      ctx.shadowColor = rimColor
      ctx.shadowBlur = 18
      ctx.beginPath()
      ctx.arc(ox, oy, currentR, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    // In-rushing gravitational stardust particles
    const particleLen = state.particles.length
    for (let i = 0; i < particleLen; i++) {
      const pt = state.particles[i]
      // Interpolate from outer boundary inward toward origin
      const dist = pt.distance * (1 - eased * 0.6)
      const curAngle = pt.angle + eased * pt.angularSpeed * 2
      const px = ox + Math.cos(curAngle) * dist
      const py = oy + Math.sin(curAngle) * dist

      ctx.fillStyle = pt.color
      ctx.globalAlpha = clamp01(pt.baseAlpha * clamp01(p * 1.5))
      ctx.beginPath()
      ctx.arc(px, py, pt.size * (0.8 + 0.4 * p), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    ctx.restore()
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  },

  drawHolding: (ctx, state, elapsed, w, h, mode) => {
    ctx.save()
    // Support both milliseconds (standard performance.now()) and fractional seconds
    const t = elapsed > 100 ? elapsed * 0.001 : elapsed
    const ox = state.origin.x
    const oy = state.origin.y

    // Opaque cosmic void background
    ctx.fillStyle = COLOR_VOID
    ctx.fillRect(0, 0, w, h)

    if (mode === "quick") {
      // 0.8Hz Breathing gold plasma core
      const pulsePhase = t * Math.PI * 2 * 0.8
      const pulse = Math.sin(pulsePhase)
      const coreR = 55 + pulse * 12

      // Outer corona glow
      const coronaGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, coreR * 2.8)
      coronaGrad.addColorStop(0, rgba(COLOR_GOLD_CORE, 0.95))
      coronaGrad.addColorStop(0.35, rgba(COLOR_GOLD_PLASMA, 0.45))
      coronaGrad.addColorStop(0.7, rgba(COLOR_GOLD_EMBER, 0.15))
      coronaGrad.addColorStop(1, rgba(COLOR_VOID, 0))

      ctx.fillStyle = coronaGrad
      ctx.beginPath()
      ctx.arc(ox, oy, coreR * 2.8, 0, Math.PI * 2)
      ctx.fill()

      // Core plasma circle
      ctx.shadowColor = COLOR_GOLD_CORE
      ctx.shadowBlur = 24
      ctx.fillStyle = rgba(COLOR_GOLD_CORE, 0.9)
      ctx.beginPath()
      ctx.arc(ox, oy, coreR * 0.6, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Rotating geometric stroke lines orbiting center
      const strokeLen = state.strokes.length
      for (let i = 0; i < strokeLen; i++) {
        const str = state.strokes[i]
        const currentAngle = str.angle + t * str.speed
        const arcLength = (str.length / str.radius) * Math.PI

        ctx.strokeStyle = rgba(COLOR_GOLD_CORE, str.alpha * (0.7 + 0.3 * Math.sin(pulsePhase + i)))
        ctx.lineWidth = str.width
        ctx.beginPath()
        ctx.arc(ox, oy, str.radius, currentAngle, currentAngle + arcLength)
        ctx.stroke()

        // Cardinal tick mark at stroke head
        const tickX = ox + Math.cos(currentAngle) * (str.radius + 4)
        const tickY = oy + Math.sin(currentAngle) * (str.radius + 4)
        ctx.fillStyle = rgba(COLOR_GOLD_EMBER, 0.85)
        ctx.fillRect(tickX - 1, tickY - 1, 2, 2)
      }

      // Floating gold dust particles with sine turbulence (zero-GC)
      const particleLen = state.particles.length
      for (let i = 0; i < particleLen; i++) {
        const pt = state.particles[i]
        const turbAngle = pt.angle + t * pt.angularSpeed * 0.6
        const turbDist = pt.distance + Math.sin(t * 2.2 + pt.seed) * 14
        const px = ox + Math.cos(turbAngle) * turbDist
        const py = oy + Math.sin(turbAngle) * turbDist

        const alpha = pt.baseAlpha * (0.6 + 0.4 * Math.sin(t * 3 + pt.seed))
        ctx.fillStyle = pt.color
        ctx.globalAlpha = clamp01(alpha)
        ctx.beginPath()
        ctx.arc(px, py, pt.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    } else {
      // DEEP MODE: Concentric cyan event horizon rings pulsing outward
      const ringLen = state.rings.length
      for (let i = 0; i < ringLen; i++) {
        const r = state.rings[i]
        const curRadius = (r.baseRadius + t * r.speed) % r.maxRadius
        const ringProgress = curRadius / r.maxRadius
        const ringAlpha = (1 - ringProgress) * 0.75

        ctx.strokeStyle = rgba(r.color, ringAlpha)
        ctx.lineWidth = r.lineWidth
        ctx.beginPath()
        ctx.arc(ox, oy, curRadius, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Sweeping radar ray (1.5 rad/s)
      const radarAngle = t * 1.5
      const radarRadius = Math.min(state.maxRadius * 0.7, Math.max(w, h))

      const radarGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, radarRadius)
      radarGrad.addColorStop(0, rgba(COLOR_CYAN_CORE, 0.4))
      radarGrad.addColorStop(0.8, rgba(COLOR_CYAN_RING, 0.15))
      radarGrad.addColorStop(1, rgba(COLOR_CYAN_RING, 0))

      ctx.fillStyle = radarGrad
      ctx.beginPath()
      ctx.moveTo(ox, oy)
      ctx.arc(ox, oy, radarRadius, radarAngle - 0.35, radarAngle)
      ctx.closePath()
      ctx.fill()

      // Sweeping radar beam line
      const beamX = ox + Math.cos(radarAngle) * radarRadius
      const beamY = oy + Math.sin(radarAngle) * radarRadius
      ctx.strokeStyle = rgba(COLOR_CYAN_CORE, 0.85)
      ctx.lineWidth = 1.8
      ctx.shadowColor = COLOR_CYAN_CORE
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.moveTo(ox, oy)
      ctx.lineTo(beamX, beamY)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Core singularity event horizon well
      const wellGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, 48)
      wellGrad.addColorStop(0, rgba(COLOR_VOID, 1))
      wellGrad.addColorStop(0.7, rgba(COLOR_CYAN_DEEP, 0.8))
      wellGrad.addColorStop(1, rgba(COLOR_CYAN_RING, 0.4))

      ctx.fillStyle = wellGrad
      ctx.beginPath()
      ctx.arc(ox, oy, 48, 0, Math.PI * 2)
      ctx.fill()

      // Orbiting cyan quantum particles (zero-GC)
      const particleLen = state.particles.length
      for (let i = 0; i < particleLen; i++) {
        const pt = state.particles[i]
        const pAngle = pt.angle + t * pt.angularSpeed
        const pDist = pt.distance + Math.sin(t * 1.8 + pt.seed) * 8
        const px = ox + Math.cos(pAngle) * pDist
        const py = oy + Math.sin(pAngle) * pDist

        ctx.fillStyle = pt.color
        ctx.globalAlpha = clamp01(pt.baseAlpha)
        ctx.beginPath()
        ctx.arc(px, py, pt.size * 0.9, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Cycling hex telemetry display with dynamic clamping
      const hexIndex = Math.floor(t * 7) % state.hexCoords.length
      const hexCoord = state.hexCoords[hexIndex]
      const nextHex = state.hexCoords[(hexIndex + 1) % state.hexCoords.length]

      const textX = ox > w - 240 ? ox - 240 : ox + 60
      ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace"
      ctx.fillStyle = rgba(COLOR_CYAN_CORE, 0.75)
      ctx.fillText(`SINGULARITY_LOCK // ${hexCoord}:${nextHex}`, textX, oy - 20)
      ctx.fillStyle = rgba(COLOR_TEAL_ACCENT, 0.6)
      ctx.fillText(`GRAV_WELL: ACTIVE // 1.28e9 M☉`, textX, oy - 6)
      ctx.fillStyle = rgba(COLOR_CYAN_RING, 0.45)
      ctx.fillText(`EVENT_HORIZON: RADIAL_1.5_RAD/S`, textX, oy + 8)
    }

    ctx.restore()
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  },

  drawReveal: (ctx, state, p, w, h, mode) => {
    ctx.save()
    const eased = easeInOutCubic(p)
    const apertureR = eased * state.maxRadius * 1.25
    const ox = state.origin.x
    const oy = state.origin.y
    const remainingAlpha = clamp01(1 - p)

    // Clear prior frame
    ctx.clearRect(0, 0, w, h)

    // Render underlying dark void canvas layer
    ctx.fillStyle = COLOR_VOID
    ctx.fillRect(0, 0, w, h)

    // Unmask outward aperture using destination-out
    if (apertureR > 0) {
      ctx.globalCompositeOperation = "destination-out"
      ctx.beginPath()
      ctx.arc(ox, oy, apertureR, 0, Math.PI * 2)
      ctx.fill()
    }

    // Switch back to source-over to draw luminous expanding shockwave ring
    ctx.globalCompositeOperation = "source-over"
    const rimColor = mode === "quick" ? COLOR_GOLD_CORE : COLOR_CYAN_CORE
    const rimGlow = mode === "quick" ? COLOR_GOLD_PLASMA : COLOR_CYAN_RING

    if (apertureR > 0 && remainingAlpha > 0.01) {
      ctx.strokeStyle = rgba(rimColor, remainingAlpha * 0.95)
      ctx.lineWidth = 3
      ctx.shadowColor = rimGlow
      ctx.shadowBlur = 20 * remainingAlpha
      ctx.beginPath()
      ctx.arc(ox, oy, apertureR, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Dissolving stardust sparks on the shockwave perimeter
      const particleLen = state.particles.length
      const sparkCount = Math.min(particleLen, 36)
      for (let i = 0; i < sparkCount; i++) {
        const pt = state.particles[i]
        const sparkAngle = pt.angle + eased * 2.5
        const sparkR = apertureR + (i % 2 === 0 ? 8 : -8) * (1 - p)
        const sx = ox + Math.cos(sparkAngle) * sparkR
        const sy = oy + Math.sin(sparkAngle) * sparkR

        ctx.fillStyle = pt.color
        ctx.globalAlpha = clamp01(remainingAlpha * pt.baseAlpha)
        ctx.beginPath()
        ctx.arc(sx, sy, pt.size * (1 - p * 0.5), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    ctx.restore()
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  },
}
