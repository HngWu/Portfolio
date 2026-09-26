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
      className={`relative w-full h-full overflow-hidden bg-gradient-to-b from-[#0c1228] via-[#070b1a] to-[#04060e] select-none ${
        isLeft
          ? "rounded-l-3xl border-l border-y border-white/25 shadow-[15px_0_35px_rgba(0,0,0,0.85)]"
          : "rounded-r-3xl border-r border-y border-white/25 shadow-[-15px_0_35px_rgba(0,0,0,0.85)]"
      }`}
    >
      {/* 1. Luminous Ambient Radial Mana Halo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,255,180,0.12)_0%,rgba(255,215,0,0.08)_45%,transparent_75%)] pointer-events-none" />

      {/* 2. Parchment Blueprint Grid Watermark */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* 3. Inner Gilded Deckle Margin Frame */}
      <div className="absolute inset-3 border border-white/[0.12] rounded-2xl pointer-events-none" />
      <div className="absolute inset-4 border border-dashed border-[var(--lume-primary,#4affb4)]/30 rounded-xl pointer-events-none" />

      {/* 4. Spine Crease Shadow Gradient */}
      <div
        className={`absolute top-0 bottom-0 w-12 pointer-events-none z-10 ${
          isLeft
            ? "right-0 bg-gradient-to-l from-black/90 via-black/45 to-transparent"
            : "left-0 bg-gradient-to-r from-black/90 via-black/45 to-transparent"
        }`}
      />

      {/* 5. Metallic Corner Clasps with Gilded Rivets */}
      <div
        className={`absolute top-3.5 size-6 border-t-2 border-[var(--lume-primary,#4affb4)]/70 pointer-events-none ${
          isLeft ? "left-3.5 border-l-2 rounded-tl-md" : "right-3.5 border-r-2 rounded-tr-md"
        }`}
      >
        <div
          className={`absolute top-1 size-1.5 rounded-full bg-[#ffd700] shadow-[0_0_6px_#ffd700] ${
            isLeft ? "left-1" : "right-1"
          }`}
        />
      </div>
      <div
        className={`absolute bottom-3.5 size-6 border-b-2 border-[var(--lume-primary,#4affb4)]/70 pointer-events-none ${
          isLeft ? "left-3.5 border-l-2 rounded-bl-md" : "right-3.5 border-r-2 rounded-br-md"
        }`}
      >
        <div
          className={`absolute bottom-1 size-1.5 rounded-full bg-[#ffd700] shadow-[0_0_6px_#ffd700] ${
            isLeft ? "left-1" : "right-1"
          }`}
        />
      </div>

      {/* 6. Ancient Runic Script along Top and Bottom Margins (High Contrast, Radiant) */}
      <div className="relative z-10 p-5 sm:p-7 flex flex-col justify-between h-full font-mono">
        {/* Top Runic Header Line */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-[11px] tracking-widest">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)] shadow-[0_0_6px_var(--lume-primary)]" />
            <span className="font-serif tracking-[0.28em] text-[var(--lume-primary,#4affb4)]/80 text-[12px] font-semibold drop-shadow-[0_0_8px_rgba(74,255,180,0.3)]">
              ᚛ ᛟ ᚱ ᛞ ᛖ ᚱ ᛫ ᛋ ᛈ ᛖ ᛚ ᛚ ᛒ ᛟ ᛟ ᚲ ᚜
            </span>
          </span>
          <span className="text-[10px] tracking-[0.3em] text-[#ffd700] font-mono font-bold drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]">
            ᛫ ᛏ ᚺ ᚹ ᛫ 0{variant} ᛫
          </span>
        </div>

        {/* Center: Radiant Concentric Astrolabe & Sacred Geometry Watermark */}
        <div className="relative my-auto flex items-center justify-center pointer-events-none py-6">
          <div className="relative size-48 sm:size-56 flex items-center justify-center">
            {/* Outer Radiant Astrolabe Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-dashed border-[#ffd700]/55 shadow-[0_0_20px_rgba(255,215,0,0.15)]"
              animate={{ rotate: 360 + rot1 }}
              transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
            />

            {/* Golden Graduation Ticks Ring */}
            <div className="absolute inset-3 rounded-full border border-white/15" />

            {/* Middle Glowing Emerald Compass Ring */}
            <motion.div
              className="absolute inset-7 rounded-full border-2 border-dotted border-[var(--lume-primary,#4affb4)]/60 shadow-[0_0_15px_rgba(74,255,180,0.2)]"
              animate={{ rotate: -360 + rot2 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            />

            {/* Sacred Geometry Square / Diamond Tetragram */}
            <div
              className="absolute inset-11 border border-white/20"
              style={{ transform: `rotate(${45 + rot1}deg)` }}
            />
            <div
              className="absolute inset-11 border-2 border-[var(--lume-primary,#4affb4)]/35 shadow-[0_0_12px_rgba(74,255,180,0.15)]"
              style={{ transform: `rotate(${rot1}deg)` }}
            />

            {/* Inner Astrolabe Core Ring */}
            <div className="absolute inset-16 rounded-full border-2 border-[#ffd700]/50 shadow-[0_0_20px_rgba(255,215,0,0.25)]" />

            {/* Central Mystical Runic Emblem Glyph with Glowing Core */}
            <div className="relative z-10 flex flex-col items-center justify-center size-14 rounded-2xl bg-white/[0.04] border border-white/20 shadow-[0_0_25px_rgba(74,255,180,0.25)]">
              <span className="text-2xl font-serif text-[#ffd700] select-none font-bold drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]">
                {variant === 1 ? "ᛟ" : variant === 2 ? "ᚲ" : "ᚨ"}
              </span>
              <div className="size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)] shadow-[0_0_8px_var(--lume-primary)] mt-0.5" />
            </div>

            {/* Radial Cardinal Tick Markers */}
            <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-[#ffd700] shadow-[0_0_6px_#ffd700]" />
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-[#ffd700] shadow-[0_0_6px_#ffd700]" />
            <div className="absolute left-0.5 top-1/2 -translate-y-1/2 h-0.5 w-3 bg-[#ffd700] shadow-[0_0_6px_#ffd700]" />
            <div className="absolute right-0.5 top-1/2 -translate-y-1/2 h-0.5 w-3 bg-[#ffd700] shadow-[0_0_6px_#ffd700]" />
          </div>
        </div>

        {/* Bottom Runic Colophon & Margin Graduation Line */}
        <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-[10px] tracking-widest">
          <span className="font-mono text-[#ffd700]/80 tracking-[0.22em] font-semibold drop-shadow-[0_0_6px_rgba(255,215,0,0.3)]">
            FOLIO // {variant} ᛫ ᛞ ᛖ ᛖ ᛈ ᛫ ᛞ ᛁ ᚡ ᛖ
          </span>
          <span className="font-serif text-[var(--lume-primary,#4affb4)]/80 tracking-[0.28em] font-semibold drop-shadow-[0_0_8px_rgba(74,255,180,0.3)]">
            ᚛ ᚨ ᚱ ᚲ ᚐ ᚾ ᛖ ᚜
          </span>
        </div>
      </div>
    </div>
  )
}
