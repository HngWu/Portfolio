"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useViewModeStore } from "@/store/useViewModeStore"
import { ArcaneEmbers } from "./ArcaneEmbers"
import { HextechBlueprint } from "./HextechBlueprint"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: "mint" | "blue" | "pink" | "amber" | "none"
  interactive?: boolean
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      glowColor = "none",
      interactive = true,
      children,
      onMouseEnter,
      onMouseMove,
      onMouseLeave,
      style,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const localRef = React.useRef<HTMLDivElement | null>(null)
    const rafRef = React.useRef<number | null>(null)
    const mousePosRef = React.useRef<{ x: number; y: number } | null>(null)

    const mode = useViewModeStore((state) => state.mode)

    React.useEffect(() => {
      return () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = null
        }
      }
    }, [])

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        localRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = node
        }
      },
      [ref]
    )

    const updateMouseCoordinates = (clientX: number, clientY: number) => {
      if (!interactive || !localRef.current) return

      const rect = localRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      mousePosRef.current = { x, y }

      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          if (localRef.current && mousePosRef.current) {
            localRef.current.style.setProperty("--mouse-x", `${mousePosRef.current.x}px`)
            localRef.current.style.setProperty("--mouse-y", `${mousePosRef.current.y}px`)
          }
          rafRef.current = null
        })
      }
    }

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(true)
      if (interactive && localRef.current) {
        const rect = localRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        localRef.current.style.setProperty("--mouse-x", `${x}px`)
        localRef.current.style.setProperty("--mouse-y", `${y}px`)
      }
      onMouseEnter?.(e)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      updateMouseCoordinates(e.clientX, e.clientY)
      onMouseMove?.(e)
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(false)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      onMouseLeave?.(e)
    }

    const glowClasses = {
      mint: "hover:border-[rgba(74,255,180,0.3)] shadow-[0_0_40px_rgba(74,255,180,0.05)]",
      blue: "hover:border-[rgba(74,143,255,0.3)] shadow-[0_0_40px_rgba(74,143,255,0.05)]",
      pink: "hover:border-[rgba(255,74,143,0.3)] shadow-[0_0_40px_rgba(255,74,143,0.05)]",
      amber: "hover:border-[rgba(255,180,74,0.3)] shadow-[0_0_40px_rgba(255,180,74,0.05)]",
      none: "hover:border-white/10",
    }

    const accentColor = {
      mint: "rgba(74,255,180,0.15)",
      blue: "rgba(74,143,255,0.15)",
      pink: "rgba(255,74,143,0.15)",
      amber: "rgba(255,180,74,0.15)",
      none: "rgba(255,255,255,0.05)",
    }

    return (
      <div
        ref={setRefs}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative group bg-[var(--glass-fill,rgba(255,255,255,0.03))] backdrop-blur-xl rounded-2xl border border-[var(--glass-border,rgba(255,255,255,0.08))] overflow-hidden",
          "shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]",
          "transition-all duration-500",
          glowClasses[glowColor],
          className
        )}
        style={style}
        {...props}
      >
        {/* Base Noise/Grain Texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay bg-[url('/assets/noise.svg')]"
        />

        {/* Dynamic Interactive Glow */}
        {interactive && (
          <div
            aria-hidden="true"
            style={{
              left: "var(--mouse-x, 50%)",
              top: "var(--mouse-y, 50%)",
              background: `radial-gradient(circle at center, ${accentColor[glowColor]}, transparent 70%)`,
            }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Animated Liquid Blobs */}
        {isHovered && (
          <div className="absolute inset-0 opacity-20 filter blur-[80px] pointer-events-none text-lume-primary" aria-hidden="true">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-current opacity-20 animate-liquid-1" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-lume-secondary/20 animate-liquid-2" />
          </div>
        )}

        {/* Quick Pitch Hover Overlays (Gold Core -> Amethyst Edge) */}
        {interactive && mode === "quick" && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
          >
            {/* Diagonal Refractive Glass Sheen Sweep */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
            >
              <div
                className="pointer-events-none absolute -top-[50%] -bottom-[50%] -left-[100%] w-[60%] -rotate-45 opacity-0 group-hover:animate-sheen-sweep motion-reduce:animate-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255, 232, 117, 0.1) 35%, rgba(255, 255, 255, 0.28) 50%, rgba(255, 232, 117, 0.1) 65%, transparent 100%)",
                }}
              />
            </div>

            {/* Liquid Gold-Amethyst Rotating Border Beam */}
            <div
              className="pointer-events-none absolute inset-0 rounded-[inherit] p-[1px] overflow-hidden"
              style={{
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
              }}
            >
              <div
                className="absolute -inset-[100%] animate-border-beam motion-reduce:animate-none"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, #FFD95A 60deg, #8E44AD 120deg, transparent 180deg)",
                }}
              />
            </div>

            {/* Radial specular border reveal */}
            <div
              className="absolute inset-0 rounded-[inherit] p-[1px]"
              style={{
                background:
                  "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), #FFD95A 0%, #8E44AD 50%, transparent 75%)",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
              }}
            />

            {/* Caustic spotlight: 400px circle */}
            <div
              className="absolute inset-0 rounded-[inherit]"
              style={{
                background:
                  "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 217, 90, 0.08) 0%, rgba(142, 68, 173, 0.04) 40%, transparent 70%)",
              }}
            />

            {/* Ethereal Sacred Geometry Watermark */}
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] select-none opacity-[0.05]"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 180 180"
                fill="none"
                className="w-full h-full animate-[border-beam-rotate_60s_linear_infinite] motion-reduce:animate-none transform-gpu origin-center"
              >
                {/* Outer dotted calibration circle */}
                <circle cx="90" cy="90" r="84" stroke="#FFD95A" strokeWidth="0.75" strokeDasharray="3 3" />
                {/* Concentric boundary rings */}
                <circle cx="90" cy="90" r="78" stroke="#FFE875" strokeWidth="1" />
                <circle cx="90" cy="90" r="70" stroke="#8E44AD" strokeWidth="0.75" strokeDasharray="6 4" />
                {/* Sacred 16-point Octagram Star Polygon */}
                <polygon
                  points="156,90 132.5,107.6 136.7,136.7 107.6,132.5 90,156 72.4,132.5 43.3,136.7 47.5,107.6 24,90 47.5,72.4 43.3,43.3 72.4,47.5 90,24 107.6,47.5 136.7,43.3 132.5,72.4"
                  stroke="#FFD95A"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                  fill="none"
                />
                {/* Inner containment rings */}
                <circle cx="90" cy="90" r="46" stroke="#FFE875" strokeWidth="0.75" />
                <circle cx="90" cy="90" r="40" stroke="#8E44AD" strokeWidth="0.75" strokeDasharray="2 3" />
                {/* Cardinal and diagonal celestial axes */}
                <line x1="90" y1="12" x2="90" y2="168" stroke="#FFD95A" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="12" y1="90" x2="168" y2="90" stroke="#FFD95A" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="35" y1="35" x2="145" y2="145" stroke="#8E44AD" strokeWidth="0.5" strokeDasharray="3 5" />
                <line x1="145" y1="35" x2="35" y2="145" stroke="#8E44AD" strokeWidth="0.5" strokeDasharray="3 5" />
                {/* Inner core ring and central diamond prism */}
                <circle cx="90" cy="90" r="22" stroke="#FFD95A" strokeWidth="1" />
                <circle cx="90" cy="90" r="12" stroke="#8E44AD" strokeWidth="0.75" strokeDasharray="2 2" />
                <polygon points="90,83 97,90 90,97 83,90" fill="#FFD95A" stroke="#FFE875" strokeWidth="0.5" />
                <circle cx="90" cy="90" r="1.5" fill="#FFF" />
              </svg>
            </div>

            {/* Four Alchemical Corner Filigree Brackets with Glowing Diamond Nodes */}
            {/* Top-Left */}
            <div className="absolute top-2.5 left-2.5 transition-transform duration-300 ease-out group-hover:translate-x-[2px] group-hover:translate-y-[2px]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="overflow-visible">
                <path d="M1 13V5C1 2.8 2.8 1 5 1H13" stroke="#FFE875" strokeWidth="1" strokeLinecap="round" />
                <path d="M3 9C3 5.7 5.7 3 9 3" stroke="#FFD95A" strokeWidth="0.75" strokeLinecap="round" />
                <polygon
                  points="7,4 10,7 7,10 4,7"
                  className="fill-[#C9A227] transition-all duration-300 group-hover:fill-[#FFE875] group-hover:drop-shadow-[0_0_6px_#FFE875] drop-shadow-[0_0_2px_rgba(201,162,39,0.4)]"
                />
              </svg>
            </div>

            {/* Top-Right */}
            <div className="absolute top-2.5 right-2.5 transition-transform duration-300 ease-out group-hover:-translate-x-[2px] group-hover:translate-y-[2px]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="overflow-visible">
                <path d="M13 13V5C13 2.8 11.2 1 9 1H1" stroke="#FFE875" strokeWidth="1" strokeLinecap="round" />
                <path d="M11 9C11 5.7 8.3 3 5 3" stroke="#FFD95A" strokeWidth="0.75" strokeLinecap="round" />
                <polygon
                  points="7,4 10,7 7,10 4,7"
                  className="fill-[#C9A227] transition-all duration-300 group-hover:fill-[#FFE875] group-hover:drop-shadow-[0_0_6px_#FFE875] drop-shadow-[0_0_2px_rgba(201,162,39,0.4)]"
                />
              </svg>
            </div>

            {/* Bottom-Left */}
            <div className="absolute bottom-2.5 left-2.5 transition-transform duration-300 ease-out group-hover:translate-x-[2px] group-hover:-translate-y-[2px]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="overflow-visible">
                <path d="M1 1V9C1 11.2 2.8 13 5 13H13" stroke="#FFE875" strokeWidth="1" strokeLinecap="round" />
                <path d="M3 5C3 8.3 5.7 11 9 11" stroke="#FFD95A" strokeWidth="0.75" strokeLinecap="round" />
                <polygon
                  points="7,4 10,7 7,10 4,7"
                  className="fill-[#C9A227] transition-all duration-300 group-hover:fill-[#FFE875] group-hover:drop-shadow-[0_0_6px_#FFE875] drop-shadow-[0_0_2px_rgba(201,162,39,0.4)]"
                />
              </svg>
            </div>

            {/* Bottom-Right */}
            <div className="absolute bottom-2.5 right-2.5 transition-transform duration-300 ease-out group-hover:-translate-x-[2px] group-hover:-translate-y-[2px]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="overflow-visible">
                <path d="M13 1V9C13 11.2 11.2 13 9 13H1" stroke="#FFE875" strokeWidth="1" strokeLinecap="round" />
                <path d="M11 5C11 8.3 8.3 11 5 11" stroke="#FFD95A" strokeWidth="0.75" strokeLinecap="round" />
                <polygon
                  points="7,4 10,7 7,10 4,7"
                  className="fill-[#C9A227] transition-all duration-300 group-hover:fill-[#FFE875] group-hover:drop-shadow-[0_0_6px_#FFE875] drop-shadow-[0_0_2px_rgba(201,162,39,0.4)]"
                />
              </svg>
            </div>

            {/* Arcane Alchemy Rising Embers */}
            <ArcaneEmbers />
          </div>
        )}

        {/* Deep Dive Hover Overlays (Cobalt Wireframe, Chamfer Corners & Laser Scanline) */}
        {interactive && mode === "deep" && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
          >
            {/* Crisp cobalt #2563EB wireframe border */}
            <div className="absolute inset-0 rounded-[inherit] border border-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.2)]" />

            {/* Caustic spotlight: 400px circle */}
            <div
              className="absolute inset-0 rounded-[inherit]"
              style={{
                background:
                  "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(106, 255, 255, 0.07) 0%, rgba(37, 99, 235, 0.05) 40%, transparent 70%)",
              }}
            />

            {/* Hextech Rotating Blueprint Background */}
            <HextechBlueprint />

            {/* Header laser scanline across top border */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] overflow-hidden rounded-t-[inherit]">
              <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#6AFFFF] to-transparent shadow-[0_0_8px_#6AFFFF] group-hover:animate-scanline-sweep" />
            </div>

            {/* Four 4px laser-orange (#F97316) chamfer corner brackets with glowing crystal nodes */}
            {/* Top-Left */}
            <div className="absolute top-2 left-2 transition-transform duration-300 ease-out group-hover:translate-x-[2px] group-hover:translate-y-[2px]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="overflow-visible">
                <path d="M0 8V3L3 0H8" stroke="#F97316" strokeWidth="1" strokeLinecap="round" />
                <polygon points="5,3 7,5 5,7 3,5" fill="#F97316" className="filter drop-shadow-[0_0_4px_#F97316]" />
              </svg>
            </div>

            {/* Top-Right */}
            <div className="absolute top-2 right-2 transition-transform duration-300 ease-out group-hover:-translate-x-[2px] group-hover:translate-y-[2px]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="overflow-visible">
                <path d="M10 8V3L7 0H2" stroke="#F97316" strokeWidth="1" strokeLinecap="round" />
                <polygon points="5,3 7,5 5,7 3,5" fill="#F97316" className="filter drop-shadow-[0_0_4px_#F97316]" />
              </svg>
            </div>

            {/* Bottom-Left */}
            <div className="absolute bottom-2 left-2 transition-transform duration-300 ease-out group-hover:translate-x-[2px] group-hover:-translate-y-[2px]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="overflow-visible">
                <path d="M0 2V7L3 10H8" stroke="#F97316" strokeWidth="1" strokeLinecap="round" />
                <polygon points="5,3 7,5 5,7 3,5" fill="#F97316" className="filter drop-shadow-[0_0_4px_#F97316]" />
              </svg>
            </div>

            {/* Bottom-Right */}
            <div className="absolute bottom-2 right-2 transition-transform duration-300 ease-out group-hover:-translate-x-[2px] group-hover:-translate-y-[2px]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="overflow-visible">
                <path d="M10 2V7L7 10H2" stroke="#F97316" strokeWidth="1" strokeLinecap="round" />
                <polygon points="5,3 7,5 5,7 3,5" fill="#F97316" className="filter drop-shadow-[0_0_4px_#F97316]" />
              </svg>
            </div>
          </div>
        )}

        {/* Shine/Refraction Effect */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-white/5 via-transparent to-transparent"
        />

        <div className="relative z-10 flex h-full w-full flex-col">
          {children}
        </div>
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"
