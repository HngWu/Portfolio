"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { SpellPageLeft } from "./SpellPageLeft"
import { SpellPageRight } from "./SpellPageRight"
import { BookCoverFace } from "./BookCoverFace"
import { BookBackCoverFace } from "./BookBackCoverFace"
import { BlankRunicPage } from "./BlankRunicPage"
import { PageFlipLeaf } from "./PageFlipLeaf"
import { MultiPageFlutter } from "./MultiPageFlutter"
import { BookmarkRibbon } from "./BookmarkRibbon"
import { BookThumbTabs } from "./BookThumbTabs"
import { SpellOpeningFlourish } from "./SpellOpeningFlourish"
import { playBookCloseSound } from "@/lib/experience/bookAudio"
import type { SpellData } from "@/lib/content/experienceSpells"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type BookLifecycle =
  | "closed-front"
  | "opening-wave"
  | "idle"
  | "turning-page"
  | "closing-cover"
  | "closed-back"
  | "exiting"

interface SpellPageSpreadProps {
  lifecycle: BookLifecycle
  onLifecycleAdvance: (nextState: BookLifecycle) => void
  onManualOpenCover: () => void

  currentSpell: SpellData
  targetSpell: SpellData | null
  currentIndex: number
  targetIndex: number | null
  totalSpells: number
  direction: 1 | -1 | 0
  isTurning: boolean
  onNextPage: () => void
  onPrevPage: () => void
  onFlipComplete: () => void

  spells: SpellData[]
  onSelectRole: (index: number) => void
  audioEnabled?: boolean
}

export function SpellPageSpread({
  lifecycle,
  onLifecycleAdvance,
  onManualOpenCover,
  currentSpell,
  targetSpell,
  currentIndex,
  targetIndex,
  totalSpells,
  direction,
  isTurning,
  onNextPage,
  onPrevPage,
  onFlipComplete,
  spells,
  onSelectRole,
  audioEnabled = false,
}: SpellPageSpreadProps) {
  const isFirstPage = currentIndex === 0
  const isLastPage = currentIndex === totalSpells - 1

  // Mobile folio tab switcher (Overview vs Responsibilities for screens < lg)
  const [mobileFolioTab, setMobileFolioTab] = React.useState<"left" | "right">("left")

  // Reset to left tab whenever chapter changes
  React.useEffect(() => {
    setMobileFolioTab("left")
  }, [currentIndex])

  const isClosedFront = lifecycle === "closed-front"
  const isOpeningWave = lifecycle === "opening-wave"
  const isClosingCover = lifecycle === "closing-cover"
  const isClosedBack = lifecycle === "closed-back"
  const isExiting = lifecycle === "exiting"
  const isIdle = lifecycle === "idle" || lifecycle === "turning-page"

  // Single volume footprint (580px centered) only for closed states
  // During closing-cover, we maintain 1160px spread and translate by +25% so the page NEVER squishes!
  const isSingleVolume = isClosedFront || isClosedBack || isExiting

  // Base folio spell display logic during interactive chapter flips
  const baseLeftSpell = isTurning && direction === -1 && targetSpell ? targetSpell : currentSpell
  const baseLeftPage = isTurning && direction === -1 && targetIndex !== null ? targetIndex + 1 : currentIndex + 1

  const baseRightSpell = isTurning && direction === 1 && targetSpell ? targetSpell : currentSpell
  const baseRightPage = isTurning && direction === 1 && targetIndex !== null ? targetIndex + 1 : currentIndex + 1

  // Sound trigger and state advance on closing cover completion
  const handleCoverCloseFinished = React.useCallback(() => {
    playBookCloseSound(audioEnabled)
    onLifecycleAdvance("closed-back")
  }, [audioEnabled, onLifecycleAdvance])

  return (
    <motion.div
      className="relative w-full mx-auto h-[74vh] max-h-[740px] min-h-[520px] flex items-center justify-center p-1 md:p-2 select-none"
      initial={{
        maxWidth: "580px",
        x: "0%",
      }}
      animate={{
        maxWidth: isSingleVolume ? "580px" : "1160px",
        x: isClosingCover ? "25%" : "0%",
      }}
      transition={{
        maxWidth: {
          duration: isOpeningWave ? 0.88 : 0.4,
          ease: [0.22, 1, 0.36, 1],
        },
        x: {
          duration: isClosingCover ? 0.68 : 0.4,
          ease: isClosingCover ? [0.25, 0.85, 0.35, 1] : [0.22, 1, 0.36, 1],
        },
      }}
    >
      {/* MULTI-TIER 3D AMBIENT GROUND SHADOWS */}
      <div className="absolute -bottom-6 inset-x-6 sm:inset-x-10 h-14 bg-black/90 blur-2xl rounded-full pointer-events-none z-0" />
      <div className="absolute -bottom-8 inset-x-12 sm:inset-x-16 h-16 bg-[var(--lume-primary,#4affb4)]/10 blur-3xl rounded-full pointer-events-none z-0" />

      {/* Indexed Thumb Tabs along the right outer edge (Desktop xl+) */}
      {isIdle && (
        <BookThumbTabs
          spells={spells}
          activeIndex={currentIndex}
          targetIndex={targetIndex}
          isTurning={isTurning}
          onSelectRole={onSelectRole}
        />
      )}

      {/* 3D Perspective Hardcover Outer Casing */}
      <div
        className={`relative w-full h-full p-1 border rounded-[28px] bg-gradient-to-b from-[#181f35] via-[#0b0f1d] to-[#04060d] shadow-[0_30px_90px_rgba(0,0,0,0.92),0_12px_35px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.18)] backdrop-blur-2xl z-10 transition-colors duration-300 ${
          isClosingCover ? "border-l border-y border-white/20 border-r-transparent" : "border border-white/20"
        }`}
        style={{
          perspective: "2600px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Inner Deckle Page Block Frame (Strictly bounded to book width, zero bleeding lines) */}
        <div className={`relative w-full h-full overflow-hidden border-b-[3px] border-b-[#121828]/80 border-l-[3px] border-l-[#1b233a]/80 rounded-3xl bg-[#06080e]/95 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] ${
          isClosingCover ? "border-r-0" : "border-r-[3px] border-r-[#1b233a]/80"
        }`}>
          {/* Subtle Ambient Book Edge Highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--lume-primary,#4affb4)]/40 to-transparent pointer-events-none z-40" />

          {/* Technical Corner Ornaments */}
          <div className="absolute top-2.5 left-2.5 size-4 border-t-2 border-l-2 border-[var(--lume-primary,#4affb4)]/60 rounded-tl pointer-events-none z-40" />
          <div className="absolute bottom-2.5 left-2.5 size-4 border-b-2 border-l-2 border-[var(--lume-primary,#4affb4)]/60 rounded-bl pointer-events-none z-40" />

          {/* Right Corner Ornaments - hidden during closing and closed back so NO lines extend past the book */}
          {!isClosingCover && !isClosedBack && !isExiting && (
            <>
              <div className="absolute top-2.5 right-2.5 size-4 border-t-2 border-r-2 border-[var(--lume-primary,#4affb4)]/60 rounded-tr pointer-events-none z-40" />
              <div className="absolute bottom-2.5 right-2.5 size-4 border-b-2 border-r-2 border-[var(--lume-primary,#4affb4)]/60 rounded-br pointer-events-none z-40" />
            </>
          )}

          {/* Central 3D Spine Channel */}
          {!isSingleVolume && (
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-7 -translate-x-1/2 z-30 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-white/[0.07] to-black/90 shadow-[inset_0_0_10px_rgba(0,0,0,0.95)]" />
              <div className="absolute left-1/2 top-0 bottom-0 w-[1.5px] -translate-x-1/2 bg-white/25 shadow-[0_0_6px_rgba(0,0,0,1)]" />
              <div className="absolute top-6 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)]/70 shadow-[0_0_6px_var(--lume-primary)]" />
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 size-1 rounded-full bg-white/40" />
              <div className="absolute top-2/3 left-1/2 -translate-x-1/2 size-1 rounded-full bg-white/40" />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)]/70 shadow-[0_0_6px_var(--lume-primary)]" />
            </div>
          )}

          {/* Magical Opening Flourish */}
          <SpellOpeningFlourish mode={isOpeningWave ? "opening" : isClosingCover ? "closing" : "idle"} />

          {/* Silk Bookmark Ribbon */}
          {isIdle && (
            <BookmarkRibbon
              currentChapter={currentIndex + 1}
              totalChapters={totalSpells}
              realmName={currentSpell.realm}
            />
          )}

          {/* Mobile Folio Tab Switcher (< lg screens only) */}
          {isIdle && (
            <div className="lg:hidden absolute top-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center p-1 rounded-xl bg-black/80 border border-white/15 backdrop-blur-lg shadow-lg">
              <button
                type="button"
                onClick={() => setMobileFolioTab("left")}
                className={`px-3 py-1 rounded-lg text-[11px] font-mono font-medium transition-all ${
                  mobileFolioTab === "left"
                    ? "bg-[var(--lume-primary,#4affb4)]/20 border border-[var(--lume-primary)]/50 text-white shadow-sm"
                    : "text-white/50 hover:text-white"
                }`}
              >
                1. Overview & Stack
              </button>
              <button
                type="button"
                onClick={() => setMobileFolioTab("right")}
                className={`px-3 py-1 rounded-lg text-[11px] font-mono font-medium transition-all ${
                  mobileFolioTab === "right"
                    ? "bg-[var(--lume-primary,#4affb4)]/20 border border-[var(--lume-primary)]/50 text-white shadow-sm"
                    : "text-white/50 hover:text-white"
                }`}
              >
                2. Responsibilities
              </button>
            </div>
          )}

          {/* Margin Navigation Zones (Hover arrows) */}
          {isIdle && !isFirstPage && !isTurning && (
            <button
              type="button"
              onClick={onPrevPage}
              aria-label="Previous Page"
              className="hidden sm:flex absolute left-0 top-0 bottom-0 w-16 z-20 items-center justify-start pl-3 opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-w-resize group/leftedge"
            >
              <div className="size-9 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/80 group-hover/leftedge:text-[var(--lume-primary,#4affb4)] group-hover/leftedge:scale-110 transition-all shadow-lg">
                <ChevronLeft className="size-5" />
              </div>
            </button>
          )}

          {/* Next Page Arrow (Margin Navigation Zone) */}
          {isIdle && !isLastPage && !isTurning && (
            <button
              type="button"
              onClick={onNextPage}
              aria-label="Next Page"
              className="hidden sm:flex absolute right-0 top-0 bottom-0 w-16 z-20 items-center justify-end pr-3 opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-e-resize group/rightedge"
            >
              <div className="size-9 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/80 group-hover/rightedge:text-[var(--lume-primary,#4affb4)] group-hover/rightedge:scale-110 transition-all shadow-lg">
                <ChevronRight className="size-5" />
              </div>
            </button>
          )}

          {/* STATIONARY BASE SPREAD LAYER */}
          <div
            className={`grid ${
              isSingleVolume && (isClosedFront || isClosedBack || isExiting)
                ? "grid-cols-1"
                : "grid-cols-1 lg:grid-cols-2"
            } w-full h-full`}
          >
            {/* Left Folio Base */}
            {!isClosedFront && (
              <div
                className={`relative border-b lg:border-b-0 lg:border-r border-white/10 bg-white/[0.01] h-full overflow-hidden ${
                  isClosedBack || isExiting
                    ? "col-span-1"
                    : mobileFolioTab === "left"
                    ? "block"
                    : "hidden lg:block"
                }`}
              >
                {isClosedBack || isExiting ? (
                  <BookBackCoverFace />
                ) : (
                  <SpellPageLeft
                    spell={baseLeftSpell}
                    pageNumber={baseLeftPage}
                    totalSpells={totalSpells}
                    isRevealing={isOpeningWave}
                  />
                )}

                {/* Ambient shadow under closing cover as it approaches landing */}
                {isClosingCover && (
                  <motion.div
                    className="absolute inset-0 bg-black pointer-events-none z-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.35, 0.9] }}
                    transition={{ duration: 0.68, ease: [0.25, 0.85, 0.35, 1] }}
                  />
                )}

                {/* Ambient occlusion shadow under lifting page when turning Prev */}
                {isIdle && isTurning && direction === -1 && (
                  <motion.div
                    className="absolute inset-0 bg-black pointer-events-none"
                    initial={{ opacity: 0.55 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                )}
              </div>
            )}

            {/* Right Folio Base */}
            <div
              className={`relative bg-white/[0.01] h-full overflow-hidden transition-opacity duration-300 ${
                isClosedFront
                  ? "col-span-1"
                  : isClosedBack || isExiting
                  ? "hidden"
                  : isClosingCover
                  ? "opacity-0 pointer-events-none"
                  : mobileFolioTab === "right"
                  ? "block"
                  : "hidden lg:block"
              }`}
            >
              {isClosedFront ? (
                <BookCoverFace onOpen={onManualOpenCover} />
              ) : (
                <SpellPageRight
                  spell={baseRightSpell}
                  pageNumber={baseRightPage}
                  isLastPage={baseRightPage === totalSpells}
                  onNextPage={onNextPage}
                  isRevealing={isOpeningWave}
                />
              )}

              {/* Ambient occlusion shadow under lifting leaf when turning Next */}
              {isIdle && isTurning && direction === 1 && (
                <motion.div
                  className="absolute inset-0 bg-black pointer-events-none"
                  initial={{ opacity: 0.55 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ duration: 0.48, ease: "easeOut" }}
                />
              )}
            </div>
          </div>

          {/* 3D BOOK COVER LEAF (Opening Wave Animation) */}
          {isOpeningWave && (
            <PageFlipLeaf
              isCover={true}
              coverAction="opening"
              currentSpell={currentSpell}
              currentPageNumber={currentIndex + 1}
              totalSpells={totalSpells}
              onManualOpenCover={onManualOpenCover}
            />
          )}

          {/* SIMULTANEOUS CASCADING MULTI-PAGE BLANK RUNIC FLUTTER (Opening Wave) */}
          {isOpeningWave && (
            <MultiPageFlutter
              currentSpell={currentSpell}
              totalSpells={totalSpells}
              audioEnabled={audioEnabled}
              onComplete={() => onLifecycleAdvance("idle")}
            />
          )}

          {/* 3D BOOK COVER WING FOLD (Exit Closing Animation) */}
          {isClosingCover && (
            <PageFlipLeaf
              isCover={true}
              coverAction="closing"
              currentSpell={currentSpell}
              currentPageNumber={currentIndex + 1}
              totalSpells={totalSpells}
              onFlipComplete={handleCoverCloseFinished}
            />
          )}

          {/* ACTIVE 3D ROLE FLIPPING LEAF (Manual Chapter Turn) */}
          {isIdle && isTurning && targetSpell && direction !== 0 && (
            <PageFlipLeaf
              direction={direction}
              currentSpell={currentSpell}
              targetSpell={targetSpell}
              currentPageNumber={currentIndex + 1}
              targetPageNumber={(targetIndex ?? currentIndex) + 1}
              totalSpells={totalSpells}
              onFlipComplete={onFlipComplete}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}
