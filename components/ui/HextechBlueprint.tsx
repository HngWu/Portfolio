"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface HextechBlueprintProps {
  className?: string
}

// Precomputed 36 degree ticks around the vernier ring (center 200, 200)
const DEG_TICKS = Array.from({ length: 36 }).map((_, i) => {
  const deg = i * 10
  const isMajor = i % 3 === 0
  const rad = (deg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const rInner = isMajor ? 172 : 177
  const rOuter = isMajor ? 188 : 183
  return {
    key: i,
    x1: +(200 + rInner * cos).toFixed(2),
    y1: +(200 + rInner * sin).toFixed(2),
    x2: +(200 + rOuter * cos).toFixed(2),
    y2: +(200 + rOuter * sin).toFixed(2),
    stroke: isMajor ? "#6AFFFF" : "#2563EB",
    strokeWidth: isMajor ? "1.2" : "0.75",
    opacity: isMajor ? 0.9 : 0.6,
  }
})

// Hexagon vertices at 30, 90, 150, 210, 270, 330 degrees
function computeHexVertices(r: number) {
  return [30, 90, 150, 210, 270, 330].map((deg) => {
    const rad = (deg * Math.PI) / 180
    return {
      x: +(200 + r * Math.cos(rad)).toFixed(2),
      y: +(200 + r * Math.sin(rad)).toFixed(2),
    }
  })
}

const HEX_OUTER = computeHexVertices(80)
const HEX_MID = computeHexVertices(54)
const HEX_INNER = computeHexVertices(32)

const HEX_OUTER_POINTS = HEX_OUTER.map((v) => `${v.x},${v.y}`).join(" ")
const HEX_MID_POINTS = HEX_MID.map((v) => `${v.x},${v.y}`).join(" ")
const HEX_INNER_POINTS = HEX_INNER.map((v) => `${v.x},${v.y}`).join(" ")

export function HextechBlueprint({ className }: HextechBlueprintProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden",
        "opacity-0 transition-opacity duration-700 group-hover:opacity-[0.06]",
        className
      )}
    >
      <svg
        viewBox="0 0 400 400"
        className="size-[340px] sm:size-[420px] max-w-none shrink-0 animate-blueprint-spin transform-gpu will-change-transform origin-center motion-reduce:animate-none select-none"
        fill="none"
        aria-hidden="true"
      >
        {/* Outer Vernier Calibration Ring */}
        <circle
          cx="200"
          cy="200"
          r="190"
          stroke="#6AFFFF"
          strokeWidth="0.75"
          strokeDasharray="3 6"
          opacity="0.35"
        />
        <circle
          cx="200"
          cy="200"
          r="184"
          stroke="#2563EB"
          strokeWidth="1"
          strokeDasharray="14 4 2 4"
          opacity="0.8"
        />
        <circle
          cx="200"
          cy="200"
          r="174"
          stroke="#6AFFFF"
          strokeWidth="0.75"
          opacity="0.7"
        />
        <circle
          cx="200"
          cy="200"
          r="166"
          stroke="#2563EB"
          strokeWidth="0.5"
          strokeDasharray="2 4"
          opacity="0.5"
        />

        {/* Vernier Degree Calibration Ticks */}
        {DEG_TICKS.map((t) => (
          <line
            key={t.key}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.stroke}
            strokeWidth={t.strokeWidth}
            opacity={t.opacity}
          />
        ))}

        {/* Arcane Runic Containment Circle */}
        <circle
          cx="200"
          cy="200"
          r="140"
          stroke="#2563EB"
          strokeWidth="1.2"
          opacity="0.75"
        />
        <circle
          cx="200"
          cy="200"
          r="134"
          stroke="#6AFFFF"
          strokeWidth="0.5"
          strokeDasharray="4 4"
          opacity="0.6"
        />
        <circle
          cx="200"
          cy="200"
          r="120"
          stroke="#2563EB"
          strokeWidth="1.5"
          opacity="0.8"
        />
        <circle
          cx="200"
          cy="200"
          r="114"
          stroke="#6AFFFF"
          strokeWidth="0.75"
          strokeDasharray="8 6"
          opacity="0.7"
        />

        {/* Interlocking Arcane Geometry (Hexagram Containment Matrix) */}
        <polygon
          points="200,86 298.73,257 101.27,257"
          stroke="#2563EB"
          strokeWidth="1"
          strokeDasharray="6 3"
          opacity="0.65"
          fill="none"
        />
        <polygon
          points="200,314 298.73,143 101.27,143"
          stroke="#6AFFFF"
          strokeWidth="0.75"
          strokeDasharray="6 3"
          opacity="0.55"
          fill="none"
        />

        {/* Precision Crosshair Calipers & Guide Lines */}
        <line
          x1="12"
          y1="200"
          x2="388"
          y2="200"
          stroke="#6AFFFF"
          strokeWidth="0.75"
          strokeDasharray="4 6"
          opacity="0.6"
        />
        <line
          x1="200"
          y1="12"
          x2="200"
          y2="388"
          stroke="#6AFFFF"
          strokeWidth="0.75"
          strokeDasharray="4 6"
          opacity="0.6"
        />
        <line
          x1="65"
          y1="65"
          x2="335"
          y2="335"
          stroke="#2563EB"
          strokeWidth="0.5"
          strokeDasharray="3 6"
          opacity="0.4"
        />
        <line
          x1="335"
          y1="65"
          x2="65"
          y2="335"
          stroke="#2563EB"
          strokeWidth="0.5"
          strokeDasharray="3 6"
          opacity="0.4"
        />

        {/* Caliper Measurement Brackets & Nodes */}
        <line x1="194" y1="12" x2="206" y2="12" stroke="#F97316" strokeWidth="1.5" />
        <circle cx="200" cy="12" r="1.5" fill="#6AFFFF" />

        <line x1="194" y1="388" x2="206" y2="388" stroke="#F97316" strokeWidth="1.5" />
        <circle cx="200" cy="388" r="1.5" fill="#6AFFFF" />

        <line x1="12" y1="194" x2="12" y2="206" stroke="#F97316" strokeWidth="1.5" />
        <circle cx="12" cy="200" r="1.5" fill="#6AFFFF" />

        <line x1="388" y1="194" x2="388" y2="206" stroke="#F97316" strokeWidth="1.5" />
        <circle cx="388" cy="200" r="1.5" fill="#6AFFFF" />

        {/* Central Hex-Gem Prism Matrix with Laser-Brass Accents */}
        <polygon
          points={HEX_OUTER_POINTS}
          stroke="#2563EB"
          strokeWidth="1.2"
          opacity="0.8"
          fill="none"
        />
        <polygon
          points={HEX_MID_POINTS}
          stroke="#F97316"
          strokeWidth="1.5"
          strokeDasharray="6 3"
          opacity="0.85"
          fill="none"
        />
        <polygon
          points={HEX_INNER_POINTS}
          stroke="#F97316"
          strokeWidth="1"
          opacity="0.9"
          fill="none"
        />

        {/* Prism Facet Spoke Lines from Center to Outer Vertices */}
        {HEX_OUTER.map((v, i) => (
          <line
            key={`spoke-${i}`}
            x1="200"
            y1="200"
            x2={v.x}
            y2={v.y}
            stroke="#F97316"
            strokeWidth="0.75"
            opacity="0.75"
          />
        ))}

        {/* Laser-Brass Accents: Diamond Crystals at Middle Hexagon Vertices */}
        {HEX_MID.map((v, i) => (
          <polygon
            key={`diamond-${i}`}
            points={`${v.x},${v.y - 3} ${v.x + 3},${v.y} ${v.x},${v.y + 3} ${v.x - 3},${v.y}`}
            fill="#F97316"
          />
        ))}

        {/* Central Hex-Gem Prism Core */}
        <polygon
          points="200,192 206.9,196 206.9,204 200,208 193.1,204 193.1,196"
          fill="#F97316"
          stroke="#6AFFFF"
          strokeWidth="0.5"
        />
        <circle cx="200" cy="200" r="1.5" fill="#6AFFFF" />
      </svg>
    </div>
  )
}
