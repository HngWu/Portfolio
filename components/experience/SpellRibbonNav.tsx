"use client"

import * as React from "react"
import type { SpellData } from "@/lib/content/experienceSpells"
import { Bookmark } from "lucide-react"

interface SpellRibbonNavProps {
  spells: SpellData[]
  activeIndex: number
  onSelectSpell: (index: number) => void
}

export function SpellRibbonNav({
  spells,
  activeIndex,
  onSelectSpell,
}: SpellRibbonNavProps) {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-3 py-2 px-4 z-30 select-none overflow-x-auto no-scrollbar">
      {spells.map((spell, idx) => {
        const isActive = idx === activeIndex
        return (
          <button
            key={spell.id || idx}
            type="button"
            onClick={() => onSelectSpell(idx)}
            aria-label={`Jump to Folio ${idx + 1}: ${spell.realm}`}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-300 border cursor-pointer active:scale-95 ${
              isActive
                ? "bg-[var(--lume-primary,#4affb4)]/15 border-[var(--lume-primary,#4affb4)]/50 text-[var(--lume-primary,#4affb4)] shadow-[0_0_12px_rgba(74,255,180,0.3)]"
                : "bg-white/[0.03] border-white/10 text-white/50 hover:bg-white/[0.07] hover:text-white/85"
            }`}
          >
            <Bookmark className={`size-3 ${isActive ? "fill-current" : ""}`} />
            <span className="truncate max-w-[120px] md:max-w-[160px]">
              {spell.realm}
            </span>
          </button>
        )
      })}
    </div>
  )
}
