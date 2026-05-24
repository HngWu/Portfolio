import * as THREE from "three"

/**
 * Projects all DOM bento cards with a [data-id] attribute from screen space
 * to 3D world coordinates on the Z = 0 plane.
 * Returns an array of 12 Vector4 elements (padded with zero vectors) to maintain 
 * a constant uniform array size in custom GLSL shaders.
 * 
 * Each Vector4 represents: vec4(minX, minY, maxX, maxY) in world units.
 */
export function getProjectedBentoBoxes(camera: THREE.Camera): THREE.Vector4[] {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Array(12).fill(null).map(() => new THREE.Vector4(0, 0, 0, 0))
  }

  const cards = document.querySelectorAll("[data-id]")
  const width = window.innerWidth
  const height = window.innerHeight
  const boxes: THREE.Vector4[] = []

  cards.forEach((card) => {
    const rect = card.getBoundingClientRect()
    
    // Skip invisible/empty cards
    if (rect.width === 0 || rect.height === 0) return

    // Convert screen corners to Normalized Device Coordinates (NDC)
    // Left-Bottom and Right-Top NDC values
    const ndcMinX = (rect.left / width) * 2 - 1
    const ndcMaxY = -(rect.top / height) * 2 + 1
    const ndcMaxX = (rect.right / width) * 2 - 1
    const ndcMinY = -(rect.bottom / height) * 2 + 1

    // Unproject to NDC depth 0.5 (representing virtual 3D space)
    const minVec = new THREE.Vector3(ndcMinX, ndcMinY, 0.5).unproject(camera)
    const maxVec = new THREE.Vector3(ndcMaxX, ndcMaxY, 0.5).unproject(camera)

    // Calculate depth factors to intersect the perspective ray with Z = 0 plane
    const depthMin = -camera.position.z / (minVec.z - camera.position.z)
    const depthMax = -camera.position.z / (maxVec.z - camera.position.z)

    // Interpolate world coordinates on the Z = 0 plane
    const worldMinX = camera.position.x + (minVec.x - camera.position.x) * depthMin
    const worldMinY = camera.position.y + (minVec.y - camera.position.y) * depthMin
    const worldMaxX = camera.position.x + (maxVec.x - camera.position.x) * depthMax
    const worldMaxY = camera.position.y + (maxVec.y - camera.position.y) * depthMax

    // Store box limits
    boxes.push(new THREE.Vector4(worldMinX, worldMinY, worldMaxX, worldMaxY))
  })

  // Sort boxes from top-left to bottom-right for clean ordering
  boxes.sort((a, b) => b.y - a.y || a.x - b.x)

  // Pad the array to exactly 12 items to ensure uniform safety in GLSL
  while (boxes.length < 12) {
    boxes.push(new THREE.Vector4(0, 0, 0, 0))
  }

  // If there are more than 12, slice to keep size constant
  return boxes.slice(0, 12)
}
