"use client"

import React, { useEffect, useState, useRef } from "react"
import { useSiteLoaderStore } from "@/store/useSiteLoaderStore"
import { useViewModeStore } from "@/store/useViewModeStore"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

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
  const mode = useViewModeStore((s) => s.mode)
  const progress = useSiteLoaderStore((s) => s.progress)
  const isLoaded = useSiteLoaderStore((s) => s.isLoaded)
  const setProgress = useSiteLoaderStore((s) => s.setProgress)
  const isModelReady = useSiteLoaderStore((s) => s.isModelReady)
  const setBootFinished = useSiteLoaderStore((s) => s.setBootFinished)
  const markModelReady = useSiteLoaderStore((s) => s.markModelReady)

  const shouldReduceMotion = useReducedMotion()
  const [finishedSequence, setFinishedSequence] = useState(false)

  // Mode Theme Mapping
  const isGold = mode === "quick"
  const primaryColor = isGold ? "#C9A227" : "#4A8FFF"
  const secondaryColor = isGold ? "#FFB44A" : "#4AFFB4"
  const modeGlyph = isGold ? "ᚠ" : "ᚦ"

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
            transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] }
          }}
          className="fixed inset-0 bg-[#050505] z-[10002] flex items-center justify-center p-4 font-mono select-none"
        >
          {/* Matrix Rain Background */}
          <MatrixRain />

          {/* Retro scanlines overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(74,255,180,0.02),rgba(74,143,255,0.01))] bg-[size:100%_4px,6px_100%] pointer-events-none opacity-80" />
          
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.08, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 20,
            }}
            className="relative z-10 flex flex-col items-center gap-8 max-w-sm w-full"
          >
            {/* Mode-Aware Ambient Glow Background */}
            <div 
              className={`absolute w-52 h-52 blur-3xl pointer-events-none transition-colors duration-500 ${
                shouldReduceMotion ? 'opacity-30 rounded-full' : 'animate-organic-morph opacity-50'
              }`}
              style={{
                background: `radial-gradient(circle, ${primaryColor}40 0%, ${secondaryColor}20 60%, transparent 100%)`
              }}
            />

            {/* Mode-Aware Arcane Constellation Engine */}
            <div className="relative w-52 h-52 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="constellationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={primaryColor} />
                    <stop offset="100%" stopColor={secondaryColor} />
                  </linearGradient>
                </defs>

                {/* Laser Beams connecting Outer Nodes to Core */}
                <line x1="100" y1="25" x2="100" y2="78" stroke="url(#constellationGrad)" strokeWidth="2" strokeDasharray="50" strokeDashoffset={50 - (50 * progress) / 100} opacity="0.85" />
                <line x1="175" y1="100" x2="122" y2="100" stroke="url(#constellationGrad)" strokeWidth="2" strokeDasharray="50" strokeDashoffset={50 - (50 * progress) / 100} opacity="0.85" />
                <line x1="100" y1="175" x2="100" y2="122" stroke="url(#constellationGrad)" strokeWidth="2" strokeDasharray="50" strokeDashoffset={50 - (50 * progress) / 100} opacity="0.85" />
                <line x1="25" y1="100" x2="78" y2="100" stroke="url(#constellationGrad)" strokeWidth="2" strokeDasharray="50" strokeDashoffset={50 - (50 * progress) / 100} opacity="0.85" />

                {/* Outer Star Nodes */}
                <circle cx="100" cy="25" r="5" fill={primaryColor} style={{ filter: `drop-shadow(0 0 8px ${primaryColor})` }} />
                <circle cx="175" cy="100" r="5" fill={secondaryColor} style={{ filter: `drop-shadow(0 0 8px ${secondaryColor})` }} />
                <circle cx="100" cy="175" r="5" fill={primaryColor} style={{ filter: `drop-shadow(0 0 8px ${primaryColor})` }} />
                <circle cx="25" cy="100" r="5" fill={secondaryColor} style={{ filter: `drop-shadow(0 0 8px ${secondaryColor})` }} />
              </svg>

              {/* Orbiting Rune Ring */}
              <motion.div 
                className="absolute w-28 h-28 rounded-full border border-dashed pointer-events-none transition-colors duration-500"
                style={{ borderColor: `${primaryColor}60` }}
                animate={shouldReduceMotion ? {} : { rotate: -360 }}
                transition={shouldReduceMotion ? {} : { duration: 12, ease: "linear", repeat: Infinity }}
              />

              {/* Central Prismatic Gem Core */}
              <motion.div 
                className="w-10 h-10 rounded-sm shadow-2xl flex items-center justify-center font-bold text-white text-base select-none transition-colors duration-500"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  boxShadow: `0 0 30px ${primaryColor}99`
                }}
                animate={
                  shouldReduceMotion
                    ? { opacity: [0.6, 1, 0.6] }
                    : { rotate: [45, 225, 405], scale: [0.95, 1.08, 0.95] }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 4, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }
                }
              >
                <span className="-rotate-45">{modeGlyph}</span>
              </motion.div>
            </div>

            {/* Kinetic Progress & Label */}
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex items-center justify-between w-full text-xs uppercase tracking-widest text-white/70">
                <span className="flex items-center gap-2 font-semibold">
                  <span className="size-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                  {isGold ? "GOLD CORE IGNITING" : "BLUEPRINT CORE COMPILING"}
                </span>
                <span className="font-bold transition-colors duration-300" style={{ color: primaryColor }}>{progress}%</span>
              </div>

              {/* Mode-Aware Liquid Progress Bar */}
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative backdrop-blur-sm">
                <motion.div
                  className="h-full rounded-full transition-colors duration-500"
                  style={{ 
                    background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                    boxShadow: `0 0 14px ${primaryColor}80` 
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0.1 }
                      : { type: "spring", stiffness: 200, damping: 25 }
                  }
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
