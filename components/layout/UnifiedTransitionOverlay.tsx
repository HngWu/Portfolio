"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { isPathMatch, useNavigationStore } from "@/store/useNavigationStore"
import { useViewModeStore } from "@/store/useViewModeStore"
import { usePageTransitionsStore } from "@/store/usePageTransitionsStore"
import type { TransitionPreset, CurtainState } from "@/types/transitions"

import { singularityRenderer } from "./transitions/renderSingularity"
import { arcaneRenderer } from "./transitions/renderArcane"
import { blueprintRenderer } from "./transitions/renderBlueprint"
import { matrixRenderer } from "./transitions/renderMatrix"
import { cleanLiftRenderer } from "./transitions/renderCleanLift"
import { resolveOrigin, clamp01, type PresetRenderer } from "./transitions/types"

/**
 * Maps the active transition preset to its dedicated high-performance canvas renderer.
 */
function getPresetRenderer(preset: TransitionPreset | null): PresetRenderer<unknown> {
  switch (preset) {
    case "singularity-bloom":
      return singularityRenderer as unknown as PresetRenderer<unknown>
    case "arcane-rune":
      return arcaneRenderer as unknown as PresetRenderer<unknown>
    case "blueprint-draft":
    case "blueprint-slide":
      return blueprintRenderer as unknown as PresetRenderer<unknown>
    case "matrix-pulse":
      return matrixRenderer as unknown as PresetRenderer<unknown>
    case "clean-lift":
      return cleanLiftRenderer as unknown as PresetRenderer<unknown>
    default:
      return singularityRenderer as unknown as PresetRenderer<unknown>
  }
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
  mq.addEventListener("change", callback)
  return () => mq.removeEventListener("change", callback)
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function getReducedMotionServerSnapshot() {
  return false
}

/**
 * UnifiedTransitionOverlay
 *
 * Universal 60FPS canvas transition overlay orchestrating seamless route transitions
 * between application views across five deterministic lifecycle phases:
 *   covering   → Canvas sweep expands outward from origin until page A is fully occluded
 *   holding    → Screen held occluded with active breathing animation while Next.js loads page B
 *   peak       → Route swap apex held for 50ms once isPageLoaded === true
 *   revealing  → Canvas unwinds / unmasks, revealing page B
 *   idle       → Zero render and zero rAF cost; store parameters reset
 */
export function UnifiedTransitionOverlay() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const rafRef = React.useRef<number | null>(null)
  const initialPathRef = React.useRef<string | null>(null)

  // 1. Navigation Store connections
  const curtainState = useNavigationStore((s) => s.curtainState)
  const setCurtainState = useNavigationStore((s) => s.setCurtainState)
  const isPageLoaded = useNavigationStore((s) => s.isPageLoaded)
  const setPageLoaded = useNavigationStore((s) => s.setPageLoaded)
  const targetPath = useNavigationStore((s) => s.targetPath)
  const setTargetPath = useNavigationStore((s) => s.setTargetPath)
  const activePreset = useNavigationStore((s) => s.activePreset)
  const setActivePreset = useNavigationStore((s) => s.setActivePreset)
  const originRect = useNavigationStore((s) => s.originRect)
  const setOriginRect = useNavigationStore((s) => s.setOriginRect)

  // Mirror isPageLoaded to a ref for synchronous zero-latency consumption in the 60FPS renderLoop
  const isPageLoadedRef = React.useRef(isPageLoaded)
  React.useEffect(() => {
    isPageLoadedRef.current = isPageLoaded
  }, [isPageLoaded])

  // 2. View Mode & Pathname connections
  const mode = useViewModeStore((s) => s.mode)
  const pathname = usePathname()

  // Track initial path to reliably detect route changes when targetPath is not explicitly set
  React.useEffect(() => {
    if (curtainState === "covering") {
      if (initialPathRef.current === null) {
        initialPathRef.current = pathname
      }
    } else if (curtainState === "idle") {
      initialPathRef.current = null
    }
  }, [curtainState, pathname])

  // 3. Baseline auto-detection via usePathname():
  // when pathname matches targetPath, waits 2 rAF frames and calls setPageLoaded(true) if not already set.
  React.useEffect(() => {
    if (curtainState !== "covering" && curtainState !== "holding") return

    const isMatch = targetPath
      ? isPathMatch(targetPath, pathname)
      : initialPathRef.current !== null && pathname !== initialPathRef.current

    if (isMatch) {
      let handle1: number | null = null
      let handle2: number | null = null

      handle1 = requestAnimationFrame(() => {
        handle2 = requestAnimationFrame(() => {
          if (!useNavigationStore.getState().isPageLoaded) {
            setPageLoaded(true)
          }
        })
      })

      return () => {
        if (handle1 !== null) cancelAnimationFrame(handle1)
        if (handle2 !== null) cancelAnimationFrame(handle2)
      }
    }
  }, [pathname, targetPath, curtainState, setPageLoaded])

  // 4. Safety Watchdog: 4000ms timer while in covering or holding to force setPageLoaded(true)
  // and transition to revealing so UI never freezes.
  const isCoveringOrHolding = curtainState === "covering" || curtainState === "holding"
  React.useEffect(() => {
    let timeoutId: number | null = null

    if (isCoveringOrHolding) {
      timeoutId = window.setTimeout(() => {
        setPageLoaded(true)
        setCurtainState("revealing")
      }, 4000)
    }

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [isCoveringOrHolding, setPageLoaded, setCurtainState])

  // 5. Reduced motion accessibility check using useSyncExternalStore
  const prefersReduced = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )

  // If reduced motion is active while curtain is not idle, immediately clean up store
  React.useEffect(() => {
    if (prefersReduced && curtainState !== "idle") {
      setCurtainState("idle")
      setActivePreset(null)
      setPageLoaded(false)
      setTargetPath(null)
      setOriginRect(null)
    }
  }, [
    prefersReduced,
    curtainState,
    setCurtainState,
    setActivePreset,
    setPageLoaded,
    setTargetPath,
    setOriginRect,
  ])

  // Transition is active only when not idle and reduced motion is disabled
  const isTransitionActive = curtainState !== "idle" && !prefersReduced

  // 6. Popstate Event Listener: handle browser Back/Forward navigation during active transition
  React.useEffect(() => {
    if (!isTransitionActive) return
    const handlePopState = () => {
      setPageLoaded(true)
      setCurtainState("revealing")
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [isTransitionActive, setPageLoaded, setCurtainState])

  // 7. 60FPS Canvas Animation Loop & Deterministic 5-Phase State Machine
  React.useEffect(() => {
    if (!isTransitionActive) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const handleResize = () => {
      const newDpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * newDpr)
      canvas.height = Math.floor(h * newDpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(newDpr, 0, 0, newDpr, 0, 0)
    }
    window.addEventListener("resize", handleResize)

    const renderer = getPresetRenderer(activePreset)
    const origin = resolveOrigin(originRect, w, h)
    const state = renderer.initState(mode, w, h, origin)

    let isDisposed = false
    const safeDispose = () => {
      if (!isDisposed && renderer.dispose) {
        isDisposed = true
        renderer.dispose(state)
      }
    }

    let currentPhase: CurtainState = useNavigationStore.getState().curtainState
    let phaseStartTime: number | null = null
    let lastTime: number | null = null
    let holdingStartTime: number | null = null
    let peakHoldStarted: number | null = null

    const renderLoop = (now: number) => {
      const dt = lastTime !== null && lastTime > 0 ? clamp01((now - lastTime) / 1000) : 0.016
      lastTime = now

      const storeState = useNavigationStore.getState().curtainState
      if (storeState === "idle") {
        return
      }

      // External sync: if store jumped to revealing (e.g. from watchdog or external call)
      if (storeState === "revealing" && currentPhase !== "revealing") {
        currentPhase = "revealing"
        phaseStartTime = now
      }

      // Rapid Click / Interrupted Transition Resynchronization:
      // if store re-entered covering from another phase, resynchronize clocks and state
      if (storeState === "covering" && currentPhase !== "covering") {
        currentPhase = "covering"
        phaseStartTime = now
        holdingStartTime = null
        peakHoldStarted = null
      }

      if (phaseStartTime === null) {
        phaseStartTime = now
      }

      const isDeep = mode === "deep"
      const currentModeValue = isDeep ? "deep" : "quick"
      const defaultDuration = isDeep ? 220 : 260

      // Preset Configured Duration Integration:
      // Query usePageTransitionsStore so custom durations configured in admin are respected
      const currentRoute = targetPath || pathname
      const configuredDuration = usePageTransitionsStore
        .getState()
        .resolveTransition(currentRoute, mode)?.durationMs
      const coverDuration =
        typeof configuredDuration === "number" && configuredDuration > 0
          ? configuredDuration
          : defaultDuration
      const revealDuration = coverDuration

      if (currentPhase === "covering") {
        const elapsed = now - phaseStartTime
        const p = clamp01(elapsed / coverDuration)
        renderer.drawCover(ctx, state, p, w, h, currentModeValue, dt)

        if (elapsed >= coverDuration) {
          if (isPageLoadedRef.current || useNavigationStore.getState().isPageLoaded) {
            currentPhase = "peak"
            phaseStartTime = now
            peakHoldStarted = now
            setCurtainState("peak")
          } else {
            currentPhase = "holding"
            phaseStartTime = now
            holdingStartTime = now
            setCurtainState("holding")
          }
        }
      } else if (currentPhase === "holding") {
        if (holdingStartTime === null) {
          holdingStartTime = now
        }
        const elapsed = now - holdingStartTime
        renderer.drawHolding(ctx, state, elapsed, w, h, currentModeValue, dt)

        if (isPageLoadedRef.current || useNavigationStore.getState().isPageLoaded) {
          currentPhase = "peak"
          phaseStartTime = now
          peakHoldStarted = now
          setCurtainState("peak")
        }
      } else if (currentPhase === "peak") {
        if (peakHoldStarted === null) {
          peakHoldStarted = now
        }
        const elapsed = holdingStartTime !== null ? now - holdingStartTime : now - phaseStartTime
        renderer.drawHolding(ctx, state, elapsed, w, h, currentModeValue, dt)

        if (now - peakHoldStarted >= 50) {
          currentPhase = "revealing"
          phaseStartTime = now
          setCurtainState("revealing")
        }
      } else if (currentPhase === "revealing") {
        const elapsed = now - phaseStartTime
        const p = clamp01(elapsed / revealDuration)
        renderer.drawReveal(ctx, state, p, w, h, currentModeValue, dt)

        if (elapsed >= revealDuration) {
          currentPhase = "idle"
          setCurtainState("idle")
          setActivePreset(null)
          setPageLoaded(false)
          setTargetPath(null)
          setOriginRect(null)
          safeDispose()
          return
        }
      }

      rafRef.current = requestAnimationFrame(renderLoop)
    }

    rafRef.current = requestAnimationFrame(renderLoop)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      safeDispose()
    }
  }, [
    isTransitionActive,
    activePreset,
    originRect,
    mode,
    targetPath,
    pathname,
    setCurtainState,
    setActivePreset,
    setPageLoaded,
    setTargetPath,
    setOriginRect,
  ])

  // Accessibility check: if prefers-reduced-motion matches, returns null.
  // Visible only when curtainState !== "idle".
  if (prefersReduced || curtainState === "idle") {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10003,
        pointerEvents: "none",
      }}
    />
  )
}
