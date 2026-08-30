"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useIgniteStore } from "@/store/useIgniteStore"
import gsap from "gsap"
import { ForceMobileContext } from "./ForceMobileContext"
import { useSiteLoaderStore } from "@/store/useSiteLoaderStore"

export function BentoGrid({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { isIgnited } = useIgniteStore()
  const forceMobile = React.useContext(ForceMobileContext)
  const gridRef = React.useRef<HTMLDivElement>(null)
  const flashRef = React.useRef<HTMLDivElement>(null)
  const prevIgnited = React.useRef(isIgnited)
  const isLoaded = useSiteLoaderStore((s) => s.isLoaded)

  // Handle initial bento radial shockwave entrance from Hero Tile origin
  React.useEffect(() => {
    if (!gridRef.current) return
    const tiles = Array.from(gridRef.current.querySelectorAll('[data-id]')) as HTMLElement[]
    if (tiles.length === 0) return

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (!isLoaded) {
      if (prefersReduced) {
        gsap.set(tiles, { opacity: 0 })
      } else {
        gsap.set(tiles, { opacity: 0, y: 24, scale: 0.94, filter: "brightness(1.5) blur(6px)" })
      }
    } else {
      if (prefersReduced) {
        gsap.to(tiles, { opacity: 1, duration: 0.35 })
      } else {
        // Find hero tile index to serve as the epicenter of the radial wave
        let heroIndex = tiles.findIndex(t => 
          t.getAttribute('data-id')?.includes('hero') || 
          t.getAttribute('data-id')?.includes('polyhedron') ||
          t.querySelector('canvas')
        )
        if (heroIndex === -1) heroIndex = 0

        gsap.fromTo(
          tiles,
          { opacity: 0, y: 24, scale: 0.94, filter: "brightness(1.5) blur(6px)" },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "brightness(1) blur(0px)",
            duration: 0.85,
            stagger: {
              amount: 0.38,
              from: heroIndex,
              grid: "auto"
            },
            ease: "power3.out",
            onStart: function () {
              const target = this.targets()[0] as HTMLElement
              if (target) {
                target.style.boxShadow = "0 0 35px rgba(74, 255, 180, 0.38)"
                target.style.borderColor = "rgba(74, 255, 180, 0.6)"
                setTimeout(() => {
                  target.style.boxShadow = ""
                  target.style.borderColor = ""
                }, 650)
              }
            }
          }
        )
      }
    }
  }, [isLoaded])

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

  const baseGridClasses =
    "grid grid-cols-2 md:grid-cols-6 xl:grid-cols-12 auto-rows-[minmax(60px,auto)] grid-flow-dense gap-2 md:gap-3 xl:gap-4 max-w-[1440px] mx-auto w-full px-2"

  const gridClasses = forceMobile
    ? baseGridClasses
        .split(" ")
        .filter((c) => !c.startsWith("md:") && !c.startsWith("xl:"))
        .join(" ")
    : baseGridClasses

  return (
    <div className="relative">
      {/* Flash Overlay */}
      <div 
        ref={flashRef}
        className="fixed inset-0 bg-white pointer-events-none z-[100] opacity-0"
      />
      
      <div className="w-full relative" ref={gridRef}>
        <div
          className={cn(
            gridClasses,
            className
          )}
        >
          {React.Children.map(children, (child, index) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { index } as Record<string, unknown>)
            }
            return child
          })}
        </div>
      </div>
    </div>
  )
}
