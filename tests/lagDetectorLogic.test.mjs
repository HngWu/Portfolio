import test from "node:test"
import assert from "node:assert/strict"

/**
 * Pure helper algorithm replicating the lag detector logic in `hooks/useLagDetector.ts`
 */
function calculateFpsFromDeltas(deltas) {
  if (deltas.length === 0) return 60
  const totalDuration = deltas.reduce((a, b) => a + b, 0)
  const avgDelta = totalDuration / deltas.length
  return Math.min(Math.round(1000 / avgDelta), 120)
}

function processFrameDeltas(windowDeltas, newDelta, maxWindow = 60) {
  const clamped = Math.min(newDelta, 500)
  const updated = [...windowDeltas, clamped]
  if (updated.length > maxWindow) {
    updated.shift()
  }
  return updated
}

test("calculateFpsFromDeltas correctly reports 60 FPS for 16.6ms intervals", () => {
  const deltas = Array(60).fill(16.666)
  const fps = calculateFpsFromDeltas(deltas)
  assert.equal(fps, 60)
})

test("calculateFpsFromDeltas correctly reports 30 FPS for 33.3ms intervals", () => {
  const deltas = Array(60).fill(33.333)
  const fps = calculateFpsFromDeltas(deltas)
  assert.equal(fps, 30)
})

test("calculateFpsFromDeltas correctly detects low FPS for 50ms intervals (~20 FPS)", () => {
  const deltas = Array(60).fill(50)
  const fps = calculateFpsFromDeltas(deltas)
  assert.equal(fps, 20)
  assert.ok(fps < 28) // Lag threshold
})

test("processFrameDeltas clamps large pauses to prevent distortion", () => {
  let deltas = []
  deltas = processFrameDeltas(deltas, 2000, 10)
  assert.equal(deltas[0], 500) // Clamped to 500ms
})

test("processFrameDeltas maintains window size limit", () => {
  let deltas = []
  for (let i = 0; i < 70; i++) {
    deltas = processFrameDeltas(deltas, 16.6, 60)
  }
  assert.equal(deltas.length, 60)
})
