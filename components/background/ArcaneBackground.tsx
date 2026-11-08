"use client"

import React, { useRef } from "react"
import { useArcaneLoop } from "@/hooks/useArcaneLoop"

/**
 * ArcaneBackground
 *
 * Full-viewport canvas background providing mode-aware ambient visuals:
 * - Quick Pitch ("Arcane Orrery"): Gold/amethyst nebula fog, rotating Elder Futhark astrolabe sigil,
 *   rising runic glyphs, floating dust motes, cursor lantern glow, and orbital tile hover spell circle.
 * - Deep Dive ("Hextech Blueprint"): Cyan/mint flat-top hex lattice, vertex data pulses, crystal cells,
 *   hex decoding runes, periodic scanline sweep, and right-angle circuit hover traces.
 *
 * Mounted once in the root layout with fixed positioning behind all interactive content.
 */
export function ArcaneBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Attach the 60fps delta-time render loop & delegated pointer/tile tracking
  useArcaneLoop(canvasRef)

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none block w-full h-full"
      />
      {/* Subtle film-grain texture overlay (stretch goal) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none opacity-[0.018] contrast-125 dark:opacity-[0.025] mix-blend-overlay select-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  )
}

export default ArcaneBackground
