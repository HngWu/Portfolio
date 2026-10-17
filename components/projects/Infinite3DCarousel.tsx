"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { ProjectItemData, LayoutType, SortOption } from "@/lib/projects/types"
import {
  getRingTransform,
  getHelixTransform,
  getGridTransform,
  interpolateTransform,
  getRingRadius,
  normalizeAngle,
  getShortestAngleDelta,
  type CardTransform3D,
} from "@/lib/projects/layoutMath"
import { ProjectCard } from "./ProjectCard"
import { CaseStudyPanel } from "./CaseStudyPanel"
import { DiscoveryBar } from "./DiscoveryBar"
import {
  isCarouselAudioMuted,
  setCarouselAudioMuted,
  playCarouselTick,
} from "@/lib/projects/audio"
import { usePageTransition } from "@/hooks/usePageTransition"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"

interface Infinite3DCarouselProps {
  initialProjects: ProjectItemData[]
  initialSlug?: string
}

export function Infinite3DCarousel({
  initialProjects,
  initialSlug,
}: Infinite3DCarouselProps) {
  const { navigateWithTransition } = usePageTransition()
  const [projects, setProjects] = React.useState<ProjectItemData[]>(initialProjects)
  const [selectedLanguage, setSelectedLanguage] = React.useState("all")
  const [selectedStatus, setSelectedStatus] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortBy, setSortBy] = React.useState<SortOption>("featured")
  const [layoutType, setLayoutType] = React.useState<LayoutType>("ring")
  const [isListView, setIsListView] = React.useState(false)
  const [isAudioMuted, setIsAudioMuted] = React.useState(() => isCarouselAudioMuted())

  // Active project & Case-study panel modal state
  const [activeSlug, setActiveSlug] = React.useState<string | null>(initialSlug || null)
  const [isCaseStudyOpen, setIsCaseStudyOpen] = React.useState(Boolean(initialSlug))

  // Interaction & Hover states
  const [isHovered, setIsHovered] = React.useState(false)
  const [isInteracting, setIsInteracting] = React.useState(false)
  const [focusedIndex, setFocusedIndex] = React.useState(0)

  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  // Carousel physics references (maintained across animation frames)
  const rotationRef = React.useRef(0) // continuous angle in radians
  const targetRotationRef = React.useRef(0)
  const velocityRef = React.useRef(0)
  const isDraggingRef = React.useRef(false)
  const lastPointerXRef = React.useRef(0)
  const dragStartXRef = React.useRef(0)
  const hasDraggedRef = React.useRef(false)
  const dragStartTimeRef = React.useRef(0)
  const activeIndexRef = React.useRef(0)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const animationFrameRef = React.useRef<number | null>(null)
  const entranceStartTimeRef = React.useRef(typeof performance !== "undefined" ? performance.now() : 0)

  // Screen size for responsive radius and grid columns
  const [viewportWidth, setViewportWidth] = React.useState(1200)

  // Extract available languages
  const availableLanguages = React.useMemo(() => {
    const set = new Set<string>()
    for (const p of initialProjects) {
      if (p.language) set.add(p.language)
    }
    return Array.from(set).sort()
  }, [initialProjects])

  // Filter and sort projects
  const filteredProjects = React.useMemo(() => {
    let result = [...projects]

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.language && p.language.toLowerCase().includes(q)) ||
          p.techStack.some((t) => t.toLowerCase().includes(q)) ||
          (p.topics && p.topics.some((top) => top.toLowerCase().includes(q)))
      )
    }

    // Language filter
    if (selectedLanguage !== "all") {
      result = result.filter((p) => p.language === selectedLanguage)
    }

    // Status filter
    if (selectedStatus !== "all") {
      result = result.filter((p) => p.status === selectedStatus)
    }

    // Sort order
    if (sortBy === "stars") {
      result.sort((a, b) => b.stars - a.stars)
    } else if (sortBy === "recent") {
      result.sort(
        (a, b) => new Date(b.lastPushed).getTime() - new Date(a.lastPushed).getTime()
      )
    } else {
      // Featured first
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return result
  }, [projects, searchQuery, selectedLanguage, selectedStatus, sortBy])

  // Reset focus and rotation when filter count changes and current focus is out of range
  React.useEffect(() => {
    if (filteredProjects.length === 0) return
    if (focusedIndex >= filteredProjects.length) {
      setFocusedIndex(0)
      targetRotationRef.current = 0
      rotationRef.current = 0
    }
  }, [filteredProjects.length, focusedIndex])

  // Check prefers-reduced-motion and screen resize
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    mediaQuery.addEventListener("change", handleMediaChange)

    const handleResize = () => {
      setViewportWidth(window.innerWidth)
    }
    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Audio mute toggle handler
  const handleToggleAudio = () => {
    const next = !isAudioMuted
    setIsAudioMuted(next)
    setCarouselAudioMuted(next)
  }

  // Calculate responsive radius
  const ringRadius = React.useMemo(() => {
    const cardW = viewportWidth < 640 ? 320 : viewportWidth < 1024 ? 380 : 420
    const gap = viewportWidth < 640 ? 24 : 36
    return getRingRadius(cardW, gap, filteredProjects.length)
  }, [viewportWidth, filteredProjects.length])

  // State of computed 3D card transforms
  const [cardTransforms, setCardTransforms] = React.useState<CardTransform3D[]>([])

  // Helper to jump to a specific card index with shortest circular path
  const rotateToIndex = React.useCallback(
    (targetIndex: number) => {
      if (filteredProjects.length === 0) return
      const count = filteredProjects.length
      const step = (Math.PI * 2) / count

      // Target discrete index from current target orientation
      const currentTargetIndex = Math.round(targetRotationRef.current / step)
      const currentNorm = ((currentTargetIndex % count) + count) % count

      // Shortest circular delta in [-count/2, count/2]
      let diff = targetIndex - currentNorm
      while (diff > count / 2) diff -= count
      while (diff < -count / 2) diff += count

      targetRotationRef.current = (currentTargetIndex + diff) * step

      if (layoutType === "grid" || isListView) {
        setFocusedIndex(targetIndex)
      }
    },
    [filteredProjects.length, layoutType, isListView]
  )

  // Previous / Next handlers
  const handlePrev = React.useCallback(() => {
    if (filteredProjects.length === 0) return
    const count = filteredProjects.length
    const step = (Math.PI * 2) / count
    const currentTargetIndex = Math.round(targetRotationRef.current / step)
    targetRotationRef.current = (currentTargetIndex - 1) * step
    if (layoutType === "grid" || isListView) {
      setFocusedIndex(((currentTargetIndex - 1) % count + count) % count)
    }
  }, [filteredProjects.length, layoutType, isListView])

  const handleNext = React.useCallback(() => {
    if (filteredProjects.length === 0) return
    const count = filteredProjects.length
    const step = (Math.PI * 2) / count
    const currentTargetIndex = Math.round(targetRotationRef.current / step)
    targetRotationRef.current = (currentTargetIndex + 1) * step
    if (layoutType === "grid" || isListView) {
      setFocusedIndex(((currentTargetIndex + 1) % count + count) % count)
    }
  }, [filteredProjects.length, layoutType, isListView])

  // Open & Close Case Study Panel
  const handleOpenCaseStudy = React.useCallback(
    (project: ProjectItemData, index?: number) => {
      if (typeof index === "number") {
        rotateToIndex(index)
      } else {
        const idx = filteredProjects.findIndex((p) => p.id === project.id)
        if (idx !== -1) {
          rotateToIndex(idx)
        }
      }
      setActiveSlug(project.slug)
      setIsCaseStudyOpen(true)
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", `/projects/${project.slug}`)
      }
    },
    [filteredProjects, rotateToIndex]
  )

  const handleCloseCaseStudy = React.useCallback(() => {
    setIsCaseStudyOpen(false)
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/projects")
    }
  }, [])

  // Card click handler: smoothly rotates side cards to front, or opens case study if already focused
  const handleCardClick = React.useCallback(
    (project: ProjectItemData, index: number) => {
      if (hasDraggedRef.current) return
      if (layoutType === "grid" || isListView || index === focusedIndex) {
        handleOpenCaseStudy(project, index)
      } else {
        rotateToIndex(index)
      }
    },
    [layoutType, isListView, focusedIndex, handleOpenCaseStudy, rotateToIndex]
  )

  // Synchronize on browser back / forward
  React.useEffect(() => {
    const handlePopState = () => {
      const pathParts = window.location.pathname.split("/").filter(Boolean)
      if (pathParts[0] === "projects" && pathParts[1]) {
        setActiveSlug(pathParts[1])
        setIsCaseStudyOpen(true)
      } else {
        setIsCaseStudyOpen(false)
      }
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)

      if (isInput) return

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault()
        handlePrev()
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault()
        handleNext()
      } else if (e.key === "Escape") {
        e.preventDefault()
        if (isCaseStudyOpen) {
          handleCloseCaseStudy()
        } else {
          navigateWithTransition("/")
        }
      } else if (e.key >= "1" && e.key <= "9") {
        const num = parseInt(e.key, 10) - 1
        if (num < filteredProjects.length) {
          e.preventDefault()
          rotateToIndex(num)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    handlePrev,
    handleNext,
    isCaseStudyOpen,
    handleCloseCaseStudy,
    filteredProjects.length,
    rotateToIndex,
    navigateWithTransition,
  ])

  // Drag & Swipe Pointer Event Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isListView || e.button !== 0) return
    const target = e.target as HTMLElement | null
    if (target && target.closest("button, a")) {
      return
    }
    isDraggingRef.current = true
    hasDraggedRef.current = false
    setIsInteracting(true)
    dragStartXRef.current = e.clientX
    lastPointerXRef.current = e.clientX
    dragStartTimeRef.current = performance.now()
    velocityRef.current = 0
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    const deltaX = e.clientX - lastPointerXRef.current
    lastPointerXRef.current = e.clientX

    if (Math.abs(e.clientX - dragStartXRef.current) > 6) {
      if (!hasDraggedRef.current) {
        hasDraggedRef.current = true
        try {
          ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        } catch {}
      }
    }

    // Natural drag: dragging left moves carousel forward (positive rotation)
    const sensitivity = 0.0035
    rotationRef.current -= deltaX * sensitivity
    targetRotationRef.current = rotationRef.current

    // Track instantaneous velocity
    velocityRef.current = -deltaX * sensitivity
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    setIsInteracting(false)
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      // Ignore capture release error
    }

    const count = filteredProjects.length
    if (count > 0 && hasDraggedRef.current) {
      const step = (Math.PI * 2) / count
      // Smoothly snap to nearest card taking velocity momentum into account
      const projected = rotationRef.current + velocityRef.current * 8
      const targetIndex = Math.round(projected / step)
      targetRotationRef.current = targetIndex * step
    }

    // Reset hasDraggedRef after click microtask has executed
    setTimeout(() => {
      hasDraggedRef.current = false
    }, 50)
  }

  // Master Physics & Render Loop (rAF)
  React.useEffect(() => {
    if (filteredProjects.length === 0 || isListView) return

    const count = filteredProjects.length
    const step = (Math.PI * 2) / count
    let lastTime = performance.now()

    const tick = (currentTime: number) => {
      // 1. Smoothly spring towards targetRotationRef.current when not dragging
      if (!isDraggingRef.current) {
        const error = targetRotationRef.current - rotationRef.current
        if (Math.abs(error) > 0.0002) {
          rotationRef.current += error * 0.12
        } else {
          rotationRef.current = targetRotationRef.current
        }
      }

      // 2. Compute active focused index
      const currentIndex = Math.round(rotationRef.current / step)
      const currentActive = ((currentIndex % count) + count) % count

      if (currentActive !== activeIndexRef.current) {
        activeIndexRef.current = currentActive
        setFocusedIndex(currentActive)
        playCarouselTick(!isAudioMuted)
      }

      // 3. Compute transforms for each card according to layout
      const gridCols = viewportWidth < 768 ? 1 : viewportWidth < 1200 ? 2 : 3
      const cardW = viewportWidth < 640 ? 320 : viewportWidth < 1024 ? 380 : 420
      const cardH = viewportWidth < 640 ? 400 : 480

      // Staggered fan-out entrance timing (first 1.2s)
      const elapsedEntrance = currentTime - entranceStartTimeRef.current

      const transforms = filteredProjects.map((_, i) => {
        let baseTransform: CardTransform3D
        if (layoutType === "helix") {
          baseTransform = getHelixTransform(i, count, rotationRef.current, ringRadius, 320)
        } else if (layoutType === "grid") {
          baseTransform = getGridTransform(i, count, gridCols, cardW, cardH, 28, focusedIndex)
        } else {
          baseTransform = getRingTransform(i, count, rotationRef.current, ringRadius)
        }

        // Apply staggered fan-out if still entering
        if (elapsedEntrance < 1400 && !prefersReducedMotion) {
          const delay = i * 65 // 65ms stagger per card
          const progress = Math.max(0, Math.min(1, (elapsedEntrance - delay) / 600))
          const ease = 1 - Math.pow(1 - progress, 3) // cubic out

          const stackTransform: CardTransform3D = {
            x: 0,
            y: 40,
            z: -250 - i * 20,
            rotateY: 0,
            scale: 0.75,
            opacity: 0,
            blur: 0,
            saturation: 0.8,
            zIndex: 100 - i,
            isFocused: i === 0,
            relativeAngle: 0,
          }

          return interpolateTransform(stackTransform, baseTransform, ease)
        }

        return baseTransform
      })

      setCardTransforms(transforms)
      animationFrameRef.current = requestAnimationFrame(tick)
    }

    animationFrameRef.current = requestAnimationFrame(tick)

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [
    filteredProjects,
    isListView,
    prefersReducedMotion,
    isHovered,
    isInteracting,
    isCaseStudyOpen,
    isAudioMuted,
    layoutType,
    ringRadius,
    viewportWidth,
  ])

  // Active focused project object
  const activeProject = filteredProjects[focusedIndex] || filteredProjects[0]

  // Active project for the case study panel
  const caseStudyProject = React.useMemo(() => {
    if (!activeSlug) return activeProject || null
    return (
      projects.find((p) => p.slug === activeSlug || p.id === activeSlug) ||
      activeProject ||
      null
    )
  }, [projects, activeSlug, activeProject])

  const activeLangColor =
    activeProject?.languageColor || "var(--lume-secondary, #4A8FFF)"

  return (
    <div className="relative w-full min-h-[780px] flex flex-col items-center justify-start overflow-visible pt-2 pb-16">
      {/* Dynamic Ambient Background Hue Shift based on focused project */}
      <div
        style={{
          background: `radial-gradient(circle at 50% 35%, ${activeLangColor}18 0%, transparent 65%)`,
          transition: "background 0.8s ease",
        }}
        className="absolute inset-0 pointer-events-none -z-10 opacity-70"
      />

      {/* Discovery Controls Bar */}
      <DiscoveryBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        availableLanguages={availableLanguages}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        layoutType={layoutType}
        onLayoutChange={setLayoutType}
        isListView={isListView}
        onToggleListView={() => setIsListView((v) => !v)}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        totalCount={projects.length}
        filteredCount={filteredProjects.length}
      />

      {/* Screen Reader Live Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {activeProject
          ? `Selected project: ${activeProject.name}. ${focusedIndex + 1} of ${filteredProjects.length}.`
          : "No projects match the current filter."}
      </div>

      {/* Main 3D Viewport or 2D List Fallback */}
      {isListView || prefersReducedMotion ? (
        /* Accessible 2D Responsive Grid / List View */
        <div className="w-full max-w-6xl mx-auto px-4 mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p, i) => (
            <div key={p.id} className="relative w-full h-[480px]">
              <ProjectCard
                project={p}
                transform={getGridTransform(i, filteredProjects.length, 3, 380, 480, 24)}
                isFocused={i === focusedIndex}
                isAdjacent={Math.abs(i - focusedIndex) === 1}
                onClick={() => handleOpenCaseStudy(p, i)}
                onOpenCaseStudy={() => handleOpenCaseStudy(p, i)}
                index={i}
                totalCount={filteredProjects.length}
              />
            </div>
          ))}
        </div>
      ) : (
        /* 3D Transform Scene */
        <div
          ref={containerRef}
          style={{
            perspective: "1400px",
            perspectiveOrigin: "50% 46%",
            touchAction: "pan-y",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "relative w-full h-[540px] sm:h-[620px] flex items-center justify-center overflow-visible select-none mt-4 cursor-grab",
            isInteracting && "cursor-grabbing"
          )}
        >
          {/* Soft Floor Shadow & Reflection Plane */}
          <div
            style={{
              transform: `translate3d(0, 240px, -200px) rotateX(85deg) scale(${1.1})`,
              background: `radial-gradient(ellipse at center, ${activeLangColor}14 0%, rgba(0,0,0,0.7) 45%, transparent 75%)`,
              transition: "background 0.8s ease",
            }}
            className="absolute w-[680px] h-[340px] md:w-[980px] md:h-[460px] rounded-full pointer-events-none -z-10"
          />

          {/* Cards 3D Stage */}
          <div className="relative w-full h-full flex items-center justify-center preserve-3d">
            {filteredProjects.map((project, i) => {
              const transform =
                cardTransforms[i] ||
                getRingTransform(i, filteredProjects.length, 0, ringRadius)
              const count = filteredProjects.length
              const isAdjacent =
                Math.abs(i - focusedIndex) === 1 ||
                Math.abs(i - focusedIndex) === count - 1

              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  transform={transform}
                  isFocused={transform.isFocused}
                  isAdjacent={isAdjacent}
                  onClick={() => handleCardClick(project, i)}
                  onOpenCaseStudy={() => handleOpenCaseStudy(project, i)}
                  index={i}
                  totalCount={filteredProjects.length}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Navigation Rails & Carousel Progress Indicator */}
      {!isListView && !prefersReducedMotion && filteredProjects.length > 0 && (
        <div className="flex items-center gap-6 mt-8 z-30 select-none">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            aria-label="Previous Project (Arrow Left)"
            className="p-3 rounded-2xl border border-white/10 bg-[#0e0f14]/80 backdrop-blur-md text-white/60 hover:text-white hover:border-white/20 transition-all active:scale-95 shadow-lg"
          >
            <ChevronLeft className="size-5" />
          </button>

          {/* Dot rail indicator */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-[#0e0f14]/80 backdrop-blur-md">
            {filteredProjects.map((p, i) => (
              <button
                key={p.id}
                onClick={() => rotateToIndex(i)}
                aria-label={`Jump to project ${i + 1}: ${p.name}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === focusedIndex
                    ? "w-7 bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                    : "w-2 bg-white/20 hover:bg-white/40"
                )}
                style={{
                  backgroundColor: i === focusedIndex ? activeLangColor : undefined,
                  boxShadow:
                    i === focusedIndex ? `0 0 10px ${activeLangColor}` : undefined,
                }}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            aria-label="Next Project (Arrow Right)"
            className="p-3 rounded-2xl border border-white/10 bg-[#0e0f14]/80 backdrop-blur-md text-white/60 hover:text-white hover:border-white/20 transition-all active:scale-95 shadow-lg"
          >
            <ChevronRight className="size-5" />
          </button>

          {/* Numerical progress */}
          <div className="font-mono text-xs text-white/40 min-w-[50px]">
            <span className="text-white font-medium">{focusedIndex + 1}</span> /{" "}
            <span>{filteredProjects.length}</span>
          </div>
        </div>
      )}

      {/* Case Study Modal Panel */}
      <CaseStudyPanel
        project={caseStudyProject}
        isOpen={isCaseStudyOpen}
        onClose={handleCloseCaseStudy}
      />
    </div>
  )
}
