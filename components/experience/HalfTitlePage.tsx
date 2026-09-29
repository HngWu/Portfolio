"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Sparkles, ChevronRight, Terminal, BookOpen } from "lucide-react"

export interface HalfTitlePageProps {
  onTurnPage: () => void
  autoFlipDurationMs?: number
}

export function HalfTitlePage({
  onTurnPage,
  autoFlipDurationMs = 2500,
}: HalfTitlePageProps) {
  const [progress, setProgress] = React.useState(0)

  // Subtle progress bar visualizing the auto-flip timer
  React.useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const p = Math.min(100, Math.round((elapsed / autoFlipDurationMs) * 100))
      setProgress(p)
      if (p >= 100) {
        clearInterval(interval)
      }
    }, 40)

    return () => clearInterval(interval)
  }, [autoFlipDurationMs])

  return (
    <div
      onClick={onTurnPage}
      className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#0c1228] via-[#070b1a] to-[#04060e] select-none rounded-r-3xl border-r border-y border-white/25 shadow-[-15px_0_35px_rgba(0,0,0,0.85)] cursor-pointer group/titlepage"
      role="button"
      tabIndex={0}
      aria-label="Half Title Page - Click or wait to turn to Chapter 1"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onTurnPage()
        }
      }}
    >
      {/* 1. Luminous Ambient Radial Mana Halo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,255,180,0.12)_0%,rgba(255,215,0,0.08)_45%,transparent_75%)] pointer-events-none" />

      {/* 2. Blueprint Grid Watermark */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* 3. Gilded Margin Frame */}
      <div className="absolute inset-3 border border-white/[0.12] rounded-2xl pointer-events-none" />
      <div className="absolute inset-4 border border-dashed border-[var(--lume-primary,#4affb4)]/30 rounded-xl pointer-events-none" />

      {/* 4. Spine Crease Shadow Gradient (Left Edge of Right Page) */}
      <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-black/90 via-black/45 to-transparent pointer-events-none z-10" />

      {/* 5. Metallic Corner Clasps */}
      <div className="absolute top-3.5 right-3.5 size-6 border-t-2 border-r-2 border-[var(--lume-primary,#4affb4)]/70 rounded-tr-md pointer-events-none">
        <div className="absolute top-1 right-1 size-1.5 rounded-full bg-[#ffd700] shadow-[0_0_6px_#ffd700]" />
      </div>
      <div className="absolute bottom-3.5 right-3.5 size-6 border-b-2 border-r-2 border-[var(--lume-primary,#4affb4)]/70 rounded-br-md pointer-events-none">
        <div className="absolute bottom-1 right-1 size-1.5 rounded-full bg-[#ffd700] shadow-[0_0_6px_#ffd700]" />
      </div>

      {/* 6. Page Content */}
      <div className="relative z-10 p-5 sm:p-7 md:p-9 flex flex-col justify-between h-full font-mono pl-7 sm:pl-10">
        {/* Top Runic Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-[11px] tracking-widest">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)] shadow-[0_0_6px_var(--lume-primary)]" />
            <span className="font-serif tracking-[0.28em] text-[var(--lume-primary,#4affb4)]/80 text-[12px] font-semibold drop-shadow-[0_0_8px_rgba(74,255,180,0.3)]">
              ᚛ ᛟ ᚱ ᛞ ᛖ ᚱ ᛫ ᛋ ᛈ ᛖ ᛚ ᛚ ᛒ ᛟ ᛟ ᚲ ᚜
            </span>
          </span>
          <span className="text-[10px] tracking-[0.3em] text-[#ffd700] font-mono font-bold drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]">
            ᛫ ᛏ ᚺ ᚹ ᛫ PROLOGUE ᛫
          </span>
        </div>

        {/* Centerpiece: Title, Crest & Prompt */}
        <div className="relative my-auto flex flex-col items-center justify-center text-center py-4">
          {/* Rotating Geometric Crest */}
          <div className="relative size-24 sm:size-28 flex items-center justify-center mb-5">
            {/* Outer Radiant Astrolabe Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-dashed border-[#ffd700]/50 shadow-[0_0_20px_rgba(255,215,0,0.15)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            />
            {/* Inner Emerald Diamond */}
            <motion.div
              className="absolute inset-3 border-2 border-dotted border-[var(--lume-primary,#4affb4)]/60 shadow-[0_0_15px_rgba(74,255,180,0.2)]"
              animate={{ rotate: -360 }}
              transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
            />
            {/* Central Monogram Badge */}
            <div className="relative z-10 flex flex-col items-center justify-center size-14 rounded-2xl bg-white/[0.04] border border-white/20 shadow-[0_0_25px_rgba(74,255,180,0.2)] group-hover/titlepage:scale-105 transition-transform duration-300">
              <span className="font-mono font-bold text-lg sm:text-xl text-white tracking-tight">
                HW
              </span>
              <span className="text-[7px] font-mono tracking-widest text-[var(--lume-primary,#4affb4)] uppercase font-semibold">
                Systems
              </span>
            </div>
          </div>

          <span className="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-[#ffd700] uppercase mb-1 font-semibold flex items-center gap-1.5">
            <Terminal className="size-3 text-[var(--lume-primary,#4affb4)]" />
            Curriculum Vitae Arcana
          </span>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white tracking-tight leading-tight max-w-sm">
            CHRONICLES OF SYSTEMS & ARCHITECTURE
          </h1>

          <p className="text-xs sm:text-sm font-mono text-white/60 mt-2 tracking-wide max-w-xs sm:max-w-sm">
            Tan Hng Wu · Enterprise Engineering, Production Migrations & Application Support
          </p>

          {/* Interactive Turn to Chapter 1 Prompt with Auto-Timer Progress */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/15 group-hover/titlepage:bg-[var(--lume-primary,#4affb4)]/15 group-hover/titlepage:border-[var(--lume-primary)]/50 group-hover/titlepage:text-white transition-all shadow-md active:scale-95">
              <Sparkles className="size-3.5 text-[var(--lume-primary,#4affb4)] animate-pulse" />
              <span className="text-xs font-mono text-white/90 group-hover/titlepage:text-white font-medium">
                Turn to Chapter 1
              </span>
              <ChevronRight className="size-3.5 text-[var(--lume-primary,#4affb4)] transform group-hover/titlepage:translate-x-1 transition-transform" />
            </div>

            {/* Subtle Progress Bar */}
            <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--lume-primary,#4affb4)] transition-all duration-75 ease-linear shadow-[0_0_6px_var(--lume-primary)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-white/35">
              Click or auto-turning in {Math.max(0, Math.ceil((autoFlipDurationMs * (1 - progress / 100)) / 1000))}s
            </span>
          </div>
        </div>

        {/* Bottom Colophon Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-[10px] tracking-widest">
          <span className="font-mono text-[#ffd700]/80 tracking-[0.22em] font-semibold drop-shadow-[0_0_6px_rgba(255,215,0,0.3)]">
            FOLIO // 00 ᛫ HALF TITLE
          </span>
          <span className="font-serif text-[var(--lume-primary,#4affb4)]/80 tracking-[0.28em] font-semibold drop-shadow-[0_0_8px_rgba(74,255,180,0.3)]">
            ᚛ ᚨ ᚱ ᚲ ᚐ ᚾ ᛖ ᚜
          </span>
        </div>
      </div>
    </div>
  )
}
