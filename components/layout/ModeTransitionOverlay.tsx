"use client"

import * as React from "react"
import { useModeTransitionStore } from "@/store/useModeTransitionStore"
import { initCollapse, drawCollapse, type CollapseState } from "./core-collapse"

/**
 * Core Collapse overlay — a full-screen 2D canvas that plays the Quick-Pitch ⇄
 * Deep-Dive mode toggle transition. Mounts once globally (layout.tsx), sits
 * above PageCurtain (z-[10002]).
 *
 * The rAF loop starts ONCE when a transition begins (phase leaves "idle") and
 * plays the full 1000ms core-collapse pass to completion, independent of the
 * store's intermediate phase changes (covering→peak→revealing). The store
 * drives visibility and mode-commit timing; this component only paints. The
 * loop tears down when the sequence returns to idle, so there is zero idle
 * cost.
 */
export function ModeTransitionOverlay() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const rafRef = React.useRef<number | null>(null)
  const stateRef = React.useRef<CollapseState | null>(null)

  const phase = useModeTransitionStore((s) => s.phase)
  const direction = useModeTransitionStore((s) => s.direction)

  // Mirror direction into a ref so the rAF effect (keyed on the stable boolean
  // below) reads the latest value without re-subscribing / re-initing on every
  // phase change.
  const directionRef = React.useRef(direction)
  directionRef.current = direction

  // Stable transition-active flag: false→true once per sequence, true→false on
  // idle. Intermediate phase changes (covering/peak/revealing) all read true,
  // so the rAF effect never re-runs or cancels mid-animation.
  const isTransitioning = phase !== "idle"

  React.useEffect(() => {
    if (!isTransitioning) return
    const direction = directionRef.current
    if (!direction) return

    // Respect reduced motion: the store's startTransition still commits the
    // mode, but we render no canvas.
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

    stateRef.current = initCollapse(direction, w, h)

    const loop = (now: number) => {
      if (!stateRef.current) return
      const alive = drawCollapse(ctx, stateRef.current, now, w, h)
      if (alive) {
        rafRef.current = requestAnimationFrame(loop)
      } else {
        // The pass has finished drawing. Hold the final frame until the store
        // settles to idle, at which point the canvas is hidden (phase === idle).
        rafRef.current = null
      }
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      stateRef.current = null
    }
  }, [isTransitioning])

  // Hard cleanup if the component ever unmounts mid-effect.
  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Visible whenever a transition is in flight; hidden (and not rendered into
  // the paint) once idle.
  const visible = phase !== "idle"

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10002,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: visible ? undefined : "opacity 120ms ease-out",
      }}
    />
  )
}
