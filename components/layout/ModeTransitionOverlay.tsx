"use client"

import * as React from "react"
import { useModeTransitionStore } from "@/store/useModeTransitionStore"
import { initCollapse, drawCollapse, type CollapseState } from "./core-collapse"

/**
 * Core Collapse overlay — a full-screen 2D canvas that plays the Quick-Pitch ⇄
 * Deep-Dive mode toggle transition. Mounts once globally (layout.tsx), sits
 * above PageCurtain (z-[10001]). The rAF loop only runs while a transition is
 * active; it tears down on completion so there is zero idle cost.
 */
export function ModeTransitionOverlay() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const rafRef = React.useRef<number | null>(null)
  const stateRef = React.useRef<CollapseState | null>(null)
  const phase = useModeTransitionStore((s) => s.phase)
  const direction = useModeTransitionStore((s) => s.direction)

  // Start/stop the effect keyed on entering the "covering" phase.
  React.useEffect(() => {
    if (phase !== "covering" || !direction) return
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
        // Hold the final frame briefly; the store drives reveal→idle, after
        // which the canvas is unmounted (phase === "idle" hides the element).
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
  }, [phase, direction])

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
        zIndex: 10001,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: visible ? undefined : "opacity 60ms linear",
      }}
    />
  )
}
