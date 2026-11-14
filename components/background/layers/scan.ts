import { LayerContext, lerpRGBA, rgbaToString } from '../types'

const SWEEP_PERIOD = 14.0 // seconds between sweeps (calmer, less frequent)
const SWEEP_DURATION = 2.4 // seconds per sweep traversal (gentle, smoother glide)

/**
 * Renders a periodic horizontal scanline sweep in Deep Dive mode.
 * Sweeps downward from y = -20 to y = height + 20 with a trailing gradient wake.
 * Tuned to be subtle, ambient, and non-distracting.
 */
export function renderScanline(ctx: LayerContext): void {
  if (ctx.mix < 0.05 || ctx.reducedMotion || ctx.width <= 0 || ctx.height <= 0) {
    return
  }

  // Reduced intensity / opacity for a softer ambient sweep
  const alphaMult = ctx.mix * (ctx.palette.isLight ? 0.06 : 0.12)
  if (alphaMult <= 0.001) {
    return
  }

  const t = Number.isFinite(ctx.time) ? Math.max(0, ctx.time) : 0
  const cycleTime = t % SWEEP_PERIOD

  if (cycleTime > SWEEP_DURATION) {
    return
  }

  const progress = cycleTime / SWEEP_DURATION
  const yStart = -20
  const yEnd = ctx.height + 20
  const y = yStart + progress * (yEnd - yStart)

  const { ctx: c, width, palette } = ctx
  const laserColor = lerpRGBA(palette.accent, palette.accentBright, 0.75)

  c.save()

  // Faint fading gradient wake behind the downward-sweeping laser (wake is above)
  const wakeHeight = 22
  const wakeTop = y - wakeHeight

  const wakeGrad = c.createLinearGradient(0, wakeTop, 0, y)
  wakeGrad.addColorStop(0, rgbaToString(laserColor, 0))
  wakeGrad.addColorStop(0.7, rgbaToString(laserColor, alphaMult * 0.15))
  wakeGrad.addColorStop(1, rgbaToString(laserColor, alphaMult * 0.3))

  c.fillStyle = wakeGrad
  c.fillRect(0, wakeTop, width, wakeHeight)

  // Thin, delicate horizontal laser line
  c.lineWidth = 0.75
  c.strokeStyle = rgbaToString(palette.accentBright, alphaMult)
  c.shadowColor = rgbaToString(palette.accentBright, alphaMult)
  c.shadowBlur = 3
  c.beginPath()
  c.moveTo(0, y)
  c.lineTo(width, y)
  c.stroke()

  c.restore()
}
