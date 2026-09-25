"use client"

import * as React from "react"
import type { ParsedExperience } from "@/lib/content/portfolio"
import { toSpellData, HANDCRAFTED_SPELLS, type SpellData } from "@/lib/content/experienceSpells"
import { SpellPageSpread } from "./SpellPageSpread"
import { SpellAmbientMana } from "./SpellAmbientMana"
import { ExperienceBackBtn } from "./ExperienceBackBtn"
import { usePageTransition } from "@/hooks/usePageTransition"
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
  const { navigateWithTransition } = usePageTransition()

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
  const [isClosedBack, setIsClosedBack] = React.useState(false)
  const [audioEnabled, setAudioEnabled] = React.useState(false)

  // Audio ref tracking to prevent re-opening loops
  const audioEnabledRef = React.useRef(audioEnabled)
  React.useEffect(() => {
    audioEnabledRef.current = audioEnabled
  }, [audioEnabled])

  // Page Turn States
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [targetIndex, setTargetIndex] = React.useState<number | null>(null)
  const [direction, setDirection] = React.useState<1 | -1 | 0>(0)
  const [isTurning, setIsTurning] = React.useState(false)

  // Ref tracking to guarantee race-free completion & atomic debounce lock
  const targetIndexRef = React.useRef(targetIndex)
  React.useEffect(() => {
    targetIndexRef.current = targetIndex
  }, [targetIndex])

  const isLockedRef = React.useRef(false)
  const isExitingRef = React.useRef(false)

  // Auto-trigger book opening sequence on initial mount
  React.useEffect(() => {
    if (typeof window === "undefined") return

    // Check prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      setIsCoverOpen(true)
      setIsOpeningCover(false)
      return
    }

    // Always start closed on page mount, pause 800ms to allow user to view front cover, then swing cover open
    const openTimer = setTimeout(() => {
      setIsOpeningCover(true)
      playBookOpenSound(audioEnabledRef.current)
    }, 800)

    return () => clearTimeout(openTimer)
  }, [])

  const handleCoverOpenComplete = React.useCallback(() => {
    setIsCoverOpen(true)
    setIsOpeningCover(false)
    setIsClosingCover(false)
  }, [])

  const handleCoverCloseComplete = React.useCallback(() => {
    setIsCoverOpen(false)
    setIsOpeningCover(false)
    setIsClosingCover(false)
    setIsClosedBack(true)
    setActiveIndex(0)
  }, [])

  // Cover opening safety timeout
  React.useEffect(() => {
    if (isOpeningCover) {
      const openFallback = setTimeout(() => {
        handleCoverOpenComplete()
      }, 1400)
      return () => clearTimeout(openFallback)
    }
  }, [isOpeningCover, handleCoverOpenComplete])

  // Cover closing safety timeout
  React.useEffect(() => {
    if (isClosingCover) {
      const closeFallback = setTimeout(() => {
        handleCoverCloseComplete()
      }, 1400)
      return () => clearTimeout(closeFallback)
    }
  }, [isClosingCover, handleCoverCloseComplete])

  const handleManualOpen = React.useCallback(() => {
    if (!isCoverOpen && !isOpeningCover && !isClosingCover && !isExitingRef.current) {
      setIsOpeningCover(true)
      playBookOpenSound(audioEnabledRef.current)
    }
  }, [isCoverOpen, isOpeningCover, isClosingCover])

  // Centralized Exit Navigation Closing Animation
  const handleExit = React.useCallback(
    (targetPath = "/") => {
      if (isExitingRef.current) return
      isExitingRef.current = true
      isLockedRef.current = true

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches

      if (prefersReduced) {
        navigateWithTransition(targetPath)
        return
      }

      setIsClosingCover(true)
      playBookOpenSound(audioEnabledRef.current)

      // Total exit timing:
      // 480ms (3D closing leaf swing) + 380ms (collapse to 580px centered) + ~390ms (view back cover) = 1250ms
      const exitTimer = setTimeout(() => {
        navigateWithTransition(targetPath)
      }, 1250)

      return () => clearTimeout(exitTimer)
    },
    [navigateWithTransition]
  )

  // Intercept browser back button to trigger closing animation before leaving
  React.useEffect(() => {
    if (typeof window === "undefined") return

    // Push dummy entry so clicking Back triggers popstate first
    window.history.pushState({ spellbook: true }, "", window.location.href)

    const handlePopState = () => {
      if (!isExitingRef.current) {
        window.history.pushState({ spellbook: true }, "", window.location.href)
        handleExit("/")
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [handleExit])

  const handleFlipComplete = React.useCallback(() => {
    if (targetIndexRef.current !== null) {
      setActiveIndex(targetIndexRef.current)
    }
    setTargetIndex(null)
    setIsTurning(false)
    setDirection(0)
    // 150ms settle buffer before releasing input lock
    setTimeout(() => {
      isLockedRef.current = false
    }, 150)
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

  // Page Navigation Handlers with atomic locking
  const goToNext = React.useCallback(() => {
    if (
      activeIndex >= spells.length - 1 ||
      isTurning ||
      isLockedRef.current ||
      !isCoverOpen ||
      isOpeningCover ||
      isClosingCover ||
      isExitingRef.current
    )
      return

    isLockedRef.current = true
    setIsTurning(true)
    setDirection(1)
    setTargetIndex(activeIndex + 1)
    playPageTurnSound(audioEnabledRef.current)
  }, [activeIndex, spells.length, isTurning, isCoverOpen, isOpeningCover, isClosingCover])

  const goToPrev = React.useCallback(() => {
    if (
      activeIndex <= 0 ||
      isTurning ||
      isLockedRef.current ||
      !isCoverOpen ||
      isOpeningCover ||
      isClosingCover ||
      isExitingRef.current
    )
      return

    isLockedRef.current = true
    setIsTurning(true)
    setDirection(-1)
    setTargetIndex(activeIndex - 1)
    playPageTurnSound(audioEnabledRef.current)
  }, [activeIndex, isTurning, isCoverOpen, isOpeningCover, isClosingCover])

  const goToIndex = React.useCallback(
    (index: number) => {
      if (
        index === activeIndex ||
        isTurning ||
        isLockedRef.current ||
        !isCoverOpen ||
        isOpeningCover ||
        isClosingCover ||
        isExitingRef.current
      )
        return

      isLockedRef.current = true
      setIsTurning(true)
      setDirection(index > activeIndex ? 1 : -1)
      setTargetIndex(index)
      playPageTurnSound(audioEnabledRef.current)
    },
    [activeIndex, isTurning, isCoverOpen, isOpeningCover, isClosingCover]
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
        handleExit("/")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goToNext, goToPrev, isCoverOpen, handleManualOpen, handleExit])

  const currentSpell = spells[activeIndex] || spells[0]
  const targetSpell = targetIndex !== null ? spells[targetIndex] || null : null

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center select-none">
      {/* Return to Home Back Button with Smooth Exit Closing Animation */}
      <ExperienceBackBtn onBack={() => handleExit("/")} />

      {/* Ambient Luminous Dust Particles */}
      <SpellAmbientMana />

      {/* Main 3D Book Stage — Unified continuous frame with zero resizing or layout jump */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center my-auto min-h-0">
        <SpellPageSpread
          isCoverOpen={isCoverOpen}
          isOpeningCover={isOpeningCover}
          isClosingCover={isClosingCover}
          isClosedBack={isClosedBack}
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
      {isCoverOpen && !isClosingCover && !isClosedBack && (
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
                onClick={() => handleExit("/")}
                title="Close Dossier & Return Home"
                aria-label="Close Dossier & Return Home"
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
