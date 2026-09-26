"use client"

import * as React from "react"
import { motion } from "framer-motion"

export interface BlankRunicPageProps {
  side?: "left" | "right"
  variant?: 1 | 2 | 3
}

export function BlankRunicPage({ side = "right", variant = 1 }: BlankRunicPageProps) {
  const isLeft = side === "left"

  // Rotational offsets based on variant to create visual diversity across fluttering leaves
  const rot1 = variant === 1 ? 0 : variant === 2 ? 45 : 90
  const rot2 = variant === 1 ? 0 : variant === 2 ? -30 : -60

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-gradient-to-b from-[#070a14] via-[#05070e] to-[#030408] select-none ${
        isLeft
          ? "rounded-l-3xl border-l border-y border-white/20 shadow-[15px_0_35px_rgba(0,0,0,0.85)]"
          : "rounded-r-3xl border-r border-y border-white/20 shadow-[-15px_0_35px_rgba(0,0,0,0.85)]"
      }`}
    >
      {/* 1. Parchment Blueprint Grid Watermark */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* 2. Inner Deckle Margin Frame */}
      <div className="absolute inset-3 border border-white/[0.08] rounded-2xl pointer-events-none" />
      <div className="absolute inset-4 border border-dashed border-[var(--lume-primary,#4affb4)]/[0.12] rounded-xl pointer-events-none" />

      {/* 3. Spine Crease Shadow Gradient */}
      <div
        className={`absolute top-0 bottom-0 w-10 pointer-events-none z-10 ${
          isLeft
            ? "right-0 bg-gradient-to-l from-black/85 via-black/40 to-transparent"
            : "left-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent"
        }`}
      />

      {/* 4. Metallic Corner Clasps with Gilded Rivets */}
      <div
        className={`absolute top-3.5 size-5 border-t border-[var(--lume-primary,#4affb4)]/50 pointer-events-none ${
          isLeft ? "left-3.5 border-l rounded-tl-md" : "right-3.5 border-r rounded-tr-md"
        }`}
      >
        <div
          className={`absolute top-1 size-1 rounded-full bg-[#ffd700]/70 shadow-[0_0_4px_#ffd700] ${
            isLeft ? "left-1" : "right-1"
          }`}
        />
      </div>
      <div
        className={`absolute bottom-3.5 size-5 border-b border-[var(--lume-primary,#4affb4)]/50 pointer-events-none ${
          isLeft ? "left-3.5 border-l rounded-bl-md" : "right-3.5 border-r rounded-br-md"
        }`}
      >
        <div
          className={`absolute bottom-1 size-1 rounded-full bg-[#ffd700]/70 shadow-[0_0_4px_#ffd700] ${
            isLeft ? "left-1" : "right-1"
          }`}
        />
      </div>

      {/* 5. Ancient Runic Script along Top and Bottom Margins (Zero English / Job Text) */}
      <div className="relative z-10 p-5 sm:p-7 flex flex-col justify-between h-full font-mono">
        {/* Top Runic Header Line */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[10px] tracking-widest text-white/30">
          <span className="flex items-center gap-2">
            <span className="size-1 rounded-full bg-[var(--lume-primary,#4affb4)]/60 shadow-[0_0_4px_var(--lume-primary)]" />
            <span className="font-serif tracking-[0.25em] text-[var(--lume-primary,#4affb4)]/50 text-[11px]">
              ᚛ ᛟ ᚱ ᛞ ᛖ ᚱ ᛫ ᛋ ᛈ ᛖ ᛚ ᛚ ᛒ ᛟ ᛟ ᚲ ᚜
            </span>
          </span>
          <span className="text-[9px] tracking-[0.3em] text-[#ffd700]/40 font-mono">
            ᛫ ᛏ ᚺ ᚹ ᛫ 0{variant} ᛫
          </span>
        </div>

        {/* Center: Concentric Sacred Geometry & Astrolabe Watermark */}
        <div className="relative my-auto flex items-center justify-center pointer-events-none py-6">
          <div className="relative size-44 sm:size-52 flex items-center justify-center">
            {/* Outer Concentric Astrolabe Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border border-dashed border-[#ffd700]/25"
              animate={{ rotate: 360 + rot1 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />

            {/* Subtle Golden Graduation Marks Ring */}
            <div className="absolute inset-3 rounded-full border border-white/[0.06]" />

            {/* Middle Runic Emerald Compass Ring */}
            <motion.div
              className="absolute inset-7 rounded-full border border-dotted border-[var(--lume-primary,#4affb4)]/30"
              animate={{ rotate: -360 + rot2 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            />

            {/* Sacred Geometry Square / Diamond Tetragram */}
            <div
              className="absolute inset-11 border border-white/[0.08]"
              style={{ transform: `rotate(${45 + rot1}deg)` }}
            />
            <div
              className="absolute inset-11 border border-[var(--lume-primary,#4affb4)]/[0.14]"
              style={{ transform: `rotate(${rot1}deg)` }}
            />

            {/* Inner Astrolabe Core Ring */}
            <div className="absolute inset-16 rounded-full border border-[#ffd700]/30 shadow-[0_0_20px_rgba(255,215,0,0.06)]" />

            {/* Central Mystical Runic Emblem Glyph */}
            <div className="relative z-10 flex flex-col items-center justify-center size-12 rounded-xl bg-white/[0.02] border border-white/10 shadow-[0_0_15px_rgba(74,255,180,0.1)]">
              <span className="text-lg font-serif text-[#ffd700]/70 select-none">
                {variant === 1 ? "ᛟ" : variant === 2 ? "ᚲ" : "ᚨ"}
              </span>
              <div className="size-1 rounded-full bg-[var(--lume-primary,#4affb4)]/80 shadow-[0_0_6px_var(--lume-primary)] mt-0.5" />
            </div>

            {/* Radial Cardinal Tick Markers */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-[#ffd700]/40" />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-[#ffd700]/40" />
            <div className="absolute left-1 top-1/2 -translate-y-1/2 h-0.5 w-2 bg-[#ffd700]/40" />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 h-0.5 w-2 bg-[#ffd700]/40" />
          </div>
        </div>

        {/* Bottom Runic Colophon & Margin Graduation Line */}
        <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 text-[9px] tracking-widest text-white/30">
          <span className="font-mono text-[#ffd700]/35 tracking-[0.2em]">
            FOLIO // {variant} ᛫ ᛞ ᛖ ᛖ ᛈ ᛫ ᛞ ᛁ ᚡ ᛖ
          </span>
          <span className="font-serif text-[var(--lume-primary,#4affb4)]/45 tracking-[0.25em]">
            ᚛ ᚨ ᚱ ᚲ ᚐ ᚾ ᛖ ᚜
          </span>
        </div>
      </div>
    </div>
  )
}
