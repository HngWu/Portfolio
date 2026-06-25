"use client"

import { BentoTile } from "../BentoTile"
import { Badge } from "@/components/ui/Badge"
import { useViewModeStore } from "@/store/useViewModeStore"
import { FolderGit2 } from "lucide-react"
import * as React from "react"
import { cn, getTypographyClasses } from "@/lib/utils"
import { ForceMobileContext } from "../ForceMobileContext"
import { parseTileDeepDive, type ProjectContent } from "@/lib/tiles/schemas"
import type { Json } from "@/types/supabase"

interface ProjectTileProps {
  id: string
  size: string
  content: ProjectContent
  deepDive?: Json
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

export function ProjectTile({ id, size, content, deepDive, isDragging, sortableProps }: ProjectTileProps) {
  const { name, description, techStack: tags } = content
  const mode = useViewModeStore((state) => state.mode)
  const isDeepDive = mode === "deep"
  const forceMobile = React.useContext(ForceMobileContext)
  const typo = getTypographyClasses(size, isDeepDive, forceMobile)

  // Safely extract deep dive notes via the typed parser.
  const notes = parseTileDeepDive("project", deepDive).notes

  return (
    <BentoTile 
      id={id} 
      size={size} 
      href={`/projects/${id}`} 
      glowColor="blue" 
      className="justify-between" 
      isDragging={isDragging} 
      sortableProps={sortableProps}
      deepContent={
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className={cn(typo.heading, "text-white/90")}>Stack & Strategy</h3>
            <FolderGit2 className={cn(typo.icon, "text-lume-secondary/60")} />
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="lume" className={cn(size === '1x1' && "px-1.5 py-0 text-[8px]")}>{tag}</Badge>
              ))}
            </div>
            {notes && (
              <p className={cn(typo.body, "text-white/50 leading-relaxed line-clamp-4")}>{notes}</p>
            )}
          </div>
          <div className={cn(typo.meta, "mt-auto pt-4 text-lume-primary uppercase tracking-widest border-t border-white/5")}>
            Phase: Production Ready
          </div>
        </div>
      }
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className={cn(typo.heading, "text-white/90")}>{name}</h3>
          <FolderGit2 className={cn(typo.icon, "text-lume-secondary/40")} />
        </div>
        <p className={cn(typo.body, "text-white/55 line-clamp-2 leading-relaxed")}>{description}</p>
      </div>

      <div className="flex flex-wrap gap-2 mt-6">
        {tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="lume" className={cn(size === '1x1' && "px-1.5 py-0 text-[8px]")}>{tag}</Badge>
        ))}
        {tags.length > 3 && (
          <Badge variant="outline" className={cn(size === '1x1' && "px-1 py-0 text-[8px]")}>+{tags.length - 3}</Badge>
        )}
      </div>
    </BentoTile>
  )
}
