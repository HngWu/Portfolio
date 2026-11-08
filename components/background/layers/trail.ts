import { LayerContext, lerpRGBA, rgbaToString } from '../types'

/**
 * Renders an ethereal wisp trailing behind the cursor.
 * Amethyst in Quick Pitch morphing to electric cyan in Deep Dive.
 * Line width tapers from ~3px at the head to 0.5px at the tail with composite soft glow.
 */
export function renderTrail(ctx: LayerContext): void {
  if (ctx.pointer.isCoarse || ctx.trail.length < 2 || ctx.reducedMotion) {
    return
  }

  const { ctx: c, trail, mix, palette } = ctx
  const trailColor = lerpRGBA(palette.secondaryAmethyst, palette.accentBright, mix)
  const isHeadFirst = trail[0].alpha >= trail[trail.length - 1].alpha
  const total = trail.length

  c.save()
  c.shadowColor = rgbaToString(trailColor, palette.isLight ? 0.35 : 0.75)
  c.shadowBlur = 8
  c.lineCap = 'round'
  c.lineJoin = 'round'

  for (let i = 0; i < total - 1; i++) {
    const p0 = trail[i]
    const p1 = trail[i + 1]

    const avgAlpha = (p0.alpha + p1.alpha) * 0.5
    const effAlpha = avgAlpha * (palette.isLight ? 0.6 : 1.0)
    if (effAlpha <= 0.005) {
      continue
    }

    const headRatio = isHeadFirst
      ? 1 - i / (total - 1)
      : (i + 0.5) / (total - 1)

    const width = 0.5 + 2.5 * Math.max(0, Math.min(1, headRatio))
    c.lineWidth = width
    c.strokeStyle = rgbaToString(trailColor, effAlpha)

    c.beginPath()
    if (i === 0) {
      c.moveTo(p0.x, p0.y)
      const midX = (p0.x + p1.x) * 0.5
      const midY = (p0.y + p1.y) * 0.5
      c.lineTo(midX, midY)
    } else {
      const prev = trail[i - 1]
      const prevMidX = (prev.x + p0.x) * 0.5
      const prevMidY = (prev.y + p0.y) * 0.5
      const nextMidX = (p0.x + p1.x) * 0.5
      const nextMidY = (p0.y + p1.y) * 0.5
      c.moveTo(prevMidX, prevMidY)
      c.quadraticCurveTo(p0.x, p0.y, nextMidX, nextMidY)
    }
    c.stroke()
  }

  // Final connecting stroke to the last point
  const lastP = trail[total - 1]
  const secondLastP = trail[total - 2]
  const lastMidX = (secondLastP.x + lastP.x) * 0.5
  const lastMidY = (secondLastP.y + lastP.y) * 0.5
  const lastEffAlpha = lastP.alpha * (palette.isLight ? 0.6 : 1.0)

  if (lastEffAlpha > 0.005) {
    const lastHeadRatio = isHeadFirst ? 0 : 1
    c.lineWidth = 0.5 + 2.5 * lastHeadRatio
    c.strokeStyle = rgbaToString(trailColor, lastEffAlpha)
    c.beginPath()
    c.moveTo(lastMidX, lastMidY)
    c.lineTo(lastP.x, lastP.y)
    c.stroke()
  }

  c.restore()
}
