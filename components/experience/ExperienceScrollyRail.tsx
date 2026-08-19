"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useViewModeStore } from "@/store/useViewModeStore"

interface ExperienceScrollyRailProps {
  totalChapters: number
  activeIndex: number
  onSelectChapter: (index: number) => void
  companies: string[]
}

export function ExperienceScrollyRail({
  totalChapters,
  activeIndex,
  onSelectChapter,
  companies,
}: ExperienceScrollyRailProps) {
  const mode = useViewModeStore((s) => s.mode)

  if (totalChapters <= 1) return null

  return (
    <aside
      aria-label="Experience Chapter Navigation"
      className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-6 pointer-events-auto"
    >
      <div className="flex flex-col items-center gap-3 relative">
        {/* Connecting Progress Line */}
        <div className="absolute top-0 bottom-0 w-[2px] bg-white/10 -z-10" />

        {Array.from({ length: totalChapters }).map((_, idx) => {
          const isActive = activeIndex === idx
          const isDeep = mode === "deep"
          const accentColor = isDeep ? "bg-[var(--mode-accent-bright,#6AFFFF)]" : "bg-[var(--lume-primary)]"

          return (
            <button
              key={idx}
              onClick={() => onSelectChapter(idx)}
              className="group flex items-center gap-3 py-1 cursor-pointer focus:outline-none"
              aria-label={`Jump to chapter ${idx + 1}: ${companies[idx] || "Experience"}`}
            >
              {/* Tooltip on hover */}
              <span
                className={cn(
                  "text-[11px] font-mono tracking-wider transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                  isActive ? "text-white font-medium opacity-100 translate-x-0" : "text-white/40"
                )}
              >
                {String(idx + 1).padStart(2, "0")}. {companies[idx]}
              </span>

              {/* Indicator Node */}
              <span
                className={cn(
                  "w-3 h-3 rounded-full border transition-all duration-300 flex items-center justify-center",
                  isActive
                    ? `${accentColor} border-transparent scale-125 shadow-[0_0_12px_rgba(74,255,180,0.6)]`
                    : "bg-black/60 border-white/30 group-hover:border-white/70 group-hover:scale-110"
                )}
              />
            </button>
          )
        })}
      </div>
    </aside>
  )
}
