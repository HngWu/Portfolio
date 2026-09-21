"use client"

import * as React from "react"
import { motion } from "framer-motion"

interface BookmarkRibbonProps {
  currentChapter: number
  totalChapters: number
  realmName: string
}

export function BookmarkRibbon({
  currentChapter,
  totalChapters,
  realmName,
}: BookmarkRibbonProps) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 -top-2 z-40 pointer-events-auto group/ribbon">
      {/* Silk Ribbon Body with swallowtail notch */}
      <motion.div
        className="relative w-7 h-28 cursor-pointer filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]"
        whileHover={{ y: 6, scaleY: 1.04 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        {/* Ribbon Texture */}
        <div
          className="w-full h-full bg-gradient-to-b from-[#0a151b] via-[var(--lume-primary,#4affb4)]/30 to-[var(--lume-primary,#4affb4)]/15 border-x border-white/20 relative overflow-hidden"
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 12px), 50% 100%, 0 calc(100% - 12px))",
          }}
        >
          {/* Subtle Gilded Thread Stitching */}
          <div className="absolute inset-y-0 left-1 w-[1px] border-l border-dashed border-[var(--lume-primary,#4affb4)]/50" />
          <div className="absolute inset-y-0 right-1 w-[1px] border-r border-dashed border-[var(--lume-primary,#4affb4)]/50" />

          {/* Central Silk Sheen Line */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-white/40 via-white/10 to-transparent" />

          {/* Bottom Monogram Accent */}
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center text-[8px] font-mono text-[var(--lume-primary,#4affb4)] font-bold tracking-tighter opacity-80">
            HW
          </div>
        </div>

        {/* Hover Tooltip Ribbon Tag */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover/ribbon:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap bg-[#060a12]/95 border border-[var(--lume-primary,#4affb4)]/30 px-2.5 py-1 rounded-lg text-[10px] font-mono text-white/90 shadow-[0_10px_25px_rgba(0,0,0,0.8)] flex items-center gap-1.5 z-50">
          <span className="size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)] animate-ping" />
          <span>Chapter {currentChapter}/{totalChapters}: {realmName}</span>
        </div>
      </motion.div>
    </div>
  )
}
