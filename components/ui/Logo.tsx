import * as React from "react"

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
}

export function Logo({ size, className = "size-5", ...props }: LogoProps) {
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
          id="hexprism-core-glow"
          cx="12"
          cy="12"
          r="6"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="var(--lume-primary, #4AFFB4)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--lume-primary, #4AFFB4)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Top Facet: Specular Glass Reflection */}
      <path
        data-facet="top"
        d="M12 2 L21 7 L12 12 L3 7 Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-colors duration-300"
      />

      {/* Left Facet: Obsidian Glass Shade */}
      <path
        data-facet="left"
        d="M3 7 L12 12 L12 22 L3 17 Z"
        fill="currentColor"
        fillOpacity="0.05"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-colors duration-300"
      />

      {/* Right Facet: Dynamic View-Mode Accent Wash */}
      <path
        data-facet="right"
        d="M12 12 L21 7 L21 17 L12 22 Z"
        fill="var(--mode-accent, #4AFFB4)"
        fillOpacity="0.16"
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
        strokeOpacity="0.5"
        className="group-hover:stroke-lume-primary transition-colors duration-300"
      />

      {/* Central Illuminated Nexus Seed */}
      <path
        data-facet="nexus"
        d="M12 9.5 L14.5 12 L12 14.5 L9.5 12 Z"
        fill="var(--lume-primary, #4AFFB4)"
        fillOpacity="0.65"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="group-hover:fill-lume-primary group-hover:fill-opacity-100 transition-all duration-300"
      />
    </svg>
  )
}
