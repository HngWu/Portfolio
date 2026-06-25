"use client"

import * as React from "react"
import { BentoTile } from "../BentoTile"
import { cn, getTypographyClasses } from "@/lib/utils"
import { ForceMobileContext } from "../ForceMobileContext"
import { useViewModeStore } from "@/store/useViewModeStore"
import { GraduationCap, TrendingUp, Award } from "lucide-react"
import { parseTileDeepDive, type EducationContent } from "@/lib/tiles/schemas"
import type { Json } from "@/types/supabase"

interface EducationTileProps {
  id: string
  size: string
  content: EducationContent
  deepDive?: Json
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

export function EducationTile({
  id,
  size,
  content,
  deepDive,
  isDragging,
  sortableProps,
}: EducationTileProps) {
  const forceMobile = React.useContext(ForceMobileContext)
  const mode = useViewModeStore((state) => state.mode)
  const typo = getTypographyClasses(size, mode === "deep", forceMobile)
  const deep = parseTileDeepDive("education", deepDive)

  return (
    <BentoTile
      id={id}
      size={size}
      href="/education"
      glowColor="blue"
      isDragging={isDragging}
      sortableProps={sortableProps}
      deepContent={
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-start mb-4 shrink-0">
            <div>
              <h3 className={cn(typo.heading, "text-white/90")}>Academic Profile</h3>
              <p className={cn(typo.body, "text-white/60 mt-1")}>{content.institution}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/20">
              <GraduationCap className={cn(typo.icon, "text-[#4A8FFF]")} />
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-1">
              <span className={cn(typo.meta, "text-white/30 uppercase tracking-widest")}>Degree</span>
              <p className={cn(typo.body, "text-white/80 font-medium leading-tight text-base md:text-lg")}>
                {content.degree}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative p-5 bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden group/gpa">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover/gpa:opacity-40 transition-opacity">
                  <TrendingUp className="size-4 text-lume-primary" />
                </div>
                <span className={cn(typo.meta, "block text-white/30 mb-2")}>Cumulative GPA</span>
                <div className="flex items-baseline gap-1">
                  <span className={cn(typo.heading, "text-lume-primary leading-none font-mono text-3xl")}>
                    {content.gpa}
                  </span>
                  <span className="text-[10px] text-white/20 font-mono">/ 4.00</span>
                </div>
                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lume-primary/60"
                    style={{ width: `${(parseFloat(content.gpa) / 4) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 flex flex-col justify-between">
                <div>
                  <span className={cn(typo.meta, "block text-white/30 mb-2")}>Study Period</span>
                  <span className={cn(typo.body, "text-white/80 font-medium leading-tight")}>{content.date}</span>
                </div>
                {deep.honours && (
                  <div className="flex items-center gap-2 mt-3">
                    <Award className="size-3 text-lume-primary/60" />
                    <span className="text-[9px] text-lume-primary font-bold uppercase tracking-tighter">
                      {deep.honours}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn(typo.meta, "text-white/30 uppercase tracking-widest")}>Education</div>
        <GraduationCap className={cn(typo.icon, "text-[#4A8FFF]/40")} />
      </div>
      <h3 className={cn(typo.heading, "text-white/90 mb-1")}>{content.institution}</h3>
      <p className={cn(typo.body, "text-white/50")}>{content.degree}</p>
      <div className="flex-1" />
      <div className="mt-6 pt-6 flex justify-between items-start border-t border-white/5">
        <span className={typo.meta}>{content.date}</span>
      </div>
    </BentoTile>
  )
}
