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
  ChevronUp,
  ChevronDown,
  Sparkles,
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
    id: "freelance-dev",
    role: "Full-Stack & Creative Developer",
    company: "Freelance / Client Projects",
    date: "Jan 2024 - Present",
    category: "Web & 3D Engineering",
    highlights: [
      "Engineered high-performance Next.js web applications and 3D WebGL interfaces",
      "Built scalable RESTful & realtime database integrations with Supabase & Redis",
      "Designed dark minimalist aesthetics with GSAP timelines and Tailwind CSS v4",
      "Optimized Core Web Vitals achieving 98+ Lighthouse scores across client sites"
    ],
    deepDiveHighlights: [
      "Architected interactive client portals utilizing Next.js 16 App Router and Turbopack",
      "Implemented hardware-accelerated 3D viewports utilizing Three.js and custom GLSL shaders",
      "Integrated Stripe payments, OAuth auth flows, and automated edge cron pipelines",
      "Delivered maintainable component systems with comprehensive TypeScript coverage"
    ]
  },
  {
    id: "nyp-ta",
    role: "Teaching Assistant & Student Developer",
    company: "Nanyang Polytechnic",
    date: "Apr 2023 - Mar 2025",
    category: "Academic & Mentorship",
    highlights: [
      "Mentored junior peers in Data Structures, Algorithms, and Object-Oriented Programming",
      "Built internal lab assessment scripts and automated test suites",
      "Facilitated hands-on workshops on modern Web technologies and Git version control"
    ],
    deepDiveHighlights: [
      "Conducted weekly lab consultation sessions for over 60+ computing students per semester",
      "Created automated grading test suites in Java and Python, reducing grading turnaround by 40%",
      "Authored interactive step-by-step developer guides for modern Git version control workflows"
    ]
  },
  {
    id: "open-source",
    role: "Open Source Contributor",
    company: "Independent & Community",
    date: "2023 - Present",
    category: "Open Source & Labs",
    highlights: [
      "Developed and published full-stack developer tools and UI starter templates",
      "Contributed bug fixes and documentation enhancements to modern JS ecosystems",
      "Authored open-source real-time multiplayer and graphics experiments"
    ],
    deepDiveHighlights: [
      "Built TriviaDuel (real-time multiplayer AI platform) and SecureAsset (watermarking engine)",
      "Engineered custom React hooks and Zustand middleware for cross-tab state syncing",
      "Maintained active GitHub repositories with CI/CD automated test workflows"
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
  const isDeepDive = mode === "deep"
  const forceMobile = React.useContext(ForceMobileContext)
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

  return (
    <BentoTile
      id={id}
      size={size}
      href="/experience"
      glowColor="mint"
      isDragging={isDragging}
      sortableProps={sortableProps}
      deepContent={
        <div
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="flex flex-col h-full overflow-hidden select-none outline-none"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-2 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h3 className={cn(typo.heading, "text-white/90")}>Key Responsibilities</h3>
                {activeItem.category && (
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-lume-primary/10 border border-lume-primary/20 text-lume-primary font-semibold uppercase tracking-wider">
                    {activeItem.category}
                  </span>
                )}
              </div>
              <p className={cn(typo.meta, "text-lume-primary mt-1.5 uppercase tracking-widest")}>
                {activeItem.company} · {activeItem.date}
              </p>
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
                  aria-label="Previous role"
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
                  aria-label="Next role"
                  className="p-1 hover:bg-white/10 hover:text-lume-primary text-white/50 rounded transition-colors active:scale-95"
                >
                  <ChevronDown className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Deep Dive Body */}
          <div className="flex-1 space-y-3.5 pr-2 pb-4 overflow-y-auto custom-scrollbar">
            {deepHighlights.map((highlight, i) => (
              <div key={i} className="flex items-start gap-3 group/item">
                <div className="shrink-0 p-1 mt-0.5 bg-transparent rounded-md border border-white/10 group-hover/item:border-lume-primary/30 transition-colors">
                  {getHighlightIcon(
                    highlight,
                    "size-3 text-lume-primary/50 group-hover/item:text-lume-primary transition-colors"
                  )}
                </div>
                <span
                  className={cn(
                    typo.body,
                    "text-white/60 group-hover/item:text-white/90 transition-colors leading-snug text-xs md:text-sm"
                  )}
                >
                  {highlight}
                </span>
              </div>
            ))}
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
        {/* Top Header with Category badge and Desktop Controls */}
        <div className="flex items-center justify-between mb-1.5 shrink-0 relative z-30">
          <div className="flex items-center gap-2">
            <span className={cn(typo.meta, "text-white/40 uppercase tracking-widest flex items-center gap-1.5")}>
              <Briefcase className={cn(typo.icon, "text-lume-primary")} />
              Experience
            </span>
            {activeItem.category && (
              <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-lume-primary/10 border border-lume-primary/20 text-lume-primary font-semibold uppercase tracking-wider">
                {activeItem.category}
              </span>
            )}
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
                aria-label="Previous role"
                title="Previous role (Swipe Down / Up Arrow)"
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
                aria-label="Next role"
                title="Next role (Swipe Up / Down Arrow)"
                className="p-1 hover:bg-white/10 hover:text-lume-primary text-white/50 rounded transition-colors active:scale-95"
              >
                <ChevronDown className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3D Stack Container */}
        <div className="relative flex-1 w-full min-h-[160px] flex flex-col justify-between pt-0">
          {/* Background Peek Card 2 (Bottom-most) */}
          {peekCard2 && (
            <div
              className="absolute inset-x-4 bottom-0 h-[84%] rounded-2xl bg-transparent border border-white/[0.04] pointer-events-none transition-all duration-300 shadow-sm"
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
              className="absolute inset-x-2 bottom-0 h-[92%] rounded-2xl bg-transparent border border-white/[0.07] pointer-events-none transition-all duration-300 shadow-sm"
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
                  aria-label={`Go to ${item.company}`}
                  title={`${item.role} · ${item.company} (${item.date})`}
                  className={cn(
                    "transition-all duration-300 rounded-full",
                    isCurrent
                      ? "w-1.5 h-3.5 bg-lume-primary shadow-[0_0_8px_rgba(74,255,180,0.7)]"
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
                <h3 className={cn(typo.heading, "font-medium text-white/90 tracking-tight mb-1 line-clamp-2 leading-tight")}>
                  {activeItem.role}
                </h3>
                <p className={cn(typo.meta, "text-white/40 mb-3 text-xs")}>
                  {activeItem.company} · {activeItem.date}
                </p>

                {/* Highlights List */}
                <div className="space-y-2 md:space-y-2.5">
                  {quickHighlights.slice(0, 4).map((highlight, i) => (
                    <div key={i} className="flex items-start gap-2.5 group/item">
                      <div className="shrink-0 p-1 mt-0.5 bg-transparent rounded-md border border-white/10 group-hover/item:border-lume-primary/30 transition-colors">
                        {getHighlightIcon(
                          highlight,
                          "size-3 text-lume-primary/50 group-hover/item:text-lume-primary transition-colors"
                        )}
                      </div>
                      <span
                        className={cn(
                          typo.body,
                          "text-white/60 group-hover/item:text-white/80 transition-colors leading-snug line-clamp-2 text-xs"
                        )}
                      >
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5 select-none">
                <span className={cn(typo.meta, "text-white/30 text-[10px]")}>{activeItem.date}</span>
                <div className="flex items-center gap-1 text-[9px] font-mono text-white/30">
                  <Sparkles className="size-2.5 text-lume-primary/60" />
                  <span>Swipe up/down</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </BentoTile>
  )
}
