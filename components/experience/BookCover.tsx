"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { BookOpen, Sparkles, Terminal } from "lucide-react"

interface BookCoverProps {
  isOpening: boolean
  onOpenComplete?: () => void
  onManualOpen?: () => void
}

export function BookCover({ isOpening, onOpenComplete, onManualOpen }: BookCoverProps) {
  return (
    <div
      className="relative w-full max-w-md md:max-w-lg lg:max-w-xl h-[72vh] max-h-[720px] min-h-[500px] flex items-center justify-center p-2"
      style={{ perspective: "2600px" }}
    >
      {/* 3D Hinged Cover Board */}
      <motion.div
        className="relative w-full h-full rounded-3xl cursor-pointer border border-white/20 bg-[#070912] shadow-[0_30px_90px_rgba(0,0,0,0.92),0_0_50px_rgba(74,255,180,0.08)] flex flex-col justify-between p-8 md:p-12 select-none overflow-hidden"
        style={{
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
        }}
        initial={{ rotateY: 0, scale: 0.94, opacity: 0 }}
        animate={
          isOpening
            ? {
                rotateY: -180,
                opacity: [1, 1, 0],
                scale: [0.98, 1.02, 1],
                transition: {
                  duration: 0.85,
                  ease: [0.25, 1, 0.5, 1],
                },
              }
            : {
                rotateY: 0,
                scale: 1,
                opacity: 1,
                transition: { duration: 0.45, ease: "easeOut" },
              }
        }
        onAnimationComplete={() => {
          if (isOpening && onOpenComplete) {
            onOpenComplete()
          }
        }}
        onClick={onManualOpen}
        whileHover={!isOpening ? { scale: 1.01, rotateY: -3 } : undefined}
      >
        {/* Subtle Brushed Leather/Glass Texture Highlights */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-black/60 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--lume-primary,#4affb4)]/50 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--mode-accent-bright,#6affff)]/40 to-transparent pointer-events-none" />

        {/* Outer Spine Left Binding Band */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/10 via-white/5 to-transparent border-r border-white/10 flex flex-col justify-around items-center py-8">
          <div className="size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)]/70 shadow-[0_0_8px_var(--lume-primary)]" />
          <div className="size-1.5 rounded-full bg-white/40" />
          <div className="size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)]/70 shadow-[0_0_8px_var(--lume-primary)]" />
        </div>

        {/* Metallic Corner Clasps */}
        <div className="absolute top-3 left-3 size-5 border-t-2 border-l-2 border-[var(--lume-primary,#4affb4)]/60 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-3 right-3 size-5 border-t-2 border-r-2 border-[var(--lume-primary,#4affb4)]/60 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-3 left-3 size-5 border-b-2 border-l-2 border-[var(--lume-primary,#4affb4)]/60 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-3 right-3 size-5 border-b-2 border-r-2 border-[var(--lume-primary,#4affb4)]/60 rounded-br-lg pointer-events-none" />

        {/* Top Header of Tome */}
        <div className="relative z-10 flex items-center justify-between pl-6">
          <span className="font-mono text-[10px] md:text-xs text-[var(--lume-primary,#4affb4)] uppercase tracking-widest flex items-center gap-1.5">
            <Terminal className="size-3.5 text-[var(--lume-primary)]" />
            Classified Dossier
          </span>
          <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
            2023 — Present
          </span>
        </div>

        {/* Centerpiece: Geometric Emblem & Monogram */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center pl-6">
          <div className="relative size-28 md:size-32 flex items-center justify-center mb-6">
            {/* Outer Rotating Coordinate Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border border-dashed border-[var(--lume-primary,#4affb4)]/40"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            {/* Middle Inscribed Diamond */}
            <motion.div
              className="absolute inset-3 border border-[var(--mode-accent-bright,#6affff)]/30"
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            />
            {/* Center Monogram Shield */}
            <div className="size-16 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-xl flex flex-col items-center justify-center shadow-[0_0_30px_rgba(74,255,180,0.18)] group-hover:scale-105 transition-transform">
              <span className="font-mono font-bold text-2xl tracking-tighter text-white">
                HW
              </span>
              <span className="text-[8px] font-mono tracking-widest text-[var(--lume-primary,#4affb4)] uppercase">
                Systems
              </span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight leading-snug">
            Professional Experience
          </h1>
          <p className="text-xs md:text-sm font-mono text-white/60 mt-2 tracking-wide max-w-xs">
            Full-Stack Software Engineering & IT Systems Support
          </p>
        </div>

        {/* Bottom Call to Action */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 pl-6 text-xs font-mono text-white/50">
          <span className="flex items-center gap-1 text-[var(--lume-primary,#4affb4)]">
            <Sparkles className="size-3" />
            Click to Open
          </span>
          <span className="flex items-center gap-1.5 text-white/40">
            <BookOpen className="size-3.5" />
            5 Chapters
          </span>
        </div>
      </motion.div>
    </div>
  )
}
