"use client"

import * as React from "react"
import { useViewModeStore } from "@/store/useViewModeStore"

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
  mode?: "quick" | "deep"
  isHovered?: boolean
}

export function Logo({ size, className = "size-5", mode: propMode, isHovered = false, ...props }: LogoProps) {
  const storeMode = useViewModeStore((state) => state.mode)
  const mode = propMode ?? (typeof useViewModeStore?.getState === "function" ? useViewModeStore.getState().mode : storeMode) ?? "quick"
  const isDeep = mode === "deep"

  const coreGlowColor = isDeep ? "#6AFFFF" : "#FFB44A"

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={`transition-colors duration-300 ${className}`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <radialGradient
          id={`hexprism-core-glow-${isDeep ? "deep" : "quick"}`}
          cx="12"
          cy="12"
          r="6"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={coreGlowColor} stopOpacity={isHovered ? "0.95" : "0.75"} />
          <stop offset="50%" stopColor={coreGlowColor} stopOpacity={isHovered ? "0.4" : "0.2"} />
          <stop offset="100%" stopColor={coreGlowColor} stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id={`energy-facet-grad-${isDeep ? "deep" : "quick"}`}
          x1="12"
          y1="12"
          x2="21"
          y2="17"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={isDeep ? "#6AFFFF" : "#FFD280"} stopOpacity={isHovered ? "0.45" : "0.3"} />
          <stop offset="100%" stopColor={isDeep ? "#4A8FFF" : "#FFB44A"} stopOpacity={isHovered ? "0.3" : "0.15"} />
        </linearGradient>
      </defs>

      {/* Top Facet: Specular Glass Reflection */}
      <path
        data-facet="top"
        d="M12 2 L21 7 L12 12 L3 7 Z"
        fill="currentColor"
        fillOpacity={isHovered ? "0.28" : "0.18"}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />

      {/* Left Facet: Obsidian Glass Shade */}
      <path
        data-facet="left"
        d="M3 7 L12 12 L12 22 L3 17 Z"
        fill="currentColor"
        fillOpacity="0.06"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />

      {/* Right Facet: Dynamic View-Mode Accent Wash */}
      <path
        data-facet="right"
        d="M12 12 L21 7 L21 17 L12 22 Z"
        fill="var(--mode-accent, #4AFFB4)"
        fillOpacity={isHovered ? "0.32" : "0.18"}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />

      {/* Inner Chamfer Seam Radiations */}
      <path
        d="M12 12L12 2M12 12L3 7M12 12L21 7M12 12L12 22M12 12L3 17M12 12L21 17"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={isHovered ? "0.8" : "0.5"}
        className="group-hover:stroke-lume-primary transition-colors duration-300"
      />

      {/* Ambient Core Halo */}
      <circle
        cx="12"
        cy="12"
        r={isHovered ? "5.5" : "4"}
        fill={`url(#hexprism-core-glow-${isDeep ? "deep" : "quick"})`}
        className="transition-all duration-300 pointer-events-none"
      />

      {/* Central Illuminated Nexus Seed */}
      <path
        data-facet="nexus"
        d="M12 9.5 L14.5 12 L12 14.5 L9.5 12 Z"
        fill={coreGlowColor}
        fillOpacity={isHovered ? "1" : "0.85"}
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />
    </svg>
  )
}
