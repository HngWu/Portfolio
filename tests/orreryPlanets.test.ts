import { describe, it, expect } from "bun:test"
import { PLANETARY_ORBITS, renderPlanetaryEpicycles } from "@/components/background/layers/sigil"

describe("Planetary Epicycles Sub-Renderer", () => {
  it("defines 4 harmonic celestial bodies with correct radial ratios", () => {
    expect(PLANETARY_ORBITS.length).toBe(4)
    expect(PLANETARY_ORBITS.map(p => p.symbol)).toEqual(["♃", "☉", "☿", "☽"])
    expect(PLANETARY_ORBITS[0].radiusRatio).toBe(0.56) // Jupiter
    expect(PLANETARY_ORBITS[1].radiusRatio).toBe(0.47) // Sun
    expect(PLANETARY_ORBITS[2].radiusRatio).toBe(0.39) // Mercury
    expect(PLANETARY_ORBITS[3].radiusRatio).toBe(0.32) // Moon
  })

  it("renders planetary tracks, luminescent wakes, and celestial bodies with balanced save/restore", () => {
    let saveCount = 0
    let restoreCount = 0
    let arcCount = 0
    let fillTextCount = 0

    const mockCtx = {
      save: () => { saveCount++ },
      restore: () => { restoreCount++ },
      beginPath: () => {},
      arc: () => { arcCount++ },
      stroke: () => {},
      fill: () => {},
      fillText: () => { fillTextCount++ },
      setLineDash: () => {},
      globalAlpha: 1,
      strokeStyle: "",
      fillStyle: "",
      lineWidth: 1,
      font: "",
      textAlign: "",
      textBaseline: "",
    } as unknown as CanvasRenderingContext2D

    renderPlanetaryEpicycles(
      mockCtx,
      300,
      10.0, // time
      { x: 100, y: 100, active: true },
      { x: 200, y: 200 }, // orrery center
      "#FFD95A",
      "#8E44AD",
      "#FFFFFF",
      1.0,
      false
    )

    expect(saveCount).toBe(restoreCount)
    expect(saveCount).toBeGreaterThanOrEqual(1)
    expect(fillTextCount).toBe(4) // 4 celestial symbols rendered
    expect(arcCount).toBeGreaterThanOrEqual(8) // 4 orbits + 4 planetary dots
  })

  it("bails early on zero/negative radius or low alphaMult without canvas ops", () => {
    let called = false
    const mockCtx = {
      save: () => { called = true },
    } as unknown as CanvasRenderingContext2D

    renderPlanetaryEpicycles(mockCtx, 0, 10, { x: 0, y: 0, active: false }, { x: 0, y: 0 }, "#FFD95A", "#8E44AD", "#FFFFFF", 1.0, false)
    expect(called).toBe(false)

    renderPlanetaryEpicycles(mockCtx, 300, 10, { x: 0, y: 0, active: false }, { x: 0, y: 0 }, "#FFD95A", "#8E44AD", "#FFFFFF", 0.0005, false)
    expect(called).toBe(false)
  })
})
