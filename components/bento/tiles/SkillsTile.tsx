"use client"

import * as React from "react"
import { BentoTile } from "../BentoTile"
import { cn, getTypographyClasses } from "@/lib/utils"
import { ForceMobileContext } from "../ForceMobileContext"
import { Cpu, ArrowUpRight, CheckCircle2 } from "lucide-react"
import type { SkillContent } from "@/lib/tiles/schemas"

interface SkillsTileProps {
  id: string
  size: string
  content: SkillContent
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

export function SkillsTile({ id, size, content, isDragging, sortableProps }: SkillsTileProps) {
  const forceMobile = React.useContext(ForceMobileContext)
  const typo = getTypographyClasses(size, false, forceMobile)
  const deepTypo = getTypographyClasses(size, true, forceMobile)

  const tags = content?.tags || [
    "Java",
    "Spring Boot",
    "Next.js 16",
    "TypeScript",
    "MariaDB",
    "OpenShift",
    "Three.js",
    "GSAP",
  ]

  const masteryDomains = [
    {
      label: "Full-Stack Architecture",
      progress: 95,
      color: "#4AFFB4",
      tech: "Next.js 16 · TS · React 19",
    },
    {
      label: "Enterprise Systems",
      progress: 90,
      color: "#4A8FFF",
      tech: "Spring Boot · MariaDB · OpenShift",
    },
    {
      label: "Creative Tech & 3D",
      progress: 85,
      color: "#C9A227",
      tech: "Three.js · GLSL · GSAP",
    },
    {
      label: "Distributed Systems",
      progress: 80,
      color: "#FF4A8F",
      tech: "Go · Raft · gRPC · Redis",
    },
  ]

  return (
    <BentoTile
      id={id}
      size={size}
      href="/skills"
      glowColor="blue"
      isDragging={isDragging}
      sortableProps={sortableProps}
      canDeepDive={true}
      canMorph={true}
      deepContent={
        /* Deep Dive: Domain Mastery Matrix & Tech Tree Launcher */
        <div className="flex flex-col justify-between h-full w-full">
          <div>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className={cn(deepTypo.meta, "text-white/40 uppercase tracking-widest")}>
                Mastery Matrix
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="size-3" />
                <span>8 / 10 Unlocked</span>
              </div>
            </div>

            <div className="space-y-3.5">
              {masteryDomains.map((domain) => (
                <div key={domain.label} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-white/80 font-medium">{domain.label}</span>
                    <span className="text-white/40">{domain.progress}%</span>
                  </div>
                  {/* Animated Mastery Progress Bar */}
                  <div className="relative w-full h-1.5 rounded-full bg-white/5">
                    <div
                      className="relative h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${domain.progress}%`,
                        background: "linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)",
                        boxShadow: "0 0 10px rgba(106, 255, 255, 0.4)",
                      }}
                    >
                      {/* Glowing laser-orange diamond crystal pin anchored at leading edge */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex items-center justify-center pointer-events-none z-10">
                        <svg
                          width="8"
                          height="8"
                          viewBox="0 0 8 8"
                          fill="#F97316"
                          className="overflow-visible"
                          style={{ filter: "drop-shadow(0 0 8px #F97316)" }}
                          aria-hidden="true"
                        >
                          <polygon points="4,0 8,4 4,8 0,4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-white/40 truncate">
                    {domain.tech}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-lume-primary group-hover:underline">
            <span>Launch Interactive Skill Tree</span>
            <ArrowUpRight className="size-4" />
          </div>
        </div>
      }
    >
      {/* Quick-Pitch: Header + Mini Constellation Preview + Badges */}
      <div className="flex flex-col justify-between h-full w-full">
        <div>
          <div className="flex items-center justify-between mb-3 select-none">
            <div className={cn(typo.meta, "text-white/30 uppercase tracking-widest")}>
              Skills & Architecture
            </div>
            <Cpu className={cn(typo.icon, "text-[#4A8FFF]/60")} />
          </div>

          {/* Mini-Constellation SVG Graphic */}
          <div className="w-full h-14 mb-3 rounded-lg bg-white/[0.02] border border-white/5 relative overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 280 60" aria-hidden="true" className="w-full h-full opacity-75 transition-opacity duration-500 group-hover:opacity-100">
              <defs>
                {/* Amber-Gold Filament Glow Filter */}
                <filter id="constellation-amber-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                  <feFlood floodColor="#FFD95A" floodOpacity="0.7" result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Intense Amber Node Core Glow Filter */}
                <filter id="node-amber-glow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
                  <feFlood floodColor="#FFD95A" floodOpacity="0.85" result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Subtle Linear Gradient for Breathing Filaments */}
                <linearGradient id="amber-filament-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#E8A838" stopOpacity="0.7" />
                  <stop offset="50%" stopColor="#FFD95A" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#E8A838" stopOpacity="0.7" />
                </linearGradient>
              </defs>

              {/* Organic Breathing Filament Lines */}
              <line
                x1="40"
                y1="30"
                x2="110"
                y2="18"
                stroke="#FFD95A"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.7"
                filter="url(#constellation-amber-glow)"
                className="animate-pulse transition-all duration-500 group-hover:opacity-100"
              />
              <line
                x1="40"
                y1="30"
                x2="110"
                y2="42"
                stroke="#E8A838"
                strokeWidth="1.5"
                opacity="0.5"
                className="transition-all duration-500 group-hover:opacity-85 group-hover:stroke-[#FFD95A]"
              />
              <line
                x1="110"
                y1="18"
                x2="190"
                y2="24"
                stroke="url(#amber-filament-grad)"
                strokeWidth="1.5"
                opacity="0.65"
                filter="url(#constellation-amber-glow)"
                className="animate-pulse transition-all duration-500 group-hover:opacity-100"
                style={{ animationDuration: "3s" }}
              />
              <line
                x1="110"
                y1="42"
                x2="190"
                y2="38"
                stroke="#E8A838"
                strokeWidth="1.5"
                opacity="0.5"
                className="transition-all duration-500 group-hover:opacity-85"
              />
              <line
                x1="190"
                y1="24"
                x2="250"
                y2="30"
                stroke="#FFD95A"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.7"
                filter="url(#constellation-amber-glow)"
                className="animate-pulse transition-all duration-500 group-hover:opacity-100"
                style={{ animationDuration: "2.4s" }}
              />
              <line
                x1="190"
                y1="38"
                x2="250"
                y2="30"
                stroke="#E8A838"
                strokeWidth="1.5"
                opacity="0.5"
                className="transition-all duration-500 group-hover:opacity-85 group-hover:stroke-[#FFD95A]"
              />

              {/* Glowing Amber-Gold Constellation Node Circles */}
              <circle
                cx="40"
                cy="30"
                r="4"
                fill="#FFD95A"
                filter="url(#node-amber-glow)"
                className="transition-all duration-500 drop-shadow-[0_0_6px_#FFD95A] group-hover:drop-shadow-[0_0_12px_#FFD95A] group-hover:fill-[#FFF3B0]"
              />
              <circle
                cx="110"
                cy="18"
                r="4.5"
                fill="#FFD95A"
                filter="url(#node-amber-glow)"
                className="transition-all duration-500 drop-shadow-[0_0_8px_#FFD95A] group-hover:drop-shadow-[0_0_14px_#FFD95A] group-hover:fill-[#FFF3B0]"
              />
              <circle
                cx="110"
                cy="42"
                r="3.5"
                fill="#E8A838"
                filter="url(#constellation-amber-glow)"
                className="transition-all duration-500 drop-shadow-[0_0_4px_#E8A838] group-hover:drop-shadow-[0_0_10px_#FFD95A] group-hover:fill-[#FFD95A]"
              />
              <circle
                cx="190"
                cy="24"
                r="4"
                fill="#FFD95A"
                filter="url(#node-amber-glow)"
                className="transition-all duration-500 drop-shadow-[0_0_6px_#FFD95A] group-hover:drop-shadow-[0_0_12px_#FFD95A] group-hover:fill-[#FFF3B0]"
              />
              <circle
                cx="190"
                cy="38"
                r="3.5"
                fill="#E8A838"
                filter="url(#constellation-amber-glow)"
                className="transition-all duration-500 drop-shadow-[0_0_4px_#E8A838] group-hover:drop-shadow-[0_0_10px_#FFD95A] group-hover:fill-[#FFD95A]"
              />
              <circle
                cx="250"
                cy="30"
                r="4.5"
                fill="#FFD95A"
                filter="url(#node-amber-glow)"
                className="transition-all duration-500 drop-shadow-[0_0_8px_#FFD95A] group-hover:drop-shadow-[0_0_14px_#FFD95A] group-hover:fill-[#FFF3B0]"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none text-[9px] font-mono text-white/30 uppercase tracking-widest">
              <span>Foundations</span>
              <span>Talent Tree</span>
              <span>Specializations</span>
            </div>
          </div>

          {/* Skill Tag Badges */}
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 7).map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-medium tracking-wide bg-white/5 border border-white/10 text-white/80 hover:border-lume-primary/40 transition-colors"
              >
                {tag}
              </span>
            ))}
            {tags.length > 7 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-mono text-white/40 bg-white/[0.02] border border-white/5">
                +{tags.length - 7} more
              </span>
            )}
          </div>
        </div>

        {/* Bottom CTA Indicator */}
        <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-white/40">
          <span>INTERACTIVE GRAPH</span>
          <span className="text-lume-primary group-hover:underline">Explore Tree →</span>
        </div>
      </div>
    </BentoTile>
  )
}
