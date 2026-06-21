/**
 * Page Entry — pure 2D canvas animation engine for the Grid→Page transition.
 * No React; driven by a start timestamp and a draw(ctx, t, w, h) call.
 *
 * Two modes, each ~1s, both originating from the clicked tile's center (or
 * viewport center when no origin rect is supplied):
 *
 *  - "quick" (Golden Canvas Brush): a liquid-gold radial wash spreads outward
 *    from the tile, gold-leaf shimmer particles drift up, and faint golden
 *    geometric line strokes sweep across — like a painting coming to life.
 *
 *  - "deep" (Hextech Matrix Boot): a sharp blue neon pulse flashes at the tile,
 *    bright hex-blue vector lines "trace" outward (blueprint boot sequence),
 *    a hex-coordinate digit matrix ticks up rapidly (data injection), and an
 *    electric-blue shockwave ring expands.
 *
 * Colors mirror the hexcore palette so the entry reads as one continuous piece
 * with the Core Collapse toggle. Particle count scales with hardwareConcurrency.
 *
 * One-shot effect (not a hot loop) — allocates freely; does not participate in
 * the hexcore's zero-allocation useFrame contract.
 */

import type { OriginRect } from "@/store/useNavigationStore"

export type EntryMode = "quick" | "deep"

const GOLD = "#C9A227"
const GOLD_BRIGHT = "#FFE875"
const GOLD_SOFT = "#FFB44A"
const BLUE = "#4A8FFF"
const BLUE_BRIGHT = "#6AFFFF"
const BLUE_DEEP = "#0A1A3A"
const DURATION = 1000 // ms; full cover→reveal effect

export interface EntryState {
  startTime: number | null
  mode: EntryMode
  originX: number
  originY: number
  particles: Particle[]
  /** pre-seeded angles for the geometric gold line strokes */
  strokes: { angle: number; offset: number; speed: number; len: number }[]
  /** pre-seeded target points for the blue vector "trace" lines */
  traces: { angle: number; len: number }[]
  /** pre-seeded rows/cols of hex-coordinate digits for the data matrix */
  matrix: { x: number; y: number; seed: number }[]
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

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}
function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t
}

/**
 * Resolve the effect origin from an optional captured tile rect. Falls back to
 * viewport center for non-tile navigations (Terminal, ⌘K, BackLink).
 */
function resolveOrigin(rect: OriginRect | null, w: number, h: number) {
  if (!rect) return { x: w / 2, y: h / 2 }
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

/** Build the per-entry particle/stroke set. Sized to viewport. */
export function initEntry(
  mode: EntryMode,
  w: number,
  h: number,
  originRect: OriginRect | null,
  bentoTilesBounds: Record<string, OriginRect> | null
): EntryState {
  const cores = (typeof navigator !== "undefined" && navigator.hardwareConcurrency) || 4
  const { x: ox, y: oy } = resolveOrigin(originRect, w, h)
  const maxR = Math.hypot(w, h) // worst-case distance from origin to a corner

  const particles: Particle[] = []

  // Spawns particles from clicked tile / origin
  const baseCount = cores < 4 ? 30 : 60
  for (let i = 0; i < baseCount; i++) {
    const a = Math.random() * Math.PI * 2
    const r = Math.random() * 50
    const speed = 100 + Math.random() * 200
    particles.push({
      x: ox + Math.cos(a) * r,
      y: oy + Math.sin(a) * r,
      vx: Math.cos(a) * speed,
      vy: mode === "quick" ? Math.sin(a) * speed - 60 : Math.sin(a) * speed,
      life: 0.5 + Math.random() * 0.5,
      size: 1 + Math.random() * 2.5,
      hue: mode === "quick" ? "gold" : "blue",
    })
  }

  // Spawns dissolve particles from other bento cards
  if (mode === "deep" && bentoTilesBounds) {
    Object.values(bentoTilesBounds).forEach((bounds) => {
      const count = cores < 4 ? 5 : 10
      const cx = bounds.left + bounds.width / 2
      const cy = bounds.top + bounds.height / 2
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2
        const r = Math.random() * Math.min(bounds.width, bounds.height) * 0.4
        const speed = 60 + Math.random() * 120
        particles.push({
          x: cx + Math.cos(a) * r,
          y: cy + Math.sin(a) * r,
          vx: Math.cos(a) * speed * 0.5,
          vy: Math.sin(a) * speed * 0.5 - 40, // float upwards
          life: 0.4 + Math.random() * 0.4,
          size: 1 + Math.random() * 2,
          hue: "blue",
        })
      }
    })
  }

  // Gold: faint sweeping geometric line strokes (Mel's signature).
  const strokes =
    mode === "quick"
      ? Array.from({ length: 7 }, () => ({
          angle: Math.random() * Math.PI * 2,
          offset: Math.random() * maxR,
          speed: 0.4 + Math.random() * 0.8,
          len: 0.2 * Math.min(w, h) + Math.random() * 0.3 * Math.min(w, h),
        }))
      : []

  // Blue: vector lines that "trace" outward like a blueprint boot sequence.
  const traces =
    mode === "deep"
      ? Array.from({ length: 14 }, (_, i) => ({
          angle: (i / 14) * Math.PI * 2 + Math.random() * 0.1,
          len: (0.3 + Math.random() * 0.7) * maxR,
        }))
      : []

  // Blue: a sparse grid of hex-coordinate digit cells for the data matrix.
  const matrix =
    mode === "deep"
      ? (() => {
          const cells: { x: number; y: number; seed: number }[] = []
          const gap = 120
          for (let x = gap / 2; x < w; x += gap) {
            for (let y = gap / 2; y < h; y += gap) {
              if (Math.random() < 0.6) {
                cells.push({ x, y, seed: Math.random() * 0xffff })
              }
            }
          }
          return cells
        })()
      : []

  return { startTime: null, mode, originX: ox, originY: oy, particles, strokes, traces, matrix }
}

function rgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

/** Draw a faint hex coordinate like "0x4A8" — purely decorative data injection. */
function drawHexLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  seed: number,
  p: number,
  alpha: number
) {
  const visible = (seed >> (Math.floor(p * 8) % 8)) & 0x0f // tick through nibbles
  const label = `0x${(0x1000 | (visible << 8) | (seed & 0xff)).toString(16).toUpperCase().slice(-3)}`
  ctx.globalAlpha = alpha
  ctx.fillStyle = BLUE_BRIGHT
  ctx.font = "10px ui-monospace, monospace"
  ctx.fillText(label, x, y)
}

/**
 * Advance + render one frame. Returns false when the effect is done.
 * `now` is a performance.now()-style timestamp.
 */
export function drawEntry(
  ctx: CanvasRenderingContext2D,
  state: EntryState,
  now: number,
  w: number,
  h: number
): boolean {
  if (state.startTime === null) state.startTime = now
  const elapsed = now - state.startTime
  const p = clamp01(elapsed / DURATION)
  if (p >= 1) return false

  const ox = state.originX
  const oy = state.originY
  const maxR = Math.hypot(w, h)
  const dt = 1 / 60

  // Clear with a near-black base so additive draws pop.
  ctx.globalCompositeOperation = "source-over"
  ctx.fillStyle = "rgba(5,5,5,1)"
  ctx.fillRect(0, 0, w, h)

  ctx.globalCompositeOperation = "lighter" // additive

  if (state.mode === "quick") {
    drawGoldenBrush(ctx, state, p, ox, oy, maxR, dt)
  } else {
    drawHextechBoot(ctx, state, p, ox, oy, maxR, w, h, dt)
  }

  // Reset composite for the next frame's clear.
  ctx.globalCompositeOperation = "source-over"
  ctx.globalAlpha = 1
  ctx.shadowBlur = 0

  return true
}

/** Quick-Pitch: Golden Canvas Brush. */
function drawGoldenBrush(
  ctx: CanvasRenderingContext2D,
  state: EntryState,
  p: number,
  ox: number,
  oy: number,
  maxR: number,
  dt: number
) {
  const coverP = easeInOutCubic(p)
  const washR = maxR * (0.15 + coverP * 1.0)
  const washA = 0.35 + coverP * 0.25

  // Liquid-gold radial wash expanding from the tile center.
  const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, washR)
  g.addColorStop(0, rgba(GOLD_BRIGHT, washA))
  g.addColorStop(0.4, rgba(GOLD, washA * 0.7))
  g.addColorStop(0.8, rgba(GOLD_SOFT, washA * 0.25))
  g.addColorStop(1, rgba(GOLD, 0))
  ctx.fillStyle = g
  // Cover the whole viewport regardless of origin position.
  ctx.fillRect(-maxR, -maxR, maxR * 3, maxR * 3)

  // Faint geometric line strokes sweeping across — Mel's signature.
  ctx.save()
  ctx.globalAlpha = (1 - p) * 0.5
  ctx.strokeStyle = GOLD_BRIGHT
  ctx.lineWidth = 1.2
  ctx.shadowBlur = 8
  ctx.shadowColor = GOLD
  for (const s of state.strokes) {
    const a = s.angle + p * s.speed
    const baseR = s.offset * (0.6 + coverP * 0.8)
    const x1 = ox + Math.cos(a) * baseR
    const y1 = oy + Math.sin(a) * baseR
    const x2 = ox + Math.cos(a) * (baseR + s.len)
    const y2 = oy + Math.sin(a) * (baseR + s.len)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  ctx.restore()

  // Gold-leaf shimmer particles drifting up and outward.
  for (const part of state.particles) {
    part.x += part.vx * dt * (0.6 + coverP)
    part.y += part.vy * dt * (0.6 + coverP)
    const color = GOLD_BRIGHT
    ctx.globalAlpha = (1 - p) * part.life
    ctx.fillStyle = color
    ctx.shadowBlur = 6
    ctx.shadowColor = color
    ctx.beginPath()
    ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** Deep-Dive: Hextech Matrix Boot. */
function drawHextechBoot(
  ctx: CanvasRenderingContext2D,
  state: EntryState,
  p: number,
  ox: number,
  oy: number,
  maxR: number,
  w: number,
  h: number,
  dt: number
) {
  const coverP = easeInOutCubic(p)
  const burstP = easeOutExpo(clamp01((p - 0.15) / 0.85))

  // Dark navy field tinted slightly blue — the "workshop" canvas.
  ctx.globalCompositeOperation = "source-over"
  ctx.fillStyle = rgba(BLUE_DEEP, 0.6 * coverP)
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = "lighter"

  // Hex-coordinate data matrix ticking up (data injection).
  const matrixA = clamp01(1 - p * 1.3) * 0.5
  if (matrixA > 0.01) {
    for (const cell of state.matrix) {
      drawHexLabel(ctx, cell.x, cell.y, cell.seed, p, matrixA)
    }
  }

  // Blue vector lines "trace" outward — blueprint boot sequence.
  ctx.save()
  ctx.globalAlpha = (1 - p) * 0.9
  ctx.strokeStyle = BLUE_BRIGHT
  ctx.lineWidth = 1.5
  ctx.shadowBlur = 10
  ctx.shadowColor = BLUE_BRIGHT
  for (const t of state.traces) {
    const r = t.len * burstP
    ctx.beginPath()
    ctx.moveTo(ox, oy)
    ctx.lineTo(ox + Math.cos(t.angle) * r, oy + Math.sin(t.angle) * r)
    ctx.stroke()
  }
  ctx.restore()

  // Sharp neon pulse at the tile center (peak near p≈0.12).
  const pulseP = clamp01(1 - Math.abs(p - 0.12) * 5)
  if (pulseP > 0.01) {
    const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, Math.min(w, h) * 0.18)
    g.addColorStop(0, rgba(BLUE_BRIGHT, pulseP * 0.8))
    g.addColorStop(0.6, rgba(BLUE, pulseP * 0.3))
    g.addColorStop(1, rgba(BLUE, 0))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }

  // Electric-blue shockwave ring expanding outward.
  if (burstP > 0.001 && burstP < 1) {
    const ringR = burstP * maxR * 0.9
    ctx.save()
    ctx.globalAlpha = (1 - burstP) * 0.8
    ctx.strokeStyle = BLUE_BRIGHT
    ctx.lineWidth = 2.5
    ctx.shadowBlur = 16
    ctx.shadowColor = BLUE_BRIGHT
    ctx.beginPath()
    ctx.arc(ox, oy, ringR, 0, Math.PI * 2)
    ctx.stroke()
    // Secondary inner ring.
    ctx.globalAlpha = (1 - burstP) * 0.5
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(ox, oy, ringR * 0.78, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  // Particles radiate outward then settle as the page reveals.
  for (const part of state.particles) {
    part.x += part.vx * dt * burstP
    part.y += part.vy * dt * burstP
    const color = BLUE_BRIGHT
    ctx.globalAlpha = (1 - p) * part.life
    ctx.fillStyle = color
    ctx.shadowBlur = 6
    ctx.shadowColor = color
    ctx.beginPath()
    ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2)
    ctx.fill()
  }
}
