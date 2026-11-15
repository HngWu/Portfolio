"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface MiniAstrolabeGraphicProps {
  activeStarId?: string | null
  onHoverStar?: (id: string | null) => void
  className?: string
  mode?: "quick" | "deep"
}

interface ConstellationStar {
  id: string
  label: string
  house: string
  color: string
  x: number
  y: number
  labelPos: {
    x: number
    y: number
    anchor: "start" | "middle" | "end"
  }
}

const STARS: ConstellationStar[] = [
  {
    id: "core-cs",
    label: "Core CS",
    house: "House of Transmutation",
    color: "#4AFFB4",
    x: 48,
    y: 80,
    labelPos: { x: 48, y: 98, anchor: "middle" },
  },
  {
    id: "web-architecture",
    label: "Web Arch",
    house: "House of Thaumaturgy",
    color: "#4A8FFF",
    x: 104,
    y: 40,
    labelPos: { x: 104, y: 25, anchor: "middle" },
  },
  {
    id: "enterprise-backend",
    label: "Enterprise",
    house: "House of Alchemy",
    color: "#FFD95A",
    x: 108,
    y: 120,
    labelPos: { x: 108, y: 138, anchor: "middle" },
  },
  {
    id: "creative-tech",
    label: "Creative 3D",
    house: "House of Thaumaturgy",
    color: "#4A8FFF",
    x: 216,
    y: 40,
    labelPos: { x: 216, y: 25, anchor: "middle" },
  },
  {
    id: "cloud-devops",
    label: "Cloud DevOps",
    house: "House of Alchemy",
    color: "#FFD95A",
    x: 212,
    y: 120,
    labelPos: { x: 212, y: 138, anchor: "middle" },
  },
  {
    id: "distributed-systems",
    label: "Distributed",
    house: "House of Divination",
    color: "#FF4A8F",
    x: 272,
    y: 80,
    labelPos: { x: 272, y: 98, anchor: "middle" },
  },
]

const STARS_MAP = STARS.reduce<Record<string, ConstellationStar>>((acc, s) => {
  acc[s.id] = s
  return acc
}, {})

const EDGES = [
  { from: "core-cs", to: "web-architecture" },
  { from: "core-cs", to: "enterprise-backend" },
  { from: "web-architecture", to: "creative-tech" },
  { from: "enterprise-backend", to: "cloud-devops" },
  { from: "enterprise-backend", to: "distributed-systems" },
  { from: "cloud-devops", to: "distributed-systems" },
  { from: "creative-tech", to: "distributed-systems" },
]

// 36 Astrolabe graduation tick marks around the perimeter (every 10 deg)
const BRASS_TICKS = Array.from({ length: 36 }).map((_, i) => {
  const deg = i * 10
  const rad = (deg * Math.PI) / 180
  const isMajor = deg % 30 === 0
  const rIn = isMajor ? 60 : 62.5
  const rOut = 66
  return {
    deg,
    x1: 160 + rIn * Math.cos(rad),
    y1: 80 + rIn * Math.sin(rad),
    x2: 160 + rOut * Math.cos(rad),
    y2: 80 + rOut * Math.sin(rad),
    isMajor,
  }
})

// Soft background celestial stardust
const STARDUST = [
  { x: 30, y: 30, r: 0.8 },
  { x: 72, y: 142, r: 0.7 },
  { x: 135, y: 18, r: 0.9 },
  { x: 160, y: 150, r: 0.8 },
  { x: 185, y: 18, r: 0.8 },
  { x: 248, y: 144, r: 0.7 },
  { x: 290, y: 32, r: 0.9 },
  { x: 296, y: 126, r: 0.8 },
]

export function MiniAstrolabeGraphic({
  activeStarId,
  onHoverStar,
  className,
  mode = "quick",
}: MiniAstrolabeGraphicProps) {
  const isTech = mode === "deep"

  const brassColor = isTech ? "#38BDF8" : "#E5B869"
  const brassSubtle = isTech ? "#0284C7" : "#E5B869"
  const stardustColor = isTech ? "#6AFFFF" : "#FFF3B0"
  const pointerColor = isTech ? "#6AFFFF" : "#E5B869"
  const pivotBg = isTech ? "#071326" : "#151226"
  const pivotDot = isTech ? "#6AFFFF" : "#4AFFB4"

  return (
    <div
      className={cn(
        "relative w-full h-28 sm:h-30 md:h-32 rounded-xl border overflow-hidden flex items-center justify-center select-none group/astrolabe transition-colors duration-300",
        isTech ? "bg-sky-950/[0.08] border-sky-500/15" : "bg-white/[0.02] border-white/5",
        className
      )}
    >
      <svg
        viewBox="0 0 320 160"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full max-h-full"
        role="region"
        aria-label="Celestial Astrolabe Interactive Constellation"
      >
        <defs>
          {/* Radial Center Glow */}
          <radialGradient id={isTech ? "astrolabe-tech-glow" : "astrolabe-center-glow"} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isTech ? "#38BDF8" : "#4A8FFF"} stopOpacity={isTech ? "0.18" : "0.12"} />
            <stop offset="60%" stopColor={isTech ? "#0284C7" : "#FFD95A"} stopOpacity="0.04" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Star Bloom Glow Filter */}
          <filter id="astrolabe-bloom" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Filament Line Glow Filter */}
          <filter id="astrolabe-filament-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Backdrop: Radial Stardust & Coordinate Crosshairs */}
        <rect x="0" y="0" width="320" height="160" fill={`url(#${isTech ? "astrolabe-tech-glow" : "astrolabe-center-glow"})`} />

        {/* Subtle Coordinate Crosshairs */}
        <line
          x1="24"
          y1="80"
          x2="296"
          y2="80"
          stroke={brassColor}
          strokeWidth="0.5"
          strokeDasharray={isTech ? "4 4" : "2 4"}
          opacity={isTech ? "0.26" : "0.18"}
        />
        <line
          x1="160"
          y1="12"
          x2="160"
          y2="148"
          stroke={brassColor}
          strokeWidth="0.5"
          strokeDasharray={isTech ? "4 4" : "2 4"}
          opacity={isTech ? "0.26" : "0.18"}
        />

        {/* Tech Mode Telemetry Corner Brackets */}
        {isTech && (
          <g opacity="0.35" stroke="#38BDF8" strokeWidth="0.8" fill="none">
            <path d="M 14 20 L 14 14 L 20 14" />
            <path d="M 306 20 L 306 14 L 300 14" />
            <path d="M 14 140 L 14 146 L 20 146" />
            <path d="M 306 140 L 306 146 L 300 146" />
          </g>
        )}

        {/* Ambient Stardust Points */}
        {STARDUST.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={dot.r}
            fill={stardustColor}
            opacity={isTech ? "0.4" : "0.3"}
          />
        ))}

        {/* --- Outer Graduation Circle & Ticks (cx: 160, cy: 80) --- */}
        <circle
          cx="160"
          cy="80"
          r="66"
          fill="none"
          stroke={brassColor}
          strokeWidth="1.2"
          opacity={isTech ? 0.6 : 0.45}
        />
        <circle
          cx="160"
          cy="80"
          r="59"
          fill="none"
          stroke={brassColor}
          strokeWidth="0.75"
          strokeDasharray="1 3"
          opacity={isTech ? 0.45 : 0.3}
        />

        {/* Graduation Tick Marks */}
        {BRASS_TICKS.map((t) => (
          <line
            key={t.deg}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.isMajor && isTech ? "#6AFFFF" : brassColor}
            strokeWidth={t.isMajor ? "1.2" : "0.75"}
            opacity={t.isMajor ? (isTech ? 0.8 : 0.65) : (isTech ? 0.5 : 0.4)}
          />
        ))}

        {/* --- Concentric Counter-Rotating Reticle Rings --- */}
        {/* Center of rotation wrapped at cx=160, cy=80 for cross-browser stability */}
        <g transform="translate(160, 80)">
          {/* Ring 1: Clockwise Outer Reticle (32s infinite) */}
          <g
            className="animate-astrolabe-orbit-cw motion-reduce:animate-none"
            style={{ transformOrigin: "0 0", transformBox: "view-box" }}
          >
            <circle
              r="50"
              fill="none"
              stroke={brassColor}
              strokeWidth="1"
              strokeDasharray="4 6"
              opacity={isTech ? 0.55 : 0.45}
            />
            {/* 4 Quadrant pointers on outer rotating reticle */}
            <polygon points="0,-50 -3,-44 3,-44" fill={pointerColor} opacity={isTech ? 0.85 : 0.65} />
            <polygon points="50,0 44,-3 44,3" fill={pointerColor} opacity={isTech ? 0.85 : 0.65} />
            <polygon points="0,50 -3,44 3,44" fill={pointerColor} opacity={isTech ? 0.85 : 0.65} />
            <polygon points="-50,0 -44,-3 -44,3" fill={pointerColor} opacity={isTech ? 0.85 : 0.65} />
            {/* Ethereal decan circle */}
            <circle
              r="46"
              fill="none"
              stroke={brassSubtle}
              strokeWidth="0.5"
              strokeDasharray="12 4 4 4"
              opacity={0.3}
            />
          </g>

          {/* Ring 2: Counter-Clockwise Inner Reticle (24s infinite) */}
          <g
            className="animate-astrolabe-orbit-ccw motion-reduce:animate-none"
            style={{ transformOrigin: "0 0", transformBox: "view-box" }}
          >
            <circle
              r="34"
              fill="none"
              stroke={brassColor}
              strokeWidth="0.8"
              strokeDasharray="6 3"
              opacity={isTech ? 0.55 : 0.4}
            />
            <circle
              r="22"
              fill="none"
              stroke={isTech ? "#6AFFFF" : "#4A8FFF"}
              strokeWidth="0.75"
              strokeDasharray="3 3"
              opacity={isTech ? 0.6 : 0.45}
            />
            {/* Inner rete sighting crosshair */}
            <line x1="-34" y1="0" x2="34" y2="0" stroke={brassColor} strokeWidth="0.75" opacity={isTech ? 0.5 : 0.35} />
            <line x1="0" y1="-34" x2="0" y2="34" stroke={brassColor} strokeWidth="0.75" opacity={isTech ? 0.5 : 0.35} />
          </g>

          {/* Center Axle / Sighting Pivot (Static) */}
          <circle r="5" fill={pivotBg} stroke={brassColor} strokeWidth="1.2" opacity="0.9" />
          <circle
            r="2"
            fill={pivotDot}
            opacity="0.95"
            style={{ filter: `drop-shadow(0 0 3px ${pivotDot})` }}
          />
        </g>

        {/* --- Filament Lines Between Stars --- */}
        {EDGES.map((edge, idx) => {
          const fromStar = STARS_MAP[edge.from]
          const toStar = STARS_MAP[edge.to]
          if (!fromStar || !toStar) return null

          const isEdgeActive =
            activeStarId === edge.from || activeStarId === edge.to
          const activeColor =
            fromStar.id === activeStarId ? fromStar.color : toStar.color

          return (
            <line
              key={idx}
              x1={fromStar.x}
              y1={fromStar.y}
              x2={toStar.x}
              y2={toStar.y}
              stroke={isEdgeActive ? activeColor : brassColor}
              strokeWidth={isEdgeActive ? 2 : 1.2}
              strokeDasharray={isEdgeActive ? "none" : "3 3"}
              opacity={isEdgeActive ? 0.95 : (isTech ? 0.4 : 0.3)}
              filter={isEdgeActive ? "url(#astrolabe-filament-glow)" : undefined}
              className={cn(
                "transition-all duration-300",
                isEdgeActive && "animate-pulse"
              )}
            />
          )
        })}

        {/* --- 6 Constellation Stars --- */}
        {STARS.map((star) => {
          const isHovered = activeStarId === star.id

          return (
            <g key={star.id} className="transition-transform duration-300">
              {/* Blooming Halo when hovered or active */}
              {isHovered ? (
                <>
                  <circle
                    cx={star.x}
                    cy={star.y}
                    r={14}
                    fill={star.color}
                    opacity={0.35}
                    filter="url(#astrolabe-bloom)"
                    className="animate-pulse"
                  />
                  <circle
                    cx={star.x}
                    cy={star.y}
                    r={8}
                    fill="none"
                    stroke={star.color}
                    strokeWidth={1.5}
                    opacity={0.9}
                  />
                  <circle
                    cx={star.x}
                    cy={star.y}
                    r={4.5}
                    fill="#FFFFFF"
                    stroke={star.color}
                    strokeWidth={2}
                    style={{ filter: `drop-shadow(0 0 8px ${star.color})` }}
                  />
                </>
              ) : (
                <>
                  <circle
                    cx={star.x}
                    cy={star.y}
                    r={7}
                    fill={star.color}
                    opacity={0.2}
                  />
                  <circle
                    cx={star.x}
                    cy={star.y}
                    r={3.5}
                    fill={star.color}
                    stroke="#FFFFFF"
                    strokeWidth={0.8}
                    opacity={0.9}
                    style={{ filter: `drop-shadow(0 0 4px ${star.color})` }}
                  />
                </>
              )}

              {/* Star Label */}
              <text
                x={star.labelPos.x}
                y={star.labelPos.y}
                textAnchor={star.labelPos.anchor}
                className={cn(
                  "text-[8px] font-mono transition-all duration-300 pointer-events-none select-none",
                  isHovered ? "fill-white font-semibold" : "fill-white/45"
                )}
              >
                {star.label}
              </text>

              {/* Tactile Hit Circle with Full Keyboard & Focus Accessibility */}
              <circle
                cx={star.x}
                cy={star.y}
                r={16}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${star.label} (${star.house})`}
                className="cursor-pointer outline-none focus-visible:stroke-white focus-visible:stroke-1"
                onMouseEnter={() => {
                  onHoverStar?.(star.id)
                }}
                onMouseLeave={() => onHoverStar?.(null)}
                onFocus={() => {
                  onHoverStar?.(star.id)
                }}
                onBlur={() => onHoverStar?.(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onHoverStar?.(star.id)
                  }
                }}
              >
                <title>{`${star.label} (${star.house})`}</title>
              </circle>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
