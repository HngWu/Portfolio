"use client"

import * as React from "react"
import { BentoTile } from "../BentoTile"
import { Badge } from "@/components/ui/Badge"
import { useViewModeStore } from "@/store/useViewModeStore"
import { FolderGit2, ChevronUp, ChevronDown, ExternalLink, Github } from "lucide-react"
import { cn, getTypographyClasses } from "@/lib/utils"
import { ForceMobileContext } from "../ForceMobileContext"
import { parseTileDeepDive, type ProjectContent, type ProjectItem } from "@/lib/tiles/schemas"
import type { Json } from "@/types/supabase"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"

interface ProjectTileProps {
  id: string
  size: string
  content: ProjectContent
  deepDive?: Json
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

const DEFAULT_PROJECT_ITEMS: ProjectItem[] = [
  {
    id: "trivia-duel",
    name: "TriviaDuel",
    description: "Real-time multiplayer trivia platform with resilient AI generation.",
    techStack: ["Next.js 16", "Gemini AI", "Redis", "SQLite"],
    category: "Web Application",
    year: "2025",
    githubUrl: "https://github.com/HngWu",
    liveUrl: "https://triviaduel.dev",
    featured: true,
    notes: "Sub-100ms synchronization for 10 players. Multi-model fallback strategy (Gemini → DeepSeek). Features Synapse V2 interactive canvas and AI-powered match roasts."
  },
  {
    id: "secure-asset",
    name: "SecureAsset",
    description: "Forensic watermarking & asset protection with LiquidGlass UI.",
    techStack: ["React 19", "Node.js", "MariaDB", "Vite"],
    category: "Cybersecurity",
    year: "2025",
    githubUrl: "https://github.com/HngWu",
    liveUrl: "https://secureasset.dev",
    featured: true,
    notes: "Supports LSB, DCT, and EXIF embedding layers. Features deep-scan integrity authentication and verifiable digital signatures. Architected as an npm monorepo."
  },
  {
    id: "lumeglass-portfolio",
    name: "LumeGlass Portfolio",
    description: "Cinematic, dark minimalist portfolio showing modern animations and 3D visual elements.",
    techStack: ["Next.js 16", "Tailwind CSS v4", "React Three Fiber", "GSAP"],
    category: "Creative Engineering",
    year: "2026",
    githubUrl: "https://github.com/HngWu/Portfolio",
    liveUrl: "https://portfolio.dev",
    featured: false,
    notes: "Implements custom GSAP timelines for bento grid navigation and R3F interactive canvas layers."
  },
  {
    id: "arcturus-engine",
    name: "Arcturus Engine",
    description: "WebGL-based real-time voxel graphics engine featuring volumetric lightning.",
    techStack: ["Three.js", "GLSL Shaders", "TypeScript", "Vite"],
    category: "Graphics Engine",
    year: "2025",
    githubUrl: "https://github.com/HngWu",
    liveUrl: "https://arcturus.dev",
    featured: true,
    notes: "Volumetric rays are rendered using a custom screen-space post-processing shader. Multi-threaded octave chunking maps geometry in parallel."
  }
]

export function ProjectTile({ id, size, content, deepDive, isDragging, sortableProps }: ProjectTileProps) {
  const mode = useViewModeStore((state) => state.mode)
  const isDeepDive = mode === "deep"
  const forceMobile = React.useContext(ForceMobileContext)
  const typo = getTypographyClasses(size, isDeepDive, forceMobile)
  const deep = parseTileDeepDive("project", deepDive)

  // Resolve items: prefer items array, fallback to single content fields merged with default items
  const items: ProjectItem[] = React.useMemo(() => {
    if (content.items && content.items.length > 0) return content.items
    if (deep.items && deep.items.length > 0) return deep.items
    if (content.name) {
      const singleItem: ProjectItem = {
        id: "current-proj",
        name: content.name,
        description: content.description || "",
        techStack: content.techStack || [],
        githubUrl: content.githubUrl || "",
        liveUrl: content.liveUrl || "",
        featured: content.featured || false,
        notes: deep.notes,
        year: "2025",
        category: "Project"
      }
      return [
        singleItem,
        ...DEFAULT_PROJECT_ITEMS.filter(
          (i) => i.name.toLowerCase() !== content.name.toLowerCase()
        )
      ]
    }
    return DEFAULT_PROJECT_ITEMS
  }, [content, deep])

  const [activeIndex, setActiveIndex] = React.useState(0)
  const [direction, setDirection] = React.useState(0)
  const isInteractingRef = React.useRef(false)

  // Safe index clamping
  const safeIndex = Math.min(Math.max(0, activeIndex), items.length - 1)
  const activeItem = items[safeIndex] || items[0]
  const projectSlug = (activeItem.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "")

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

    const offsetThreshold = 45
    const velocityThreshold = 300

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

  const activeNotes = activeItem.notes || deep.notes

  return (
    <BentoTile
      id={id}
      size={size}
      href={`/projects/${projectSlug}`}
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
          <div className="flex justify-between items-start gap-3 mb-2 shrink-0 min-w-0">
            <div className="min-w-0 shrink">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-display text-lg sm:text-xl font-medium text-white/90 tracking-tight shrink-0">
                  Stack & Strategy
                </h3>
                {activeItem.category && (
                  <span
                    title={activeItem.category}
                    className="hidden sm:inline-flex font-mono text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#4A8FFF] font-semibold uppercase tracking-wider truncate whitespace-nowrap max-w-[120px] sm:max-w-[150px] shrink"
                  >
                    {activeItem.category}
                  </span>
                )}
              </div>
              <p className="text-[#4A8FFF] mt-1 text-xs font-mono uppercase tracking-widest truncate">
                {activeItem.name}
              </p>
            </div>

            {/* Desktop Chevrons for Deep Dive */}
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
                  aria-label="Previous project"
                  className="p-1.5 hover:bg-white/10 hover:text-lume-primary text-white/50 rounded transition-colors active:scale-95 min-w-[28px] min-h-[28px] flex items-center justify-center"
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
                  aria-label="Next project"
                  className="p-1.5 hover:bg-white/10 hover:text-lume-primary text-white/50 rounded transition-colors active:scale-95 min-w-[28px] min-h-[28px] flex items-center justify-center"
                >
                  <ChevronDown className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Deep Dive Body */}
          <div className="flex-1 space-y-3 pr-1 pb-1 overflow-y-auto custom-scrollbar flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {activeItem.techStack.map((tag) => (
                  <Badge key={tag} variant="lume" className="px-2 py-0.5 text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>

              {activeNotes && (
                <p className="text-xs md:text-[13px] text-white/70 leading-relaxed">
                  {activeNotes}
                </p>
              )}
            </div>

            <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {activeItem.githubUrl && (
                  <a
                    href={activeItem.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onPointerDown={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white text-xs font-mono transition-colors"
                  >
                    <Github className="size-3" />
                    <span>Repo</span>
                  </a>
                )}
                {activeItem.liveUrl && (
                  <a
                    href={activeItem.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onPointerDown={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-[#4A8FFF] text-xs font-mono transition-colors"
                  >
                    <ExternalLink className="size-3" />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
              <span className="font-mono text-[10px] text-lume-primary uppercase tracking-widest">
                Production Ready
              </span>
            </div>
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
        <div className="flex items-center justify-between mb-2 shrink-0 relative z-30">
          <div className="flex items-center gap-2 min-w-0 shrink">
            <span className={cn(typo.meta, "text-white/40 uppercase tracking-widest flex items-center gap-1.5 shrink-0")}>
              <FolderGit2 className={cn(typo.icon, "text-[#4A8FFF]")} />
              Projects
            </span>
            {activeItem.category && (
              <span
                title={activeItem.category}
                className="hidden sm:inline-flex font-mono text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#4A8FFF] font-semibold uppercase tracking-wider truncate whitespace-nowrap max-w-[120px] sm:max-w-[150px] shrink"
              >
                {activeItem.category}
              </span>
            )}
          </div>

          {/* Desktop Controls & Counter */}
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
                aria-label="Previous project"
                title="Previous project (Swipe Down / Up Arrow)"
                className="p-1.5 hover:bg-white/10 hover:text-lume-primary text-white/50 rounded transition-colors active:scale-95 min-w-[28px] min-h-[28px] flex items-center justify-center"
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
                aria-label="Next project"
                title="Next project (Swipe Up / Down Arrow)"
                className="p-1.5 hover:bg-white/10 hover:text-lume-primary text-white/50 rounded transition-colors active:scale-95 min-w-[28px] min-h-[28px] flex items-center justify-center"
              >
                <ChevronDown className="size-3.5" />
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
                  onClick={(e) => {
                    e.stopPropagation()
                    goToIndex(idx)
                  }}
                  aria-label={`Go to ${item.name}`}
                  title={item.category ? `${item.name} · ${item.category}` : item.name}
                  className="p-1 flex items-center justify-center min-w-[20px] min-h-[20px]"
                >
                  <span
                    className={cn(
                      "transition-all duration-300 rounded-full",
                      isCurrent
                        ? "w-1.5 h-3.5 bg-[#4A8FFF] shadow-[0_0_8px_rgba(74,143,255,0.7)]"
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
              dragDirectionLock={true}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              className="relative z-10 flex flex-col justify-between h-full w-full cursor-grab active:cursor-grabbing touch-pan-y min-h-0"
            >
              <div className="pr-5 select-none">
                <h3 className="font-display text-lg sm:text-xl font-medium text-white/90 tracking-tight mb-1 line-clamp-1 leading-tight">
                  {activeItem.name}
                </h3>
                <p className={cn(typo.body, "text-white/60 text-xs sm:text-sm font-normal line-clamp-2 leading-relaxed mb-3")}>
                  {activeItem.description}
                </p>

                {/* Tech Stack Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {activeItem.techStack.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="lume" className="px-2 py-0.5 text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                  {activeItem.techStack.length > 3 && (
                    <Badge variant="outline" className="px-1.5 py-0.5 text-[10px]">
                      +{activeItem.techStack.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </BentoTile>
  )
}
