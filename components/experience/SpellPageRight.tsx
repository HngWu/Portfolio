"use client"

import * as React from "react"
import { motion } from "framer-motion"
import type { SpellData } from "@/lib/content/experienceSpells"
import { Terminal, CheckCircle2, ArrowRight, Zap, Award } from "lucide-react"

interface SpellPageRightProps {
  spell: SpellData
  pageNumber: number
  isLastPage: boolean
  onNextPage: () => void
  isRevealing?: boolean
}

export function SpellPageRight({
  spell,
  pageNumber,
  isLastPage,
  onNextPage,
  isRevealing = false,
}: SpellPageRightProps) {
  return (
    <motion.div
      className="relative flex flex-col justify-between h-full w-full p-4 sm:p-5 md:p-6 lg:p-8 select-none overflow-hidden group/rightpage"
      initial={isRevealing ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: isRevealing ? 0.48 : 0, ease: "easeOut" }}
    >
      {/* Decorative Gilded Page Inner Border */}
      <div className="absolute inset-2 sm:inset-3 border border-white/[0.06] rounded-2xl pointer-events-none" />

      {/* Interactive 3D Corner Dog-Ear Curl (Top Right) */}
      {!isLastPage && (
        <button
          type="button"
          onClick={onNextPage}
          title="Turn to Next Role"
          aria-label="Turn to Next Role"
          className="absolute top-0 right-0 w-14 h-14 flex items-start justify-end p-2 cursor-pointer z-30 group/dogear"
        >
          <div className="relative w-7 h-7">
            {/* Folded triangular flap */}
            <div className="absolute top-0 right-0 w-0 h-0 border-t-[26px] border-t-white/15 border-l-[26px] border-l-transparent group-hover/dogear:border-t-[var(--lume-primary,#4affb4)]/70 group-hover/dogear:scale-125 transition-all duration-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]" />
            {/* Flap shadow underneath */}
            <div className="absolute top-0 right-0 w-0 h-0 border-b-[26px] border-b-black/60 border-r-[26px] border-r-transparent pointer-events-none" />
            <span className="absolute -bottom-5 -left-10 opacity-0 group-hover/dogear:opacity-100 transition-opacity bg-black/90 text-[8px] font-mono text-[var(--lume-primary,#4affb4)] px-1.5 py-0.5 rounded border border-[var(--lume-primary)]/30 pointer-events-none whitespace-nowrap shadow-md">
              Next ↷
            </span>
          </div>
        </button>
      )}

      {/* Folio Running Top Header */}
      <div className="relative z-10 border-b border-white/10 pb-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="size-3.5 text-[var(--lume-primary,#4affb4)]" />
          <h3 className="font-mono text-xs uppercase tracking-wider text-white/90 font-semibold">
            Key Responsibilities & Projects
          </h3>
        </div>
        <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider hidden sm:inline">
          Chapter 0{pageNumber} · Execution
        </span>
      </div>

      {/* Middle Body: Fits 100% vertically without scroll */}
      <div className="relative z-10 flex-1 flex flex-col justify-around py-2 min-h-0">
        {/* Action Points / Milestones */}
        <div className="space-y-2">
          {spell.incantation.map((inc, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 group/item transition-colors hover:bg-white/[0.02] p-1 rounded-lg"
            >
              {/* Sequential Numbered Badge */}
              <span className="shrink-0 size-5 mt-0.5 rounded bg-[#0a0d18] border border-white/15 text-[10px] font-mono font-bold text-[var(--lume-primary,#4affb4)] flex items-center justify-center group-hover/item:border-[var(--lume-primary,#4affb4)]/60 transition-all shadow-sm">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Complete, Unsliced Lead and Description Text */}
              <div className="min-w-0 flex-1 text-[11px] sm:text-xs leading-relaxed">
                <span className="font-semibold font-mono text-[11px] text-[var(--lume-primary,#4affb4)] mr-1.5 inline">
                  {inc.lead}
                </span>
                <span className="text-white/80 group-hover/item:text-white transition-colors">
                  {inc.verse}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Outcomes & Impact Section */}
        <div className="border-t border-white/10 pt-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3 text-[var(--mode-accent-bright,#6affff)]" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--mode-accent-bright,#6affff)] font-semibold">
                Delivered Impact & Verified Metrics
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {spell.effects.map((eff, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.025] border border-white/10 hover:border-[var(--mode-accent-bright,#6affff)]/40 hover:bg-white/[0.05] transition-all shadow-sm group/outcome"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 size-4 rounded bg-[var(--lume-primary,#4affb4)]/10 border border-[var(--lume-primary)]/25 flex items-center justify-center text-[10px] text-[var(--lume-primary)] font-bold">
                    {eff.rune || "✓"}
                  </span>
                  <span className="text-[11px] text-white/85 leading-snug truncate group-hover/outcome:text-white transition-colors">
                    {eff.outcome}
                  </span>
                </div>

                {eff.metric && (
                  <span className="shrink-0 font-mono text-[9px] px-2 py-0.5 rounded bg-[var(--lume-primary,#4affb4)]/15 border border-[var(--lume-primary,#4affb4)]/30 text-[var(--lume-primary,#4affb4)] font-semibold whitespace-nowrap shadow-sm flex items-center gap-1">
                    <Zap className="size-2.5 text-[var(--lume-primary)]" />
                    {eff.metric}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Folio Bottom Footer */}
      <div className="relative z-10 border-t border-white/10 pt-2 flex items-center justify-between text-[10px] font-mono text-white/40 shrink-0">
        <span className="flex items-center gap-1">
          <Award className="size-3 text-[var(--lume-primary,#4affb4)]" />
          Page {pageNumber * 2}
        </span>
        {!isLastPage ? (
          <button
            type="button"
            onClick={onNextPage}
            className="flex items-center gap-1 text-[var(--lume-primary,#4affb4)] hover:text-white transition-colors cursor-pointer font-medium group/btn"
          >
            <span>Next Role</span>
            <ArrowRight className="size-3 transform group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <span className="text-[var(--lume-primary,#4affb4)] font-medium">
            Chapter {String(pageNumber).padStart(2, "0")} · Completed
          </span>
        )}
      </div>

      {/* Subtle outer paper edge stacking lines (simulating book depth) */}
      <div className="absolute right-0 top-3 bottom-3 w-[2px] border-r border-white/15 pointer-events-none opacity-50" />
    </motion.div>
  )
}
