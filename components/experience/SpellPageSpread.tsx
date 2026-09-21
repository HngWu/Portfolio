"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { SpellPageLeft } from "./SpellPageLeft"
import { SpellPageRight } from "./SpellPageRight"
import { CoverEndpaper } from "./CoverEndpaper"
import { PageFlipLeaf } from "./PageFlipLeaf"
import { BookmarkRibbon } from "./BookmarkRibbon"
import { BookThumbTabs } from "./BookThumbTabs"
import type { SpellData } from "@/lib/content/experienceSpells"
import { ChevronLeft, ChevronRight, Compass } from "lucide-react"

interface SpellPageSpreadProps {
  isCoverOpen: boolean
  isOpeningCover: boolean
  isClosingCover: boolean
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

  const showCoverLeaf = !isCoverOpen || isOpeningCover || isClosingCover

  return (
    <div className="relative w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px] mx-auto h-[74vh] max-h-[740px] min-h-[520px] flex items-center justify-center p-1 md:p-2 select-none">
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

      {/* 3D Perspective Book Frame — Constant Dimensions to Prevent Layout Jumps */}
      <div
        className="relative w-full h-full rounded-3xl overflow-hidden border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_60px_rgba(74,255,180,0.06)] backdrop-blur-2xl bg-[#06080e]/95"
        style={{
          perspective: "2600px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Subtle Ambient Book Edge Highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--lume-primary,#4affb4)]/30 to-transparent pointer-events-none z-40" />

        {/* Technical Corner Ornaments */}
        <div className="absolute top-2.5 left-2.5 size-4 border-t-2 border-l-2 border-[var(--lume-primary,#4affb4)]/50 rounded-tl pointer-events-none z-40" />
        <div className="absolute top-2.5 right-2.5 size-4 border-t-2 border-r-2 border-[var(--lume-primary,#4affb4)]/50 rounded-tr pointer-events-none z-40" />
        <div className="absolute bottom-2.5 left-2.5 size-4 border-b-2 border-l-2 border-[var(--lume-primary,#4affb4)]/50 rounded-bl pointer-events-none z-40" />
        <div className="absolute bottom-2.5 right-2.5 size-4 border-b-2 border-r-2 border-[var(--lume-primary,#4affb4)]/50 rounded-br pointer-events-none z-40" />

        {/* Central Spine Crease & Dynamic Shadow */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-white/20 via-white/10 to-white/20 z-30 pointer-events-none">
          <div
            className={`absolute inset-y-0 -left-12 w-24 bg-gradient-to-r from-transparent via-black/85 to-transparent pointer-events-none transition-all duration-300 ${
              isTurning || isOpeningCover || isClosingCover
                ? "opacity-95 scale-x-125"
                : "opacity-40 scale-x-100"
            }`}
          />
        </div>

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
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full">
          {/* Left Folio Base */}
          <div
            className={`relative border-b lg:border-b-0 lg:border-r border-white/10 bg-white/[0.01] h-full overflow-hidden ${
              mobileFolioTab === "left" ? "block" : "hidden lg:block"
            }`}
          >
            {showCoverLeaf ? (
              <CoverEndpaper />
            ) : (
              <SpellPageLeft
                spell={baseLeftSpell}
                pageNumber={baseLeftPage}
                totalSpells={totalSpells}
              />
            )}

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

          {/* Right Folio Base */}
          <div
            className={`relative bg-white/[0.01] h-full overflow-hidden ${
              mobileFolioTab === "right" ? "block" : "hidden lg:block"
            }`}
          >
            <SpellPageRight
              spell={baseRightSpell}
              pageNumber={baseRightPage}
              isLastPage={baseRightPage === totalSpells}
              onNextPage={onNextPage}
            />

            {/* Ambient occlusion shadow under lifting leaf when turning Next */}
            {isCoverOpen && isTurning && direction === 1 && (
              <motion.div
                className="absolute inset-0 bg-black pointer-events-none"
                initial={{ opacity: 0.55 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
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

        {/* 3D BOOK COVER LEAF (Opening / Closing / Closed Entrance) */}
        {showCoverLeaf && (
          <PageFlipLeaf
            isCover={true}
            coverAction={isOpeningCover ? "opening" : isClosingCover ? "closing" : "closed"}
            currentSpell={currentSpell}
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
  )
}
