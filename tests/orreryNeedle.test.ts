import { describe, it, expect } from "bun:test"
import { renderCompassNeedle } from "@/components/background/layers/sigil"

describe("Orrery Compass Needle Sub-Renderer", () => {
  it("renders 8-pointed star rosette, tapered diamond needle, and center jewel boss with balanced save/restore", () => {
    let saveCount = 0
    let restoreCount = 0
    let lineToCount = 0
    let fillCount = 0
    let rotatedAngle = 0

    const mockCtx = {
      save: () => { saveCount++ },
      restore: () => { restoreCount++ },
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => { lineToCount++ },
      arc: () => {},
      stroke: () => {},
      fill: () => { fillCount++ },
      rotate: (rad: number) => { rotatedAngle = rad },
      createRadialGradient: () => ({ addColorStop: () => {} }),
      globalAlpha: 1,
      strokeStyle: "",
      fillStyle: "",
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D

    renderCompassNeedle(mockCtx, 300, 1.25, "#FFD95A", "#8E44AD", 1.0)

    expect(saveCount).toBe(restoreCount)
    expect(saveCount).toBeGreaterThanOrEqual(1)
    expect(rotatedAngle).toBeCloseTo(1.25, 4)
    expect(lineToCount).toBeGreaterThanOrEqual(12) // Needle polygon + star rosette
    expect(fillCount).toBeGreaterThanOrEqual(2)
  })

  it("bails early on zero/negative radius or low alphaMult without canvas ops", () => {
    let called = false
    const mockCtx = {
      save: () => { called = true },
    } as unknown as CanvasRenderingContext2D

    renderCompassNeedle(mockCtx, 0, 1.25, "#FFD95A", "#8E44AD", 1.0)
    expect(called).toBe(false)

    renderCompassNeedle(mockCtx, -50, 1.25, "#FFD95A", "#8E44AD", 1.0)
    expect(called).toBe(false)

    renderCompassNeedle(mockCtx, 300, 1.25, "#FFD95A", "#8E44AD", 0.0005)
    expect(called).toBe(false)
  })
})
