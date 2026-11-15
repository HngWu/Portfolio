"use client"

import React, { useState } from "react"
import { useMechanicalDeityStore, DeityHotspotId } from "@/store/useMechanicalDeityStore"
import { Shield, Zap, Sparkles, Activity } from "lucide-react"

interface HotspotDefinition {
  id: "halo" | "core" | "sword"
  x: string
  y: string
  title: string
  sysTag: string
  stats: { label: string; value: string }[]
  status: string
  icon: React.ComponentType<{ className?: string }>
}

const HOTSPOTS: HotspotDefinition[] = [
  {
    id: "halo",
    x: "50%",
    y: "9%",
    title: "Celestial Astrolabe",
    sysTag: "SYS.HALO",
    stats: [
      { label: "ANGULAR VELOCITY", value: "420 RAD/S" },
      { label: "HARMONIC FLUX", value: "99.8%" },
      { label: "CHRONO DRIFT", value: "0.000 ms" },
    ],
    status: "SUPERCONDUCTING",
    icon: Sparkles,
  },
  {
    id: "core",
    x: "54%",
    y: "30%",
    title: "Singularity Core",
    sysTag: "CORE.REACTOR",
    stats: [
      { label: "ENERGY OUTPUT", value: "1.21 PW" },
      { label: "MAGNETIC FLUX", value: "88.4 T" },
      { label: "CONTAINMENT", value: "NOMINAL" },
    ],
    status: "CRITICAL SYNERGY",
    icon: Zap,
  },
  {
    id: "sword",
    x: "40%",
    y: "68%",
    title: "Aegis Claymore",
    sysTag: "AEGIS.WEAPON",
    stats: [
      { label: "PLASMA CORE", value: "440 THZ" },
      { label: "EDGE DISCHARGE", value: "4.8 MK" },
      { label: "CHARGE MATRIX", value: "100% OVERDRIVE" },
    ],
    status: "ARMED & ENGAGED",
    icon: Shield,
  },
]

export function DeityHudHotspots() {
  const activeHotspot = useMechanicalDeityStore((s) => s.activeHotspot)
  const setActiveHotspot = useMechanicalDeityStore((s) => s.setActiveHotspot)
  const triggerOverdrive = useMechanicalDeityStore((s) => s.triggerOverdrive)
  const overdrive = useMechanicalDeityStore((s) => s.overdrive)
  const [internalHover, setInternalHover] = useState<DeityHotspotId>(null)

  const currentActive = activeHotspot || internalHover

  const handleSelect = (id: "halo" | "core" | "sword") => {
    setActiveHotspot(id)
    if (id === "core" || id === "sword") {
      triggerOverdrive(4000)
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {HOTSPOTS.map((spot) => {
        const isSelected = currentActive === spot.id
        const Icon = spot.icon

        return (
          <div
            key={spot.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            style={{ left: spot.x, top: spot.y }}
            onMouseEnter={() => {
              setInternalHover(spot.id)
              setActiveHotspot(spot.id)
            }}
            onMouseLeave={() => {
              setInternalHover(null)
              setActiveHotspot(null)
            }}
          >
            {/* Target Reticle Button */}
            <button
              type="button"
              onClick={() => handleSelect(spot.id)}
              className="relative group size-8 sm:size-10 flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-lume-primary cursor-pointer"
              aria-label={`Inspect ${spot.title}`}
            >
              {/* Radar Ping Wave */}
              <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping opacity-75" />

              {/* Outer Rotating Reticle Ring */}
              <span className="absolute inset-0 rounded-full border border-cyan-400/60 border-t-lume-primary border-b-purple-400 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-90 shadow-[0_0_12px_rgba(74,255,180,0.5)]" />

              {/* Center Dot Node */}
              <span
                className={`size-2.5 rounded-full transition-all duration-300 ${
                  overdrive
                    ? "bg-purple-300 shadow-[0_0_15px_#A855F7] scale-125"
                    : isSelected
                    ? "bg-lume-primary shadow-[0_0_12px_#4AFFB4] scale-125"
                    : "bg-cyan-300 shadow-[0_0_8px_#00F0FF]"
                }`}
              />

              {/* Mini Corner Brackets */}
              <span className="absolute -top-1 -left-1 size-2 border-t border-l border-white/40 pointer-events-none" />
              <span className="absolute -bottom-1 -right-1 size-2 border-b border-r border-white/40 pointer-events-none" />
            </button>

            {/* Glassmorphic Sci-Fi Telemetry Tooltip */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 mt-3 w-64 sm:w-72 p-3.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.7)] transition-all duration-300 z-50 pointer-events-none select-none ${
                isSelected
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 translate-y-2 pointer-events-none"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-lume-primary">
                    <Icon className="size-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-semibold tracking-wider text-lume-primary uppercase">
                      {spot.sysTag}
                    </div>
                    <div className="text-xs font-sans font-bold text-white tracking-wide">
                      {spot.title}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-[9px] text-white/70">
                  <Activity className="size-2.5 text-lume-primary animate-pulse" />
                  <span>{spot.status}</span>
                </div>
              </div>

              {/* Telemetry Stats Grid */}
              <div className="space-y-1.5">
                {spot.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between font-mono text-[10px]"
                  >
                    <span className="text-white/40">{stat.label}</span>
                    <span className="text-white/90 font-medium tracking-wider">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Hint */}
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between font-mono text-[9px] text-white/40">
                <span>CLICK NODE</span>
                <span className="text-lume-primary font-semibold">TRIGGER OVERDRIVE</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
