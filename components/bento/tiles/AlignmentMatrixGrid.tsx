"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Terminal, Server, Sparkles, Cpu } from "lucide-react"
import { playBrassClick } from "@/lib/skills/astrolabeAudio"

export interface AlignmentMatrixGridProps {
  className?: string
}

interface HouseMastery {
  id: string
  name: string
  domain: string
  progress: number
  color: string
  tech: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  rune: string
}

const HOUSES: HouseMastery[] = [
  {
    id: "transmutation",
    name: "House of Transmutation",
    domain: "Full-Stack & CS",
    progress: 95,
    color: "#4AFFB4",
    tech: "Next.js 16 · TS · React 19",
    icon: Terminal,
    rune: "ᛏ",
  },
  {
    id: "alchemy",
    name: "House of Alchemy",
    domain: "Enterprise & Cloud",
    progress: 90,
    color: "#FFD95A",
    tech: "Spring Boot · MariaDB · OpenShift",
    icon: Server,
    rune: "ᚠ",
  },
  {
    id: "thaumaturgy",
    name: "House of Thaumaturgy",
    domain: "Creative Tech & 3D",
    progress: 85,
    color: "#4A8FFF",
    tech: "Three.js · GLSL · WebGL",
    icon: Sparkles,
    rune: "ᛊ",
  },
  {
    id: "divination",
    name: "House of Divination",
    domain: "Distributed & AI",
    progress: 80,
    color: "#FF4A8F",
    tech: "Go · Raft · Agentic Swarms",
    icon: Cpu,
    rune: "ᛞ",
  },
]

const GAUGE_RADIUS = 21
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS // ~131.95

export function AlignmentMatrixGrid({ className }: AlignmentMatrixGridProps) {
  return (
    <div className={cn("@container/matrix grid grid-cols-1 @[480px]/matrix:grid-cols-2 gap-2 w-full", className)}>
      {HOUSES.map((house) => {
        const strokeDashoffset =
          GAUGE_CIRCUMFERENCE * (1 - house.progress / 100)

        return (
          <div
            key={house.id}
            tabIndex={0}
            role="group"
            aria-label={`${house.name}: ${house.progress}% mastery (${house.tech})`}
            onMouseEnter={() => playBrassClick()}
            onFocus={() => playBrassClick()}
            className="group/gauge relative flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/25 hover:bg-white/[0.06] focus-visible:ring-1 focus-visible:ring-white/40 outline-none transition-all duration-300 overflow-hidden select-none"
          >
            {/* Top House Element Glow Line */}
            <div
              className="absolute top-0 left-0 right-0 h-[1.5px] opacity-40 group-hover/gauge:opacity-100 transition-opacity"
              style={{
                background: `linear-gradient(90deg, transparent, ${house.color}, transparent)`,
              }}
            />

            {/* Elder Futhark Background Rune Watermark */}
            <div
              className="absolute right-2.5 -bottom-1 text-3xl font-mono opacity-[0.06] group-hover/gauge:opacity-[0.12] transition-opacity pointer-events-none select-none"
              aria-hidden="true"
            >
              {house.rune}
            </div>

            {/* Circular Radial Mastery Gauge */}
            <div className="relative shrink-0 flex items-center justify-center size-13">
              <svg
                viewBox="0 0 52 52"
                className="size-full overflow-visible"
                aria-hidden="true"
              >
                {/* Background Track */}
                <circle
                  cx="26"
                  cy="26"
                  r={GAUGE_RADIUS}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="3.5"
                />
                {/* Progress Track */}
                <circle
                  cx="26"
                  cy="26"
                  r={GAUGE_RADIUS}
                  fill="none"
                  stroke={house.color}
                  strokeWidth="3.5"
                  strokeDasharray={GAUGE_CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 26 26)"
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 6px ${house.color}88)`,
                  }}
                />
              </svg>

              {/* Center Mastery Percentage */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[11px] font-mono font-bold text-white tracking-tight">
                  {house.progress}%
                </span>
              </div>
            </div>

            {/* House Information & Tech Stack */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <house.icon
                  className="size-3.5 shrink-0"
                  style={{ color: house.color }}
                />
                <span className="text-xs font-semibold text-white/90 truncate">
                  {house.name}
                </span>
              </div>
              <div className="text-[10px] font-mono text-white/50 tracking-wide mb-1 truncate">
                {house.domain}
              </div>
              <div className="text-[10px] font-mono text-white/70 truncate">
                {house.tech}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
