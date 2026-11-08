import { describe, it, expect } from "bun:test"
import { renderLeyLineConduit } from "@/components/background/layers/sigil"

describe("Orrery Tile Ley-Line Conduit", () => {
  it("bails early when tile intensity is <= 0.005", () => {
    let strokeCalled = false
    const mockCtx = {
      save: () => {},
      restore: () => {},
      stroke: () => { strokeCalled = true },
    } as unknown as CanvasRenderingContext2D

    renderLeyLineConduit(
      mockCtx,
      { x: 200, y: 200 },
      { x: 500, y: 400 },
      0.002, // intensity near zero
      1.0,   // time
      "#FFD95A",
      1.0,
      false
    )
    expect(strokeCalled).toBe(false)
  })

  it("bails early on zero/negative alphaMult or non-finite coords", () => {
    let called = false
    const mockCtx = {
      save: () => { called = true },
    } as unknown as CanvasRenderingContext2D

    renderLeyLineConduit(mockCtx, { x: 200, y: 200 }, { x: 500, y: 400 }, 0.8, 1.0, "#FFD95A", 0.0005, false)
    expect(called).toBe(false)

    renderLeyLineConduit(mockCtx, { x: NaN, y: 200 }, { x: 500, y: 400 }, 0.8, 1.0, "#FFD95A", 1.0, false)
    expect(called).toBe(false)
  })

  it("bails early when alphaMult or intensity is NaN", () => {
    let called = false
    const mockCtx = {
      save: () => { called = true },
    } as unknown as CanvasRenderingContext2D

    renderLeyLineConduit(mockCtx, { x: 200, y: 200 }, { x: 500, y: 400 }, NaN, 1.0, "#FFD95A", 1.0, false)
    expect(called).toBe(false)

    renderLeyLineConduit(mockCtx, { x: 200, y: 200 }, { x: 500, y: 400 }, 0.8, 1.0, "#FFD95A", NaN, false)
    expect(called).toBe(false)
  })

  it("bails early when distance between centers is < 10px", () => {
    let called = false
    const mockCtx = {
      save: () => { called = true },
    } as unknown as CanvasRenderingContext2D

    renderLeyLineConduit(
      mockCtx,
      { x: 200, y: 200 },
      { x: 205, y: 205 }, // dist ~ 7.07 < 10
      0.85,
      1.0,
      "#FFD95A",
      1.0,
      false
    )
    expect(called).toBe(false)
  })

  it("renders dual conduit line and 3 traveling mana beads when tile is hovered", () => {
    let saveCount = 0
    let restoreCount = 0
    let arcCount = 0
    let lineToCount = 0

    const mockCtx = {
      save: () => { saveCount++ },
      restore: () => { restoreCount++ },
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => { lineToCount++ },
      arc: () => { arcCount++ },
      stroke: () => {},
      fill: () => {},
      setLineDash: () => {},
      globalAlpha: 1,
      strokeStyle: "",
      fillStyle: "",
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D

    renderLeyLineConduit(
      mockCtx,
      { x: 200, y: 200 },
      { x: 500, y: 400 },
      0.85,  // active tile intensity
      2.5,   // time
      "#FFD95A",
      1.0,
      false
    )

    expect(saveCount).toBe(restoreCount)
    expect(saveCount).toBe(1)
    expect(lineToCount).toBeGreaterThanOrEqual(1) // Conduit line
    expect(arcCount).toBe(6) // 3 beads * (1 core + 1 halo) = 6 arcs
  })

  it("suppresses mana pulse beads when reducedMotion is true", () => {
    let arcCount = 0
    let lineToCount = 0
    const mockCtx = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => { lineToCount++ },
      arc: () => { arcCount++ },
      stroke: () => {},
      fill: () => {},
      setLineDash: () => {},
      globalAlpha: 1,
      strokeStyle: "",
      fillStyle: "",
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D

    renderLeyLineConduit(
      mockCtx,
      { x: 200, y: 200 },
      { x: 500, y: 400 },
      0.85,
      2.5,
      "#FFD95A",
      1.0,
      true // reducedMotion
    )

    expect(lineToCount).toBeGreaterThanOrEqual(1)
    expect(arcCount).toBe(0)
  })

  it("resets line dash to solid after drawing dashed conduit", () => {
    const dashHistory: number[][] = []
    const mockCtx = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      stroke: () => {},
      fill: () => {},
      setLineDash: (segments: number[]) => { dashHistory.push(segments) },
      globalAlpha: 1,
      strokeStyle: "",
      fillStyle: "",
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D

    renderLeyLineConduit(
      mockCtx,
      { x: 200, y: 200 },
      { x: 500, y: 400 },
      0.85,
      1.0,
      "#FFD95A",
      1.0,
      false
    )

    expect(dashHistory).toEqual([[4, 6], []])
  })
})
