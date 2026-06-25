/**
 * Core Collapse — pure 2D canvas animation engine for the Quick-Pitch ⇄ Deep-Dive
 * mode toggle. No React; driven by a start timestamp and a draw(ctx, t, w, h) call.
 *
 * Two directions, each ~1s:
 *  - gold-to-blue ("cool & shatter"): gold wash covers → shards retract to a
 *    central hex-core flash → electric-blue grid lines explode outward.
 *  - blue-to-gold ("dissolve & diffuse"): blue grid dissolves into particles →
 *    warm gold diffuses outward from center like ink in water.
 *
 * Colors mirror the hexcore palette so the transition reads as one continuous
 * piece with the 3D hero. Particle count scales with hardwareConcurrency.
 *
 * This is a one-shot effect (not a hot loop), so it allocates freely — it does
 * not participate in the hexcore's zero-allocation useFrame contract.
 */

export type CollapseDirection = "gold-to-blue" | "blue-to-gold"

const GOLD = "#C9A227"
const GOLD_BRIGHT = "#FFE875"
const GOLD_SOFT = "#FFB44A"
const BLUE = "#4A8FFF"
const BLUE_BRIGHT = "#6AFFFF"
const DURATION = 1000 // ms, full effect; cover/peak/reveal timing handled by the store

export interface CollapseState {
  startTime: number | null
  direction: CollapseDirection
  particles: Particle[]
  shards: Shard[]
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number // 0..1
  size: number
  hue: "gold" | "blue"
}

interface Shard {
  // a fragment of the collapsing core — defined by a base angle + radius + spin
  angle: number
  radius: number
  len: number
  spin: number
  hue: "gold" | "blue"
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}
function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t
}

/** Build the per-transition particle/shard set. Sized to viewport. */
export function initCollapse(direction: CollapseDirection, w: number, h: number): CollapseState {
  const cores = (typeof navigator !== "undefined" && navigator.hardwareConcurrency) || 4
  const particleCount = cores < 4 ? 60 : cores < 8 ? 110 : 160
  const cx = w / 2
  const cy = h / 2
  const maxR = Math.hypot(w, h) / 2

  const particles: Particle[] = []
  for (let i = 0; i < particleCount; i++) {
    const a = Math.random() * Math.PI * 2
    const r = Math.random() * maxR * 0.9
    const speed = 60 + Math.random() * 220
    particles.push({
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
      vx: Math.cos(a) * speed * (direction === "gold-to-blue" ? -1 : 1),
      vy: Math.sin(a) * speed * (direction === "gold-to-blue" ? -1 : 1),
      life: 0.5 + Math.random() * 0.5,
      size: 1 + Math.random() * 2.5,
      hue: direction === "gold-to-blue" ? "gold" : "blue",
    })
  }

  // Hex-core shards: 6 edges of a hexagon, plus an inner ring of 6.
  const shards: Shard[] = []
  for (let ring = 0; ring < 2; ring++) {
    for (let i = 0; i < 6; i++) {
      shards.push({
        angle: (i / 6) * Math.PI * 2 + ring * (Math.PI / 6),
        radius: (ring === 0 ? 0.42 : 0.7) * Math.min(w, h) * 0.18,
        len: 0.16 * Math.min(w, h),
        spin: (Math.random() - 0.5) * 2,
        hue: ring === 0 ? "gold" : "blue",
      })
    }
  }

  return { startTime: null, direction, particles, shards }
}

/** Draw a regular-hex outline centered at (cx,cy) with given radius & rotation. */
function strokeHex(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  rotation: number,
  color: string,
  width: number,
  alpha: number
) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.shadowBlur = 18
  ctx.shadowColor = color
  ctx.beginPath()
  for (let i = 0; i <= 6; i++) {
    const a = rotation + (i / 6) * Math.PI * 2
    const x = cx + Math.cos(a) * radius
    const y = cy + Math.sin(a) * radius
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.restore()
}

function rgba(hex: string, a: number): string {
  // quick #RRGGBB → rgba()
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

/**
 * Advance + render one frame. Returns false when the effect is done (caller
 * should stop the rAF loop). `now` is a performance.now()-style timestamp.
 */
export function drawCollapse(ctx: CanvasRenderingContext2D, state: CollapseState, now: number, w: number, h: number): boolean {
  if (state.startTime === null) state.startTime = now
  const elapsed = now - state.startTime
  const p = clamp01(elapsed / DURATION)
  if (p >= 1) return false

  const cx = w / 2
  const cy = h / 2
  const maxR = Math.hypot(w, h) / 2
  const dt = 1 / 60 // normalized step; effect is time-driven via p

  // Clear with a near-black base so additive draws pop.
  ctx.globalCompositeOperation = "source-over"
  ctx.fillStyle = "rgba(5,5,5,1)"
  ctx.fillRect(0, 0, w, h)

  ctx.globalCompositeOperation = "lighter" // additive

  if (state.direction === "gold-to-blue") {
    // Phase A (0–0.55): gold wash covers, shards retract to center, hex core flares.
    // Phase B (0.45–1.0): blue grid shockwave explodes outward.
    const coverP = easeInOutCubic(clamp01(p / 0.55))
    const burstP = easeOutQuart(clamp01((p - 0.4) / 0.6))

    // Gold radial wash that recedes as blue takes over.
    const washR = maxR * (0.2 + coverP * 0.9)
    const washA = (1 - burstP) * 0.5
    if (washA > 0.01) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, washR)
      g.addColorStop(0, rgba(GOLD_BRIGHT, washA))
      g.addColorStop(0.5, rgba(GOLD, washA * 0.5))
      g.addColorStop(1, rgba(GOLD_SOFT, 0))
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }

    // Shards retract toward the hex core, fading as they arrive.
    for (const s of state.shards) {
      const retract = 1 - easeInOutCubic(clamp01(p / 0.5))
      const r = s.radius * retract
      const a = clamp01(retract * 1.2) * 0.9
      if (a < 0.02) continue
      const ang = s.angle + s.spin * p
      ctx.save()
      ctx.globalAlpha = a
      ctx.strokeStyle = s.hue === "gold" ? GOLD_BRIGHT : BLUE_BRIGHT
      ctx.lineWidth = 2
      ctx.shadowBlur = 10
      ctx.shadowColor = ctx.strokeStyle as string
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r)
      ctx.lineTo(cx + Math.cos(ang) * (r + s.len), cy + Math.sin(ang) * (r + s.len))
      ctx.stroke()
      ctx.restore()
    }

    // Central hex-core flash, peaking near p≈0.5.
    const coreP = clamp01(1 - Math.abs(p - 0.5) * 3)
    if (coreP > 0.01) {
      strokeHex(ctx, cx, cy, Math.min(w, h) * 0.12, p * 1.5, GOLD_BRIGHT, 3, coreP)
      strokeHex(ctx, cx, cy, Math.min(w, h) * 0.16, -p * 1.2, GOLD, 2, coreP * 0.7)
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.18)
      g.addColorStop(0, rgba(GOLD_BRIGHT, coreP * 0.6))
      g.addColorStop(1, rgba(GOLD, 0))
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }

    // Blue shockwave ring exploding outward.
    if (burstP > 0.001 && burstP < 1) {
      const ringR = burstP * maxR * 1.1
      strokeHex(ctx, cx, cy, ringR, burstP * 0.8, BLUE_BRIGHT, 2.5, (1 - burstP) * 0.9)
      strokeHex(ctx, cx, cy, ringR * 0.8, -burstP * 0.6, BLUE, 2, (1 - burstP) * 0.7)
      // Faint blue grid lines emanating.
      ctx.save()
      ctx.globalAlpha = (1 - burstP) * 0.4
      ctx.strokeStyle = BLUE
      ctx.lineWidth = 1
      ctx.shadowBlur = 8
      ctx.shadowColor = BLUE
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(a) * ringR, cy + Math.sin(a) * ringR)
        ctx.stroke()
      }
      ctx.restore()
    }

    // Particles stream inward then outward as blue.
    for (const part of state.particles) {
      const inward = easeInOutCubic(clamp01(p / 0.5))
      const outward = easeOutQuart(clamp01((p - 0.45) / 0.55))
      const dir = p < 0.5 ? -1 : 1
      const mag = p < 0.5 ? inward : outward
      part.x += part.vx * dt * dir * mag
      part.y += part.vy * dt * dir * mag
      const color = p < 0.5 ? GOLD_BRIGHT : BLUE_BRIGHT
      ctx.globalAlpha = (1 - Math.abs(p - 0.5) * 1.4) * part.life
      ctx.fillStyle = color
      ctx.shadowBlur = 6
      ctx.shadowColor = color
      ctx.beginPath()
      ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2)
      ctx.fill()
    }
  } else {
    // blue-to-gold ("dissolve & diffuse")
    const dissolveP = easeOutQuart(clamp01(p / 0.5))
    const diffuseP = easeInOutCubic(clamp01((p - 0.35) / 0.65))

    // Blue grid dissolves — draw fading hex grid that breaks apart.
    const gridA = (1 - dissolveP) * 0.5
    if (gridA > 0.01) {
      ctx.save()
      ctx.globalAlpha = gridA
      ctx.strokeStyle = BLUE
      ctx.lineWidth = 1
      ctx.shadowBlur = 6
      ctx.shadowColor = BLUE
      const gap = 44
      const drift = dissolveP * 30
      for (let x = -drift % gap; x < w; x += gap) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = -drift % gap; y < h; y += gap) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      ctx.restore()
    }

    // Warm gold diffusion expanding from center like ink in water.
    if (diffuseP > 0.001) {
      const diffR = diffuseP * maxR * 1.2
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, diffR)
      g.addColorStop(0, rgba(GOLD_BRIGHT, diffuseP * 0.55))
      g.addColorStop(0.4, rgba(GOLD, diffuseP * 0.4))
      g.addColorStop(0.75, rgba(GOLD_SOFT, diffuseP * 0.18))
      g.addColorStop(1, rgba(GOLD, 0))
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      // Leading gold ring.
      strokeHex(ctx, cx, cy, diffR * 0.85, diffuseP * 0.9, GOLD_BRIGHT, 2, (1 - diffuseP) * 0.6 + 0.1)
    }

    // Particles drift outward, shifting blue → gold.
    for (const part of state.particles) {
      part.x += part.vx * dt * dissolveP
      part.y += part.vy * dt * dissolveP
      const mix = clamp01((p - 0.2) / 0.6)
      const color = mix > 0.5 ? GOLD_BRIGHT : BLUE_BRIGHT
      ctx.globalAlpha = (1 - p) * part.life + 0.1
      ctx.fillStyle = color
      ctx.shadowBlur = 6
      ctx.shadowColor = color
      ctx.beginPath()
      ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2)
      ctx.fill()
    }

    // Central gold bloom as it settles.
    if (p > 0.6) {
      const settleP = clamp01((p - 0.6) / 0.4)
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.25)
      g.addColorStop(0, rgba(GOLD_BRIGHT, settleP * 0.5))
      g.addColorStop(1, rgba(GOLD, 0))
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }
  }

  // Reset composite for the next frame's clear.
  ctx.globalCompositeOperation = "source-over"
  ctx.globalAlpha = 1
  ctx.shadowBlur = 0

  return true
}
