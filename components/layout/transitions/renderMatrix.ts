import type { PresetRenderer, TransitionMode, TransitionOrigin } from "./types"
import { rgba, clamp01, easeInOutCubic } from "./types"

const COLOR_MATRIX_VOID = "#020804"
const COLOR_MATRIX_HEAD = "#E0FFE8"
const COLOR_MATRIX_GREEN = "#00FF66"
const COLOR_MATRIX_CYAN = "#00F0FF"
const COLOR_MATRIX_EMERALD = "#10B981"
const COLOR_MATRIX_TRACE = "#004D26"
const COLOR_MATRIX_PULSE = "#34D399"

const GLYPH_TABLE = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  "A", "B", "C", "D", "E", "F", "X", "Z", "λ", "Ω",
  "Ψ", "Ξ", "0x", "::", "10", "FF",
]

export interface MatrixColumn {
  x: number
  y: number
  speed: number
  length: number
  charIndices: number[]
}

export interface MatrixCircuitNode {
  x: number
  y: number
  targetX: number
  targetY: number
  seed: number
}

export interface MatrixDissolveParticle {
  angle: number
  speed: number
  size: number
  baseAlpha: number
  color: string
  seed: number
}

export interface MatrixState {
  origin: TransitionOrigin
  maxRadius: number
  mode: TransitionMode
  columns: MatrixColumn[]
  circuitNodes: MatrixCircuitNode[]
  dissolveParticles: MatrixDissolveParticle[]
  oscilloscopePointsX: Float32Array
}

export const matrixRenderer: PresetRenderer<MatrixState> = {
  initState: (mode, w, h, origin) => {
    const dx = Math.max(origin.x, w - origin.x)
    const dy = Math.max(origin.y, h - origin.y)
    const maxRadius = Math.sqrt(dx * dx + dy * dy) + 80

    // Vertical columns spaced across screen width
    const colSpacing = 22
    const colCount = Math.max(10, Math.floor(w / colSpacing))
    const columns: MatrixColumn[] = new Array(colCount)

    for (let c = 0; c < colCount; c++) {
      const len = 12 + ((c * 7) % 14)
      const indices = new Array(len)
      for (let i = 0; i < len; i++) {
        indices[i] = (c * 13 + i * 17) % GLYPH_TABLE.length
      }

      columns[c] = {
        x: c * colSpacing + 10,
        y: ((c * 37) % Math.max(h, 400)) - 100,
        speed: 2.5 + ((c % 5) * 0.9),
        length: len,
        charIndices: indices,
      }
    }

    // Oscilloscope sample points across screen
    const sampleCount = 90
    const oscilloscopePointsX = new Float32Array(sampleCount)
    for (let i = 0; i < sampleCount; i++) {
      oscilloscopePointsX[i] = (i / (sampleCount - 1)) * w
    }

    // Pre-allocated circuit network nodes
    const nodeCount = 14
    const circuitNodes: MatrixCircuitNode[] = new Array(nodeCount)
    for (let i = 0; i < nodeCount; i++) {
      const nx = 40 + ((i * 173) % Math.max(w - 80, 100))
      const ny = 40 + ((i * 137) % Math.max(h - 80, 100))
      // Orthogonal corner connection
      const tx = 40 + (((i + 1) * 173) % Math.max(w - 80, 100))
      const ty = ny
      circuitNodes[i] = {
        x: nx,
        y: ny,
        targetX: tx,
        targetY: ty,
        seed: i * 0.35,
      }
    }

    // Pre-allocated dissolve particles for reveal explosion
    const particleCount = mode === "quick" ? 80 : 120
    const dissolveParticles: MatrixDissolveParticle[] = new Array(particleCount)
    for (let i = 0; i < particleCount; i++) {
      dissolveParticles[i] = {
        angle: (i / particleCount) * Math.PI * 2 + ((i % 3) * 0.2),
        speed: 1.2 + Math.random() * 2.8,
        size: 1.5 + Math.random() * 2.5,
        baseAlpha: 0.4 + Math.random() * 0.5,
        color: i % 2 === 0 ? COLOR_MATRIX_GREEN : COLOR_MATRIX_CYAN,
        seed: Math.random() * 50,
      }
    }

    return {
      origin,
      maxRadius,
      mode,
      columns,
      circuitNodes,
      dissolveParticles,
      oscilloscopePointsX,
    }
  },

  drawCover: (ctx, state, p, w, h) => {
    ctx.save()
    const eased = easeInOutCubic(p)
    const currentR = eased * state.maxRadius * 1.15
    const ox = state.origin.x
    const oy = state.origin.y

    ctx.clearRect(0, 0, w, h)

    // Deep matrix void
    ctx.fillStyle = rgba(COLOR_MATRIX_VOID, clamp01(p * 1.2))
    ctx.fillRect(0, 0, w, h)

    // Hexagonal digital matrix shockwave expanding from origin
    if (currentR > 2) {
      // Hexagon shape
      const hexSides = 6
      ctx.beginPath()
      for (let s = 0; s < hexSides; s++) {
        const ang = (s / hexSides) * Math.PI * 2
        const hx = ox + Math.cos(ang) * currentR
        const hy = oy + Math.sin(ang) * currentR
        if (s === 0) ctx.moveTo(hx, hy)
        else ctx.lineTo(hx, hy)
      }
      ctx.closePath()

      // Radial cyber glow fill inside hexagon
      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, currentR)
      grad.addColorStop(0, rgba(COLOR_MATRIX_VOID, 1))
      grad.addColorStop(0.7, rgba(COLOR_MATRIX_TRACE, clamp01(0.6 * (1 - p * 0.3))))
      grad.addColorStop(0.92, rgba(COLOR_MATRIX_GREEN, clamp01(0.75 * p)))
      grad.addColorStop(1, rgba(COLOR_MATRIX_CYAN, 0))

      ctx.fillStyle = grad
      ctx.fill()

      // Luminous leading edge
      ctx.strokeStyle = rgba(COLOR_MATRIX_GREEN, clamp01(1 - p * 0.3))
      ctx.lineWidth = 2.5
      ctx.shadowColor = COLOR_MATRIX_GREEN
      ctx.shadowBlur = 16
      ctx.stroke()
      ctx.shadowBlur = 0

      // Secondary inner pulse hexagon
      const innerR = currentR * 0.65
      ctx.beginPath()
      for (let s = 0; s < hexSides; s++) {
        const ang = (s / hexSides) * Math.PI * 2 + Math.PI / 6
        const hx = ox + Math.cos(ang) * innerR
        const hy = oy + Math.sin(ang) * innerR
        if (s === 0) ctx.moveTo(hx, hy)
        else ctx.lineTo(hx, hy)
      }
      ctx.closePath()
      ctx.strokeStyle = rgba(COLOR_MATRIX_CYAN, 0.45 * p)
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    ctx.restore()
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  },

  drawHolding: (ctx, state, elapsed, w, h, mode, dt) => {
    ctx.save()
    // Support both milliseconds (standard performance.now()) and fractional seconds
    const t = elapsed > 100 ? elapsed * 0.001 : elapsed
    const delta = dt > 0 && dt < 0.1 ? dt : 0.016

    // Deep cyber void
    ctx.fillStyle = COLOR_MATRIX_VOID
    ctx.fillRect(0, 0, w, h)

    // 1. Pulsing network circuit traces and nodes
    const nodeLen = state.circuitNodes.length
    ctx.strokeStyle = rgba(COLOR_MATRIX_TRACE, 0.4)
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let i = 0; i < nodeLen; i++) {
      const node = state.circuitNodes[i]
      ctx.moveTo(node.x, node.y)
      ctx.lineTo(node.targetX, node.targetY)
    }
    ctx.stroke()

    // Data packets traveling along traces
    for (let i = 0; i < nodeLen; i++) {
      const node = state.circuitNodes[i]
      const packetT = (t * 0.8 + node.seed) % 1
      const px = node.x + (node.targetX - node.x) * packetT
      const py = node.y + (node.targetY - node.y) * packetT

      ctx.fillStyle = rgba(i % 2 === 0 ? COLOR_MATRIX_GREEN : COLOR_MATRIX_CYAN, 0.85)
      ctx.fillRect(px - 2, py - 2, 4, 4)

      // Node via pads
      ctx.strokeStyle = rgba(COLOR_MATRIX_EMERALD, 0.5)
      ctx.strokeRect(node.x - 3, node.y - 3, 6, 6)
    }

    // 2. Vertical falling cyber data streams (hex columns) with zero-GC
    ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace"
    const colLen = state.columns.length
    for (let c = 0; c < colLen; c++) {
      const col = state.columns[c]
      // Step column position
      col.y = (col.y + col.speed * delta * 60) % (h + col.length * 16)

      const glyphCount = col.length
      for (let g = 0; g < glyphCount; g++) {
        const charY = col.y - g * 16
        if (charY < -20 || charY > h + 20) continue

        // Head glyph glows white-green
        const isHead = g === 0
        const falloff = 1 - g / glyphCount
        const charIdx = col.charIndices[g] % GLYPH_TABLE.length
        const char = GLYPH_TABLE[charIdx]

        if (isHead) {
          ctx.fillStyle = COLOR_MATRIX_HEAD
          ctx.globalAlpha = 0.95
          ctx.shadowColor = COLOR_MATRIX_GREEN
          ctx.shadowBlur = 8
          ctx.fillText(char, col.x, charY)
          ctx.shadowBlur = 0
        } else {
          const charColor = g < 3 ? COLOR_MATRIX_GREEN : COLOR_MATRIX_EMERALD
          const alpha = 0.2 + 0.65 * falloff
          ctx.fillStyle = charColor
          ctx.globalAlpha = clamp01(alpha)
          ctx.fillText(char, col.x, charY)
        }
      }
    }
    ctx.globalAlpha = 1

    // 3. Oscillating digital oscilloscope beam across screen center (dynamically scaled to width)
    const baseY = h * 0.52
    const ptLen = state.oscilloscopePointsX.length

    ctx.strokeStyle = rgba(COLOR_MATRIX_GREEN, 0.85)
    ctx.lineWidth = 1.8
    ctx.shadowColor = COLOR_MATRIX_GREEN
    ctx.shadowBlur = 12
    ctx.beginPath()

    for (let i = 0; i < ptLen; i++) {
      const px = (i / (ptLen - 1)) * w
      const wave =
        Math.sin(px * 0.015 + t * 4.2) * 22 * Math.cos(px * 0.025 - t * 2.1) +
        Math.sin(px * 0.06 + t * 9) * 5
      const py = baseY + wave

      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
    ctx.shadowBlur = 0

    // Phosphor baseline trail
    ctx.strokeStyle = rgba(COLOR_MATRIX_TRACE, 0.3)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, baseY)
    ctx.lineTo(w, baseY)
    ctx.stroke()

    // Telemetry status
    ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace"
    ctx.fillStyle = rgba(COLOR_MATRIX_GREEN, 0.75)
    ctx.fillText("NEURAL_STREAM // MATRIX_PULSE_ACTIVE", 32, 34)
    ctx.fillStyle = rgba(COLOR_MATRIX_CYAN, 0.6)
    ctx.fillText(`MODE: ${mode.toUpperCase()} // PACKET_FLOW: 104.2 GB/s`, 32, 48)
    ctx.fillStyle = rgba(COLOR_MATRIX_PULSE, 0.45)
    ctx.fillText("SYNAPSE_PARITY: OK // ZERO_DROP", 32, 62)

    ctx.restore()
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  },

  drawReveal: (ctx, state, p, w, h) => {
    ctx.save()
    const eased = easeInOutCubic(p)
    const apertureR = eased * state.maxRadius * 1.25
    const ox = state.origin.x
    const oy = state.origin.y
    const remainingAlpha = clamp01(1 - p)

    ctx.clearRect(0, 0, w, h)

    // Deep matrix void
    ctx.fillStyle = COLOR_MATRIX_VOID
    ctx.fillRect(0, 0, w, h)

    // Unmask outward aperture using destination-out
    if (apertureR > 0) {
      ctx.globalCompositeOperation = "destination-out"
      ctx.beginPath()
      ctx.arc(ox, oy, apertureR, 0, Math.PI * 2)
      ctx.fill()
    }

    // High-frequency particle burst along aperture rim
    ctx.globalCompositeOperation = "source-over"
    if (apertureR > 0 && remainingAlpha > 0.01) {
      // Hexagonal shockwave boundary
      const hexSides = 6
      ctx.beginPath()
      for (let s = 0; s < hexSides; s++) {
        const ang = (s / hexSides) * Math.PI * 2 + eased * 0.5
        const hx = ox + Math.cos(ang) * apertureR
        const hy = oy + Math.sin(ang) * apertureR
        if (s === 0) ctx.moveTo(hx, hy)
        else ctx.lineTo(hx, hy)
      }
      ctx.closePath()
      ctx.strokeStyle = rgba(COLOR_MATRIX_GREEN, remainingAlpha * 0.9)
      ctx.lineWidth = 2.5
      ctx.shadowColor = COLOR_MATRIX_CYAN
      ctx.shadowBlur = 18 * remainingAlpha
      ctx.stroke()
      ctx.shadowBlur = 0

      // Digital nodes dissolving into particles
      const pLen = state.dissolveParticles.length
      for (let i = 0; i < pLen; i++) {
        const pt = state.dissolveParticles[i]
        const burstDist = apertureR + eased * (pt.speed * 45)
        const curAng = pt.angle + eased * 1.5
        const px = ox + Math.cos(curAng) * burstDist
        const py = oy + Math.sin(curAng) * burstDist

        ctx.fillStyle = pt.color
        ctx.globalAlpha = clamp01(remainingAlpha * pt.baseAlpha)
        ctx.fillRect(px - pt.size / 2, py - pt.size / 2, pt.size, pt.size)
      }
      ctx.globalAlpha = 1
    }

    ctx.restore()
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  },
}
