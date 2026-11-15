"use client"

import React, { useState } from "react"
import { Html } from "@react-three/drei"
import { useDeityControls } from "@/store/useDeityControls"
import { Sparkles, Zap, Shield, Activity } from "lucide-react"

interface Hotspot3DDef {
  id: "halo" | "core" | "sword"
  position: [number, number, number]
  sysTag: string
  title: string
  stats: { label: string; value: string }[]
  status: string
  icon: React.ComponentType<{ className?: string }>
}

const HOTSPOTS_3D: Hotspot3DDef[] = [
  {
    id: "halo",
    position: [0, 1.85, -0.2],
    sysTag: "SYS.HALO",
    title: "Celestial Astrolabe",
    stats: [
      { label: "ANGULAR VELOCITY", value: "420 RAD/S" },
      { label: "HARMONIC FLUX", value: "99.8%" },
    ],
    status: "SUPERCONDUCTING",
    icon: Sparkles,
  },
  {
    id: "core",
    position: [0, 0.45, 0.4],
    sysTag: "CORE.REACTOR",
    title: "Singularity Core",
    stats: [
      { label: "ENERGY OUTPUT", value: "1.21 PW" },
      { label: "CONTAINMENT", value: "NOMINAL" },
    ],
    status: "CRITICAL SYNERGY",
    icon: Zap,
  },
  {
    id: "sword",
    position: [0.78, -0.6, 0.9],
    sysTag: "AEGIS.WEAPON",
    title: "Aegis Claymore",
    stats: [
      { label: "PLASMA CORE", value: "440 THZ" },
      { label: "CHARGE MATRIX", value: "100% OVERDRIVE" },
    ],
    status: "ARMED & ENGAGED",
    icon: Shield,
  },
]

export function DeityHotspots3D() {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const setMode = useDeityControls((s) => s.setMode)
  const currentMode = useDeityControls((s) => s.mode)

  const handleTrigger = (id: string) => {
    setActiveHotspot(id)
    if (id === "core" || id === "sword") {
      setMode("OVERDRIVE")
      setTimeout(() => setMode("OBSERVER"), 4000)
    }
  }

  return (
    <group name="deity-hotspots" dispose={null}>
      {HOTSPOTS_3D.map((spot) => {
        const isSelected = activeHotspot === spot.id
        const Icon = spot.icon

        return (
          <group key={spot.id} position={spot.position}>
            {/* 3D World Space HTML Target Marker */}
            <Html center distanceFactor={14} zIndexRange={[100, 0]}>
              <div
                className="relative flex items-center justify-center select-none"
                onMouseEnter={() => setActiveHotspot(spot.id)}
                onMouseLeave={() => setActiveHotspot(null)}
              >
                {/* Target Node Button */}
                <button
                  type="button"
                  onClick={() => handleTrigger(spot.id)}
                  aria-label={`Inspect ${spot.title}`}
                  className="relative group size-7 sm:size-8 flex items-center justify-center rounded-full cursor-pointer focus:outline-none"
                >
                  <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping opacity-75" />
                  <span className="absolute inset-0 rounded-full border border-cyan-400/60 border-t-lume-primary shadow-[0_0_12px_rgba(74,255,180,0.6)] group-hover:scale-125 transition-transform duration-300" />
                  <span
                    className={`size-2 rounded-full transition-all duration-300 ${
                      currentMode === "OVERDRIVE"
                        ? "bg-purple-300 shadow-[0_0_12px_#A855F7] scale-125"
                        : "bg-lume-primary shadow-[0_0_8px_#4AFFB4]"
                    }`}
                  />
                </button>

                {/* 3D Floating Telemetry Card */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-56 sm:w-64 p-3 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.85)] transition-all duration-300 pointer-events-none ${
                    isSelected
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 translate-y-2"
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-lume-primary">
                        <Icon className="size-3" />
                      </div>
                      <div>
                        <div className="text-[9px] font-mono font-semibold tracking-wider text-lume-primary uppercase">
                          {spot.sysTag}
                        </div>
                        <div className="text-[11px] font-sans font-bold text-white tracking-wide">
                          {spot.title}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-[8px] text-white/70">
                      <Activity className="size-2 text-lume-primary animate-pulse" />
                      <span>{spot.status}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {spot.stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="flex items-center justify-between font-mono text-[9px]"
                      >
                        <span className="text-white/40">{stat.label}</span>
                        <span className="text-white/90 font-medium">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}
