"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

export interface SpellOpeningFlourishProps {
  mode: "idle" | "opening" | "closing"
  className?: string
}

interface FlourishParticle {
  id: number
  x: number
  y: number
  size: number
  color: string
  delay: number
  duration: number
}

// Deterministic particle set for drifting dust motes and mana sparkles
const FLOURISH_PARTICLES: FlourishParticle[] = [
  { id: 0, x: -75, y: -55, size: 5, color: "#4affb4", delay: 0.15, duration: 0.8 },
  { id: 1, x: 55, y: -90, size: 4, color: "#6affff", delay: 0.2, duration: 0.75 },
  { id: 2, x: 95, y: -35, size: 6, color: "#ffd700", delay: 0.22, duration: 0.85 },
  { id: 3, x: -110, y: 20, size: 4, color: "#ffffff", delay: 0.18, duration: 0.72 },
  { id: 4, x: 80, y: 75, size: 5, color: "#4affb4", delay: 0.25, duration: 0.82 },
  { id: 5, x: -60, y: 105, size: 6, color: "#6affff", delay: 0.21, duration: 0.78 },
  { id: 6, x: 125, y: 25, size: 4, color: "#ffd700", delay: 0.24, duration: 0.88 },
  { id: 7, x: -35, y: -120, size: 5, color: "#ffffff", delay: 0.28, duration: 0.8 },
  { id: 8, x: 20, y: -80, size: 7, color: "#4affb4", delay: 0.2, duration: 0.82 },
  { id: 9, x: -90, y: -85, size: 4, color: "#6affff", delay: 0.23, duration: 0.76 },
  { id: 10, x: 105, y: -100, size: 5, color: "#ffffff", delay: 0.29, duration: 0.86 },
  { id: 11, x: -45, y: 80, size: 5, color: "#ffd700", delay: 0.26, duration: 0.8 },
  { id: 12, x: 60, y: 120, size: 4, color: "#4affb4", delay: 0.27, duration: 0.78 },
  { id: 13, x: -125, y: -25, size: 6, color: "#6affff", delay: 0.19, duration: 0.84 },
  { id: 14, x: 40, y: 45, size: 7, color: "#ffffff", delay: 0.22, duration: 0.75 },
  { id: 15, x: -25, y: 30, size: 6, color: "#4affb4", delay: 0.21, duration: 0.8 },
  // Subtle dust motes floating high in the light cone
  { id: 16, x: -150, y: -60, size: 3, color: "rgba(255,255,255,0.7)", delay: 0.3, duration: 0.95 },
  { id: 17, x: 140, y: -70, size: 3, color: "rgba(255,215,0,0.6)", delay: 0.32, duration: 0.92 },
  { id: 18, x: -130, y: 70, size: 3.5, color: "rgba(74,255,180,0.7)", delay: 0.34, duration: 0.96 },
  { id: 19, x: 160, y: 50, size: 3, color: "rgba(106,255,255,0.7)", delay: 0.31, duration: 0.98 },
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
      className={`absolute inset-0 pointer-events-none z-40 flex items-center justify-center overflow-visible ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence>
        {isOpening ? (
          <motion.div
            key="opening-flourish"
            className="relative w-full h-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 1. Gutter Light Spill Fan: Expanding vertical pillar from center crease */}
            <motion.div
              className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 pointer-events-none blur-xl"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(74,255,180,0.6) 0%, rgba(106,255,255,0.3) 35%, rgba(255,215,0,0.15) 60%, transparent 80%)",
              }}
              initial={{ width: "20px", opacity: 0, scaleY: 0.4 }}
              animate={{
                width: ["20px", "480px", "620px"],
                opacity: [0, 0.95, 0],
                scaleY: [0.4, 1.2, 1.3],
              }}
              transition={{
                duration: 0.95,
                times: [0, 0.45, 1],
                ease: [0.22, 1, 0.36, 1],
              }}
            />

            {/* 2. Intense Gutter Spine Laser Beam */}
            <motion.div
              className="absolute left-1/2 top-0 bottom-0 w-3 -translate-x-1/2 bg-gradient-to-b from-transparent via-white to-transparent blur-[1px]"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{
                scaleY: [0, 1.3, 0.6],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 0.8,
                times: [0, 0.4, 1],
                ease: "easeOut",
              }}
            />

            {/* 3. Drifting Dust Motes & Luminous Sparkles in the light beam */}
            {FLOURISH_PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full shadow-[0_0_8px_currentColor]"
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
                  x: [0, p.x * 0.45, p.x],
                  y: [0, p.y * 0.5 - 15, p.y - 30], // upward drifting motes
                  scale: [0, 1.4, 0],
                  opacity: [0, 0.9, 0],
                }}
                transition={{
                  delay: p.delay,
                  duration: p.duration,
                  ease: [0.25, 0.85, 0.35, 1],
                }}
              />
            ))}

            {/* 4. Full-Spread Specular Shimmer Wave across pages */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(74,255,180,0.18) 50%, transparent 100%)",
              }}
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: ["-100%", "0%", "100%"], opacity: [0, 0.7, 0] }}
              transition={{
                delay: 0.4,
                duration: 0.65,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        ) : (
          /* Closing Inward Gutter Collapse Flourish */
          <motion.div
            key="closing-flourish"
            className="relative w-full h-full flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.48 }}
          >
            {/* Rapid Contracting Light toward the Gutter */}
            <motion.div
              className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 pointer-events-none blur-lg"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(106,255,255,0.5) 0%, rgba(74,255,180,0.3) 40%, transparent 70%)",
              }}
              initial={{ width: "500px", opacity: 0.8 }}
              animate={{ width: "10px", opacity: 0 }}
              transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
            />

            {/* Inward Particle Suction toward Spine Crease */}
            {FLOURISH_PARTICLES.slice(0, 12).map((p) => (
              <motion.div
                key={`close-${p.id}`}
                className="absolute rounded-full shadow-[0_0_6px_currentColor]"
                style={{
                  width: p.size * 0.8,
                  height: p.size * 0.8,
                  backgroundColor: p.color,
                  color: p.color,
                }}
                initial={{
                  x: p.x * 0.8,
                  y: p.y * 0.8,
                  scale: 1,
                  opacity: 0.75,
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
