"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { BlankRunicPage } from "./BlankRunicPage"

export interface GrimoireDoubleCoverProps {
  mode: "closed" | "opening" | "open" | "closing"
  onOpenComplete?: () => void
  onCloseComplete?: () => void
  onManualOpen?: () => void
}

export function GrimoireDoubleCover({
  mode,
  onOpenComplete,
  onCloseComplete,
  onManualOpen,
}: GrimoireDoubleCoverProps) {
  const isClosed = mode === "closed"
  const isOpening = mode === "opening"
  const isOpen = mode === "open"
  const isClosing = mode === "closing"

  if (isOpen) return null

  // Ease-with-overshoot for physical leather cover inertia
  const openTransition = {
    duration: 1.15,
    ease: [0.32, 0.04, 0.22, 1] as unknown as [number, number, number, number],
  }

  const closeTransition = {
    duration: 0.85,
    ease: [0.32, 0.04, 0.22, 1] as unknown as [number, number, number, number],
  }

  const currentTransition = isOpening ? openTransition : isClosing ? closeTransition : { duration: 0.01 }

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30 select-none overflow-visible"
      style={{
        perspective: "2600px",
        transformStyle: "preserve-3d",
      }}
      aria-hidden={isOpen}
    >
      {/* Center Seam Pulsing Magical Glow (Visible while closed or beginning to part) */}
      {(isClosed || isClosing) && (
        <motion.div
          className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 pointer-events-none z-40"
          animate={{
            opacity: [0.4, 0.85, 0.4],
            scaleX: [0.9, 1.2, 0.9],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-[var(--lume-primary,#4affb4)]/50 to-transparent blur-md" />
        </motion.div>
      )}

      {/* LEFT COVER DOOR (Hinges at far-left spine, swings 0 -> -165deg) */}
      <div
        className="absolute top-0 bottom-0 left-0 w-1/2"
        style={{
          perspective: "2600px",
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
          initial={{ rotateY: 0 }}
          animate={{
            rotateY: isClosed ? 0 : isOpening ? -165 : isClosing ? 0 : -165,
          }}
          transition={currentTransition}
          onAnimationComplete={() => {
            if (isOpening && onOpenComplete) onOpenComplete()
            if (isClosing && onCloseComplete) onCloseComplete()
          }}
        >
          {/* FRONT FACE OF LEFT DOOR (Rich Leather, gilded corners, Celtic knots) */}
          <div
            onClick={isClosed ? onManualOpen : undefined}
            className={`absolute inset-0 w-full h-full overflow-hidden rounded-l-3xl border-l-2 border-y-2 border-[#b89758]/50 bg-gradient-to-br from-[#1a1410] via-[#0d0a08] to-[#050403] shadow-[-12px_18px_45px_rgba(0,0,0,0.92),inset_0_0_60px_rgba(0,0,0,0.95)] ${
              isClosed ? "cursor-pointer pointer-events-auto" : "pointer-events-none"
            }`}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(0deg) translateZ(1px)",
            }}
          >
            {/* Leather Texture & Stipple Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-white/[0.04] pointer-events-none" />
            <div className="absolute inset-3 border border-[#b89758]/20 rounded-2xl pointer-events-none" />
            <div className="absolute inset-4 border border-dashed border-[#ffd700]/25 rounded-xl pointer-events-none" />

            {/* Left Top & Bottom Metallic Corner Reinforcements */}
            <div className="absolute top-3 left-3 size-8 border-t-2 border-l-2 border-[#d4af37] rounded-tl-lg pointer-events-none">
              <div className="absolute top-1 left-1 size-1.5 rounded-full bg-[#ffd700] shadow-[0_0_4px_#ffd700]" />
            </div>
            <div className="absolute bottom-3 left-3 size-8 border-b-2 border-l-2 border-[#d4af37] rounded-bl-lg pointer-events-none">
              <div className="absolute bottom-1 left-1 size-1.5 rounded-full bg-[#ffd700] shadow-[0_0_4px_#ffd700]" />
            </div>

            {/* Spine Hinge Studs along the Left Margin */}
            <div className="absolute left-2 top-0 bottom-0 w-3 flex flex-col justify-around items-center py-6 pointer-events-none opacity-60">
              <div className="size-1.5 rounded-full bg-[#d4af37] shadow-[0_0_3px_#ffd700]" />
              <div className="size-1.5 rounded-full bg-[#d4af37] shadow-[0_0_3px_#ffd700]" />
              <div className="size-1.5 rounded-full bg-[#d4af37] shadow-[0_0_3px_#ffd700]" />
            </div>

            {/* Center Left Sigil / Seal */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="relative size-20 sm:size-24 rounded-full border border-dashed border-[#d4af37]/40 flex items-center justify-center mb-3">
                <span className="font-serif text-2xl sm:text-3xl text-[#ffd700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                  ᚛ ᛟ ᚜
                </span>
              </div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-white tracking-wider">
                GRIMOIRE
              </h2>
              <span className="text-[10px] font-mono tracking-widest text-[var(--lume-primary,#4affb4)] uppercase mt-1">
                Volume I · Career Arcana
              </span>
            </div>

            {/* Dynamic Traveling Shading as door swings */}
            {isOpening && (
              <motion.div
                className="absolute inset-0 bg-black pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.7, 0.95] }}
                transition={openTransition}
              />
            )}
          </div>

          {/* BACK FACE OF LEFT DOOR (Blank Runic Endpaper) */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg) translateZ(1px)",
            }}
          >
            <BlankRunicPage side="left" variant={1} />
          </div>
        </motion.div>
      </div>

      {/* RIGHT COVER DOOR (Hinges at far-right spine, swings 0 -> +165deg) */}
      <div
        className="absolute top-0 bottom-0 right-0 w-1/2"
        style={{
          perspective: "2600px",
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            transformOrigin: "right center",
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
          initial={{ rotateY: 0 }}
          animate={{
            rotateY: isClosed ? 0 : isOpening ? 165 : isClosing ? 0 : 165,
          }}
          transition={currentTransition}
        >
          {/* FRONT FACE OF RIGHT DOOR (Rich Leather, gilded corners, seal) */}
          <div
            onClick={isClosed ? onManualOpen : undefined}
            className={`absolute inset-0 w-full h-full overflow-hidden rounded-r-3xl border-r-2 border-y-2 border-[#b89758]/50 bg-gradient-to-bl from-[#1a1410] via-[#0d0a08] to-[#050403] shadow-[12px_18px_45px_rgba(0,0,0,0.92),inset_0_0_60px_rgba(0,0,0,0.95)] ${
              isClosed ? "cursor-pointer pointer-events-auto" : "pointer-events-none"
            }`}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(0deg) translateZ(1px)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tl from-black/80 via-transparent to-white/[0.04] pointer-events-none" />
            <div className="absolute inset-3 border border-[#b89758]/20 rounded-2xl pointer-events-none" />
            <div className="absolute inset-4 border border-dashed border-[#ffd700]/25 rounded-xl pointer-events-none" />

            {/* Right Top & Bottom Metallic Corner Reinforcements */}
            <div className="absolute top-3 right-3 size-8 border-t-2 border-r-2 border-[#d4af37] rounded-tr-lg pointer-events-none">
              <div className="absolute top-1 right-1 size-1.5 rounded-full bg-[#ffd700] shadow-[0_0_4px_#ffd700]" />
            </div>
            <div className="absolute bottom-3 right-3 size-8 border-b-2 border-r-2 border-[#d4af37] rounded-br-lg pointer-events-none">
              <div className="absolute bottom-1 right-1 size-1.5 rounded-full bg-[#ffd700] shadow-[0_0_4px_#ffd700]" />
            </div>

            {/* Right Hinge Margin Studs */}
            <div className="absolute right-2 top-0 bottom-0 w-3 flex flex-col justify-around items-center py-6 pointer-events-none opacity-60">
              <div className="size-1.5 rounded-full bg-[#d4af37] shadow-[0_0_3px_#ffd700]" />
              <div className="size-1.5 rounded-full bg-[#d4af37] shadow-[0_0_3px_#ffd700]" />
              <div className="size-1.5 rounded-full bg-[#d4af37] shadow-[0_0_3px_#ffd700]" />
            </div>

            {/* Center Right Inscription */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="relative size-20 sm:size-24 rounded-full border border-dashed border-[#d4af37]/40 flex items-center justify-center mb-3">
                <span className="font-serif text-2xl sm:text-3xl text-[#ffd700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                  ᚛ ᛋ ᚜
                </span>
              </div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-white tracking-wider">
                CHRONICLES
              </h2>
              <span className="text-[10px] font-mono tracking-widest text-[#ffd700]/90 uppercase mt-1">
                Tan Hng Wu · Engineer
              </span>
            </div>

            {/* Dynamic Traveling Shading on right face */}
            {isOpening && (
              <motion.div
                className="absolute inset-0 bg-black pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.7, 0.95] }}
                transition={openTransition}
              />
            )}
          </div>

          {/* BACK FACE OF RIGHT DOOR (Blank Runic Endpaper) */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg) translateZ(1px)",
            }}
          >
            <BlankRunicPage side="right" variant={2} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
