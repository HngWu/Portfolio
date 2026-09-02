"use client"

import * as React from "react"
import { BentoTile } from "../BentoTile"
import { cn, getTypographyClasses } from "@/lib/utils"
import { ForceMobileContext } from "../ForceMobileContext"
import { useViewModeStore } from "@/store/useViewModeStore"
import { GraduationCap, TrendingUp, Award, ChevronUp, ChevronDown, Sparkles } from "lucide-react"
import { parseTileDeepDive, type EducationContent, type EducationItem } from "@/lib/tiles/schemas"
import type { Json } from "@/types/supabase"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"

interface EducationTileProps {
  id: string
  size: string
  content: EducationContent
  deepDive?: Json
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

const DEFAULT_EDUCATION_ITEMS: EducationItem[] = [
  {
    id: "nus-bcomp",
    level: "university",
    levelLabel: "University",
    institution: "National University of Singapore",
    degree: "Bachelor of Computing in Computer Science",
    date: "Aug 2028 - Aug 2032",
    gpa: "-",
    honours: "Direct Honours Track",
    highlights: ["Distributed Systems & AI Track", "Dean's Merit Pre-admit"],
    caption: "Incoming Computer Science undergraduate."
  },
  {
    id: "nyp-dit",
    level: "polytechnic",
    levelLabel: "Diploma",
    institution: "Nanyang Polytechnic",
    degree: "Diploma in Information Technology with Merit",
    date: "Apr 2023 - Apr 2026",
    gpa: "3.91",
    honours: "Gold Medalist & Ngee Ann Kongsi Tertiary Award",
    highlights: ["Cumulative GPA 3.91 / 4.00", "Specialization in Enterprise Software", "Gold Medalist Awardee"],
    caption: "Graduated with Merit and Gold Medalist recognition."
  },
  {
    id: "cchy-olevel",
    level: "secondary",
    levelLabel: "Secondary",
    institution: "Chung Cheng High School (Yishun)",
    degree: "Singapore-Cambridge GCE O-Level",
    date: "Jan 2019 - Dec 2022",
    gpa: "-",
    honours: "Distinction in Computing & Mathematics",
    highlights: ["Computing Distinction", "Math Olympiad Delegate"],
    caption: "Strong foundational STEM & computing background."
  },
  {
    id: "peiying-psle",
    level: "primary",
    levelLabel: "Primary",
    institution: "Peiying Primary School",
    degree: "Primary School Leaving Examination (PSLE)",
    date: "Jan 2013 - Dec 2018",
    gpa: "251",
    honours: "Top in Cohort in Mathematics",
    highlights: ["Score: 251 / 300", "Top in Cohort in Math"],
    caption: "Early academic excellence award."
  }
]

export function EducationTile({
  id,
  size,
  content,
  deepDive,
  isDragging,
  sortableProps,
}: EducationTileProps) {
  const forceMobile = React.useContext(ForceMobileContext)
  const mode = useViewModeStore((state) => state.mode)
  const typo = getTypographyClasses(size, mode === "deep", forceMobile)
  const deep = parseTileDeepDive("education", deepDive)

  // Resolve items: prefer items array, fallback to single content fields merged with default items
  const items: EducationItem[] = React.useMemo(() => {
    if (content.items && content.items.length > 0) return content.items
    if (deep.items && deep.items.length > 0) return deep.items
    if (content.institution || content.degree) {
      const singleItem: EducationItem = {
        id: "current-edu",
        institution: content.institution || "Nanyang Polytechnic",
        degree: content.degree || "Diploma in Information Technology",
        date: content.date || "2023 - 2026",
        gpa: content.gpa || "3.91",
        honours: deep.honours,
        level: "polytechnic",
        levelLabel: "Diploma",
      }
      return [
        singleItem,
        ...DEFAULT_EDUCATION_ITEMS.filter(
          (i) => i.institution.toLowerCase() !== (content.institution || "").toLowerCase()
        )
      ]
    }
    return DEFAULT_EDUCATION_ITEMS
  }, [content, deep])

  const [activeIndex, setActiveIndex] = React.useState(0)
  const [direction, setDirection] = React.useState(0)
  const isInteractingRef = React.useRef(false)

  // Safe clamping
  const safeIndex = Math.min(Math.max(0, activeIndex), items.length - 1)
  const activeItem = items[safeIndex] || items[0]
  const hasGpa = Boolean(
    activeItem.gpa &&
    activeItem.gpa !== "-" &&
    !isNaN(parseFloat(activeItem.gpa)) &&
    parseFloat(activeItem.gpa) <= 4.0
  )

  const goToNext = React.useCallback(() => {
    setDirection(1)
    setActiveIndex((prev) => (prev + 1) % items.length)
  }, [items.length])

  const goToPrev = React.useCallback(() => {
    setDirection(-1)
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length)
  }, [items.length])

  const goToIndex = React.useCallback(
    (target: number) => {
      if (target === activeIndex) return
      setDirection(target > activeIndex ? 1 : -1)
      setActiveIndex(target)
    },
    [activeIndex]
  )

  // Swipe / Drag Gestures
  const handleDragStart = () => {
    isInteractingRef.current = true
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setTimeout(() => {
      isInteractingRef.current = false
    }, 100)

    const offsetThreshold = 25
    const velocityThreshold = 200

    if (info.offset.y < -offsetThreshold || info.velocity.y < -velocityThreshold) {
      goToNext()
    } else if (info.offset.y > offsetThreshold || info.velocity.y > velocityThreshold) {
      goToPrev()
    }
  }

  // Keyboard navigation when focused
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault()
      e.stopPropagation()
      goToNext()
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault()
      e.stopPropagation()
      goToPrev()
    }
  }

  // Next 2 peek cards for stacked depth effect
  const peekCard1 = items[(safeIndex + 1) % items.length]
  const peekCard2 = items.length > 2 ? items[(safeIndex + 2) % items.length] : null

  return (
    <BentoTile
      id={id}
      size={size}
      href="/education"
      glowColor="blue"
      isDragging={isDragging}
      sortableProps={sortableProps}
      deepContent={
        <div
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="flex flex-col h-full overflow-hidden select-none outline-none"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-3 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h3 className={cn(typo.heading, "text-white/90")}>Academic Profile</h3>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#4A8FFF] font-semibold uppercase tracking-wider">
                  {activeItem.levelLabel || activeItem.level || "Academic"}
                </span>
              </div>
              <p className={cn(typo.body, "text-white/60 mt-0.5 text-xs line-clamp-2 leading-snug")}>{activeItem.institution}</p>
            </div>

            {/* Desktop Chevrons for Deep Dive */}
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <span className="text-[10px] font-mono text-white/30 mr-1 select-none">
                {String(safeIndex + 1).padStart(2, "0")}/{String(items.length).padStart(2, "0")}
              </span>
              <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-lg p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrev()
                  }}
                  aria-label="Previous education level"
                  className="p-1 hover:bg-white/10 hover:text-lume-primary text-white/50 rounded transition-colors active:scale-95"
                >
                  <ChevronUp className="size-3.5" />
                </button>
                <div className="w-[1px] h-3 bg-white/10" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                  aria-label="Next education level"
                  className="p-1 hover:bg-white/10 hover:text-lume-primary text-white/50 rounded transition-colors active:scale-95"
                >
                  <ChevronDown className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Deep Dive Body */}
          <div className="flex-1 space-y-3.5">
            <div className="space-y-0.5">
              <span className={cn(typo.meta, "text-white/30 uppercase tracking-widest text-[9px]")}>
                Program / Degree
              </span>
              <p className={cn(typo.body, "text-white/80 font-medium leading-tight text-xs md:text-sm line-clamp-2")}>
                {activeItem.degree}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Metric Box */}
              <div className="relative p-3.5 bg-transparent rounded-xl border border-white/5 overflow-hidden group/gpa flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-2 opacity-20 group-hover/gpa:opacity-40 transition-opacity">
                  <TrendingUp className="size-3.5 text-lume-primary" />
                </div>
                <span className={cn(typo.meta, "block text-white/30 text-[9px] mb-1")}>
                  {hasGpa ? "Cumulative GPA" : activeItem.gpa && activeItem.gpa !== "-" ? "Score" : "Standing"}
                </span>
                <div className="flex items-baseline gap-1 my-0.5">
                  <span className={cn(typo.heading, "text-lume-primary leading-none font-mono text-xl md:text-2xl")}>
                    {activeItem.gpa && activeItem.gpa !== "-" ? activeItem.gpa : "Honours Track"}
                  </span>
                  {hasGpa && <span className="text-[9px] text-white/20 font-mono">/ 4.00</span>}
                </div>
                {hasGpa && (
                  <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-lume-primary/60"
                      style={{ width: `${(parseFloat(activeItem.gpa!) / 4) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Period & Honours Box */}
              <div className="p-3.5 bg-transparent rounded-xl border border-white/5 flex flex-col justify-between">
                <div>
                  <span className={cn(typo.meta, "block text-white/30 text-[9px] mb-1")}>Study Period</span>
                  <span className={cn(typo.body, "text-white/80 font-medium leading-tight text-xs")}>
                    {activeItem.date}
                  </span>
                </div>
                {activeItem.honours && activeItem.honours !== "-" && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Award className="size-3 text-lume-primary/70 shrink-0" />
                    <span
                      className="text-[8px] md:text-[9px] text-lume-primary font-bold uppercase tracking-tighter truncate"
                      title={activeItem.honours}
                    >
                      {activeItem.honours}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Highlights / Specializations */}
            {activeItem.highlights && activeItem.highlights.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeItem.highlights.slice(0, 3).map((hl, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/5 text-white/60 font-mono"
                  >
                    {hl}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      }
    >
      {/* Front Face: Quick Pitch 3D Stack */}
      <div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative flex flex-col h-full w-full outline-none"
      >
        {/* Top Header with Level badge and Desktop Controls */}
        <div className="flex items-center justify-between mb-3 shrink-0 relative z-30">
          <div className="flex items-center gap-2">
            <span className={cn(typo.meta, "text-white/40 uppercase tracking-widest flex items-center gap-1.5")}>
              <GraduationCap className={cn(typo.icon, "text-[#4A8FFF]")} />
              Education
            </span>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#4A8FFF] font-semibold uppercase tracking-wider">
              {activeItem.levelLabel || activeItem.level || "Academic"}
            </span>
          </div>

          {/* Desktop Controls & Counter */}
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <span className="text-[10px] font-mono text-white/30 mr-1 select-none">
              {String(safeIndex + 1).padStart(2, "0")}/{String(items.length).padStart(2, "0")}
            </span>
            <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-lg p-0.5 shadow-sm">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrev()
                }}
                aria-label="Previous education level"
                title="Previous level (Swipe Down / Up Arrow)"
                className="p-1 hover:bg-white/10 hover:text-lume-primary text-white/50 rounded transition-colors active:scale-95"
              >
                <ChevronUp className="size-3.5" />
              </button>
              <div className="w-[1px] h-3 bg-white/10" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                aria-label="Next education level"
                title="Next level (Swipe Up / Down Arrow)"
                className="p-1 hover:bg-white/10 hover:text-lume-primary text-white/50 rounded transition-colors active:scale-95"
              >
                <ChevronDown className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3D Stack Container */}
        <div className="relative flex-1 w-full min-h-[160px] flex flex-col justify-end">
          {/* Background Peek Card 2 (Bottom-most) */}
          {peekCard2 && (
            <div
              className="absolute inset-x-4 bottom-0 h-[82%] rounded-2xl bg-transparent border border-white/[0.04] pointer-events-none transition-all duration-300 shadow-sm"
              style={{
                transform: "translateY(14px) scale(0.92)",
                opacity: 0.25,
                zIndex: 1,
              }}
            />
          )}

          {/* Background Peek Card 1 (Middle) */}
          {peekCard1 && (
            <div
              className="absolute inset-x-2 bottom-0 h-[90%] rounded-2xl bg-transparent border border-white/[0.07] pointer-events-none transition-all duration-300 shadow-sm"
              style={{
                transform: "translateY(7px) scale(0.96)",
                opacity: 0.5,
                zIndex: 2,
              }}
            />
          )}

          {/* Side Vertical Indicator Rail */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-30"
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item, idx) => {
              const isCurrent = idx === safeIndex
              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToIndex(idx)
                  }}
                  aria-label={`Go to ${item.institution}`}
                  title={`${item.levelLabel || item.institution} (${item.date})`}
                  className={cn(
                    "transition-all duration-300 rounded-full",
                    isCurrent
                      ? "w-1.5 h-3.5 bg-[#4A8FFF] shadow-[0_0_8px_rgba(74,143,255,0.7)]"
                      : "w-1.5 h-1.5 bg-white/20 hover:bg-white/50 hover:scale-125"
                  )}
                />
              )
            })}
          </div>

          {/* Active Card Surface with Framer Motion Drag & Transitions */}
          <AnimatePresence custom={direction} mode="popLayout">
            <motion.div
              key={activeItem.id || safeIndex}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  y: dir >= 0 ? 20 : -20,
                  opacity: 0,
                  scale: 0.96,
                }),
                center: {
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  transition: {
                    y: { type: "spring", stiffness: 350, damping: 28 },
                    opacity: { duration: 0.25 },
                    scale: { duration: 0.25 },
                  },
                },
                exit: (dir: number) => ({
                  y: dir >= 0 ? -20 : 20,
                  opacity: 0,
                  scale: 0.96,
                  transition: {
                    duration: 0.2,
                  },
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.25}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              className="relative z-10 flex flex-col justify-between h-full w-full cursor-grab active:cursor-grabbing touch-pan-y"
            >
              <div className="pr-5 select-none">
                <h3 className="font-display text-lg md:text-xl font-medium text-white/90 tracking-tight mb-1 line-clamp-2 leading-tight">
                  {activeItem.institution}
                </h3>
                <p className={cn(typo.body, "text-white/60 text-xs md:text-sm font-normal line-clamp-2 leading-snug")}>
                  {activeItem.degree}
                </p>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between border-t border-white/5 pr-5 select-none">
                <span className={cn(typo.meta, "text-white/40")}>{activeItem.date}</span>
                {activeItem.gpa && activeItem.gpa !== "-" ? (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[10px] font-mono text-lume-primary">
                    <TrendingUp className="size-3 text-lume-primary" />
                    <span>{activeItem.gpa.includes("/") ? activeItem.gpa : `GPA ${activeItem.gpa}`}</span>
                  </div>
                ) : activeItem.honours && activeItem.honours !== "-" ? (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[9px] font-mono text-[#4A8FFF] max-w-[130px] truncate">
                    <Award className="size-3 text-[#4A8FFF] shrink-0" />
                    <span className="truncate">{activeItem.honours}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[9px] font-mono text-white/30">
                    <Sparkles className="size-2.5 text-blue-400/60" />
                    <span>Swipe up/down</span>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </BentoTile>
  )
}
