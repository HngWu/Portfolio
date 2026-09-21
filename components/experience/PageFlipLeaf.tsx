"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { SpellPageLeft } from "./SpellPageLeft"
import { SpellPageRight } from "./SpellPageRight"
import { BookCoverFace } from "./BookCoverFace"
import type { SpellData } from "@/lib/content/experienceSpells"

export interface PageFlipLeafProps {
  isCover?: boolean
  coverAction?: "closed" | "opening" | "closing"
  direction?: 1 | -1
  currentSpell: SpellData
  targetSpell?: SpellData | null
  currentPageNumber?: number
  targetPageNumber?: number
  totalSpells: number
  onFlipComplete?: () => void
  onManualOpenCover?: () => void
}

export function PageFlipLeaf({
  isCover = false,
  coverAction = "closed",
  direction = 1,
  currentSpell,
  targetSpell,
  currentPageNumber = 1,
  targetPageNumber = 1,
  totalSpells,
  onFlipComplete,
  onManualOpenCover,
}: PageFlipLeafProps) {
  // Determine if moving leaf originates from right and rotates left (-180deg)
  // Next page (direction = 1) or Cover Opening/Closing always hinges at left center (spine)
  const isRightHalfLeaf = isCover || direction === 1

  // Distinguish between static closed cover, cover opening/closing, and normal page turn
  const isStaticCoverClosed = isCover && coverAction === "closed"

  // Rotation and flex dynamics
  let initialRotateY = 0
  let targetRotateY = -180
  let scaleXKeyframes = [1, 0.955, 1]
  let skewYKeyframes = isRightHalfLeaf ? [0, -1.2, 0] : [0, 1.2, 0]
  let animDuration = 0.7
  const animEase = [0.28, 0.85, 0.32, 1] as const

  if (isCover) {
    animDuration = 0.86
    scaleXKeyframes = [1, 0.98, 1]
    skewYKeyframes = [0, -0.8, 0]

    if (coverAction === "closed") {
      initialRotateY = 0
      targetRotateY = 0
    } else if (coverAction === "opening") {
      initialRotateY = 0
      targetRotateY = -180
    } else if (coverAction === "closing") {
      initialRotateY = -180
      targetRotateY = 0
      skewYKeyframes = [0, 0.8, 0]
    }
  } else {
    // Normal role page turn
    if (direction === -1) {
      // Prev: left page flips right (+180deg)
      initialRotateY = 0
      targetRotateY = 180
      skewYKeyframes = [0, 1.2, 0]
    }
  }

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
        }}
        initial={{
          rotateY: initialRotateY,
          scaleX: 1,
          skewY: 0,
        }}
        animate={{
          rotateY: targetRotateY,
          scaleX: isStaticCoverClosed ? 1 : scaleXKeyframes,
          skewY: isStaticCoverClosed ? 0 : skewYKeyframes,
        }}
        transition={{
          duration: isStaticCoverClosed ? 0.01 : animDuration,
          ease: animEase,
        }}
        onAnimationComplete={() => {
          // Trigger completion for any animating turn or cover transition
          if (!isStaticCoverClosed && onFlipComplete) {
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
            transform: "rotateY(0deg) translateZ(1px)",
            transformStyle: "preserve-3d",
            pointerEvents: isStaticCoverClosed ? "auto" : "none",
          }}
        >
          {isCover ? (
            <BookCoverFace onOpen={onManualOpenCover} />
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

          {/* Dynamic darkening shadow as page lifts away from camera */}
          {!isStaticCoverClosed && (
            <motion.div
              className="absolute inset-0 bg-black/85 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.45, 0.85] }}
              transition={{ duration: animDuration, ease: "easeInOut" }}
            />
          )}
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
              ? "rotateY(180deg) translateZ(1px)"
              : "rotateY(-180deg) translateZ(1px)",
            transformStyle: "preserve-3d",
          }}
        >
          {isCover ? (
            <SpellPageLeft
              spell={currentSpell}
              pageNumber={1}
              totalSpells={totalSpells}
            />
          ) : isRightHalfLeaf ? (
            <SpellPageLeft
              spell={targetSpell ?? currentSpell}
              pageNumber={targetPageNumber}
              totalSpells={totalSpells}
            />
          ) : (
            <SpellPageRight
              spell={targetSpell ?? currentSpell}
              pageNumber={targetPageNumber}
              isLastPage={targetPageNumber === totalSpells}
              onNextPage={() => {}}
            />
          )}

          {/* Dynamic luminous sheen as back face settles flat into position */}
          {!isStaticCoverClosed && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--lume-primary,#4affb4)]/20 to-transparent pointer-events-none"
              initial={{ opacity: 0.7, x: isRightHalfLeaf ? "100%" : "-100%" }}
              animate={{ opacity: 0, x: isRightHalfLeaf ? "-100%" : "100%" }}
              transition={{ duration: animDuration, ease: "easeOut" }}
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}
