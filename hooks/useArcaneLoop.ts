'use client'

import { useEffect, useRef } from 'react'
import type React from 'react'
import {
  ArcaneConfig,
  ArcanePointer,
  ArcaneTrailPoint,
  HexCenter,
  LayerContext,
  lerpRGBA,
  parseColorToRGBA,
  RGB,
  RuntimePalette,
  TileTrackingState,
} from '@/components/background/types'
import { renderFog } from '@/components/background/layers/fog'
import { renderSigil } from '@/components/background/layers/sigil'
import { buildHexLattice, renderLattice } from '@/components/background/layers/lattice'
import { DataPulse, initDataPulses, renderPulses } from '@/components/background/layers/pulses'
import { renderCircuit } from '@/components/background/layers/circuit'
import { renderSpellCircle } from '@/components/background/layers/spellCircle'
import { EmberParticle, initTileEmbers, renderEmbers } from '@/components/background/layers/embers'
import { initRunes, renderRunes, RuneNode } from '@/components/background/layers/runes'
import { DustMote, initDustMotes, renderDust } from '@/components/background/layers/dust'
import { renderTrail } from '@/components/background/layers/trail'
import { renderScanline } from '@/components/background/layers/scan'
import { usePerformanceStore } from '@/store/usePerformanceStore'

/**
 * Calculates responsive star/dust count scaling down with smaller viewports.
 * Full count on desktop, scaled down on tablet, and compact on mobile.
 */
export function getResponsiveDustCount(width: number, baseCount = arcaneConfig.density.dustCount): number {
  if (width <= 480) {
    return Math.round(baseCount * 0.25) // ~28 stars on small mobile
  }
  if (width <= 768) {
    return Math.round(baseCount * 0.45) // ~50 stars on tablet / larger mobile
  }
  if (width <= 1024) {
    return Math.round(baseCount * 0.70) // ~77 stars on landscape tablet / small laptops
  }
  return baseCount // 110 stars on desktop
}

export const arcaneConfig: ArcaneConfig = {
  density: {
    dustCount: 110,
    runeCount: 36,
    maxPulses: 24,
    hexRadius: 44,
  },
  intensity: {
    lanternRadius: 180,
    lanternFalloff: 0.85,
    lightThemeAlphaMult: 0.5,
    trailFadeSpeed: 0.04,
    spellCircleRadiusPadding: 28,
  },
  speed: {
    sigilRotationSpeed: 0.0006,
    dustRiseSpeed: 24,
    pulseSpeed: 1.2,
    morphDurationMs: 700,
    cursorLerp: 0.14,
  },
  stretch: {
    enableRuneCascade: true,
    enableCrystalOverload: true,
  },
}

const DEFAULT_QUICK_PALETTE: RuntimePalette = {
  accent: { r: 201, g: 162, b: 39, a: 1 }, // #C9A227
  accentBright: { r: 255, g: 232, b: 117, a: 1 }, // #FFE875
  accentDeep: { r: 122, g: 94, b: 18, a: 1 }, // #7A5E12
  accentSoft: { r: 255, g: 180, b: 74, a: 1 }, // #FFB44A
  glowRgb: { r: 201, g: 162, b: 39 },
  secondaryAmethyst: { r: 142, g: 68, b: 173, a: 1 }, // #8E44AD
  secondary: { r: 142, g: 68, b: 173, a: 1 },
  lumePrimary: { r: 74, g: 255, b: 180, a: 1 }, // #4AFFB4
  lumeSecondary: { r: 74, g: 143, b: 255, a: 1 }, // #4A8FFF
  isLight: false,
}

const DEFAULT_DEEP_PALETTE: RuntimePalette = {
  accent: { r: 74, g: 143, b: 255, a: 1 }, // #4A8FFF
  accentBright: { r: 106, g: 255, b: 255, a: 1 }, // #6AFFFF
  accentDeep: { r: 12, g: 10, b: 26, a: 1 }, // #0C0A1A
  accentSoft: { r: 106, g: 13, b: 173, a: 1 }, // #6A0DAD
  glowRgb: { r: 74, g: 143, b: 255 },
  secondaryAmethyst: { r: 142, g: 68, b: 173, a: 1 },
  secondary: { r: 142, g: 68, b: 173, a: 1 },
  lumePrimary: { r: 74, g: 255, b: 180, a: 1 },
  lumeSecondary: { r: 74, g: 143, b: 255, a: 1 },
  isLight: false,
}

function lerpRGB(a: RGB, b: RGB, t: number): RGB {
  const safeT = Number.isFinite(t) ? Math.max(0, Math.min(1, t)) : 0
  return {
    r: Math.round(a.r + (b.r - a.r) * safeT),
    g: Math.round(a.g + (b.g - a.g) * safeT),
    b: Math.round(a.b + (b.b - a.b) * safeT),
  }
}

function lerpPalette(current: RuntimePalette, target: RuntimePalette, t: number): RuntimePalette {
  const secondaryAmethyst = lerpRGBA(current.secondaryAmethyst, target.secondaryAmethyst, t)
  return {
    accent: lerpRGBA(current.accent, target.accent, t),
    accentBright: lerpRGBA(current.accentBright, target.accentBright, t),
    accentDeep: lerpRGBA(current.accentDeep, target.accentDeep, t),
    accentSoft: lerpRGBA(current.accentSoft, target.accentSoft, t),
    glowRgb: lerpRGB(current.glowRgb, target.glowRgb, t),
    secondaryAmethyst,
    secondary: secondaryAmethyst,
    lumePrimary: lerpRGBA(current.lumePrimary, target.lumePrimary, t),
    lumeSecondary: lerpRGBA(current.lumeSecondary, target.lumeSecondary, t),
    isLight: target.isLight,
  }
}

function samplePalette(): { palette: RuntimePalette; isDeep: boolean; isLight: boolean } {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { palette: DEFAULT_QUICK_PALETTE, isDeep: false, isLight: false }
  }

  const root = document.documentElement
  const isDeep = root.getAttribute('data-mode') === 'deep'
  const isLight = root.classList.contains('light')
  const computed = window.getComputedStyle(root)

  const fallback = isDeep ? DEFAULT_DEEP_PALETTE : DEFAULT_QUICK_PALETTE

  const accentStr = computed.getPropertyValue('--mode-accent').trim()
  const accentBrightStr = computed.getPropertyValue('--mode-accent-bright').trim()
  const accentDeepStr = computed.getPropertyValue('--mode-accent-deep').trim()
  const accentSoftStr = computed.getPropertyValue('--mode-accent-soft').trim()
  const secondaryAmethystStr = computed.getPropertyValue('--mode-secondary-amethyst').trim()
  const lumePrimaryStr = computed.getPropertyValue('--lume-primary').trim()
  const lumeSecondaryStr = computed.getPropertyValue('--lume-secondary').trim()
  const glowRgbStr = computed.getPropertyValue('--mode-glow-rgb').trim()

  const glowParsed = parseColorToRGBA(glowRgbStr, { ...fallback.glowRgb, a: 1 })

  return {
    isDeep,
    isLight,
    palette: {
      accent: parseColorToRGBA(accentStr, fallback.accent),
      accentBright: parseColorToRGBA(accentBrightStr, fallback.accentBright),
      accentDeep: parseColorToRGBA(accentDeepStr, fallback.accentDeep),
      accentSoft: parseColorToRGBA(accentSoftStr, fallback.accentSoft),
      glowRgb: { r: glowParsed.r, g: glowParsed.g, b: glowParsed.b },
      secondaryAmethyst: parseColorToRGBA(secondaryAmethystStr, fallback.secondaryAmethyst),
      secondary: parseColorToRGBA(secondaryAmethystStr, fallback.secondaryAmethyst),
      lumePrimary: parseColorToRGBA(lumePrimaryStr, fallback.lumePrimary),
      lumeSecondary: parseColorToRGBA(lumeSecondaryStr, fallback.lumeSecondary),
      isLight,
    },
  }
}

function createDOMRect(x: number, y: number, width: number, height: number): DOMRect {
  if (typeof DOMRect !== 'undefined') {
    return new DOMRect(x, y, width, height)
  }
  return {
    x,
    y,
    width,
    height,
    top: y,
    bottom: y + height,
    left: x,
    right: x + width,
    toJSON: () => ({}),
  } as DOMRect
}

export function useArcaneLoop(canvasRef: React.RefObject<HTMLCanvasElement | null>): void {
  const timeRef = useRef<number>(0)
  const mixRef = useRef<number>(0)
  const targetMixRef = useRef<number>(0)
  const pointerRef = useRef<ArcanePointer>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    active: false,
    isCoarse: false,
  })
  const trailRef = useRef<ArcaneTrailPoint[]>([])
  const tileRef = useRef<TileTrackingState>({
    rect: null,
    targetRect: null,
    intensity: 0,
    targetIntensity: 0,
    tileId: null,
  })
  const paletteRef = useRef<RuntimePalette>(DEFAULT_QUICK_PALETTE)
  const targetPaletteRef = useRef<RuntimePalette>(DEFAULT_QUICK_PALETTE)
  const dustRef = useRef<DustMote[]>([])
  const runesRef = useRef<RuneNode[]>([])
  const pulsesRef = useRef<DataPulse[]>([])
  const embersRef = useRef<EmberParticle[]>([])
  const hexLatticePathRef = useRef<Path2D | null>(null)
  const hexCentersRef = useRef<HexCenter[]>([])
  const hoveredTileElRef = useRef<HTMLElement | null>(null)
  const reducedMotionRef = useRef<boolean>(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number | null = null
    let resizeTimer: ReturnType<typeof setTimeout> | null = null
    let isPaused = false
    let lastTime = performance.now()

    // 1. Initial palette and mode setup
    const updatePaletteAndMode = (initial = false) => {
      const { palette, isDeep, isLight } = samplePalette()
      targetPaletteRef.current = palette
      targetMixRef.current = isDeep ? 1.0 : 0.0

      if (canvasRef.current) {
        canvasRef.current.style.mixBlendMode = isLight ? 'multiply' : 'normal'
      }

      if (initial) {
        paletteRef.current = { ...palette }
        mixRef.current = targetMixRef.current
      }
    }

    updatePaletteAndMode(true)

    // 2. MutationObserver for [data-mode] and .light class on <html>
    const observer = new MutationObserver(() => {
      updatePaletteAndMode(false)
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mode', 'class'],
    })

    // 3. Media query bindings
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarseQuery = window.matchMedia('(pointer: coarse)')
    reducedMotionRef.current = motionQuery.matches
    pointerRef.current.isCoarse = coarseQuery.matches

    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches
    }
    const onCoarseChange = (e: MediaQueryListEvent) => {
      pointerRef.current.isCoarse = e.matches
    }
    motionQuery.addEventListener('change', onMotionChange)
    coarseQuery.addEventListener('change', onCoarseChange)

    // 4. Viewport sizing and lattice geometry
    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    const handleResize = () => {
      if (!canvasRef.current) return
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)

      canvasRef.current.width = Math.round(width * dpr)
      canvasRef.current.height = Math.round(height * dpr)
      canvasRef.current.style.width = `${width}px`
      canvasRef.current.style.height = `${height}px`

      const { path, centers } = buildHexLattice(width, height, arcaneConfig.density.hexRadius)
      hexLatticePathRef.current = path
      hexCentersRef.current = centers

      pulsesRef.current = initDataPulses(
        arcaneConfig.density.maxPulses,
        centers,
        arcaneConfig.density.hexRadius
      )

      // Adjust star / dust motes count responsive to screen size
      const targetDustCount = getResponsiveDustCount(width, arcaneConfig.density.dustCount)
      if (dustRef.current.length > targetDustCount) {
        dustRef.current = dustRef.current.slice(0, targetDustCount)
      } else if (dustRef.current.length < targetDustCount) {
        const additional = initDustMotes(targetDustCount - dustRef.current.length, width, height)
        dustRef.current = [...dustRef.current, ...additional]
      }
      // Re-bound any motes that are now outside the new viewport
      dustRef.current.forEach((mote) => {
        if (mote.x > width) mote.x = Math.random() * width
        if (mote.y > height) mote.y = Math.random() * height
      })
    }

    dustRef.current = []
    handleResize()

    // Initialize particles
    runesRef.current = initRunes(arcaneConfig.density.runeCount, width, height)
    embersRef.current = initTileEmbers(40)

    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        handleResize()
      }, 150)
    }
    window.addEventListener('resize', onResize)

    // 5. Delegated pointer events
    const onPointerMove = (e: PointerEvent) => {
      pointerRef.current.targetX = e.clientX
      pointerRef.current.targetY = e.clientY
      pointerRef.current.active = true

      const target = e.target as Element | null
      const tileEl = target?.closest?.('[data-bento-tile]') as HTMLElement | null
      hoveredTileElRef.current = tileEl
      if (tileEl) {
        tileRef.current.tileId = tileEl.getAttribute('data-bento-tile') || tileEl.id || null
      }
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    const onPointerLeave = () => {
      pointerRef.current.active = false
      hoveredTileElRef.current = null
    }
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('blur', onPointerLeave)

    // 6. Visibility change (pause/resume rAF)
    const onVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId)
          animationFrameId = null
        }
      } else {
        isPaused = false
        lastTime = performance.now()
        if (animationFrameId === null) {
          animationFrameId = requestAnimationFrame(render)
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    // 7. Render loop
    const render = (now: number) => {
      if (isPaused) return

      const enableFx = usePerformanceStore.getState().enableBackgroundFx
      if (!enableFx) {
        // Clear full canvas buffer accounting for device pixel ratio
        ctx.clearRect(0, 0, Math.round(width * dpr), Math.round(height * dpr))
        // Render static void backdrop matching current mode & palette
        ctx.save()
        ctx.scale(dpr, dpr)
        ctx.fillStyle = paletteRef.current.isLight
          ? 'rgba(250, 250, 252, 0.35)'
          : (mixRef.current > 0.5 ? '#06080e' : '#050409')
        ctx.fillRect(0, 0, width, height)
        ctx.restore()

        // Keep lastTime current so resuming doesn't produce a delta-time spike
        lastTime = now
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const rawDt = (now - lastTime) / 1000
      const safeDt = Math.max(0.001, Math.min(rawDt, 0.1))
      lastTime = now

      timeRef.current += safeDt

      // Mode morph easing (~700ms ease)
      const mixEase = 1 - Math.exp(-safeDt / 0.18)
      mixRef.current += (targetMixRef.current - mixRef.current) * mixEase
      if (Math.abs(targetMixRef.current - mixRef.current) < 0.0005) {
        mixRef.current = targetMixRef.current
      }

      // Palette lerp (only when transitioning)
      if (paletteRef.current !== targetPaletteRef.current) {
        if (mixRef.current === targetMixRef.current) {
          paletteRef.current = targetPaletteRef.current
        } else {
          paletteRef.current = lerpPalette(paletteRef.current, targetPaletteRef.current, mixEase)
        }
      }

      // Pointer smoothing
      const pointer = pointerRef.current
      if (pointer.active) {
        if (pointer.x === 0 && pointer.y === 0 && (pointer.targetX !== 0 || pointer.targetY !== 0)) {
          pointer.x = pointer.targetX
          pointer.y = pointer.targetY
        } else {
          const pFactor = 1 - Math.pow(Math.max(0, 1 - arcaneConfig.speed.cursorLerp), safeDt * 60)
          pointer.x += (pointer.targetX - pointer.x) * pFactor
          pointer.y += (pointer.targetY - pointer.y) * pFactor
        }
      }

      // Trail wisp update
      const trail = trailRef.current
      if (pointer.active && !pointer.isCoarse) {
        const lastPoint = trail[0]
        const distSq = lastPoint
          ? (pointer.x - lastPoint.x) ** 2 + (pointer.y - lastPoint.y) ** 2
          : 999
        if (distSq > 4) {
          trail.unshift({ x: pointer.x, y: pointer.y, alpha: 1.0 })
        }
      }

      const fadeSpeed = arcaneConfig.intensity.trailFadeSpeed * (safeDt * 60)
      for (let i = 0; i < trail.length; i++) {
        trail[i].alpha -= fadeSpeed
      }
      while (trail.length > 0 && trail[trail.length - 1].alpha <= 0.005) {
        trail.pop()
      }
      if (trail.length > 36) {
        trail.length = 36
      }

      // Tile rect & intensity easing
      const tile = tileRef.current
      const hoveredEl = hoveredTileElRef.current
      if (hoveredEl && hoveredEl.isConnected) {
        const currentRect = hoveredEl.getBoundingClientRect()
        tile.targetRect = currentRect
        tile.targetIntensity = 1.0
        tile.tileId = hoveredEl.getAttribute('data-bento-tile') || hoveredEl.id || null

        if (!tile.rect) {
          tile.rect = createDOMRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height)
        } else {
          const rectEase = 1 - Math.exp(-safeDt / 0.12)
          tile.rect = createDOMRect(
            tile.rect.x + (currentRect.x - tile.rect.x) * rectEase,
            tile.rect.y + (currentRect.y - tile.rect.y) * rectEase,
            tile.rect.width + (currentRect.width - tile.rect.width) * rectEase,
            tile.rect.height + (currentRect.height - tile.rect.height) * rectEase
          )
        }
      } else {
        tile.targetIntensity = 0.0
        tile.targetRect = null
      }

      const intensityEase = 1 - Math.exp(-safeDt / 0.15)
      tile.intensity += (tile.targetIntensity - tile.intensity) * intensityEase
      if (tile.intensity <= 0.005 && tile.targetIntensity === 0) {
        tile.intensity = 0
        tile.rect = null
        tile.tileId = null
      }

      // Compose LayerContext
      const layerCtx: LayerContext = {
        ctx,
        width,
        height,
        dpr,
        time: timeRef.current,
        dt: safeDt,
        mix: mixRef.current,
        palette: paletteRef.current,
        pointer: pointerRef.current,
        trail: trailRef.current,
        tile: tileRef.current,
        reducedMotion: reducedMotionRef.current,
        config: arcaneConfig,
        hexLatticePath: hexLatticePathRef.current,
        hexCenters: hexCentersRef.current,
      }

      // Execute 11 layers in specified order
      ctx.save()
      ctx.scale(dpr, dpr)

      renderFog(layerCtx)
      renderSigil(layerCtx)
      renderLattice(layerCtx)
      renderPulses(layerCtx, pulsesRef.current)
      renderCircuit(layerCtx)
      renderSpellCircle(layerCtx)
      renderEmbers(layerCtx, embersRef.current)
      renderRunes(layerCtx, runesRef.current)
      renderDust(layerCtx, dustRef.current)
      renderTrail(layerCtx)
      renderScanline(layerCtx)

      ctx.restore()

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    // Cleanup
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
      if (resizeTimer) {
        clearTimeout(resizeTimer)
      }
      observer.disconnect()
      motionQuery.removeEventListener('change', onMotionChange)
      coarseQuery.removeEventListener('change', onCoarseChange)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('blur', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [canvasRef])
}
