"use client"

import * as React from "react"
import { motion } from "framer-motion"
import type { SpellData } from "@/lib/content/experienceSpells"
import { CyberSpindleRod } from "./scroll/CyberSpindleRod"
import { ManaConduitTrace } from "./scroll/ManaConduitTrace"
import { playPageTurnSound, playBookCloseSound } from "@/lib/experience/bookAudio"
import { useNavigationStore } from "@/store/useNavigationStore"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Cpu,
  Building2,
  Terminal,
  CheckCircle2,
  Zap,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldCheck,
  Lock,
} from "lucide-react"

interface MobileArcaneScrollProps {
  spells: SpellData[]
  audioEnabled: boolean
  onToggleAudio: () => void
  onReturnHome: () => void
}

type ScrollRollState = "rolled" | "unrolling" | "open" | "rolling-up"

function MobileCompanyLogo({
  logoType,
  realm,
  logoUrl,
}: {
  logoType?: "dbs" | "ttp" | "default"
  realm: string
  logoUrl?: string
}) {
  const normRealm = realm.toLowerCase()
  const isDbs = logoType === "dbs" || normRealm.includes("dbs") || normRealm.includes("bank")
  const isTtp = logoType === "ttp" || normRealm.includes("point") || normRealm.includes("ttp")

  if (isDbs) {
    return (
      <div
        title="DBS Bank"
        className="relative shrink-0 h-8 sm:h-9 px-2.5 sm:px-3 py-1 rounded-xl bg-white border border-white/60 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl || "/images/experience/dbs-bank.svg"}
          alt="DBS Bank logo"
          className="h-4 sm:h-5 w-auto max-w-[75px] sm:max-w-[85px] object-contain"
        />
      </div>
    )
  }

  if (isTtp) {
    return (
      <div
        title="To The Point"
        className="relative shrink-0 h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl bg-[#333399] border border-[#333399] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl || "/images/experience/to-the-point.png"}
          alt="To The Point logo"
          className="h-4 sm:h-5 w-auto max-w-[80px] sm:max-w-[95px] object-contain rounded-sm"
        />
      </div>
    )
  }

  return (
    <div
      title={realm}
      className="relative shrink-0 size-8 sm:size-9 rounded-xl bg-white/[0.04] border border-white/15 p-1 flex items-center justify-center backdrop-blur-md"
    >
      <span className="font-mono text-[11px] sm:text-xs font-bold text-white tracking-tight">
        {realm.slice(0, 2).toUpperCase()}
      </span>
    </div>
  )
}

/**
 * Inscribed Arcane Chapter Divider
 * Seamlessly divides chapters inside the continuous parchment sheet with runic filigree lines.
 */
function ArcaneChapterDivider({
  chapterNumber,
  totalChapters,
  title,
}: {
  chapterNumber: number
  totalChapters: number
  title: string
}) {
  return (
    <div className="relative py-4 sm:py-6 flex flex-col items-center select-none" aria-hidden="true">
      {/* Decorative horizontal gold filigree line */}
      <div className="w-full flex items-center justify-center gap-2">
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#FFD95A]/40 to-[#FFD95A]/70" />
        <div className="px-3 py-1 rounded-full bg-[#060a14] border border-[#FFD95A]/50 flex items-center gap-2 shadow-[0_0_12px_rgba(255,217,90,0.25)]">
          <span className="size-1 rounded-full bg-[#FFE875]" />
          <span className="font-mono text-[9px] sm:text-[10px] text-[#FFE875] tracking-widest uppercase font-semibold">
            ✦ CHAPTER 0{chapterNumber} / 0{totalChapters} ✦
          </span>
          <span className="size-1 rounded-full bg-[#4affb4]" />
        </div>
        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#FFD95A]/40 to-[#FFD95A]/70" />
      </div>
      <span className="font-mono text-[8.5px] text-white/35 uppercase tracking-widest mt-1">
        {title}
      </span>
    </div>
  )
}

export function MobileArcaneScroll({
  spells,
  audioEnabled,
  onToggleAudio,
  onReturnHome,
}: MobileArcaneScrollProps) {
  const [rollState, setRollState] = React.useState<ScrollRollState>("rolled")
  const [activeChapter, setActiveChapter] = React.useState(0)
  const [scrollProgress, setScrollProgress] = React.useState(0)
  const chapterRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const containerRef = React.useRef<HTMLDivElement>(null)
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const spindleRef = React.useRef<HTMLDivElement>(null)
  const [targetY, setTargetY] = React.useState<number>(650)
  const isExitingRef = React.useRef(false)
  const audioEnabledRef = React.useRef(audioEnabled)

  React.useEffect(() => {
    audioEnabledRef.current = audioEnabled
  }, [audioEnabled])

  const curtainState = useNavigationStore((s) => s.curtainState)

  // Measure viewport and spindle height to compute exact docking target
  React.useLayoutEffect(() => {
    const updateTarget = () => {
      if (viewportRef.current) {
        const vHeight = viewportRef.current.clientHeight
        const sHeight = spindleRef.current?.clientHeight || 80
        setTargetY(Math.max(0, vHeight - sHeight))
      }
    }

    updateTarget()

    const el = viewportRef.current
    if (typeof ResizeObserver !== "undefined" && el) {
      const ro = new ResizeObserver(() => updateTarget())
      ro.observe(el)
      return () => ro.disconnect()
    } else {
      window.addEventListener("resize", updateTarget)
      return () => window.removeEventListener("resize", updateTarget)
    }
  }, [])

  // Authentic physical unrolling sequence:
  // Phase 1: Starts rolled up at the top. Triggers once the transition curtain is revealing or idle.
  React.useEffect(() => {
    if (rollState === "rolled" && (curtainState === "revealing" || curtainState === "idle")) {
      const timer = setTimeout(() => {
        setRollState("unrolling")
        playPageTurnSound(audioEnabledRef.current)
      }, 90)

      return () => clearTimeout(timer)
    }
  }, [curtainState, rollState])

  // Phase 2: Settle into open state once the 850ms downward unroll animation completes
  React.useEffect(() => {
    if (rollState === "unrolling") {
      const timer = setTimeout(() => {
        setRollState("open")
      }, 850)

      return () => clearTimeout(timer)
    }
  }, [rollState])

  // Defensive Fallback Watchdog: Guarantees scroll unlocks even under background tab delay
  React.useEffect(() => {
    const watchdog = setTimeout(() => {
      setRollState((prev) => (prev === "rolling-up" ? prev : "open"))
    }, 1200)

    return () => clearTimeout(watchdog)
  }, [])

  // Graceful physical furling re-roll sequence on exit:
  // Rolls the bottom spindle back to top, closing the parchment, before navigating home.
  const handleTriggerExit = React.useCallback(() => {
    if (isExitingRef.current) return
    isExitingRef.current = true
    setRollState("rolling-up")
    playPageTurnSound(audioEnabledRef.current)

    setTimeout(() => {
      playBookCloseSound(audioEnabledRef.current)
      onReturnHome()
    }, 780)
  }, [onReturnHome])

  const scrollToChapter = (index: number) => {
    setActiveChapter(index)
    const targetEl = chapterRefs.current[index]
    if (targetEl && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const targetRect = targetEl.getBoundingClientRect()
      const offset = targetRect.top - containerRect.top + containerRef.current.scrollTop
      containerRef.current.scrollTo({ top: Math.max(0, offset - 12), behavior: "smooth" })
    }
  }

  // Scroll listener updating scrollProgress & Chapter Scroll-Spy
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const containerTop = el.scrollTop
    const maxScroll = el.scrollHeight - el.clientHeight
    if (maxScroll > 0) {
      setScrollProgress(containerTop / maxScroll)
    }

    chapterRefs.current.forEach((ref, idx) => {
      if (ref) {
        const offset = ref.offsetTop - containerTop
        if (offset < 280 && offset > -ref.offsetHeight + 60) {
          setActiveChapter(idx)
        }
      }
    })
  }

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#020408] select-none flex flex-col justify-between">
      {/* Background Cyber-Arcane Particle Ambience & Noise */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-20 mix-blend-overlay bg-[url('/assets/noise.svg')]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_15%,rgba(74,255,180,0.07),transparent_70%)]"
      />

      {/* Top Mechanical Spindle & Sticky Header */}
      <div className="sticky top-0 inset-x-0 z-40 bg-[#04070e]/95 backdrop-blur-2xl border-b border-[#FFD95A]/25 shadow-[0_10px_35px_rgba(0,0,0,0.85)]">
        <CyberSpindleRod variant="top" isAnimating={rollState !== "open"}>
          <div className="px-2.5 sm:px-4 py-2 flex items-center justify-between gap-1.5 min-w-0">
            {/* Return to Portfolio Home */}
            <button
              type="button"
              onClick={handleTriggerExit}
              aria-label="Roll up scroll and return to portfolio home"
              title="Roll & Return to Portfolio"
              className="p-1.5 sm:p-2 rounded-xl bg-white/[0.04] border border-[#FFD95A]/30 text-[#FFE875] hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer min-w-[34px] min-h-[34px] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(255,217,90,0.15)]"
            >
              <ArrowLeft className="size-4" />
            </button>

            {/* Quick Chapter Pill Switcher */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/75 border border-white/15 text-xs font-mono min-w-0 overflow-x-auto no-scrollbar">
              {spells.map((s, idx) => {
                const isDbs = s.realm.toLowerCase().includes("dbs")
                const label = isDbs ? "01 DBS Bank" : "02 To The Point"
                const isActive = activeChapter === idx
                return (
                  <button
                    key={s.id || idx}
                    type="button"
                    onClick={() => scrollToChapter(idx)}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap text-[10.5px] sm:text-[11.5px] font-medium shrink-0 ${
                      isActive
                        ? "bg-[var(--lume-primary,#4affb4)]/20 border border-[var(--lume-primary)]/50 text-white font-semibold shadow-[0_0_12px_rgba(74,255,180,0.25)]"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Sound Audio Toggle */}
            <button
              type="button"
              onClick={onToggleAudio}
              aria-label="Toggle page turn audio"
              className="p-1.5 sm:p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/50 hover:text-white transition-all cursor-pointer min-w-[34px] min-h-[34px] flex items-center justify-center shrink-0"
            >
              {audioEnabled ? (
                <Volume2 className="size-4 text-[var(--lume-primary)]" />
              ) : (
                <VolumeX className="size-4" />
              )}
            </button>
          </div>
        </CyberSpindleRod>
      </div>

      {/* Viewport Framing: The boundary across which the scroll physically unfurls */}
      <div
        ref={viewportRef}
        className="relative flex-1 w-full min-h-0 overflow-hidden"
      >
        {/* 
          1. PARCHMENT REVEAL VIEWPORT
          Synchronizes its height with the descending/ascending bottom spindle
        */}
        <motion.div
          ref={containerRef}
          onScroll={handleScroll}
          initial={false}
          animate={{
            height:
              rollState === "rolled" || rollState === "rolling-up"
                ? 0
                : targetY,
          }}
          transition={{
            duration: rollState === "rolling-up" ? 0.75 : 0.85,
            ease: rollState === "rolling-up" ? [0.36, 0, 0.66, -0.56] : [0.16, 1, 0.3, 1],
          }}
          className={cn(
            "w-full arcane-scrollbar touch-pan-y flex flex-col pt-2 pb-10 px-2 sm:px-4 md:px-6",
            rollState === "open" ? "overflow-y-auto" : "overflow-hidden"
          )}
        >
          {/* 
            UNIFIED CONTINUOUS PARCHMENT SHEET 
            One unbroken vellum canvas bounded by left/right gilded deckle rails.
          */}
          <div className="relative w-full max-w-2xl mx-auto shrink-0 h-fit rounded-b-2xl bg-gradient-to-b from-[#0c1324]/95 via-[#070c18]/95 to-[#04060e]/98 border-x-2 border-b border-[#FFD95A]/35 shadow-[0_20px_70px_rgba(0,0,0,0.95)] overflow-hidden">
          {/* Internal Parchment Texture & Gilded Edge Highlights */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-15 mix-blend-overlay bg-[url('/assets/noise.svg')]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-[#FFE875] via-[#4affb4]/40 to-[#FFD95A]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-[#FFE875] via-[#4affb4]/40 to-[#FFD95A]"
          />

          {/* Content Layout with Left Margin Mana Conduit */}
          <div className="relative z-10 w-full flex gap-2 sm:gap-3 p-3.5 sm:p-5">
            {/* Left Margin: Continuous Vertical Mana Conduit */}
            <div className="shrink-0 pt-3 pb-8 flex justify-center">
              <ManaConduitTrace progress={scrollProgress} />
            </div>

            {/* Inscribed Parchment Body */}
            <div className="flex-1 min-w-0 space-y-4 sm:space-y-6">
              {/* SECTION 1: PROLOGUE INSCRIPTION */}
              <div className="pb-3 border-b border-[#FFD95A]/20 space-y-2">
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="size-3 text-[#FFE875] animate-pulse" />
                    <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#FFE875] font-semibold">
                      ARCHIVE // PRODUCTION ENGINEERING DOSSIER
                    </span>
                  </div>
                  <span className="font-mono text-[8.5px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 flex items-center gap-1">
                    <ShieldCheck className="size-2.5 text-[#4affb4]" />
                    STATUS: VERIFIED
                  </span>
                </div>

                <h1 className="text-base sm:text-xl font-serif font-bold text-white tracking-tight leading-snug">
                  Tan Hng Wu // Production Systems & Architecture
                </h1>
                <p className="text-[10.5px] sm:text-[11.5px] text-white/60 font-mono leading-relaxed">
                  Enterprise Migrations · OpenShift CI/CD Automation · IT Systems Support & Quality Assurance
                </p>
              </div>

              {/* CAREER CHAPTERS INSCRIBED ON PARCHMENT */}
              {spells.map((spell, idx) => (
                <div key={spell.id || idx} className="space-y-4">
                  {/* Inscribed Arcane Chapter Divider between sections */}
                  {idx > 0 && (
                    <ArcaneChapterDivider
                      chapterNumber={idx + 1}
                      totalChapters={spells.length}
                      title={spell.realm}
                    />
                  )}

                  {/* Chapter Content Block */}
                  <div
                    ref={(el) => {
                      chapterRefs.current[idx] = el
                    }}
                    className="relative space-y-3.5 sm:space-y-4 pt-1"
                  >
                    {/* Chapter Header */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="font-mono text-[9.5px] sm:text-[10px] text-[var(--lume-primary,#4affb4)] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)] animate-pulse" />
                          Chapter 0{idx + 1} / 0{spells.length}
                        </span>
                        <span className="font-mono text-[8.5px] sm:text-[9px] uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70 flex items-center gap-1">
                          <Calendar className="size-2.5 text-[var(--lume-primary)]" />
                          {spell.era}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[8.5px] sm:text-[9px] font-mono text-[var(--mode-accent-bright,#6affff)] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[var(--mode-accent-bright)]/10 border border-[var(--mode-accent-bright)]/20">
                          {spell.school}
                        </span>
                        <span className="text-[8.5px] sm:text-[9px] font-mono text-white/40 uppercase">
                          · {spell.tier}
                        </span>
                      </div>

                      <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight leading-snug">
                        {spell.spellName}
                      </h2>

                      {/* Company Emblem & Title */}
                      <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                        <MobileCompanyLogo
                          logoType={spell.logoType}
                          realm={spell.realm}
                          logoUrl={spell.logoUrl}
                        />
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono text-white font-medium shadow-sm truncate max-w-full">
                          <Building2 className="size-3 text-[var(--lume-primary,#4affb4)] shrink-0" />
                          <span className="truncate">{spell.realm}</span>
                        </div>
                      </div>
                    </div>

                    {/* Core Technologies & Architecture */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Cpu className="size-3.5 text-[var(--lume-primary,#4affb4)] shrink-0" />
                        <h3 className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-white/90 font-semibold">
                          Core Technologies & Architecture
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5">
                        {spell.ingredients.map((ing, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl bg-white/[0.025] border border-white/10"
                          >
                            <span className="size-5 sm:size-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs shrink-0">
                              {ing.symbol || "⚡"}
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="text-[11px] sm:text-[11.5px] font-medium text-white/90 block truncate">
                                {ing.name}
                              </span>
                              <span className="text-[8.5px] sm:text-[9px] font-mono text-white/40 uppercase block tracking-tight truncate">
                                {ing.category}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Responsibilities & Projects */}
                    <div className="space-y-1.5 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="size-3.5 text-[var(--lume-primary,#4affb4)] shrink-0" />
                        <h3 className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-white/90 font-semibold">
                          Key Responsibilities & Projects
                        </h3>
                      </div>
                      <div className="space-y-1.5">
                        {spell.incantation.map((inc, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-1.5 sm:gap-2 p-1.5 rounded-lg bg-white/[0.015]"
                          >
                            <span className="shrink-0 size-3.5 sm:size-4 mt-0.5 rounded bg-[#070b14] border border-white/15 text-[8.5px] sm:text-[9px] font-mono font-bold text-[var(--lume-primary,#4affb4)] flex items-center justify-center">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <div className="text-[11px] sm:text-[11.5px] leading-relaxed flex-1">
                              <span className="font-semibold font-mono text-[10.5px] sm:text-[11px] text-[var(--lume-primary,#4affb4)] mr-1.5 inline">
                                {inc.lead}
                              </span>
                              <span className="text-white/80">{inc.verse}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivered Impact & Verified Metrics */}
                    <div className="space-y-1.5 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3 text-[var(--mode-accent-bright,#6affff)] shrink-0" />
                        <span className="font-mono text-[9.5px] sm:text-[10px] uppercase tracking-wider text-[var(--mode-accent-bright,#6affff)] font-semibold">
                          Delivered Impact & Verified Metrics
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {spell.effects.map((eff, i) => (
                          <div
                            key={i}
                            className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 p-2 rounded-xl bg-white/[0.025] border border-white/10"
                          >
                            <span className="text-[10.5px] sm:text-[11px] text-white/85 leading-snug flex-1">
                              {eff.outcome}
                            </span>
                            {eff.metric && (
                              <span className="shrink-0 font-mono text-[8.5px] sm:text-[9px] px-2 py-0.5 rounded bg-[var(--lume-primary,#4affb4)]/15 border border-[var(--lume-primary,#4affb4)]/30 text-[var(--lume-primary,#4affb4)] font-semibold whitespace-nowrap flex items-center gap-1">
                                <Zap className="size-2.5 text-[var(--lume-primary,#4affb4)]" />
                                {eff.metric}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Final Chronicle Inscription Seal */}
              <div className="pt-4 pb-4 flex flex-col items-center text-center space-y-1.5 border-t border-[#FFD95A]/20">
                <span className="font-mono text-[9px] text-[#FFE875]/70 tracking-widest uppercase">
                  ✦ CHRONICLE END // ARCHIVE RECORD SEALED ✦
                </span>
                <span className="text-[10.5px] font-mono text-white/40">
                  Total Impact: 100% Zero Downtime · Automated CI/CD Deployments
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 
        2. PHYSICAL TRAVELING / DOCKED BOTTOM SPINDLE ROD ASSEMBLY
        Visibly rolls down from top (y: 0) to bottom (y: targetY) on entry,
        rests docked at the bottom of the viewport during interaction,
        and visibly rolls back up to the top (y: 0) upon exit.
      */}
      <motion.div
        ref={spindleRef}
        initial={false}
        animate={{
          y: rollState === "rolled" || rollState === "rolling-up" ? 0 : targetY,
        }}
        transition={{
          duration: rollState === "rolling-up" ? 0.75 : 0.85,
          ease: rollState === "rolling-up" ? [0.36, 0, 0.66, -0.56] : [0.16, 1, 0.3, 1],
        }}
        className="absolute inset-x-0 top-0 z-30 px-2 sm:px-4 md:px-6 pointer-events-auto"
      >
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
          {/* 3D Curled Parchment Shadow (emphasized during unroll / roll-up) */}
          <div
            className={cn(
              "w-full h-4 sm:h-5 bg-gradient-to-t from-black/95 via-[#FFD95A]/25 to-transparent blur-[1px] transition-opacity duration-300 pointer-events-none",
              rollState !== "open" ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Cylinder Spindle Rod with High-RPM Brass Gears */}
          <div className="w-full relative shadow-[0_12px_35px_rgba(0,0,0,0.95)]">
            <CyberSpindleRod
              variant="bottom"
              isAnimating={rollState !== "open"}
            />
          </div>

          {/* Bottom Spindle Control Plinth with Quick Return Action */}
          <div className="w-full py-1.5 sm:py-2 px-3 bg-[#04070e]/95 backdrop-blur-xl border-x-2 border-b-2 border-[#FFD95A]/35 rounded-b-xl flex items-center justify-between gap-2 shadow-[0_15px_30px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-1.5 text-[8.5px] sm:text-[9.5px] font-mono text-[#FFE875]/70 tracking-widest uppercase truncate">
              <Lock className="size-3 text-[#FFD95A] shrink-0" />
              <span className="truncate">ARCANE CHRONICLE</span>
            </div>

            <button
              type="button"
              onClick={handleTriggerExit}
              aria-label="Roll up scroll and return to portfolio"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-white/[0.05] via-[#FFD95A]/15 to-white/[0.05] border border-[#FFD95A]/40 hover:border-[#FFD95A] text-[#FFE875] hover:text-white font-mono text-[11px] sm:text-xs transition-all active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(255,217,90,0.2)] shrink-0"
            >
              <RotateCcw className="size-3 sm:size-3.5 text-[#FFE875]" />
              <span>Roll & Return</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
    </div>
  )
}
