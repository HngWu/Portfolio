"use client"

import React from "react"

interface DeityEnergySpotlightProps {
  isHovered: boolean
  cursorPixel: { x: number; y: number }
  className?: string
}

export function DeityEnergySpotlight({
  isHovered,
  cursorPixel,
  className = "",
}: DeityEnergySpotlightProps) {
  const { x, y } = cursorPixel

  return (
    <div
      data-deity-spotlight="true"
      className={`absolute inset-0 pointer-events-none z-20 transition-opacity duration-500 mix-blend-color-dodge ${
        isHovered ? "opacity-100" : "opacity-0"
      } ${className}`}
      style={{
        background: `radial-gradient(circle 280px at ${x}px ${y}px, rgba(74, 255, 180, 0.45) 0%, rgba(0, 240, 255, 0.28) 35%, rgba(168, 85, 247, 0.15) 60%, transparent 100%)`,
      }}
    >
      {/* Intense Core Specular Pinpoint */}
      <div
        className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-[2px] transition-transform duration-75"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          boxShadow: "0 0 25px 8px rgba(74, 255, 180, 0.6)",
        }}
      />
    </div>
  )
}
