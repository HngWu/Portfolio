"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useNavigationStore } from "@/store/useNavigationStore"
import { useViewModeStore } from "@/store/useViewModeStore"
import { initEntry, drawEntry, type EntryState } from "./page-entry"

/**
 * Page Entry overlay — a full-screen 2D canvas that plays the mode-aware
 * Grid→Page transition as a seamless cover→peak→reveal choreography:
 *
 *   covering  → canvas sweeps outward from the origin until page A is occluded
 *   peak      → the route swap happens behind the held peak frame (invisible)
 *   revealing → canvas *unwinds back toward the origin*, opening page B
 *               exactly where the user clicked (replaces the old 60ms pop)
 *
 * Mounts once globally (layout.tsx), sits above page content at z-[10001]. The
 * rAF loop runs only while a transition is active; it tears down on completion
 * so there is zero idle cost.
 *
 * Picks the engine mode from useViewModeStore (gold = Golden Canvas Brush,
 * blue = Hextech Matrix Boot) and emanates from the captured origin tile rect
 * when present, otherwise viewport center.
 */
export function PageEntryOverlay() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const rafRef = React.useRef<number | null>(null)
  const stateRef = React.useRef<EntryState | null>(null)

  const curtainState = useNavigationStore((s) => s.curtainState)
  const setCurtainState = useNavigationStore((s) => s.setCurtainState)
  const isPageLoaded = useNavigationStore((s) => s.isPageLoaded)
  const setPageLoaded = useNavigationStore((s) => s.setPageLoaded)

  const isTransitionActive = curtainState !== "idle"
  const originRect = useNavigationStore((s) => s.originRect)
  const bentoTilesBounds = useNavigationStore((s) => s.bentoTilesBounds)
  const mode = useViewModeStore((s) => s.mode)
  const pathname = usePathname()

  // 1. Detect browser back/forward popstate to trigger curtain covering
  React.useEffect(() => {
    if (typeof window === "undefined") return

    const handlePopState = () => {
      setPageLoaded(false)
      setCurtainState("covering")
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [setCurtainState, setPageLoaded])

  // 2. Watch pathname changes during covering to mark the new page as loaded
  React.useEffect(() => {
    if (curtainState === "covering") {
      setPageLoaded(true)
    }
  }, [pathname, curtainState, setPageLoaded])

  // 3. Fallback timer: if new page content does not mount or swap, force reveal after 1.8s
  React.useEffect(() => {
    let timeoutId: number | null = null

    if (curtainState === "covering") {
      timeoutId = window.setTimeout(() => {
        setCurtainState("revealing")
      }, 1800)
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [curtainState, setCurtainState])

  // 4. covering → peak once the new page reports loaded. The canvas then holds
  //    its peak frame while we advance to revealing.
  React.useEffect(() => {
    if (curtainState === "covering" && isPageLoaded) {
      setCurtainState("peak")
    }
  }, [curtainState, isPageLoaded, setCurtainState])

  // 5. peak → revealing after a short hold so the route swap is invisible.
  const PEAK_HOLD_MS = 90
  React.useEffect(() => {
    if (curtainState !== "peak") return
    const t = window.setTimeout(() => setCurtainState("revealing"), PEAK_HOLD_MS)
    return () => window.clearTimeout(t)
  }, [curtainState, setCurtainState])

  // 6. Clean up transition parameters after revealing completes
  React.useEffect(() => {
    if (curtainState === "revealing") {
      const t = window.setTimeout(() => {
        setCurtainState("idle")
        useNavigationStore.getState().setOriginRect(null)
        useNavigationStore.getState().setOriginTileId(null)
        useNavigationStore.getState().setBentoTilesBounds(null)
        setPageLoaded(false)
      }, 650)
      return () => window.clearTimeout(t)
    }
  }, [curtainState, setCurtainState, setPageLoaded])

  // Track latest parameters in a ref so the effect only re-runs when transition
  // activity changes, not on every origin/rect update.
  const paramsRef = React.useRef({ mode, originRect, bentoTilesBounds })
  React.useEffect(() => {
    paramsRef.current = { mode, originRect, bentoTilesBounds }
  }, [mode, originRect, bentoTilesBounds])

  // Mirror the current curtain state into the engine ref each render so the
  // rAF loop can react to phase changes (cover→peak→reveal) without restarting.
  const phaseRef = React.useRef(curtainState)
  phaseRef.current = curtainState

  // Start the rAF loop when a transition becomes active; tear down on idle.
  React.useEffect(() => {
    if (!isTransitionActive) return
    // Respect reduced motion: the hook (usePageTransition) never sets curtain
    // state under reduced motion, but guard anyway for popstate entry points.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Size the canvas to viewport * backing-store for crispness.
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Initialize the engine once for the whole transition.
    if (!stateRef.current) {
      const { mode: m, originRect: o, bentoTilesBounds: b } = paramsRef.current
      stateRef.current = initEntry(m, w, h, o, b)
    }

    const loop = (now: number) => {
      const state = stateRef.current
      if (!state) return

      // Drive engine phase from the store. Reset the phase clock when the
      // engine's phase is stale relative to the store so the new phase's
      // animation starts from t=0.
      const storePhase = phaseRef.current
      const enginePhase =
        storePhase === "covering"
          ? "cover"
          : storePhase === "peak"
          ? "peak"
          : storePhase === "revealing"
          ? "reveal"
          : "cover"

      if (state.phase !== enginePhase) {
        state.phase = enginePhase
        state.phaseStartTime = null
        state.lastTime = null
      }

      const alive = drawEntry(ctx, state, now, w, h)
      if (alive || state.phase === "peak") {
        rafRef.current = requestAnimationFrame(loop)
      } else if (storePhase === "idle") {
        rafRef.current = null
      } else {
        // Phase finished animating but the store hasn't moved on yet (e.g.
        // cover done, waiting for page-load → peak). Hold the last frame so the
        // canvas stays opaque instead of clearing to transparent.
        rafRef.current = requestAnimationFrame(loop)
      }
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      // Drop engine state when the whole transition ends so the next one
      // re-seeds fresh.
      if (phaseRef.current === "idle") {
        stateRef.current = null
      }
    }
  }, [isTransitionActive])

  // Hard cleanup if the component ever unmounts mid-effect.
  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Visible whenever a transition is in flight; hidden (and not painted) idle.
  const visible = curtainState !== "idle"

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        // No fade on enter (the canvas paints page A away). A short fade on
        // exit lets the final reveal frame settle cleanly into page B.
        transition: visible ? undefined : "opacity 120ms ease-out",
      }}
    />
  )
}
