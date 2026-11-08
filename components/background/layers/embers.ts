import { LayerContext, lerpRGBA, rgbaToString } from '../types'

export interface EmberParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  life: number
  maxLife: number
  drift: number
  speed?: number
}

/**
 * Initializes an array of tile ember particles.
 */
export function initTileEmbers(count = 40): EmberParticle[] {
  const embers: EmberParticle[] = []
  const safeCount = Math.max(0, count)

  for (let i = 0; i < safeCount; i++) {
    const maxLife = 1.2 + Math.random() * 1.6
    embers.push({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 1.0 + Math.random() * 1.8,
      alpha: 0,
      life: Math.random() * maxLife,
      maxLife,
      drift: Math.random() * Math.PI * 2,
      speed: 25 + Math.random() * 35,
    })
  }

  return embers
}

/**
 * Generates a random spawn coordinate uniformly along the perimeter edges of a rectangle.
 */
function spawnOnPerimeter(rect: DOMRect): { x: number; y: number } {
  const w = Math.max(1, rect.width)
  const h = Math.max(1, rect.height)
  const perimeter = 2 * (w + h)

  const p = Math.random() * perimeter
  if (p < w) {
    // Top edge (moving left to right)
    return { x: rect.left + p, y: rect.top }
  } else if (p < w + h) {
    // Right edge (moving top to bottom)
    return { x: rect.left + w, y: rect.top + (p - w) }
  } else if (p < 2 * w + h) {
    // Bottom edge (moving right to left)
    return { x: rect.left + w - (p - (w + h)), y: rect.top + h }
  } else {
    // Left edge (moving bottom to top)
    return { x: rect.left, y: rect.top + h - (p - (2 * w + h)) }
  }
}

/**
 * Updates and renders ascending arcane ember sparks spawning along the perimeter
 * of the currently hovered Bento tile in Quick Pitch mode.
 *
 * Bails early in Deep Dive mode (mix > 0.8) or when hover intensity is near zero.
 */
export function renderEmbers(ctx: LayerContext, embers: EmberParticle[]): void {
  if (
    ctx.mix > 0.8 ||
    ctx.tile.intensity <= 0.005 ||
    !ctx.tile.rect ||
    embers.length === 0 ||
    ctx.width <= 0 ||
    ctx.height <= 0
  ) {
    return
  }

  const { rect, intensity } = ctx.tile
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return
  }

  const baseAlpha = (1 - ctx.mix) * intensity * (ctx.palette.isLight ? 0.5 : 1.0)
  if (baseAlpha <= 0.001) {
    return
  }

  const { ctx: c, palette, time, dt, reducedMotion } = ctx
  const safeDt = Number.isFinite(dt) && dt > 0 ? Math.min(dt, 0.1) : 0.016
  const safeTime = Number.isFinite(time) ? time : 0

  // Hoist colors outside loop
  const sparkColor = lerpRGBA(palette.accentSoft, palette.accentBright, 0.5)

  c.save()

  for (let i = 0; i < embers.length; i++) {
    const ember = embers[i]

    // Respawn along perimeter when life expired or initial unplaced particle
    if (ember.life >= ember.maxLife) {
      const pos = spawnOnPerimeter(rect)
      ember.x = pos.x
      ember.y = pos.y
      ember.life = 0
      ember.maxLife = 1.0 + Math.random() * 1.5
      ember.size = 1.0 + Math.random() * 1.8
      ember.drift = Math.random() * Math.PI * 2
      ember.speed = 25 + Math.random() * 35
    } else if (ember.x === 0 && ember.y === 0) {
      const pos = spawnOnPerimeter(rect)
      ember.x = pos.x
      ember.y = pos.y
    }

    // Advance particle age
    ember.life += safeDt

    // Kinematic updates: upward float and lateral drift (frozen if reducedMotion)
    if (!reducedMotion) {
      const speed = ember.speed ?? (25 + Math.random() * 35)
      const vy = -speed * safeDt
      const vx = Math.sin(ember.drift + safeTime * 3) * 15 * safeDt
      ember.vx = vx
      ember.vy = vy
      ember.x += vx
      ember.y += vy
    }

    // Smooth life ratio fade in and fade out
    const lifeRatio = Math.max(0, Math.min(1, ember.life / ember.maxLife))
    ember.alpha = Math.sin(lifeRatio * Math.PI)

    const particleAlpha = ember.alpha * baseAlpha
    if (particleAlpha <= 0.002) {
      continue
    }

    // Render as glowing ember spark
    c.beginPath()
    c.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2)
    c.fillStyle = rgbaToString(sparkColor, particleAlpha)
    c.shadowColor = rgbaToString(palette.accentBright, particleAlpha * 0.75)
    c.shadowBlur = 5
    c.fill()
  }

  c.shadowBlur = 0
  c.restore()
}
