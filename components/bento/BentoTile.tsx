"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/GlassCard"
import { usePageTransition } from "@/hooks/usePageTransition"
import { useTilt } from "./useTilt"

interface BentoTileProps {
  id: string
  size: string // e.g., '4x2', '2x2'
  href?: string
  glowColor?: "mint" | "blue" | "pink" | "amber" | "none"
  className?: string
  children: React.ReactNode
}

export function BentoTile({
  id,
  size,
  href,
  glowColor = "none",
  className,
  children,
}: BentoTileProps) {
  const { navigateWithTransition } = usePageTransition()
  const { ref, onMouseMove, onMouseLeave } = useTilt()

  // Map sizes to column and row spans based on DESIGN.md
  const sizeClasses: Record<string, string> = {
    "1x1": "col-span-1 row-span-1",
    "2x1": "col-span-2 row-span-1 md:col-span-3 xl:col-span-2",
    "2x2": "col-span-2 row-span-2 md:col-span-3 xl:col-span-2",
    "3x2": "col-span-2 row-span-2 md:col-span-3 xl:col-span-3",
    "4x2": "col-span-2 row-span-2 md:col-span-6 xl:col-span-4",
    "4x3": "col-span-2 row-span-3 md:col-span-6 xl:col-span-4",
    "6x2": "col-span-2 row-span-2 md:col-span-6 xl:col-span-6",
    "6x4": "col-span-2 row-span-4 md:col-span-6 xl:col-span-6",
    "3x3": "col-span-2 row-span-3 md:col-span-3 xl:col-span-3",
    "2x4": "col-span-2 row-span-4 md:col-span-3 xl:col-span-2",
  }

  const spanClass = sizeClasses[size] || "col-span-2 row-span-2"
  const isClickable = !!href

  const handleClick = () => {
    if (href) {
      if (href.startsWith("http") || href.startsWith("mailto:")) {
        window.open(href, "_blank", "noopener,noreferrer")
      } else {
        navigateWithTransition(href)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <GlassCard
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      glowColor={glowColor}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      data-id={id}
      className={cn(
        spanClass,
        "relative overflow-hidden group p-4 md:p-6 flex flex-col",
        isClickable && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lume-primary",
        className
      )}
    >
      {children}
      {isClickable && !href.startsWith("http") && (
        <div className="absolute bottom-4 left-4 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 flex items-center gap-2 text-xs font-mono text-white/50">
          <span>View Details</span>
          <span>→</span>
        </div>
      )}
    </GlassCard>
  )
}
