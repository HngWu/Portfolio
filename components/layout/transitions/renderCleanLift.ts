import type { PresetRenderer, TransitionMode, TransitionOrigin } from "./types"
import { rgba, clamp01, easeInOutCubic } from "./types"

const COLOR_OBSIDIAN_VOID = "#08080A"
const COLOR_SHEEN_WHITE = "#FFFFFF"
const COLOR_MUTED_SILVER = "#A1A1AA"
const COLOR_FAINT_HAIRLINE = "#E4E4E7"

/**
 * Exact Newton-Raphson solver for cubic-bezier(0.16, 1, 0.3, 1).
 * Yields the signature silk-smooth luxury glide with 0 allocations.
 */
function easeCubicBezier016(p: number): number {
  const tTarget = clamp01(p)
  if (tTarget <= 0) return 0
  if (tTarget >= 1) return 1

  // Bezier control points: x1 = 0.16, x2 = 0.3, y1 = 1, y2 = 1
  // x(t) = 3*(1-t)^2 * t * 0.16 + 3*(1-t) * t^2 * 0.3 + t^3
  // 3-iteration Newton-Raphson approximation
  let t = tTarget
  for (let i = 0; i < 4; i++) {
    const oneMinusT = 1 - t
    const currentX =
      3 * oneMinusT * oneMinusT * t * 0.16 +
      3 * oneMinusT * t * t * 0.3 +
      t * t * t
    const currentSlope =
      3 * oneMinusT * oneMinusT * 0.16 +
      6 * oneMinusT * t * (0.3 - 0.16) +
      3 * t * t * (1 - 0.3)
    if (Math.abs(currentSlope) < 1e-5) break
    t -= (currentX - tTarget) / currentSlope
  }
  t = clamp01(t)

  // y(t) with y1 = 1, y2 = 1 simplifies to 1 - (1 - t)^3
  const oneMinusT = 1 - t
  return 1 - oneMinusT * oneMinusT * oneMinusT
}

export interface MicroGridDot {
  x: number
  y: number
  baseAlpha: number
}

export interface CleanLiftState {
  origin: TransitionOrigin
  w: number
  h: number
  mode: TransitionMode
  microGridDots: MicroGridDot[]
}

export const cleanLiftRenderer: PresetRenderer<CleanLiftState> = {
  initState: (mode, w, h, origin) => {
    // Pre-allocated micro-grid dots along the bottom viewport margin
    const dotSpacing = 28
    const maxCols = Math.max(140, Math.floor(Math.max(w, 3840) / dotSpacing))
    const microGridDots: MicroGridDot[] = new Array(maxCols)

    for (let i = 0; i < maxCols; i++) {
      microGridDots[i] = {
        x: (i + 1) * dotSpacing,
        y: 0,
        baseAlpha: 0.3 + ((i % 4) * 0.15),
      }
    }

    return {
      origin,
      w,
      h,
      mode,
      microGridDots,
    }
  },

  drawCover: (ctx, state, p, w, h) => {
    ctx.save()
    const eased = easeInOutCubic(p)
    // Wash glides upward from bottom (h) toward top (0)
    const leadY = h * (1 - eased)

    ctx.clearRect(0, 0, w, h)

    // Frosted obsidian glass substrate covering the swept area [leadY, h]
    if (leadY < h) {
      const coverHeight = h - leadY
      ctx.fillStyle = rgba(COLOR_OBSIDIAN_VOID, clamp01(p * 1.2))
      ctx.fillRect(0, leadY, w, coverHeight)

      // Delicate luminous leading edge (rgba(255, 255, 255, 0.15))
      const edgeGrad = ctx.createLinearGradient(0, leadY - 14, 0, leadY + 20)
      edgeGrad.addColorStop(0, rgba(COLOR_SHEEN_WHITE, 0))
      edgeGrad.addColorStop(0.45, rgba(COLOR_SHEEN_WHITE, 0.15))
      edgeGrad.addColorStop(1, rgba(COLOR_SHEEN_WHITE, 0))

      ctx.fillStyle = edgeGrad
      ctx.fillRect(0, leadY - 14, w, 34)

      // Fine precision hairline at the leading edge
      ctx.strokeStyle = rgba(COLOR_SHEEN_WHITE, 0.22 * p)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, leadY)
      ctx.lineTo(w, leadY)
      ctx.stroke()
    }

    ctx.restore()
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  },

  drawHolding: (ctx, state, elapsed, w, h, mode) => {
    ctx.save()
    // Support both milliseconds (standard performance.now()) and fractional seconds
    const t = elapsed > 100 ? elapsed * 0.001 : elapsed

    // Pristine deep frosted obsidian glass surface
    ctx.fillStyle = COLOR_OBSIDIAN_VOID
    ctx.fillRect(0, 0, w, h)

    // 1. Ambient 1.0Hz luminance wave sweeping gently across the frosted surface
    const sweepProgress = (t * 1.0) % 2 - 0.5
    const sweepCenterX = sweepProgress * (w + 400) - 200

    const sheenGrad = ctx.createLinearGradient(
      sweepCenterX - 180,
      0,
      sweepCenterX + 180,
      h
    )
    sheenGrad.addColorStop(0, rgba(COLOR_SHEEN_WHITE, 0))
    sheenGrad.addColorStop(0.45, rgba(COLOR_SHEEN_WHITE, 0.04))
    sheenGrad.addColorStop(0.5, rgba(COLOR_SHEEN_WHITE, 0.08))
    sheenGrad.addColorStop(0.55, rgba(COLOR_SHEEN_WHITE, 0.04))
    sheenGrad.addColorStop(1, rgba(COLOR_SHEEN_WHITE, 0))

    ctx.fillStyle = sheenGrad
    ctx.fillRect(0, 0, w, h)

    // 2. Faint breathing micro-grid telemetry at viewport bottom
    const breath = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.0)
    const dotLen = state.microGridDots.length
    const dotY = h - 45

    // Bottom hairline divider
    ctx.strokeStyle = rgba(COLOR_FAINT_HAIRLINE, 0.08)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(32, h - 30)
    ctx.lineTo(w - 32, h - 30)
    ctx.stroke()

    // Micro-grid dots (dynamically bounded by current width)
    for (let i = 0; i < dotLen; i++) {
      const dot = state.microGridDots[i]
      if (dot.x >= w - 32) break
      const alpha = (0.15 + 0.15 * breath) * dot.baseAlpha
      ctx.fillStyle = rgba(COLOR_SHEEN_WHITE, alpha)
      ctx.fillRect(dot.x - 0.75, dotY - 0.75, 1.5, 1.5)
    }

    // Minimalist luxury typography with mobile overlap guard
    ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace"
    ctx.fillStyle = rgba(COLOR_MUTED_SILVER, 0.65)
    ctx.fillText("CURATION ARCHIVE // SYS.01", 32, h - 14)

    if (w >= 440) {
      ctx.fillStyle = rgba(COLOR_MUTED_SILVER, 0.45)
      ctx.fillText(
        `MODE: ${mode.toUpperCase()} // EDITION: 2026.IV`,
        w - 220,
        h - 14
      )
    }

    ctx.restore()
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  },

  drawReveal: (ctx, state, p, w, h) => {
    ctx.save()
    // Silk-smooth vertical glide upward (translateY(-100%)) with cubic-bezier(0.16, 1, 0.3, 1)
    const eased = easeCubicBezier016(p)
    const bottomY = h * (1 - eased)
    const remainingAlpha = clamp01(1 - p)

    ctx.clearRect(0, 0, w, h)

    // The frosted curtain glides upward; portion remaining is [0, bottomY]
    if (bottomY > 0) {
      ctx.fillStyle = COLOR_OBSIDIAN_VOID
      ctx.fillRect(0, 0, w, bottomY)

      // Micro-grid dots in remaining visible curtain
      const dotBaseY = h - 45
      const currentDotY = dotBaseY - (h - bottomY)
      if (currentDotY > 0 && currentDotY < bottomY - 10) {
        const dotLen = state.microGridDots.length
        for (let i = 0; i < dotLen; i++) {
          const dot = state.microGridDots[i]
          if (dot.x >= w - 32) break
          ctx.fillStyle = rgba(COLOR_SHEEN_WHITE, dot.baseAlpha * remainingAlpha * 0.4)
          ctx.fillRect(dot.x - 0.75, currentDotY - 0.75, 1.5, 1.5)
        }
      }

      // Delicate luminous trailing bottom edge (rgba(255, 255, 255, 0.15))
      if (remainingAlpha > 0.01) {
        const edgeGrad = ctx.createLinearGradient(0, bottomY - 18, 0, bottomY + 10)
        edgeGrad.addColorStop(0, rgba(COLOR_SHEEN_WHITE, 0))
        edgeGrad.addColorStop(0.7, rgba(COLOR_SHEEN_WHITE, 0.15 * remainingAlpha))
        edgeGrad.addColorStop(1, rgba(COLOR_SHEEN_WHITE, 0))

        ctx.fillStyle = edgeGrad
        ctx.fillRect(0, bottomY - 18, w, 28)

        // Trailing hairline
        ctx.strokeStyle = rgba(COLOR_SHEEN_WHITE, 0.25 * remainingAlpha)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, bottomY)
        ctx.lineTo(w, bottomY)
        ctx.stroke()
      }
    }

    ctx.restore()
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  },
}
