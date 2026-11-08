import { LayerContext, lerpRGBA, rgbaToString } from '../types'

/**
 * Draws a rounded rectangle path compatible with all Canvas 2D contexts.
 */
function drawRoundedRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2))
  if (typeof c.roundRect === 'function') {
    c.roundRect(x, y, w, h, radius)
  } else {
    c.moveTo(x + radius, y)
    c.lineTo(x + w - radius, y)
    c.arcTo(x + w, y, x + w, y + radius, radius)
    c.lineTo(x + w, y + h - radius)
    c.arcTo(x + w, y + h, x + w - radius, y + h, radius)
    c.lineTo(x + radius, y + h)
    c.arcTo(x, y + h, x, y + h - radius, radius)
    c.lineTo(x, y + radius)
    c.arcTo(x, y, x + radius, y, radius)
  }
}

interface CircuitTrace {
  x0: number
  y0: number
  x1: number
  y1: number
  x2: number
  y2: number
}

/**
 * Renders technical hextech circuit traces, precision HUD corner brackets,
 * and outward sonar pulse waves around the hovered Bento tile in Deep Dive mode.
 *
 * Bails early in Quick Pitch mode (mix < 0.1) or when hover intensity is near zero.
 */
export function renderCircuit(ctx: LayerContext): void {
  if (
    ctx.mix < 0.1 ||
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

  const baseAlpha = ctx.mix * intensity * (ctx.palette.isLight ? 0.4 : 0.85)
  if (baseAlpha <= 0.001) {
    return
  }

  const { ctx: c, palette, time, reducedMotion } = ctx
  const safeTime = Number.isFinite(time) ? time : 0

  c.save()

  // -------------------------------------------------------------
  // 1. Sonar Ripple Pulse Expanding Outwards
  // -------------------------------------------------------------
  const rippleCount = reducedMotion ? 1 : 2
  const rippleSpeed = 0.65
  const maxExpand = 42

  for (let i = 0; i < rippleCount; i++) {
    const progress = reducedMotion ? 0.5 : ((safeTime * rippleSpeed + i * 0.5) % 1.0)
    const dist = progress * maxExpand
    const pulseAlpha = baseAlpha * (1 - progress) * 0.55
    if (pulseAlpha <= 0.002) continue

    const rx = rect.left - dist
    const ry = rect.top - dist
    const rw = rect.width + 2 * dist
    const rh = rect.height + 2 * dist
    const cornerR = 8 + dist * 0.2

    c.beginPath()
    drawRoundedRect(c, rx, ry, rw, rh, cornerR)
    c.strokeStyle = rgbaToString(lerpRGBA(palette.accent, palette.accentBright, 0.4), pulseAlpha)
    c.lineWidth = 1.0
    c.stroke()
  }

  // -------------------------------------------------------------
  // 2. Precision Corner HUD Brackets
  // Offset 6px from corners, arm length 16px, line width 1.2px
  // -------------------------------------------------------------
  const rRight = rect.right ?? (rect.left + rect.width)
  const rBottom = rect.bottom ?? (rect.top + rect.height)

  const offset = 6
  const arm = 16
  const left = rect.left - offset
  const top = rect.top - offset
  const right = rRight + offset
  const bottom = rBottom + offset

  c.lineWidth = 1.2
  c.strokeStyle = rgbaToString(palette.accentBright, baseAlpha)
  c.beginPath()

  // Top-Left Bracket
  c.moveTo(left, top + arm)
  c.lineTo(left, top)
  c.lineTo(left + arm, top)

  // Top-Right Bracket
  c.moveTo(right - arm, top)
  c.lineTo(right, top)
  c.lineTo(right, top + arm)

  // Bottom-Left Bracket
  c.moveTo(left, bottom - arm)
  c.lineTo(left, bottom)
  c.lineTo(left + arm, bottom)

  // Bottom-Right Bracket
  c.moveTo(right - arm, bottom)
  c.lineTo(right, bottom)
  c.lineTo(right, bottom - arm)

  c.stroke()

  // -------------------------------------------------------------
  // 3. Right-Angle Conductive Circuit Traces
  // Shooting from tile edges (out 14px, turn 90°, travel 24px)
  // Ending in glowing circular terminal nodes (radius 2.5px, shadowBlur = 6)
  // -------------------------------------------------------------
  const outDist = 14
  const travelDist = 24

  // Trace endpoints for terminal nodes: [x2, y2][]
  const endpoints: Array<[number, number]> = [
    // Top traces
    [rect.left + rect.width * 0.28 - travelDist, rect.top - outDist],
    [rect.left + rect.width * 0.72 + travelDist, rect.top - outDist],
    // Bottom traces
    [rect.left + rect.width * 0.32 - travelDist, rBottom + outDist],
    [rect.left + rect.width * 0.68 + travelDist, rBottom + outDist],
    // Left traces
    [rect.left - outDist, rect.top + rect.height * 0.35 - travelDist],
    [rect.left - outDist, rect.top + rect.height * 0.65 + travelDist],
    // Right traces
    [rRight + outDist, rect.top + rect.height * 0.35 - travelDist],
    [rRight + outDist, rect.top + rect.height * 0.65 + travelDist],
  ]

  const traceColor = lerpRGBA(palette.accent, palette.accentBright, 0.65)
  c.lineWidth = 1.2
  c.strokeStyle = rgbaToString(traceColor, baseAlpha * 0.85)

  // Draw conductive trace paths directly
  c.beginPath()

  // Top 1
  c.moveTo(rect.left + rect.width * 0.28, rect.top)
  c.lineTo(rect.left + rect.width * 0.28, rect.top - outDist)
  c.lineTo(endpoints[0][0], endpoints[0][1])

  // Top 2
  c.moveTo(rect.left + rect.width * 0.72, rect.top)
  c.lineTo(rect.left + rect.width * 0.72, rect.top - outDist)
  c.lineTo(endpoints[1][0], endpoints[1][1])

  // Bottom 1
  c.moveTo(rect.left + rect.width * 0.32, rBottom)
  c.lineTo(rect.left + rect.width * 0.32, rBottom + outDist)
  c.lineTo(endpoints[2][0], endpoints[2][1])

  // Bottom 2
  c.moveTo(rect.left + rect.width * 0.68, rBottom)
  c.lineTo(rect.left + rect.width * 0.68, rBottom + outDist)
  c.lineTo(endpoints[3][0], endpoints[3][1])

  // Left 1
  c.moveTo(rect.left, rect.top + rect.height * 0.35)
  c.lineTo(rect.left - outDist, rect.top + rect.height * 0.35)
  c.lineTo(endpoints[4][0], endpoints[4][1])

  // Left 2
  c.moveTo(rect.left, rect.top + rect.height * 0.65)
  c.lineTo(rect.left - outDist, rect.top + rect.height * 0.65)
  c.lineTo(endpoints[5][0], endpoints[5][1])

  // Right 1
  c.moveTo(rRight, rect.top + rect.height * 0.35)
  c.lineTo(rRight + outDist, rect.top + rect.height * 0.35)
  c.lineTo(endpoints[6][0], endpoints[6][1])

  // Right 2
  c.moveTo(rRight, rect.top + rect.height * 0.65)
  c.lineTo(rRight + outDist, rect.top + rect.height * 0.65)
  c.lineTo(endpoints[7][0], endpoints[7][1])

  c.stroke()

  // Terminal nodes at trace ends: batched into a single fill
  c.fillStyle = rgbaToString(palette.accentBright, baseAlpha)
  c.shadowColor = rgbaToString(palette.accentBright, baseAlpha)
  c.shadowBlur = 6

  c.beginPath()
  for (let i = 0; i < endpoints.length; i++) {
    const [nx, ny] = endpoints[i]
    c.moveTo(nx + 2.5, ny)
    c.arc(nx, ny, 2.5, 0, Math.PI * 2)
  }
  c.fill()

  c.shadowBlur = 0
  c.restore()
}
