import { describe, it, expect } from "bun:test"
import { DustMote, renderDust } from "@/components/background/layers/dust"
import { LayerContext } from "@/components/background/types"

describe("Stardust Constellation Threads in Dust Layer", () => {
  it("renders constellation threads between motes within 65px with balanced save/restore", () => {
    let saveCount = 0
    let restoreCount = 0
    let lineToCount = 0
    let strokeCount = 0

    const mockCtx = {
      save: () => { saveCount++ },
      restore: () => { restoreCount++ },
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => { lineToCount++ },
      arc: () => {},
      stroke: () => { strokeCount++ },
      fill: () => {},
      globalAlpha: 1,
      strokeStyle: "",
      fillStyle: "",
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D

    // Two motes 30px apart (well within 65px threshold)
    const mockMotes: DustMote[] = [
      { x: 500, y: 500, vx: 0, vy: -1, size: 2, baseAlpha: 0.8, life: 1, maxLife: 2, phase: 0 },
      { x: 520, y: 510, vx: 0, vy: -1, size: 2, baseAlpha: 0.8, life: 1, maxLife: 2, phase: 0 },
    ]

    const layerCtx: LayerContext = {
      ctx: mockCtx,
      width: 1920,
      height: 1080,
      dpr: 1,
      time: 10,
      dt: 0.016,
      mix: 0.0,
      pointer: { x: 510, y: 505, targetX: 510, targetY: 505, active: true, isCoarse: false },
      trail: [],
      tile: { rect: null, targetRect: null, intensity: 0, targetIntensity: 0, tileId: null },
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
        intensity: { lanternRadius: 180, lanternFalloff: 0.85, lightThemeAlphaMult: 0.5, trailFadeSpeed: 0.04, spellCircleRadiusPadding: 32 },
        speed: { sigilRotationSpeed: 0.0006, dustRiseSpeed: 24, pulseSpeed: 1.2, morphDurationMs: 700, cursorLerp: 0.12 },
        stretch: { enableRuneCascade: true, enableCrystalOverload: true },
      },
      hexLatticePath: null,
      hexCenters: [],
    }

    renderDust(layerCtx, mockMotes)
    expect(saveCount).toBe(restoreCount)
    expect(saveCount).toBeGreaterThanOrEqual(1)
    expect(lineToCount).toBeGreaterThanOrEqual(1)
    expect(strokeCount).toBeGreaterThanOrEqual(1)
  })

  it("suppresses constellation threads when motes are further than 65px apart", () => {
    let lineToCount = 0

    const mockCtx = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => { lineToCount++ },
      arc: () => {},
      stroke: () => {},
      fill: () => {},
      globalAlpha: 1,
      strokeStyle: "",
      fillStyle: "",
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D

    // Two motes 150px apart (exceeds 65px threshold)
    const mockMotes: DustMote[] = [
      { x: 100, y: 100, vx: 0, vy: -1, size: 2, baseAlpha: 0.8, life: 1, maxLife: 2, phase: 0 },
      { x: 250, y: 250, vx: 0, vy: -1, size: 2, baseAlpha: 0.8, life: 1, maxLife: 2, phase: 0 },
    ]

    const layerCtx: LayerContext = {
      ctx: mockCtx,
      width: 1920,
      height: 1080,
      dpr: 1,
      time: 10,
      dt: 0.016,
      mix: 0.0,
      pointer: { x: 0, y: 0, targetX: 0, targetY: 0, active: false, isCoarse: false },
      trail: [],
      tile: { rect: null, targetRect: null, intensity: 0, targetIntensity: 0, tileId: null },
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
        intensity: { lanternRadius: 180, lanternFalloff: 0.85, lightThemeAlphaMult: 0.5, trailFadeSpeed: 0.04, spellCircleRadiusPadding: 32 },
        speed: { sigilRotationSpeed: 0.0006, dustRiseSpeed: 24, pulseSpeed: 1.2, morphDurationMs: 700, cursorLerp: 0.12 },
        stretch: { enableRuneCascade: true, enableCrystalOverload: true },
      },
      hexLatticePath: null,
      hexCenters: [],
    }

    renderDust(layerCtx, mockMotes)
    expect(lineToCount).toBe(0)
  })

  it("suppresses constellation threads when reducedMotion is true", () => {
    let lineToCount = 0

    const mockCtx = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => { lineToCount++ },
      arc: () => {},
      stroke: () => {},
      fill: () => {},
      globalAlpha: 1,
      strokeStyle: "",
      fillStyle: "",
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D

    const mockMotes: DustMote[] = [
      { x: 500, y: 500, vx: 0, vy: -1, size: 2, baseAlpha: 0.8, life: 1, maxLife: 2, phase: 0 },
      { x: 520, y: 510, vx: 0, vy: -1, size: 2, baseAlpha: 0.8, life: 1, maxLife: 2, phase: 0 },
    ]

    const layerCtx: LayerContext = {
      ctx: mockCtx,
      width: 1920,
      height: 1080,
      dpr: 1,
      time: 10,
      dt: 0.016,
      mix: 0.0,
      pointer: { x: 510, y: 505, targetX: 510, targetY: 505, active: true, isCoarse: false },
      trail: [],
      tile: { rect: null, targetRect: null, intensity: 0, targetIntensity: 0, tileId: null },
      palette: {
        accent: { r: 201, g: 162, b: 39, a: 1 },
        accentBright: { r: 255, g: 232, b: 117, a: 1 },
        secondary: { r: 142, g: 68, b: 173, a: 1 },
        secondaryAmethyst: { r: 142, g: 68, b: 173, a: 1 },
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

    renderDust(layerCtx, mockMotes)
    expect(lineToCount).toBe(0)
  })
})
