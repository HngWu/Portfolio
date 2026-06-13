"use client"

import { useState } from "react"
import { BentoTile } from "../BentoTile"
import dynamic from "next/dynamic"
import { useViewModeStore } from "@/store/useViewModeStore"

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
  const isDisabled = !!sortableProps || !!isDragging;

  return (
    <BentoTile 
      id={id} 
      size={size} 
      className="p-0 bg-transparent overflow-hidden h-full" 
      isDragging={isDragging} 
      sortableProps={sortableProps}
      canDeepDive={false}
      canMorph={false}
      noPadding={true}
      forceFullHeight={true}
    >
      <div 
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none rounded-2xl overflow-hidden"
        onMouseEnter={() => !isDisabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isDisabled ? (
          <div className="w-full h-full bg-lume-primary/5 flex items-center justify-center border-2 border-dashed border-lume-primary/20 rounded-2xl">
             <div className="size-20 rounded-full border-2 border-lume-primary/10 animate-pulse" />
          </div>
        ) : (
          <div className="w-full h-full relative pointer-events-auto rounded-2xl overflow-hidden">
            <PolyhedronCanvas isHovered={isHovered} isDeepDive={isDeepDive} />
          </div>
        )}
      </div>
    </BentoTile>
  )
}
