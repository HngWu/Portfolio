import { describe, it, expect } from "bun:test"
import { getShortestAngleDelta, computeGearToothCoordinates } from "@/components/background/types"

describe("Orrery Geometric Helpers", () => {
  it("getShortestAngleDelta calculates direct shortest angular delta across wrap boundary", () => {
    // 170 deg to -170 deg should wrap around PI (delta = 20 deg = 0.349 rad), not 340 deg
    const current = (170 * Math.PI) / 180
    const target = (-170 * Math.PI) / 180
    const delta = getShortestAngleDelta(current, target)
    expect(delta).toBeCloseTo((20 * Math.PI) / 180, 4)
  })

  it("getShortestAngleDelta returns negative delta when turning clockwise", () => {
    const current = (45 * Math.PI) / 180
    const target = (15 * Math.PI) / 180
    const delta = getShortestAngleDelta(current, target)
    expect(delta).toBeCloseTo((-30 * Math.PI) / 180, 4)
  })

  it("getShortestAngleDelta handles multi-turn angular differences cleanly", () => {
    expect(getShortestAngleDelta(4 * Math.PI, 0)).toBeCloseTo(0, 4)
    expect(getShortestAngleDelta(-8 * Math.PI + 0.5, 0)).toBeCloseTo(-0.5, 4)
    expect(getShortestAngleDelta(0, -8 * Math.PI + 0.5)).toBeCloseTo(0.5, 4)
    expect(getShortestAngleDelta(-8 * Math.PI - 0.5, 0)).toBeCloseTo(0.5, 4)
  })

  it("computeGearToothCoordinates precomputes 24 involute teeth coordinates at normalized unit radius", () => {
    const teeth = computeGearToothCoordinates(24, 0.66, 0.74)
    // 24 teeth * 4 points per tooth (rootL, tipL, tipR, rootR) = 96 points
    expect(teeth.length).toBe(96)
    // Verify first tooth root point has expected radius close to 0.66
    const r0 = Math.hypot(teeth[0].x, teeth[0].y)
    expect(r0).toBeCloseTo(0.66, 2)
  })

  it("computeGearToothCoordinates defensively clamps minimum tooth count to 3", () => {
    const teeth = computeGearToothCoordinates(1, 0.5, 0.8)
    // Clamped to 3 teeth * 4 = 12 points
    expect(teeth.length).toBe(12)
  })
})
