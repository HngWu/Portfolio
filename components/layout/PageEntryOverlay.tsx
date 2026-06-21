"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useNavigationStore } from "@/store/useNavigationStore"
import { useViewModeStore } from "@/store/useViewModeStore"
import { initEntry, drawEntry, type EntryState } from "./page-entry"

/**
 * Page Entry overlay — a full-screen 2D canvas that plays the mode-aware
 * Grid→Page transition. Mounts once globally (layout.tsx), sits above page
 * content at z-[10001]. The rAF loop only runs while a transition is active;
 * it tears down on completion so there is zero idle cost.
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

  // 2. Watch pathname changes during transition to mark the new page as loaded
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

  // 4. Swap covering -> revealing when page reports loaded
  React.useEffect(() => {
    if (curtainState === "covering" && isPageLoaded) {
      setCurtainState("revealing")
    }
  }, [curtainState, isPageLoaded, setCurtainState])

  // 5. Clean up transition parameters after revealing completes
  React.useEffect(() => {
    if (curtainState === "revealing") {
      const t = window.setTimeout(() => {
        setCurtainState("idle")
        useNavigationStore.getState().setOriginRect(null)
        useNavigationStore.getState().setOriginTileId(null)
        useNavigationStore.getState().setBentoTilesBounds(null)
        setPageLoaded(false)
      }, 500)
      return () => window.clearTimeout(t)
    }
  }, [curtainState, setCurtainState, setPageLoaded])

  // Track latest parameters in a ref so the effect only re-runs when transition activity changes
  const paramsRef = React.useRef({ mode, originRect, bentoTilesBounds })
  React.useEffect(() => {
    paramsRef.current = { mode, originRect, bentoTilesBounds }
  }, [mode, originRect, bentoTilesBounds])

  // Start the effect keyed on entering the transition active phase.
  React.useEffect(() => {
    if (!isTransitionActive) return
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

    const { mode: m, originRect: o, bentoTilesBounds: b } = paramsRef.current
    stateRef.current = initEntry(m, w, h, o, b)

    const loop = (now: number) => {
      if (!stateRef.current) return
      const alive = drawEntry(ctx, stateRef.current, now, w, h)
      if (alive) {
        rafRef.current = requestAnimationFrame(loop)
      } else {
        // Hold the final frame; the store drives revealing→idle, after which
        // the canvas is hidden (curtainState === "idle").
        rafRef.current = null
      }
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
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
        transition: visible ? undefined : "opacity 60ms linear",
      }}
    />
  )
}
