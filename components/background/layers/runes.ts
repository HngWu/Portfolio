import { LayerContext, rgbaToString } from '../types'

export interface RuneNode {
  x: number
  y: number
  vx: number
  vy: number
  elderChar: string
  hextechChar: string
  hexAddress: string
  scrambledChar: string
  baseAlpha: number
  ignite: number // 0 to 1
  scrambleTimer: number
  phase: number
}

// 24 Elder Futhark runes for Quick Pitch arcane aesthetic
export const ELDER_FUTHARK = [
  'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ',
  'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ',
  'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ',
] as const

// Geometric and blueprint hextech glyphs for Deep Dive mode
export const HEXTECH_GLYPHS = [
  '⬡', '◈', '◇', '⬢', '⌬', '⌖', '⎔', '✦', '✧', '⯎', '⬟', '⬠',
] as const

export const FONT_RUNE = '13px NotoSansRunic-Regular, "Segoe UI Historic", serif'
export const FONT_HEX = '10px monospace'

// Module-level state for Stretch Feature: Rune Cascade
let cascadeTimer = 14 + Math.random() * 6
let cascadeElapsed = -1
const CASCADE_DURATION = 1.8

/**
 * Resets cascade timer state (useful for tests and resets).
 */
export function resetCascadeState(timer = 16): void {
  cascadeTimer = timer
  cascadeElapsed = -1
}

/**
 * Triggers a Rune Cascade immediately (useful for testing).
 */
export function triggerCascadeForTesting(): void {
  cascadeElapsed = 0
}

/**
 * Initializes an array of rune nodes distributed across the viewport.
 * Assigns elder futhark characters, hextech glyphs, deterministic hex addresses,
 * upward drift velocities (-4 to -8 px/s), and randomized phases.
 */
export function initRunes(count: number, width: number, height: number): RuneNode[] {
  const safeCount = Math.min(200, Math.max(0, count))
  const safeW = Math.max(1, width)
  const safeH = Math.max(1, height)
  const runes: RuneNode[] = []

  for (let i = 0; i < safeCount; i++) {
    const elderChar = ELDER_FUTHARK[Math.floor(Math.random() * ELDER_FUTHARK.length)]
    const hextechChar = HEXTECH_GLYPHS[Math.floor(Math.random() * HEXTECH_GLYPHS.length)]
    // Deterministic 4-digit hex address: e.g. 0x4A8F
    const hexAddress = '0x' + ((0x4a8f + i * 0x1337) & 0xffff).toString(16).toUpperCase().padStart(4, '0')
    const vy = -4 - Math.random() * 4 // -4 to -8 px/s
    const vx = (Math.random() - 0.5) * 2 // slight horizontal drift

    runes.push({
      x: Math.random() * safeW,
      y: Math.random() * safeH,
      vx,
      vy,
      elderChar,
      hextechChar,
      hexAddress,
      scrambledChar: elderChar,
      baseAlpha: 0.2 + Math.random() * 0.1, // alpha ~0.25
      ignite: 0,
      scrambleTimer: Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2,
    })
  }

  return runes
}

/**
 * Updates simulation and renders the Runic Glyph Matrix layer.
 *
 * In Quick Pitch (mix <= 0.1): Displays Elder Futhark runes in dim brass at rest, flaring
 * to luminous gold leaf within the pointer lantern radius.
 * In Deep Dive (mix >= 0.9): Displays Hextech glyphs in electric cyan with subtle flicker;
 * hovering runes (ignite > 0.4) reveal deterministic memory addresses (e.g. 0x4A8F).
 * During mode morph (0.1 < mix < 0.9): Runes rapidly scramble glyphs every ~0.06s.
 * Stretch feature: Sequentially ignites a chain of runes across the viewport every 14-20s.
 */
export function renderRunes(ctx: LayerContext, runes: RuneNode[]): void {
  // Early bail
  if (runes.length === 0 || ctx.width <= 0 || ctx.height <= 0) {
    return
  }

  const { ctx: c, width, height, dt, time, mix, palette, pointer, reducedMotion, config } = ctx
  const safeDt = Number.isFinite(dt) && dt > 0 ? Math.min(dt, 0.1) : 0.016
  const safeTime = Number.isFinite(time) ? time : 0

  // 1. Update stretch: Rune Cascade in Quick Pitch (every 14-20 seconds, ~1.8 seconds duration)
  const isQuickPitch = mix <= 0.1
  const cascadeAllowed = !reducedMotion && (config.stretch?.enableRuneCascade ?? true) && isQuickPitch

  if (cascadeAllowed) {
    if (cascadeElapsed >= 0) {
      cascadeElapsed += safeDt
      if (cascadeElapsed > CASCADE_DURATION) {
        cascadeElapsed = -1
        cascadeTimer = 14 + Math.random() * 6
      }
    } else {
      cascadeTimer -= safeDt
      if (cascadeTimer <= 0) {
        cascadeElapsed = 0
      }
    }
  } else {
    cascadeElapsed = -1
  }

  const cascadeProgress = cascadeElapsed >= 0 ? cascadeElapsed / CASCADE_DURATION : -1

  // 2. Prepare pointer lantern parameters
  const lanternActive = !pointer.isCoarse && !reducedMotion && pointer.active
  const lanternRadius = config.intensity?.lanternRadius || 180
  const lanternRadiusSq = lanternRadius * lanternRadius

  // 3. Precompute colors to minimize heap allocations in hot loop
  const baseAccent = rgbaToString(palette.accent, 1)
  const baseAccentBright = rgbaToString(palette.accentBright, 1)

  c.save()
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.shadowColor = baseAccentBright

  let currentFont = ''
  let currentFill = ''
  let currentShadowBlur = -1

  for (let i = 0; i < runes.length; i++) {
    const rune = runes[i]

    // --- Update: Drift & Screen Edge Wrap ---
    if (!reducedMotion) {
      rune.x += rune.vx * safeDt
      rune.y += rune.vy * safeDt

      const margin = 20
      if (rune.y < -margin) {
        rune.y = height + margin
        rune.x = Math.random() * width
      } else if (rune.y > height + margin) {
        rune.y = -margin
        rune.x = Math.random() * width
      }

      if (rune.x < -margin) {
        rune.x = width + margin
      } else if (rune.x > width + margin) {
        rune.x = -margin
      }
    }

    // --- Update: Scramble logic during mode morph (0.1 < mix < 0.9) ---
    if (mix > 0.1 && mix < 0.9) {
      rune.scrambleTimer -= safeDt
      if (rune.scrambleTimer <= 0) {
        const glyphs = Math.random() < 0.5 ? ELDER_FUTHARK : HEXTECH_GLYPHS
        rune.scrambledChar = glyphs[Math.floor(Math.random() * glyphs.length)]
        rune.scrambleTimer = 0.06
      }
    }

    // --- Update: Lantern proximity check ---
    let targetIgnite = 0
    if (lanternActive) {
      const dx = rune.x - pointer.x
      const dy = rune.y - pointer.y
      const distSq = dx * dx + dy * dy
      if (distSq < lanternRadiusSq) {
        const dist = Math.sqrt(distSq)
        targetIgnite = Math.max(0, 1 - dist / lanternRadius)
      }
    }

    // --- Update: Stretch Rune Cascade wave ---
    if (cascadeProgress >= 0) {
      const normX = Math.max(0, Math.min(1, rune.x / width))
      const distToWave = Math.abs(normX - cascadeProgress)
      if (distToWave < 0.15) {
        const cascadeIgnite = Math.max(0, 1 - distToWave / 0.15)
        targetIgnite = Math.max(targetIgnite, cascadeIgnite)
      }
    }

    // Ease ignite (delta-time-weighted decay for refresh-rate invariant transitions)
    const igniteEase = 1 - Math.exp(-12 * safeDt)
    rune.ignite += (targetIgnite - rune.ignite) * igniteEase
    if (rune.ignite < 0.0005) {
      rune.ignite = 0
    } else if (rune.ignite > 0.999) {
      rune.ignite = 1
    }

    // Frustum culling
    if (rune.x < -30 || rune.x > width + 30 || rune.y < -30 || rune.y > height + 30) {
      continue
    }

    // --- Render: Determine active display text & font ---
    let displayText: string
    let targetFont: string

    if (mix > 0.1 && mix < 0.9) {
      displayText = rune.scrambledChar
      targetFont = FONT_RUNE
    } else if (mix <= 0.1) {
      displayText = rune.elderChar
      targetFont = FONT_RUNE
    } else {
      // mix >= 0.9 (Deep Dive)
      if (rune.ignite > 0.4) {
        displayText = rune.hexAddress
        targetFont = FONT_HEX
      } else {
        displayText = rune.hextechChar
        targetFont = FONT_RUNE
      }
    }

    // --- Render: Colors & Glow ---
    const qpAlpha = rune.baseAlpha + (0.9 - rune.baseAlpha) * rune.ignite
    const ddFlicker = reducedMotion ? 1.0 : 0.82 + 0.18 * Math.sin(safeTime * 8 + rune.phase * 4)
    const ddAlpha = (0.25 + 0.65 * rune.ignite) * ddFlicker

    let alpha = (1 - mix) * qpAlpha + mix * ddAlpha
    if (palette.isLight) {
      alpha *= config.intensity?.lightThemeAlphaMult ?? 0.5
    }
    alpha = Math.max(0, Math.min(1, alpha))

    if (alpha <= 0.005) {
      continue
    }

    let targetFill = baseAccentBright
    let targetShadowBlur = 0

    if (mix < 0.5) {
      if (rune.ignite <= 0.08) {
        targetFill = baseAccent
        targetShadowBlur = 0
      } else {
        targetFill = baseAccentBright
        targetShadowBlur = 8 * rune.ignite
      }
    } else {
      // Deep Dive (mix >= 0.5)
      targetFill = baseAccentBright
      targetShadowBlur = rune.ignite > 0.05 ? 8 * rune.ignite : 0
    }

    // Apply canvas state changes lazily
    if (currentFont !== targetFont) {
      c.font = targetFont
      currentFont = targetFont
    }

    if (currentFill !== targetFill) {
      c.fillStyle = targetFill
      currentFill = targetFill
    }

    if (currentShadowBlur !== targetShadowBlur) {
      c.shadowBlur = targetShadowBlur
      currentShadowBlur = targetShadowBlur
    }

    c.globalAlpha = alpha
    c.fillText(displayText, rune.x, rune.y)
  }

  c.restore()
}
