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
}: BentoTileProps) {
  const { navigateWithTransition } = usePageTransition()
  const { ref, onMouseMove, onMouseLeave } = useTilt()
  const mode = useViewModeStore((state) => state.mode)
  const isDeepDive = mode === "deep" && canDeepDive
  const isMorphing = mode === "deep" && canMorph

  // Sizing stays reactive to layout changes
  const spanClass = getSizeClasses(size, isMorphing)
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
      layout
      whileHover={!sortableProps ? { scale: 1.01, translateY: -4 } : undefined}
      transition={{ 
        layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
        scale: { duration: 0.4, ease: "easeOut" },
        translateY: { duration: 0.4, ease: "easeOut" }
      }}
      className={cn(
        spanClass, 
        "h-full perspective-[1500px] touch-none", // Enable 3D space and prevent touch scrolling
        isDragging && "opacity-30"
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
            interactive={false}
            className={cn(
              "p-4 md:p-6 flex flex-col h-full bg-lume-secondary/5 border-lume-secondary/20",
              className
            )}
          >
            {deepContent || (
              <div className="flex flex-col h-full justify-center items-center text-center opacity-40 italic">
                <span className="text-xs font-mono uppercase tracking-widest">Enhanced Insight</span>
                <p className="text-[10px] mt-2">Deep dive content coming soon.</p>
              </div>
            )}
          </GlassCard>
        </div>
      </motion.div>
    </motion.div>
  )
}
