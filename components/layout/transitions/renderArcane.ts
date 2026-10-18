import type { PresetRenderer, TransitionMode, TransitionOrigin } from "./types"
import { rgba, clamp01, easeInOutCubic } from "./types"

const COLOR_PARCHMENT_VOID = "#08060A"
const COLOR_GOLD_RUNE = "#FFE875"
const COLOR_GOLD_EMBER = "#C9A227"
const COLOR_EMERALD_RUNE = "#4AFFB4"
const COLOR_EMERALD_DEEP = "#0A281E"

export interface ArcaneParticle {
  angle: number
  angularSpeed: number
  spiralRadius: number
  baseRadius: number
  size: number
  baseAlpha: number
  color: string
  seed: number
}

export interface ArcaneRuneRing {
  radius: number
  speed: number
  direction: 1 | -1
  tickCount: number
  glyphCount: number
  color: string
}

export interface ArcaneBurstRay {
  angle: number
  width: number
  lengthRatio: number
  color: string
}

export interface ArcaneState {
  origin: TransitionOrigin
  maxRadius: number
  mode: TransitionMode
  vortexParticles: ArcaneParticle[]
  runeRings: ArcaneRuneRing[]
  burstRays: ArcaneBurstRay[]
}

export const arcaneRenderer: PresetRenderer<ArcaneState> = {
  initState: (mode, w, h, origin) => {
    const dx = Math.max(origin.x, w - origin.x)
    const dy = Math.max(origin.y, h - origin.y)
    const maxRadius = Math.sqrt(dx * dx + dy * dy) + 100

    // Pre-allocated vortex particles (gold and emerald sparks)
    const particleCount = mode === "quick" ? 85 : 120
    const vortexParticles: ArcaneParticle[] = new Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const isGold = i % 2 === 0
      const baseR = 30 + Math.random() * (maxRadius * 0.75)
      vortexParticles[i] = {
        angle: (i / particleCount) * Math.PI * 2,
        angularSpeed: (0.8 + Math.random() * 1.4) * (i % 3 === 0 ? -1 : 1),
        spiralRadius: baseR,
        baseRadius: baseR,
        size: 1.2 + Math.random() * 2.5,
        baseAlpha: 0.35 + Math.random() * 0.55,
        color: isGold ? COLOR_GOLD_RUNE : COLOR_EMERALD_RUNE,
        seed: Math.random() * 100,
      }
    }

    // Concentric rune rings
    const runeRings: ArcaneRuneRing[] = [
      {
        radius: 80,
        speed: 0.5,
        direction: 1,
        tickCount: 16,
        glyphCount: 8,
        color: COLOR_GOLD_RUNE,
      },
      {
        radius: 160,
        speed: 0.35,
        direction: -1,
        tickCount: 24,
        glyphCount: 12,
        color: COLOR_EMERALD_RUNE,
      },
      {
        radius: 260,
        speed: 0.22,
        direction: 1,
        tickCount: 36,
        glyphCount: 16,
        color: COLOR_GOLD_RUNE,
      },
    ]

    // Radial burst rays for spellbook reveal
    const rayCount = 28
    const burstRays: ArcaneBurstRay[] = new Array(rayCount)
    for (let i = 0; i < rayCount; i++) {
      burstRays[i] = {
        angle: (i / rayCount) * Math.PI * 2,
        width: 1.5 + (i % 3) * 1.2,
        lengthRatio: 0.7 + (i % 4) * 0.15,
        color: i % 2 === 0 ? COLOR_GOLD_RUNE : COLOR_EMERALD_RUNE,
      }
    }

    return {
      origin,
      maxRadius,
      mode,
      vortexParticles,
      runeRings,
      burstRays,
    }
  },

  drawCover: (ctx, state, p, w, h) => {
    ctx.save()
    const eased = easeInOutCubic(p)
    const currentR = eased * state.maxRadius * 1.15
    const ox = state.origin.x
    const oy = state.origin.y

    ctx.clearRect(0, 0, w, h)

    // Dark ancient parchment wash
    ctx.fillStyle = rgba(COLOR_PARCHMENT_VOID, clamp01(p * 1.15))
    ctx.fillRect(0, 0, w, h)

    // Glowing concentric runic circles expanding from origin
    if (currentR > 2) {
      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, currentR)
      grad.addColorStop(0, rgba(COLOR_PARCHMENT_VOID, 1))
      grad.addColorStop(0.65, rgba(COLOR_EMERALD_DEEP, clamp01(0.8 * (1 - p * 0.3))))
      grad.addColorStop(0.9, rgba(COLOR_GOLD_RUNE, clamp01(0.85 * p)))
      grad.addColorStop(1, rgba(COLOR_EMERALD_RUNE, 0))

      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(ox, oy, currentR, 0, Math.PI * 2)
      ctx.fill()

      // Outer expanding rune ring boundary
      ctx.strokeStyle = rgba(COLOR_GOLD_RUNE, clamp01(1 - p * 0.3))
      ctx.lineWidth = 2.5
      ctx.shadowColor = COLOR_EMERALD_RUNE
      ctx.shadowBlur = 18
      ctx.beginPath()
      ctx.arc(ox, oy, currentR, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Sub-rings expanding proportionally
      const ringSteps = 3
      for (let s = 1; s <= ringSteps; s++) {
        const subR = currentR * (s / (ringSteps + 1))
        ctx.strokeStyle = rgba(
          s % 2 === 0 ? COLOR_EMERALD_RUNE : COLOR_GOLD_EMBER,
          0.4 * p
        )
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.arc(ox, oy, subR, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    // Inward-swirling arcane sparks
    const particleLen = state.vortexParticles.length
    for (let i = 0; i < particleLen; i++) {
      const pt = state.vortexParticles[i]
      const r = pt.baseRadius * (1 - eased * 0.6)
      const ang = pt.angle + eased * pt.angularSpeed * 2.5
      const px = ox + Math.cos(ang) * r
      const py = oy + Math.sin(ang) * r

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

  drawHolding: (ctx, state, elapsed, w, h) => {
    ctx.save()
    // Support both milliseconds (standard performance.now()) and fractional seconds
    const t = elapsed > 100 ? elapsed * 0.001 : elapsed
    const ox = state.origin.x
    const oy = state.origin.y

    // Deep parchment void base
    ctx.fillStyle = COLOR_PARCHMENT_VOID
    ctx.fillRect(0, 0, w, h)

    // 1. Harmonic 1.2s runic energy wave pulsating outward
    const wavePeriod = 1.2
    const wavePhase = (t % wavePeriod) / wavePeriod
    const waveR = 50 + wavePhase * (state.maxRadius * 0.7)
    const waveAlpha = (1 - wavePhase) * 0.65

    ctx.strokeStyle = rgba(COLOR_EMERALD_RUNE, waveAlpha)
    ctx.lineWidth = 2
    ctx.shadowColor = COLOR_EMERALD_RUNE
    ctx.shadowBlur = 14
    ctx.beginPath()
    ctx.arc(ox, oy, waveR, 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0

    // Secondary harmonic wave offset by 0.6s
    const wavePhase2 = ((t + 0.6) % wavePeriod) / wavePeriod
    const waveR2 = 50 + wavePhase2 * (state.maxRadius * 0.7)
    const waveAlpha2 = (1 - wavePhase2) * 0.45

    ctx.strokeStyle = rgba(COLOR_GOLD_RUNE, waveAlpha2)
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(ox, oy, waveR2, 0, Math.PI * 2)
    ctx.stroke()

    // 2. Dual concentric rune rings counter-rotating with glowing glyph ticks
    const ringLen = state.runeRings.length
    for (let rIdx = 0; rIdx < ringLen; rIdx++) {
      const ring = state.runeRings[rIdx]
      const currentRot = ring.direction * t * ring.speed
      const radius = ring.radius

      // Ring circular track
      ctx.strokeStyle = rgba(ring.color, 0.45)
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(ox, oy, radius, 0, Math.PI * 2)
      ctx.stroke()

      // Inner dashed track
      ctx.strokeStyle = rgba(ring.color, 0.25)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(ox, oy, radius - 6, 0, Math.PI * 2)
      ctx.stroke()

      // Radial glyph ticks
      const ticks = ring.tickCount
      for (let tk = 0; tk < ticks; tk++) {
        const tickAngle = currentRot + (tk / ticks) * Math.PI * 2
        const isMajor = tk % 4 === 0
        const innerLen = isMajor ? 12 : 6
        const x1 = ox + Math.cos(tickAngle) * (radius - innerLen)
        const y1 = oy + Math.sin(tickAngle) * (radius - innerLen)
        const x2 = ox + Math.cos(tickAngle) * (radius + 4)
        const y2 = oy + Math.sin(tickAngle) * (radius + 4)

        ctx.strokeStyle = rgba(ring.color, isMajor ? 0.8 : 0.4)
        ctx.lineWidth = isMajor ? 1.8 : 1
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      // Geometric runic glyph marks on ring perimeter
      const glyphs = ring.glyphCount
      for (let g = 0; g < glyphs; g++) {
        const glyphAngle = currentRot + (g / glyphs) * Math.PI * 2
        const gx = ox + Math.cos(glyphAngle) * radius
        const gy = oy + Math.sin(glyphAngle) * radius

        // Alternate between diamond and chevron glyph shapes
        ctx.fillStyle = rgba(ring.color, 0.85)
        if (g % 2 === 0) {
          // Diamond glyph
          ctx.beginPath()
          ctx.moveTo(gx, gy - 4)
          ctx.lineTo(gx + 3, gy)
          ctx.lineTo(gx, gy + 4)
          ctx.lineTo(gx - 3, gy)
          ctx.closePath()
          ctx.fill()
        } else {
          // Chevron tick
          const ca = glyphAngle + Math.PI / 2
          const cx1 = gx + Math.cos(ca) * 3
          const cy1 = gy + Math.sin(ca) * 3
          const cx2 = gx - Math.cos(ca) * 3
          const cy2 = gy - Math.sin(ca) * 3
          ctx.strokeStyle = rgba(ring.color, 0.85)
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(cx1, cy1)
          ctx.lineTo(gx, gy)
          ctx.lineTo(cx2, cy2)
          ctx.stroke()
        }
      }
    }

    // Central runic pentacle / sigil core
    const corePulse = 0.5 + 0.5 * Math.sin(t * 2.5)
    ctx.shadowColor = COLOR_GOLD_RUNE
    ctx.shadowBlur = 18 * corePulse
    ctx.fillStyle = rgba(COLOR_GOLD_RUNE, 0.35 + corePulse * 0.25)
    ctx.beginPath()
    ctx.arc(ox, oy, 22, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    // Central octagram lines
    const starPoints = 8
    const innerR = 14
    const outerR = 38
    ctx.strokeStyle = rgba(COLOR_GOLD_RUNE, 0.6)
    ctx.lineWidth = 1.2
    ctx.beginPath()
    for (let i = 0; i < starPoints * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR
      const ang = (i / (starPoints * 2)) * Math.PI * 2 + t * 0.2
      const sx = ox + Math.cos(ang) * r
      const sy = oy + Math.sin(ang) * r
      if (i === 0) ctx.moveTo(sx, sy)
      else ctx.lineTo(sx, sy)
    }
    ctx.closePath()
    ctx.stroke()

    // 3. Central arcane vortex particle storm orbiting in a logarithmic spiral (zero-GC)
    const particleLen = state.vortexParticles.length
    for (let i = 0; i < particleLen; i++) {
      const pt = state.vortexParticles[i]
      // Logarithmic inward spiral: radius decrements cyclically
      const cycleTime = (t * 45 + pt.seed * 3) % (state.maxRadius * 0.65)
      const currentR = Math.max(12, state.maxRadius * 0.65 - cycleTime)
      // Logarithmic spiral angle calculation
      const spiralAngle = pt.angle + (Math.log(currentR + 1) * 3.5) + t * pt.angularSpeed * 0.8
      const px = ox + Math.cos(spiralAngle) * currentR
      const py = oy + Math.sin(spiralAngle) * currentR

      const falloff = clamp01(currentR / (state.maxRadius * 0.65))
      const alpha = pt.baseAlpha * (0.4 + 0.6 * (1 - falloff))

      ctx.fillStyle = pt.color
      ctx.globalAlpha = clamp01(alpha)
      ctx.beginPath()
      ctx.arc(px, py, pt.size * (1 + 0.5 * (1 - falloff)), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Arcane Telemetry Text with dynamic clamping
    const textX = ox > w - 240 ? ox - 240 : ox + 70
    ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace"
    ctx.fillStyle = rgba(COLOR_GOLD_RUNE, 0.65)
    ctx.fillText("ARCANE_SPELLBOOK // RUNIC_BIND", textX, oy - 14)
    ctx.fillStyle = rgba(COLOR_EMERALD_RUNE, 0.5)
    ctx.fillText("MANA_STABILIZED // 1.2s HARMONIC", textX, oy + 4)

    ctx.restore()
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  },

  drawReveal: (ctx, state, p, w, h) => {
    ctx.save()
    const eased = easeInOutCubic(p)
    const apertureR = eased * state.maxRadius * 1.3
    const ox = state.origin.x
    const oy = state.origin.y
    const remainingAlpha = clamp01(1 - p)

    ctx.clearRect(0, 0, w, h)

    // Base parchment void
    ctx.fillStyle = COLOR_PARCHMENT_VOID
    ctx.fillRect(0, 0, w, h)

    // Runes burst into radial light rays, opening like an ancient spellbook cover
    // Central unmasking aperture
    if (apertureR > 0) {
      ctx.globalCompositeOperation = "destination-out"
      ctx.beginPath()
      ctx.arc(ox, oy, apertureR, 0, Math.PI * 2)
      ctx.fill()
    }

    // Radial burst rays opening outward
    ctx.globalCompositeOperation = "source-over"
    if (apertureR > 0 && remainingAlpha > 0.01) {
      const rayLen = state.burstRays.length
      for (let i = 0; i < rayLen; i++) {
        const ray = state.burstRays[i]
        const rayAngle = ray.angle + eased * 0.4
        const rayLength = apertureR + state.maxRadius * ray.lengthRatio * (1 - p)
        const rx = ox + Math.cos(rayAngle) * rayLength
        const ry = oy + Math.sin(rayAngle) * rayLength

        ctx.strokeStyle = rgba(ray.color, remainingAlpha * 0.8)
        ctx.lineWidth = ray.width * (1 - p * 0.4)
        ctx.beginPath()
        ctx.moveTo(ox + Math.cos(rayAngle) * apertureR, oy + Math.sin(rayAngle) * apertureR)
        ctx.lineTo(rx, ry)
        ctx.stroke()
      }

      // Outer glowing runic rim of the opening spellbook
      ctx.strokeStyle = rgba(COLOR_GOLD_RUNE, remainingAlpha * 0.95)
      ctx.lineWidth = 3.5
      ctx.shadowColor = COLOR_EMERALD_RUNE
      ctx.shadowBlur = 22 * remainingAlpha
      ctx.beginPath()
      ctx.arc(ox, oy, apertureR, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Vertical spellbook seam opening line
      ctx.strokeStyle = rgba(COLOR_GOLD_RUNE, remainingAlpha * 0.7)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(ox, 0)
      ctx.lineTo(ox, Math.max(0, oy - apertureR))
      ctx.moveTo(ox, Math.min(h, oy + apertureR))
      ctx.lineTo(ox, h)
      ctx.stroke()
    }

    ctx.restore()
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  },
}
