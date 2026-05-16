"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useIgniteStore } from "@/store/useIgniteStore"
import gsap from "gsap"

export function BentoGrid({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { isIgnited } = useIgniteStore()
  const gridRef = React.useRef<HTMLDivElement>(null)
  const flashRef = React.useRef<HTMLDivElement>(null)
  const prevIgnited = React.useRef(isIgnited)

  React.useEffect(() => {
    if (isIgnited && !prevIgnited.current) {
      // 1. Screen Flash
      if (flashRef.current) {
        gsap.to(flashRef.current, {
          opacity: 0.15,
          duration: 0.04,
          onComplete: () => {
            gsap.to(flashRef.current, {
              opacity: 0,
              duration: 0.2,
            })
          },
        })
      }

      // 2. Tile Ripple
      if (gridRef.current) {
        const tiles = gridRef.current.querySelectorAll('[data-id]')
        gsap.to(tiles, {
          scale: 1.05,
          rotate: (i) => (i % 2 === 0 ? 1 : -1),
          duration: 0.1,
          stagger: {
            amount: 0.2,
            from: "center",
          },
          onComplete: () => {
            gsap.to(tiles, {
              scale: 1,
              rotate: 0,
              duration: 0.3,
              ease: "elastic.out(1, 0.3)",
            })
          },
        })
      }
    }
    prevIgnited.current = isIgnited
  }, [isIgnited])

  return (
    <div className="relative">
      {/* Flash Overlay */}
      <div 
        ref={flashRef}
        className="fixed inset-0 bg-white pointer-events-none z-[100] opacity-0"
      />
      
      <div
        ref={gridRef}
        className={cn(
          "grid grid-cols-2 md:grid-cols-6 xl:grid-cols-12 auto-rows-[minmax(60px,auto)] grid-flow-dense gap-2 md:gap-3 xl:gap-4 max-w-[1440px] mx-auto w-full px-2",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
