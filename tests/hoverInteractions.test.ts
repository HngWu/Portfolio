import { describe, it, expect, mock } from 'bun:test'
import { renderSpellCircle } from '../components/background/layers/spellCircle'
import { renderCircuit } from '../components/background/layers/circuit'
import {
  initTileEmbers,
  renderEmbers,
  EmberParticle,
} from '../components/background/layers/embers'
import { LayerContext, DEFAULT_CONFIG } from '../components/background/types'

function createMockContext(overrides: Partial<LayerContext> = {}): {
  ctx: LayerContext
  calls: string[]
  canvasOps: any
} {
  const calls: string[] = []
  let saveCount = 0
  let restoreCount = 0

  const canvasOps: any = {
    save: mock(() => {
      saveCount++
      calls.push('save')
    }),
    restore: mock(() => {
      restoreCount++
      calls.push('restore')
    }),
    beginPath: mock(() => calls.push('beginPath')),
    closePath: mock(() => calls.push('closePath')),
    moveTo: mock((x: number, y: number) => calls.push(`moveTo(${x.toFixed(1)},${y.toFixed(1)})`)),
    lineTo: mock((x: number, y: number) => calls.push(`lineTo(${x.toFixed(1)},${y.toFixed(1)})`)),
    arc: mock((x: number, y: number, r: number) => calls.push(`arc(${x.toFixed(1)},${y.toFixed(1)},${r.toFixed(1)})`)),
    arcTo: mock(() => calls.push('arcTo')),
    stroke: mock(() => calls.push('stroke')),
    fill: mock(() => calls.push('fill')),
    translate: mock((x: number, y: number) => calls.push(`translate(${x.toFixed(1)},${y.toFixed(1)})`)),
    rotate: mock((angle: number) => calls.push(`rotate(${angle.toFixed(2)})`)),
    fillText: mock((text: string, x: number, y: number) => calls.push(`fillText(${text})`)),
    setLineDash: mock((segments: number[]) => calls.push(`setLineDash([${segments.join(',')}])`)),
    roundRect: mock((x: number, y: number, w: number, h: number, r: number) =>
      calls.push(`roundRect(${x.toFixed(1)},${y.toFixed(1)},${w.toFixed(1)},${h.toFixed(1)},${r.toFixed(1)})`)
    ),
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: '',
    textBaseline: '',
    shadowColor: '',
    shadowBlur: 0,
    getSaveCount: () => saveCount,
    getRestoreCount: () => restoreCount,
  }

  const baseCtx: LayerContext = {
    ctx: canvasOps as any,
    width: 1200,
    height: 900,
    dpr: 1,
    time: 2.0,
    dt: 0.016,
    mix: 0.0,
    palette: {
      accent: { r: 212, g: 175, b: 55, a: 1 },
      accentBright: { r: 255, g: 215, b: 0, a: 1 },
      accentDeep: { r: 160, g: 120, b: 20, a: 1 },
      accentSoft: { r: 240, g: 200, b: 100, a: 1 },
      glowRgb: { r: 212, g: 175, b: 55 },
      secondaryAmethyst: { r: 155, g: 89, b: 182, a: 1 },
      lumePrimary: { r: 0, g: 255, b: 200, a: 1 },
      lumeSecondary: { r: 100, g: 200, b: 255, a: 1 },
      isLight: false,
    },
    pointer: {
      x: 300,
      y: 200,
      targetX: 300,
      targetY: 200,
      active: true,
      isCoarse: false,
    },
    trail: [],
    tile: {
      rect: {
        left: 200,
        top: 150,
        right: 400,
        bottom: 350,
        width: 200,
        height: 200,
        x: 200,
        y: 150,
        toJSON: () => {},
      } as DOMRect,
      targetRect: null,
      intensity: 1.0,
      targetIntensity: 1.0,
      tileId: 'tile-about',
    },
    reducedMotion: false,
    config: DEFAULT_CONFIG,
    hexLatticePath: null,
    hexCenters: [],
  }

  return {
    ctx: { ...baseCtx, ...overrides },
    calls,
    canvasOps,
  }
}

describe('spellCircle.ts: Bento Tile Arcane Spell Circle Layer', () => {
  it('bails early in Deep Dive mode (mix > 0.9)', () => {
    const { ctx, canvasOps } = createMockContext({ mix: 0.95 })
    renderSpellCircle(ctx)
    expect(canvasOps.save).not.toHaveBeenCalled()
  })

  it('bails early when tile intensity is near zero (<= 0.005)', () => {
    const { ctx, canvasOps } = createMockContext({
      tile: {
        rect: { left: 100, top: 100, width: 200, height: 200 } as any,
        targetRect: null,
        intensity: 0.002,
        targetIntensity: 0,
        tileId: null,
      },
    })
    renderSpellCircle(ctx)
    expect(canvasOps.save).not.toHaveBeenCalled()
  })

  it('bails early when tile rect is null or dimensions <= 0', () => {
    const { ctx: nullRectCtx, canvasOps: nullOps } = createMockContext({
      tile: { rect: null, targetRect: null, intensity: 1, targetIntensity: 1, tileId: null },
    })
    renderSpellCircle(nullRectCtx)
    expect(nullOps.save).not.toHaveBeenCalled()

    const { ctx: zeroWidthCtx, canvasOps: zeroOps } = createMockContext({ width: 0 })
    renderSpellCircle(zeroWidthCtx)
    expect(zeroOps.save).not.toHaveBeenCalled()
  })

  it('executes balanced c.save() / c.restore() calls', () => {
    const { ctx, canvasOps } = createMockContext({ mix: 0.0 })
    renderSpellCircle(ctx)
    expect(canvasOps.getSaveCount()).toBeGreaterThan(0)
    expect(canvasOps.getSaveCount()).toBe(canvasOps.getRestoreCount())
  })

  it('renders centered at the hovered tile rect with rotating elements', () => {
    const { ctx, calls } = createMockContext({
      tile: {
        rect: { left: 100, top: 100, width: 200, height: 200 } as any,
        targetRect: null,
        intensity: 1.0,
        targetIntensity: 1.0,
        tileId: 'tile-1',
      },
    })
    renderSpellCircle(ctx)
    // Center should be (100 + 100, 100 + 100) = (200.0, 200.0)
    expect(calls).toContain('translate(200.0,200.0)')
    expect(calls).toContain('setLineDash([6,6])')
    expect(calls).toContain('setLineDash([])')
  })

  it('renders runes progressively based on hover intensity', () => {
    const { ctx: lowCtx, calls: lowCalls } = createMockContext({
      tile: {
        rect: { left: 100, top: 100, width: 200, height: 200 } as any,
        targetRect: null,
        intensity: 0.15,
        targetIntensity: 0.15,
        tileId: 'tile-1',
      },
    })
    renderSpellCircle(lowCtx)
    const lowRuneCount = lowCalls.filter((c) => c.startsWith('fillText')).length

    const { ctx: fullCtx, calls: fullCalls } = createMockContext({
      tile: {
        rect: { left: 100, top: 100, width: 200, height: 200 } as any,
        targetRect: null,
        intensity: 1.0,
        targetIntensity: 1.0,
        tileId: 'tile-1',
      },
    })
    renderSpellCircle(fullCtx)
    const fullRuneCount = fullCalls.filter((c) => c.startsWith('fillText')).length

    expect(fullRuneCount).toBeGreaterThan(lowRuneCount)
    // 12 Elder Futhark runes + 4 elemental nodes = 16 text calls
    expect(fullRuneCount).toBe(16)
  })
})

describe('circuit.ts: Bento Tile Hextech Circuit Layer', () => {
  it('bails early in Quick Pitch mode (mix < 0.1)', () => {
    const { ctx, canvasOps } = createMockContext({ mix: 0.05 })
    renderCircuit(ctx)
    expect(canvasOps.save).not.toHaveBeenCalled()
  })

  it('bails early when tile intensity is near zero (<= 0.005)', () => {
    const { ctx, canvasOps } = createMockContext({
      mix: 1.0,
      tile: {
        rect: { left: 100, top: 100, width: 200, height: 200 } as any,
        targetRect: null,
        intensity: 0.001,
        targetIntensity: 0,
        tileId: null,
      },
    })
    renderCircuit(ctx)
    expect(canvasOps.save).not.toHaveBeenCalled()
  })

  it('executes balanced c.save() / c.restore() calls', () => {
    const { ctx, canvasOps } = createMockContext({ mix: 1.0 })
    renderCircuit(ctx)
    expect(canvasOps.getSaveCount()).toBe(1)
    expect(canvasOps.getRestoreCount()).toBe(1)
  })

  it('renders precision corner brackets offset by 6px', () => {
    const { ctx, calls } = createMockContext({
      mix: 1.0,
      tile: {
        rect: { left: 100, top: 100, width: 200, height: 200, right: 300, bottom: 300 } as any,
        targetRect: null,
        intensity: 1.0,
        targetIntensity: 1.0,
        tileId: 'tile-1',
      },
    })
    renderCircuit(ctx)
    // Left offset: 100 - 6 = 94.0, Top offset: 100 - 6 = 94.0
    // Top-left bracket moves: (94, 94 + 16 = 110) -> (94, 94) -> (110, 94)
    expect(calls).toContain('moveTo(94.0,110.0)')
    expect(calls).toContain('lineTo(94.0,94.0)')
    expect(calls).toContain('lineTo(110.0,94.0)')
  })

  it('renders conductive circuit traces and terminal nodes from all four edges', () => {
    const { ctx, calls } = createMockContext({
      mix: 1.0,
      tile: {
        rect: { left: 100, top: 100, width: 200, height: 200, right: 300, bottom: 300 } as any,
        targetRect: null,
        intensity: 1.0,
        targetIntensity: 1.0,
        tileId: 'tile-1',
      },
    })
    renderCircuit(ctx)
    // Should have 8 circular terminal nodes (2 per edge) with radius 2.5
    const terminalNodes = calls.filter((c) => c.startsWith('arc(') && c.endsWith(',2.5)'))
    expect(terminalNodes.length).toBe(8)
  })

  it('renders sonar ripple pulses expanding outwards', () => {
    const { ctx, calls } = createMockContext({
      mix: 1.0,
      tile: {
        rect: { left: 100, top: 100, width: 200, height: 200, right: 300, bottom: 300 } as any,
        targetRect: null,
        intensity: 1.0,
        targetIntensity: 1.0,
        tileId: 'tile-1',
      },
    })
    renderCircuit(ctx)
    const roundRectCalls = calls.filter((c) => c.startsWith('roundRect('))
    expect(roundRectCalls.length).toBeGreaterThan(0)
  })
})

describe('embers.ts: Bento Tile Arcane Embers Layer', () => {
  it('initTileEmbers generates bounded array with randomized lifetimes', () => {
    const embers = initTileEmbers(40)
    expect(embers.length).toBe(40)
    for (const e of embers) {
      expect(e.maxLife).toBeGreaterThan(0)
      expect(e.size).toBeGreaterThan(0)
      expect(Number.isFinite(e.drift)).toBe(true)
    }
  })

  it('bails early in Deep Dive mode (mix > 0.8)', () => {
    const embers = initTileEmbers(10)
    const { ctx, canvasOps } = createMockContext({ mix: 0.85 })
    renderEmbers(ctx, embers)
    expect(canvasOps.save).not.toHaveBeenCalled()
  })

  it('bails early when tile intensity is near zero (<= 0.005)', () => {
    const embers = initTileEmbers(10)
    const { ctx, canvasOps } = createMockContext({
      mix: 0.0,
      tile: {
        rect: { left: 100, top: 100, width: 200, height: 200 } as any,
        targetRect: null,
        intensity: 0.002,
        targetIntensity: 0,
        tileId: null,
      },
    })
    renderEmbers(ctx, embers)
    expect(canvasOps.save).not.toHaveBeenCalled()
  })

  it('bails early when embers array is empty or rect is missing', () => {
    const { ctx, canvasOps } = createMockContext({ mix: 0.0 })
    renderEmbers(ctx, [])
    expect(canvasOps.save).not.toHaveBeenCalled()

    const embers = initTileEmbers(10)
    const { ctx: nullRectCtx, canvasOps: nullOps } = createMockContext({
      mix: 0.0,
      tile: { rect: null, targetRect: null, intensity: 1, targetIntensity: 1, tileId: null },
    })
    renderEmbers(nullRectCtx, embers)
    expect(nullOps.save).not.toHaveBeenCalled()
  })

  it('executes balanced c.save() / c.restore() calls', () => {
    const embers = initTileEmbers(20)
    const { ctx, canvasOps } = createMockContext({ mix: 0.0 })
    renderEmbers(ctx, embers)
    expect(canvasOps.getSaveCount()).toBe(1)
    expect(canvasOps.getRestoreCount()).toBe(1)
  })

  it('respawns expired embers along perimeter and applies upward drift', () => {
    const embers: EmberParticle[] = [
      {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        alpha: 0,
        life: 5.0, // expired
        maxLife: 2.0,
        drift: 0,
      },
    ]

    const rect = {
      left: 100,
      top: 100,
      right: 300,
      bottom: 300,
      width: 200,
      height: 200,
      x: 100,
      y: 100,
      toJSON: () => {},
    } as DOMRect

    const { ctx } = createMockContext({
      mix: 0.0,
      dt: 0.016,
      time: 1.0,
      tile: {
        rect,
        targetRect: null,
        intensity: 1.0,
        targetIntensity: 1.0,
        tileId: 'tile-1',
      },
    })

    renderEmbers(ctx, embers)

    // Should have respawned within the perimeter boundary and moved upward (vy < 0)
    expect(embers[0].vy).toBeLessThan(0)
    expect(embers[0].x).toBeGreaterThanOrEqual(100 - 20)
    expect(embers[0].x).toBeLessThanOrEqual(300 + 20)
    expect(embers[0].life).toBeCloseTo(0.016, 2)
  })
})
