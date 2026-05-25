"use client"

import * as React from "react"
import { cn, getSizeClasses } from "@/lib/utils"
import { GlassCard } from "@/components/ui/GlassCard"
import { usePageTransition } from "@/hooks/usePageTransition"
import { useTilt } from "./useTilt"
import { useViewModeStore } from "@/store/useViewModeStore"
import { motion } from "framer-motion"

interface BentoTileProps {
  id: string
  size: string // Base size like '4x2'
  href?: string
  glowColor?: "mint" | "blue" | "pink" | "amber" | "none"
  className?: string
  children: React.ReactNode // Usually the Quick Pitch content
  deepContent?: React.ReactNode // Content for the back of the card
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
  canDeepDive?: boolean
  canMorph?: boolean
  canExpand?: boolean
  layout?: boolean | "position" | "size"
}

export function BentoTile({
  id,
  size,
  href,
  glowColor = "none",
  className,
  children,
  deepContent,
  isDragging,
  sortableProps,
  canDeepDive = true,
  canMorph = true,
  canExpand = true,
  layout = true,
}: BentoTileProps) {
  const { navigateWithTransition } = usePageTransition()
  const { ref, onMouseMove, onMouseLeave } = useTilt()
  const mode = useViewModeStore((state) => state.mode)
  const isDeepDive = mode === "deep" && canDeepDive
  
  const [dynamicRows, setDynamicRows] = React.useState<number | null>(null)
  const backRef = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    if (isDeepDive && canExpand && canMorph && backRef.current) {
      // Base row height (60px) and gaps (8/12/16px) matching BentoGrid.tsx
      const rowHeight = 60
      const vw = window.innerWidth
      const gap = vw >= 1280 ? 16 : (vw >= 768 ? 12 : 8)
      
      const contentHeight = backRef.current.scrollHeight
      const padding = 48 // p-6 is 24px * 2
      const totalHeight = contentHeight + padding
      
      // Calculate how many spans of (rowHeight + gap) are needed
      const neededRows = Math.ceil(totalHeight / (rowHeight + gap))
      
      // Get base rows from size string (e.g. '4x2' -> 2)
      const baseRows = parseInt(size.split('x')[1]) || 1
      
      setDynamicRows(Math.max(baseRows, neededRows))
    } else {
      setDynamicRows(null)
    }
  }, [isDeepDive, canExpand, canMorph, deepContent, size])

  const spanClass = getSizeClasses(size, canExpand && isDeepDive && !dynamicRows)
  const isClickable = !!href && !sortableProps && !isDragging

  const handleClick = () => {
    if (isClickable && href) {
      if (href.startsWith("http") || href.startsWith("mailto:")) {
        window.open(href, "_blank", "noopener,noreferrer")
      } else {
        navigateWithTransition(href)
      }
    }
  }

  return (
    <motion.div
      layout={layout}
      whileHover={!sortableProps ? { scale: 1.01, translateY: -4 } : undefined}
      transition={{ 
        layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
        scale: { duration: 0.4, ease: "easeOut" },
        translateY: { duration: 0.4, ease: "easeOut" }
      }}
      style={dynamicRows ? { gridRow: `span ${dynamicRows}` } : undefined}
      className={cn(
        spanClass, 
        "h-full perspective-[1500px]", 
        isDragging ? "touch-none opacity-30" : "touch-pan-y"
      )}
      {...sortableProps}
    >
      <motion.div
        animate={{ rotateY: isDeepDive ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full h-full preserve-3d"
      >
        {/* Front Face (Quick Pitch) */}
        <div className="absolute inset-0 backface-hidden z-10">
          <GlassCard
            ref={ref}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            glowColor={glowColor}
            onClick={handleClick}
            interactive={!isDragging}
            data-id={id}
            className={cn(
              "p-4 md:p-6 flex flex-col h-full",
              isClickable && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lume-primary",
              className
            )}
          >
            {children}
            {isClickable && !href?.startsWith("http") && (
              <div className="absolute bottom-0 right-4 z-20 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 flex items-center gap-2 text-xs font-mono text-white/50 pointer-events-none">
                <span>View Details</span>
                <span>→</span>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Back Face (Deep Dive) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 z-0">
          <GlassCard
            glowColor={glowColor}
            onClick={handleClick}
            interactive={!isDragging}
            className={cn(
              "p-4 md:p-6 flex flex-col h-full bg-lume-secondary/5 border-lume-secondary/20",
              isClickable && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lume-primary",
              className
            )}
          >
            <div ref={backRef} className={cn("w-full", canMorph ? "h-fit" : "h-full flex flex-col flex-1")}>
              {deepContent || (
                <div className="flex flex-col h-full justify-center items-center text-center opacity-40 italic">
                  <span className="text-xs font-mono uppercase tracking-widest">Enhanced Insight</span>
                  <p className="text-[10px] mt-2">Deep dive content coming soon.</p>
                </div>
              )}
            </div>
            {isClickable && !href?.startsWith("http") && (
              <div className="absolute bottom-0 right-4 z-20 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 flex items-center gap-2 text-xs font-mono text-white/50 pointer-events-none">
                <span>View Details</span>
                <span>→</span>
              </div>
            )}
          </GlassCard>
        </div>
      </motion.div>
    </motion.div>
  )
}
