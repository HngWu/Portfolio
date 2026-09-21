"use client"

import * as React from "react"
import type { SpellData } from "@/lib/content/experienceSpells"

interface BookThumbTabsProps {
  spells: SpellData[]
  activeIndex: number
  targetIndex: number | null
  isTurning: boolean
  onSelectRole: (index: number) => void
}

function getShortLabel(id: string, realm: string): string {
  const lower = (id + " " + realm).toLowerCase()
  if (lower.includes("dbs")) return "DBS"
  if (lower.includes("ttp") || lower.includes("point")) return "TTP"
  return id.slice(0, 3).toUpperCase()
}

export function BookThumbTabs({
  spells,
  activeIndex,
  targetIndex,
  isTurning,
  onSelectRole,
}: BookThumbTabsProps) {
  return (
    <div className="hidden xl:flex absolute -right-8.5 top-1/2 -translate-y-1/2 flex-col gap-2 z-40">
      {spells.map((spell, idx) => {
        const isActive = idx === activeIndex
        const isTarget = idx === targetIndex
        const label = getShortLabel(spell.id, spell.realm)

        return (
          <button
            key={spell.id || idx}
            type="button"
            onClick={() => onSelectRole(idx)}
            disabled={isTurning || isActive}
            title={`${spell.realm} — ${spell.spellName}`}
            aria-label={`Jump to Chapter ${idx + 1}: ${spell.realm}`}
            className={`relative group/tab flex items-center justify-center w-8 h-11 rounded-r-xl border border-l-0 text-[10px] font-mono font-bold transition-all duration-300 cursor-pointer select-none shadow-md ${
              isActive
                ? "bg-[#0b101c] border-[var(--lume-primary,#4affb4)] text-[var(--lume-primary,#4affb4)] translate-x-1 shadow-[0_0_15px_rgba(74,255,180,0.25)]"
                : isTarget
                ? "bg-[#0b101c] border-[var(--mode-accent-bright,#6affff)] text-[var(--mode-accent-bright,#6affff)] animate-pulse"
                : "bg-[#070912]/90 border-white/15 text-white/50 hover:text-white hover:border-white/40 hover:translate-x-1 hover:bg-[#0c1222]"
            }`}
          >
            {/* Tab Label */}
            <span className="transform -rotate-90 tracking-tighter">
              {label}
            </span>

            {/* Active Indicator Dot */}
            {isActive && (
              <span className="absolute left-0.5 top-1/2 -translate-y-1/2 size-1 rounded-full bg-[var(--lume-primary,#4affb4)] shadow-[0_0_4px_var(--lume-primary)]" />
            )}

            {/* Hover Tooltip Card extending to the left or right */}
            <div className="absolute right-full mr-2 opacity-0 group-hover/tab:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap bg-[#060a12]/95 border border-white/20 p-2.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.85)] z-50 text-left">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-mono text-[var(--lume-primary,#4affb4)] uppercase font-semibold">
                  Chapter {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="text-[9px] font-mono text-white/40">· {spell.era}</span>
              </div>
              <div className="text-xs font-serif font-bold text-white leading-tight">
                {spell.realm}
              </div>
              <div className="text-[10px] font-mono text-white/60 mt-0.5 max-w-[200px] truncate">
                {spell.spellName}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
