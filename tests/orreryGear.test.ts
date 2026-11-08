import { describe, it, expect } from "bun:test"
import { renderOrreryGear } from "@/components/background/layers/sigil"

describe("Orrery Spur Gear Sub-Renderer", () => {
  it("renders 24 teeth closed path and 6 circular lightening cutouts with balanced save/restore", () => {
    let saveCount = 0
    let restoreCount = 0
    let lineToCount = 0
    let arcCount = 0
    let fillCount = 0
    let lastRotatedAngle: number | null = null

    const mockCtx = {
      save: () => { saveCount++ },
      restore: () => { restoreCount++ },
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => { lineToCount++ },
      arc: () => { arcCount++ },
      stroke: () => {},
      fill: () => { fillCount++ },
      setLineDash: () => {},
      rotate: (angle: number) => { lastRotatedAngle = angle },
      globalAlpha: 1,
      strokeStyle: "",
      fillStyle: "",
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D

    renderOrreryGear(mockCtx, 300, 0.785, "#E8A838", "#8E44AD", 1.0)

    expect(saveCount).toBe(restoreCount)
    expect(saveCount).toBe(1)
    expect(lastRotatedAngle).toBe(0.785)
    // 24 teeth * 4 points = 96 points (1 moveTo + 95 lineTo)
    expect(lineToCount).toBe(95)
    // 2 rim tracks + 1 dashed amethyst track + 6 lightening cutouts + 12 rivets = 21 arcs
    expect(arcCount).toBeGreaterThanOrEqual(6)
    // Exactly 1 batched fill call for all 12 micro-rivets
    expect(fillCount).toBe(1)
  })

  it("bails early without drawing operations when radius <= 0 or non-finite", () => {
    let opCount = 0
    const mockCtx = {
      save: () => { opCount++ },
      beginPath: () => { opCount++ },
      stroke: () => { opCount++ },
      fill: () => { opCount++ },
    } as unknown as CanvasRenderingContext2D

    renderOrreryGear(mockCtx, 0, 0.5, "#E8A838", "#8E44AD", 1.0)
    renderOrreryGear(mockCtx, -100, 0.5, "#E8A838", "#8E44AD", 1.0)
    renderOrreryGear(mockCtx, Number.NaN, 0.5, "#E8A838", "#8E44AD", 1.0)

    expect(opCount).toBe(0)
  })

  it("bails early without drawing operations when alphaMult <= 0.001", () => {
    let opCount = 0
    const mockCtx = {
      save: () => { opCount++ },
      beginPath: () => { opCount++ },
      stroke: () => { opCount++ },
      fill: () => { opCount++ },
    } as unknown as CanvasRenderingContext2D

    renderOrreryGear(mockCtx, 200, 0.5, "#E8A838", "#8E44AD", 0)
    renderOrreryGear(mockCtx, 200, 0.5, "#E8A838", "#8E44AD", 0.0005)
    renderOrreryGear(mockCtx, 200, 0.5, "#E8A838", "#8E44AD", -0.5)

    expect(opCount).toBe(0)
  })
})
