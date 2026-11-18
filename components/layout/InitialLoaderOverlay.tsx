"use client"

import React, { useEffect, useState, useRef, useMemo } from "react"
import { useSiteLoaderStore } from "@/store/useSiteLoaderStore"
import { useViewModeStore } from "@/store/useViewModeStore"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  initGyroscope,
  drawGyroscope,
  triggerImplosion,
  type GyroscopeState,
  type GyroPalette,
} from "./gyroscope-engine"

export function InitialLoaderOverlay() {
  const pathname = usePathname()
  const progress = useSiteLoaderStore((s) => s.progress)
  const isLoaded = useSiteLoaderStore((s) => s.isLoaded)
  const setProgress = useSiteLoaderStore((s) => s.setProgress)
  const isModelReady = useSiteLoaderStore((s) => s.isModelReady)
  const setBootFinished = useSiteLoaderStore((s) => s.setBootFinished)
  const markModelReady = useSiteLoaderStore((s) => s.markModelReady)
  const forceComplete = useSiteLoaderStore((s) => s.forceComplete)

  const mode = useViewModeStore((s) => s.mode)

  // Construct pure mode palettes strictly adhering to Quick-Pitch and Deep-Dive color themes
  const palette: GyroPalette = useMemo(() => {
    if (mode === "deep") {
      // Deep-Dive: Electric Blueprint Blue (#2563EB, #4A8FFF), Hextech Cyan (#6AFFFF), Laser Orange (#F97316)
      return {
        mode: "deep",
        primary: "#6AFFFF",
        primaryRgb: "106, 255, 255",
        accent: "#4A8FFF",
        accentRgb: "74, 143, 255",
        accentBright: "#6AFFFF",
        secondary: "#F97316", // Laser orange
        tertiary: "#2563EB",  // Cobalt blue
        glowRgb: "74, 143, 255",
      }
    }

    // Quick-Pitch: Solar Gold (#FFD95A, #C9A227), Gold-Leaf (#FFE875), Radiant Amber (#FFB44A), Arcane Amethyst (#8E44AD)
    return {
      mode: "quick",
      primary: "#FFE875",
      primaryRgb: "255, 232, 117",
      accent: "#C9A227",
      accentRgb: "201, 162, 39",
      accentBright: "#FFD95A",
      secondary: "#8E44AD", // Arcane amethyst
      tertiary: "#FFB44A",  // Radiant solar amber
      glowRgb: "201, 162, 39",
    }
  }, [mode])

  // Immediately settle loader on subpages (e.g. /cv) so they render without delay
  useEffect(() => {
    if (pathname && pathname !== "/") {
      forceComplete()
    }
  }, [pathname, forceComplete])

  const [finishedSequence, setFinishedSequence] = useState(false)
  const [isOvercharging, setIsOvercharging] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stateRef = useRef<GyroscopeState | null>(null)
  const rafRef = useRef<number | null>(null)
  const paletteRef = useRef(palette)

  useEffect(() => {
    paletteRef.current = palette
  }, [palette])

  // 1. Canvas Lifecycle & rAF Loop
  useEffect(() => {
    if (pathname && pathname !== "/") return

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const updateCanvasDimensions = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    updateCanvasDimensions()
    stateRef.current = initGyroscope(window.innerWidth, window.innerHeight)

    const handleResize = () => {
      updateCanvasDimensions()
    }
    window.addEventListener("resize", handleResize)

    const loop = (now: number) => {
      if (!stateRef.current) return
      const currentProgress = useSiteLoaderStore.getState().progress
      const currentModelReady = useSiteLoaderStore.getState().isModelReady
      const overcharging = isOvercharging || currentProgress >= 95

      drawGyroscope(
        ctx,
        stateRef.current,
        currentProgress,
        currentModelReady,
        overcharging,
        now,
        window.innerWidth,
        window.innerHeight,
        paletteRef.current
      )

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [isOvercharging, pathname])

  // 2. Auto-resolve 3D model loading on subpages or after fail-safe timeout
  useEffect(() => {
    if (pathname && pathname !== "/") {
      markModelReady()
      return
    }

    // Fail-safe 4.5-second fallback timer if WebGL loop stalls
    const fallbackTimer = setTimeout(() => {
      if (!useSiteLoaderStore.getState().isModelReady) {
        markModelReady()
      }
    }, 4500)

    return () => clearTimeout(fallbackTimer)
  }, [pathname, markModelReady])

  // 3. Smooth steady progress simulation (~1.4s total load pacing)
  useEffect(() => {
    if (finishedSequence || (pathname && pathname !== "/")) return

    const interval = setInterval(() => {
      const current = useSiteLoaderStore.getState().progress
      if (current >= 92) {
        clearInterval(interval)
        return
      }
      const increment = current < 35 ? 3 : current < 75 ? 2 : 1
      setProgress(Math.min(92, current + increment))
    }, 32)

    return () => clearInterval(interval)
  }, [setProgress, finishedSequence, pathname])

  const phase = useSiteLoaderStore((s) => s.phase)
  const heroAnchorRect = useSiteLoaderStore((s) => s.heroAnchorRect)
  const startTransition = useSiteLoaderStore((s) => s.startTransition)
  const triggerIgnition = useSiteLoaderStore((s) => s.triggerIgnition)
  const completeTransition = useSiteLoaderStore((s) => s.completeTransition)

  // 4. Instant Skip Keyboard Shortcut (Space, Enter, Escape)
  useEffect(() => {
    if (phase !== "booting" || (pathname && pathname !== "/")) return

    const handleKeySkip = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "Enter" || e.key === "Escape") {
        e.preventDefault()
        markModelReady()
        setProgress(100)
      }
    }

    window.addEventListener("keydown", handleKeySkip)
    return () => window.removeEventListener("keydown", handleKeySkip)
  }, [phase, pathname, markModelReady, setProgress])

  // 5. Singularity Implosion & Arcane Handoff Sequence
  useEffect(() => {
    if (finishedSequence) return

    if (isModelReady && progress >= 90) {
      setFinishedSequence(true)
      setIsOvercharging(true)

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches

      const successSequence = async () => {
        setProgress(100)

        if (prefersReduced || (pathname && pathname !== "/")) {
          triggerIgnition()
          completeTransition()
          return
        }

        // Calculate trajectory anchor coordinates for 3D Hero tile
        const w = window.innerWidth
        const h = window.innerHeight
        let targetX = w < 768 ? w * 0.5 : w * 0.28
        let targetY = w < 768 ? h * 0.42 : h * 0.36

        if (heroAnchorRect) {
          targetX = heroAnchorRect.x
          targetY = heroAnchorRect.y
        }

        // Trigger inward singularity implosion and high-velocity beam in 2D engine
        if (stateRef.current) {
          triggerImplosion(stateRef.current, targetX, targetY)
        }
        startTransition()

        // Beam arrival at 3D Hero Tile (~280ms): Ignite HexCore & Bento induction
        await new Promise((r) => setTimeout(r, 280))
        triggerIgnition()

        // Settle transition after radial wave completes (~550ms later)
        await new Promise((r) => setTimeout(r, 550))
        completeTransition()
      }

      successSequence()
    }
  }, [
    isModelReady,
    progress,
    pathname,
    heroAnchorRect,
    setProgress,
    startTransition,
    triggerIgnition,
    completeTransition,
    finishedSequence,
  ])

  // 6. Prevent scrollbar issues during loading
  useEffect(() => {
    if (phase === "booting") {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [phase])

  // Stepped protocol milestones matching the HexCore architecture
  const telemetryMessage =
    progress < 25
      ? "[01/04] CALIBRATING CELESTIAL ORRERY"
      : progress < 55
      ? "[02/04] SYNCHRONIZING NEURAL MATRIX"
      : progress < 85
      ? "[03/04] HEXCORE PYRAMID INDUCTION"
      : "[04/04] LOCKING SINGULARITY // READY"

  if (phase === "settled" || (pathname && pathname !== "/")) return null

  const isDeep = palette.mode === "deep"

  return (
    <div className="fixed inset-0 z-[10002] font-mono select-none overflow-hidden pointer-events-none">
      {/* 1. Backdrop Veil: Starts opaque dark, dissolves smoothly when implosion starts */}
      <div
        className={cn(
          "absolute inset-0 bg-[#050505] z-0 pointer-events-auto transition-opacity duration-500 ease-out",
          phase === "booting" ? "opacity-100" : "opacity-0"
        )}
      />

      {/* 2. Gyroscope, Singularity Implosion & Arcane Handoff 2D Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        aria-hidden
      />

      {/* 3. Subtle Technical Scanline & Blueprint Overlay (Mode-Reactive) */}
      <motion.div
        animate={{ opacity: phase === "booting" ? 0.65 : 0 }}
        transition={{ duration: 0.35 }}
        className="absolute inset-0 bg-[size:100%_4px,6px_100%] pointer-events-none z-10"
        style={{
          backgroundImage: isDeep
            ? "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.3) 50%), linear-gradient(90deg, rgba(74,143,255,0.025), rgba(106,255,255,0.015))"
            : "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.3) 50%), linear-gradient(90deg, rgba(201,162,39,0.02), rgba(142,68,173,0.015))",
        }}
      />

      {/* 4. Center Gyroscope Spacer */}
      <div className="w-64 h-64 sm:w-80 sm:h-80 pointer-events-none relative z-10 mx-auto my-auto" />

      {/* 5. Kinetic Lume-Glass Telemetry HUD Deck (Mode-Pure Theming) */}
      <AnimatePresence initial={false}>
        {phase === "booting" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.95,
              filter: "blur(8px)",
              transition: { duration: 0.28 },
            }}
            className="absolute inset-x-0 bottom-12 sm:bottom-16 z-20 w-full max-w-md mx-auto px-4 pointer-events-auto"
          >
            {/* Lume-Glass Card Container */}
            <div
              className={cn(
                "relative p-5 sm:p-6 rounded-2xl bg-[#0c0d12]/94 backdrop-blur-2xl border transition-colors duration-500 overflow-hidden",
                isDeep
                  ? "border-[#2563EB]/40 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(74,143,255,0.18)]"
                  : "border-[#C9A227]/35 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(201,162,39,0.18)]"
              )}
            >
              {/* Blueprint Grid Texture & Sub-surface Noise */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
              <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

              {/* Corner Crosshair Accents */}
              <div
                className="absolute top-2.5 left-2.5 size-2 border-t border-l pointer-events-none"
                style={{ borderColor: isDeep ? "rgba(106, 255, 255, 0.4)" : "rgba(255, 232, 117, 0.4)" }}
              />
              <div
                className="absolute top-2.5 right-2.5 size-2 border-t border-r pointer-events-none"
                style={{ borderColor: isDeep ? "rgba(106, 255, 255, 0.4)" : "rgba(255, 232, 117, 0.4)" }}
              />
              <div
                className="absolute bottom-2.5 left-2.5 size-2 border-b border-l pointer-events-none"
                style={{ borderColor: isDeep ? "rgba(106, 255, 255, 0.4)" : "rgba(255, 232, 117, 0.4)" }}
              />
              <div
                className="absolute bottom-2.5 right-2.5 size-2 border-b border-r pointer-events-none"
                style={{ borderColor: isDeep ? "rgba(106, 255, 255, 0.4)" : "rgba(255, 232, 117, 0.4)" }}
              />

              {/* Top Specular Accent Beam */}
              <div
                className="absolute top-0 left-1/4 right-1/4 h-[1px] pointer-events-none transition-colors duration-500"
                style={{
                  background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)`,
                }}
              />

              {/* Telemetry Header */}
              <div className="flex items-center justify-between w-full mb-3 text-[11px] font-mono">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: palette.primary }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: palette.primary }}
                    />
                  </span>
                  <span className="text-white/80 font-medium tracking-wider truncate">
                    {telemetryMessage}
                  </span>
                </div>
                <span
                  className="font-bold tracking-widest shrink-0 ml-2"
                  style={{ color: palette.primary }}
                >
                  {progress}%
                </span>
              </div>

              {/* Liquid Progress Track */}
              <div className="h-2 w-full bg-white/[0.05] border border-white/10 rounded-full overflow-hidden relative shadow-inner mb-3">
                <motion.div
                  className="h-full rounded-full relative"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.15 }}
                  style={{
                    background: isDeep
                      ? `linear-gradient(90deg, ${palette.tertiary}, ${palette.accent}, ${palette.primary})`
                      : `linear-gradient(90deg, ${palette.accent}, ${palette.tertiary}, ${palette.primary})`,
                    boxShadow: `0 0 16px rgba(${palette.glowRgb}, 0.7), inset 0 0 8px rgba(255, 255, 255, 0.4)`,
                  }}
                >
                  {/* Leading Edge Spark */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                </motion.div>
              </div>

              {/* Secondary Sub-Telemetry Footnote */}
              <div className="flex items-center justify-between w-full text-[9px] uppercase tracking-widest text-white/40 font-mono">
                <span className="truncate">
                  {isDeep ? "HEXTECH CORE // BLUEPRINT MATRIX" : "ARCANE ENGINE // SOLAR MATRIX"}
                </span>
                <span className="text-white/30 hover:text-white/60 transition-colors shrink-0 ml-2">
                  SPACE / ESC TO SKIP
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
