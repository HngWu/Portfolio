"use client"

import * as React from "react"
import { motion } from "framer-motion"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export function SpellAmbientMana() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const particles = React.useMemo<Particle[]>(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: ((i * 17 + 23) % 94) + 3,
      y: ((i * 31 + 41) % 90) + 5,
      size: (i % 3) + 2,
      duration: (i % 4) * 2 + 7,
      delay: (i % 5) * 0.8,
    }))
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[var(--lume-primary,#4affb4)] blur-[0.5px]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            boxShadow: "0 0 8px rgba(74, 255, 180, 0.6)",
          }}
          animate={{
            y: [-10, -120],
            opacity: [0, 0.7, 0],
            scale: [0.8, 1.4, 0.6],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
