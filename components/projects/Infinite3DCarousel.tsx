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
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"

interface Infinite3DCarouselProps {
  initialProjects: ProjectItemData[]
  initialSlug?: string
}

export function Infinite3DCarousel({
  initialProjects,
  initialSlug,
}: Infinite3DCarouselProps) {
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
  const dragStartTimeRef = React.useRef(0)
  const activeIndexRef = React.useRef(0)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const animationFrameRef = React.useRef<number | null>(null)

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

  // Helper to jump to a specific card index with spring
  const rotateToIndex = React.useCallback(
    (index: number) => {
      if (filteredProjects.length === 0) return
      const count = filteredProjects.length
      const step = (Math.PI * 2) / count
      const delta = getShortestAngleDelta(index, count, rotationRef.current)
      targetRotationRef.current = rotationRef.current + delta
      velocityRef.current = delta * 0.15
    },
    [filteredProjects.length]
  )

  // Previous / Next handlers
  const handlePrev = React.useCallback(() => {
    if (filteredProjects.length === 0) return
    const prev = (focusedIndex - 1 + filteredProjects.length) % filteredProjects.length
    rotateToIndex(prev)
  }, [focusedIndex, filteredProjects.length, rotateToIndex])

  const handleNext = React.useCallback(() => {
    if (filteredProjects.length === 0) return
    const next = (focusedIndex + 1) % filteredProjects.length
    rotateToIndex(next)
  }, [focusedIndex, filteredProjects.length, rotateToIndex])

  // Open & Close Case Study Panel
  const handleOpenCaseStudy = React.useCallback(
    (project: ProjectItemData) => {
      setActiveSlug(project.slug)
      setIsCaseStudyOpen(true)
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", `/projects/${project.slug}`)
      }
    },
    []
  )

  const handleCloseCaseStudy = React.useCallback(() => {
    setIsCaseStudyOpen(false)
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/projects")
    }
  }, [])

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
        if (isCaseStudyOpen) {
          e.preventDefault()
          handleCloseCaseStudy()
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
  ])

  // Drag & Swipe Pointer Event Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isListView || e.button !== 0) return
    isDraggingRef.current = true
    setIsInteracting(true)
    lastPointerXRef.current = e.clientX
    dragStartTimeRef.current = performance.now()
    velocityRef.current = 0
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    const deltaX = e.clientX - lastPointerXRef.current
    lastPointerXRef.current = e.clientX

    // Convert pixel delta to angular rotation
    const sensitivity = 0.0035
    rotationRef.current += deltaX * sensitivity
    targetRotationRef.current = rotationRef.current

    // Track instantaneous velocity
    velocityRef.current = deltaX * sensitivity
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

    // Clamp inertia velocity
    velocityRef.current = Math.max(-0.15, Math.min(0.15, velocityRef.current))
  }

  // Master Physics & Render Loop (rAF)
  React.useEffect(() => {
    if (filteredProjects.length === 0 || isListView) return

    const count = filteredProjects.length
    const step = (Math.PI * 2) / count
    let lastTime = performance.now()

    const tick = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1) // capped delta time in seconds
      lastTime = currentTime

      // 1. Check if tab is hidden or reduced motion is active
      const isTabHidden = typeof document !== "undefined" && document.hidden
      const shouldAutoRotate =
        !prefersReducedMotion &&
        !isTabHidden &&
        !isHovered &&
        !isInteracting &&
        !isCaseStudyOpen

      // 2. Auto-rotation: subtle continuous drift
      if (shouldAutoRotate && !isDraggingRef.current) {
        rotationRef.current += 0.12 * dt
      }

      // 3. Inertia velocity decay when user released drag
      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current) > 0.001) {
          rotationRef.current += velocityRef.current
          velocityRef.current *= 0.93 // exponential friction
        } else if (!shouldAutoRotate) {
          // 4. Critically damped spring snap towards nearest card index
          const rawCurrent = rotationRef.current
          const nearestIndex = Math.round(rawCurrent / step)
          const targetAngle = nearestIndex * step
          const error = targetAngle - rawCurrent

          if (Math.abs(error) > 0.0005) {
            velocityRef.current = error * 0.12
            rotationRef.current += velocityRef.current
          } else {
            velocityRef.current = 0
            rotationRef.current = targetAngle
          }
        }
      }

      // 5. Compute active focused index
      const positiveRot =
        ((rotationRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const currentActive = Math.round(positiveRot / step) % count

      if (currentActive !== activeIndexRef.current) {
        activeIndexRef.current = currentActive
        setFocusedIndex(currentActive)
        playCarouselTick(!isAudioMuted)
      }

      // 6. Compute transforms for each card according to layout
      const gridCols = viewportWidth < 768 ? 1 : viewportWidth < 1200 ? 2 : 3
      const cardW = viewportWidth < 640 ? 320 : viewportWidth < 1024 ? 380 : 420
      const cardH = viewportWidth < 640 ? 400 : 480

      const transforms = filteredProjects.map((_, i) => {
        if (layoutType === "helix") {
          return getHelixTransform(i, count, rotationRef.current, ringRadius, 320)
        }
        if (layoutType === "grid") {
          return getGridTransform(i, count, gridCols, cardW, cardH, 28)
        }
        return getRingTransform(i, count, rotationRef.current, ringRadius)
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
                onClick={() => setFocusedIndex(i)}
                onOpenCaseStudy={() => handleOpenCaseStudy(p)}
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
                  onClick={() => rotateToIndex(i)}
                  onOpenCaseStudy={() => handleOpenCaseStudy(project)}
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
