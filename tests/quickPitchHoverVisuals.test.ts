import { describe, it, expect } from "bun:test"
import { renderFog } from "@/components/background/layers/fog"
import { renderDust, initDustMotes } from "@/components/background/layers/dust"
import { renderSpellCircle } from "@/components/background/layers/spellCircle"
import { LayerContext } from "@/components/background/types"

function createMockContext() {
  let saveCount = 0
  let restoreCount = 0
  let strokeCount = 0
  let fillCount = 0
  let fillTextCount = 0
  let gradientCount = 0

  const ctx = {
    save: () => {
      saveCount++
    },
    restore: () => {
      restoreCount++
    },
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    ellipse: () => {},
    stroke: () => {
      strokeCount++
    },
    fill: () => {
      fillCount++
    },
    fillRect: () => {},
    clearRect: () => {},
    fillText: () => {
      fillTextCount++
    },
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
    font: "",
    textAlign: "",
    textBaseline: "",
    shadowColor: "",
    shadowBlur: 0,
  } as unknown as CanvasRenderingContext2D

  return {
    ctx,
    counts: {
      get save() {
        return saveCount
      },
      get restore() {
        return restoreCount
      },
      get stroke() {
        return strokeCount
      },
      get fill() {
        return fillCount
      },
      get fillText() {
        return fillTextCount
      },
      get gradient() {
        return gradientCount
      },
      reset() {
        saveCount = 0
        restoreCount = 0
        strokeCount = 0
        fillCount = 0
        fillTextCount = 0
        gradientCount = 0
      },
    },
  }
}

function createDefaultLayerContext(mockCtx: CanvasRenderingContext2D, overrides: Partial<LayerContext> = {}): LayerContext {
  return {
    ctx: mockCtx,
    width: 1920,
    height: 1080,
    dpr: 1,
    time: 5.0,
    dt: 0.016,
    mix: 0.0, // Quick Pitch mode
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
    ...overrides,
  }
}

describe("Quick Pitch Enhanced Visuals & Hover Pipeline Integration", () => {
  it("executes full visual pipeline across multiple animation frames with balanced save/restore and zero exceptions", () => {
    const { ctx: mockCtx, counts } = createMockContext()
    const motes = initDustMotes(20, 1920, 1080)
    expect(motes.length).toBe(20)

    // Run across 10 sequential animation frames
    for (let frame = 0; frame < 10; frame++) {
      const time = 5.0 + frame * 0.016
      const layerCtx = createDefaultLayerContext(mockCtx, { time, dt: 0.016 })

      const saveBefore = counts.save
      const restoreBefore = counts.restore

      expect(() => {
        renderFog(layerCtx)
        renderDust(layerCtx, motes)
        renderSpellCircle(layerCtx)
      }).not.toThrow()

      const saveDelta = counts.save - saveBefore
      const restoreDelta = counts.restore - restoreBefore

      // Each frame must perfectly balance save() and restore()
      expect(saveDelta).toBe(restoreDelta)
      expect(saveDelta).toBeGreaterThanOrEqual(3) // at least fog, dust, spellCircle
    }

    // Verify all motes have evolved positions or lifetimes
    for (const m of motes) {
      expect(Number.isFinite(m.x)).toBe(true)
      expect(Number.isFinite(m.y)).toBe(true)
      expect(m.life).toBeGreaterThan(0)
    }
  })

  it("runs full pipeline cleanly with reducedMotion: true across multiple frames", () => {
    const { ctx: mockCtx, counts } = createMockContext()
    const motes = initDustMotes(20, 1920, 1080)

    for (let frame = 0; frame < 5; frame++) {
      const time = 1.0 + frame * 0.016
      const layerCtx = createDefaultLayerContext(mockCtx, {
        time,
        dt: 0.016,
        reducedMotion: true,
      })

      const saveBefore = counts.save
      const restoreBefore = counts.restore

      expect(() => {
        renderFog(layerCtx)
        renderDust(layerCtx, motes)
        renderSpellCircle(layerCtx)
      }).not.toThrow()

      expect(counts.save - saveBefore).toBe(counts.restore - restoreBefore)
    }
  })

  it("runs full pipeline cleanly in Deep Dive mode (mix = 1.0) with dust and spellCircle early bail", () => {
    const { ctx: mockCtx, counts } = createMockContext()
    const motes = initDustMotes(20, 1920, 1080)

    const layerCtx = createDefaultLayerContext(mockCtx, {
      mix: 1.0, // 100% Deep Dive
    })

    const saveBefore = counts.save
    const restoreBefore = counts.restore

    expect(() => {
      renderFog(layerCtx)
      renderDust(layerCtx, motes)
      renderSpellCircle(layerCtx)
    }).not.toThrow()

    // In Deep Dive, renderDust and renderSpellCircle bail early (mix > 0.85)
    // Only renderFog runs (saving and restoring exactly once)
    const saveDelta = counts.save - saveBefore
    const restoreDelta = counts.restore - restoreBefore
    expect(saveDelta).toBe(1)
    expect(restoreDelta).toBe(1)
  })

  it("runs full pipeline cleanly with coarse pointer (isCoarse: true) and resting tile state (intensity: 0)", () => {
    const { ctx: mockCtx, counts } = createMockContext()
    const motes = initDustMotes(20, 1920, 1080)

    const layerCtx = createDefaultLayerContext(mockCtx, {
      pointer: { x: 0, y: 0, targetX: 0, targetY: 0, active: false, isCoarse: true },
      tile: {
        rect: null,
        targetRect: null,
        intensity: 0, // at rest, no tile hovered
        targetIntensity: 0,
        tileId: null,
      },
    })

    const saveBefore = counts.save
    const restoreBefore = counts.restore

    expect(() => {
      renderFog(layerCtx)
      renderDust(layerCtx, motes)
      renderSpellCircle(layerCtx)
    }).not.toThrow()

    // spellCircle bails because intensity <= 0.005
    // fog and dust execute cleanly with balanced save/restore
    expect(counts.save - saveBefore).toBe(counts.restore - restoreBefore)
  })

  it("handles zero dimensions, non-finite coords, and extreme time values without throwing", () => {
    const { ctx: mockCtx } = createMockContext()
    const motes = initDustMotes(5, 0, 0)

    const zeroDimCtx = createDefaultLayerContext(mockCtx, {
      width: 0,
      height: 0,
      time: NaN,
      dt: Infinity,
    })

    expect(() => {
      renderFog(zeroDimCtx)
      renderDust(zeroDimCtx, motes)
      renderSpellCircle(zeroDimCtx)
    }).not.toThrow()
  })
})
