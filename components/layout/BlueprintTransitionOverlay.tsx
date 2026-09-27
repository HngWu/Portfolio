"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useNavigationStore } from "@/store/useNavigationStore"
import { useViewModeStore } from "@/store/useViewModeStore"

/**
 * BlueprintTransitionOverlay
 * 
 * Cinematic CAD Blueprint Schematic Drafter transition engine between Home and Projects.
 * Orchestrates a precision technical blueprint grid sweep with drafting lines,
 * millimeter coordinate rules, telemetry readout, and high-speed laser scanline.
 * 
 * Phases:
 *   covering   → Blueprint grid expands, laser sweeps left-to-right until page A is occluded
 *   holding    → Screen held fully occluded while Next.js routes to page B
 *   peak       → Transition apex reached
 *   revealing  → Laser scanline and drafting lines sweep out, revealing page B
 *   idle       → Zero render cost
 */
export function BlueprintTransitionOverlay() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const rafRef = React.useRef<number | null>(null)
  const startTimeRef = React.useRef<number | null>(null)

  const curtainState = useNavigationStore((s) => s.curtainState)
  const setCurtainState = useNavigationStore((s) => s.setCurtainState)
  const isPageLoaded = useNavigationStore((s) => s.isPageLoaded)
  const setPageLoaded = useNavigationStore((s) => s.setPageLoaded)
  const activePreset = useNavigationStore((s) => s.activePreset)
  const setActivePreset = useNavigationStore((s) => s.setActivePreset)

  const mode = useViewModeStore((s) => s.mode)
  const pathname = usePathname()

  // Only active when preset is blueprint-draft or blueprint-slide
  const isBlueprintActive =
    curtainState !== "idle" &&
    (activePreset === "blueprint-draft" || activePreset === "blueprint-slide")

  // Synchronize route change detection
  React.useEffect(() => {
    let handle1: number | null = null
    let handle2: number | null = null

    if (curtainState === "covering" || curtainState === "holding") {
      handle1 = requestAnimationFrame(() => {
        handle2 = requestAnimationFrame(() => {
          setPageLoaded(true)
        })
      })
    }

    return () => {
      if (handle1 !== null) cancelAnimationFrame(handle1)
      if (handle2 !== null) cancelAnimationFrame(handle2)
    }
  }, [pathname, curtainState, setPageLoaded])

  // Move from covering / holding to peak once page is ready
  React.useEffect(() => {
    if ((curtainState === "covering" || curtainState === "holding") && isPageLoaded) {
      setCurtainState("peak")
    }
  }, [curtainState, isPageLoaded, setCurtainState])

  // Apex hold before reveal (60ms)
  React.useEffect(() => {
    if (curtainState !== "peak") return
    const timer = window.setTimeout(() => {
      setCurtainState("revealing")
    }, 60)
    return () => window.clearTimeout(timer)
  }, [curtainState, setCurtainState])

  // Reveal completion cleanup
  React.useEffect(() => {
    if (curtainState === "revealing") {
      const timer = window.setTimeout(() => {
        setCurtainState("idle")
        setActivePreset(null)
        setPageLoaded(false)
      }, 280)
      return () => window.clearTimeout(timer)
    }
  }, [curtainState, setCurtainState, setActivePreset, setPageLoaded])

  // Fallback watchdog safety timer (3500ms max)
  React.useEffect(() => {
    if (curtainState === "covering" || curtainState === "holding") {
      const timeout = window.setTimeout(() => {
        setPageLoaded(true)
        setCurtainState("revealing")
      }, 3500)
      return () => window.clearTimeout(timeout)
    }
  }, [curtainState, setCurtainState, setPageLoaded])

  // 60FPS High-Performance Canvas Rendering
  React.useEffect(() => {
    if (!isBlueprintActive) return

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    startTimeRef.current = performance.now()

    const renderLoop = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now
      const elapsed = now - startTimeRef.current
      ctx.clearRect(0, 0, w, h)

      const isDeep = mode === "deep"
      const currentState = useNavigationStore.getState().curtainState

      // Calculate phase progress (0..1)
      let progress = 0
      if (currentState === "covering") {
        progress = Math.min(1, elapsed / (isDeep ? 220 : 260))
      } else if (currentState === "holding" || currentState === "peak") {
        progress = 1
      } else if (currentState === "revealing") {
        progress = Math.max(0, 1 - (elapsed - 280) / 240)
      }

      // Background blueprint wash
      const bgOpacity = currentState === "revealing" 
        ? Math.max(0, progress * 0.98) 
        : Math.min(0.98, progress * 1.1)

      const bgColor = isDeep ? "rgba(4, 10, 20, " : "rgba(6, 12, 24, "
      ctx.fillStyle = `${bgColor}${bgOpacity})`
      ctx.fillRect(0, 0, w, h)

      if (progress > 0.05) {
        // CAD Grid parameters
        const gridSize = isDeep ? 32 : 40
        const gridAlpha = Math.min(0.35, progress * 0.4)

        ctx.save()
        ctx.strokeStyle = isDeep 
          ? `rgba(74, 143, 255, ${gridAlpha})` 
          : `rgba(106, 255, 255, ${gridAlpha * 0.8})`
        ctx.lineWidth = 0.75

        // Vertical Grid Lines
        ctx.beginPath()
        for (let x = 0; x <= w; x += gridSize) {
          ctx.moveTo(x, 0)
          ctx.lineTo(x, h)
        }
        // Horizontal Grid Lines
        for (let y = 0; y <= h; y += gridSize) {
          ctx.moveTo(0, y)
          ctx.lineTo(w, y)
        }
        ctx.stroke()

        // Coordinate Ruler Tick Marks (Top & Left edge)
        ctx.strokeStyle = isDeep 
          ? `rgba(106, 255, 255, ${gridAlpha * 1.5})` 
          : `rgba(255, 232, 117, ${gridAlpha * 1.2})`
        ctx.lineWidth = 1

        ctx.beginPath()
        for (let x = 0; x <= w; x += 16) {
          const tickH = x % 64 === 0 ? 8 : 4
          ctx.moveTo(x, 0)
          ctx.lineTo(x, tickH)
        }
        for (let y = 0; y <= h; y += 16) {
          const tickW = y % 64 === 0 ? 8 : 4
          ctx.moveTo(0, y)
          ctx.lineTo(tickW, y)
        }
        ctx.stroke()

        // Telemetry Readout Text
        ctx.font = "10px monospace"
        ctx.fillStyle = isDeep ? `rgba(106, 255, 255, ${progress})` : `rgba(255, 232, 117, ${progress})`
        ctx.fillText("SEC-04 // CAD_SCHEMATIC_LOAD", 24, 28)
        ctx.fillText(`MODE: ${isDeep ? "DEEP_DIVE" : "QUICK_PITCH"} // 60FPS`, 24, 42)
        ctx.fillText(`COORDINATES [X:${Math.round(w)} Y:${Math.round(h)}]`, w - 240, 28)

        // Center Crosshair Reticle
        const cx = w / 2
        const cy = h / 2
        const reticleR = 30 * progress
        ctx.beginPath()
        ctx.arc(cx, cy, reticleR, 0, Math.PI * 2)
        ctx.moveTo(cx - reticleR - 10, cy)
        ctx.lineTo(cx + reticleR + 10, cy)
        ctx.moveTo(cx, cy - reticleR - 10)
        ctx.lineTo(cx, cy + reticleR + 10)
        ctx.stroke()

        // High-Speed Laser Scanline Wipe (Horizontal sweep across screen)
        const laserX = currentState === "revealing"
          ? (1 - progress) * w
          : progress * w

        // Glowing Laser Beam
        const laserGrad = ctx.createLinearGradient(laserX - 60, 0, laserX + 20, 0)
        laserGrad.addColorStop(0, "rgba(74, 143, 255, 0)")
        laserGrad.addColorStop(0.7, isDeep ? "rgba(106, 255, 255, 0.45)" : "rgba(255, 232, 117, 0.4)")
        laserGrad.addColorStop(1, isDeep ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.95)")

        ctx.fillStyle = laserGrad
        ctx.fillRect(laserX - 60, 0, 70, h)

        // High-voltage bright leading line
        ctx.strokeStyle = "#FFFFFF"
        ctx.lineWidth = 2
        ctx.shadowColor = isDeep ? "#6AFFFF" : "#FFE875"
        ctx.shadowBlur = 15
        ctx.beginPath()
        ctx.moveTo(laserX + 10, 0)
        ctx.lineTo(laserX + 10, h)
        ctx.stroke()
        ctx.restore()
      }

      if (currentState !== "idle") {
        rafRef.current = requestAnimationFrame(renderLoop)
      } else {
        rafRef.current = null
      }
    }

    rafRef.current = requestAnimationFrame(renderLoop)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [isBlueprintActive, mode])

  if (!isBlueprintActive) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10003,
        pointerEvents: "none",
        transition: "opacity 100ms ease-out",
      }}
    />
  )
}
