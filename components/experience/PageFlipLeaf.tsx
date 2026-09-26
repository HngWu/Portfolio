"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { SpellPageLeft } from "./SpellPageLeft"
import { SpellPageRight } from "./SpellPageRight"
import { BookCoverFace } from "./BookCoverFace"
import { BookBackCoverFace } from "./BookBackCoverFace"
import { BlankRunicPage } from "./BlankRunicPage"
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

  // Rotation, curvature, and compound flex dynamics
  let initialRotateY = 0
  let targetRotateY = -180
  let scaleXKeyframes = [1, 0.935, 1]
  let skewYKeyframes = isRightHalfLeaf ? [0, -2.2, 0] : [0, 2.2, 0]
  let rotateZKeyframes = isRightHalfLeaf ? [0, -3.5, 0] : [0, 3.5, 0]
  let animDuration = 0.62
  let animEase: readonly number[] = [0.25, 0.85, 0.35, 1]

  if (isCover) {
    animDuration = 0.88
    animEase = [0.22, 1, 0.36, 1] // Heavy hardcover ease with subtle settle overshoot
    scaleXKeyframes = [1, 0.94, 0.98, 1]
    skewYKeyframes = [0, -1.8, -0.6, 0]
    rotateZKeyframes = [0, -2.4, -0.8, 0]

    if (coverAction === "closed") {
      initialRotateY = 0
      targetRotateY = 0
    } else if (coverAction === "opening") {
      initialRotateY = 0
      targetRotateY = -180
    } else if (coverAction === "closing") {
      initialRotateY = 0
      targetRotateY = -180
      animDuration = 0.68
      animEase = [0.25, 0.85, 0.35, 1] // Weighted accelerating shut
      scaleXKeyframes = [1, 0.96, 1]
      skewYKeyframes = [0, -1.2, 0]
      rotateZKeyframes = [0, -1.5, 0]
    }
  } else {
    // Normal role page turn
    if (direction === -1) {
      // Prev: left page flips right (+180deg)
      initialRotateY = 0
      targetRotateY = 180
      skewYKeyframes = [0, 2.2, 0]
      rotateZKeyframes = [0, 3.5, 0]
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
          rotateZ: 0,
        }}
        animate={{
          rotateY: targetRotateY,
          scaleX: isStaticCoverClosed ? 1 : scaleXKeyframes,
          skewY: isStaticCoverClosed ? 0 : skewYKeyframes,
          rotateZ: isStaticCoverClosed ? 0 : rotateZKeyframes,
        }}
        transition={{
          duration: isStaticCoverClosed ? 0.01 : animDuration,
          ease: animEase as unknown as [number, number, number, number],
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
            coverAction === "closing" ? (
              <SpellPageRight
                spell={currentSpell}
                pageNumber={currentPageNumber}
                isLastPage={false}
                onNextPage={() => {}}
              />
            ) : (
              <BookCoverFace onOpen={onManualOpenCover} />
            )
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

          {/* Reverse-face bevel along outer edge when closing */}
          {isCover && coverAction === "closing" && (
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-[#181f35] to-transparent border-r-2 border-[var(--lume-primary,#4affb4)]/60 pointer-events-none z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 1] }}
              transition={{ duration: animDuration, ease: "easeInOut" }}
            />
          )}

          {/* Dynamic Traveling Fold Shadow as page lifts and bends */}
          {!isStaticCoverClosed && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isRightHalfLeaf
                  ? "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 100%)"
                  : "linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 100%)",
              }}
              initial={{ opacity: 0, x: isRightHalfLeaf ? "0%" : "0%" }}
              animate={{
                opacity: [0, 0.7, 0.95],
                x: isRightHalfLeaf ? ["0%", "15%", "35%"] : ["0%", "-15%", "-35%"],
              }}
              transition={{ duration: animDuration, ease: "easeInOut" }}
            />
          )}

          {/* Dynamic Specular Sheen line sweeping across curvature crest */}
          {!isStaticCoverClosed && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, transparent 0%, rgba(74,255,180,0.25) 50%, transparent 100%)",
              }}
              initial={{ opacity: 0, x: isRightHalfLeaf ? "-60%" : "60%" }}
              animate={{
                opacity: [0, 0.8, 0],
                x: isRightHalfLeaf ? ["-60%", "20%", "120%"] : ["60%", "-20%", "-120%"],
              }}
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
            coverAction === "closing" ? (
              <BookBackCoverFace />
            ) : (
              <BlankRunicPage side="left" variant={1} />
            )
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

          {/* Dynamic back-face traveling fold shadow dispersing as it lands flat */}
          {!isStaticCoverClosed && coverAction !== "closing" && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isRightHalfLeaf
                  ? "linear-gradient(to left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.25) 40%, transparent 100%)"
                  : "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.25) 40%, transparent 100%)",
              }}
              initial={{ opacity: 0.9 }}
              animate={{ opacity: [0.9, 0.4, 0] }}
              transition={{ duration: animDuration, ease: "easeOut" }}
            />
          )}

          {/* Dynamic luminous sheen as back face settles flat into position */}
          {!isStaticCoverClosed && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--lume-primary,#4affb4)]/25 to-transparent pointer-events-none"
              initial={{ opacity: 0.8, x: isRightHalfLeaf ? "100%" : "-100%" }}
              animate={{ opacity: 0, x: isRightHalfLeaf ? "-100%" : "100%" }}
              transition={{ duration: animDuration, ease: "easeOut" }}
            />
          )}
        </div>

        {/* FAINT PARTICLE / SPARK TRAIL ALONG THE TURNING OUTER EDGE */}
        {!isStaticCoverClosed && (
          <motion.div
            className={`absolute top-0 bottom-0 w-2 pointer-events-none z-50 ${
              isRightHalfLeaf ? "right-0" : "left-0"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            transition={{ duration: animDuration, times: [0, 0.5, 1], ease: "easeInOut" }}
          >
            <div className="w-full h-full bg-gradient-to-b from-transparent via-[var(--lume-primary,#4affb4)]/80 to-transparent blur-[1px]" />
            {/* Micro-spark dots */}
            <div className="absolute top-1/4 left-0 size-1 rounded-full bg-white shadow-[0_0_6px_var(--lume-primary)]" />
            <div className="absolute top-1/2 left-0.5 size-1.5 rounded-full bg-[var(--mode-accent-bright,#6affff)] shadow-[0_0_8px_var(--mode-accent-bright)]" />
            <div className="absolute top-3/4 left-0 size-1 rounded-full bg-white shadow-[0_0_6px_var(--lume-primary)]" />
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
