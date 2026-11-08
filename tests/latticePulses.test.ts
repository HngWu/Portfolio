import { describe, it, expect, mock } from 'bun:test'
import { buildHexLattice, renderLattice } from '../components/background/layers/lattice'
import { initDataPulses, renderPulses, DataPulse } from '../components/background/layers/pulses'
import { LayerContext, DEFAULT_CONFIG } from '../components/background/types'

function createMockContext(overrides: Partial<LayerContext> = {}): { ctx: LayerContext; calls: string[]; canvasOps: any } {
  const calls: string[] = []
  const canvasOps: any = {
    save: mock(() => calls.push('save')),
    restore: mock(() => calls.push('restore')),
    beginPath: mock(() => calls.push('beginPath')),
    closePath: mock(() => calls.push('closePath')),
    moveTo: mock((x: number, y: number) => calls.push(`moveTo(${x.toFixed(1)},${y.toFixed(1)})`)),
    lineTo: mock((x: number, y: number) => calls.push(`lineTo(${x.toFixed(1)},${y.toFixed(1)})`)),
    arc: mock((x: number, y: number, r: number) => calls.push(`arc(${x.toFixed(1)},${y.toFixed(1)},${r})`)),
    stroke: mock(() => calls.push('stroke')),
    fill: mock(() => calls.push('fill')),
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    shadowColor: '',
    shadowBlur: 0,
  }

  const baseCtx: LayerContext = {
    ctx: canvasOps as any,
    width: 800,
    height: 600,
    dpr: 1,
    time: 1.0,
    dt: 0.016,
    mix: 1.0,
    palette: {
      accent: { r: 0, g: 255, b: 240, a: 1 },
      accentBright: { r: 50, g: 255, b: 240, a: 1 },
      accentDeep: { r: 0, g: 100, b: 120, a: 1 },
      accentSoft: { r: 0, g: 200, b: 200, a: 1 },
      glowRgb: { r: 0, g: 255, b: 240 },
      secondaryAmethyst: { r: 180, g: 50, b: 240, a: 1 },
      lumePrimary: { r: 0, g: 255, b: 200, a: 1 },
      lumeSecondary: { r: 100, g: 200, b: 255, a: 1 },
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
    config: DEFAULT_CONFIG,
    hexLatticePath: (typeof Path2D !== 'undefined' ? new Path2D() : {}) as Path2D,
    hexCenters: [],
    ...overrides,
  }

  return { ctx: baseCtx, calls, canvasOps }
}

describe('lattice.ts: Hex Blueprint Lattice', () => {
  it('buildHexLattice generates deterministic centers and crystals', () => {
    const { centers } = buildHexLattice(600, 400, 36)
    expect(centers.length).toBeGreaterThan(0)

    const crystals = centers.filter((c) => c.isCrystal)
    expect(crystals.length).toBeGreaterThan(0)
    // Approximately 5% crystals
    const ratio = crystals.length / centers.length
    expect(ratio).toBeGreaterThan(0.01)
    expect(ratio).toBeLessThan(0.12)
  })

  it('buildHexLattice handles edge cases gracefully (0x0 dimension)', () => {
    const res = buildHexLattice(0, 0, 36)
    expect(res.centers.length).toBe(0)
  })

  it('renderLattice bails early in Quick Pitch mode (mix < 0.01)', () => {
    const { ctx, calls } = createMockContext({ mix: 0.0 })
    renderLattice(ctx)
    expect(calls.length).toBe(0)
  })

  it('renderLattice executes with proper save/restore pairing and hoists styles', () => {
    const { centers, path } = buildHexLattice(400, 300, 36)
    const { ctx, calls, canvasOps } = createMockContext({
      hexCenters: centers,
      hexLatticePath: path,
      mix: 1.0,
    })

    renderLattice(ctx)

    // Verify balance of save and restore calls
    const saves = calls.filter((c) => c === 'save').length
    const restores = calls.filter((c) => c === 'restore').length
    expect(saves).toBeGreaterThan(0)
    expect(saves).toBe(restores)

    // Base lattice, cursor glow, and crystals should have run
    expect(calls.some((c) => c === 'stroke')).toBe(true)
    expect(calls.some((c) => c === 'fill')).toBe(true)
  })
})

describe('pulses.ts: Data Pulses Layer', () => {
  it('initDataPulses initializes bounded pulse array on hex lattice edges', () => {
    const { centers } = buildHexLattice(600, 400, 36)
    const pulses = initDataPulses(16, centers, 36)
    expect(pulses.length).toBeGreaterThanOrEqual(4)
    expect(pulses.length).toBeLessThanOrEqual(16)

    for (const p of pulses) {
      expect(Number.isFinite(p.x)).toBe(true)
      expect(Number.isFinite(p.y)).toBe(true)
      expect(p.trail.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('renderPulses bails early in Quick Pitch or reduced motion', () => {
    const { centers } = buildHexLattice(400, 300, 36)
    const pulses = initDataPulses(8, centers, 36)

    // Quick pitch
    const mock1 = createMockContext({ mix: 0.02, hexCenters: centers })
    renderPulses(mock1.ctx, pulses)
    expect(mock1.calls.length).toBe(0)

    // Reduced motion
    const mock2 = createMockContext({ mix: 1.0, reducedMotion: true, hexCenters: centers })
    renderPulses(mock2.ctx, pulses)
    expect(mock2.calls.length).toBe(0)
  })

  it('renderPulses executes batched rendering with exactly 1 outer save/restore', () => {
    const { centers } = buildHexLattice(400, 300, 36)
    const pulses = initDataPulses(10, centers, 36)
    const { ctx, calls } = createMockContext({
      hexCenters: centers,
      mix: 1.0,
      dt: 0.016,
    })

    renderPulses(ctx, pulses)

    const saves = calls.filter((c) => c === 'save').length
    const restores = calls.filter((c) => c === 'restore').length
    expect(saves).toBe(1)
    expect(restores).toBe(1)

    // At most 5 stroke calls (one per trail tier) and 1 fill call (batched heads)
    const strokeCalls = calls.filter((c) => c === 'stroke').length
    const fillCalls = calls.filter((c) => c === 'fill').length
    expect(strokeCalls).toBeLessThanOrEqual(5)
    expect(fillCalls).toBe(1)
  })

  it('renderPulses connects trail segments continuously across historical steps', () => {
    const pulse: DataPulse = {
      x: 35,
      y: 35,
      startX: 30,
      startY: 30,
      targetX: 40,
      targetY: 40,
      col: 0,
      row: 0,
      vertexIdx: 1,
      progress: 0.5,
      speed: 1.0,
      trail: [
        { x: 10, y: 10 }, // 2 steps ago (length - 2)
        { x: 20, y: 20 }, // 1 step ago (length - 1)
      ],
      branchCooldown: 1.0,
    }

    const { ctx, calls } = createMockContext({
      hexCenters: [{ x: 0, y: 0, col: 0, row: 0, isCrystal: false }],
      mix: 1.0,
      dt: 0.001, // small dt so progress doesn't trigger full step
    })

    renderPulses(ctx, [pulse])

    // Segment 0: (35, 35) -> (30, 30) (head to start)
    expect(calls.some((c) => c.includes('moveTo(35.0,35.0)'))).toBe(true)
    expect(calls.some((c) => c.includes('lineTo(30.0,30.0)'))).toBe(true)

    // Segment 1: (30, 30) -> (20, 20) (start to trail[1])
    expect(calls.some((c) => c.includes('moveTo(30.0,30.0)'))).toBe(true)
    expect(calls.some((c) => c.includes('lineTo(20.0,20.0)'))).toBe(true)

    // Segment 2: (20, 20) -> (10, 10) (trail[1] to trail[0])
    expect(calls.some((c) => c.includes('moveTo(20.0,20.0)'))).toBe(true)
    expect(calls.some((c) => c.includes('lineTo(10.0,10.0)'))).toBe(true)
  })
})
