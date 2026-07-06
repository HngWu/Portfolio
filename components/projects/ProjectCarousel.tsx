"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useViewModeStore } from "@/store/useViewModeStore"
import { ChevronLeft, ChevronRight, Github, ExternalLink, FolderGit2, Sparkles, Terminal } from "lucide-react"

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

export function ProjectCarousel({ projects, currentId, onChangeActiveId }: ProjectCarouselProps) {
  const mode = useViewModeStore((state) => state.mode)
  const isDeep = mode === "deep"

  const activeIndex = React.useMemo(() => {
    const idx = projects.findIndex((p) => p.id === currentId)
    return idx === -1 ? 0 : idx
  }, [projects, currentId])

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

    const swipeThreshold = 70
    if (dragOffset > swipeThreshold && activeIndex > 0) {
      onChangeActiveId(projects[activeIndex - 1].id)
    } else if (dragOffset < -swipeThreshold && activeIndex < projects.length - 1) {
      onChangeActiveId(projects[activeIndex + 1].id)
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

  const handlePrev = () => {
    if (activeIndex > 0) {
      onChangeActiveId(projects[activeIndex - 1].id)
    }
  }

  const handleNext = () => {
    if (activeIndex < projects.length - 1) {
      onChangeActiveId(projects[activeIndex + 1].id)
    }
  }

  // Larger responsive clamp parameters
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
            const diff = i - activeIndex
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
                  opacity: Math.abs(diff) > visibleCardsCount ? 0 : Math.pow(0.48, Math.abs(diff)),
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
                    : "hover:bg-[#141418]/92"
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
                          : "text-white/20"
                      )}>
                        {project.featured ? "Featured Application" : "Engineering Sandbox"}
                      </span>
                    </div>
                    <h4 className={cn(
                      "text-xl md:text-3xl font-display tracking-tight transition-colors leading-none",
                      isActive ? "text-white" : "text-white/60"
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

                  {/* External Links */}
                  <div className="flex items-center gap-5 mt-6 pt-4 border-t border-white/5">
                    {project.githubUrl && (
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white"
                      >
                        <Github className="size-3.5" /> 
                        <span className="font-mono uppercase text-[9px] tracking-wider">GitHub</span>
                      </a>
                    )}
                    {project.liveUrl && (
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white"
                      >
                        <ExternalLink className="size-3.5" />
                        <span className="font-mono uppercase text-[9px] tracking-wider">Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Inactive Preview Content */}
                {!isActive && (
                  <p className="text-[11px] text-white/30 leading-normal line-clamp-2 pr-4 mt-3">
                    {project.description}
                  </p>
                )}

                {/* Active marker on bottom */}
                {!isActive && (
                  <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-white/20 mt-auto pt-4 border-t border-white/5 block">
                    Click to view
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-center items-center gap-6 mt-8 z-20">
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className={cn(
            "p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-white/60 transition-all hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95",
            !isDeep && "hover:border-amber-500/20 hover:text-amber-500",
            isDeep && "hover:border-lume-secondary/20 hover:text-lume-secondary"
          )}
          aria-label="Previous Project"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Carousel Pagination Dots */}
        <div className="flex gap-2">
          {projects.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onChangeActiveId(p.id)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                i === activeIndex 
                  ? isDeep 
                    ? "bg-lume-secondary w-7 shadow-[0_0_8px_var(--lume-secondary)]" 
                    : "bg-amber-500 w-7 shadow-[0_0_8px_#C9A227]"
                  : "bg-white/10 hover:bg-white/30"
              )}
              aria-label={`Go to project ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={activeIndex === projects.length - 1}
          className={cn(
            "p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-white/60 transition-all hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95",
            !isDeep && "hover:border-amber-500/20 hover:text-amber-500",
            isDeep && "hover:border-lume-secondary/20 hover:text-lume-secondary"
          )}
          aria-label="Next Project"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
