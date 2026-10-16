export interface CardTransform3D {
  x: number
  y: number
  z: number
  rotateY: number
  scale: number
  opacity: number
  blur: number
  saturation: number
  zIndex: number
  isFocused: boolean
  relativeAngle: number
}

/**
 * Normalizes an angle into [-PI, PI] range.
 * This guarantees seamless wraparound without any visible jumps at the seam.
 */
export function normalizeAngle(angle: number): number {
  const twoPi = Math.PI * 2
  let a = angle % twoPi
  if (a > Math.PI) a -= twoPi
  if (a < -Math.PI) a += twoPi
  return a
}

/**
 * Calculates the shortest angular distance from currentRotation to target index.
 */
export function getShortestAngleDelta(
  targetIndex: number,
  count: number,
  currentRotation: number
): number {
  if (count <= 0) return 0
  const step = (Math.PI * 2) / count
  const targetAngle = targetIndex * step
  return normalizeAngle(targetAngle - currentRotation)
}

/**
 * Calculates responsive ring radius based on card width, gap, and count.
 */
export function getRingRadius(cardWidth = 420, gap = 40, count = 6): number {
  const effectiveCount = Math.max(4, Math.min(count, 14))
  const stepAngle = (Math.PI * 2) / effectiveCount
  const chord = cardWidth + gap
  const rawRadius = chord / (2 * Math.tan(stepAngle / 2))
  return Math.max(360, Math.min(rawRadius, 920))
}

/**
 * Pure function: calculates 3D transform for a card in the Ring layout.
 */
export function getRingTransform(
  index: number,
  count: number,
  currentRotation: number,
  radius = 520
): CardTransform3D {
  if (count <= 0) {
    return {
      x: 0,
      y: 0,
      z: 0,
      rotateY: 0,
      scale: 1,
      opacity: 1,
      blur: 0,
      saturation: 1,
      zIndex: 100,
      isFocused: true,
      relativeAngle: 0,
    }
  }

  const step = (Math.PI * 2) / count
  const baseAngle = index * step
  const relAngle = normalizeAngle(baseAngle - currentRotation)
  const absRel = Math.abs(relAngle)

  // Cards face forward directly without Y-rotation so all content is clearly readable
  const x = Math.sin(relAngle) * radius
  // z = 0 at center (relAngle = 0), negative as it recedes into depth
  const z = (Math.cos(relAngle) - 1) * radius
  const rotateY = 0

  // Depth attenuation (content remains sharp and readable)
  const cosFactor = Math.cos(relAngle)
  const isFocused = absRel < step / 2
  const scale = 1 - 0.15 * (1 - Math.max(0, cosFactor))
  const opacity = Math.max(0.4, Math.min(1, cosFactor * 0.45 + 0.55))
  const blur = 0
  const saturation = Math.max(0.7, Math.min(1, 1 - 0.3 * Math.sin(absRel)))
  const zIndex = 1000 + Math.round(z)

  return {
    x,
    y: isFocused ? -8 : 0, // Focused card lifts slightly
    z,
    rotateY,
    scale,
    opacity,
    blur,
    saturation,
    zIndex,
    isFocused,
    relativeAngle: relAngle,
  }
}

/**
 * Pure function: calculates 3D transform for a card in the Helix layout.
 */
export function getHelixTransform(
  index: number,
  count: number,
  currentRotation: number,
  radius = 500,
  pitchHeight = 320
): CardTransform3D {
  const ring = getRingTransform(index, count, currentRotation, radius)
  const y = (-ring.relativeAngle / (Math.PI * 2)) * pitchHeight + (ring.isFocused ? -8 : 0)

  return {
    ...ring,
    y,
  }
}

/**
 * Pure function: calculates 3D transform for a card in the Grid layout.
 */
export function getGridTransform(
  index: number,
  count: number,
  cols = 3,
  cardWidth = 380,
  cardHeight = 320,
  gap = 28,
  activeFocusedIndex = 0
): CardTransform3D {
  const col = index % cols
  const row = Math.floor(index / cols)
  const totalRows = Math.ceil(count / cols)

  const x = (col - (cols - 1) / 2) * (cardWidth + gap)
  const y = (row - (totalRows - 1) / 2) * (cardHeight + gap)

  return {
    x,
    y,
    z: 0,
    rotateY: 0,
    scale: 1,
    opacity: 1,
    blur: 0,
    saturation: 1,
    zIndex: 100,
    isFocused: index === activeFocusedIndex,
    relativeAngle: 0,
  }
}

/**
 * Interpolates smoothly between two 3D transforms.
 */
export function interpolateTransform(
  from: CardTransform3D,
  to: CardTransform3D,
  progress: number
): CardTransform3D {
  const p = Math.max(0, Math.min(1, progress))
  const lerp = (a: number, b: number) => a + (b - a) * p

  return {
    x: lerp(from.x, to.x),
    y: lerp(from.y, to.y),
    z: lerp(from.z, to.z),
    rotateY: lerp(from.rotateY, to.rotateY),
    scale: lerp(from.scale, to.scale),
    opacity: lerp(from.opacity, to.opacity),
    blur: lerp(from.blur, to.blur),
    saturation: lerp(from.saturation, to.saturation),
    zIndex: p > 0.5 ? to.zIndex : from.zIndex,
    isFocused: p > 0.5 ? to.isFocused : from.isFocused,
    relativeAngle: lerp(from.relativeAngle, to.relativeAngle),
  }
}
