"use client"

import { useState, useRef, useEffect, useContext } from "react"
import { BentoTile } from "../BentoTile"
import dynamic from "next/dynamic"
import { useViewModeStore } from "@/store/useViewModeStore"
import { useSiteLoaderStore } from "@/store/useSiteLoaderStore"
import { Render3DContext } from "../Render3DContext"

// Non-SSR dynamic import to prevent WebGL initialization errors
const PolyhedronCanvas = dynamic(() => import("./PolyhedronCanvas"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-black/20 rounded-2xl">
      <div className="size-12 border-2 border-lume-primary/20 border-t-lume-primary rounded-full animate-spin" />
    </div>
  )
})

export function Hero3DTile({ 
  id, 
  size, 
  isDragging, 
  sortableProps 
}: { 
  id: string
  size: string
  isDragging?: boolean
  sortableProps?: Record<string, unknown> 
}) {
  const [isHovered, setIsHovered] = useState(false)
  const render3DMode = useContext(Render3DContext)
  const mode = useViewModeStore((state) => state.mode)
  const isDeepDive = mode === "deep"
  const isDraggingActive = !!isDragging
  const containerRef = useRef<HTMLDivElement | null>(null)
  const setHeroAnchorRect = useSiteLoaderStore((s) => s.setHeroAnchorRect)
  const showTemplate = render3DMode === "template" || isDraggingActive

  useEffect(() => {
    const updateAnchor = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setHeroAnchorRect({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height
        })
      }
    }

    updateAnchor()
    window.addEventListener("resize", updateAnchor)
    return () => window.removeEventListener("resize", updateAnchor)
  }, [setHeroAnchorRect])

  return (
    <BentoTile 
      id={id} 
      size={size} 
      className="p-0 bg-transparent overflow-hidden h-full w-full" 
      isDragging={isDragging} 
      sortableProps={sortableProps}
      canDeepDive={false}
      canMorph={false}
      noPadding={true}
      forceFullHeight={true}
      disableHoverScale={true}
    >
      <div 
        ref={containerRef}
        className="w-full h-full relative pointer-events-auto overflow-hidden"
        onMouseEnter={() => !isDraggingActive && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {showTemplate ? (
          <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 md:p-8 bg-[#0a0a0a]/80 border border-white/10 rounded-3xl backdrop-blur-md select-none">
            {/* Blueprint Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Subtle emerald radial ambient glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(74,255,180,0.08),transparent_70%)] pointer-events-none" />

            {/* Corner Crosshair Accents */}
            <div className="absolute top-4 left-4 size-3 border-t border-l border-white/20 pointer-events-none" />
            <div className="absolute top-4 right-4 size-3 border-t border-r border-white/20 pointer-events-none" />
            <div className="absolute bottom-4 left-4 size-3 border-b border-l border-white/20 pointer-events-none" />
            <div className="absolute bottom-4 right-4 size-3 border-b border-r border-white/20 pointer-events-none" />

            {/* Top Telemetry Header */}
            <div className="flex items-center justify-between w-full z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-lume-primary/30 bg-lume-primary/10 text-lume-primary font-mono text-[11px] font-medium tracking-wider shadow-[0_0_20px_rgba(74,255,180,0.1)]">
                <span className="size-1.5 rounded-full bg-lume-primary animate-pulse" />
                <span>BLUEPRINT MODE • 3X3 RUBIK PYRAMID</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-white/40 uppercase tracking-widest">
                <span>4×5 MEGA TILE</span>
                <span className="text-white/20">•</span>
                <span>1:1 RATIO</span>
              </div>
            </div>

            {/* Center Visual: Animated Glowing Orb & Rotating Wireframe Cube */}
            <div className="relative flex flex-col items-center justify-center flex-1 my-3 z-10">
              {/* Outer ambient glow pulse */}
              <div className="absolute size-44 rounded-full bg-lume-primary/10 blur-2xl animate-pulse pointer-events-none" />

              {/* Central container with emerald accents and shadow */}
              <div className="relative size-28 md:size-32 rounded-3xl border border-lume-primary/30 bg-black/50 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_rgba(74,255,180,0.15)] group/cube">
                {/* Planetary orbital rings */}
                <div className="absolute -inset-3 rounded-full border border-dashed border-lume-primary/20 animate-spin [animation-duration:14s] pointer-events-none" />
                <div className="absolute -inset-6 rounded-full border border-dotted border-white/10 animate-spin [animation-duration:24s] [animation-direction:reverse] pointer-events-none" />

                {/* Glowing orb center & wireframe isometric cube */}
                <div className="relative flex items-center justify-center text-lume-primary">
                  <div className="absolute size-8 rounded-full bg-lume-primary/20 blur-sm animate-ping [animation-duration:3s]" />
                  <div className="absolute size-5 rounded-full bg-lume-primary/40 shadow-[0_0_20px_rgba(74,255,180,0.9)]" />
                  
                  <svg
                    className="size-14 text-lume-primary drop-shadow-[0_0_12px_rgba(74,255,180,0.6)] animate-pulse"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h3 className="mt-5 text-base md:text-lg font-display font-bold tracking-wider text-white/90 uppercase text-center">
                3D HEXCORE ARTIFACT
              </h3>

              {/* Note */}
              <p className="mt-1.5 text-xs font-mono text-white/50 text-center max-w-[290px] leading-relaxed">
                Toggle &apos;Live 3D&apos; in toolbar to initialize WebGL R3F simulation
              </p>
            </div>

            {/* Bottom Telemetry & Dimensions Indicator */}
            <div className="border-t border-white/5 pt-3 w-full flex items-center justify-between z-10">
              <div className="flex items-center gap-2 font-mono text-[10px] text-white/40">
                <span className="size-1.5 rounded-full bg-lume-primary/60" />
                <span>DIMENSIONS: 3×3×3 • 54 PYRAMIDS</span>
              </div>
              <div className="font-mono text-[10px] text-white/30 tracking-widest uppercase">
                WebGL / R3F
              </div>
            </div>
          </div>
        ) : (
          <PolyhedronCanvas isHovered={isHovered} isDeepDive={isDeepDive} />
        )}
      </div>
    </BentoTile>
  )
}
