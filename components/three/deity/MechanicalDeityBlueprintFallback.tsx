"use client"

import React from "react"

export function MechanicalDeityBlueprintFallback() {
  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center overflow-hidden bg-[#06070A] select-none">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Dual Radial Glow (Cyan & Gold) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.08)_0%,rgba(245,176,65,0.05)_45%,transparent_70%)] pointer-events-none" />

      {/* Corner Crosshair Accents */}
      <div className="absolute top-8 left-8 sm:top-12 sm:left-12 size-4 border-t-2 border-l-2 border-cyan-400/40 pointer-events-none" />
      <div className="absolute top-8 right-8 sm:top-12 sm:right-12 size-4 border-t-2 border-r-2 border-amber-400/40 pointer-events-none" />
      <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 size-4 border-b-2 border-l-2 border-amber-400/40 pointer-events-none" />
      <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 size-4 border-b-2 border-r-2 border-cyan-400/40 pointer-events-none" />

      {/* Center Visual: Astrolabe, Halos & Singularity Core Blueprint */}
      <div className="relative flex flex-col items-center justify-center z-10 px-4">
        {/* Ambient Pulse Glow */}
        <div className="absolute size-72 sm:size-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute size-48 sm:size-64 rounded-full bg-amber-500/10 blur-2xl animate-pulse pointer-events-none" />

        {/* Concentric Rotating Astrolabe Rings */}
        <div className="relative size-44 sm:size-60 rounded-full border border-cyan-400/30 flex items-center justify-center">
          {/* Outer dashed ring */}
          <div className="absolute -inset-4 sm:-inset-6 rounded-full border border-dashed border-amber-400/30 animate-spin [animation-duration:35s] pointer-events-none" />
          {/* Middle dotted ring */}
          <div className="absolute -inset-8 sm:-inset-12 rounded-full border border-dotted border-cyan-400/20 animate-spin [animation-duration:50s] [animation-direction:reverse] pointer-events-none" />
          {/* Seraphic wing arc brackets */}
          <div className="absolute -inset-12 sm:-inset-16 rounded-full border-t border-b border-cyan-400/30 pointer-events-none" />
          <div className="absolute -inset-16 sm:-inset-20 rounded-full border-l border-r border-amber-400/20 pointer-events-none" />

          {/* Center Singularity Core Emblem */}
          <div className="relative size-24 sm:size-32 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_0_40px_rgba(0,240,255,0.15)]">
            <div className="absolute size-10 rounded-full bg-cyan-400/20 blur-md animate-ping [animation-duration:3s]" />
            <div className="absolute size-6 rounded-full bg-gradient-to-tr from-cyan-400 to-amber-400 opacity-60 shadow-[0_0_20px_rgba(0,240,255,0.8)]" />

            {/* Sacred Geometry Biomechanical SVG Icon */}
            <svg
              className="size-12 sm:size-14 text-cyan-300 drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              <path d="m4.93 4.93 2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
              <polygon points="12 4 19 8 19 16 12 20 5 16 5 8" strokeDasharray="2 2" />
            </svg>
          </div>
        </div>

        {/* Blueprint Badge */}
        <div className="mt-8 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 font-mono text-[11px] font-medium tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.15)]">
          <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>BLUEPRINT SCHEMATIC // MECHANICAL DEITY</span>
        </div>

        {/* Description / Instructions */}
        <h3 className="mt-4 text-base sm:text-xl font-bold font-mono tracking-wider text-white uppercase text-center">
          Omniscient Architecture • Eco Mode
        </h3>
        <p className="mt-2 text-xs font-mono text-white/50 text-center max-w-sm sm:max-w-md leading-relaxed px-4">
          WebGL Canvas paused for maximum power efficiency. Toggle &apos;Live 3D&apos; in performance telemetry to ignite real-time R3F simulation.
        </p>

        {/* Telemetry specs footer */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] text-white/40 uppercase tracking-wider">
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-400/80">SINGULARITY CORE</span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-400/80">ASTROLABE HALOS</span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-400/80">SERAPHIC WINGS</span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-400/80">NANITE SWARM</span>
        </div>
      </div>
    </div>
  )
}
