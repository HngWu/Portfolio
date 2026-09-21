"use client"

import * as React from "react"
import type { ParsedExperience } from "@/lib/content/portfolio"
import { toSpellData, HANDCRAFTED_SPELLS, type SpellData } from "@/lib/content/experienceSpells"
import { SpellPageSpread } from "./SpellPageSpread"
import { SpellAmbientMana } from "./SpellAmbientMana"
import { playPageTurnSound, playBookOpenSound } from "@/lib/experience/bookAudio"
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  RotateCcw,
  Layers,
} from "lucide-react"

interface ExperienceSpellbookProps {
  experienceList: ParsedExperience[]
}

export function ExperienceSpellbook({ experienceList }: ExperienceSpellbookProps) {
  // Map experiences to book data (strictly verified 2 career roles: DBS Bank & TTP)
  const spells: SpellData[] = React.useMemo(() => {
    const validExps = (experienceList || []).filter((e) => {
      const id = (e.id || "").toLowerCase()
      const company = (e.company || "").toLowerCase()
      return (
        id.includes("dbs") ||
        id.includes("ttp") ||
        company.includes("dbs") ||
        company.includes("point") ||
        company.includes("ttp")
      )
    })

    const sourceList =
      validExps.length > 0
        ? validExps
        : Object.keys(HANDCRAFTED_SPELLS).map((k) => ({
            id: k,
            role: HANDCRAFTED_SPELLS[k].spellName || "Engineer",
            company: HANDCRAFTED_SPELLS[k].realm || "Organization",
            date: HANDCRAFTED_SPELLS[k].era || "Present",
            highlights: [],
          }))

    return sourceList.map((e, i) => toSpellData(e, i, sourceList.length))
  }, [experienceList])

  // Book Opening Entrance Lifecycle State (No container unmounting / zero layout snap)
  const [isCoverOpen, setIsCoverOpen] = React.useState(false)
  const [isOpeningCover, setIsOpeningCover] = React.useState(false)
  const [isClosingCover, setIsClosingCover] = React.useState(false)
  const [audioEnabled, setAudioEnabled] = React.useState(false)

  // Page Turn States
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [targetIndex, setTargetIndex] = React.useState<number | null>(null)
  const [direction, setDirection] = React.useState<1 | -1 | 0>(0)
  const [isTurning, setIsTurning] = React.useState(false)

  // Ref tracking to guarantee race-free completion
  const targetIndexRef = React.useRef(targetIndex)
  React.useEffect(() => {
    targetIndexRef.current = targetIndex
  }, [targetIndex])

  // Auto-trigger book opening sequence after brief mount delay
  React.useEffect(() => {
    const openTimer = setTimeout(() => {
      setIsOpeningCover(true)
      playBookOpenSound(audioEnabled)
    }, 320)
    return () => clearTimeout(openTimer)
  }, [audioEnabled])

  const handleCoverOpenComplete = React.useCallback(() => {
    setIsCoverOpen(true)
    setIsOpeningCover(false)
    setIsClosingCover(false)
  }, [])

  const handleCoverCloseComplete = React.useCallback(() => {
    setIsCoverOpen(false)
    setIsOpeningCover(false)
    setIsClosingCover(false)
    setActiveIndex(0)
  }, [])

  // Cover opening safety timeout
  React.useEffect(() => {
    if (isOpeningCover) {
      const openFallback = setTimeout(() => {
        handleCoverOpenComplete()
      }, 1200)
      return () => clearTimeout(openFallback)
    }
  }, [isOpeningCover, handleCoverOpenComplete])

  // Cover closing safety timeout
  React.useEffect(() => {
    if (isClosingCover) {
      const closeFallback = setTimeout(() => {
        handleCoverCloseComplete()
      }, 1200)
      return () => clearTimeout(closeFallback)
    }
  }, [isClosingCover, handleCoverCloseComplete])

  const handleManualOpen = React.useCallback(() => {
    if (!isCoverOpen && !isOpeningCover && !isClosingCover) {
      setIsOpeningCover(true)
      playBookOpenSound(audioEnabled)
    }
  }, [isCoverOpen, isOpeningCover, isClosingCover, audioEnabled])

  const handleCloseBook = React.useCallback(() => {
    if (isCoverOpen && !isTurning && !isOpeningCover && !isClosingCover) {
      setIsClosingCover(true)
      playBookOpenSound(audioEnabled)
    }
  }, [isCoverOpen, isTurning, isOpeningCover, isClosingCover, audioEnabled])

  const handleFlipComplete = React.useCallback(() => {
    if (targetIndexRef.current !== null) {
      setActiveIndex(targetIndexRef.current)
    }
    setTargetIndex(null)
    setIsTurning(false)
    setDirection(0)
  }, [])

  // Page turn safety timeout: ensures UI never gets stuck even if browser throttles animations
  React.useEffect(() => {
    if (isTurning) {
      const turnFallback = setTimeout(() => {
        handleFlipComplete()
      }, 950)
      return () => clearTimeout(turnFallback)
    }
  }, [isTurning, handleFlipComplete])

  // Page Navigation Handlers
  const goToNext = React.useCallback(() => {
    if (activeIndex >= spells.length - 1 || isTurning || !isCoverOpen || isOpeningCover || isClosingCover) return
    setIsTurning(true)
    setDirection(1)
    setTargetIndex(activeIndex + 1)
    playPageTurnSound(audioEnabled)
  }, [activeIndex, spells.length, isTurning, isCoverOpen, isOpeningCover, isClosingCover, audioEnabled])

  const goToPrev = React.useCallback(() => {
    if (activeIndex <= 0 || isTurning || !isCoverOpen || isOpeningCover || isClosingCover) return
    setIsTurning(true)
    setDirection(-1)
    setTargetIndex(activeIndex - 1)
    playPageTurnSound(audioEnabled)
  }, [activeIndex, isTurning, isCoverOpen, isOpeningCover, isClosingCover, audioEnabled])

  const goToIndex = React.useCallback(
    (index: number) => {
      if (index === activeIndex || isTurning || !isCoverOpen || isOpeningCover || isClosingCover) return
      setIsTurning(true)
      setDirection(index > activeIndex ? 1 : -1)
      setTargetIndex(index)
      playPageTurnSound(audioEnabled)
    },
    [activeIndex, isTurning, isCoverOpen, isOpeningCover, isClosingCover, audioEnabled]
  )

  // Keyboard Navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCoverOpen) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleManualOpen()
        }
        return
      }

      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault()
        goToNext()
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault()
        goToPrev()
      } else if (e.key === "Escape") {
        e.preventDefault()
        handleCloseBook()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goToNext, goToPrev, isCoverOpen, handleManualOpen, handleCloseBook])

  const currentSpell = spells[activeIndex] || spells[0]
  const targetSpell = targetIndex !== null ? spells[targetIndex] || null : null

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center select-none">
      {/* Ambient Luminous Dust Particles */}
      <SpellAmbientMana />

      {/* Main 3D Book Stage — Unified continuous frame with zero resizing or layout jump */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center my-auto min-h-0">
        <SpellPageSpread
          isCoverOpen={isCoverOpen}
          isOpeningCover={isOpeningCover}
          isClosingCover={isClosingCover}
          onCoverOpenComplete={handleCoverOpenComplete}
          onCoverCloseComplete={handleCoverCloseComplete}
          onManualOpenCover={handleManualOpen}
          currentSpell={currentSpell}
          targetSpell={targetSpell}
          currentIndex={activeIndex}
          targetIndex={targetIndex}
          totalSpells={spells.length}
          direction={direction}
          isTurning={isTurning}
          onNextPage={goToNext}
          onPrevPage={goToPrev}
          onFlipComplete={handleFlipComplete}
          spells={spells}
          onSelectRole={goToIndex}
        />
      </div>

      {/* Bottom Floating Navigation & Chapter HUD */}
      {isCoverOpen && !isClosingCover && (
        <div className="relative z-20 mt-3 md:mt-4 flex flex-col items-center gap-2 shrink-0 px-2 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 p-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
            {/* Previous Role Button */}
            <button
              type="button"
              onClick={goToPrev}
              disabled={activeIndex === 0 || isTurning}
              aria-label="Previous Role"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08] hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all text-xs font-mono active:scale-95 cursor-pointer shadow-md"
            >
              <ChevronLeft className="size-4 text-[var(--lume-primary,#4affb4)]" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Chapter Timeline Scrubber */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 shadow-sm">
              <div className="flex items-center gap-1.5">
                {spells.map((s, idx) => {
                  const isActive = idx === activeIndex
                  const isDest = idx === targetIndex
                  return (
                    <button
                      key={s.id || idx}
                      type="button"
                      onClick={() => goToIndex(idx)}
                      disabled={isTurning}
                      title={`${s.realm} — ${s.spellName}`}
                      aria-label={`Jump to Chapter ${idx + 1}: ${s.realm}`}
                      className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "w-8 bg-[var(--lume-primary,#4affb4)] shadow-[0_0_12px_var(--lume-primary)]"
                          : isDest
                          ? "w-6 bg-[var(--mode-accent-bright,#6affff)] animate-pulse"
                          : "w-2.5 bg-white/20 hover:bg-white/50"
                      }`}
                    />
                  )
                })}
              </div>

              <span className="ml-2.5 text-[11px] font-mono text-white/70 font-semibold">
                {String(activeIndex + 1).padStart(2, "0")} / {String(spells.length).padStart(2, "0")}
              </span>
            </div>

            {/* Next Role Button */}
            <button
              type="button"
              onClick={goToNext}
              disabled={activeIndex === spells.length - 1 || isTurning}
              aria-label="Next Role"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08] hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all text-xs font-mono active:scale-95 cursor-pointer shadow-md"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="size-4 text-[var(--lume-primary,#4affb4)]" />
            </button>

            {/* Auxiliary Controls (Sound & Close Book) */}
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/15">
              {/* Audio Toggle */}
              <button
                type="button"
                onClick={() => setAudioEnabled((prev) => !prev)}
                title={audioEnabled ? "Mute Paper Sound Effects" : "Enable Paper Sound Effects"}
                aria-label="Toggle page turn audio"
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  audioEnabled
                    ? "bg-[var(--lume-primary,#4affb4)]/15 border-[var(--lume-primary)]/40 text-[var(--lume-primary,#4affb4)] shadow-[0_0_12px_rgba(74,255,180,0.2)]"
                    : "bg-white/[0.03] border-white/10 text-white/40 hover:text-white/80"
                }`}
              >
                {audioEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
              </button>

              {/* Close Tome Button */}
              <button
                type="button"
                onClick={handleCloseBook}
                title="Close Dossier"
                aria-label="Close Dossier"
                className="p-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Chapter Context & Keyboard Hint Badge */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-white/40">
            <span className="flex items-center gap-1.5 text-white/60 truncate max-w-[280px] sm:max-w-none">
              <Layers className="size-3 text-[var(--lume-primary,#4affb4)] shrink-0" />
              <span className="font-semibold text-white/80">{currentSpell.realm}</span>
              <span className="hidden sm:inline text-white/40">—</span>
              <span className="hidden sm:inline truncate">{currentSpell.spellName}</span>
            </span>
            <span className="hidden md:inline text-white/25">·</span>
            <span className="hidden md:inline text-[10px] text-white/30">
              [Use ← / → arrow keys or click edges to flip]
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
