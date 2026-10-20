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
          "transform-gpu backface-hidden",
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
