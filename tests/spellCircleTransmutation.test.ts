import { describe, it, expect } from "bun:test"
import { renderSpellCircle } from "@/components/background/layers/spellCircle"
import { LayerContext } from "@/components/background/types"

describe("Sacred Transmutation Seal Mandala", () => {
  it("renders 4-tier mandala (solar arc, octagram, 4 elemental nodes, 12 runes) with balanced save/restore", () => {
    let saveCount = 0
    let restoreCount = 0
    let fillTextCount = 0
    let strokeCount = 0

    const mockCtx = {
      save: () => { saveCount++ },
      restore: () => { restoreCount++ },
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      stroke: () => { strokeCount++ },
      fill: () => {},
      fillText: () => { fillTextCount++ },
      setLineDash: () => {},
      rotate: () => {},
      translate: () => {},
      globalAlpha: 1,
      strokeStyle: "",
      fillStyle: "",
      lineWidth: 1,
      font: "",
      textAlign: "",
      textBaseline: "",
      shadowColor: "",
      shadowBlur: 0,
    } as unknown as CanvasRenderingContext2D

    const layerCtx: LayerContext = {
      ctx: mockCtx,
      width: 1920,
      height: 1080,
      dpr: 1,
      time: 5.0,
      dt: 0.016,
      mix: 0.0, // Quick Pitch
      pointer: { x: 500, y: 500, targetX: 500, targetY: 500, active: true, isCoarse: false },
      trail: [],
      tile: {
        rect: { left: 400, top: 300, width: 300, height: 200 } as DOMRect,
        targetRect: null,
        intensity: 1.0, // fully hovered
        targetIntensity: 1.0,
        tileId: "projects",
      },
      palette: {
        accent: { r: 201, g: 162, b: 39, a: 1 },
        accentBright: { r: 255, g: 232, b: 117, a: 1 },
        secondary: { r: 142, g: 68, b: 173, a: 1 },
        secondaryAmethyst: { r: 142, g: 68, b: 173, a: 1 },
        accentSoft: { r: 232, g: 168, b: 56, a: 0.5 },
        glowRgb: { r: 201, g: 162, b: 39 },
        isLight: false,
      } as unknown as LayerContext["palette"],
      reducedMotion: false,
      config: {
        density: { dustCount: 110, runeCount: 36, maxPulses: 24, hexRadius: 36 },
        intensity: { lanternRadius: 180, lanternFalloff: 0.85, lightThemeAlphaMult: 0.5, trailFadeSpeed: 0.04, spellCircleRadiusPadding: 28 },
        speed: { sigilRotationSpeed: 0.0006, dustRiseSpeed: 24, pulseSpeed: 1.2, morphDurationMs: 700, cursorLerp: 0.12 },
        stretch: { enableRuneCascade: true, enableCrystalOverload: true },
      },
      hexLatticePath: null,
      hexCenters: [],
    }

    renderSpellCircle(layerCtx)
    expect(saveCount).toBe(restoreCount)
    expect(saveCount).toBeGreaterThanOrEqual(3)
    // 12 Elder Futhark runes + 4 elemental glyphs = 16 text calls
    expect(fillTextCount).toBe(16)
    expect(strokeCount).toBeGreaterThanOrEqual(4)
  })

  it("bails early when mix > 0.85 or tile intensity is <= 0.005", () => {
    let strokeCount = 0
    const mockCtx = { save: () => {}, restore: () => {}, stroke: () => { strokeCount++ } } as unknown as CanvasRenderingContext2D

    const layerCtx = {
      mix: 0.95,
      tile: { intensity: 0.8, rect: { width: 100, height: 100 } },
      width: 1920,
      height: 1080,
    } as unknown as LayerContext

    renderSpellCircle(layerCtx)
    expect(strokeCount).toBe(0)
  })
})
