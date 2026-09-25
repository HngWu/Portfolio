"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

export interface SpellOpeningFlourishProps {
  mode: "idle" | "opening" | "closing"
  className?: string
}

interface ParticleSpec {
  id: number
  x: number
  y: number
  size: number
  color: string
  delay: number
  duration: number
}

// Deterministic particle set to avoid hydration mismatches
const FLOURISH_PARTICLES: ParticleSpec[] = [
  { id: 0, x: -65, y: -45, size: 5, color: "#4affb4", delay: 0.28, duration: 0.65 },
  { id: 1, x: 45, y: -80, size: 4, color: "#6affff", delay: 0.32, duration: 0.6 },
  { id: 2, x: 85, y: -30, size: 6, color: "#ffd700", delay: 0.35, duration: 0.7 },
  { id: 3, x: -95, y: 15, size: 4, color: "#ffffff", delay: 0.3, duration: 0.58 },
  { id: 4, x: 70, y: 65, size: 5, color: "#4affb4", delay: 0.38, duration: 0.68 },
  { id: 5, x: -50, y: 95, size: 6, color: "#6affff", delay: 0.34, duration: 0.62 },
  { id: 6, x: 110, y: 20, size: 4, color: "#ffd700", delay: 0.36, duration: 0.72 },
  { id: 7, x: -30, y: -110, size: 5, color: "#ffffff", delay: 0.4, duration: 0.64 },
  { id: 8, x: 15, y: -70, size: 7, color: "#4affb4", delay: 0.33, duration: 0.66 },
  { id: 9, x: -80, y: -75, size: 4, color: "#6affff", delay: 0.37, duration: 0.6 },
  { id: 10, x: 95, y: -90, size: 5, color: "#ffffff", delay: 0.42, duration: 0.7 },
  { id: 11, x: -40, y: 70, size: 5, color: "#ffd700", delay: 0.39, duration: 0.65 },
  { id: 12, x: 50, y: 110, size: 4, color: "#4affb4", delay: 0.41, duration: 0.62 },
  { id: 13, x: -110, y: -20, size: 6, color: "#6affff", delay: 0.31, duration: 0.68 },
  { id: 14, x: 30, y: 40, size: 8, color: "#ffffff", delay: 0.35, duration: 0.6 },
  { id: 15, x: -20, y: 25, size: 6, color: "#4affb4", delay: 0.33, duration: 0.65 },
]

export function SpellOpeningFlourish({ mode, className = "" }: SpellOpeningFlourishProps) {
  // Check reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      setPrefersReducedMotion(mq.matches)
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
      mq.addEventListener("change", listener)
      return () => mq.removeEventListener("change", listener)
    }
  }, [])

  if (prefersReducedMotion || mode === "idle") {
    return null
  }

  const isOpening = mode === "opening"

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-visible ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence>
        {isOpening ? (
          <motion.div
            key="opening-flourish"
            className="relative flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Core expanding radial light burst along the spine crease */}
            <motion.div
              className="absolute w-72 h-72 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(74,255,180,0.45) 0%, rgba(106,255,255,0.25) 45%, rgba(255,215,0,0.15) 70%, transparent 80%)",
              }}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{
                scale: [0.2, 1.4, 1.8],
                opacity: [0, 0.9, 0],
              }}
              transition={{
                duration: 0.85,
                times: [0, 0.55, 1],
                ease: [0.22, 1, 0.36, 1],
              }}
            />

            {/* Central spine flash beam */}
            <motion.div
              className="absolute w-2 h-96 bg-gradient-to-b from-transparent via-[var(--lume-primary,#4affb4)] to-transparent blur-[2px]"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{
                scaleY: [0, 1.2, 0.8],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 0.75,
                times: [0, 0.45, 1],
                ease: "easeOut",
              }}
            />

            {/* Orbiting / Expanding Mana Sparkles */}
            {FLOURISH_PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full shadow-[0_0_10px_currentColor]"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  color: p.color,
                }}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  x: [0, p.x * 0.5, p.x],
                  y: [0, p.y * 0.5, p.y],
                  scale: [0, 1.4, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  delay: p.delay,
                  duration: p.duration,
                  ease: [0.25, 0.85, 0.35, 1],
                }}
              />
            ))}
          </motion.div>
        ) : (
          /* Closing Inward Collapse Flourish */
          <motion.div
            key="closing-flourish"
            className="relative flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            {/* Rapid contracting core pulse */}
            <motion.div
              className="absolute w-56 h-56 rounded-full blur-xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(106,255,255,0.4) 0%, rgba(74,255,180,0.2) 50%, transparent 75%)",
              }}
              initial={{ scale: 1.5, opacity: 0.8 }}
              animate={{ scale: 0.1, opacity: 0 }}
              transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
            />

            {/* Particles snapping back into spine latch */}
            {FLOURISH_PARTICLES.slice(0, 8).map((p) => (
              <motion.div
                key={`close-${p.id}`}
                className="absolute rounded-full shadow-[0_0_8px_currentColor]"
                style={{
                  width: p.size * 0.8,
                  height: p.size * 0.8,
                  backgroundColor: p.color,
                  color: p.color,
                }}
                initial={{
                  x: p.x * 0.7,
                  y: p.y * 0.7,
                  scale: 1,
                  opacity: 0.8,
                }}
                animate={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.38,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
