"use client"

import * as React from "react"
import { BentoTile } from "../BentoTile"
import { useIgniteStore } from "@/store/useIgniteStore"

export function EasterEggTile({ isDragging, sortableProps }: { isDragging?: boolean, sortableProps?: Record<string, unknown> }) {

  const { isIgnited } = useIgniteStore()
  const isAdmin = !!sortableProps || !!isDragging;
  
  if (!isIgnited && !isAdmin) return null

  return (
    <BentoTile
      id="easter-egg"
      size="3x2"
      glowColor="pink"
      className="relative overflow-hidden bg-black/60 group animate-in fade-in zoom-in duration-700 border-none"
      isDragging={isDragging}
      sortableProps={sortableProps}
    >
      {/* Glitch Borders (RGB Split) */}
      <div className="absolute inset-0 border border-lume-tertiary/50 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-1 pointer-events-none" />
      <div className="absolute inset-0 border border-lume-secondary/50 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-2 pointer-events-none" />
      <div className="absolute inset-0 border border-white/20 pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      <div className="relative z-10 flex flex-col h-full justify-center items-center text-center space-y-4">
        <div className="text-[0.6875rem] font-mono tracking-[0.2em] text-lume-tertiary uppercase animate-pulse">
          Root Access Granted
        </div>
        
        <h2 className="text-3xl font-display text-white group-hover:animate-glitch-text transition-all">
          REALITY_CORE
        </h2>
        
        <p className="text-sm font-mono text-white/50 max-w-[200px]">
          &quot;The grid is just a dream. Wake up, developer.&quot;
        </p>
        
        <div className="pt-4 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-lume-tertiary animate-ping" />
          <span className="text-[10px] font-mono text-lume-tertiary/70 uppercase tracking-tighter">
            System Overdrive
          </span>
        </div>
      </div>

      {/* Glitch Overlay Elements */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-lume-tertiary/50 -translate-y-full group-hover:animate-scanline" />
    </BentoTile>
  )
}
