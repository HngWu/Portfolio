/**
 * Page Entry — pure 2D canvas animation engine for the Grid→Page transition.
 * No React; driven by a phase + a draw(ctx, now, w, h) call.
 *
 * Two coordinated phases, each mode-aware, both originating from the clicked
 * tile's center (or viewport center when no origin rect is supplied):
 *
 *  - "cover": the golden brush / hextech boot sweeps outward from the origin
 *    until the viewport is fully occluded. Ends on the peak frame, where the
 *    route swap happens behind the canvas.
 *
 *  - "reveal": the cover *unwinds back toward the origin* so page B shows
 *    through. The wash contracts, particles fall back inward, and a bright
 *    leading edge expands from the origin — the page is "opened" from exactly
 *    where the user clicked. This is the seamlessness fix: it replaces the old
 *    60ms opacity pop that exposed a half-rendered page.
 *
 * Modes:
 *  - "quick" (Golden Canvas Brush): liquid-gold radial wash, gold-leaf shimmer,
 *    faint geometric line strokes. Reveal reads as a brush stroke opening.
 *
 *  - "deep" (Hextech Matrix Boot): neon pulse, blue vector "trace" lines, a
 *    hex-coordinate digit matrix ticking up, electric-blue shockwave. Reveal
 *    reads as a blueprint scanner finishing its boot (raster scan from origin).
 *
 * Colors mirror the hexcore palette so the entry reads as one continuous piece
 * with the Core Collapse toggle. Particle count scales with hardwareConcurrency.
 *
 * One-shot effect (not a hot loop) — allocates freely; does not participate in
 * the hexcore's zero-allocation useFrame contract.
 */

import type { OriginRect } from "@/store/useNavigationStore"

export type EntryMode = "quick" | "deep"
export type EntryPhase = "cover" | "holding" | "peak" | "reveal"

const GOLD = "#C9A227"
const GOLD_BRIGHT = "#FFE875"
const GOLD_SOFT = "#FFB44A"
const BLUE = "#4A8FFF"
const BLUE_BRIGHT = "#6AFFFF"
const BLUE_DEEP = "#0A1A3A"

/** ms for the cover sweep to reach full occlusion. */
const COVER_DURATION = 600
/** ms for the reveal sweep to fully unwind back to the origin. */
const REVEAL_DURATION = 600

export interface EntryState {
  phase: EntryPhase
  phaseStartTime: number | null
  /** previous frame's timestamp, for real dt */
  lastTime: number | null
  mode: EntryMode
  originX: number
  originY: number
  radarAngle?: number
  particles: Particle[]
  /** pre-seeded angles for the geometric gold line strokes */
  strokes: { angle: number; offset: number; speed: number; len: number }[]
  /** pre-seeded target points for the blue vector "trace" lines */
  traces: { angle: number; len: number }[]
  /** pre-seeded rows/cols of hex-coordinate digits for the data matrix */
  matrix: { x: number; y: number; dist: number; seed: number }[]
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
function easeInExpo(t: number): number {
  return t <= 0 ? 0 : Math.pow(2, 10 * t - 10)
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
  // Each cell stores its normalized distance from the origin so the reveal
  // scan can switch cells off in a radial wave.
  const matrix =
    mode === "deep"
      ? (() => {
          const cells: { x: number; y: number; dist: number; seed: number }[] = []
          const gap = 120
          for (let x = gap / 2; x < w; x += gap) {
            for (let y = gap / 2; y < h; y += gap) {
              if (Math.random() < 0.6) {
                const d = Math.hypot(x - ox, y - oy) / maxR
                cells.push({ x, y, dist: clamp01(d), seed: Math.random() * 0xffff })
              }
            }
          }
          return cells
        })()
      : []

  return {
    phase: "cover",
    phaseStartTime: null,
    lastTime: null,
    mode,
    originX: ox,
    originY: oy,
    particles,
    strokes,
    traces,
    matrix,
  }
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
 * Advance + render one frame. Returns false when the current phase is done
 * and the engine has nothing more to animate (used by PageEntryOverlay to
 * keep the peak frame live without burning rAF). `now` is a
 * performance.now()-style timestamp.
 *
 * Callers transition `state.phase` externally (cover→peak→reveal); the draw
 * function never changes phase itself — it just plays the current one.
 */
export function drawEntry(
  ctx: CanvasRenderingContext2D,
  state: EntryState,
  now: number,
  w: number,
  h: number
): boolean {
  if (state.phaseStartTime === null) state.phaseStartTime = now

  // Real, clamped dt so particle motion is framerate-independent.
  const last = state.lastTime ?? now
  const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05)
  state.lastTime = now

  // Peak holds the final cover frame statically — the route swap happens here.
  // Keep returning true so the overlay keeps the canvas opaque while covered.
  if (state.phase === "peak") {
    drawPeak(ctx, state, w, h)
    return true
  }

  const elapsed = now - state.phaseStartTime
  const ox = state.originX
  const oy = state.originY
  const maxR = Math.hypot(w, h)

  if (state.phase === "holding") {
    if (state.mode === "quick") {
      drawGoldenHolding(ctx, state, ox, oy, maxR, w, h, dt, elapsed)
    } else {
      drawHextechHolding(ctx, state, ox, oy, maxR, w, h, dt, elapsed)
    }
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
    return true
  }

  ctx.globalCompositeOperation = "source-over"
  if (state.phase === "reveal") {
    // Reveal: clear to *transparent* so page B shows through everywhere the
    // reveal functions don't paint (outside the shrinking origin disc). This is
    // the key difference from cover/peak, which need an opaque base.
    ctx.clearRect(0, 0, w, h)
  } else {
    // Cover: fill with a near-black base so additive draws pop.
    ctx.fillStyle = "rgba(5,5,5,1)"
    ctx.fillRect(0, 0, w, h)
  }

  ctx.globalCompositeOperation = "lighter" // additive

  let alive: boolean
  if (state.phase === "cover") {
    const p = clamp01(elapsed / COVER_DURATION)
    if (state.mode === "quick") drawGoldenCover(ctx, state, p, ox, oy, maxR, dt)
    else drawHextechCover(ctx, state, p, ox, oy, maxR, w, h, dt)
    // Cover is "done" at p=1, but the overlay holds the peak frame separately,
    // so we report alive=false to stop the rAF; the overlay will restart it for
    // the reveal phase.
    alive = p < 1
  } else {
    // reveal
    const p = clamp01(elapsed / REVEAL_DURATION)
    if (state.mode === "quick") drawGoldenReveal(ctx, state, p, ox, oy, maxR, w, h, dt)
    else drawHextechReveal(ctx, state, p, ox, oy, maxR, w, h, dt)
    alive = p < 1
  }

  // Reset composite for the next frame's clear.
  ctx.globalCompositeOperation = "source-over"
  ctx.globalAlpha = 1
  ctx.shadowBlur = 0

  return alive
}

/** Repaint the held peak frame (no time advance). */
function drawPeak(ctx: CanvasRenderingContext2D, state: EntryState, w: number, h: number) {
  ctx.globalCompositeOperation = "source-over"
  ctx.fillStyle = "rgba(5,5,5,1)"
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = "lighter"
  if (state.mode === "quick") drawGoldenCover(ctx, state, 1, state.originX, state.originY, Math.hypot(w, h), 0)
  else drawHextechCover(ctx, state, 1, state.originX, state.originY, Math.hypot(w, h), w, h, 0)
  ctx.globalCompositeOperation = "source-over"
  ctx.globalAlpha = 1
  ctx.shadowBlur = 0
}

function drawGoldenHolding(
  ctx: CanvasRenderingContext2D,
  state: EntryState,
  ox: number,
  oy: number,
  maxR: number,
  w: number,
  h: number,
  dt: number,
  elapsed: number
) {
  ctx.globalCompositeOperation = "source-over"
  ctx.fillStyle = "rgba(5,5,5,1)"
  ctx.fillRect(0, 0, w, h)

  ctx.globalCompositeOperation = "lighter"

  // Ambient gold core pulse (0.8Hz breathing glow)
  const pulse = 0.35 + 0.25 * (0.5 + 0.5 * Math.sin((elapsed / 1000) * 0.8 * Math.PI * 2))
  const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, maxR * 1.15)
  g.addColorStop(0, rgba(GOLD_BRIGHT, pulse))
  g.addColorStop(0.4, rgba(GOLD, pulse * 0.7))
  g.addColorStop(0.8, rgba(GOLD_SOFT, pulse * 0.25))
  g.addColorStop(1, rgba(GOLD, 0))
  ctx.fillStyle = g
  ctx.fillRect(-maxR, -maxR, maxR * 3, maxR * 3)

  // Orbiting geometric line strokes
  ctx.save()
  ctx.globalAlpha = 0.4
  ctx.strokeStyle = GOLD_BRIGHT
  ctx.lineWidth = 1.2
  ctx.shadowBlur = 8
  ctx.shadowColor = GOLD
  const rotAngle = (elapsed / 1000) * 0.3
  for (const s of state.strokes) {
    const a = s.angle + rotAngle * s.speed
    const baseR = s.offset * 0.9
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

  // Floating gold dust particles with sine wave turbulence
  for (let i = 0; i < state.particles.length; i++) {
    const part = state.particles[i]
    part.x += Math.sin((elapsed / 1000) * 2.5 + i) * 15 * dt
    part.y += part.vy * dt * 0.4
    if (part.y < -20) part.y = h + 20
    if (part.x < -20) part.x = w + 20
    if (part.x > w + 20) part.x = -20

    ctx.globalAlpha = part.life * 0.8
    ctx.fillStyle = GOLD_BRIGHT
    ctx.shadowBlur = 6
    ctx.shadowColor = GOLD_BRIGHT
    ctx.beginPath()
    ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawHextechHolding(
  ctx: CanvasRenderingContext2D,
  state: EntryState,
  ox: number,
  oy: number,
  maxR: number,
  w: number,
  h: number,
  dt: number,
  elapsed: number
) {
  ctx.globalCompositeOperation = "source-over"
  ctx.fillStyle = "rgba(5,5,5,1)"
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = rgba(BLUE_DEEP, 0.6)
  ctx.fillRect(0, 0, w, h)

  ctx.globalCompositeOperation = "lighter"

  state.radarAngle = ((state.radarAngle ?? 0) + dt * 1.5) % (Math.PI * 2)
  const rayR = maxR * 0.85
  const endX = ox + Math.cos(state.radarAngle) * rayR
  const endY = oy + Math.sin(state.radarAngle) * rayR

  ctx.save()
  ctx.globalAlpha = 0.5
  ctx.strokeStyle = BLUE_BRIGHT
  ctx.lineWidth = 1.5
  ctx.shadowBlur = 12
  ctx.shadowColor = BLUE_BRIGHT
  ctx.beginPath()
  ctx.moveTo(ox, oy)
  ctx.lineTo(endX, endY)
  ctx.stroke()
  ctx.restore()

  const pTick = (elapsed / 1000) % 1
  for (const cell of state.matrix) {
    drawHexLabel(ctx, cell.x, cell.y, cell.seed, pTick, 0.35)
  }

  const ringP = ((elapsed / 1000) % 1.2) / 1.2
  const ringR = ringP * maxR * 0.95
  ctx.save()
  ctx.globalAlpha = (1 - ringP) * 0.7
  ctx.strokeStyle = BLUE_BRIGHT
  ctx.lineWidth = 2
  ctx.shadowBlur = 14
  ctx.shadowColor = BLUE_BRIGHT
  ctx.beginPath()
  ctx.arc(ox, oy, ringR, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  for (const part of state.particles) {
    part.x += part.vx * dt * 0.3
    part.y += part.vy * dt * 0.3 - 10 * dt
    if (part.y < -20) part.y = h + 20

    ctx.globalAlpha = part.life * 0.7
    ctx.fillStyle = BLUE_BRIGHT
    ctx.shadowBlur = 6
    ctx.shadowColor = BLUE_BRIGHT
    ctx.beginPath()
    ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ────────────────────────────────────────────────────────────────────────────
// COVER
// ────────────────────────────────────────────────────────────────────────────

/** Quick-Pitch cover: Golden Canvas Brush sweeps out to full occlusion. */
function drawGoldenCover(
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
    ctx.globalAlpha = (1 - p) * part.life
    ctx.fillStyle = GOLD_BRIGHT
    ctx.shadowBlur = 6
    ctx.shadowColor = GOLD_BRIGHT
    ctx.beginPath()
    ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** Deep-Dive cover: Hextech Matrix Boot sweeps out to full occlusion. */
function drawHextechCover(
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
    ctx.globalAlpha = (1 - p) * part.life
    ctx.fillStyle = BLUE_BRIGHT
    ctx.shadowBlur = 6
    ctx.shadowColor = BLUE_BRIGHT
    ctx.beginPath()
    ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ────────────────────────────────────────────────────────────────────────────
// REVEAL — the unwinding pass that exposes page B from the origin outward.
// This replaces the old 60ms opacity pop.
// ────────────────────────────────────────────────────────────────────────────

/** Quick-Pitch reveal: the gold wash contracts back toward the origin, leaving
 *  a bright brush-edge ring expanding outward as the page "opens". */
function drawGoldenReveal(
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
  // As p→1 the occluded disc shrinks to zero at the origin. We draw the cover
  // wash with a shrinking radius; outside the disc the canvas is cleared so
  // page B shows through.
  const revealP = easeInExpo(p) // fast at the end → page snaps cleanly open
  const washR = maxR * (1 - revealP)

  // Re-paint the base cover color only within the shrinking disc, so the area
  // outside it is transparent (page B underneath shows through).
  ctx.globalCompositeOperation = "source-over"
  if (washR > 0.5) {
    ctx.fillStyle = "rgba(5,5,5,1)"
    ctx.beginPath()
    ctx.arc(ox, oy, washR, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalCompositeOperation = "lighter"

  // Residual gold wash inside the shrinking disc.
  if (washR > 0.5) {
    const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, washR)
    g.addColorStop(0, rgba(GOLD_BRIGHT, 0.4 * (1 - p)))
    g.addColorStop(0.6, rgba(GOLD, 0.25 * (1 - p)))
    g.addColorStop(1, rgba(GOLD_SOFT, 0))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(ox, oy, washR, 0, Math.PI * 2)
    ctx.fill()
  }

  // Bright brush-edge ring expanding outward from the origin — the leading
  // edge of the "opening" stroke. Coordinates with DetailShell's clip-path.
  const edgeR = easeOutExpo(p) * maxR * 1.05
  if (edgeR > 1 && p < 1) {
    ctx.save()
    ctx.globalAlpha = (1 - p) * 0.9
    ctx.strokeStyle = GOLD_BRIGHT
    ctx.lineWidth = 2.5
    ctx.shadowBlur = 18
    ctx.shadowColor = GOLD_BRIGHT
    ctx.beginPath()
    ctx.arc(ox, oy, edgeR, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  // Particles fall back inward toward the origin as the page opens.
  for (const part of state.particles) {
    part.x += (ox - part.x) * dt * 2.5
    part.y += (oy - part.y) * dt * 2.5
    ctx.globalAlpha = (1 - p) * part.life
    ctx.fillStyle = GOLD_BRIGHT
    ctx.shadowBlur = 6
    ctx.shadowColor = GOLD_BRIGHT
    ctx.beginPath()
    ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** Deep-Dive reveal: a blueprint scanner finishing its boot. The data matrix
 *  cells switch off in a radial wave from the origin, the shockwave ring
 *  contracts, and a scan line sweeps outward. */
function drawHextechReveal(
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
  // The occluded disc shrinks toward the origin; outside it the canvas clears.
  const revealP = easeInExpo(p)
  const discR = maxR * (1 - revealP)

  ctx.globalCompositeOperation = "source-over"
  if (discR > 0.5) {
    ctx.fillStyle = rgba(BLUE_DEEP, 0.6)
    ctx.beginPath()
    ctx.arc(ox, oy, discR, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "rgba(5,5,5,0.9)"
    ctx.beginPath()
    ctx.arc(ox, oy, discR, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalCompositeOperation = "lighter"

  // Data matrix: cells within the wave front (closer to origin than the
  // expanding edgeR) have already been "scanned off" and go dark; the rest
  // keep ticking until the front reaches them.
  const front = easeOutExpo(p) // 0→1, the scan front distance
  for (const cell of state.matrix) {
    if (cell.dist > front) {
      drawHexLabel(ctx, cell.x, cell.y, cell.seed, p, clamp01(1 - p * 1.5) * 0.4)
    }
  }

  // Bright scan line ring expanding outward — the blueprint scanner's sweep.
  const edgeR = front * maxR * 1.05
  if (edgeR > 1 && p < 1) {
    ctx.save()
    ctx.globalAlpha = (1 - p) * 0.85
    ctx.strokeStyle = BLUE_BRIGHT
    ctx.lineWidth = 2
    ctx.shadowBlur = 16
    ctx.shadowColor = BLUE_BRIGHT
    ctx.beginPath()
    ctx.arc(ox, oy, edgeR, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  // Contracting shockwave ring (the original boot pulse reversing inward).
  if (discR > 1) {
    ctx.save()
    ctx.globalAlpha = (1 - p) * 0.6
    ctx.strokeStyle = BLUE
    ctx.lineWidth = 1.5
    ctx.shadowBlur = 10
    ctx.shadowColor = BLUE
    ctx.beginPath()
    ctx.arc(ox, oy, discR * 0.78, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  // Particles stream back toward the origin.
  for (const part of state.particles) {
    part.x += (ox - part.x) * dt * 2.5
    part.y += (oy - part.y) * dt * 2.5
    ctx.globalAlpha = (1 - p) * part.life
    ctx.fillStyle = BLUE_BRIGHT
    ctx.shadowBlur = 6
    ctx.shadowColor = BLUE_BRIGHT
    ctx.beginPath()
    ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2)
    ctx.fill()
  }
}
