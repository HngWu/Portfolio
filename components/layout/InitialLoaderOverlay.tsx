"use client"

import React, { useEffect, useState, useRef } from "react"
import { useSiteLoaderStore } from "@/store/useSiteLoaderStore"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  initGyroscope,
  drawGyroscope,
  triggerShockwave,
  type GyroscopeState
} from "./gyroscope-engine"

export function InitialLoaderOverlay() {
  const pathname = usePathname()
  const progress = useSiteLoaderStore((s) => s.progress)
  const isLoaded = useSiteLoaderStore((s) => s.isLoaded)
  const setProgress = useSiteLoaderStore((s) => s.setProgress)
  const isModelReady = useSiteLoaderStore((s) => s.isModelReady)
  const setBootFinished = useSiteLoaderStore((s) => s.setBootFinished)
  const markModelReady = useSiteLoaderStore((s) => s.markModelReady)

  const [finishedSequence, setFinishedSequence] = useState(false)
  const [isOvercharging, setIsOvercharging] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stateRef = useRef<GyroscopeState | null>(null)
  const rafRef = useRef<number | null>(null)

  // 1. Canvas Lifecycle & rAF Loop
  useEffect(() => {
    if (isLoaded) return

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
        window.innerHeight
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
  }, [isLoaded, isOvercharging])

  // 2. Auto-resolve 3D model loading on subpages or after 3.0s fail-safe timeout
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

  // 3. Active resync on tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (!useSiteLoaderStore.getState().isLoaded) {
          markModelReady()
          setProgress(100)
          setBootFinished(true)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [markModelReady, setProgress, setBootFinished])

  // 4. Smooth steady progress simulation (graceful 2.4s - 3.0s pacing)
  useEffect(() => {
    if (finishedSequence) return

    const interval = setInterval(() => {
      const current = useSiteLoaderStore.getState().progress
      if (current >= 92) {
        clearInterval(interval)
        return
      }
      // Smooth micro-increments of 1-3% every 50ms
      const increment = current < 40 ? 2 : current < 75 ? 2 : 1
      setProgress(Math.min(92, current + increment))
    }, 50)

    return () => clearInterval(interval)
  }, [setProgress, finishedSequence])

  // 5. Success Trigger & Supernova Shockwave Sequence
  useEffect(() => {
    if (finishedSequence) return

    if (isModelReady && progress >= 90) {
      setFinishedSequence(true)
      setIsOvercharging(true)

      const successSequence = async () => {
        setProgress(100)
        
        // Trigger explosive shockwave on canvas
        if (stateRef.current) {
          triggerShockwave(
            stateRef.current,
            window.innerWidth / 2,
            window.innerHeight / 2 - 40
          )
        }

        // Brief hold for shockwave expansion and singularity flare
        await new Promise((r) => setTimeout(r, 450))
        setBootFinished(true)
      }
      successSequence()
    }
  }, [isModelReady, progress, setProgress, setBootFinished, finishedSequence])

  // 6. Prevent scrollbar issues during loading
  useEffect(() => {
    if (!isLoaded) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isLoaded])

  // Determine dynamic telemetry string based on current boot milestone
  const telemetryMessage =
    progress < 30
      ? "INITIALIZING RUNIC ENGINE"
      : progress < 65
      ? "SYNCHRONIZING HEXCORE MATRIX"
      : progress < 90
      ? "COMPILING PBR SHADERS"
      : "LOCKING SINGULARITY // READY"

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.06,
            filter: "brightness(1.6) blur(6px)",
            transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 bg-[#050505] z-[10002] flex flex-col items-center justify-center p-4 font-mono select-none overflow-hidden"
        >
          {/* Gyroscope & Shockwave 2D Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
            aria-hidden
          />

          {/* Retro subtle scanline texture */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%),linear-gradient(90deg,rgba(74,255,180,0.015),rgba(201,162,39,0.01))] bg-[size:100%_4px,6px_100%] pointer-events-none opacity-60 z-10" />

          {/* Center Gyroscope Spacer */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 pointer-events-none relative z-10" />

          {/* Kinetic Progress & Telemetry HUD */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative z-20 flex flex-col items-center gap-3.5 max-w-sm w-full mt-2 px-2"
          >
            {/* Telemetry Header */}
            <div className="flex items-center justify-between w-full text-[11px] uppercase tracking-wider text-white/70">
              <span className="flex items-center gap-2 font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4AFFB4] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4AFFB4]" />
                </span>
                <span className="text-white/80 font-medium">{telemetryMessage}</span>
              </span>
              <span className="text-[#FFE875] font-bold tracking-widest">{progress}%</span>
            </div>

            {/* Liquid Lume Gradient Progress Bar */}
            <div className="h-2 w-full bg-white/[0.06] border border-white/[0.08] rounded-full overflow-hidden relative backdrop-blur-md shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-[#4AFFB4] via-[#4A8FFF] to-[#FFE875] rounded-full relative"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.15 }}
                style={{
                  boxShadow: "0 0 16px rgba(74, 255, 180, 0.6), inset 0 0 8px rgba(255, 232, 117, 0.4)"
                }}
              >
                {/* Leading Edge Spark */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
              </motion.div>
            </div>

            {/* Secondary Sub-Telemetry Footnote */}
            <div className="flex items-center justify-between w-full text-[9px] uppercase tracking-widest text-white/30 font-mono">
              <span>LUME-GLASS ENGINE // v2.4</span>
              <span>SYS.OK</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
