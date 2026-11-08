import { describe, it, expect } from "bun:test"
import { renderFog } from "@/components/background/layers/fog"
import { LayerContext } from "@/components/background/types"

describe("Volumetric Alchemical Nebulae & Armillary Grid", () => {
  it("renders 4 volumetric gas cores and armillary coordinate arcs with balanced save/restore", () => {
    let saveCount = 0
    let restoreCount = 0
    let gradientCount = 0
    let arcCount = 0
    let ellipseCount = 0

    const mockCtx = {
      save: () => { saveCount++ },
      restore: () => { restoreCount++ },
      beginPath: () => {},
      arc: () => { arcCount++ },
      ellipse: () => { ellipseCount++ },
      stroke: () => {},
      fill: () => {},
      fillRect: () => {},
      clearRect: () => {},
      setLineDash: () => {},
      rotate: () => {},
      translate: () => {},
      createRadialGradient: () => {
        gradientCount++
        return { addColorStop: () => {} }
      },
      globalAlpha: 1,
      strokeStyle: "",
      fillStyle: "",
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D

    const layerCtx: LayerContext = {
      ctx: mockCtx,
      width: 1920,
      height: 1080,
      dpr: 1,
      time: 10,
      dt: 0.016,
      mix: 0.0, // 100% Quick Pitch
      pointer: { x: 500, y: 500, targetX: 500, targetY: 500, active: true, isCoarse: false },
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

    renderFog(layerCtx)
    expect(saveCount).toBe(restoreCount)
    expect(saveCount).toBeGreaterThanOrEqual(1)
    // 4 radial gradients in Quick Pitch: Solar Gold, Amethyst Abyss, Twilight Indigo, Quicksilver Veil
    expect(gradientCount).toBeGreaterThanOrEqual(4)
    // Armillary coordinate latitude ellipses
    expect(ellipseCount).toBeGreaterThanOrEqual(3)
  })

  it("bails early on zero/negative dimensions without errors", () => {
    let called = false
    const mockCtx = { save: () => { called = true } } as unknown as CanvasRenderingContext2D

    const layerCtx = {
      ctx: mockCtx,
      width: 0,
      height: 1080,
    } as unknown as LayerContext

    renderFog(layerCtx)
    expect(called).toBe(false)
  })

  it("renders Deep Dive mode with vignette and graceful fallback when secondaryAmethyst is undefined", () => {
    let saveCount = 0
    let restoreCount = 0
    let gradientCount = 0
    let ellipseCount = 0
    const addedStops: { offset: number; color: string }[] = []

    const mockCtx = {
      save: () => { saveCount++ },
      restore: () => { restoreCount++ },
      beginPath: () => {},
      arc: () => {},
      ellipse: () => { ellipseCount++ },
      stroke: () => {},
      fill: () => {},
      fillRect: () => {},
      clearRect: () => {},
      createRadialGradient: () => {
        gradientCount++
        return {
          addColorStop: (offset: number, color: string) => {
            addedStops.push({ offset, color })
          },
        }
      },
      fillStyle: "",
    } as unknown as CanvasRenderingContext2D

    const layerCtx: LayerContext = {
      ctx: mockCtx,
      width: 1920,
      height: 1080,
      dpr: 1,
      time: 10,
      dt: 0.016,
      mix: 1.0, // 100% Deep Dive
      pointer: { x: 500, y: 500, targetX: 500, targetY: 500, active: true, isCoarse: false },
      trail: [],
      tile: { rect: null, targetRect: null, intensity: 0, targetIntensity: 0, tileId: null },
      palette: {
        accent: { r: 106, g: 13, b: 173, a: 1 },
        accentSoft: { r: 120, g: 20, b: 180, a: 0.8 },
        secondaryAmethyst: undefined, // intentionally undefined to test fallback
        isLight: false,
      } as unknown as LayerContext["palette"],
      reducedMotion: false,
      config: {} as unknown as LayerContext["config"],
      hexLatticePath: null,
      hexCenters: [],
    }

    renderFog(layerCtx)
    expect(saveCount).toBe(restoreCount)
    expect(saveCount).toBe(1)
    // Quick Pitch armillary ellipses should NOT be rendered in Deep Dive mode
    expect(ellipseCount).toBe(0)
    // Exactly 1 vignette gradient rendered in Deep Dive
    expect(gradientCount).toBe(1)
    // Fallback to accentSoft (120, 20, 180) in the vignette gradient stop
    expect(addedStops.some((s) => s.color.includes("120, 20, 180"))).toBe(true)
  })

  it("freezes motion offsets cleanly when reducedMotion is true", () => {
    let saveCount = 0
    let restoreCount = 0
    const gradientOrigins: { x: number; y: number }[] = []
    const arcAngles: { start: number; end: number }[] = []

    const mockCtx = {
      save: () => { saveCount++ },
      restore: () => { restoreCount++ },
      beginPath: () => {},
      arc: (_x: number, _y: number, _r: number, start: number, end: number) => {
        arcAngles.push({ start, end })
      },
      ellipse: () => {},
      stroke: () => {},
      fill: () => {},
      fillRect: () => {},
      clearRect: () => {},
      createRadialGradient: (x0: number, y0: number) => {
        gradientOrigins.push({ x: x0, y: y0 })
        return { addColorStop: () => {} }
      },
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D

    const layerCtx: LayerContext = {
      ctx: mockCtx,
      width: 1000,
      height: 1000,
      dpr: 1,
      time: 99999.0, // High time value
      dt: 0.016,
      mix: 0.0,
      pointer: { x: 400, y: 400, targetX: 400, targetY: 400, active: true, isCoarse: false },
      trail: [],
      tile: { rect: null, targetRect: null, intensity: 0, targetIntensity: 0, tileId: null },
      palette: {
        accent: { r: 201, g: 162, b: 39, a: 1 },
        accentBright: { r: 255, g: 232, b: 117, a: 1 },
        secondaryAmethyst: { r: 142, g: 68, b: 173, a: 1 },
        accentSoft: { r: 232, g: 168, b: 56, a: 0.5 },
        isLight: false,
      } as unknown as LayerContext["palette"],
      reducedMotion: true, // Should freeze time to 0
      config: {} as unknown as LayerContext["config"],
      hexLatticePath: null,
      hexCenters: [],
    }

    renderFog(layerCtx)
    expect(saveCount).toBe(restoreCount)
    // When t = 0:
    // Gold Core: x = 1000 * 0.72 + sin(0) * 30 = 720, y = 1000 * 0.32 + cos(0) * 20 = 340
    const goldOrigin = gradientOrigins[1]
    expect(goldOrigin.x).toBeCloseTo(720, 1)
    expect(goldOrigin.y).toBeCloseTo(340, 1)

    // Amethyst Core: x = 1000 * 0.25 - cos(0) * 25 = 225, y = 1000 * 0.68 - sin(0) * 20 = 680
    const amethystOrigin = gradientOrigins[2]
    expect(amethystOrigin.x).toBeCloseTo(225, 1)
    expect(amethystOrigin.y).toBeCloseTo(680, 1)

    // Meridian arcs start angles: with meridianRot = 0, first arc starts at 0
    const meridianArcAngles = arcAngles.slice(4) // after 4 circular core fills
    expect(meridianArcAngles.length).toBe(3)
    expect(meridianArcAngles[0].start).toBeCloseTo(0, 4)
  })

  it("handles palette.isLight: true with reduced alphas and LIGHT_WASH background", () => {
    let saveCount = 0
    let restoreCount = 0
    let gradientCount = 0
    const fillStylesUsed: string[] = []

    const mockCtx = {
      save: () => { saveCount++ },
      restore: () => { restoreCount++ },
      beginPath: () => {},
      arc: () => {},
      ellipse: () => {},
      stroke: () => {},
      fill: () => {},
      fillRect: () => {
        fillStylesUsed.push(mockCtx.fillStyle as string)
      },
      clearRect: () => {},
      createRadialGradient: () => {
        gradientCount++
        return { addColorStop: () => {} }
      },
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D

    const layerCtx: LayerContext = {
      ctx: mockCtx,
      width: 1000,
      height: 1000,
      dpr: 1,
      time: 5,
      dt: 0.016,
      mix: 0.0,
      pointer: { x: 300, y: 300, targetX: 300, targetY: 300, active: true, isCoarse: false },
      trail: [],
      tile: { rect: null, targetRect: null, intensity: 0, targetIntensity: 0, tileId: null },
      palette: {
        accent: { r: 201, g: 162, b: 39, a: 1 },
        accentBright: { r: 255, g: 232, b: 117, a: 1 },
        secondaryAmethyst: { r: 142, g: 68, b: 173, a: 1 },
        accentSoft: { r: 232, g: 168, b: 56, a: 0.5 },
        isLight: true,
      } as unknown as LayerContext["palette"],
      reducedMotion: false,
      config: {} as unknown as LayerContext["config"],
      hexLatticePath: null,
      hexCenters: [],
    }

    renderFog(layerCtx)
    expect(saveCount).toBe(restoreCount)
    expect(gradientCount).toBeGreaterThanOrEqual(4)
    // The background void fill in light mode must be LIGHT_WASH_STR
    expect(fillStylesUsed[0]).toBe("rgba(250, 250, 252, 0.35)")
  })
})
