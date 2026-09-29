"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { SpellPageLeft } from "./SpellPageLeft"
import { SpellPageRight } from "./SpellPageRight"
import { HalfTitlePage } from "./HalfTitlePage"
import { EpiloguePage } from "./EpiloguePage"
import type { SpellData } from "@/lib/content/experienceSpells"

export type LeafFlipType = "experience" | "opening-prologue" | "closing-epilogue"

export interface PageFlipLeafProps {
  flipType?: LeafFlipType
  direction?: 1 | -1
  currentSpell: SpellData
  targetSpell?: SpellData | null
  currentPageNumber?: number
  targetPageNumber?: number
  totalSpells: number
  onFlipComplete?: () => void
}

export function PageFlipLeaf({
  flipType = "experience",
  direction = 1,
  currentSpell,
  targetSpell,
  currentPageNumber = 1,
  targetPageNumber = 1,
  totalSpells,
  onFlipComplete,
}: PageFlipLeafProps) {
  const isOpeningPrologue = flipType === "opening-prologue"
  const isClosingEpilogue = flipType === "closing-epilogue"

  // Right-half leaves hinge at the center spine (left center) and swing 0 -> -180deg to land on the left.
  const isRightHalfLeaf = isOpeningPrologue || isClosingEpilogue || direction === 1

  let initialRotateY = 0
  let targetRotateY = -180
  // Luxuriously smooth, slower 1.2s tactile page turn
  const animDuration = 1.2
  // Physical S-curve easing: subtle initial resistance -> smooth 90deg crest -> cushioned air-damped settle
  const animEase: readonly number[] = [0.32, 0.04, 0.22, 1]

  if (!isOpeningPrologue && !isClosingEpilogue && direction === -1) {
    // Prev: left page flips right (+180deg) around center spine (right center)
    initialRotateY = 0
    targetRotateY = 180
  }

  const activeDestinationSpell = targetSpell ?? currentSpell

  return (
    <div
      className={`absolute top-0 bottom-0 z-30 pointer-events-none ${
        isRightHalfLeaf ? "left-1/2 right-0" : "left-0 right-1/2"
      }`}
      style={{
        perspective: "2600px",
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          transformOrigin: isRightHalfLeaf ? "left center" : "right center",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        initial={{
          rotateY: initialRotateY,
          rotateZ: 0,
          skewY: 0,
          scaleX: 1,
        }}
        animate={{
          rotateY: targetRotateY,
          // Compound corner-lead curl: outer corner lifts first then settles flat
          rotateZ: isRightHalfLeaf ? [0, 2.2, -1.2, 0] : [0, -2.2, 1.2, 0],
          skewY: isRightHalfLeaf ? [0, -3.2, 1.8, 0] : [0, 3.2, -1.8, 0],
          // Projected arch width narrowing at 90deg crest
          scaleX: [1, 0.86, 0.94, 1],
        }}
        transition={{
          duration: animDuration,
          ease: animEase as unknown as [number, number, number, number],
        }}
        onAnimationComplete={() => {
          if (onFlipComplete) {
            onFlipComplete()
          }
        }}
      >
        {/* FRONT FACE OF TURNING LEAF */}
        <div
          className={`absolute inset-0 w-full h-full overflow-hidden bg-[#070912] ${
            isRightHalfLeaf
              ? "rounded-r-3xl border-r border-white/20"
              : "rounded-l-3xl border-l border-white/20"
          }`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg) translateZ(0.5px)",
            pointerEvents: "none",
          }}
        >
          {isOpeningPrologue ? (
            <HalfTitlePage onTurnPage={() => {}} />
          ) : isClosingEpilogue ? (
            <SpellPageRight
              spell={currentSpell}
              pageNumber={currentPageNumber}
              isLastPage={currentPageNumber === totalSpells}
              onNextPage={() => {}}
            />
          ) : isRightHalfLeaf ? (
            <SpellPageRight
              spell={currentSpell}
              pageNumber={currentPageNumber}
              isLastPage={false}
              onNextPage={() => {}}
            />
          ) : (
            <SpellPageLeft
              spell={currentSpell}
              pageNumber={currentPageNumber}
              totalSpells={totalSpells}
            />
          )}

          {/* Dynamic Traveling Fold Shadow as page lifts and bends */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isRightHalfLeaf
                ? "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)"
                : "linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0.95] }}
            transition={{ duration: animDuration, ease: "easeInOut" }}
          />

          {/* Dynamic Specular Sheen sweeping across curvature crest */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, transparent 0%, rgba(74,255,180,0.25) 50%, rgba(255,215,0,0.15) 65%, transparent 100%)",
            }}
            initial={{ opacity: 0, x: isRightHalfLeaf ? "-60%" : "60%" }}
            animate={{
              opacity: [0, 0.85, 0],
              x: isRightHalfLeaf ? ["-60%", "25%", "120%"] : ["60%", "-25%", "-120%"],
            }}
            transition={{ duration: animDuration, ease: "easeInOut" }}
          />
        </div>

        {/* BACK FACE OF TURNING LEAF */}
        <div
          className={`absolute inset-0 w-full h-full overflow-hidden bg-[#070912] ${
            isRightHalfLeaf
              ? "rounded-l-3xl border-l border-white/20"
              : "rounded-r-3xl border-r border-white/20"
          }`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: isRightHalfLeaf
              ? "rotateY(180deg) translateZ(0.5px)"
              : "rotateY(-180deg) translateZ(0.5px)",
          }}
        >
          {isOpeningPrologue ? (
            <SpellPageLeft
              spell={activeDestinationSpell}
              pageNumber={1}
              totalSpells={totalSpells}
            />
          ) : isClosingEpilogue ? (
            <EpiloguePage />
          ) : isRightHalfLeaf ? (
            <SpellPageLeft
              spell={activeDestinationSpell}
              pageNumber={targetPageNumber}
              totalSpells={totalSpells}
            />
          ) : (
            <SpellPageRight
              spell={activeDestinationSpell}
              pageNumber={targetPageNumber}
              isLastPage={targetPageNumber === totalSpells}
              onNextPage={() => {}}
            />
          )}

          {/* Dynamic back-face traveling fold shadow dispersing as it lands flat */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isRightHalfLeaf
                ? "linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)"
                : "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)",
            }}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: [0.85, 0.35, 0] }}
            transition={{ duration: animDuration, ease: "easeOut" }}
          />

          {/* Dynamic luminous sheen as back face settles flat into position */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--lume-primary,#4affb4)]/25 to-transparent pointer-events-none"
            initial={{ opacity: 0.8, x: isRightHalfLeaf ? "100%" : "-100%" }}
            animate={{ opacity: 0, x: isRightHalfLeaf ? "-100%" : "100%" }}
            transition={{ duration: animDuration, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    </div>
  )
}

export default PageFlipLeaf
