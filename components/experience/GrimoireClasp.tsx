"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

export type ClaspLifecycleState =
  | "locked"
  | "unlatching"
  | "open"
  | "relatching"
  | "latched-sparkle"

interface GrimoireClaspProps {
  state: ClaspLifecycleState
  onClick?: () => void
  disabled?: boolean
}

interface SparkleParticle {
  id: number
  x: number
  y: number
  scale: number
  color: string
}

// 12 deterministic radial spark particles for the relatch snap puff
const LATCH_SPARKLES: SparkleParticle[] = [
  { id: 0, x: 24, y: 0, scale: 1.2, color: "#ffd700" },
  { id: 1, x: 18, y: 16, scale: 0.9, color: "#4affb4" },
  { id: 2, x: 0, y: 22, scale: 1.1, color: "#6affff" },
  { id: 3, x: -18, y: 16, scale: 0.8, color: "#ffffff" },
  { id: 4, x: -24, y: 0, scale: 1.3, color: "#ffd700" },
  { id: 5, x: -18, y: -16, scale: 0.9, color: "#4affb4" },
  { id: 6, x: 0, y: -22, scale: 1.0, color: "#6affff" },
  { id: 7, x: 18, y: -16, scale: 1.1, color: "#ffffff" },
  { id: 8, x: 12, y: 6, scale: 0.7, color: "#ffd700" },
  { id: 9, x: -12, y: -6, scale: 0.7, color: "#4affb4" },
  { id: 10, x: 6, y: -12, scale: 0.8, color: "#6affff" },
  { id: 11, x: -6, y: 12, scale: 0.8, color: "#ffd700" },
]

export function GrimoireClasp({ state, onClick, disabled = false }: GrimoireClaspProps) {
  const isLocked = state === "locked"
  const isUnlatching = state === "unlatching"
  const isOpen = state === "open"
  const isRelatching = state === "relatching"
  const isSparkling = state === "latched-sparkle"

  // Only render when not fully open
  if (isOpen) return null

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex items-center justify-center select-none ${
        isLocked && !disabled ? "cursor-pointer group/clasp" : "pointer-events-none"
      }`}
      style={{
        perspective: "1200px",
        transformStyle: "preserve-3d",
      }}
      aria-label="Grimoire Clasp"
      role="button"
      tabIndex={isLocked ? 0 : -1}
    >
      {/* 1. Latch Seam Mana Pulse & Radial Aura */}
      <motion.div
        className="absolute w-28 h-28 rounded-full blur-xl pointer-events-none"
        animate={{
          scale: isLocked ? [0.85, 1.15, 0.85] : isUnlatching ? 1.4 : [1.3, 0.9],
          opacity: isLocked ? [0.35, 0.7, 0.35] : isUnlatching ? 0.9 : 0.4,
        }}
        transition={{
          duration: isLocked ? 2.8 : 0.4,
          repeat: isLocked ? Infinity : 0,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle, rgba(74,255,180,0.4) 0%, rgba(255,215,0,0.2) 40%, transparent 75%)",
        }}
      />

      {/* 2. Left Anchor Plate (Riveted onto Left Door Wing) */}
      <motion.div
        className="relative -mr-1 w-14 h-16 rounded-l-xl bg-gradient-to-r from-[#18130f] via-[#241c14] to-[#3a2e20] border-y-2 border-l-2 border-[#b89758] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),-4px_4px_12px_rgba(0,0,0,0.8)] flex flex-col items-center justify-between p-1.5"
        animate={{
          x: isUnlatching ? -10 : 0,
          opacity: isUnlatching ? 0.4 : 1,
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {/* Top/Bottom Brass Rivets */}
        <div className="size-2 rounded-full bg-[#d4af37] border border-[#594318] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.7)]" />
        {/* Engraved Rune */}
        <span className="font-serif text-[10px] text-[#ffd700]/70 select-none drop-shadow-[0_0_3px_rgba(255,215,0,0.5)]">
          ᛟ
        </span>
        <div className="size-2 rounded-full bg-[#d4af37] border border-[#594318] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.7)]" />
      </motion.div>

      {/* 3. Center Clasp Mechanism (Hinged Latch Arm) */}
      <motion.div
        className="relative z-20 w-16 h-20 rounded-2xl bg-gradient-to-b from-[#2a2217] via-[#1b150f] to-[#0d0a07] border-2 border-[#d4af37] shadow-[0_10px_25px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.35)] flex flex-col items-center justify-center p-2 group-hover/clasp:scale-105 transition-transform"
        style={{
          transformOrigin: "left center",
          willChange: "transform, opacity",
        }}
        animate={{
          rotateY: isUnlatching ? -75 : isRelatching ? [40, -6, 0] : 0,
          scale: isUnlatching ? 0.92 : isRelatching ? [1.1, 0.98, 1] : 1,
          x: isUnlatching ? -6 : 0,
          opacity: isUnlatching ? 0.6 : 1,
        }}
        transition={{
          duration: isUnlatching ? 0.22 : isRelatching ? 0.35 : 0.2,
          ease: isRelatching ? [0.34, 1.25, 0.64, 1] : "easeOut",
        }}
      >
        {/* Latch Body Filigree Border */}
        <div className="absolute inset-1 border border-[#ffd700]/30 rounded-xl pointer-events-none" />

        {/* Center Glowing Mana Gem / Keyhole */}
        <div className="relative size-7 rounded-full bg-[#0a101d] border border-[#d4af37] shadow-[inset_0_0_8px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <motion.div
            className="size-4 rounded-full bg-[var(--lume-primary,#4affb4)] shadow-[0_0_10px_var(--lume-primary,#4affb4)]"
            animate={{
              scale: isLocked ? [0.85, 1.15, 0.85] : [1, 1.3, 1],
              opacity: isLocked ? [0.7, 1, 0.7] : 1,
            }}
            transition={{
              duration: isLocked ? 2.4 : 0.3,
              repeat: isLocked ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
          {/* Keyhole Silhouette */}
          <div className="absolute w-1 h-2 bg-[#05080f] rounded-t-sm" />
        </div>

        {/* Arcane Seal Lettering */}
        <div className="mt-1.5 flex items-center gap-1 font-mono text-[8px] text-[#ffd700]/90 tracking-widest uppercase">
          <span>ᛋ</span>
          <span>ᛖ</span>
          <span>ᚨ</span>
          <span>ᛚ</span>
        </div>
      </motion.div>

      {/* 4. Right Catch Plate (Riveted onto Right Door Wing) */}
      <motion.div
        className="relative -ml-1 w-14 h-16 rounded-r-xl bg-gradient-to-r from-[#3a2e20] via-[#241c14] to-[#18130f] border-y-2 border-r-2 border-[#b89758] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),4px_4px_12px_rgba(0,0,0,0.8)] flex flex-col items-center justify-between p-1.5"
        animate={{
          x: isUnlatching ? 10 : 0,
          opacity: isUnlatching ? 0.4 : 1,
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="size-2 rounded-full bg-[#d4af37] border border-[#594318] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.7)]" />
        <span className="font-serif text-[10px] text-[#ffd700]/70 select-none drop-shadow-[0_0_3px_rgba(255,215,0,0.5)]">
          ᛗ
        </span>
        <div className="size-2 rounded-full bg-[#d4af37] border border-[#594318] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.7)]" />
      </motion.div>

      {/* 5. Particle Sparkle & Puff Burst on Relatch */}
      <AnimatePresence>
        {(isSparkling || isRelatching) && (
          <motion.div
            key="relatch-sparkles"
            className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-visible"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Latch-point central flash */}
            <motion.div
              className="absolute size-14 rounded-full bg-white blur-md"
              initial={{ scale: 0.2, opacity: 0.9 }}
              animate={{ scale: [0.2, 1.8], opacity: [0.9, 0] }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />

            {/* Sparkle puff particles */}
            {LATCH_SPARKLES.map((sparkle) => (
              <motion.div
                key={sparkle.id}
                className="absolute rounded-full shadow-[0_0_6px_currentColor]"
                style={{
                  width: 4 * sparkle.scale,
                  height: 4 * sparkle.scale,
                  backgroundColor: sparkle.color,
                  color: sparkle.color,
                }}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: sparkle.x * 1.5,
                  y: sparkle.y * 1.5,
                  scale: [0, sparkle.scale * 1.2, 0],
                  opacity: [1, 0.8, 0],
                }}
                transition={{
                  duration: 0.45,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
