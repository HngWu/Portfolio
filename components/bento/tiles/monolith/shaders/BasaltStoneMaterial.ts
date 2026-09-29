import * as THREE from "three"

/**
 * Procedural rough basalt stone bump texture generator.
 * Creates an unpolished, porous volcanic stone texture with micro-cavities.
 */
function createBasaltBumpTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null

  const size = 256
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  const imgData = ctx.createImageData(size, size)
  const data = imgData.data

  // Deterministic pseudo-noise generation with multiple octaves
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4

      // Multi-frequency noise
      const n1 = Math.sin(x * 0.12) * Math.cos(y * 0.12)
      const n2 = Math.sin(x * 0.28 + 1.2) * Math.cos(y * 0.28 + 2.4) * 0.5
      const n3 = Math.sin(x * 0.65 + y * 0.45) * 0.25
      const pitting = Math.random() < 0.04 ? -0.4 : 0.0 // Micro-porous basalt voids

      const val = Math.floor(THREE.MathUtils.clamp((0.5 + (n1 + n2 + n3 + pitting) * 0.25) * 255, 0, 255))

      data[idx] = val
      data[idx + 1] = val
      data[idx + 2] = val
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imgData, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  return texture
}

export function createBasaltStoneMaterial(): THREE.MeshStandardMaterial {
  const bumpMap = createBasaltBumpTexture()

  return new THREE.MeshStandardMaterial({
    color: new THREE.Color("#15181f"), // Deep basalt / volcanic slate charcoal
    roughness: 0.88,                   // High micro-roughness: unpolished stone
    metalness: 0.08,                   // Very low metalness
    bumpMap: bumpMap,
    bumpScale: 0.045,                  // Subtle surface pitting and grain
    flatShading: false,
    envMapIntensity: 0.4,
  })
}
