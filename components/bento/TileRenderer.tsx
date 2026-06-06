"use client"

import * as React from "react"
import { cn, getTypographyClasses } from "@/lib/utils"
import { BentoTile } from "@/components/bento/BentoTile"
import { ForceMobileContext } from "./ForceMobileContext"
import { HeroTile } from "@/components/bento/tiles/HeroTile"
import { ProjectTile } from "@/components/bento/tiles/ProjectTile"
import { ExperienceTile } from "@/components/bento/tiles/ExperienceTile"
import { StatTile } from "@/components/bento/tiles/StatTile"
import { Hero3DTile } from "@/components/bento/tiles/Hero3DTile"
import { TerminalTile } from "@/components/bento/tiles/TerminalTile"
import { EasterEggTile } from "@/components/bento/tiles/EasterEggTile"
import { SkillsTile } from "@/components/bento/tiles/SkillsTile"
import { ContactTile } from "@/components/bento/tiles/ContactTile"
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
  ExternalLink,
  TrendingUp,
  Award
} from "lucide-react"

type Tile = Database['public']['Tables']['tiles']['Row']



interface TileRendererProps {
  tile: Tile
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

export function TileRenderer({ tile, isDragging, sortableProps }: TileRendererProps) {
  const forceMobile = React.useContext(ForceMobileContext)
  const content = tile.content as Record<string, unknown>
  const mode = useViewModeStore((state) => state.mode)
  const isDeepDive = mode === "deep"
  const typo = getTypographyClasses(tile.size, isDeepDive, forceMobile)
  
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
          highlights={content.highlights as string[]}
          deepDive={tile.deep_dive}
          isDragging={isDragging}
          sortableProps={sortableProps}
        />
      )
    case "education": {
      const deep = tile.deep_dive as Record<string, unknown> | null
      
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
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-start mb-4 shrink-0">
                <div>
                  <h3 className={cn(typo.heading, "text-white/90")}>Academic Profile</h3>
                  <p className={cn(typo.body, "text-white/60 mt-1")}>{content.institution as string}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/20">
                  <GraduationCap className={cn(typo.icon, "text-[#4A8FFF]")} />
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-1">
                  <span className={cn(typo.meta, "text-white/30 uppercase tracking-widest")}>Degree</span>
                  <p className={cn(typo.body, "text-white/80 font-medium leading-tight text-base md:text-lg")}>{content.degree as string}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative p-5 bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden group/gpa">
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover/gpa:opacity-40 transition-opacity">
                      <TrendingUp className="size-4 text-lume-primary" />
                    </div>
                    <span className={cn(typo.meta, "block text-white/30 mb-2")}>Cumulative GPA</span>
                    <div className="flex items-baseline gap-1">
                      <span className={cn(typo.heading, "text-lume-primary leading-none font-mono text-3xl")}>{content.gpa as string}</span>
                      <span className="text-[10px] text-white/20 font-mono">/ 4.00</span>
                    </div>
                    <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-lume-primary/60" 
                        style={{ width: `${(parseFloat(content.gpa as string) / 4) * 100}%` }} 
                      />
                    </div>
                  </div>

                  <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 flex flex-col justify-between">
                    <div>
                      <span className={cn(typo.meta, "block text-white/30 mb-2")}>Study Period</span>
                      <span className={cn(typo.body, "text-white/80 font-medium leading-tight")}>{content.date as string}</span>
                    </div>
                    {typeof deep?.honours === 'string' && (
                      <div className="flex items-center gap-2 mt-3">
                        <Award className="size-3 text-lume-primary/60" />
                        <span className="text-[9px] text-lume-primary font-bold uppercase tracking-tighter">{deep.honours}</span>
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
           <h3 className={cn(typo.heading, "text-white/90 mb-1")}>{content.institution as string}</h3>
           <p className={cn(typo.body, "text-white/50")}>{content.degree as string}</p>
           <div className="flex-1" />
           <div className="mt-6 pt-6 flex justify-between items-start border-t border-white/5">
              <span className={typo.meta}>{content.date as string}</span>
           </div>
        </BentoTile>
      )
    }
    case "terminal":
      return <TerminalTile key={tile.id} id={tile.id} size={tile.size} isDragging={isDragging} sortableProps={sortableProps} />
    case "stat":
      return <StatTile key={tile.id} id={tile.id} size={tile.size} value={content.value as string} label={content.label as string} deepDive={tile.deep_dive} isDragging={isDragging} sortableProps={sortableProps} />
    case "skill":
      return (
        <SkillsTile 
          key={tile.id} 
          id={tile.id} 
          size={tile.size} 
          tags={content.tags as string[]} 
          isDragging={isDragging} 
          sortableProps={sortableProps} 
        />
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
        <ContactTile
          key={tile.id}
          id={tile.id}
          size={tile.size}
          email={content.email as string}
          github={content.github as string}
          linkedin={content.linkedin as string}
          telegram={content.telegram as string}
          deepDive={tile.deep_dive}
          isDragging={isDragging}
          sortableProps={sortableProps}
        />
      )
    case "easter_egg":
      return <EasterEggTile key={tile.id} isDragging={isDragging} sortableProps={sortableProps} />
    default:
      return null
  }
}
