import { describe, it, expect, mock } from 'bun:test'
import {
  initRunes,
  renderRunes,
  ELDER_FUTHARK,
  HEXTECH_GLYPHS,
  FONT_RUNE,
  FONT_HEX,
  resetCascadeState,
  triggerCascadeForTesting,
  RuneNode,
} from '../components/background/layers/runes'
import { LayerContext } from '../components/background/types'

function createMockContext(overrides: Partial<LayerContext> = {}): {
  ctx: LayerContext
  calls: string[]
  canvasOps: any
} {
  const calls: string[] = []
  const canvasOps: any = {
    save: mock(() => calls.push('save')),
    restore: mock(() => calls.push('restore')),
    fillText: mock((text: string, x: number, y: number) =>
      calls.push(`fillText(${text},${x.toFixed(1)},${y.toFixed(1)})`)
    ),
    font: '',
    fillStyle: '',
    globalAlpha: 1,
    shadowColor: '',
    shadowBlur: 0,
    textAlign: '',
    textBaseline: '',
  }

  const baseCtx: LayerContext = {
    ctx: canvasOps as any,
    width: 800,
    height: 600,
    dpr: 1,
    time: 1.0,
    dt: 0.016,
    mix: 0.0, // Quick Pitch default
    palette: {
      accent: { r: 180, g: 140, b: 60, a: 1 }, // brass
      accentBright: { r: 255, g: 215, b: 0, a: 1 }, // gold leaf
      accentDeep: { r: 100, g: 80, b: 30, a: 1 },
      accentSoft: { r: 200, g: 170, b: 80, a: 1 },
      glowRgb: { r: 255, g: 215, b: 0 },
      secondaryAmethyst: { r: 150, g: 50, b: 200, a: 1 },
      lumePrimary: { r: 255, g: 200, b: 50, a: 1 },
      lumeSecondary: { r: 200, g: 180, b: 100, a: 1 },
      isLight: false,
    },
    pointer: {
      x: 400,
      y: 300,
      targetX: 400,
      targetY: 300,
      active: true,
      isCoarse: false,
    },
    trail: [],
    tile: {
      rect: null,
      targetRect: null,
      intensity: 0,
      targetIntensity: 0,
      tileId: null,
    },
    reducedMotion: false,
    config: {
      density: {
        dustCount: 110,
        runeCount: 36,
        maxPulses: 24,
        hexRadius: 36,
      },
      intensity: {
        lanternRadius: 180,
        lanternFalloff: 0.85,
        lightThemeAlphaMult: 0.5,
        trailFadeSpeed: 0.04,
        spellCircleRadiusPadding: 32,
      },
      speed: {
        sigilRotationSpeed: 0.0006,
        dustRiseSpeed: 24,
        pulseSpeed: 1.2,
        morphDurationMs: 700,
        cursorLerp: 0.12,
      },
      stretch: {
        enableRuneCascade: true,
        enableCrystalOverload: true,
      },
    },
    hexLatticePath: null,
    hexCenters: [],
  }

  const ctx: LayerContext = { ...baseCtx, ...overrides }
  return { ctx, calls, canvasOps }
}

describe('runes.ts: Runic Glyph Matrix Layer', () => {
  it('initRunes generates bounded array with deterministic hex addresses and drift velocity', () => {
    const runes = initRunes(36, 1200, 800)
    expect(runes.length).toBe(36)

    for (let i = 0; i < runes.length; i++) {
      const r = runes[i]
      expect(r.x).toBeGreaterThanOrEqual(0)
      expect(r.x).toBeLessThanOrEqual(1200)
      expect(r.y).toBeGreaterThanOrEqual(0)
      expect(r.y).toBeLessThanOrEqual(800)

      // vy between -4 and -8 px/s
      expect(r.vy).toBeLessThanOrEqual(-4)
      expect(r.vy).toBeGreaterThanOrEqual(-8)

      // Elder char from ELDER_FUTHARK
      expect(ELDER_FUTHARK).toContain(r.elderChar as any)

      // Hextech char from HEXTECH_GLYPHS
      expect(HEXTECH_GLYPHS).toContain(r.hextechChar as any)

      // Deterministic hex address format 0xXXXX
      expect(r.hexAddress).toMatch(/^0x[0-9A-F]{4}$/)

      expect(r.ignite).toBe(0)
      expect(r.baseAlpha).toBeGreaterThan(0.15)
    }

    // Index 0 deterministic address
    expect(runes[0].hexAddress).toBe('0x4A8F')
  })

  it('renderRunes bails early on invalid dimensions or empty runes array', () => {
    const runes = initRunes(10, 800, 600)
    const { ctx, calls } = createMockContext({ width: 0 })

    renderRunes(ctx, runes)
    expect(calls.length).toBe(0)

    const { ctx: emptyCtx, calls: emptyCalls } = createMockContext()
    renderRunes(emptyCtx, [])
    expect(emptyCalls.length).toBe(0)
  })

  it('renderRunes executes with balanced save/restore and sets text baseline/alignment', () => {
    const runes = initRunes(5, 800, 600)
    const { ctx, calls, canvasOps } = createMockContext()

    renderRunes(ctx, runes)

    expect(calls[0]).toBe('save')
    expect(calls[calls.length - 1]).toBe('restore')
    expect(canvasOps.textAlign).toBe('center')
    expect(canvasOps.textBaseline).toBe('middle')
  })

  it('updates drift velocities and wraps edges when reducedMotion is false', () => {
    const rune: RuneNode = {
      x: 100,
      y: 100,
      vx: 10,
      vy: -10,
      elderChar: 'ᚠ',
      hextechChar: '⬡',
      hexAddress: '0x4A8F',
      scrambledChar: 'ᚠ',
      baseAlpha: 0.3,
      ignite: 0,
      scrambleTimer: 1.0,
      phase: 0,
    }

    const { ctx } = createMockContext({ dt: 0.1, reducedMotion: false })
    renderRunes(ctx, [rune])

    expect(rune.x).toBeCloseTo(101, 2)
    expect(rune.y).toBeCloseTo(99, 2)

    // Test top boundary wrap
    rune.y = -25
    renderRunes(ctx, [rune])
    expect(rune.y).toBe(ctx.height + 20)
  })

  it('does not drift or wrap when reducedMotion is true', () => {
    const rune: RuneNode = {
      x: 100,
      y: 100,
      vx: 10,
      vy: -10,
      elderChar: 'ᚠ',
      hextechChar: '⬡',
      hexAddress: '0x4A8F',
      scrambledChar: 'ᚠ',
      baseAlpha: 0.3,
      ignite: 0,
      scrambleTimer: 1.0,
      phase: 0,
    }

    const { ctx } = createMockContext({ dt: 0.1, reducedMotion: true })
    renderRunes(ctx, [rune])

    expect(rune.x).toBe(100)
    expect(rune.y).toBe(100)
  })

  it('scrambles glyphs during mode morph (0.1 < mix < 0.9)', () => {
    const rune: RuneNode = {
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      elderChar: 'ᚠ',
      hextechChar: '⬡',
      hexAddress: '0x4A8F',
      scrambledChar: 'ᚠ',
      baseAlpha: 0.3,
      ignite: 0,
      scrambleTimer: 0.01,
      phase: 0,
    }

    const { ctx, canvasOps } = createMockContext({ mix: 0.5, dt: 0.05 })
    renderRunes(ctx, [rune])

    // Scramble timer should have reset
    expect(rune.scrambleTimer).toBeCloseTo(0.06, 2)
    expect(canvasOps.font).toBe(FONT_RUNE)
  })

  it('renders elder rune in Quick Pitch (mix <= 0.1) with dim brass at rest', () => {
    const rune: RuneNode = {
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      elderChar: 'ᚦ',
      hextechChar: '⬡',
      hexAddress: '0x4A8F',
      scrambledChar: '?',
      baseAlpha: 0.25,
      ignite: 0,
      scrambleTimer: 1.0,
      phase: 0,
    }

    // Pointer far away (800, 800)
    const { ctx, canvasOps, calls } = createMockContext({
      mix: 0.0,
      pointer: { x: 800, y: 800, targetX: 800, targetY: 800, active: true, isCoarse: false },
    })

    renderRunes(ctx, [rune])

    expect(calls.some((c) => c.includes('fillText(ᚦ,'))).toBe(true)
    expect(canvasOps.font).toBe(FONT_RUNE)
    // Dim brass fillStyle
    expect(canvasOps.fillStyle).toBe('rgba(180, 140, 60, 1)')
    expect(canvasOps.shadowBlur).toBe(0)
  })

  it('flares to luminous gold leaf with shadowBlur when in pointer lantern radius', () => {
    const rune: RuneNode = {
      x: 400,
      y: 300,
      vx: 0,
      vy: 0,
      elderChar: 'ᚦ',
      hextechChar: '⬡',
      hexAddress: '0x4A8F',
      scrambledChar: '?',
      baseAlpha: 0.25,
      ignite: 0,
      scrambleTimer: 1.0,
      phase: 0,
    }

    // Pointer directly on the rune
    const { ctx, canvasOps } = createMockContext({
      mix: 0.0,
      pointer: { x: 400, y: 300, targetX: 400, targetY: 300, active: true, isCoarse: false },
    })

    // Run a few frames to ease ignite up
    for (let f = 0; f < 10; f++) {
      renderRunes(ctx, [rune])
    }

    expect(rune.ignite).toBeGreaterThan(0.7)
    // Flares to luminous gold leaf (palette.accentBright)
    expect(canvasOps.fillStyle).toBe('rgba(255, 215, 0, 1)')
    expect(canvasOps.shadowBlur).toBeGreaterThan(5)
    expect(canvasOps.shadowColor).toBe('rgba(255, 215, 0, 1)')
  })

  it('renders hextechChar in Deep Dive (mix >= 0.9) at rest, and hexAddress with FONT_HEX when hovering (ignite > 0.4)', () => {
    const rune: RuneNode = {
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      elderChar: 'ᚦ',
      hextechChar: '◈',
      hexAddress: '0x4A8F',
      scrambledChar: '?',
      baseAlpha: 0.25,
      ignite: 0,
      scrambleTimer: 1.0,
      phase: 0,
    }

    // At rest in Deep Dive (mix = 1.0)
    const { ctx, canvasOps, calls } = createMockContext({
      mix: 1.0,
      palette: {
        accent: { r: 0, g: 200, b: 240, a: 1 },
        accentBright: { r: 50, g: 255, b: 240, a: 1 }, // electric cyan
        accentDeep: { r: 0, g: 80, b: 120, a: 1 },
        accentSoft: { r: 0, g: 150, b: 200, a: 1 },
        glowRgb: { r: 50, g: 255, b: 240 },
        secondaryAmethyst: { r: 150, g: 50, b: 200, a: 1 },
        lumePrimary: { r: 0, g: 255, b: 200, a: 1 },
        lumeSecondary: { r: 100, g: 200, b: 255, a: 1 },
        isLight: false,
      },
      pointer: { x: 800, y: 800, targetX: 800, targetY: 800, active: true, isCoarse: false },
    })

    renderRunes(ctx, [rune])
    expect(calls.some((c) => c.includes('fillText(◈,'))).toBe(true)
    expect(canvasOps.font).toBe(FONT_RUNE)
    expect(canvasOps.fillStyle).toBe('rgba(50, 255, 240, 1)')

    // Now test with ignite > 0.4
    rune.ignite = 0.8
    const { ctx: hoverCtx, canvasOps: hoverCanvas, calls: hoverCalls } = createMockContext({
      mix: 1.0,
      pointer: { x: 100, y: 100, targetX: 100, targetY: 100, active: true, isCoarse: false },
    })

    renderRunes(hoverCtx, [rune])
    expect(hoverCalls.some((c) => c.includes('fillText(0x4A8F,'))).toBe(true)
    expect(hoverCanvas.font).toBe(FONT_HEX)
  })

  it('triggers stretch Rune Cascade sequentially across the viewport in Quick Pitch', () => {
    resetCascadeState()
    triggerCascadeForTesting()

    const runes: RuneNode[] = [
      {
        x: 100, // normalized x = 0.125
        y: 300,
        vx: 0,
        vy: 0,
        elderChar: 'ᚠ',
        hextechChar: '⬡',
        hexAddress: '0x1000',
        scrambledChar: 'ᚠ',
        baseAlpha: 0.25,
        ignite: 0,
        scrambleTimer: 1.0,
        phase: 0,
      },
      {
        x: 700, // normalized x = 0.875
        y: 300,
        vx: 0,
        vy: 0,
        elderChar: 'ᚢ',
        hextechChar: '◈',
        hexAddress: '0x2000',
        scrambledChar: 'ᚢ',
        baseAlpha: 0.25,
        ignite: 0,
        scrambleTimer: 1.0,
        phase: 0,
      },
    ]

    // Width = 800. At dt = 0.225 (progress = 0.225/1.8 = 0.125), rune[0] should ignite while rune[1] is still 0
    const { ctx } = createMockContext({
      mix: 0.0,
      dt: 0.225,
      pointer: { x: -500, y: -500, targetX: -500, targetY: -500, active: false, isCoarse: false },
    })

    renderRunes(ctx, runes)
    expect(runes[0].ignite).toBeGreaterThan(0.05)
    expect(runes[1].ignite).toBe(0)
  })
})
