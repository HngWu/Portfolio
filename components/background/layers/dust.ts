import { LayerContext, rgbaToString } from '../types'

export interface DustMote {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  baseAlpha: number
  phase: number
  life: number
  maxLife: number
}

/**
 * Initializes an array of ambient mana dust motes randomly distributed across the screen.
 */
export function initDustMotes(count: number, width: number, height: number): DustMote[] {
  const motes: DustMote[] = []
  const safeW = Math.max(1, width)
  const safeH = Math.max(1, height)

  for (let i = 0; i < count; i++) {
    const maxLife = 6 + Math.random() * 8
    motes.push({
      x: Math.random() * safeW,
      y: Math.random() * safeH,
      vx: 0,
      vy: 0,
      size: 1.0 + Math.random() * 2.0,
      baseAlpha: 0.25 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      life: Math.random() * maxLife,
      maxLife,
    })
  }

  return motes
}

/**
 * Updates and renders floating mana dust particles that drift upward,
 * oscillate laterally, and swirl away from the pointer.
 * When reducedMotion or pointer.isCoarse, maintains simple calm linear drift.
 * Bails early in Deep Dive mode (mix > 0.85).
 */
export function renderDust(ctx: LayerContext, motes: DustMote[]): void {
  if (ctx.mix > 0.85 || motes.length === 0 || ctx.width <= 0 || ctx.height <= 0) {
    return
  }

  const overallAlpha = (1 - ctx.mix / 0.85) * (ctx.palette.isLight ? 0.5 : 1.0)
  if (overallAlpha <= 0.001) {
    return
  }

  const { ctx: c, width, height, time, dt, palette, pointer, reducedMotion, config } = ctx
  const safeDt = Number.isFinite(dt) && dt > 0 ? Math.min(dt, 0.1) : 0.016
  const safeTime = Number.isFinite(time) ? time : 0

  const baseAccent = rgbaToString(palette.accent, 1)
  const baseAccentBright = rgbaToString(palette.accentBright, 1)

  c.save()

  // 1. Update motes positions, lifetimes, and boundaries
  for (let i = 0; i < motes.length; i++) {
    const mote = motes[i]

    // Update particle lifetime
    mote.life += safeDt
    const isExpired = mote.life >= mote.maxLife

    if (reducedMotion) {
      // Simple calm linear drift (no lateral wave, no mouse interaction)
      const calmSpeed = config.speed.dustRiseSpeed * 0.5
      mote.vx = 0
      mote.vy = -calmSpeed * safeDt
      mote.x += mote.vx
      mote.y += mote.vy
    } else {
      // 1. Upward drift and lateral wave
      let vy = -config.speed.dustRiseSpeed * safeDt * (0.8 + 0.4 * Math.sin(mote.phase))
      let vx = pointer.isCoarse
        ? 0
        : Math.sin(safeTime * 0.8 + mote.phase) * 12 * safeDt

      // 2. Cursor repulsion & swirl (disabled for coarse pointers)
      if (!pointer.isCoarse && pointer.active) {
        const dx = mote.x - pointer.x
        const dy = mote.y - pointer.y
        const distSq = dx * dx + dy * dy

        if (distSq < 19600 && distSq > 1) { // 140^2 = 19600
          const dist = Math.sqrt(distSq)
          const nx = dx / dist
          const ny = dy / dist
          const force = 1 - dist / 140

          // Push radially outward away from cursor
          const pushMag = force * 90 * safeDt
          // Impart tangential swirl velocity (perpendicular to radial vector: -ny, nx)
          const swirlMag = force * 60 * safeDt

          vx += nx * pushMag - ny * swirlMag
          vy += ny * pushMag + nx * swirlMag
        }
      }

      mote.vx = vx
      mote.vy = vy
      mote.x += mote.vx
      mote.y += mote.vy
    }

    // Wrap around edges or reset on expiration
    if (isExpired || mote.y < -10) {
      mote.y = height + 10
      mote.x = Math.random() * width
      mote.life = 0
      mote.maxLife = 6 + Math.random() * 8
    } else if (mote.y > height + 15) {
      mote.y = height + 10
      mote.x = Math.random() * width
      mote.life = 0
    }

    if (mote.x < -10) {
      mote.x = width + 10
    } else if (mote.x > width + 10) {
      mote.x = -10
    }
  }

  // 2. Render Stardust Constellation Threads linking nearby motes
  if (!reducedMotion && overallAlpha > 0.001) {
    let hasLines = false
    c.beginPath()
    const maxDistSq = 65 * 65
    for (let i = 0; i < motes.length; i++) {
      const mi = motes[i]
      if (mi.y < 0 || mi.y > height || mi.x < 0 || mi.x > width) continue
      for (let j = i + 1; j < motes.length; j++) {
        const mj = motes[j]
        const dx = mj.x - mi.x
        const dy = mj.y - mi.y
        const distSq = dx * dx + dy * dy
        if (distSq < maxDistSq) {
          c.moveTo(mi.x, mi.y)
          c.lineTo(mj.x, mj.y)
          hasLines = true
        }
      }
    }
    if (hasLines) {
      c.strokeStyle = baseAccentBright
      c.lineWidth = 0.6
      c.globalAlpha = 0.25 * overallAlpha
      c.stroke()
    }
  }

  // 3. Render motes dots with glow
  for (let i = 0; i < motes.length; i++) {
    const mote = motes[i]

    // Compute lifetime fade factor (fade in at start, fade out near end)
    const lifeRatio = Math.max(0, Math.min(1, mote.life / mote.maxLife))
    const lifeFade = Math.sin(lifeRatio * Math.PI)

    // Render mote with glow using globalAlpha for zero allocation
    const shimmer = reducedMotion ? 1.0 : 0.8 + 0.2 * Math.sin(safeTime * 1.5 + mote.phase)
    const effAlpha = Math.max(0, Math.min(1, mote.baseAlpha * overallAlpha * shimmer * lifeFade))
    if (effAlpha <= 0.005) {
      continue
    }

    // Subtle outer halo glow
    c.fillStyle = baseAccent
    c.globalAlpha = effAlpha * 0.5
    c.beginPath()
    c.arc(mote.x, mote.y, mote.size * 2, 0, Math.PI * 2)
    c.fill()

    // Inner bright core
    c.fillStyle = baseAccentBright
    c.globalAlpha = effAlpha
    c.beginPath()
    c.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2)
    c.fill()
  }

  c.restore()
}
