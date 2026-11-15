"use client"

import * as React from "react"
import { BentoTile } from "../BentoTile"
import { useViewModeStore } from "@/store/useViewModeStore"
import {
  Briefcase,
  Layers,
  Zap,
  BarChart3,
  Database as DbIcon,
  Layout,
  ChevronLeft,
  ChevronRight,
  Code,
  Terminal,
} from "lucide-react"
import { cn, getTypographyClasses } from "@/lib/utils"
import { ForceMobileContext } from "../ForceMobileContext"
import { Json } from "@/types/supabase"
import type { ExperienceContent, ExperienceItem } from "@/lib/tiles/schemas"
import { parseTileDeepDive } from "@/lib/tiles/schemas"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"

interface ExperienceTileProps {
  id: string
  size: string
  content: ExperienceContent
  deepDive?: Json
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

const DEFAULT_EXPERIENCE_ITEMS: ExperienceItem[] = [
  {
    id: "dbs-bank",
    role: "Software Engineer Intern",
    company: "DBS Bank",
    date: "Apr 2025 - Mar 2026",
    category: "Enterprise & Fintech",
    highlights: [
      "Led full-stack system migrations and automated pipeline deployments",
      "Optimized data processing to speed up heavy application modules",
      "Headed front-end overhauls and A/B testing to increase click-through rates",
      "Managed database version control for seamless multi-environment deployments"
    ],
    deepDiveHighlights: [
      "Migrated Martech Request Portal from MongoDB to MariaDB using Java Spring Boot APIs",
      "Automated CI/CD deployment pipelines using Jenkins on OpenShift",
      "Optimized high-data spreadsheet module performance using efficient data structures",
      "Executed front-end A/B testing and tracking via Adobe Target and Adobe Analytics",
      "Managed MariaDB schema changes and version control utilizing Liquibase scripts"
    ]
  },
  {
    id: "ttp-support",
    role: "IT Application Support Engineer",
    company: "To The Point Pte Ltd",
    date: "Sep 2024 - Present",
    category: "IT Systems Support",
    highlights: [
      "Executed end-to-end UAT and SIT testing cycles to validate software releases",
      "Investigated and debugged application issues and system anomalies across logs",
      "Authored comprehensive technical documentation, SOP runbooks, and test cases",
      "Coordinated deployment readiness and SLA defect tracking for client teams"
    ],
    deepDiveHighlights: [
      "Executed User Acceptance Testing (UAT) and System Integration Testing (SIT) for enterprise clients",
      "Identified edge-case regressions, debugged root causes in application logs, and logged structured defect reports",
      "Produced standardized operational runbooks, user manuals, and technical testing documentation",
      "Maintained incident response tracking and SLA adherence across production support workflows"
    ]
  }
]

export function ExperienceTile({
  id,
  size,
  content,
  deepDive,
  isDragging,
  sortableProps,
}: ExperienceTileProps) {
  const mode = useViewModeStore((state) => state.mode)
  const forceMobile = React.useContext(ForceMobileContext)
  const isDeepDive = mode === "deep"
  const typo = getTypographyClasses(size, isDeepDive, forceMobile)
  const deep = parseTileDeepDive("experience", deepDive)

  // Resolve items: prefer items array, fallback to single content fields merged with default items
  const items: ExperienceItem[] = React.useMemo(() => {
    if (content.items && content.items.length > 0) return content.items
    if (deep.items && deep.items.length > 0) return deep.items
    if (content.role || content.company) {
      const singleItem: ExperienceItem = {
        id: "current-exp",
        role: content.role || "Software Engineer Intern",
        company: content.company || "DBS Bank",
        date: content.date || "Apr 2025 - Mar 2026",
        category: "Enterprise & Fintech",
        highlights: content.highlights || [],
        deepDiveHighlights: deep.highlights || content.highlights || [],
      }
      return [
        singleItem,
        ...DEFAULT_EXPERIENCE_ITEMS.filter(
          (i) => i.company.toLowerCase() !== (content.company || "").toLowerCase()
        )
      ]
    }
    return DEFAULT_EXPERIENCE_ITEMS
  }, [content, deep])

  const [activeIndex, setActiveIndex] = React.useState(0)
  const [direction, setDirection] = React.useState(0)
  const isInteractingRef = React.useRef(false)

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

  // Swipe / Drag Gestures with click-suppression guard
  const handleDragStart = () => {
    // Reset drag distance
  }

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dist = Math.hypot(info.offset.x, info.offset.y)
    if (dist > 8) {
      isInteractingRef.current = true
    }
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offsetThreshold = 35
    const velocityThreshold = 220

    if (info.offset.x < -offsetThreshold || info.velocity.x < -velocityThreshold) {
      goToNext()
    } else if (info.offset.x > offsetThreshold || info.velocity.x > velocityThreshold) {
      goToPrev()
    }

    // Keep interaction flag active briefly to swallow trailing click event from drag gesture
    setTimeout(() => {
      isInteractingRef.current = false
    }, 250)
  }

  // Keyboard navigation when focused
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault()
      e.stopPropagation()
      goToNext()
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault()
      e.stopPropagation()
      goToPrev()
    }
  }

  // Mapping for category icons
  const getHighlightIcon = (title: string, className: string) => {
    const t = title.toLowerCase()
    if (t.includes("migration") || t.includes("devops") || t.includes("pipeline"))
      return <Layers className={className} />
    if (t.includes("performance") || t.includes("optimization") || t.includes("speed"))
      return <Zap className={className} />
    if (t.includes("testing") || t.includes("analytics") || t.includes("a/b"))
      return <BarChart3 className={className} />
    if (t.includes("database") || t.includes("mariadb") || t.includes("mongodb") || t.includes("sql"))
      return <DbIcon className={className} />
    if (t.includes("ui") || t.includes("interface") || t.includes("3d") || t.includes("webgl"))
      return <Layout className={className} />
    if (t.includes("code") || t.includes("script") || t.includes("hook"))
      return <Code className={className} />
    if (t.includes("terminal") || t.includes("tools"))
      return <Terminal className={className} />
    return <Briefcase className={className} />
  }

  // Next 2 peek cards for stacked depth effect
  const peekCard1 = items[(safeIndex + 1) % items.length]
  const peekCard2 = items.length > 2 ? items[(safeIndex + 2) % items.length] : null

  // Active highlights
  const quickHighlights = activeItem.highlights || []
  const deepHighlights =
    (activeItem.deepDiveHighlights && activeItem.deepDiveHighlights.length > 0
      ? activeItem.deepDiveHighlights
      : activeItem.highlights) || []

  const renderFace = (isDeep: boolean) => {
    const highlights = isDeep ? deepHighlights : quickHighlights

    const roleHeading = isDeep ? (
      <h3 className="font-mono text-xl sm:text-2xl font-bold text-white/95 tracking-tight mb-1.5 line-clamp-2 leading-snug">
        {activeItem.role}
      </h3>
    ) : (
      <h3 className="font-display text-xl sm:text-2xl font-medium text-white/95 tracking-tight mb-1.5 line-clamp-2 leading-snug">
        {activeItem.role}
      </h3>
    )

    const companyDateClass = isDeep
      ? "text-lume-primary mb-3 sm:mb-3.5 text-xs sm:text-[13px] font-mono tracking-wide"
      : "text-white/60 mb-3 sm:mb-3.5 text-xs sm:text-[13px] font-mono tracking-wide"

    const highlightTextClass = isDeep
      ? "text-xs sm:text-[13.5px] text-white/80 group-hover/item:text-white/95 transition-colors leading-relaxed line-clamp-2"
      : "text-xs sm:text-[13.5px] text-white/80 group-hover/item:text-white/95 transition-colors leading-relaxed line-clamp-2"

    const highlightSpacingClass = isDeep
      ? "space-y-2.5 sm:space-y-3 overflow-y-auto custom-scrollbar touch-pan-y pr-1"
      : "space-y-2.5 sm:space-y-3 overflow-y-auto custom-scrollbar touch-pan-y pr-1"

    return (
      <div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative flex flex-col h-full w-full outline-none"
      >
        {/* Top Header with Category badge and Desktop Controls */}
        <div className="flex items-center justify-between gap-3 mb-1.5 shrink-0 relative z-30 min-w-0">
          <div className="flex items-center gap-2 min-w-0 shrink">
            <span className={cn(typo.meta, "text-white/40 uppercase tracking-widest flex items-center gap-1.5 shrink-0")}>
              <Briefcase className={cn(typo.icon, "text-lume-primary")} />
              Experience
            </span>
            {activeItem.category && (
              <span
                title={activeItem.category}
                className="hidden sm:inline-flex font-mono text-[9px] px-2 py-0.5 rounded-full bg-lume-primary/10 border border-lume-primary/20 text-lume-primary font-semibold uppercase tracking-wider truncate whitespace-nowrap max-w-[120px] sm:max-w-[150px] lg:max-w-[180px] shrink"
              >
                {activeItem.category}
              </span>
            )}
          </div>

          {/* Desktop & Mobile Controls & Counter */}
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
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
                aria-label="Previous role"
                title="Previous role (Swipe Right / Left Arrow)"
                className="p-1.5 hover:bg-white/10 hover:text-lume-primary text-white/50 rounded transition-colors active:scale-95 min-w-[28px] min-h-[28px] flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <div className="w-[1px] h-3 bg-white/10" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                aria-label="Next role"
                title="Next role (Swipe Left / Right Arrow)"
                className="p-1.5 hover:bg-white/10 hover:text-lume-primary text-white/50 rounded transition-colors active:scale-95 min-w-[28px] min-h-[28px] flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3D Stack Container */}
        <div className="relative flex-1 w-full min-h-[160px] flex flex-col justify-between pt-0">
          {/* Background Peek Card 2 (Bottom-most) */}
          {peekCard2 && (
            <div
              className="absolute rounded-2xl bg-transparent border border-white/[0.04] pointer-events-none transition-all duration-300 shadow-sm inset-x-4 bottom-0 h-[84%]"
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
              className="absolute rounded-2xl bg-transparent border border-white/[0.07] pointer-events-none transition-all duration-300 shadow-sm inset-x-2 bottom-0 h-[92%]"
              style={{
                transform: "translateY(7px) scale(0.96)",
                opacity: 0.5,
                zIndex: 2,
              }}
            />
          )}

          {/* Active Card Surface with Framer Motion Drag & Transitions */}
          <AnimatePresence custom={direction} mode="popLayout">
            <motion.div
              key={`${isDeep ? "deep-" : "quick-"}${activeItem.id || safeIndex}`}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  x: dir >= 0 ? 30 : -30,
                  opacity: 0,
                  scale: 0.96,
                }),
                center: {
                  x: 0,
                  opacity: 1,
                  scale: 1,
                  transition: {
                    x: { type: "spring", stiffness: 350, damping: 28 },
                    opacity: { duration: 0.25 },
                    scale: { duration: 0.25 },
                  },
                },
                exit: (dir: number) => ({
                  x: dir >= 0 ? -30 : 30,
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
              drag="x"
              dragDirectionLock={true}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              onClickCapture={(e) => {
                if (isInteractingRef.current) {
                  e.stopPropagation()
                  e.preventDefault()
                }
              }}
              className="relative z-10 flex flex-col justify-between h-full w-full cursor-grab active:cursor-grabbing touch-pan-y"
            >
              <div className="pr-0 select-none flex-1 flex flex-col justify-between">
                <div>
                  {roleHeading}
                  <p className={companyDateClass}>
                    {activeItem.company} · {activeItem.date}
                  </p>

                  {/* Highlights List */}
                  <div className={highlightSpacingClass}>
                    {highlights.slice(0, 4).map((highlight, i) => (
                      <div key={i} className="flex items-start gap-2.5 group/item">
                        <div className="shrink-0 p-1 mt-0.5 bg-transparent rounded-md border border-white/10 group-hover/item:border-lume-primary/30 transition-colors">
                          {getHighlightIcon(
                            highlight,
                            "size-3 md:size-3.5 text-lume-primary/70 group-hover/item:text-lume-primary transition-colors"
                          )}
                        </div>
                        <span className={highlightTextClass}>
                          {highlight}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role Indicator Dots */}
                <div className="mt-3 pt-2.5 flex items-center justify-center border-t border-white/5 select-none shrink-0">
                  <div
                    className="flex items-center gap-2"
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
                          aria-label={`Go to ${item.company}`}
                          className="p-1 flex items-center justify-center min-w-[24px] min-h-[24px] cursor-pointer"
                        >
                          <span
                            className={cn(
                              "transition-all duration-300 rounded-full",
                              isCurrent
                                ? "w-4 h-1.5 bg-lume-primary shadow-[0_0_8px_rgba(74,255,180,0.7)]"
                                : "w-1.5 h-1.5 bg-white/25 hover:bg-white/50"
                            )}
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>
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
      href="/experience"
      glowColor="mint"
      canDeepDive={true}
      isDragging={isDragging}
      sortableProps={sortableProps}
      deepContent={renderFace(true)}
    >
      {renderFace(false)}
    </BentoTile>
  )
}
