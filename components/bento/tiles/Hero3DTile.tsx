"use client"

import { useState, useRef, useEffect } from "react"
import { BentoTile } from "../BentoTile"
import dynamic from "next/dynamic"
import { useViewModeStore } from "@/store/useViewModeStore"
import { useSiteLoaderStore } from "@/store/useSiteLoaderStore"

// Non-SSR dynamic import to prevent WebGL initialization errors
const PolyhedronCanvas = dynamic(() => import("./PolyhedronCanvas"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-black/20 rounded-2xl">
      <div className="size-12 border-2 border-lume-primary/20 border-t-lume-primary rounded-full animate-spin" />
    </div>
  )
})

export function Hero3DTile({ id, size, isDragging, sortableProps }: { id: string, size: string, isDragging?: boolean, sortableProps?: Record<string, unknown> }) {

  const [isHovered, setIsHovered] = useState(false)
  const mode = useViewModeStore((state) => state.mode)
  const isDeepDive = mode === "deep"
  const isDisabled = !!sortableProps || !!isDragging
  const containerRef = useRef<HTMLDivElement | null>(null)
  const setHeroAnchorRect = useSiteLoaderStore((s) => s.setHeroAnchorRect)

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
        onMouseEnter={() => !isDisabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isDisabled ? (
          <div className="w-full h-full bg-lume-primary/5 flex items-center justify-center border-2 border-dashed border-lume-primary/20 rounded-2xl">
             <div className="size-20 rounded-full border-2 border-lume-primary/10 animate-pulse" />
          </div>
        ) : (
          <PolyhedronCanvas isHovered={isHovered} isDeepDive={isDeepDive} />
        )}
      </div>
    </BentoTile>
  )
}
