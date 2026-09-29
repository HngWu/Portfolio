import test from "node:test"
import assert from "node:assert/strict"
import {
  normalizeAngle,
  getShortestAngleDelta,
  getRingTransform,
  getHelixTransform,
  getGridTransform,
  interpolateTransform,
  getRingRadius,
} from "../lib/projects/layoutMath.ts"

test("normalizeAngle keeps angles within [-PI, PI] cleanly", () => {
  assert.equal(normalizeAngle(0), 0)
  assert.equal(normalizeAngle(Math.PI / 2), Math.PI / 2)
  assert.equal(normalizeAngle(-Math.PI / 2), -Math.PI / 2)

  // Wraparound checks
  const wrappedPos = normalizeAngle(Math.PI * 2.5)
  assert.ok(Math.abs(wrappedPos - Math.PI / 2) < 1e-10)

  const wrappedNeg = normalizeAngle(-Math.PI * 2.5)
  assert.ok(Math.abs(wrappedNeg - (-Math.PI / 2)) < 1e-10)

  // Full revolutions
  const largeRevolution = normalizeAngle(Math.PI * 100)
  assert.ok(Math.abs(largeRevolution) < 1e-10)
})

test("getShortestAngleDelta returns shortest angular path", () => {
  const count = 6
  const step = (Math.PI * 2) / count

  // From angle 0 to index 1 (+step)
  const delta1 = getShortestAngleDelta(1, count, 0)
  assert.ok(Math.abs(delta1 - step) < 1e-10)

  // From angle 0 to index 5 (-step shortest path)
  const delta5 = getShortestAngleDelta(5, count, 0)
  assert.ok(Math.abs(delta5 - (-step)) < 1e-10)
})

test("getRingTransform calculates valid seam-free coordinates for N=3, 10, 30", () => {
  for (const count of [3, 10, 30]) {
    const radius = 500
    // Test card 0 when carousel is at 0 rotation
    const frontCard = getRingTransform(0, count, 0, radius)
    assert.ok(Math.abs(frontCard.x) < 1e-10, `Front card X should be 0 for N=${count}`)
    assert.ok(Math.abs(frontCard.z) < 1e-10, `Front card Z should be 0 for N=${count}`)
    assert.ok(Math.abs(frontCard.rotateY) < 1e-10, `Front card rotateY should be 0 for N=${count}`)
    assert.equal(frontCard.scale, 1, `Front card scale should be 1 for N=${count}`)
    assert.equal(frontCard.isFocused, true, `Front card should be focused for N=${count}`)
    assert.equal(frontCard.y, -8, `Front card lifts -8px when focused for N=${count}`)

    // Test continuous rotation across 2 full revolutions (720 degrees) in 100 discrete steps
    let prevX = frontCard.x
    let prevZ = frontCard.z
    const steps = 100
    for (let s = 1; s <= steps; s++) {
      const rot = (s / steps) * Math.PI * 4
      const t = getRingTransform(0, count, rot, radius)

      // Ensure values are finite and within bounds
      assert.ok(Number.isFinite(t.x), "X must be finite")
      assert.ok(Number.isFinite(t.z), "Z must be finite")
      assert.ok(t.scale <= 1 && t.scale >= 0.5, "Scale must be clamped gracefully")
      assert.ok(t.opacity >= 0.1 && t.opacity <= 1, "Opacity must be clamped")
      assert.ok(t.blur >= 0 && t.blur <= 8, "Blur must be clamped")
      assert.ok(t.saturation >= 0.3 && t.saturation <= 1, "Saturation must be clamped")

      // Ensure no massive teleportation/seam breaks between consecutive steps
      const dist = Math.hypot(t.x - prevX, t.z - prevZ)
      assert.ok(dist < radius * 0.4, `Displacement ${dist} should be smooth without seam break`)
      prevX = t.x
      prevZ = t.z
    }
  }
})

test("getHelixTransform applies vertical pitch proportionally", () => {
  const pitchHeight = 400
  const t = getHelixTransform(0, 6, Math.PI / 2, 500, pitchHeight)
  assert.ok(Number.isFinite(t.y))
  assert.notEqual(t.y, 0)
})

test("getGridTransform calculates centered 2D grid matrix", () => {
  const count = 6
  const cols = 3
  const card0 = getGridTransform(0, count, cols, 300, 200, 20)
  const card1 = getGridTransform(1, count, cols, 300, 200, 20)
  const card2 = getGridTransform(2, count, cols, 300, 200, 20)

  // Card 1 is middle column, so X should be 0
  assert.ok(Math.abs(card1.x) < 1e-10)
  // Card 0 is left (-320px), Card 2 is right (+320px)
  assert.ok(Math.abs(card0.x - -320) < 1e-10)
  assert.ok(Math.abs(card2.x - 320) < 1e-10)
  assert.equal(card0.z, 0)
  assert.equal(card0.rotateY, 0)
})

test("interpolateTransform smoothly blends between transforms", () => {
  const ring = getRingTransform(0, 6, 0, 500)
  const grid = getGridTransform(0, 6, 3, 300, 200, 20)

  const mid = interpolateTransform(ring, grid, 0.5)
  assert.ok(Math.abs(mid.x - (ring.x + grid.x) / 2) < 1e-10)
  assert.ok(Math.abs(mid.y - (ring.y + grid.y) / 2) < 1e-10)
  assert.ok(Math.abs(mid.z - (ring.z + grid.z) / 2) < 1e-10)
})

test("getRingRadius returns bounded responsive radius", () => {
  assert.ok(getRingRadius(300, 20, 3) >= 360)
  assert.ok(getRingRadius(500, 40, 20) <= 920)
})
