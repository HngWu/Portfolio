"use client"

import * as React from "react"
import { SpellSigil } from "./SpellSigil"
import type { SpellData } from "@/lib/content/experienceSpells"
import {
  Calendar,
  Cpu,
  Building2,
  Terminal,
  Code2,
  Sparkles,
} from "lucide-react"

interface SpellPageLeftProps {
  spell: SpellData
  pageNumber: number
  totalSpells: number
}

function getCompanyIcon(realm: string) {
  const r = realm.toLowerCase()
  if (r.includes("dbs") || r.includes("bank")) {
    return <Building2 className="size-3.5 text-[var(--lume-primary,#4affb4)]" />
  }
  if (r.includes("point") || r.includes("ttp")) {
    return <Terminal className="size-3.5 text-[var(--lume-primary,#4affb4)]" />
  }
  return <Code2 className="size-3.5 text-[var(--lume-primary,#4affb4)]" />
}

export function SpellPageLeft({ spell, pageNumber, totalSpells }: SpellPageLeftProps) {
  const companyIcon = getCompanyIcon(spell.realm)

  return (
    <div className="relative flex flex-col justify-between h-full w-full p-4 sm:p-5 md:p-6 lg:p-8 select-none overflow-hidden group/leftpage">
      {/* Decorative Gilded Page Inner Border */}
      <div className="absolute inset-2 sm:inset-3 border border-white/[0.06] rounded-2xl pointer-events-none" />

      {/* Background Subtle Tech-Circuit Watermark with breathing aura */}
      <div className="absolute right-2 top-8 opacity-[0.06] pointer-events-none transition-opacity group-hover/leftpage:opacity-[0.1]">
        <SpellSigil type={spell.sigilType} size={240} />
      </div>

      {/* Folio Top Header */}
      <div className="relative z-10 space-y-2.5 border-b border-white/10 pb-3.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] text-[var(--lume-primary,#4affb4)] uppercase tracking-wider flex items-center gap-1.5 font-medium">
            <span className="size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)] animate-pulse" />
            Chapter {String(pageNumber).padStart(2, "0")} / {String(totalSpells).padStart(2, "0")}
          </span>

          <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70 flex items-center gap-1">
            <Calendar className="size-2.5 text-[var(--lume-primary)]" />
            {spell.era}
          </span>
        </div>

        <div>
          {/* Classification & Tier Breadcrumb */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-mono text-[var(--mode-accent-bright,#6affff)] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[var(--mode-accent-bright,#6affff)]/10 border border-[var(--mode-accent-bright,#6affff)]/20">
              {spell.school}
            </span>
            <span className="text-[9px] font-mono text-white/40 uppercase">
              · {spell.tier}
            </span>
          </div>

          {/* Role Headline */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold tracking-tight text-white leading-tight">
            {spell.spellName}
          </h2>

          {/* Company / Realm Badge */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono text-white font-medium shadow-sm">
              {companyIcon}
              <span>{spell.realm}</span>
            </div>
            <span className="text-[10px] font-mono text-white/40 hidden sm:inline">
              Certified Experience Record
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Skills & Technologies Section */}
      <div className="relative z-10 flex-1 flex flex-col justify-around py-2.5 min-h-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Cpu className="size-3.5 text-[var(--lume-primary,#4affb4)]" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-white/90 font-semibold">
              Core Technologies & Architecture
            </h3>
          </div>
          <span className="text-[9px] font-mono text-white/40 uppercase hidden sm:inline">
            Production Stack
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {spell.ingredients.map((ing, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.025] border border-white/10 hover:border-[var(--lume-primary)]/50 hover:bg-white/[0.05] transition-all group/skill cursor-default"
            >
              <span className="shrink-0 size-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs group-hover/skill:scale-110 transition-transform">
                {ing.symbol || "⚡"}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-white/90 truncate block group-hover/skill:text-white transition-colors">
                  {ing.name}
                </span>
                <span className="text-[9px] font-mono text-white/40 uppercase block tracking-tight">
                  {ing.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Folio Bottom Footer */}
      <div className="relative z-10 border-t border-white/10 pt-2 flex items-center justify-between text-[10px] font-mono text-white/40 shrink-0">
        <span className="flex items-center gap-1">
          <Sparkles className="size-3 text-[var(--lume-primary,#4affb4)]" />
          Page {pageNumber * 2 - 1}
        </span>
        <span className="tracking-wider uppercase hidden sm:inline">Tan Hng Wu // Dossier</span>
      </div>

      {/* Subtle outer paper edge stacking lines (simulating book depth) */}
      <div className="absolute left-0 top-3 bottom-3 w-[2px] border-l border-white/15 pointer-events-none opacity-50" />
    </div>
  )
}
