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
  | "opening-cover"
  | "opening-flutter"
  | "idle"
  | "turning-page"
  | "closing-flutter"
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
  const isOpeningCover = lifecycle === "opening-cover"
  const isOpeningFlutter = lifecycle === "opening-flutter"
  const isClosingFlutter = lifecycle === "closing-flutter"
  const isClosingCover = lifecycle === "closing-cover"
  const isClosedBack = lifecycle === "closed-back"
  const isExiting = lifecycle === "exiting"
  const isIdle = lifecycle === "idle" || lifecycle === "turning-page"

  // Single volume footprint (580px) vs 2-page open spread (1160px)
  const isSingleVolume = isClosedFront || isClosingCover || isClosedBack || isExiting

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
        x: "0%",
      }}
      transition={{
        maxWidth: {
          duration: isOpeningCover ? 0.78 : isClosingCover ? 0.58 : 0.4,
          ease: isClosingCover ? [0.4, 0, 0.2, 1] : [0.22, 1, 0.36, 1],
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
        className="relative w-full h-full p-1 border border-white/20 rounded-[28px] bg-gradient-to-b from-[#181f35] via-[#0b0f1d] to-[#04060d] shadow-[0_30px_90px_rgba(0,0,0,0.92),0_12px_35px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.18)] backdrop-blur-2xl z-10"
        style={{
          perspective: "2600px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Inner Deckle Page Block Frame (Strictly bounded to book width, zero bleeding lines) */}
        <div className="relative w-full h-full overflow-hidden border-x-[3px] border-b-[3px] border-x-[#1b233a]/80 border-b-[#121828]/80 rounded-3xl bg-[#06080e]/95 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
          {/* Subtle Ambient Book Edge Highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--lume-primary,#4affb4)]/40 to-transparent pointer-events-none z-40" />

          {/* Technical Corner Ornaments */}
          <div className="absolute top-2.5 left-2.5 size-4 border-t-2 border-l-2 border-[var(--lume-primary,#4affb4)]/60 rounded-tl pointer-events-none z-40" />
          <div className="absolute top-2.5 right-2.5 size-4 border-t-2 border-r-2 border-[var(--lume-primary,#4affb4)]/60 rounded-tr pointer-events-none z-40" />
          <div className="absolute bottom-2.5 left-2.5 size-4 border-b-2 border-l-2 border-[var(--lume-primary,#4affb4)]/60 rounded-bl pointer-events-none z-40" />
          <div className="absolute bottom-2.5 right-2.5 size-4 border-b-2 border-r-2 border-[var(--lume-primary,#4affb4)]/60 rounded-br pointer-events-none z-40" />

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
          <SpellOpeningFlourish mode={isOpeningCover ? "opening" : "idle"} />

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
                ) : isOpeningCover || isOpeningFlutter ? (
                  /* Display authentic blank runic manuscript page while opening and fluttering */
                  <BlankRunicPage side="left" variant={1} />
                ) : (
                  <SpellPageLeft
                    spell={baseLeftSpell}
                    pageNumber={baseLeftPage}
                    totalSpells={totalSpells}
                    isRevealing={isOpeningCover}
                  />
                )}

                {/* Ambient shadow under closing cover */}
                {isClosingCover && (
                  <motion.div
                    className="absolute inset-0 bg-black pointer-events-none z-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.92 }}
                    transition={{ duration: 0.58, ease: [0.4, 0, 0.2, 1] }}
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
              ) : isOpeningCover ? (
                /* Display authentic blank runic manuscript page while opening */
                <BlankRunicPage side="right" variant={2} />
              ) : (
                <SpellPageRight
                  spell={baseRightSpell}
                  pageNumber={baseRightPage}
                  isLastPage={baseRightPage === totalSpells}
                  onNextPage={onNextPage}
                  isRevealing={isOpeningCover}
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

          {/* 3D BOOK COVER LEAF (Opening Entrance Animation) */}
          {isOpeningCover && (
            <PageFlipLeaf
              isCover={true}
              coverAction="opening"
              currentSpell={currentSpell}
              currentPageNumber={currentIndex + 1}
              totalSpells={totalSpells}
              onFlipComplete={() => onLifecycleAdvance("opening-flutter")}
              onManualOpenCover={onManualOpenCover}
            />
          )}

          {/* CASCADING MULTI-PAGE BLANK RUNIC FLUTTER (Entrance) */}
          {isOpeningFlutter && (
            <MultiPageFlutter
              mode="opening"
              audioEnabled={audioEnabled}
              onComplete={() => onLifecycleAdvance("idle")}
            />
          )}

          {/* CASCADING MULTI-PAGE BLANK RUNIC FLUTTER (Exit) */}
          {isClosingFlutter && (
            <MultiPageFlutter
              mode="closing"
              audioEnabled={audioEnabled}
              onComplete={() => onLifecycleAdvance("closing-cover")}
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
