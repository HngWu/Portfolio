"use client"

import * as React from "react"
import { BentoTile } from "../BentoTile"
import { cn, getTypographyClasses } from "@/lib/utils"
import { ForceMobileContext } from "../ForceMobileContext"
import { GraduationCap, ChevronUp, ChevronDown } from "lucide-react"
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
  const typo = getTypographyClasses(size, false, forceMobile)
  const deepTypo = getTypographyClasses(size, true, forceMobile)
  const deep = React.useMemo(() => parseTileDeepDive("education", deepDive), [deepDive])

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

  // Safe clamping
  const safeIndex = Math.min(Math.max(0, activeIndex), items.length - 1)
  const activeItem = items[safeIndex] || items[0]

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

  const isMobile = React.useSyncExternalStore(
    React.useCallback((callback: () => void) => {
      const mediaQuery = window.matchMedia("(max-width: 767px)")
      mediaQuery.addEventListener("change", callback)
      return () => mediaQuery.removeEventListener("change", callback)
    }, []),
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false
  )
  const isMobileEffective = forceMobile || isMobile

  // Swipe / Drag Gestures
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offsetThreshold = 40
    const velocityThreshold = 250

    if (isMobileEffective) {
      if (info.offset.x < -offsetThreshold || info.velocity.x < -velocityThreshold) {
        goToNext()
      } else if (info.offset.x > offsetThreshold || info.velocity.x > velocityThreshold) {
        goToPrev()
      }
    } else {
      if (info.offset.y < -offsetThreshold || info.velocity.y < -velocityThreshold) {
        goToNext()
      } else if (info.offset.y > offsetThreshold || info.velocity.y > velocityThreshold) {
        goToPrev()
      }
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
  const peekCard1 = items.length > 1 ? items[(safeIndex + 1) % items.length] : null
  const peekCard2 = items.length > 2 ? items[(safeIndex + 2) % items.length] : null

  const renderFace = (isDeep: boolean) => {
    const currentTypo = isDeep ? deepTypo : typo
    const accentIconClass = isDeep ? "text-mode-accent-bright" : "text-[#4A8FFF]"
    const badgeClass = isDeep
      ? "font-mono text-[9px] px-2 py-0.5 rounded-full bg-mode-accent/10 border border-mode-accent/20 text-mode-accent-bright font-semibold uppercase tracking-wider"
      : "font-mono text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#4A8FFF] font-semibold uppercase tracking-wider"
    const activeDotClass = isDeep
      ? "w-1.5 h-3.5 bg-mode-accent-bright shadow-[0_0_8px_rgba(106,255,255,0.7)]"
      : "w-1.5 h-3.5 bg-[#4A8FFF] shadow-[0_0_8px_rgba(74,143,255,0.7)]"
    const headingClass = isDeep
      ? "font-mono tracking-tight font-bold text-xl sm:text-xl md:text-2xl text-white/90 mb-1 line-clamp-2 leading-tight"
      : "font-display text-xl sm:text-xl md:text-2xl font-medium text-white/90 tracking-tight mb-1 line-clamp-2 leading-tight"

    return (
      <div
        role="region"
        aria-label="Education history carousel"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative flex flex-col h-full w-full outline-none focus-visible:ring-1 focus-visible:ring-mode-accent rounded-xl"
      >
        {/* Top Header with Level badge and Desktop Controls */}
        <div className="flex items-center justify-between mb-2 shrink-0 relative z-30">
          <div className="flex items-center gap-2">
            <span className={cn(currentTypo.meta, "text-white/40 uppercase tracking-widest flex items-center gap-1.5")}>
              <GraduationCap className={cn(currentTypo.icon, accentIconClass)} aria-hidden="true" />
              Education
            </span>
            <span className={cn("hidden sm:inline-flex", badgeClass)}>
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
                className="p-1.5 hover:bg-white/10 hover:text-mode-accent-bright text-white/50 rounded transition-colors active:scale-95 min-w-[28px] min-h-[28px] flex items-center justify-center"
              >
                <ChevronUp className="size-3.5" aria-hidden="true" />
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
                className="p-1.5 hover:bg-white/10 hover:text-mode-accent-bright text-white/50 rounded transition-colors active:scale-95 min-w-[28px] min-h-[28px] flex items-center justify-center"
              >
                <ChevronDown className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* 3D Stack Container */}
        <div className="relative flex-1 w-full min-h-0 flex flex-col justify-between">
          {/* Background Peek Card 2 (Bottom-most) */}
          {peekCard2 && (
            <div
              className="absolute inset-x-4 bottom-0 h-[82%] rounded-2xl bg-transparent border border-white/[0.04] pointer-events-none transition-all duration-300 shadow-sm"
              style={{
                transform: "translateY(8px) scale(0.92)",
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
                  aria-current={isCurrent ? "true" : undefined}
                  onClick={(e) => {
                    e.stopPropagation()
                    goToIndex(idx)
                  }}
                  aria-label={`Go to ${item.institution}`}
                  title={`${item.levelLabel || item.institution} (${item.date})`}
                  className="p-1 flex items-center justify-center min-w-[20px] min-h-[20px]"
                >
                  <span
                    className={cn(
                      "transition-all duration-300 rounded-full",
                      isCurrent
                        ? activeDotClass
                        : "w-1.5 h-1.5 bg-white/20 hover:bg-white/50 hover:scale-125"
                    )}
                  />
                </button>
              )
            })}
          </div>

          {/* Active Card Surface with Framer Motion Drag & Transitions */}
          <AnimatePresence custom={direction} mode="popLayout">
            <motion.div
              key={`${isDeep ? "deep" : "qp"}-${activeItem.id || safeIndex}`}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  x: isMobileEffective ? (dir >= 0 ? 30 : -30) : 0,
                  y: !isMobileEffective ? (dir >= 0 ? 20 : -20) : 0,
                  opacity: 0,
                  scale: 0.96,
                }),
                center: {
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  transition: {
                    x: { type: "spring", stiffness: 350, damping: 28 },
                    y: { type: "spring", stiffness: 350, damping: 28 },
                    opacity: { duration: 0.25 },
                    scale: { duration: 0.25 },
                  },
                },
                exit: (dir: number) => ({
                  x: isMobileEffective ? (dir >= 0 ? -30 : 30) : 0,
                  y: !isMobileEffective ? (dir >= 0 ? -20 : 20) : 0,
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
              drag={isMobileEffective ? "x" : "y"}
              dragDirectionLock={true}
              dragConstraints={isMobileEffective ? { left: 0, right: 0 } : { top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="relative z-10 flex flex-col justify-between h-full w-full cursor-grab active:cursor-grabbing touch-pan-y min-h-0"
            >
              <div className="pr-5 select-none">
                <h3 className={headingClass}>
                  {activeItem.institution}
                </h3>
                <p className={cn(currentTypo.body, "text-white/75 text-sm xs:text-[15px] sm:text-sm font-normal line-clamp-2 leading-snug mt-1")}>
                  {activeItem.degree}
                </p>
              </div>

              <div className="mt-auto pt-2.5 flex items-center justify-between border-t border-white/5 pr-5 select-none shrink-0">
                <span className={cn(currentTypo.meta, "text-white/60 font-mono text-xs sm:text-[13px]")}>{activeItem.date}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <BentoTile
      id={id}
      size={size}
      href="/education"
      glowColor="blue"
      isDragging={isDragging}
      sortableProps={sortableProps}
      canDeepDive={true}
      canMorph={false}
      canExpand={false}
      deepContent={renderFace(true)}
    >
      {renderFace(false)}
    </BentoTile>
  )
}
