"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { ProjectItemData } from "@/lib/projects/types"
import type { CardTransform3D } from "@/lib/projects/layoutMath"
import {
  Star,
  GitFork,
  ExternalLink,
  Github,
  Sparkles,
  Maximize2,
  Calendar,
} from "lucide-react"

interface ProjectCardProps {
  project: ProjectItemData
  transform: CardTransform3D
  isFocused: boolean
  isAdjacent: boolean
  onClick: () => void
  onOpenCaseStudy: () => void
  index: number
  totalCount: number
}

export function ProjectCard({
  project,
  transform,
  isFocused,
  isAdjacent,
  onClick,
  onOpenCaseStudy,
  index,
  totalCount,
}: ProjectCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  // Pointer sheen state (active on cursor move)
  const [sheen, setSheen] = React.useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = React.useState(false)
  const [imageError, setImageError] = React.useState(false)

  // Autoplay control: only focused or adjacent cards play video
  React.useEffect(() => {
    if (!videoRef.current) return
    if (isFocused || isAdjacent) {
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
    }
  }, [isFocused, isAdjacent])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Subtle sheen light follows cursor without any up/down pitch tilt
    setSheen({ x, y })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (isFocused) {
        onOpenCaseStudy()
      } else {
        onClick()
      }
    }
  }

  // Language tint color
  const langColor = project.languageColor || "var(--lume-secondary, #4A8FFF)"

  // Status badge styling
  const statusStyles: Record<string, string> = {
    Shipped: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    "In progress": "bg-sky-500/10 border-sky-500/30 text-sky-400",
    Archived: "bg-zinc-500/10 border-zinc-500/30 text-zinc-400",
  }

  const statusBadgeClass =
    statusStyles[project.status] || "bg-white/10 border-white/20 text-white/70"

  // Sparkline coordinates
  const sparkPoints = React.useMemo(() => {
    const data = project.sparkline || [5, 8, 12, 10, 15, 14, 18, 12, 16, 20]
    const max = Math.max(...data, 1)
    const width = 80
    const height = 24
    return data
      .map((val, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - (val / max) * height
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(" ")
  }, [project.sparkline])

  // Assemble dynamic card transforms
  const cardTransformStyle: React.CSSProperties = {
    transform: `translate3d(${transform.x.toFixed(1)}px, ${transform.y.toFixed(1)}px, ${transform.z.toFixed(1)}px) scale(${transform.scale.toFixed(3)})`,
    opacity: transform.opacity,
    filter: `saturate(${transform.saturation.toFixed(2)})`,
    zIndex: transform.zIndex,
    borderColor: isFocused ? `${langColor}55` : "rgba(255, 255, 255, 0.08)",
    boxShadow: isFocused
      ? `0 24px 60px rgba(0, 0, 0, 0.75), 0 0 35px ${langColor}33`
      : "0 16px 40px rgba(0, 0, 0, 0.6)",
    transition:
      "opacity 0.25s ease, filter 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
  }

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-label={`${project.name}, ${project.status} project. ${isFocused ? "Press Enter or click to open case study." : "Press Enter or click to view project."}`}
      aria-roledescription="carousel card"
      aria-current={isFocused ? "true" : undefined}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        if (isFocused) {
          onOpenCaseStudy()
        } else {
          onClick()
        }
      }}
      onKeyDown={handleKeyDown}
      style={cardTransformStyle}
      className={cn(
        "absolute w-[clamp(310px,46vw,440px)] h-[clamp(380px,52vh,510px)] rounded-2xl cursor-pointer select-none",
        "bg-[#0e0f14]/94 backdrop-blur-xl border flex flex-col overflow-hidden will-change-transform",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lume-secondary)]",
        isFocused ? "cursor-pointer" : "hover:border-white/20"
      )}
    >
      {/* Dynamic Cursor Sheen Reflection (on focused card) */}
      {isFocused && isHovered && (
        <div
          style={{
            background: `radial-gradient(circle at ${sheen.x}px ${sheen.y}px, rgba(255, 255, 255, 0.12) 0%, transparent 55%)`,
          }}
          className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-200"
        />
      )}

      {/* Top Accent Neon Glow Line tinted with Language Color */}
      <div
        style={{
          background: `linear-gradient(90deg, transparent, ${langColor}, transparent)`,
        }}
        className={cn(
          "absolute top-0 inset-x-0 h-[2px] transition-opacity duration-300 z-20",
          isFocused ? "opacity-100" : "opacity-30"
        )}
      />

      {/* Media Preview Header (Video or Image) */}
      <div className="relative w-full h-[155px] sm:h-[185px] bg-black/40 overflow-hidden flex-shrink-0 border-b border-white/5">
        {project.previewVideo ? (
          <video
            ref={videoRef}
            src={project.previewVideo}
            poster={project.previewImage}
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-80"
          />
        ) : project.previewImage && !imageError ? (
          <img
            src={project.previewImage}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover opacity-80 transition-transform duration-500 hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          /* Sleek procedural abstract gradient fallback */
          <div
            style={{
              background: `radial-gradient(ellipse at 70% 30%, ${langColor}22 0%, rgba(10,12,18,0.95) 70%)`,
            }}
            className="w-full h-full flex flex-col justify-end p-4"
          >
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/30">
              {project.language || "Code Repository"}
            </div>
          </div>
        )}

        {/* Media Overlay Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-semibold border backdrop-blur-md",
              statusBadgeClass
            )}
          >
            {project.status}
          </span>

          {project.featured && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-400 backdrop-blur-md">
              <Sparkles className="size-2.5" />
              <span>Featured</span>
            </span>
          )}
        </div>

        {/* Bottom gradient fade into card body */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#0e0f14] to-transparent pointer-events-none" />
      </div>

      {/* Card Content Body */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between overflow-hidden">
        <div>
          {/* Language & Activity Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span
                style={{ backgroundColor: langColor }}
                className="w-2 h-2 rounded-full inline-block shadow-[0_0_6px_currentColor]"
              />
              <span className="font-mono text-[11px] text-white/70">
                {project.language || "TypeScript"}
              </span>
            </div>

            {/* Sparkline visualization */}
            {project.sparkline && (
              <div
                className="flex items-center gap-1.5 opacity-60"
                title="Recent Commit Activity"
              >
                <svg width="80" height="24" className="overflow-visible">
                  <polyline
                    fill="none"
                    stroke={langColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sparkPoints}
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Project Title */}
          <h3 className="text-xl sm:text-2xl font-display font-medium text-white tracking-tight leading-snug line-clamp-1">
            {project.name}
          </h3>

          {/* Project Description */}
          <p className="text-xs sm:text-[13px] text-white/60 leading-relaxed mt-2 line-clamp-3">
            {project.description}
          </p>

          {/* Tech Stack Chips */}
          <div className="flex flex-wrap gap-1.5 mt-3 max-h-[52px] overflow-hidden">
            {project.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/[0.04] border border-white/8 text-white/50"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="text-[9px] font-mono text-white/30 self-center">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Footer: Live Metrics, Links & Expand Action */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-auto">
          {/* GitHub Stats */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-white/50">
            <span className="flex items-center gap-1" title="GitHub Stars">
              <Star className="size-3 text-amber-400" />
              <span>{project.stars}</span>
            </span>
            <span className="flex items-center gap-1" title="Forks">
              <GitFork className="size-3 text-white/40" />
              <span>{project.forks}</span>
            </span>
          </div>

          {/* Action Links & Expand trigger */}
          <div className="flex items-center gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="View GitHub Repository"
                className="p-1.5 rounded-lg border border-white/5 bg-white/[0.02] text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Github className="size-3.5" />
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Open Live Deployment"
                className="p-1.5 rounded-lg border border-white/5 bg-white/[0.02] text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenCaseStudy()
              }}
              title="Open Case Study (Enter)"
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider font-semibold border transition-all",
                isFocused
                  ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  : "bg-white/5 border-white/5 text-white/40 hover:text-white"
              )}
            >
              <span>Case Study</span>
              <Maximize2 className="size-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
