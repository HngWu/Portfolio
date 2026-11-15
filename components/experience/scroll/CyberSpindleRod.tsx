"use client"

import * as React from "react"

interface CyberSpindleRodProps {
  variant: "top" | "bottom"
  isAnimating?: boolean
  className?: string
  children?: React.ReactNode
}

export function CyberSpindleRod({
  variant,
  isAnimating = false,
  className = "",
  children,
}: CyberSpindleRodProps) {
  return (
    <div
      className={`relative w-full flex flex-col items-center select-none ${className}`}
      aria-hidden="true"
    >
      {/* Outer Cylinder Housing */}
      <div className="relative w-full h-8 sm:h-9 flex items-center justify-between px-1.5 sm:px-3 bg-gradient-to-r from-[#03060a] via-[#151c28] to-[#03060a] border-y border-[#FFD95A]/30 shadow-[0_4px_20px_rgba(0,0,0,0.8)] rounded-md overflow-hidden">
        {/* Core Cylinder Metallic Sheen & Linear Highlight */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FFE875]/80 to-transparent" />
        <div className="absolute inset-x-0 top-1 h-[2px] bg-white/20 blur-[0.5px]" />
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-[#FFD95A]/20" />

        {/* Left Spindle Gemstone & Rotating Gear Teeth */}
        <div className="flex items-center gap-1 sm:gap-1.5 z-10 shrink-0">
          <div className="relative size-4 sm:size-5 rounded-full bg-gradient-to-br from-[#FFD95A] to-[#8E44AD] p-[1px] shadow-[0_0_10px_rgba(255,217,90,0.5)]">
            <div className="w-full h-full rounded-full bg-[#0a0f18] flex items-center justify-center">
              <span className="size-1.5 sm:size-2 rounded-full bg-[var(--lume-primary,#4affb4)] animate-pulse shadow-[0_0_6px_#4affb4]" />
            </div>
          </div>

          {/* Brass Gear Teeth Notches (SVG) */}
          <svg
            viewBox="0 0 24 24"
            className={`size-3.5 sm:size-4 text-[#FFD95A]/70 ${
              isAnimating ? "animate-[spin_0.8s_linear_infinite]" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="3" stroke="currentColor" />
            <path
              d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
              strokeLinecap="round"
            />
          </svg>

          {/* Micro Telemetry Etching */}
          <span className="hidden xs:inline-block font-mono text-[7px] sm:text-[8px] text-[#FFE875]/40 tracking-widest uppercase">
            {variant === "top" ? "ROD//01A" : "ROD//01B"}
          </span>
        </div>

        {/* Center Filigree Circuit Spine */}
        <div className="flex-1 flex items-center justify-center px-2 z-10">
          <div className="w-full max-w-[280px] sm:max-w-md h-[1px] bg-gradient-to-r from-transparent via-[#FFD95A]/50 to-transparent relative flex items-center justify-center">
            {/* Center Mechanical Runic Node (Emblem without text) */}
            <div className="px-2.5 py-0.5 rounded-full bg-[#070b12] border border-[#FFD95A]/40 flex items-center gap-2 shadow-[0_0_10px_rgba(255,217,90,0.3)]">
              <span className="size-1 rounded-full bg-[#FFE875] animate-pulse" />
              <svg viewBox="0 0 16 16" className="size-2.5 text-[#FFD95A]" fill="currentColor">
                <polygon points="8,0 10.5,5.5 16,8 10.5,10.5 8,16 5.5,10.5 0,8 5.5,5.5" />
              </svg>
              <div className="w-4 h-[1px] bg-[#FFD95A]/40" />
              <svg viewBox="0 0 16 16" className="size-2.5 text-[#4affb4]" fill="currentColor">
                <polygon points="8,0 10.5,5.5 16,8 10.5,10.5 8,16 5.5,10.5 0,8 5.5,5.5" />
              </svg>
              <span className="size-1 rounded-full bg-[#4affb4] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Spindle Gemstone & Gear */}
        <div className="flex items-center gap-1 sm:gap-1.5 z-10 shrink-0">
          <span className="hidden xs:inline-block font-mono text-[7px] sm:text-[8px] text-[#FFE875]/40 tracking-widest uppercase">
            {variant === "top" ? "LOCK//SYS" : "SEC//V4"}
          </span>

          <svg
            viewBox="0 0 24 24"
            className={`size-3.5 sm:size-4 text-[#FFD95A]/70 ${
              isAnimating ? "animate-[spin_0.8s_linear_infinite_reverse]" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="3" stroke="currentColor" />
            <path
              d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
              strokeLinecap="round"
            />
          </svg>

          <div className="relative size-4 sm:size-5 rounded-full bg-gradient-to-br from-[#8E44AD] to-[#FFD95A] p-[1px] shadow-[0_0_10px_rgba(74,255,180,0.5)]">
            <div className="w-full h-full rounded-full bg-[#0a0f18] flex items-center justify-center">
              <span className="size-1.5 sm:size-2 rounded-full bg-[#FFD95A] animate-pulse shadow-[0_0_6px_#FFD95A]" />
            </div>
          </div>
        </div>
      </div>

      {/* Optional Injected Controls Slot (e.g. Navigation Pills, Return button) */}
      {children && <div className="w-full relative z-20">{children}</div>}
    </div>
  )
}
