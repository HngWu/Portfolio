"use client"

import React, { useEffect, useState, useRef } from "react"
import { useSiteLoaderStore } from "@/store/useSiteLoaderStore"
import { motion, AnimatePresence } from "framer-motion"

const BOOT_LOG_TEMPLATES = [
  "HEX_DECRYPTOR: LUME-GLASS PORTFOLIO MODULE [ACTIVE]",
  "SECURITY PROTOCOLS LOADED (LEVEL 9 BYPASS)",
  "ACQUIRING SUPABASE SECURE DATABASE NODE CONNECTION...",
  "ESTABLISHED NODE: DB_CONN_OK",
  "PARSING BENTO CELL DATA MATRIX: 12 TILES DETECTED",
  "ESTABLISHING WEBGL VIEWPORT VIEW...",
  "RESOLVING RUNIC TELEMETRY KEY DICTIONARY [ᚠ, ᚢ, ᚦ, ᚨ]...",
  "COMPILING INTERACTIVE LAYER GRAPHENE SHADERS...",
]

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
    const columns = Math.floor(canvas.width / 20)
    const yPositions = Array(columns).fill(0)
    const chars = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ01"

    const draw = () => {
      ctx.fillStyle = "rgba(5, 5, 5, 0.08)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "rgba(74, 255, 180, 0.15)" // Neon mint matrix rain
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < yPositions.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * 20
        const y = yPositions[i]

        ctx.fillText(char, x, y)

        if (y > 100 + Math.random() * 10000) {
          yPositions[i] = 0
        } else {
          yPositions[i] += 20
        }
      }
    }

    const interval = setInterval(draw, 33)

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
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
  const progress = useSiteLoaderStore((s) => s.progress)
  const isLoaded = useSiteLoaderStore((s) => s.isLoaded)
  const setProgress = useSiteLoaderStore((s) => s.setProgress)
  const isModelReady = useSiteLoaderStore((s) => s.isModelReady)
  const setBootFinished = useSiteLoaderStore((s) => s.setBootFinished)

  const [logs, setLogs] = useState<string[]>([])
  const [logIndex, setLogIndex] = useState(0)
  const [finishedSequence, setFinishedSequence] = useState(false)

  // 1. Progress Simulation (Caps at 90% until WebGL compiles and logIndex finishes templates)
  useEffect(() => {
    if (finishedSequence) return

    const interval = setInterval(() => {
      setProgress(Math.min(90, progress + Math.floor(Math.random() * 6) + 3))
    }, 120)

    return () => clearInterval(interval)
  }, [progress, setProgress, finishedSequence])

  // 2. Ticker log sequence logic
  useEffect(() => {
    if (finishedSequence) return

    if (logIndex < BOOT_LOG_TEMPLATES.length) {
      const delay = 160 + Math.random() * 100
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, `[ RUN ] ${BOOT_LOG_TEMPLATES[logIndex]}`])
        setLogIndex(logIndex + 1)
      }, delay)
      return () => clearTimeout(timer)
    } else if (isModelReady && progress >= 90) {
      // Model ready & initial logs printed: display final logs & complete loading
      setFinishedSequence(true)
      
      const successSequence = async () => {
        setLogs((prev) => [...prev, "[ OK ] WEBGL RENDERING CONTEXT ATTACHED"])
        setProgress(95)
        await new Promise((r) => setTimeout(r, 200))
        
        setLogs((prev) => [...prev, "[ OK ] HEXCORE 3x3 MATRIX FULLY COMPILED"])
        setProgress(100)
        await new Promise((r) => setTimeout(r, 200))
        
        setLogs((prev) => [...prev, "[ OK ] DISCHARGE COMMENCING. RELEASING RECOILS..."])
        await new Promise((r) => setTimeout(r, 300))
        
        setBootFinished(true)
      }
      successSequence()
    }
  }, [logIndex, isModelReady, progress, setProgress, setBootFinished, finishedSequence])

  // 3. Prevent scrollbar issues during loading
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
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 bg-[#050505] z-[10002] flex items-center justify-center p-4 font-mono select-none"
        >
          {/* Matrix Rain Background */}
          <MatrixRain />

          {/* Retro scanlines overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(74,255,180,0.02),rgba(74,143,255,0.01))] bg-[size:100%_4px,6px_100%] pointer-events-none opacity-80" />
          
          <div className="w-full max-w-xl p-8 border border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col gap-6 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 text-[10px] uppercase tracking-widest text-white/40">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#4AFFB4] animate-pulse" />
                SYSTEM BOOTLOADER
              </span>
              <span>v1.6.0</span>
            </div>

            {/* Scrolling Logs */}
            <div className="h-48 overflow-y-auto flex flex-col gap-1.5 text-xs text-white/60 text-left scrollbar-thin">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-[#4AFFB4] font-bold">
                    {log.startsWith("[ OK ]") ? "[ OK ]" : "[ RUN ]"}
                  </span>
                  <span className="text-white/80">{log.slice(8)}</span>
                </div>
              ))}
              {logIndex === BOOT_LOG_TEMPLATES.length && !isModelReady && (
                <div className="flex gap-2 animate-pulse">
                  <span className="text-[#4A8FFF] font-bold">[ WAIT ]</span>
                  <span className="text-white/50">COMPILING 3D TEXTURES & SHADERS...</span>
                </div>
              )}
            </div>

            {/* Progress Container */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex justify-between text-[10px] uppercase tracking-wider text-white/50">
                <span>COMPILING MATRIX</span>
                <span className="text-[#4AFFB4] font-bold">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                  className="h-full bg-[#4AFFB4] rounded-full"
                  style={{ width: `${progress}%`, boxShadow: "0 0 12px rgba(74, 255, 180, 0.15)" }}
                  transition={{ ease: "easeOut", duration: 0.1 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
