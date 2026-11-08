import { LayerContext, lerpRGBA, rgbaToString } from '../types'

const SWEEP_PERIOD = 6.0 // seconds between sweeps
const SWEEP_DURATION = 1.2 // seconds per sweep traversal

/**
 * Renders a periodic horizontal scanline sweep in Deep Dive mode.
 * Sweeps downward from y = -20 to y = height + 20 with a trailing gradient wake.
 */
export function renderScanline(ctx: LayerContext): void {
  if (ctx.mix < 0.05 || ctx.reducedMotion || ctx.width <= 0 || ctx.height <= 0) {
    return
  }

  const alphaMult = ctx.mix * (ctx.palette.isLight ? 0.15 : 0.3)
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
  const wakeHeight = 40
  const wakeTop = y - wakeHeight

  const wakeGrad = c.createLinearGradient(0, wakeTop, 0, y)
  wakeGrad.addColorStop(0, rgbaToString(laserColor, 0))
  wakeGrad.addColorStop(0.7, rgbaToString(laserColor, alphaMult * 0.25))
  wakeGrad.addColorStop(1, rgbaToString(laserColor, alphaMult * 0.5))

  c.fillStyle = wakeGrad
  c.fillRect(0, wakeTop, width, wakeHeight)

  // Thin horizontal laser line
  c.lineWidth = 1.2
  c.strokeStyle = rgbaToString(palette.accentBright, alphaMult)
  c.shadowColor = rgbaToString(palette.accentBright, alphaMult)
  c.shadowBlur = 6
  c.beginPath()
  c.moveTo(0, y)
  c.lineTo(width, y)
  c.stroke()

  c.restore()
}
