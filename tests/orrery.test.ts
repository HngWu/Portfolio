import { describe, it, expect } from "bun:test"
import { renderSigil } from "@/components/background/layers/sigil"
import { LayerContext } from "@/components/background/types"

describe("Sacred Celestial Orrery Integration", () => {
  it("bails early when mix > 0.85 (Deep Dive mode)", () => {
    let strokeCount = 0
    const mockCtx = {
      save: () => {},
      restore: () => {},
      stroke: () => { strokeCount++ },
    } as unknown as CanvasRenderingContext2D

    const layerCtx: LayerContext = {
      ctx: mockCtx,
      width: 1920,
      height: 1080,
      dpr: 1,
      time: 10,
      dt: 0.016,
      mix: 0.90, // Deep Dive
      pointer: { x: 500, y: 500, targetX: 500, targetY: 500, active: true, isCoarse: false },
      trail: [],
      tile: { rect: null, targetRect: null, intensity: 0, targetIntensity: 0, tileId: null },
      palette: {
        accent: { r: 201, g: 162, b: 39, a: 1 },
        accentBright: { r: 255, g: 232, b: 117, a: 1 },
        secondary: { r: 142, g: 68, b: 173, a: 1 },
        accentSoft: { r: 232, g: 168, b: 56, a: 0.5 },
        glowRgb: { r: 201, g: 162, b: 39 },
        isLight: false,
      } as unknown as LayerContext["palette"],
      reducedMotion: false,
      config: {
        density: { dustCount: 110, runeCount: 36, maxPulses: 24, hexRadius: 36 },
        intensity: { lanternRadius: 180, lanternFalloff: 0.85, lightThemeAlphaMult: 0.5, trailFadeSpeed: 0.04, spellCircleRadiusPadding: 32 },
        speed: { sigilRotationSpeed: 0.0006, dustRiseSpeed: 24, pulseSpeed: 1.2, morphDurationMs: 700, cursorLerp: 0.12 },
        stretch: { enableRuneCascade: true, enableCrystalOverload: true },
      },
      hexLatticePath: null,
      hexCenters: [],
    }

    renderSigil(layerCtx)
    expect(strokeCount).toBe(0)
  })

  it("renders all 4 tiers and ley-line in Quick Pitch mode with balanced save/restore", () => {
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
      scale: () => {},
      createRadialGradient: () => ({ addColorStop: () => {} }),
      globalAlpha: 1,
      strokeStyle: "",
      fillStyle: "",
      lineWidth: 1,
      font: "",
      textAlign: "",
      textBaseline: "",
    } as unknown as CanvasRenderingContext2D

    const layerCtx: LayerContext = {
      ctx: mockCtx,
      width: 1920,
      height: 1080,
      dpr: 1,
      time: 5.0,
      dt: 0.016,
      mix: 0.0, // 100% Quick Pitch
      pointer: { x: 800, y: 600, targetX: 800, targetY: 600, active: true, isCoarse: false },
      trail: [],
      tile: {
        rect: { left: 400, top: 300, width: 300, height: 200 } as DOMRect,
        targetRect: null,
        intensity: 0.8,
        targetIntensity: 0.8,
        tileId: "projects",
      },
      palette: {
        accent: { r: 201, g: 162, b: 39, a: 1 },
        accentBright: { r: 255, g: 232, b: 117, a: 1 },
        secondary: { r: 142, g: 68, b: 173, a: 1 },
        accentSoft: { r: 232, g: 168, b: 56, a: 0.5 },
        glowRgb: { r: 201, g: 162, b: 39 },
        isLight: false,
      } as unknown as LayerContext["palette"],
      reducedMotion: false,
      config: {
        density: { dustCount: 110, runeCount: 36, maxPulses: 24, hexRadius: 36 },
        intensity: { lanternRadius: 180, lanternFalloff: 0.85, lightThemeAlphaMult: 0.5, trailFadeSpeed: 0.04, spellCircleRadiusPadding: 32 },
        speed: { sigilRotationSpeed: 0.0006, dustRiseSpeed: 24, pulseSpeed: 1.2, morphDurationMs: 700, cursorLerp: 0.12 },
        stretch: { enableRuneCascade: true, enableCrystalOverload: true },
      },
      hexLatticePath: null,
      hexCenters: [],
    }

    renderSigil(layerCtx)
    expect(saveCount).toBe(restoreCount)
    expect(saveCount).toBeGreaterThanOrEqual(4)
    expect(strokeCount).toBeGreaterThan(0)
    // 24 runes (Tier 1) + 4 planets (Tier 3) = 28 fillText calls
    expect(fillTextCount).toBe(28)
  })

  it("handles reducedMotion gracefully with static needle and suppressed ley-line beads", () => {
    let saveCount = 0
    let restoreCount = 0
    let fillTextCount = 0

    const mockCtx = {
      save: () => { saveCount++ },
      restore: () => { restoreCount++ },
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      stroke: () => {},
      fill: () => {},
      fillText: () => { fillTextCount++ },
      setLineDash: () => {},
      rotate: () => {},
      translate: () => {},
      scale: () => {},
      createRadialGradient: () => ({ addColorStop: () => {} }),
      globalAlpha: 1,
      strokeStyle: "",
      fillStyle: "",
      lineWidth: 1,
      font: "",
      textAlign: "",
      textBaseline: "",
    } as unknown as CanvasRenderingContext2D

    const layerCtx: LayerContext = {
      ctx: mockCtx,
      width: 1920,
      height: 1080,
      dpr: 1,
      time: 5.0,
      dt: 0.016,
      mix: 0.0,
      pointer: { x: 800, y: 600, targetX: 800, targetY: 600, active: true, isCoarse: false },
      trail: [],
      tile: {
        rect: { left: 400, top: 300, width: 300, height: 200 } as DOMRect,
        targetRect: null,
        intensity: 0.8,
        targetIntensity: 0.8,
        tileId: "projects",
      },
      palette: {
        accent: { r: 201, g: 162, b: 39, a: 1 },
        accentBright: { r: 255, g: 232, b: 117, a: 1 },
        secondary: { r: 142, g: 68, b: 173, a: 1 },
        accentSoft: { r: 232, g: 168, b: 56, a: 0.5 },
        glowRgb: { r: 201, g: 162, b: 39 },
        isLight: false,
      } as unknown as LayerContext["palette"],
      reducedMotion: true,
      config: {
        density: { dustCount: 110, runeCount: 36, maxPulses: 24, hexRadius: 36 },
        intensity: { lanternRadius: 180, lanternFalloff: 0.85, lightThemeAlphaMult: 0.5, trailFadeSpeed: 0.04, spellCircleRadiusPadding: 32 },
        speed: { sigilRotationSpeed: 0.0006, dustRiseSpeed: 24, pulseSpeed: 1.2, morphDurationMs: 700, cursorLerp: 0.12 },
        stretch: { enableRuneCascade: true, enableCrystalOverload: true },
      },
      hexLatticePath: null,
      hexCenters: [],
    }

    renderSigil(layerCtx)
    expect(saveCount).toBe(restoreCount)
    expect(saveCount).toBeGreaterThanOrEqual(4)
    expect(fillTextCount).toBe(28)
  })
})
