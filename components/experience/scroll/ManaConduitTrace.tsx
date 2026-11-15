"use client"

import * as React from "react"

interface ManaConduitTraceProps {
  progress: number // 0 to 1
  className?: string
}

export function ManaConduitTrace({
  progress,
  className = "",
}: ManaConduitTraceProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const percentage = Math.round(clampedProgress * 100)

  return (
    <div
      className={`relative w-2.5 sm:w-3 flex flex-col items-center select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Background Circuit Track with Runic Ticks */}
      <div className="absolute inset-y-0 w-[1px] bg-white/10" />

      {/* Decorative Runic Tick Marks */}
      <div className="absolute top-[10%] w-2 h-[1px] bg-[#FFD95A]/30" />
      <div className="absolute top-[30%] w-1.5 h-[1px] bg-white/20" />
      <div className="absolute top-[50%] w-2 h-[1px] bg-[#4affb4]/40" />
      <div className="absolute top-[70%] w-1.5 h-[1px] bg-white/20" />
      <div className="absolute top-[90%] w-2 h-[1px] bg-[#FFD95A]/30" />

      {/* Dynamic Luminous Mana Laser Fill */}
      <div
        className="absolute top-0 w-[2px] bg-gradient-to-b from-[#4affb4] via-[#FFE875] to-[#FFD95A] rounded-full shadow-[0_0_8px_rgba(74,255,180,0.8)] transition-[height] duration-150 ease-out"
        style={{ height: `${percentage}%` }}
      >
        {/* Leading Mana Spark Pulse */}
        <div className="absolute -bottom-1 -left-[3px] size-2 rounded-full bg-[#FFE875] shadow-[0_0_10px_2px_#FFE875] animate-ping" />
        <div className="absolute -bottom-0.5 -left-[1px] size-1 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
      </div>
    </div>
  )
}
