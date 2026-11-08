import { HexCenter, LayerContext, rgbaToString } from '../types'

export interface DataPulse {
  x: number
  y: number
  startX: number
  startY: number
  targetX: number
  targetY: number
  col: number
  row: number
  vertexIdx: number
  progress: number
  speed: number
  trail: Array<{ x: number; y: number }>
  branchCooldown: number
}

const COS60 = 0.5
const SIN60 = 0.8660254037844386 // Math.sqrt(3) / 2

/**
 * Creates a single DataPulse starting on an edge of a randomly selected hex center.
 */
function createRandomPulse(
  hexCenters: HexCenter[],
  radius: number,
  speedMult = 1.0
): DataPulse | null {
  if (hexCenters.length === 0 || radius <= 0) return null

  const center = hexCenters[Math.floor(Math.random() * hexCenters.length)]
  const v1Idx = Math.floor(Math.random() * 6)
  const angle1 = (v1Idx * Math.PI) / 3
  const startX = center.x + radius * Math.cos(angle1)
  const startY = center.y + radius * Math.sin(angle1)

  const dir = Math.random() < 0.5 ? 1 : 5
  const v2Idx = (v1Idx + dir) % 6
  const angle2 = (v2Idx * Math.PI) / 3
  const targetX = center.x + radius * Math.cos(angle2)
  const targetY = center.y + radius * Math.sin(angle2)

  const progress = Math.random()
  const x = startX + (targetX - startX) * progress
  const y = startY + (targetY - startY) * progress

  return {
    x,
    y,
    startX,
    startY,
    targetX,
    targetY,
    col: center.col,
    row: center.row,
    vertexIdx: v2Idx,
    progress,
    speed: (0.85 + Math.random() * 0.45) * speedMult,
    trail: [{ x: startX, y: startY }],
    branchCooldown: 1.0 + Math.random() * 2.0,
  }
}

/**
 * Initializes an array of data pulses distributed along the edges of the hex lattice.
 */
export function initDataPulses(
  maxCount: number,
  hexCenters: HexCenter[],
  radius: number
): DataPulse[] {
  if (hexCenters.length === 0 || radius <= 0 || maxCount <= 0) {
    return []
  }

  const pulses: DataPulse[] = []
  const initialCount = Math.min(maxCount, Math.max(4, Math.floor(maxCount * 0.5)))

  for (let i = 0; i < initialCount; i++) {
    const pulse = createRandomPulse(hexCenters, radius)
    if (pulse) {
      pulses.push(pulse)
    }
  }

  return pulses
}

/**
 * Updates traversal and renders glowing data pulses traveling across the hexagonal blueprint edges.
 *
 * Pulses follow hex edges, turning ±60° at vertices and periodically branching into forks.
 * Bails early in Quick Pitch mode (mix < 0.05), during reduced motion, or when pulse count is 0.
 */
export function renderPulses(ctx: LayerContext, pulses: DataPulse[]): void {
  if (ctx.mix < 0.05 || ctx.reducedMotion || pulses.length === 0 || ctx.width <= 0 || ctx.height <= 0) {
    return
  }

  const overallAlpha = ctx.mix * (ctx.palette.isLight ? 0.4 : 0.85)
  if (overallAlpha <= 0.001) return

  const { ctx: c, width, height, dt, config, palette, hexCenters } = ctx
  const safeDt = Number.isFinite(dt) && dt > 0 ? Math.min(dt, 0.1) : 0.016
  const pulseSpeed = config.speed.pulseSpeed || 1.2
  const maxPulses = config.density.maxPulses || 24
  const radius = config.density.hexRadius || 36
  const margin = radius * 3

  const newForks: DataPulse[] = []

  // 1. Update and Traverse
  for (let i = 0; i < pulses.length; i++) {
    const p = pulses[i]
    p.branchCooldown = Math.max(0, p.branchCooldown - safeDt)
    p.progress += safeDt * pulseSpeed * p.speed

    let steps = 0
    while (p.progress >= 1.0 && steps < 2) {
      steps++
      p.trail.push({ x: p.startX, y: p.startY })
      if (p.trail.length > 4) p.trail.shift()

      const isOutOfBounds =
        p.targetX < -margin ||
        p.targetX > width + margin ||
        p.targetY < -margin ||
        p.targetY > height + margin

      if (isOutOfBounds) {
        // Cull excess pulses if maxPulses was reduced dynamically or centers empty
        if (pulses.length > maxPulses || hexCenters.length === 0) {
          pulses.splice(i, 1)
          i--
          break
        }
        const respawned = createRandomPulse(hexCenters, radius, p.speed)
        if (respawned) {
          Object.assign(p, respawned)
          p.progress = 0
          break
        }
      }

      const dx = p.targetX - p.startX
      const dy = p.targetY - p.startY
      const len = Math.hypot(dx, dy)
      const edgeLen = len > 0.001 ? len : radius
      const nx = len > 0.001 ? dx / len : 1
      const ny = len > 0.001 ? dy / len : 0

      const b1x = (nx * COS60 - ny * SIN60) * edgeLen
      const b1y = (nx * SIN60 + ny * COS60) * edgeLen
      const b2x = (nx * COS60 + ny * SIN60) * edgeLen
      const b2y = (-nx * SIN60 + ny * COS60) * edgeLen

      const dest1 = { x: p.targetX + b1x, y: p.targetY + b1y }
      const dest2 = { x: p.targetX + b2x, y: p.targetY + b2y }

      const out1 = dest1.x < -margin || dest1.x > width + margin || dest1.y < -margin || dest1.y > height + margin
      const out2 = dest2.x < -margin || dest2.x > width + margin || dest2.y < -margin || dest2.y > height + margin

      let isBranch1 = Math.random() < 0.5
      if (out1 && !out2) isBranch1 = false
      else if (out2 && !out1) isBranch1 = true

      const chosenDest = isBranch1 ? dest1 : dest2
      const otherDest = isBranch1 ? dest2 : dest1
      const otherOut = isBranch1 ? out2 : out1

      const canFork =
        pulses.length + newForks.length < maxPulses &&
        Math.random() < 0.15 &&
        p.branchCooldown <= 0 &&
        !otherOut

      if (canFork) {
        newForks.push({
          x: p.targetX,
          y: p.targetY,
          startX: p.targetX,
          startY: p.targetY,
          targetX: otherDest.x,
          targetY: otherDest.y,
          col: p.col,
          row: p.row,
          vertexIdx: (p.vertexIdx + (isBranch1 ? 5 : 1)) % 6,
          progress: 0,
          speed: p.speed * (0.9 + Math.random() * 0.2),
          trail: [{ x: p.startX, y: p.startY }],
          branchCooldown: 1.5 + Math.random() * 1.5,
        })
        p.branchCooldown = 1.5 + Math.random() * 1.5
      }

      p.startX = p.targetX
      p.startY = p.targetY
      p.targetX = chosenDest.x
      p.targetY = chosenDest.y
      p.progress -= 1.0
      p.vertexIdx = (p.vertexIdx + (isBranch1 ? 1 : 5)) % 6
    }

    p.x = p.startX + (p.targetX - p.startX) * Math.max(0, Math.min(1, p.progress))
    p.y = p.startY + (p.targetY - p.startY) * Math.max(0, Math.min(1, p.progress))
  }

  if (newForks.length > 0) {
    for (let f = 0; f < newForks.length; f++) {
      if (pulses.length < maxPulses) pulses.push(newForks[f])
    }
  }

  // 2. Batched Render: Safe c.save()/c.restore() & 5 batched stroke calls + 1 batched head call
  const trailAlphas = [
    overallAlpha * 0.85,
    overallAlpha * 0.55,
    overallAlpha * 0.32,
    overallAlpha * 0.16,
    overallAlpha * 0.08,
  ]
  const trailWidths = [1.8, 1.4, 1.1, 0.9, 0.7]
  const strokeStyles = trailAlphas.map((a) => rgbaToString(palette.accentBright, a))
  const headColor = rgbaToString(palette.accentBright, overallAlpha)

  c.save()

  // Batch trail segments by tier (5 draw calls total across all pulses)
  for (let seg = 0; seg < 5; seg++) {
    c.beginPath()
    c.strokeStyle = strokeStyles[seg]
    c.lineWidth = trailWidths[seg]

    let hasSegments = false
    for (let i = 0; i < pulses.length; i++) {
      const p = pulses[i]
      let p1x: number, p1y: number, p2x: number, p2y: number

      if (seg === 0) {
        p1x = p.x
        p1y = p.y
        p2x = p.startX
        p2y = p.startY
      } else {
        const trailIdx1 = p.trail.length - (seg - 1)
        const trailIdx2 = p.trail.length - seg
        if (seg === 1) {
          p1x = p.startX
          p1y = p.startY
        } else if (trailIdx1 >= 0 && trailIdx1 < p.trail.length) {
          p1x = p.trail[trailIdx1].x
          p1y = p.trail[trailIdx1].y
        } else {
          continue
        }

        if (trailIdx2 >= 0 && trailIdx2 < p.trail.length) {
          p2x = p.trail[trailIdx2].x
          p2y = p.trail[trailIdx2].y
        } else {
          continue
        }
      }

      c.moveTo(p1x, p1y)
      c.lineTo(p2x, p2y)
      hasSegments = true
    }

    if (hasSegments) {
      c.stroke()
    }
  }

  // Batch glowing heads into a single pass (1 draw call total)
  c.shadowColor = headColor
  c.shadowBlur = 6
  c.fillStyle = headColor
  c.beginPath()
  for (let i = 0; i < pulses.length; i++) {
    const p = pulses[i]
    c.moveTo(p.x + 2.5, p.y)
    c.arc(p.x, p.y, 2.5, 0, Math.PI * 2)
  }
  c.fill()

  c.restore()
}
