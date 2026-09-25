"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Shield, Lock, CheckCircle2, Terminal, QrCode } from "lucide-react"

export function BookBackCoverFace() {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-8 md:p-12 select-none overflow-hidden bg-[#070913] rounded-2xl sm:rounded-3xl shadow-[inset_0_0_80px_rgba(0,0,0,0.85)] border border-white/10">
      {/* Decorative Gilded Inner Foil Frame */}
      <div className="absolute inset-3 border border-white/[0.08] rounded-2xl pointer-events-none" />
      <div className="absolute inset-4 border border-dashed border-white/[0.04] rounded-xl pointer-events-none" />

      {/* Subtle Luminous Leather/Glass Gradient Textures */}
      <div className="absolute inset-0 bg-gradient-to-bl from-white/[0.06] via-transparent to-black/90 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--lume-primary,#4affb4)]/40 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--mode-accent-bright,#6affff)]/30 to-transparent pointer-events-none" />

      {/* Decorative Spine Stitching Line (Right Border for back cover) */}
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/80 via-white/[0.04] to-transparent border-l border-white/10 flex flex-col justify-around items-center py-8">
        <div className="size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)]/60 shadow-[0_0_6px_var(--lume-primary)]" />
        <div className="size-1.5 rounded-full bg-white/30" />
        <div className="size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)]/60 shadow-[0_0_6px_var(--lume-primary)]" />
      </div>

      {/* Metallic Corner Clasps (Left side corners for back cover) */}
      <div className="absolute top-4 left-4 size-7 border-t-2 border-l-2 border-[var(--lume-primary,#4affb4)]/60 rounded-tl-lg pointer-events-none">
        <div className="absolute top-1 left-1 size-1 rounded-full bg-[var(--lume-primary,#4affb4)] shadow-[0_0_4px_var(--lume-primary)]" />
      </div>
      <div className="absolute bottom-4 left-4 size-7 border-b-2 border-l-2 border-[var(--lume-primary,#4affb4)]/60 rounded-bl-lg pointer-events-none">
        <div className="absolute bottom-1 left-1 size-1 rounded-full bg-[var(--lume-primary,#4affb4)] shadow-[0_0_4px_var(--lume-primary)]" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between pr-6 border-b border-white/10 pb-4">
        <span className="font-mono text-[10px] md:text-xs text-[var(--lume-primary,#4affb4)] uppercase tracking-widest flex items-center gap-1.5 font-medium">
          <Terminal className="size-3.5 text-[var(--lume-primary)]" />
          Archive Complete
        </span>
        <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 flex items-center gap-1.5 shadow-sm">
          <Lock className="size-3 text-[var(--lume-primary)]" />
          Dossier Sealed
        </span>
      </div>

      {/* Centerpiece: Back Seal & Colophon */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center pr-6">
        <div className="relative size-24 md:size-28 flex items-center justify-center mb-5">
          {/* Outer Dashed Orbit */}
          <motion.div
            className="absolute inset-0 rounded-full border border-dashed border-[var(--lume-primary,#4affb4)]/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner Coordinate Diamond */}
          <motion.div
            className="absolute inset-2 border border-[var(--mode-accent-bright,#6affff)]/25"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
          {/* Center Monogram Shield */}
          <div className="size-14 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-xl flex flex-col items-center justify-center shadow-[0_0_25px_rgba(74,255,180,0.15)]">
            <Shield className="size-6 text-[var(--lume-primary,#4affb4)] mb-0.5" />
            <span className="text-[7px] font-mono tracking-widest text-white/70 uppercase">
              Archived
            </span>
          </div>
        </div>

        <h3 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight leading-tight">
          Tan Hng Wu
        </h3>
        <p className="text-xs font-mono text-white/60 mt-1.5 tracking-wide max-w-xs">
          Engineering Dossier & Career Chapters
        </p>

        {/* Latch Status Indicator */}
        <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 shadow-sm">
          <CheckCircle2 className="size-3.5 text-[var(--lume-primary,#4affb4)]" />
          <span className="text-[11px] font-mono text-white/80">
            Session Record Stored & Encrypted
          </span>
        </div>
      </div>

      {/* Bottom Technical Strip: Barcode Graphic & Serial */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 pr-6 text-xs font-mono text-white/40">
        <div className="flex items-center gap-2">
          {/* Stylized Barcode Graphic */}
          <div className="flex items-center gap-[2px] h-4 opacity-40">
            <span className="w-[1.5px] h-full bg-white" />
            <span className="w-[3px] h-full bg-white" />
            <span className="w-[1px] h-full bg-white" />
            <span className="w-[2px] h-full bg-white" />
            <span className="w-[1px] h-full bg-white" />
            <span className="w-[3px] h-full bg-white" />
            <span className="w-[1.5px] h-full bg-white" />
          </div>
          <span className="text-[10px] tracking-widest uppercase text-white/50">
            THW-2026-EXP
          </span>
        </div>
        <span className="tracking-wider uppercase text-[10px] text-white/50">
          Systems Archive
        </span>
      </div>
    </div>
  )
}
