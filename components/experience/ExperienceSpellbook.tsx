"use client"

import * as React from "react"
import type { ParsedExperience } from "@/lib/content/portfolio"
import { toSpellData, HANDCRAFTED_SPELLS, type SpellData } from "@/lib/content/experienceSpells"
import { SpellPageSpread, type BookLifecycle } from "./SpellPageSpread"
import { MobileArcaneScroll } from "./MobileArcaneScroll"
import { ExperienceBackBtn } from "./ExperienceBackBtn"
import { usePageTransition } from "@/hooks/usePageTransition"
import { useNavigationStore } from "@/store/useNavigationStore"
import { playPageTurnSound } from "@/lib/experience/bookAudio"
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

  React.useEffect(() => {
    useNavigationStore.getState().reportPageLoaded("/experience")
  }, [])

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

  // Unified Book Lifecycle State Machine
  const [lifecycle, setLifecycle] = React.useState<BookLifecycle>("prologue")
  const [audioEnabled, setAudioEnabled] = React.useState(false)

  // Audio ref tracking to prevent stale closure loops
  const audioEnabledRef = React.useRef(audioEnabled)
  React.useEffect(() => {
    audioEnabledRef.current = audioEnabled
  }, [audioEnabled])

  // Page Turn States
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [targetIndex, setTargetIndex] = React.useState<number | null>(null)
  const [direction, setDirection] = React.useState<1 | -1 | 0>(0)
  const [isTurning, setIsTurning] = React.useState(false)
  const [mobileFolioTab, setMobileFolioTab] = React.useState<"left" | "right">("left")

  // Ref tracking to guarantee race-free completion
  const targetIndexRef = React.useRef(targetIndex)
  React.useEffect(() => {
    targetIndexRef.current = targetIndex
  }, [targetIndex])

  const isExitingRef = React.useRef(false)

  // Open trigger handler: flips from prologue (Half Title Page) to Experience 1
  const triggerOpeningFlip = React.useCallback(() => {
    if (lifecycle !== "prologue" || isExitingRef.current) return

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReduced) {
      setLifecycle("idle")
      return
    }

    playPageTurnSound(audioEnabledRef.current)
    setLifecycle("opening-flip")
  }, [lifecycle])

  // Centralized Exit Navigation Sequence: Flips from experience to Epilogue & Afterword, then home
  const handleExit = React.useCallback(
    (targetPath = "/") => {
      if (isExitingRef.current) return
      isExitingRef.current = true

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches

      if (prefersReduced) {
        navigateWithTransition(targetPath)
        return
      }

      playPageTurnSound(audioEnabledRef.current)
      setLifecycle("closing-flip")
    },
    [navigateWithTransition]
  )

  const handleReturnHomeImmediate = React.useCallback(() => {
    setLifecycle("exiting")
    navigateWithTransition("/")
  }, [navigateWithTransition])

  // Auto-flip from prologue (Half Title Page) to Experience 1 after ~2.5 seconds
  React.useEffect(() => {
    if (typeof window === "undefined") return

    if (lifecycle === "prologue") {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (prefersReduced) {
        const timer = setTimeout(() => {
          setLifecycle("idle")
        }, 0)
        return () => clearTimeout(timer)
      }

      const openTimer = setTimeout(() => {
        triggerOpeningFlip()
      }, 2500)

      return () => clearTimeout(openTimer)
    }
  }, [lifecycle, triggerOpeningFlip])

  // Wheel & Scroll Trigger: scroll down during prologue flips to Exp 1 on desktop
  React.useEffect(() => {
    if (typeof window === "undefined") return

    let wheelDebounce = false

    const handleWheel = (e: WheelEvent) => {
      if (wheelDebounce) return

      if (lifecycle === "prologue" && e.deltaY > 15) {
        wheelDebounce = true
        triggerOpeningFlip()
        setTimeout(() => {
          wheelDebounce = false
        }, 500)
      }
      // Note: Removed aggressive wheel auto-exit (e.deltaY < -40) to prevent random returns to home
    }

    window.addEventListener("wheel", handleWheel, { passive: true })
    return () => window.removeEventListener("wheel", handleWheel)
  }, [lifecycle, triggerOpeningFlip])

  // Epilogue timer: display Epilogue and Afterword for 3.0s then gracefully transition home
  React.useEffect(() => {
    if (lifecycle === "epilogue") {
      const exitTimer = setTimeout(() => {
        setLifecycle("exiting")
        navigateWithTransition("/")
      }, 3000)
      return () => clearTimeout(exitTimer)
    }
  }, [lifecycle, navigateWithTransition])

  // Safety watchdogs for page flip state transitions
  React.useEffect(() => {
    let watchdog: NodeJS.Timeout | null = null

    if (lifecycle === "opening-flip") {
      watchdog = setTimeout(() => {
        setLifecycle("idle")
      }, 1500)
    } else if (lifecycle === "closing-flip") {
      watchdog = setTimeout(() => {
        setLifecycle("epilogue")
      }, 1500)
    }

    return () => {
      if (watchdog) clearTimeout(watchdog)
    }
  }, [lifecycle])

  // Intercept browser back button to trigger closing animation before leaving
  React.useEffect(() => {
    if (typeof window === "undefined") return

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
    setLifecycle("idle")
  }, [])

  // Page turn safety timeout: ensures UI never gets stuck during 1.2s luxury flip
  React.useEffect(() => {
    if (isTurning) {
      const turnFallback = setTimeout(() => {
        handleFlipComplete()
      }, 1500)
      return () => clearTimeout(turnFallback)
    }
  }, [isTurning, handleFlipComplete])

  // Page Navigation Handlers
  const goToNext = React.useCallback(() => {
    if (isTurning || lifecycle !== "idle" || isExitingRef.current) return
    if (activeIndex >= spells.length - 1) return

    setIsTurning(true)
    setLifecycle("turning-page")
    setDirection(1)
    setTargetIndex(activeIndex + 1)
    playPageTurnSound(audioEnabledRef.current)
  }, [activeIndex, spells.length, isTurning, lifecycle])

  const goToPrev = React.useCallback(() => {
    if (isTurning || lifecycle !== "idle" || isExitingRef.current) return
    if (activeIndex <= 0) return

    setIsTurning(true)
    setLifecycle("turning-page")
    setDirection(-1)
    setTargetIndex(activeIndex - 1)
    playPageTurnSound(audioEnabledRef.current)
  }, [activeIndex, isTurning, lifecycle])

  const goToIndex = React.useCallback(
    (index: number) => {
      if (isTurning || lifecycle !== "idle" || isExitingRef.current) return
      if (index === activeIndex || index < 0 || index >= spells.length) return

      setIsTurning(true)
      setLifecycle("turning-page")
      setDirection(index > activeIndex ? 1 : -1)
      setTargetIndex(index)
      playPageTurnSound(audioEnabledRef.current)
    },
    [activeIndex, spells.length, isTurning, lifecycle]
  )

  // Keyboard Navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lifecycle === "prologue") {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
          e.preventDefault()
          triggerOpeningFlip()
        }
        return
      }

      if (lifecycle === "epilogue") {
        if (e.key === "Escape" || e.key === "Enter") {
          e.preventDefault()
          handleReturnHomeImmediate()
        }
        return
      }

      if (lifecycle !== "idle") return

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
  }, [goToNext, goToPrev, lifecycle, triggerOpeningFlip, handleExit, handleReturnHomeImmediate])

  const currentSpell = spells[activeIndex] || spells[0]
  const targetSpell = targetIndex !== null ? spells[targetIndex] || null : null

  const showHUD = lifecycle === "idle" || lifecycle === "turning-page"

  // Touch Swipe Gesture System for Mobile
  const touchStartXRef = React.useRef(0)
  const touchStartYRef = React.useRef(0)
  const touchStartTimeRef = React.useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX
      touchStartYRef.current = e.touches[0].clientY
      touchStartTimeRef.current = Date.now()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current
      const elapsed = Date.now() - touchStartTimeRef.current

      // Horizontal swipe (distance > 40px, mostly horizontal)
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4 && elapsed < 650) {
        if (deltaX < 0) {
          // Swipe Left -> Next
          if (lifecycle === "prologue") {
            triggerOpeningFlip()
          } else if (lifecycle === "idle") {
            if (mobileFolioTab === "left") {
              setMobileFolioTab("right")
            } else {
              goToNext()
              setMobileFolioTab("left")
            }
          }
        } else {
          // Swipe Right -> Prev
          if (lifecycle === "idle") {
            if (mobileFolioTab === "right") {
              setMobileFolioTab("left")
            } else {
              goToPrev()
              setMobileFolioTab("right")
            }
          }
        }
      }
      // Note: Removed aggressive vertical swipe-down auto-exit to prevent random returns to home
    }
  }

  return (
    <div className="relative w-full h-full flex flex-col select-none">
      {/* Desktop 3D Hardcover Arcane Spellbook (Screens >= lg) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="hidden lg:flex relative w-full h-full flex-col select-none"
      >
        {/* Return to Home Back Button with Smooth Exit Closing Animation */}
        <ExperienceBackBtn onBack={() => handleExit("/")} />

        {/* Main 3D Book Stage — always occupies full height so HUD never shifts it */}
        <div className="relative z-10 w-full h-full flex items-center justify-center min-h-0">
          <SpellPageSpread
            lifecycle={lifecycle}
            onLifecycleAdvance={setLifecycle}
            onOpeningFlip={triggerOpeningFlip}
            onReturnHome={handleReturnHomeImmediate}
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
            audioEnabled={audioEnabled}
          />
        </div>

        {/* Bottom Floating Navigation & Chapter HUD */}
        {showHUD && (
          <div
            className="absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-0 right-0 z-30 flex flex-col items-center gap-1.5 px-2 pointer-events-none"
            style={{
              animation: "hud-slide-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            <div className="pointer-events-auto flex items-center justify-between sm:justify-center gap-1.5 sm:gap-3 p-1 sm:p-1.5 rounded-2xl bg-black/75 border border-white/10 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] max-w-[calc(100vw-1rem)] sm:max-w-none">
              {/* Previous Role Button */}
              <button
                type="button"
                onClick={goToPrev}
                disabled={activeIndex === 0 || isTurning}
                aria-label="Previous Role"
                className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08] hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all text-xs font-mono active:scale-95 cursor-pointer shadow-md shrink-0"
              >
                <ChevronLeft className="size-4 text-[var(--lume-primary,#4affb4)]" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Chapter Timeline Scrubber */}
              <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/[0.03] border border-white/10 shadow-sm shrink-0">
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
                        className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                          isActive
                            ? "w-6 sm:w-8 bg-[var(--lume-primary,#4affb4)] shadow-[0_0_12px_var(--lume-primary)]"
                            : isDest
                            ? "w-4 sm:w-6 bg-[var(--mode-accent-bright,#6affff)] animate-pulse"
                            : "w-2 sm:w-2.5 bg-white/20 hover:bg-white/50"
                        }`}
                      />
                    )
                  })}
                </div>

                <span className="ml-1.5 sm:ml-2.5 text-[10px] sm:text-[11px] font-mono text-white/70 font-semibold whitespace-nowrap">
                  {String(activeIndex + 1).padStart(2, "0")} / {String(spells.length).padStart(2, "0")}
                </span>
              </div>

              {/* Next Role Button */}
              <button
                type="button"
                onClick={goToNext}
                disabled={activeIndex === spells.length - 1 || isTurning}
                aria-label="Next Role"
                className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08] hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all text-xs font-mono active:scale-95 cursor-pointer shadow-md shrink-0"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="size-4 text-[var(--lume-primary,#4affb4)]" />
              </button>

              {/* Auxiliary Controls (Sound & Close Book) */}
              <div className="flex items-center gap-1 pl-1 sm:pl-1.5 border-l border-white/15 shrink-0">
                {/* Audio Toggle */}
                <button
                  type="button"
                  onClick={() => setAudioEnabled((prev) => !prev)}
                  title={audioEnabled ? "Mute Paper & Metal Sound Effects" : "Enable Paper & Metal Sound Effects"}
                  aria-label="Toggle page turn audio"
                  className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer ${
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
                  title="Close Grimoire & Return Home"
                  aria-label="Close Grimoire & Return Home"
                  className="p-1.5 sm:p-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Chapter Context & Keyboard Hint Badge */}
            <div className="pointer-events-none flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-white/40 px-2">
              <span className="flex items-center gap-1.5 text-white/60 truncate max-w-[260px] sm:max-w-none">
                <Layers className="size-2.5 sm:size-3 text-[var(--lume-primary,#4affb4)] shrink-0" />
                <span className="font-semibold text-white/80 truncate">{currentSpell.realm}</span>
                <span className="hidden sm:inline text-white/40">—</span>
                <span className="hidden sm:inline truncate">{currentSpell.spellName}</span>
              </span>
              <span className="hidden md:inline text-white/25">·</span>
              <span className="hidden md:inline text-[10px] text-white/30">
                [← / → keys or edge click to flip chapters · Scroll up or Esc to close]
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Arcane Engineering Scroll (Screens < lg) */}
      <div className="lg:hidden relative z-10 w-full h-full flex flex-col min-h-0">
        <MobileArcaneScroll
          spells={spells}
          audioEnabled={audioEnabled}
          onToggleAudio={() => setAudioEnabled((prev) => !prev)}
          onReturnHome={handleReturnHomeImmediate}
        />
      </div>
    </div>
  )
}
