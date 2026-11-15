"use client"

import * as React from "react"
import { BentoTile } from "../BentoTile"
import { cn, getTypographyClasses } from "@/lib/utils"
import { ForceMobileContext } from "../ForceMobileContext"
import { Cpu } from "lucide-react"
import type { SkillContent } from "@/lib/tiles/schemas"
import { MiniAstrolabeGraphic } from "./MiniAstrolabeGraphic"

interface SkillsTileProps {
  id: string
  size: string
  content: SkillContent
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

const DEFAULT_TAGS = [
  "Java",
  "Spring Boot",
  "Next.js 16",
  "TypeScript",
  "Three.js",
  "Docker",
  "Go",
]

const TAG_TO_STAR_MAP: Record<string, string> = {
  "Java": "enterprise-backend",
  "Spring Boot": "enterprise-backend",
  "MariaDB": "enterprise-backend",
  "Next.js 16": "web-architecture",
  "Next.js": "web-architecture",
  "TypeScript": "web-architecture",
  "React 19": "web-architecture",
  "Three.js": "creative-tech",
  "GSAP": "creative-tech",
  "GLSL": "creative-tech",
  "Docker": "cloud-devops",
  "OpenShift": "cloud-devops",
  "Kubernetes": "cloud-devops",
  "Jenkins": "cloud-devops",
  "Go": "distributed-systems",
  "Distributed Systems": "distributed-systems",
  "Algorithms": "core-cs",
  "Core CS": "core-cs",
}

export function SkillsTile({ id, size, content, isDragging, sortableProps }: SkillsTileProps) {
  const forceMobile = React.useContext(ForceMobileContext)
  const typo = getTypographyClasses(size, false, forceMobile)
  const deepTypo = getTypographyClasses(size, true, forceMobile)

  const [hoveredTagOrStar, setHoveredTagOrStar] = React.useState<string | null>(null)

  const tags = React.useMemo(() => {
    if (content?.tags && content.tags.length > 0) {
      return Array.from(new Set([...DEFAULT_TAGS, ...content.tags]))
    }
    return DEFAULT_TAGS
  }, [content?.tags])

  const renderBadges = (isDeep: boolean = false) => (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 my-2 sm:my-2.5" role="toolbar" aria-label="Skill badges">
      {tags.slice(0, 11).map((tag) => {
        const starId = TAG_TO_STAR_MAP[tag]
        const isActive = hoveredTagOrStar && starId === hoveredTagOrStar

        return (
          <button
            type="button"
            key={tag}
            onMouseEnter={() => {
              if (starId) {
                setHoveredTagOrStar(starId)
              }
            }}
            onMouseLeave={() => setHoveredTagOrStar(null)}
            onFocus={() => {
              if (starId) {
                setHoveredTagOrStar(starId)
              }
            }}
            onBlur={() => setHoveredTagOrStar(null)}
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-medium tracking-wide transition-all duration-200 cursor-pointer select-none outline-none focus-visible:ring-1",
              isActive
                ? (isDeep
                    ? "bg-sky-500/20 border border-sky-400 text-white shadow-[0_0_10px_rgba(56,189,248,0.4)] scale-105"
                    : "bg-white/15 border border-[#4AFFB4] text-white shadow-[0_0_10px_rgba(74,255,180,0.3)] scale-105")
                : "bg-white/5 border border-white/10 text-white/80 hover:border-white/30 hover:bg-white/10"
            )}
          >
            {tag}
          </button>
        )
      })}
      {tags.length > 11 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono text-white/40 bg-white/[0.02] border border-white/5">
          +{tags.length - 11} more
        </span>
      )}
    </div>
  )

  return (
    <BentoTile
      id={id}
      size={size}
      href="/skills"
      glowColor="blue"
      className="p-4 sm:p-5 md:p-5"
      isDragging={isDragging}
      sortableProps={sortableProps}
      canDeepDive={true}
      canMorph={false}
      canExpand={false}
      deepContent={
        /* Deep Dive: Tech-Themed Architecture & Stack */
        <div className="flex flex-col justify-between h-full w-full">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-2 select-none shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center justify-center size-5 rounded-md bg-sky-500/10 border border-sky-500/25 text-sky-400 shadow-sm">
                  <Cpu className="size-3 animate-pulse" />
                </div>
                <span className={cn(deepTypo.meta, "text-white/80 uppercase tracking-widest text-[10px] font-mono")}>
                  Technical Skills
                </span>
              </div>
            </div>

            {/* Center: Tech-Themed Mini Astrolabe Graphic */}
            <div className="w-full my-1.5 sm:my-2 shrink-0">
              <MiniAstrolabeGraphic
                mode="deep"
                activeStarId={hoveredTagOrStar}
                onHoverStar={setHoveredTagOrStar}
              />
            </div>

            {/* Skill Tag Badges */}
            {renderBadges(true)}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-3.5 sm:pt-4 flex items-center text-[10px] font-mono border-t border-sky-500/15 shrink-0">
            <span className="text-white/40 tracking-wider">SYSTEM TOPOLOGY</span>
          </div>
        </div>
      }
    >
      {/* Quick-Pitch: Header + Mini Astrolabe Graphic + Interactive Badges */}
      <div className="flex flex-col justify-between h-full w-full">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-2 select-none shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center size-5 rounded-md bg-white/[0.04] border border-white/10 text-[#E5B869] shadow-sm">
                <Cpu className="size-3" />
              </div>
              <span className={cn(typo.meta, "text-white/60 uppercase tracking-widest text-[10px] font-mono")}>
                Technical Skills
              </span>
            </div>
          </div>

          {/* Center: Interactive Mini Astrolabe Graphic */}
          <div className="w-full my-1.5 sm:my-2 shrink-0">
            <MiniAstrolabeGraphic
              mode="quick"
              activeStarId={hoveredTagOrStar}
              onHoverStar={setHoveredTagOrStar}
            />
          </div>

          {/* Skill Tag Badges */}
          {renderBadges(false)}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3.5 sm:pt-4 flex items-center text-[10px] font-mono border-t border-white/5 shrink-0">
          <span className="text-white/40 tracking-wider">SYSTEM TOPOLOGY</span>
        </div>
      </div>
    </BentoTile>
  )
}
