"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Sparkles, Terminal, ChevronRight, ShieldCheck, Lock } from "lucide-react"

interface BookCoverFaceProps {
  onOpen?: () => void
}

export function BookCoverFace({ onOpen }: BookCoverFaceProps) {
  return (
    <div
      onClick={onOpen}
      className="relative w-full h-full flex flex-col justify-between p-6 sm:p-8 md:p-12 select-none overflow-hidden bg-[#070913] rounded-2xl sm:rounded-3xl shadow-[inset_0_0_80px_rgba(0,0,0,0.85)] cursor-pointer group/cover"
    >
      {/* Decorative Gilded Inner Foil Frame */}
      <div className="absolute inset-3 border border-white/[0.08] rounded-2xl pointer-events-none" />
      <div className="absolute inset-4 border border-dashed border-white/[0.04] rounded-xl pointer-events-none" />

      {/* Subtle Luminous Leather/Glass Gradient Textures */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-black/85 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--lume-primary,#4affb4)]/50 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--mode-accent-bright,#6affff)]/40 to-transparent pointer-events-none" />

      {/* Decorative Spine Stitching Line (Left Border) */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/80 via-white/[0.04] to-transparent border-r border-white/10 flex flex-col justify-around items-center py-8">
        <div className="size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)]/60 shadow-[0_0_6px_var(--lume-primary)]" />
        <div className="size-1.5 rounded-full bg-white/30" />
        <div className="size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)]/60 shadow-[0_0_6px_var(--lume-primary)]" />
      </div>

      {/* Metallic Corner Clasps with Gilded Screws */}
      <div className="absolute top-4 right-4 size-7 border-t-2 border-r-2 border-[var(--lume-primary,#4affb4)]/60 rounded-tr-lg pointer-events-none">
        <div className="absolute top-1 right-1 size-1 rounded-full bg-[var(--lume-primary,#4affb4)] shadow-[0_0_4px_var(--lume-primary)]" />
      </div>
      <div className="absolute bottom-4 right-4 size-7 border-b-2 border-r-2 border-[var(--lume-primary,#4affb4)]/60 rounded-br-lg pointer-events-none">
        <div className="absolute bottom-1 right-1 size-1 rounded-full bg-[var(--lume-primary,#4affb4)] shadow-[0_0_4px_var(--lume-primary)]" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between pl-6 border-b border-white/10 pb-4">
        <span className="font-mono text-[10px] md:text-xs text-[var(--lume-primary,#4affb4)] uppercase tracking-widest flex items-center gap-1.5 font-medium">
          <Terminal className="size-3.5 text-[var(--lume-primary)]" />
          Technical Archive
        </span>
        <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 flex items-center gap-1.5 shadow-sm">
          <Lock className="size-3 text-[var(--lume-primary)]" />
          Classified Dossier
        </span>
      </div>

      {/* Centerpiece: Technical Geometric Crest */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center pl-6">
        <div className="relative size-28 md:size-32 flex items-center justify-center mb-6">
          {/* Outer Technical Dashed Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-dashed border-[var(--lume-primary,#4affb4)]/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          />
          {/* Middle Coordinate Diamond */}
          <motion.div
            className="absolute inset-3 border border-[var(--mode-accent-bright,#6affff)]/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
          />
          {/* Center Monogram Shield */}
          <div className="size-16 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-xl flex flex-col items-center justify-center shadow-[0_0_30px_rgba(74,255,180,0.18)] group-hover/cover:scale-105 group-hover/cover:border-[var(--lume-primary,#4affb4)]/50 transition-all duration-300">
            <span className="font-mono font-bold text-2xl tracking-tighter text-white">
              HW
            </span>
            <span className="text-[8px] font-mono tracking-widest text-[var(--lume-primary,#4affb4)] uppercase font-semibold">
              Systems
            </span>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
          Professional Experience
        </h2>
        <p className="text-xs md:text-sm font-mono text-white/60 mt-2 tracking-wide max-w-xs">
          Full-Stack Engineering & IT Application Support
        </p>

        {/* Luminous Open Cue Pill */}
        <div className="mt-8 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 group-hover/cover:bg-[var(--lume-primary,#4affb4)]/15 group-hover/cover:border-[var(--lume-primary,#4affb4)]/50 group-hover/cover:text-white transition-all shadow-md active:scale-95">
          <Sparkles className="size-3.5 text-[var(--lume-primary,#4affb4)] animate-pulse" />
          <span className="text-xs font-mono text-white/90 group-hover/cover:text-white font-medium">
            Click to Open Dossier
          </span>
          <ChevronRight className="size-3.5 text-[var(--lume-primary,#4affb4)] transform group-hover/cover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 pl-6 text-xs font-mono text-white/40">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-[var(--lume-primary,#4affb4)]" />
          2 Career Chapters
        </span>
        <span className="tracking-wider uppercase text-[11px] text-white/60">Tan Hng Wu</span>
      </div>
    </div>
  )
}
