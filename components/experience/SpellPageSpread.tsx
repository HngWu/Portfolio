"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { SpellPageLeft } from "./SpellPageLeft"
import { SpellPageRight } from "./SpellPageRight"
import { CoverEndpaper } from "./CoverEndpaper"
import { BookCoverFace } from "./BookCoverFace"
import { BookBackCoverFace } from "./BookBackCoverFace"
import { PageFlipLeaf } from "./PageFlipLeaf"
import { BookmarkRibbon } from "./BookmarkRibbon"
import { BookThumbTabs } from "./BookThumbTabs"
import { SpellOpeningFlourish } from "./SpellOpeningFlourish"
import type { SpellData } from "@/lib/content/experienceSpells"
import { ChevronLeft, ChevronRight, Compass } from "lucide-react"

interface SpellPageSpreadProps {
  isCoverOpen: boolean
  isOpeningCover: boolean
  isClosingCover: boolean
  isClosedBack?: boolean
  onCoverOpenComplete: () => void
  onCoverCloseComplete: () => void
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
}

export function SpellPageSpread({
  isCoverOpen,
  isOpeningCover,
  isClosingCover,
  isClosedBack = false,
  onCoverOpenComplete,
  onCoverCloseComplete,
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
}: SpellPageSpreadProps) {
  const isFirstPage = currentIndex === 0
  const isLastPage = currentIndex === totalSpells - 1

  // Mobile folio tab switcher (Overview vs Responsibilities for screens < lg)
  const [mobileFolioTab, setMobileFolioTab] = React.useState<"left" | "right">("left")

  // Reset to left tab whenever chapter changes
  React.useEffect(() => {
    setMobileFolioTab("left")
  }, [currentIndex])

  // 4-Surface Physical Staging Model:
  // When turning Next (direction = 1):
  //   - Left base stays currentSpell (will be covered when the leaf lands).
  //   - Right base displays targetSpell underneath the lifting leaf.
  // When turning Prev (direction = -1):
  //   - Left base displays targetSpell underneath the lifting leaf.
  //   - Right base stays currentSpell (will be covered when the leaf lands).
  // When stationary:
  //   - Both left and right display currentSpell.
  const baseLeftSpell = isTurning && direction === -1 && targetSpell ? targetSpell : currentSpell
  const baseLeftPage = isTurning && direction === -1 && targetIndex !== null ? targetIndex + 1 : currentIndex + 1

  const baseRightSpell = isTurning && direction === 1 && targetSpell ? targetSpell : currentSpell
  const baseRightPage = isTurning && direction === 1 && targetIndex !== null ? targetIndex + 1 : currentIndex + 1

  const isClosed = (!isCoverOpen && !isOpeningCover && !isClosingCover) || isClosedBack
  const showCoverLeaf = isOpeningCover || isClosingCover

  return (
    <motion.div
      className="relative w-full mx-auto h-[74vh] max-h-[740px] min-h-[520px] flex items-center justify-center p-1 md:p-2 select-none"
      initial={{
        maxWidth: "580px",
      }}
      animate={{
        maxWidth: isClosed ? "580px" : "1240px",
      }}
      transition={{
        duration: isClosedBack ? 0.38 : isClosingCover ? 0.48 : 0.88,
        ease: isClosedBack ? [0.22, 1, 0.36, 1] : isClosingCover ? [0.4, 0, 0.2, 1] : [0.22, 1, 0.36, 1],
      }}
    >
      {/* MULTI-TIER 3D AMBIENT GROUND SHADOWS */}
      {/* Tier 1: Diffuse Ground Drop Shadow */}
      <div className="absolute -bottom-6 inset-x-8 sm:inset-x-12 h-14 bg-black/90 blur-2xl rounded-full pointer-events-none z-0" />
      {/* Tier 2: Faint Emerald Mana Floor Halo */}
      <div className="absolute -bottom-8 inset-x-16 sm:inset-x-24 h-16 bg-[var(--lume-primary,#4affb4)]/10 blur-3xl rounded-full pointer-events-none z-0" />

      {/* Indexed Thumb Tabs along the right outer edge (Desktop xl+) */}
      {isCoverOpen && !isClosingCover && (
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
        className="relative w-full h-full rounded-[28px] p-1 bg-gradient-to-b from-[#181f35] via-[#0b0f1d] to-[#04060d] border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.92),0_12px_35px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.18)] backdrop-blur-2xl z-10"
        style={{
          perspective: "2600px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Inner Deckle Page Block Frame with Paper Strata Borders */}
        <div className="relative w-full h-full rounded-3xl overflow-hidden border-x-[3px] border-b-[3px] border-x-[#1b233a]/80 border-b-[#121828]/80 bg-[#06080e]/95 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
          {/* Subtle Ambient Book Edge Highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--lume-primary,#4affb4)]/40 to-transparent pointer-events-none z-40" />

          {/* Technical Corner Ornaments */}
          <div className="absolute top-2.5 left-2.5 size-4 border-t-2 border-l-2 border-[var(--lume-primary,#4affb4)]/60 rounded-tl pointer-events-none z-40" />
          <div className="absolute top-2.5 right-2.5 size-4 border-t-2 border-r-2 border-[var(--lume-primary,#4affb4)]/60 rounded-tr pointer-events-none z-40" />
          <div className="absolute bottom-2.5 left-2.5 size-4 border-b-2 border-l-2 border-[var(--lume-primary,#4affb4)]/60 rounded-bl pointer-events-none z-40" />
          <div className="absolute bottom-2.5 right-2.5 size-4 border-b-2 border-r-2 border-[var(--lume-primary,#4affb4)]/60 rounded-br pointer-events-none z-40" />

          {/* Central 3D Spine Channel with Cylindrical Shading & Stitching Pins */}
          {!isClosed && (
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-7 -translate-x-1/2 z-30 pointer-events-none">
              {/* Cylindrical lighting barrel */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-white/[0.07] to-black/90 shadow-[inset_0_0_10px_rgba(0,0,0,0.95)]" />
              {/* Center spine crease wire */}
              <div className="absolute left-1/2 top-0 bottom-0 w-[1.5px] -translate-x-1/2 bg-white/25 shadow-[0_0_6px_rgba(0,0,0,1)]" />
              {/* Metallic spine binder pins */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)]/70 shadow-[0_0_6px_var(--lume-primary)]" />
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 size-1 rounded-full bg-white/40" />
              <div className="absolute top-2/3 left-1/2 -translate-x-1/2 size-1 rounded-full bg-white/40" />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)]/70 shadow-[0_0_6px_var(--lume-primary)]" />
              {/* Dynamic cast shadow during turning */}
              <div
                className={`absolute inset-y-0 -left-12 -right-12 bg-gradient-to-r from-transparent via-black/85 to-transparent pointer-events-none transition-all duration-300 ${
                  isTurning || isOpeningCover || isClosingCover ? "opacity-95 scale-x-125" : "opacity-35 scale-x-100"
                }`}
              />
            </div>
          )}

          {/* Magical Opening & Closing Flourish Burst */}
          <SpellOpeningFlourish
            mode={isOpeningCover ? "opening" : isClosingCover ? "closing" : "idle"}
          />

        {/* Silk Bookmark Ribbon hanging from top center spine */}
        {isCoverOpen && !isClosingCover && (
          <BookmarkRibbon
            currentChapter={currentIndex + 1}
            totalChapters={totalSpells}
            realmName={currentSpell.realm}
          />
        )}

        {/* Mobile Folio Tab Switcher (< lg screens only) */}
        {isCoverOpen && !isClosingCover && (
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

        {/* Outer Left Margin Click/Hover Zone (Previous Page) */}
        {isCoverOpen && !isFirstPage && !isTurning && (
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

        {/* Outer Right Margin Click/Hover Zone (Next Page) */}
        {isCoverOpen && !isLastPage && !isTurning && (
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
        <div className={`grid ${isClosed ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"} w-full h-full`}>
          {/* Left Folio Base */}
          {!isClosed && (
            <div
              className={`relative border-b lg:border-b-0 lg:border-r border-white/10 bg-white/[0.01] h-full overflow-hidden ${
                mobileFolioTab === "left" ? "block" : "hidden lg:block"
              }`}
            >
              <SpellPageLeft
                spell={baseLeftSpell}
                pageNumber={baseLeftPage}
                totalSpells={totalSpells}
                isRevealing={isOpeningCover}
              />

              {/* Ambient occlusion shadow under lifting page when turning Prev */}
              {isCoverOpen && isTurning && direction === -1 && (
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
            className={`relative bg-white/[0.01] h-full overflow-hidden ${
              isClosed ? "col-span-1" : mobileFolioTab === "right" ? "block" : "hidden lg:block"
            }`}
          >
            {isClosedBack ? (
              <BookBackCoverFace />
            ) : isClosed ? (
              <BookCoverFace onOpen={onManualOpenCover} />
            ) : (
              <SpellPageRight
                spell={baseRightSpell}
                pageNumber={baseRightPage}
                isLastPage={baseRightPage === totalSpells}
                onNextPage={onNextPage}
                isRevealing={isOpeningCover}
              />
            )}

            {/* Ambient occlusion shadow under lifting leaf when turning Next or Closing */}
            {((isCoverOpen && isTurning && direction === 1) || isClosingCover) && (
              <motion.div
                className="absolute inset-0 bg-black pointer-events-none"
                initial={{ opacity: 0.55 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: 0.48, ease: "easeOut" }}
              />
            )}

            {/* Soft shadow reveal when opening front cover */}
            {isOpeningCover && (
              <motion.div
                className="absolute inset-0 bg-black pointer-events-none"
                initial={{ opacity: 0.65 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.86, ease: "easeOut" }}
              />
            )}
          </div>
        </div>

        {/* 3D BOOK COVER LEAF (Opening / Closing Animation) */}
        {showCoverLeaf && (
          <PageFlipLeaf
            isCover={true}
            coverAction={isOpeningCover ? "opening" : "closing"}
            currentSpell={currentSpell}
            currentPageNumber={currentIndex + 1}
            totalSpells={totalSpells}
            onFlipComplete={
              isOpeningCover ? onCoverOpenComplete : isClosingCover ? onCoverCloseComplete : undefined
            }
            onManualOpenCover={onManualOpenCover}
          />
        )}

        {/* ACTIVE 3D ROLE FLIPPING LEAF */}
        {isCoverOpen && isTurning && targetSpell && direction !== 0 && (
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
