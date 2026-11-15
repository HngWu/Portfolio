export interface Point {
  x: number
  y: number
}

export interface LightningBranch {
  points: Point[]
  children?: LightningBranch[]
}

export interface CosmicSpark {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  maxAlpha: number
  color: string
  life: number
  maxLife: number
  wobbleSpeed: number
  wobblePhase: number
}

/**
 * Midpoint displacement recursive subdivision for organic jagged lightning bolts.
 */
export function generateLightningBolt(
  start: Point,
  end: Point,
  maxDepth = 4,
  roughness = 0.35,
  rng: () => number = Math.random
): Point[] {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist < 1 || maxDepth <= 0) {
    return [start, end]
  }

  function subdivide(p1: Point, p2: Point, depth: number): Point[] {
    if (depth <= 0) {
      return [p1, p2]
    }

    const segDx = p2.x - p1.x
    const segDy = p2.y - p1.y
    const segLen = Math.sqrt(segDx * segDx + segDy * segDy)

    if (segLen < 2) {
      return [p1, p2]
    }

    // Normal vector perpendicular to segment
    const nx = -segDy / segLen
    const ny = segDx / segLen

    // Displacement proportional to segment length and roughness
    const displacement = (rng() - 0.5) * segLen * roughness
    const midX = (p1.x + p2.x) / 2 + nx * displacement
    const midY = (p1.y + p2.y) / 2 + ny * displacement
    const midPoint: Point = { x: midX, y: midY }

    const left = subdivide(p1, midPoint, depth - 1)
    const right = subdivide(midPoint, p2, depth - 1)

    // Merge points without duplicating midpoint
    return [...left.slice(0, -1), ...right]
  }

  return subdivide(start, end, maxDepth)
}

/**
 * Generates secondary forked branches originating from the main lightning trunk.
 */
export function generateLightningTree(
  start: Point,
  end: Point,
  maxDepth = 4,
  roughness = 0.35,
  forkProbability = 0.3,
  rng: () => number = Math.random
): Point[][] {
  const trunk = generateLightningBolt(start, end, maxDepth, roughness, rng)
  const branches: Point[][] = [trunk]

  if (trunk.length < 4) return branches

  // Fork secondary branches off the trunk
  for (let i = 2; i < trunk.length - 2; i += 2) {
    if (rng() < forkProbability) {
      const forkStart = trunk[i]
      const prev = trunk[i - 1]
      const dirX = forkStart.x - prev.x
      const dirY = forkStart.y - prev.y
      const angle = (rng() - 0.5) * 0.8
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const forkLen = 30 + rng() * 60

      const forkEnd: Point = {
        x: forkStart.x + (dirX * cos - dirY * sin) * 0.6 + (rng() - 0.5) * forkLen,
        y: forkStart.y + (dirX * sin + dirY * cos) * 0.6 + (rng() - 0.5) * forkLen,
      }

      const forkPoints = generateLightningBolt(forkStart, forkEnd, maxDepth - 1, roughness * 1.1, rng)
      branches.push(forkPoints)
    }
  }

  return branches
}

const SPARK_PALETTES = [
  "rgba(74, 255, 180, ",   // Electric Mint (Lume Primary)
  "rgba(0, 240, 255, ",    // Neon Cyan
  "rgba(168, 85, 247, ",   // Astral Violet
  "rgba(255, 255, 255, ",   // Pure Searing White
  "rgba(251, 191, 36, ",   // Radiant Gold
]

/**
 * Creates an upward-floating cosmic spark particle.
 */
export function createCosmicSpark(
  bounds: { width: number; height: number },
  rng: () => number = Math.random
): CosmicSpark {
  const maxLife = 1.8 + rng() * 2.5
  return {
    x: rng() * bounds.width,
    y: bounds.height * 0.4 + rng() * bounds.height * 0.6,
    vx: (rng() - 0.5) * 18,
    vy: -(15 + rng() * 35), // Rising upward
    size: 1.0 + rng() * 2.2,
    alpha: 0,
    maxAlpha: 0.4 + rng() * 0.6,
    color: SPARK_PALETTES[Math.floor(rng() * SPARK_PALETTES.length)],
    life: maxLife,
    maxLife,
    wobbleSpeed: 1.5 + rng() * 3.0,
    wobblePhase: rng() * Math.PI * 2,
  }
}

/**
 * Updates a cosmic spark's position, sinusoidal turbulence, and lifecycle.
 */
export function updateCosmicSpark(
  spark: CosmicSpark,
  bounds: { width: number; height: number },
  delta: number,
  rng: () => number = Math.random
): CosmicSpark {
  let { life, maxLife, x, y, vx, vy, wobblePhase, wobbleSpeed, maxAlpha } = spark

  life -= delta
  if (life <= 0 || y < -20 || x < -20 || x > bounds.width + 20) {
    // Respawn from bottom half
    return createCosmicSpark(bounds, rng)
  }

  wobblePhase += wobbleSpeed * delta
  x += (vx + Math.sin(wobblePhase) * 12) * delta
  y += vy * delta

  // Smooth ease-in ease-out alpha lifecycle
  const progress = 1 - life / maxLife
  let currentAlpha = 0
  if (progress < 0.2) {
    currentAlpha = (progress / 0.2) * maxAlpha
  } else if (progress > 0.7) {
    currentAlpha = ((1 - progress) / 0.3) * maxAlpha
  } else {
    currentAlpha = maxAlpha
  }

  return {
    ...spark,
    x,
    y,
    life,
    wobblePhase,
    alpha: Math.max(0, Math.min(1, currentAlpha)),
  }
}
