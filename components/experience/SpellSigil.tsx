"use client"

import * as React from "react"
import { motion } from "framer-motion"

interface SpellSigilProps {
  type?: "conjuration" | "transmutation" | "alchemy" | "enchantment"
  size?: number
  className?: string
}

export function SpellSigil({
  type = "transmutation",
  size = 140,
  className = "",
}: SpellSigilProps) {
  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      data-motif-type={type}
    >
      {/* Outer Rotating Technical Grid Ring */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full text-[var(--lume-primary,#4affb4)] opacity-30"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 2 1 2" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
        {/* Technical Coordinate Markers */}
        <circle cx="50" cy="4" r="1.5" fill="currentColor" />
        <circle cx="96" cy="50" r="1.5" fill="currentColor" />
        <circle cx="50" cy="96" r="1.5" fill="currentColor" />
        <circle cx="4" cy="50" r="1.5" fill="currentColor" />
      </motion.svg>

      {/* Middle Counter-Rotating Architectural Geometry */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] text-[var(--mode-accent-bright,#6affff)] opacity-25"
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        <polygon points="50,12 88,50 50,88 12,50" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <polygon points="23,23 77,23 77,77 23,77" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
        <circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" strokeWidth="0.75" />
      </motion.svg>

      {/* Core Subtle Geometric Blueprint Accent */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-6 w-[calc(100%-48px)] h-[calc(100%-48px)] text-[var(--lume-primary,#4affb4)] opacity-40"
        animate={{ scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="30" y="30" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
        <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
        <circle cx="50" cy="50" r="3.5" fill="currentColor" />
      </motion.svg>
    </div>
  )
}
