import type { PresetRenderer, TransitionMode, TransitionOrigin } from "./types"
import { rgba, clamp01, easeInOutCubic } from "./types"

const COLOR_CAD_VOID = "#030914"
const COLOR_CAD_GRID = "#00F0FF"
const COLOR_CAD_CYAN = "#38BDF8"
const COLOR_CAD_WHITE = "#E2F1FF"
const COLOR_CAD_ACCENT = "#0EA5E9"

export interface BlueprintPulse {
  x: number
  y: number
  seed: number
}

export interface BlueprintState {
  origin: TransitionOrigin
  w: number
  h: number
  mode: TransitionMode
  gridSpacing: number
  majorGridSpacing: number
  intersectionPulses: BlueprintPulse[]
  rulerCountX: number
  rulerCountY: number
}

export const blueprintRenderer: PresetRenderer<BlueprintState> = {
  initState: (mode, w, h, origin) => {
    const gridSpacing = 40
    const majorGridSpacing = 200

    // Pre-calculate sample intersection points for active circuit pulses
    const cols = Math.min(12, Math.floor(w / majorGridSpacing) + 1)
    const rows = Math.min(8, Math.floor(h / majorGridSpacing) + 1)
    const totalPulses = cols * rows
    const intersectionPulses: BlueprintPulse[] = new Array(totalPulses)

    let idx = 0
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        intersectionPulses[idx++] = {
          x: c * majorGridSpacing,
          y: r * majorGridSpacing,
          seed: (c * 17 + r * 31) % 100,
        }
      }
    }

    return {
      origin,
      w,
      h,
      mode,
      gridSpacing,
      majorGridSpacing,
      intersectionPulses,
      rulerCountX: Math.floor(w / 50) + 1,
      rulerCountY: Math.floor(h / 50) + 1,
    }
  },

  drawCover: (ctx, state, p, w, h) => {
    ctx.save()
    const eased = easeInOutCubic(p)
    const scanX = eased * w

    ctx.clearRect(0, 0, w, h)

    // Deep blueprint drafting substrate
    ctx.fillStyle = rgba(COLOR_CAD_VOID, clamp01(p * 1.2))
    ctx.fillRect(0, 0, w, h)

    // CAD drafting grid sweeps across viewport up to scanX
    if (scanX > 2) {
      // Minor grid lines
      ctx.strokeStyle = rgba(COLOR_CAD_GRID, 0.08 * p)
      ctx.lineWidth = 1
      ctx.beginPath()

      // Vertical lines
      for (let x = 0; x <= scanX; x += state.gridSpacing) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
      }
      // Horizontal lines within swept area
      for (let y = 0; y <= h; y += state.gridSpacing) {
        ctx.moveTo(0, y)
        ctx.lineTo(scanX, y)
      }
      ctx.stroke()

      // Major grid lines
      ctx.strokeStyle = rgba(COLOR_CAD_CYAN, 0.18 * p)
      ctx.lineWidth = 1.2
      ctx.beginPath()
      for (let x = 0; x <= scanX; x += state.majorGridSpacing) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
      }
      for (let y = 0; y <= h; y += state.majorGridSpacing) {
        ctx.moveTo(0, y)
        ctx.lineTo(scanX, y)
      }
      ctx.stroke()
    }

    // Coordinate rulers sliding in from top and left
    const rulerAlpha = clamp01(p * 1.5)
    if (rulerAlpha > 0.01) {
      ctx.fillStyle = rgba(COLOR_CAD_VOID, 0.85 * rulerAlpha)
      ctx.fillRect(0, 0, scanX, 22)
      ctx.fillRect(0, 0, 22, h)

      ctx.strokeStyle = rgba(COLOR_CAD_CYAN, 0.3 * rulerAlpha)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, 22)
      ctx.lineTo(scanX, 22)
      ctx.moveTo(22, 0)
      ctx.lineTo(22, h)
      ctx.stroke()

      // Top ruler tick marks
      ctx.strokeStyle = rgba(COLOR_CAD_CYAN, 0.45 * rulerAlpha)
      ctx.beginPath()
      for (let x = 30; x <= scanX; x += 10) {
        const isTen = x % 50 === 0
        ctx.moveTo(x, 22)
        ctx.lineTo(x, 22 - (isTen ? 8 : 4))
      }
      ctx.stroke()
    }

    // High-speed vertical laser scanline wipes left-to-right
    if (scanX > 0 && scanX < w + 20) {
      // Laser beam wide glow
      const beamGrad = ctx.createLinearGradient(scanX - 25, 0, scanX + 15, 0)
      beamGrad.addColorStop(0, rgba(COLOR_CAD_GRID, 0))
      beamGrad.addColorStop(0.65, rgba(COLOR_CAD_GRID, 0.25))
      beamGrad.addColorStop(0.95, rgba(COLOR_CAD_WHITE, 0.95))
      beamGrad.addColorStop(1, rgba(COLOR_CAD_GRID, 0))

      ctx.fillStyle = beamGrad
      ctx.fillRect(scanX - 25, 0, 40, h)

      // Intense laser line core
      ctx.strokeStyle = rgba(COLOR_CAD_WHITE, 0.95)
      ctx.lineWidth = 2
      ctx.shadowColor = COLOR_CAD_GRID
      ctx.shadowBlur = 14
      ctx.beginPath()
      ctx.moveTo(scanX, 0)
      ctx.lineTo(scanX, h)
      ctx.stroke()
      ctx.shadowBlur = 0
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
    const ox = state.origin.x
    const oy = state.origin.y

    // Deep blueprint substrate
    ctx.fillStyle = COLOR_CAD_VOID
    ctx.fillRect(0, 0, w, h)

    // 1. Full CAD drafting grid
    ctx.strokeStyle = rgba(COLOR_CAD_GRID, 0.07)
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = 0; x <= w; x += state.gridSpacing) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
    }
    for (let y = 0; y <= h; y += state.gridSpacing) {
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
    }
    ctx.stroke()

    ctx.strokeStyle = rgba(COLOR_CAD_CYAN, 0.16)
    ctx.lineWidth = 1.2
    ctx.beginPath()
    for (let x = 0; x <= w; x += state.majorGridSpacing) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
    }
    for (let y = 0; y <= h; y += state.majorGridSpacing) {
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
    }
    ctx.stroke()

    // 2. Oscillating horizontal laser scanline sweeping across the viewport
    const scanY = h * (0.5 + 0.44 * Math.sin(t * 1.8))

    // Laser beam vertical falloff gradient
    const beamGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30)
    beamGrad.addColorStop(0, rgba(COLOR_CAD_GRID, 0))
    beamGrad.addColorStop(0.5, rgba(COLOR_CAD_CYAN, 0.2))
    beamGrad.addColorStop(0.51, rgba(COLOR_CAD_WHITE, 0.8))
    beamGrad.addColorStop(0.52, rgba(COLOR_CAD_CYAN, 0.2))
    beamGrad.addColorStop(1, rgba(COLOR_CAD_GRID, 0))

    ctx.fillStyle = beamGrad
    ctx.fillRect(0, scanY - 30, w, 60)

    // High-voltage leading line with sine jitter
    ctx.strokeStyle = rgba(COLOR_CAD_WHITE, 0.9)
    ctx.lineWidth = 1.6
    ctx.shadowColor = COLOR_CAD_GRID
    ctx.shadowBlur = 10
    ctx.beginPath()
    const step = 24
    for (let x = 0; x <= w; x += step) {
      const jitter = Math.sin(x * 0.05 + t * 14) * 1.8
      if (x === 0) ctx.moveTo(x, scanY + jitter)
      else ctx.lineTo(x, scanY + jitter)
    }
    ctx.stroke()
    ctx.shadowBlur = 0

    // 3. Coordinate rulers along top and left edges
    ctx.fillStyle = rgba(COLOR_CAD_VOID, 0.9)
    ctx.fillRect(0, 0, w, 22)
    ctx.fillRect(0, 0, 22, h)

    ctx.strokeStyle = rgba(COLOR_CAD_CYAN, 0.35)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, 22)
    ctx.lineTo(w, 22)
    ctx.moveTo(22, 0)
    ctx.lineTo(22, h)
    ctx.stroke()

    // Top ticks
    ctx.strokeStyle = rgba(COLOR_CAD_CYAN, 0.5)
    ctx.beginPath()
    for (let x = 30; x <= w; x += 10) {
      const isTen = x % 50 === 0
      ctx.moveTo(x, 22)
      ctx.lineTo(x, 22 - (isTen ? 8 : 4))
    }
    // Left ticks
    for (let y = 30; y <= h; y += 10) {
      const isTen = y % 50 === 0
      ctx.moveTo(22, y)
      ctx.lineTo(22 - (isTen ? 8 : 4), y)
    }
    ctx.stroke()

    // 4. Glowing grid intersection pulses
    const pulseLen = state.intersectionPulses.length
    for (let i = 0; i < pulseLen; i++) {
      const pt = state.intersectionPulses[i]
      const pulseAlpha = 0.2 + 0.45 * Math.sin(t * 3.2 + pt.seed)
      ctx.strokeStyle = rgba(COLOR_CAD_GRID, pulseAlpha)
      ctx.lineWidth = 1.2
      ctx.beginPath()
      // Cross mark at intersection
      ctx.moveTo(pt.x - 4, pt.y)
      ctx.lineTo(pt.x + 4, pt.y)
      ctx.moveTo(pt.x, pt.y - 4)
      ctx.lineTo(pt.x, pt.y + 4)
      ctx.stroke()
    }

    // 5. Animated crosshair reticle with rotating measurement arcs
    const reticleAngle = t * 1.2
    const reticleR = 42

    // Outer measurement arc
    ctx.strokeStyle = rgba(COLOR_CAD_GRID, 0.65)
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(ox, oy, reticleR, reticleAngle, reticleAngle + Math.PI * 0.7)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(ox, oy, reticleR, reticleAngle + Math.PI, reticleAngle + Math.PI * 1.7)
    ctx.stroke()

    // Precision crosshairs
    ctx.strokeStyle = rgba(COLOR_CAD_WHITE, 0.8)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(ox - reticleR - 10, oy)
    ctx.lineTo(ox - 8, oy)
    ctx.moveTo(ox + 8, oy)
    ctx.lineTo(ox + reticleR + 10, oy)
    ctx.moveTo(ox, oy - reticleR - 10)
    ctx.lineTo(ox, oy - 8)
    ctx.moveTo(ox, oy + 8)
    ctx.lineTo(ox, oy + reticleR + 10)
    ctx.stroke()

    // Center precision dot
    ctx.fillStyle = rgba(COLOR_CAD_WHITE, 0.95)
    ctx.fillRect(ox - 1.5, oy - 1.5, 3, 3)

    // 6. Real-time CAD coordinate readout
    const roundedW = Math.round(w)
    const roundedH = Math.round(h)
    const roundedScanY = Math.round(scanY)
    const modeLabel = mode === "deep" ? "DEEP_DIVE // 60FPS" : "QUICK_PITCH // 60FPS"

    ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace"
    ctx.fillStyle = rgba(COLOR_CAD_WHITE, 0.8)
    ctx.fillText("SEC-04 // CAD_SCHEMATIC_LOAD", 36, h - 52)
    ctx.fillStyle = rgba(COLOR_CAD_CYAN, 0.7)
    ctx.fillText(`MODE: ${modeLabel}`, 36, h - 38)
    ctx.fillStyle = rgba(COLOR_CAD_GRID, 0.6)
    ctx.fillText(`COORDS: [X: ${roundedW}, Y: ${roundedH}] // SCAN_Y: ${roundedScanY} μm`, 36, h - 24)
    ctx.fillStyle = rgba(COLOR_CAD_ACCENT, 0.5)
    ctx.fillText("TOLERANCE: ±0.002 // SYNC_LOCK_ENGAGED", 36, h - 10)

    ctx.restore()
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  },

  drawReveal: (ctx, state, p, w, h) => {
    ctx.save()
    const eased = easeInOutCubic(p)
    const clearX = eased * w
    const remainingAlpha = clamp01(1 - p)

    ctx.clearRect(0, 0, w, h)

    // Draw blueprint substrate
    ctx.fillStyle = COLOR_CAD_VOID
    ctx.fillRect(0, 0, w, h)

    // Unmask canvas from left to right using destination-out
    if (clearX > 0) {
      ctx.globalCompositeOperation = "destination-out"
      ctx.beginPath()
      ctx.rect(0, 0, clearX, h)
      ctx.fill()
    }

    // High-voltage laser scanline on the revealing unmask boundary
    ctx.globalCompositeOperation = "source-over"
    if (clearX > 0 && clearX < w + 20 && remainingAlpha > 0.01) {
      // Glow trailing edge
      const edgeGrad = ctx.createLinearGradient(clearX - 20, 0, clearX + 10, 0)
      edgeGrad.addColorStop(0, rgba(COLOR_CAD_GRID, 0))
      edgeGrad.addColorStop(0.7, rgba(COLOR_CAD_GRID, 0.3 * remainingAlpha))
      edgeGrad.addColorStop(0.95, rgba(COLOR_CAD_WHITE, 0.9 * remainingAlpha))
      edgeGrad.addColorStop(1, rgba(COLOR_CAD_GRID, 0))

      ctx.fillStyle = edgeGrad
      ctx.fillRect(clearX - 20, 0, 30, h)

      // Laser beam line
      ctx.strokeStyle = rgba(COLOR_CAD_WHITE, 0.95 * remainingAlpha)
      ctx.lineWidth = 2.5
      ctx.shadowColor = COLOR_CAD_GRID
      ctx.shadowBlur = 16 * remainingAlpha
      ctx.beginPath()
      ctx.moveTo(clearX, 0)
      ctx.lineTo(clearX, h)
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    ctx.restore()
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  },
}
