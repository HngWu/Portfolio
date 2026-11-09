import { describe, it, expect } from "bun:test"
import { renderSpellCircle } from "@/components/background/layers/spellCircle"
import { LayerContext } from "@/components/background/types"

interface MockCanvasTracker {
  ctx: CanvasRenderingContext2D
  getSaveCount: () => number
  getRestoreCount: () => number
  getFillTextCount: () => number
  getStrokeCount: () => number
  getFillCount: () => number
  textCalls: string[]
  lineDashCalls: number[][]
  translations: Array<{ x: number; y: number }>
  rotations: number[]
  strokeStyles: (string | CanvasGradient | CanvasPattern)[]
  fillStyles: (string | CanvasGradient | CanvasPattern)[]
}

function createMockCanvasContext(): MockCanvasTracker {
  let saveCount = 0
  let restoreCount = 0
  let fillTextCount = 0
  let strokeCount = 0
  let fillCount = 0
  const textCalls: string[] = []
  const lineDashCalls: number[][] = []
  const translations: Array<{ x: number; y: number }> = []
  const rotations: number[] = []
  const strokeStyles: (string | CanvasGradient | CanvasPattern)[] = []
  const fillStyles: (string | CanvasGradient | CanvasPattern)[] = []

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
    stroke: () => {
      strokeCount++
    },
    fill: () => {
      fillCount++
    },
    fillText: (text: string) => {
      fillTextCount++
      textCalls.push(text)
    },
    setLineDash: (segments: number[]) => {
      lineDashCalls.push([...segments])
    },
    rotate: (angle: number) => {
      rotations.push(angle)
    },
    translate: (x: number, y: number) => {
      translations.push({ x, y })
    },
    globalAlpha: 1,
    get strokeStyle() {
      return strokeStyles[strokeStyles.length - 1] ?? ""
    },
    set strokeStyle(val) {
      strokeStyles.push(val)
    },
    get fillStyle() {
      return fillStyles[fillStyles.length - 1] ?? ""
    },
    set fillStyle(val) {
      fillStyles.push(val)
    },
    lineWidth: 1,
    font: "",
    textAlign: "",
    textBaseline: "",
    shadowColor: "",
    shadowBlur: 0,
  } as unknown as CanvasRenderingContext2D

  return {
    ctx,
    getSaveCount: () => saveCount,
    getRestoreCount: () => restoreCount,
    getFillTextCount: () => fillTextCount,
    getStrokeCount: () => strokeCount,
    getFillCount: () => fillCount,
    textCalls,
    lineDashCalls,
    translations,
    rotations,
    strokeStyles,
    fillStyles,
  }
}

function createLayerContext(
  mockCtx: CanvasRenderingContext2D,
  overrides: Partial<LayerContext> = {}
): LayerContext {
  return {
    ctx: mockCtx,
    width: 1920,
    height: 1080,
    dpr: 1,
    time: 5.0,
    dt: 0.016,
    mix: 0.0,
    pointer: { x: 500, y: 500, targetX: 500, targetY: 500, active: true, isCoarse: false },
    trail: [],
    tile: {
      rect: { left: 100, top: 100, width: 200, height: 200 } as DOMRect,
      targetRect: null,
      intensity: 1.0,
      targetIntensity: 1.0,
      tileId: "test-tile",
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
      intensity: {
        lanternRadius: 180,
        lanternFalloff: 0.85,
        lightThemeAlphaMult: 0.5,
        trailFadeSpeed: 0.04,
        spellCircleRadiusPadding: 20,
      },
      speed: {
        sigilRotationSpeed: 0.0006,
        dustRiseSpeed: 24,
        pulseSpeed: 1.2,
        morphDurationMs: 700,
        cursorLerp: 0.12,
      },
      stretch: { enableRuneCascade: true, enableCrystalOverload: true },
    },
    hexLatticePath: null,
    hexCenters: [],
    ...overrides,
  }
}

const ALL_EXPECTED_RUNES = [
  'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', // Top runes
  'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', // Bottom runes
]

const ELEMENTAL_GLYPHS = ['△', '🜁', '▽', '🜃']

describe("Conformal Cartouche Geometry Across Bento Aspect Ratios", () => {
  const ASPECT_RATIO_TILES = [
    {
      name: "1x1 tile (200x200)",
      rect: { left: 100, top: 100, width: 200, height: 200 } as DOMRect,
    },
    {
      name: "2x2 tile (400x400)",
      rect: { left: 250, top: 150, width: 400, height: 400 } as DOMRect,
    },
    {
      name: "4x2 wide tile (600x250)",
      rect: { left: 120, top: 220, width: 600, height: 250 } as DOMRect,
    },
    {
      name: "4x5 mega tile (350x700)",
      rect: { left: 300, top: 80, width: 350, height: 700 } as DOMRect,
    },
  ]

  ASPECT_RATIO_TILES.forEach(({ name, rect }) => {
    describe(`Tile Aspect Ratio: ${name}`, () => {
      it("maintains strictly balanced save/restore calls (exactly 5 saves and 5 restores)", () => {
        const tracker = createMockCanvasContext()
        const layerCtx = createLayerContext(tracker.ctx, {
          tile: {
            rect,
            targetRect: null,
            intensity: 1.0,
            targetIntensity: 1.0,
            tileId: "aspect-test",
          },
        })

        renderSpellCircle(layerCtx)

        expect(tracker.getSaveCount()).toBe(5)
        expect(tracker.getRestoreCount()).toBe(5)
        expect(tracker.getSaveCount()).toBe(tracker.getRestoreCount())
      })

      it("renders exactly 16 text calls (12 runes + 4 elemental glyphs)", () => {
        const tracker = createMockCanvasContext()
        const layerCtx = createLayerContext(tracker.ctx, {
          tile: {
            rect,
            targetRect: null,
            intensity: 1.0,
            targetIntensity: 1.0,
            tileId: "aspect-test",
          },
        })

        renderSpellCircle(layerCtx)

        expect(tracker.getFillTextCount()).toBe(16)
        expect(tracker.textCalls).toHaveLength(16)

        // 4 cardinal elemental glyphs
        expect(tracker.textCalls).toContain('△') // TL Fire
        expect(tracker.textCalls).toContain('🜁') // TR Air
        expect(tracker.textCalls).toContain('▽') // BR Water
        expect(tracker.textCalls).toContain('🜃') // BL Earth

        // 12 Elder Futhark runes
        for (const rune of ALL_EXPECTED_RUNES) {
          expect(tracker.textCalls).toContain(rune)
        }
      })

      it("configures dashed astrolabe rail with [6, 6] and resets to solid line dash []", () => {
        const tracker = createMockCanvasContext()
        const layerCtx = createLayerContext(tracker.ctx, {
          tile: {
            rect,
            targetRect: null,
            intensity: 1.0,
            targetIntensity: 1.0,
            tileId: "aspect-test",
          },
        })

        renderSpellCircle(layerCtx)

        expect(tracker.lineDashCalls).toEqual([[6, 6], []])
      })

      it("translates to the exact tile center (rect.left + rect.width / 2, rect.top + rect.height / 2)", () => {
        const tracker = createMockCanvasContext()
        const layerCtx = createLayerContext(tracker.ctx, {
          tile: {
            rect,
            targetRect: null,
            intensity: 1.0,
            targetIntensity: 1.0,
            tileId: "aspect-test",
          },
        })

        renderSpellCircle(layerCtx)

        const expectedCenterX = rect.left + rect.width / 2
        const expectedCenterY = rect.top + rect.height / 2

        expect(tracker.translations.length).toBeGreaterThanOrEqual(1)
        expect(tracker.translations[0].x).toBe(expectedCenterX)
        expect(tracker.translations[0].y).toBe(expectedCenterY)
      })
    })
  })
})

describe("Cartouche Geometry Edge Cases & Render Parameter Variations", () => {
  describe("Degenerate and Invalid Tile Rects", () => {
    it("bails early when rect width is 0", () => {
      const tracker = createMockCanvasContext()
      const layerCtx = createLayerContext(tracker.ctx, {
        tile: {
          rect: { left: 100, top: 100, width: 0, height: 200 } as DOMRect,
          targetRect: null,
          intensity: 1.0,
          targetIntensity: 1.0,
          tileId: "zero-width",
        },
      })

      renderSpellCircle(layerCtx)

      expect(tracker.getSaveCount()).toBe(0)
      expect(tracker.getRestoreCount()).toBe(0)
      expect(tracker.getStrokeCount()).toBe(0)
      expect(tracker.getFillTextCount()).toBe(0)
      expect(tracker.translations).toHaveLength(0)
    })

    it("bails early when rect height is 0", () => {
      const tracker = createMockCanvasContext()
      const layerCtx = createLayerContext(tracker.ctx, {
        tile: {
          rect: { left: 100, top: 100, width: 300, height: 0 } as DOMRect,
          targetRect: null,
          intensity: 1.0,
          targetIntensity: 1.0,
          tileId: "zero-height",
        },
      })

      renderSpellCircle(layerCtx)

      expect(tracker.getSaveCount()).toBe(0)
      expect(tracker.getRestoreCount()).toBe(0)
      expect(tracker.getStrokeCount()).toBe(0)
      expect(tracker.getFillTextCount()).toBe(0)
      expect(tracker.translations).toHaveLength(0)
    })

    it("bails early when rect width or height is negative", () => {
      const tracker1 = createMockCanvasContext()
      const layerCtxNegativeW = createLayerContext(tracker1.ctx, {
        tile: {
          rect: { left: 100, top: 100, width: -100, height: 200 } as DOMRect,
          targetRect: null,
          intensity: 1.0,
          targetIntensity: 1.0,
          tileId: "neg-w",
        },
      })
      renderSpellCircle(layerCtxNegativeW)
      expect(tracker1.getSaveCount()).toBe(0)

      const tracker2 = createMockCanvasContext()
      const layerCtxNegativeH = createLayerContext(tracker2.ctx, {
        tile: {
          rect: { left: 100, top: 100, width: 200, height: -50 } as DOMRect,
          targetRect: null,
          intensity: 1.0,
          targetIntensity: 1.0,
          tileId: "neg-h",
        },
      })
      renderSpellCircle(layerCtxNegativeH)
      expect(tracker2.getSaveCount()).toBe(0)
    })

    it("bails early when rect is null or missing", () => {
      const tracker = createMockCanvasContext()
      const layerCtx = createLayerContext(tracker.ctx, {
        tile: {
          rect: null as unknown as DOMRect,
          targetRect: null,
          intensity: 1.0,
          targetIntensity: 1.0,
          tileId: "null-rect",
        },
      })

      renderSpellCircle(layerCtx)

      expect(tracker.getSaveCount()).toBe(0)
      expect(tracker.getRestoreCount()).toBe(0)
      expect(tracker.getStrokeCount()).toBe(0)
    })
  })

  describe("Hover Intensity Progression", () => {
    it("progressively reveals runes as hover intensity scales from 0.1 to 0.5 to 1.0", () => {
      // At intensity 0.1: only earliest runes emerge (1 top + 1 bottom = 2 runes) + 4 elemental = 6 text calls
      const trackerLow = createMockCanvasContext()
      const ctxLow = createLayerContext(trackerLow.ctx, {
        tile: {
          rect: { left: 100, top: 100, width: 300, height: 300 } as DOMRect,
          targetRect: null,
          intensity: 0.1,
          targetIntensity: 0.1,
          tileId: "low-intensity",
        },
      })
      renderSpellCircle(ctxLow)

      const runesLow = trackerLow.textCalls.filter((t) => !ELEMENTAL_GLYPHS.includes(t))
      expect(runesLow.length).toBe(2)
      expect(trackerLow.getFillTextCount()).toBe(6) // 2 runes + 4 elemental glyphs

      // At intensity 0.5: intermediate runes emerge (4 top + 4 bottom = 8 runes) + 4 elemental = 12 text calls
      const trackerMid = createMockCanvasContext()
      const ctxMid = createLayerContext(trackerMid.ctx, {
        tile: {
          rect: { left: 100, top: 100, width: 300, height: 300 } as DOMRect,
          targetRect: null,
          intensity: 0.5,
          targetIntensity: 0.5,
          tileId: "mid-intensity",
        },
      })
      renderSpellCircle(ctxMid)

      const runesMid = trackerMid.textCalls.filter((t) => !ELEMENTAL_GLYPHS.includes(t))
      expect(runesMid.length).toBe(8)
      expect(trackerMid.getFillTextCount()).toBe(12) // 8 runes + 4 elemental glyphs

      // At intensity 1.0: all 12 runes emerge + 4 elemental = 16 text calls
      const trackerFull = createMockCanvasContext()
      const ctxFull = createLayerContext(trackerFull.ctx, {
        tile: {
          rect: { left: 100, top: 100, width: 300, height: 300 } as DOMRect,
          targetRect: null,
          intensity: 1.0,
          targetIntensity: 1.0,
          tileId: "full-intensity",
        },
      })
      renderSpellCircle(ctxFull)

      const runesFull = trackerFull.textCalls.filter((t) => !ELEMENTAL_GLYPHS.includes(t))
      expect(runesFull.length).toBe(12)
      expect(trackerFull.getFillTextCount()).toBe(16) // 12 runes + 4 elemental glyphs

      // Strictly monotonically increasing rune manifestation
      expect(runesLow.length).toBeLessThan(runesMid.length)
      expect(runesMid.length).toBeLessThan(runesFull.length)
    })
  })

  describe("Accessibility: Reduced Motion Mode", () => {
    it("freezes astrolabe gear rotations to exactly 0 when reducedMotion is true", () => {
      const tracker = createMockCanvasContext()
      const layerCtx = createLayerContext(tracker.ctx, {
        time: 42.0, // Arbitrary non-zero time
        reducedMotion: true,
        tile: {
          rect: { left: 100, top: 100, width: 300, height: 300 } as DOMRect,
          targetRect: null,
          intensity: 1.0,
          targetIntensity: 1.0,
          tileId: "reduced-motion-test",
        },
      })

      renderSpellCircle(layerCtx)

      expect(tracker.getSaveCount()).toBe(5)
      expect(tracker.getRestoreCount()).toBe(5)

      // 4 quadrant gears rotate
      expect(tracker.rotations).toHaveLength(4)
      for (const rot of tracker.rotations) {
        expect(rot).toBe(0)
      }
    })

    it("applies dynamic rotation angles when reducedMotion is false", () => {
      const tracker = createMockCanvasContext()
      const testTime = 10.0
      const layerCtx = createLayerContext(tracker.ctx, {
        time: testTime,
        reducedMotion: false,
        tile: {
          rect: { left: 100, top: 100, width: 300, height: 300 } as DOMRect,
          targetRect: null,
          intensity: 1.0,
          targetIntensity: 1.0,
          tileId: "standard-motion-test",
        },
      })

      renderSpellCircle(layerCtx)

      expect(tracker.rotations).toHaveLength(4)
      // Clockwise gears: testTime * 0.5 = 5.0
      // Counter-clockwise gears: -testTime * 0.5 = -5.0
      expect(tracker.rotations[0]).toBe(5.0) // TL: CW
      expect(tracker.rotations[1]).toBe(-5.0) // TR: CCW
      expect(tracker.rotations[2]).toBe(5.0) // BR: CW
      expect(tracker.rotations[3]).toBe(-5.0) // BL: CCW
    })
  })

  describe("Color Palette: Light Mode vs Dark Mode", () => {
    it("renders with reduced alpha multiplier in light palette while preserving geometry and balanced saves", () => {
      const trackerDark = createMockCanvasContext()
      const ctxDark = createLayerContext(trackerDark.ctx, {
        palette: {
          accent: { r: 201, g: 162, b: 39, a: 1 },
          accentBright: { r: 255, g: 232, b: 117, a: 1 },
          secondary: { r: 142, g: 68, b: 173, a: 1 },
          secondaryAmethyst: { r: 142, g: 68, b: 173, a: 1 },
          accentSoft: { r: 232, g: 168, b: 56, a: 0.5 },
          glowRgb: { r: 201, g: 162, b: 39 },
          isLight: false,
        } as unknown as LayerContext["palette"],
        tile: {
          rect: { left: 100, top: 100, width: 300, height: 300 } as DOMRect,
          targetRect: null,
          intensity: 1.0,
          targetIntensity: 1.0,
          tileId: "dark-test",
        },
      })
      renderSpellCircle(ctxDark)

      const trackerLight = createMockCanvasContext()
      const ctxLight = createLayerContext(trackerLight.ctx, {
        palette: {
          accent: { r: 201, g: 162, b: 39, a: 1 },
          accentBright: { r: 255, g: 232, b: 117, a: 1 },
          secondary: { r: 142, g: 68, b: 173, a: 1 },
          secondaryAmethyst: { r: 142, g: 68, b: 173, a: 1 },
          accentSoft: { r: 232, g: 168, b: 56, a: 0.5 },
          glowRgb: { r: 201, g: 162, b: 39 },
          isLight: true,
        } as unknown as LayerContext["palette"],
        tile: {
          rect: { left: 100, top: 100, width: 300, height: 300 } as DOMRect,
          targetRect: null,
          intensity: 1.0,
          targetIntensity: 1.0,
          tileId: "light-test",
        },
      })
      renderSpellCircle(ctxLight)

      // Both should have strictly balanced saves and 16 text calls
      expect(trackerLight.getSaveCount()).toBe(5)
      expect(trackerLight.getRestoreCount()).toBe(5)
      expect(trackerLight.getFillTextCount()).toBe(16)

      // Light mode baseAlpha is scaled by 0.35 vs dark mode 0.75
      // Inspect the first outer rail stroke style
      const darkOuterStroke = trackerDark.strokeStyles[0] as string
      const lightOuterStroke = trackerLight.strokeStyles[0] as string

      // Verify stroke style rgba strings reflect the 0.35 vs 0.75 multiplier
      const extractAlpha = (rgbaStr: string): number => {
        const match = rgbaStr.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/)
        return match ? parseFloat(match[1]) : NaN
      }

      expect(extractAlpha(darkOuterStroke)).toBeCloseTo(0.3, 3) // 0.75 * 0.4 = 0.3
      expect(extractAlpha(lightOuterStroke)).toBeCloseTo(0.14, 3) // 0.35 * 0.4 = 0.14
      expect(extractAlpha(lightOuterStroke)).toBeLessThan(extractAlpha(darkOuterStroke))
    })
  })
})
