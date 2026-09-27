"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useViewModeStore } from "@/store/useViewModeStore"
import { usePageTransition } from "@/hooks/usePageTransition"
import { 
  ChevronLeft, 
  ChevronRight, 
  Github, 
  ExternalLink, 
  FolderGit2, 
  Sparkles, 
  Terminal 
} from "lucide-react"

interface Project {
  id: string
  slug: string
  name: string
  description: string
  techStack: string[]
  githubUrl: string
  liveUrl: string
  featured: boolean
  notes?: string
}

interface ProjectCarouselProps {
  projects: Project[]
  currentId: string
  onChangeActiveId: (id: string) => void
}

/**
 * Shortest circular distance modulo algorithm.
 * For count = 3 and active = 0: index 1 -> +1, index 2 -> -1
 * Wraps continuously in both forward and backward directions.
 */
function getCircularDiff(index: number, active: number, count: number): number {
  if (count <= 1) return 0
  let diff = (index - active) % count
  if (diff > count / 2) diff -= count
  if (diff < -count / 2) diff += count
  return diff
}

export function ProjectCarousel({ projects, currentId, onChangeActiveId }: ProjectCarouselProps) {
  const mode = useViewModeStore((state) => state.mode)
  const isDeep = mode === "deep"
  const { navigateWithTransition } = usePageTransition()

  const activeIndex = React.useMemo(() => {
    const idx = projects.findIndex((p) => p.id === currentId)
    return idx === -1 ? 0 : idx
  }, [projects, currentId])

  const activeProject = projects[activeIndex]

  // Dragging and touch swipe state
  const [dragOffset, setDragOffset] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)
  const dragStartX = React.useRef(0)

  // Interactive 3D Parallax Tilt state for active card
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 })
  const [sheen, setSheen] = React.useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = React.useState(false)

  // Screen-width dynamic cards count
  const [visibleCardsCount, setVisibleCardsCount] = React.useState(2)
  const activeCardRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w < 768) {
        setVisibleCardsCount(1) // 3 cards total (active + 1 left + 1 right)
      } else if (w < 1280) {
        setVisibleCardsCount(2) // 5 cards total (active + 2 left + 2 right)
      } else {
        setVisibleCardsCount(3) // 7 cards total (active + 3 left + 3 right)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Circular navigation handlers
  const handlePrev = React.useCallback(() => {
    if (projects.length === 0) return
    const prevIndex = (activeIndex - 1 + projects.length) % projects.length
    onChangeActiveId(projects[prevIndex].id)
  }, [activeIndex, projects, onChangeActiveId])

  const handleNext = React.useCallback(() => {
    if (projects.length === 0) return
    const nextIndex = (activeIndex + 1) % projects.length
    onChangeActiveId(projects[nextIndex].id)
  }, [activeIndex, projects, onChangeActiveId])

  // Drag / Swipe handling with infinite modulo wrap
  const handleDragStart = (clientX: number) => {
    setIsDragging(true)
    dragStartX.current = clientX
  }

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return
    const deltaX = clientX - dragStartX.current
    setDragOffset(deltaX)
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const swipeThreshold = 55
    if (dragOffset > swipeThreshold) {
      handlePrev()
    } else if (dragOffset < -swipeThreshold) {
      handleNext()
    }

    setDragOffset(0)
  }

  // Active Card Mouse Move Tilt Parallax
  const handleActiveCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeCardRef.current) return
    const rect = activeCardRef.current.getBoundingClientRect()
    
    // Coordinates relative to card center
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    // Tilt limit is 12 degrees
    const tiltX = ((y - centerY) / centerY) * -12
    const tiltY = ((x - centerX) / centerX) * 12
    
    setTilt({ x: tiltX, y: tiltY })
    setSheen({ x, y })
  }

  const handleActiveCardMouseEnter = () => {
    setIsHovered(true)
  }

  const handleActiveCardMouseLeave = () => {
    setIsHovered(false)
    setTilt({ x: 0, y: 0 })
  }

  // Touch triggers
  const onTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX)
  }

  const onTouchEnd = () => {
    handleDragEnd()
  }

  // Keyboard navigation & Shortcuts listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keystrokes when typing into interactive elements
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return
      }

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
        case "h":
        case "H":
          e.preventDefault()
          handlePrev()
          break

        case "ArrowRight":
        case "d":
        case "D":
        case "l":
        case "L":
          e.preventDefault()
          handleNext()
          break

        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9": {
          const targetIdx = parseInt(e.key, 10) - 1
          if (targetIdx >= 0 && targetIdx < projects.length && targetIdx !== activeIndex) {
            e.preventDefault()
            onChangeActiveId(projects[targetIdx].id)
          }
          break
        }

        case "g":
        case "G":
          if (activeProject?.githubUrl) {
            e.preventDefault()
            window.open(activeProject.githubUrl, "_blank", "noopener,noreferrer")
          }
          break

        case "o":
        case "O":
        case "Enter":
          if (activeProject?.liveUrl) {
            e.preventDefault()
            window.open(activeProject.liveUrl, "_blank", "noopener,noreferrer")
          }
          break

        case "Escape":
          e.preventDefault()
          navigateWithTransition("/")
          break

        default:
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeIndex, projects, activeProject, onChangeActiveId, handlePrev, handleNext, navigateWithTransition])

  // Responsive 3D clamp parameters
  const containerStyles = {
    "--gap": "clamp(180px, 30vw, 360px)",
    "--card-w": "clamp(310px, 50vw, 550px)",
    "--card-h": "clamp(330px, 45vh, 445px)",
    "--depth": "clamp(220px, 32vw, 420px)",
    perspective: "1400px",
  } as React.CSSProperties

  return (
    <div className="relative w-full py-16 select-none overflow-visible flex flex-col items-center">
      
      {/* 3D Holographic Rotating Dial Background */}
      <div 
        style={{
          transform: `translateZ(-200px) rotateX(15deg) scale(${isHovered ? 1.05 : 1})`,
          transition: "transform 0.6s ease"
        }}
        className={cn(
          "absolute top-[-30px] w-[380px] h-[380px] md:w-[560px] md:h-[560px] rounded-full pointer-events-none opacity-[0.06] z-0 flex items-center justify-center transition-all duration-500",
          isDeep ? "text-lume-secondary" : "text-amber-500"
        )}
      >
        {isDeep ? (
          /* Deep-Dive HUD Dial */
          <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_60s_linear_infinite]">
            <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 5" />
            <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="15 35" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1 8" />
            <line x1="100" y1="2" x2="100" y2="198" stroke="currentColor" strokeWidth="0.2" />
            <line x1="2" y1="100" x2="198" y2="100" stroke="currentColor" strokeWidth="0.2" />
            <path d="M 80 10 A 90 90 0 0 1 120 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 80 190 A 90 90 0 0 1 120 190" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ) : (
          /* Quick-Pitch Celestial Compass Dial */
          <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_80s_linear_infinite]">
            <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1.0" strokeDasharray="4 12" />
            <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" strokeWidth="0.2" />
            <path d="M 100 20 L 105 40 L 100 60 L 95 40 Z" fill="currentColor" opacity="0.4" />
            <path d="M 100 180 L 105 160 L 100 140 L 95 160 Z" fill="currentColor" opacity="0.4" />
            <path d="M 20 100 L 40 105 L 60 100 L 40 95 Z" fill="currentColor" opacity="0.4" />
            <path d="M 180 100 L 160 105 L 140 100 L 160 95 Z" fill="currentColor" opacity="0.4" />
          </svg>
        )}
      </div>

      {/* 3D Scene Viewport */}
      <div 
        style={containerStyles}
        className="relative w-full h-[360px] md:h-[480px] flex items-center justify-center overflow-visible z-10"
        onMouseDown={(e) => !isHovered && handleDragStart(e.clientX)}
        onMouseMove={(e) => !isHovered && handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Carousel Rotation Track */}
        <div 
          style={{
            transform: `rotateY(${dragOffset * 0.06}deg) translateZ(${-Math.abs(dragOffset) * 0.1}px)`,
            transition: isDragging ? "none" : "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
          className="relative w-full h-full preserve-3d flex items-center justify-center"
        >
          {projects.map((project, i) => {
            const diff = getCircularDiff(i, activeIndex, projects.length)
            const isActive = diff === 0

            // Assemble tilt styles for the active card
            const activeCardStyles = isActive ? {
              transform: `translateX(0) translateZ(0) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1)`,
              transition: isHovered ? "none" : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
            } : {
              transform: `translateX(calc(var(--gap) * ${diff})) translateZ(calc(var(--depth) * ${-Math.abs(diff)})) rotateY(${diff * -24}deg) scale(${Math.pow(0.82, Math.abs(diff))})`,
              transition: isDragging 
                ? "opacity 0.2s ease" 
                : "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)"
            }

            return (
              <div
                key={project.id}
                ref={isActive ? activeCardRef : null}
                onMouseMove={isActive ? handleActiveCardMouseMove : undefined}
                onMouseEnter={isActive ? handleActiveCardMouseEnter : undefined}
                onMouseLeave={isActive ? handleActiveCardMouseLeave : undefined}
                onClick={() => {
                  if (!isActive) {
                    onChangeActiveId(project.id)
                  }
                }}
                style={{
                  ...activeCardStyles,
                  opacity: Math.abs(diff) > visibleCardsCount ? 0 : Math.pow(0.52, Math.abs(diff)),
                  zIndex: 100 - Math.abs(diff),
                  pointerEvents: Math.abs(diff) > 1 ? "none" : "auto",
                }}
                className={cn(
                  "absolute w-[var(--card-w)] h-[var(--card-h)] rounded-2xl cursor-pointer border border-white/5",
                  "bg-[#0f0f11]/92 shadow-[0_30px_70px_rgba(0,0,0,0.8)]",
                  "flex flex-col justify-between p-6 md:p-9 overflow-hidden transition-all duration-300",
                  isActive 
                    ? isDeep
                      ? "shadow-[0_0_50px_rgba(74,143,255,0.22)] border-lume-secondary/35 bg-[#0f0f11]/96"
                      : "shadow-[0_0_50px_rgba(201,162,39,0.22)] border-amber-500/35 bg-[#0f0f11]/96"
                    : "hover:bg-[#141418]/92 hover:border-white/20 group/sidecard"
                )}
              >
                {/* Tech Bracket Overlays (Active Card Only) */}
                {isActive && (
                  <>
                    <div className={cn("absolute top-4 left-4 w-3.5 h-3.5 border-t-2 border-l-2 opacity-75 pointer-events-none z-20", isDeep ? "border-lume-secondary" : "border-amber-500")} />
                    <div className={cn("absolute top-4 right-4 w-3.5 h-3.5 border-t-2 border-r-2 opacity-75 pointer-events-none z-20", isDeep ? "border-lume-secondary" : "border-amber-500")} />
                    <div className={cn("absolute bottom-4 left-4 w-3.5 h-3.5 border-b-2 border-l-2 opacity-75 pointer-events-none z-20", isDeep ? "border-lume-secondary" : "border-amber-500")} />
                    <div className={cn("absolute bottom-4 right-4 w-3.5 h-3.5 border-b-2 border-r-2 opacity-75 pointer-events-none z-20", isDeep ? "border-lume-secondary" : "border-amber-500")} />
                  </>
                )}

                {/* Glare Reflection overlay on cursor hover */}
                {isActive && isHovered && (
                  <div 
                    style={{
                      background: `radial-gradient(circle at ${sheen.x}px ${sheen.y}px, rgba(255,255,255,0.07) 0%, transparent 60%)`
                    }}
                    className="absolute inset-0 pointer-events-none z-20"
                  />
                )}

                {/* Cyber Matrix Dot Grid Background on Active Deep Mode */}
                {isActive && isDeep && (
                  <div 
                    style={{
                      backgroundImage: "radial-gradient(rgba(74, 143, 255, 0.12) 1.2px, transparent 1.2px)",
                      backgroundSize: "18px 18px"
                    }}
                    className="absolute inset-0 pointer-events-none z-0 opacity-40"
                  />
                )}

                {/* Golden Leaf Background Glow on Active Quick Mode */}
                {isActive && !isDeep && (
                  <div 
                    style={{
                      background: "radial-gradient(circle at 50% 50%, rgba(201, 162, 39, 0.05) 0%, transparent 70%)"
                    }}
                    className="absolute inset-0 pointer-events-none z-0"
                  />
                )}

                {/* Laser scanline vertical movement on Deep Mode active card */}
                {isActive && isDeep && (
                  <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                    <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mode-accent-bright,#6AFFFF)] to-transparent opacity-85 animate-[scanline_3.5s_ease-in-out_infinite]" />
                  </div>
                )}

                {/* Active Neon Header beam */}
                {isActive && (
                  <div className="absolute inset-0 pointer-events-none z-0">
                    <div className={cn(
                      "absolute inset-x-0 top-0 h-[2px] opacity-90",
                      isDeep ? "bg-[var(--mode-accent-bright,#6AFFFF)]" : "bg-[var(--mode-accent-bright,#FFE875)]"
                    )} />
                  </div>
                )}

                {/* Project Metadata Header */}
                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex-1 overflow-hidden pr-2">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {isActive && (
                        isDeep ? (
                          <Terminal className="size-3 text-lume-secondary/80 animate-pulse" />
                        ) : (
                          <Sparkles className="size-3 text-amber-500/80 animate-pulse" />
                        )
                      )}
                      <span className={cn(
                        "text-[9px] font-mono uppercase tracking-[0.2em] font-bold block transition-colors",
                        isActive 
                          ? isDeep ? "text-lume-secondary" : "text-amber-500"
                          : "text-white/30"
                      )}>
                        {project.featured ? "Featured Application" : "Engineering Sandbox"}
                      </span>
                    </div>
                    <h4 className={cn(
                      "text-xl md:text-3xl font-display tracking-tight transition-colors leading-none",
                      isActive ? "text-white" : "text-white/60 group-hover/sidecard:text-white/80"
                    )}>
                      {project.name}
                    </h4>
                  </div>
                  <FolderGit2 className={cn(
                    "w-5 h-5 md:w-6 md:h-6 transition-colors flex-shrink-0 mt-0.5",
                    isActive 
                      ? isDeep ? "text-lume-secondary/80" : "text-amber-500/80" 
                      : "text-white/20"
                  )} />
                </div>

                {/* Active-Only Project Details */}
                <div className={cn(
                  "relative z-10 flex flex-col flex-1 mt-5 md:mt-6 transition-all duration-500 justify-between",
                  isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none h-0 mt-0 overflow-hidden"
                )}>
                  {/* Project Description */}
                  <p className="text-xs md:text-sm text-white/70 leading-relaxed max-w-[440px]">
                    {project.description}
                  </p>

                  {/* Scrollable Technical Notes */}
                  {project.notes && (
                    <div className="mt-4 bg-white/[0.015] border border-white/5 rounded-xl p-3.5 max-h-[120px] overflow-y-auto scrollbar-custom">
                      <span className="text-[8px] font-mono uppercase text-white/30 tracking-widest block mb-1.5">Technical Briefing</span>
                      <p className="text-[10px] font-mono text-white/50 leading-relaxed whitespace-pre-wrap select-text">
                        {project.notes}
                      </p>
                    </div>
                  )}

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1.5 mt-5 max-h-[60px] overflow-hidden">
                    {project.techStack.map((tech) => (
                      <span 
                        key={tech} 
                        className={cn(
                          "px-2.5 py-0.5 rounded text-[9px] font-mono border transition-colors",
                          isDeep
                            ? "bg-lume-secondary/10 border-lume-secondary/15 text-lume-secondary/90 hover:bg-lume-secondary/20"
                            : "bg-amber-500/10 border-amber-500/15 text-amber-500/90 hover:bg-amber-500/20"
                        )}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* External Links with Shortcut Hints */}
                  <div className="flex items-center gap-5 mt-6 pt-4 border-t border-white/5">
                    {project.githubUrl && (
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white group/link"
                      >
                        <Github className="size-3.5 group-hover/link:text-white transition-colors" /> 
                        <span className="font-mono uppercase text-[9px] tracking-wider">GitHub</span>
                        <kbd className="hidden sm:inline-block text-[8px] font-mono font-semibold px-1 py-0.5 rounded bg-white/10 text-white/60">G</kbd>
                      </a>
                    )}
                    {project.liveUrl && (
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white group/link"
                      >
                        <ExternalLink className="size-3.5 group-hover/link:text-white transition-colors" />
                        <span className="font-mono uppercase text-[9px] tracking-wider">Live Demo</span>
                        <kbd className="hidden sm:inline-block text-[8px] font-mono font-semibold px-1 py-0.5 rounded bg-white/10 text-white/60">O</kbd>
                      </a>
                    )}
                  </div>
                </div>

                {/* Inactive Preview Content */}
                {!isActive && (
                  <div className="relative z-10 flex flex-col flex-1 justify-between mt-3">
                    <p className="text-[11px] text-white/40 leading-normal line-clamp-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {project.techStack.slice(0, 3).map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-white/[0.03] border border-white/5 text-white/40">
                          {t}
                        </span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className="text-[8px] font-mono text-white/30 self-center">
                          +{project.techStack.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.15em] text-white/30 group-hover/sidecard:text-white/60 transition-colors mt-auto pt-3 border-t border-white/5">
                      <span>Click to view</span>
                      <ChevronRight className="size-3 text-white/30 group-hover/sidecard:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation Controls & Pagination */}
      <div className="flex justify-center items-center gap-6 mt-8 z-20">
        <button
          onClick={handlePrev}
          disabled={projects.length <= 1}
          className={cn(
            "p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-white/60 transition-all hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95",
            !isDeep && "hover:border-amber-500/20 hover:text-amber-500",
            isDeep && "hover:border-lume-secondary/20 hover:text-lume-secondary"
          )}
          aria-label="Previous Project (← or A)"
          title="Previous Project (← or A)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center gap-2">
          {projects.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onChangeActiveId(p.id)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === activeIndex 
                  ? isDeep 
                    ? "bg-lume-secondary w-7 shadow-[0_0_8px_var(--lume-secondary)]" 
                    : "bg-amber-500 w-7 shadow-[0_0_8px_#C9A227]"
                  : "w-2 bg-white/10 hover:bg-white/30"
              )}
              aria-label={`Go to project ${i + 1}`}
              title={`Go to project ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={projects.length <= 1}
          className={cn(
            "p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-white/60 transition-all hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95",
            !isDeep && "hover:border-amber-500/20 hover:text-amber-500",
            isDeep && "hover:border-lume-secondary/20 hover:text-lume-secondary"
          )}
          aria-label="Next Project (→ or D)"
          title="Next Project (→ or D)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Persistent Floating Shortcuts HUD Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-1.5rem)]">
        <div 
          className={cn(
            "px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full border backdrop-blur-xl bg-[#090a0f]/85",
            "shadow-[0_12px_36px_rgba(0,0,0,0.65)] flex items-center gap-2.5 sm:gap-4.5 text-white/70 select-none transition-all duration-300",
            isDeep 
              ? "border-lume-secondary/30 shadow-[0_0_24px_rgba(74,143,255,0.15)]" 
              : "border-amber-500/30 shadow-[0_0_24px_rgba(201,162,39,0.15)]"
          )}
        >
          {/* Navigation keys */}
          <div className="flex items-center gap-1.5">
            <button 
              onClick={handlePrev}
              title="Previous (← or A)"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded bg-white/10 border border-white/15 text-white/90 shadow-sm active:scale-90 transition-transform">←</kbd>
            </button>
            <button 
              onClick={handleNext}
              title="Next (→ or D)"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded bg-white/10 border border-white/15 text-white/90 shadow-sm active:scale-90 transition-transform">→</kbd>
            </button>
            <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 hidden sm:inline ml-0.5">Nav</span>
          </div>

          <span className="w-px h-3 bg-white/15" />

          {/* Quick Jump 1-3 */}
          <div className="flex items-center gap-1">
            {projects.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => onChangeActiveId(p.id)}
                title={`Jump to ${p.name} (${idx + 1})`}
                className={cn(
                  "px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded border transition-all active:scale-90",
                  idx === activeIndex
                    ? isDeep
                      ? "bg-lume-secondary/25 border-lume-secondary text-lume-secondary shadow-[0_0_8px_rgba(74,143,255,0.4)]"
                      : "bg-amber-500/25 border-amber-500 text-amber-500 shadow-[0_0_8px_rgba(201,162,39,0.4)]"
                    : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20"
                )}
              >
                {idx + 1}
              </button>
            ))}
            <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 hidden md:inline ml-0.5">Select</span>
          </div>

          <span className="w-px h-3 bg-white/15" />

          {/* GitHub Code */}
          {activeProject?.githubUrl ? (
            <a
              href={activeProject.githubUrl}
              target="_blank"
              rel="noreferrer"
              title="View Repository (G)"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded bg-white/10 border border-white/15 text-white/90 shadow-sm">G</kbd>
              <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 hidden sm:inline">Code</span>
            </a>
          ) : (
            <span className="flex items-center gap-1.5 opacity-30 cursor-not-allowed" title="No repository link">
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded bg-white/5 border border-white/10 text-white/40">G</kbd>
              <span className="text-[9px] font-mono uppercase tracking-wider text-white/30 hidden sm:inline">Code</span>
            </span>
          )}

          <span className="w-px h-3 bg-white/15" />

          {/* Live Demo */}
          {activeProject?.liveUrl ? (
            <a
              href={activeProject.liveUrl}
              target="_blank"
              rel="noreferrer"
              title="Open Live Demo (O or Enter)"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded bg-white/10 border border-white/15 text-white/90 shadow-sm">O</kbd>
              <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 hidden sm:inline">Demo</span>
            </a>
          ) : (
            <span className="flex items-center gap-1.5 opacity-30 cursor-not-allowed" title="No live demo">
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded bg-white/5 border border-white/10 text-white/40">O</kbd>
              <span className="text-[9px] font-mono uppercase tracking-wider text-white/30 hidden sm:inline">Demo</span>
            </span>
          )}

          <span className="w-px h-3 bg-white/15" />

          {/* Escape / Home */}
          <button
            onClick={() => navigateWithTransition("/")}
            title="Return to Home (ESC)"
            className="flex items-center gap-1.5 hover:text-white transition-colors group"
          >
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded bg-white/10 border border-white/15 text-white/90 shadow-sm group-hover:border-white/30">ESC</kbd>
            <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 hidden sm:inline">Home</span>
          </button>
        </div>
      </div>
    </div>
  )
}
