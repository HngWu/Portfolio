"use client"

import * as React from "react"
import { cn, getTypographyClasses } from "@/lib/utils"
import { BentoTile } from "@/components/bento/BentoTile"
import { HeroTile } from "@/components/bento/tiles/HeroTile"
import { ProjectTile } from "@/components/bento/tiles/ProjectTile"
import { ExperienceTile } from "@/components/bento/tiles/ExperienceTile"
import { StatTile } from "@/components/bento/tiles/StatTile"
import { Hero3DTile } from "@/components/bento/tiles/Hero3DTile"
import { TerminalTile } from "@/components/bento/tiles/TerminalTile"
import { EasterEggTile } from "@/components/bento/tiles/EasterEggTile"
import { Badge } from "@/components/ui/Badge"
import { Database } from "@/types/supabase"
import { useViewModeStore } from "@/store/useViewModeStore"
import { 
  GraduationCap, 
  Cpu, 
  Trophy, 
  Mail, 
  Github, 
  Linkedin, 
  ExternalLink 
} from "lucide-react"

type Tile = Database['public']['Tables']['tiles']['Row']

interface TileRendererProps {
  tile: Tile
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

export function TileRenderer({ tile, isDragging, sortableProps }: TileRendererProps) {
  const content = tile.content as Record<string, unknown>
  const mode = useViewModeStore((state) => state.mode)
  const isDeepDive = mode === "deep"
  const typo = getTypographyClasses(tile.size, isDeepDive)
  
  switch (tile.type) {
    case "hero":
      return (
        <HeroTile 
          id={tile.id} 
          size={tile.size} 
          role={content.role as string}
          mark={content.mark as string}
          description={content.description as string}
          typo={typo}
          isDragging={isDragging}
          sortableProps={sortableProps}
        />
      )
    case "3d":
      return <Hero3DTile key={tile.id} id={tile.id} size={tile.size} isDragging={isDragging} sortableProps={sortableProps} />
    case "project":
      return (
        <ProjectTile 
          key={tile.id}
          id={tile.id} 
          size={tile.size} 
          name={content.name as string || "Untitled Project"} 
          description={content.description as string || ""}
          tags={(content.tech_stack as string[]) || []}
          deepDiveContent={tile.deep_dive}
          isDragging={isDragging}
          sortableProps={sortableProps}
        />
      )
    case "experience":
      return (
        <ExperienceTile
          key={tile.id}
          id={tile.id}
          size={tile.size}
          role={content.role as string}
          company={content.company as string}
          date={content.date as string}
          bullets={content.bullets as string[]}
          deepDive={tile.deep_dive}
          isDragging={isDragging}
          sortableProps={sortableProps}
        />
      )
    case "education":
      return (
        <BentoTile 
          key={tile.id} 
          id={tile.id} 
          size={tile.size} 
          href="/education" 
          glowColor="blue"
          isDragging={isDragging}
          sortableProps={sortableProps}
          deepContent={
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <h3 className={cn(typo.heading, "text-white/90")}>Academic Detail</h3>
                <GraduationCap className={cn(typo.icon, "text-[#4A8FFF]/60")} />
              </div>
              <div className="space-y-4">
                <p className={cn(typo.body, "text-white/70")}>{content.institution as string} - Full transcript and specialized research available on request.</p>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                   <span className={typo.meta}>Specialization</span>
                   <span className={cn(typo.meta, "text-lume-primary")}>{content.degree as string}</span>
                </div>
              </div>
            </div>
          }
        >
           <div className="flex items-center justify-between mb-4">
             <div className={cn(typo.meta, "text-white/30 uppercase tracking-widest")}>Education</div>
             <GraduationCap className={cn(typo.icon, "text-[#4A8FFF]/40")} />
           </div>
           <h3 className={cn(typo.heading, "text-white/90 mb-1")}>{content.institution as string}</h3>
           <p className={cn(typo.body, "text-white/50")}>{content.degree as string}</p>
           <div className="mt-auto pt-4 flex justify-between items-end border-t border-white/5">
              <span className={typo.meta}>{content.date as string}</span>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-tighter">GPA</span>
                <span className={cn(typo.heading, "text-lume-primary leading-none font-mono")}>{content.gpa as string}</span>
              </div>
           </div>
        </BentoTile>
      )
    case "terminal":
      return <TerminalTile key={tile.id} id={tile.id} size={tile.size} isDragging={isDragging} sortableProps={sortableProps} />
    case "stat":
      return <StatTile key={tile.id} id={tile.id} size={tile.size} value={content.value as string} label={content.label as string} isDragging={isDragging} sortableProps={sortableProps} />
    case "skill":
      return (
        <BentoTile 
          key={tile.id} 
          id={tile.id} 
          size={tile.size} 
          href="/skills" 
          glowColor="blue"
          isDragging={isDragging}
          sortableProps={sortableProps}
        >
          <div className="flex items-center justify-between mb-6">
            <div className={cn(typo.meta, "text-white/30 uppercase tracking-widest")}>Capabilities</div>
            <Cpu className={cn(typo.icon, "text-[#4A8FFF]/40")} />
          </div>
          <div className="flex flex-wrap gap-2">
            {(content.tags as string[]).map((tag: string) => (
              <Badge key={tag} variant="lume" className={cn(tile.size === '1x1' && "px-1.5 py-0 text-[8px]")}>{tag}</Badge>
            ))}
          </div>
        </BentoTile>
      )
    case "award":
      return (
        <BentoTile 
          key={tile.id} 
          id={tile.id} 
          size={tile.size} 
          href="/awards" 
          glowColor="amber" 
          className="border-l-2 border-l-[var(--lume-warm)]/50"
          isDragging={isDragging}
          sortableProps={sortableProps}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={cn(typo.heading, "text-white/90 leading-tight max-w-[80%]")}>{content.name as string}</h3>
            <Trophy className={cn(typo.icon, "text-lume-warm/40")} />
          </div>
          <p className={cn(typo.meta, "text-white/40 mb-4")}>{content.issuer as string} · {content.date as string}</p>
          <p className={cn(typo.body, "text-white/60 line-clamp-2 italic")}>&quot;{content.desc as string}&quot;</p>
        </BentoTile>
      )
    case "contact":
      return (
        <BentoTile 
          key={tile.id} 
          id={tile.id} 
          size={tile.size} 
          className="flex flex-col pb-8 h-full"
          isDragging={isDragging}
          sortableProps={sortableProps}
        >
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className={cn(typo.meta, "text-white/30 uppercase tracking-widest")}>Contact</div>
              <Mail className={cn(typo.icon, "text-white/20")} />
            </div>
            <div className={cn(typo.heading, "text-white/90 break-all selection:bg-lume-primary selection:text-black font-medium leading-tight")}>{content.email as string}</div>
          </div>
          <div className="flex gap-4 mt-8">
            <a 
              href={content.github as string} 
              target="_blank" 
              onPointerDown={(e) => e.stopPropagation()}
              className="group/link flex items-center gap-2 text-white/40 hover:text-lume-primary transition-colors font-mono text-xs"
            >
              <Github className="size-3.5" />
              <span>GitHub</span>
              <ExternalLink className="size-2.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
            </a>
            <a 
              href={content.linkedin as string} 
              target="_blank" 
              onPointerDown={(e) => e.stopPropagation()}
              className="group/link flex items-center gap-2 text-white/40 hover:text-lume-primary transition-colors font-mono text-xs"
            >
              <Linkedin className="size-3.5" />
              <span>LinkedIn</span>
              <ExternalLink className="size-2.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
            </a>
          </div>
        </BentoTile>
      )
    case "easter_egg":
      return <EasterEggTile key={tile.id} isDragging={isDragging} sortableProps={sortableProps} />
    default:
      return null
  }
}
