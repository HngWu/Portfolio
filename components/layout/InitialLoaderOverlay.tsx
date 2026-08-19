"use client"

import React, { useEffect, useState, useRef } from "react"
import { useSiteLoaderStore } from "@/store/useSiteLoaderStore"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const fontSize = 14
    let columns = Math.floor(canvas.width / 20)
    // Initialize columns at random heights above the screen to stagger them from start
    let yPositions = Array.from({ length: columns }, () => Math.random() * -canvas.height)
    const chars = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ01"

    const draw = () => {
      ctx.fillStyle = "rgba(5, 5, 5, 0.08)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Use custom font, falling back to monospace
      ctx.font = `${fontSize}px 'NotoSansRunic-Regular', monospace`
      ctx.fillStyle = "rgba(74, 255, 180, 0.15)"

      for (let i = 0; i < yPositions.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * 20
        const y = yPositions[i]

        ctx.fillText(char, x, y)

        // Reset if it goes below screen or randomized threshold, adding small probability
        if (y > canvas.height && Math.random() > 0.975) {
          yPositions[i] = 0
        } else {
          yPositions[i] += 20
        }
      }
    }

    const interval = setInterval(draw, 33)

    const handleResize = () => {
      const oldColumns = columns
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      columns = Math.floor(canvas.width / 20)
      
      // Scale array size to match new column count
      if (columns > oldColumns) {
        const extra = Array.from({ length: columns - oldColumns }, () => Math.random() * -canvas.height)
        yPositions.push(...extra)
      } else if (columns < oldColumns) {
        yPositions.splice(columns)
      }
    }
    window.addEventListener("resize", handleResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />
}

export function InitialLoaderOverlay() {
  const pathname = usePathname()
  const progress = useSiteLoaderStore((s) => s.progress)
  const isLoaded = useSiteLoaderStore((s) => s.isLoaded)
  const setProgress = useSiteLoaderStore((s) => s.setProgress)
  const isModelReady = useSiteLoaderStore((s) => s.isModelReady)
  const setBootFinished = useSiteLoaderStore((s) => s.setBootFinished)
  const markModelReady = useSiteLoaderStore((s) => s.markModelReady)

  const [finishedSequence, setFinishedSequence] = useState(false)

  // 1. Auto-resolve 3D model loading on subpages or after 3.0s fail-safe timeout
  useEffect(() => {
    if (pathname && pathname !== "/") {
      markModelReady()
      return
    }

    // Fail-safe 3-second fallback timer if WebGL rAF loop stalls in inactive background tab
    const fallbackTimer = setTimeout(() => {
      if (!useSiteLoaderStore.getState().isModelReady) {
        markModelReady()
      }
    }, 3000)

    return () => clearTimeout(fallbackTimer)
  }, [pathname, markModelReady])

  // 2. Active resync on tab visibility change (Fix for inactive tab bug)
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

  // 3. Steady progress simulation
  useEffect(() => {
    if (finishedSequence) return

    const interval = setInterval(() => {
      const current = useSiteLoaderStore.getState().progress
      if (current >= 90) {
        clearInterval(interval)
        return
      }
      setProgress(Math.min(90, current + Math.floor(Math.random() * 8) + 4))
    }, 100)

    return () => clearInterval(interval)
  }, [setProgress, finishedSequence])

  // 4. Success Trigger & Discharge Sequence
  useEffect(() => {
    if (finishedSequence) return

    if (isModelReady && progress >= 90) {
      setFinishedSequence(true)
      
      const successSequence = async () => {
        setProgress(100)
        await new Promise((r) => setTimeout(r, 350))
        setBootFinished(true)
      }
      successSequence()
    }
  }, [isModelReady, progress, setProgress, setBootFinished, finishedSequence])

  // 5. Prevent scrollbar issues during loading
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

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            clipPath: [
              "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              "polygon(0% 49%, 100% 49%, 100% 51%, 0% 51%)",
              "polygon(50% 49%, 50% 49%, 50% 51%, 50% 51%)",
            ],
            opacity: 0,
            transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 bg-[#050505] z-[10002] flex items-center justify-center p-4 font-mono select-none"
        >
          {/* Matrix Rain Background */}
          <MatrixRain />

          {/* Retro scanlines overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(74,255,180,0.02),rgba(74,143,255,0.01))] bg-[size:100%_4px,6px_100%] pointer-events-none opacity-80" />
          
          <div className="relative z-10 flex flex-col items-center gap-8 max-w-sm w-full">
            {/* Runic Prism Engine Graphic */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer Counter-Clockwise Ring */}
              <div 
                className="absolute w-32 h-32 rounded-full border-2 border-dashed border-[#4AFFB4]/60 animate-spin" 
                style={{ animationDuration: '7s' }} 
              />
              
              {/* Inner Clockwise Ring */}
              <div 
                className="absolute w-20 h-20 rounded-full border border-[#4A8FFF]/80 animate-spin" 
                style={{ animationDuration: '4s', animationDirection: 'reverse' }} 
              />

              {/* Orbiting Rune Glyphs */}
              <div className="absolute inset-0 flex items-center justify-between px-1 text-[10px] text-[#4AFFB4]/70 font-bold pointer-events-none">
                <span>ᚠ</span>
                <span>ᚨ</span>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-between py-1 text-[10px] text-[#4A8FFF]/70 font-bold pointer-events-none">
                <span>ᚢ</span>
                <span>ᚦ</span>
              </div>

              {/* Central Glowing Diamond Core */}
              <div className="w-8 h-8 rotate-45 bg-gradient-to-br from-[#4AFFB4] to-[#4A8FFF] rounded-sm shadow-[0_0_25px_#4AFFB4] animate-pulse" />
            </div>

            {/* Kinetic Progress & Label */}
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex items-center justify-between w-full text-xs uppercase tracking-widest text-white/60">
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[#4AFFB4] animate-pulse" />
                  INITIALIZING CORE
                </span>
                <span className="text-[#4AFFB4] font-bold">{progress}%</span>
              </div>

              {/* Liquid Gradient Progress Bar */}
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative backdrop-blur-sm">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#4AFFB4] to-[#4A8FFF] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.15 }}
                  style={{ boxShadow: "0 0 12px rgba(74, 255, 180, 0.4)" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
