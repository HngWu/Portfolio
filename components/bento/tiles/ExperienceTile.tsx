"use client"

import { BentoTile } from "../BentoTile"
import { useViewModeStore } from "@/store/useViewModeStore"
import { 
  Briefcase, 
  Layers, 
  Zap, 
  BarChart3, 
  Database as DbIcon, 
  Layout,
  ExternalLink
} from "lucide-react"
import { cn, getTypographyClasses } from "@/lib/utils"
import { Json } from "@/types/supabase"

interface ExperienceTileProps {
  id: string
  size: string
  role: string
  company: string
  date: string
  highlights?: string[] // Quick Pitch view
  deepDive?: Json // Deep Dive full content
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

export function ExperienceTile({ id, size, role, company, date, highlights = [], deepDive, isDragging, sortableProps }: ExperienceTileProps) {
  const mode = useViewModeStore((state) => state.mode)
  const isDeepDive = mode === "deep"
  const typo = getTypographyClasses(size, isDeepDive)

  // Mapping for category icons
  const getHighlightIcon = (title: string, className: string) => {
    const t = title.toLowerCase()
    if (t.includes('migration') || t.includes('devops')) return <Layers className={className} />
    if (t.includes('performance') || t.includes('optimization')) return <Zap className={className} />
    if (t.includes('testing') || t.includes('analytics')) return <BarChart3 className={className} />
    if (t.includes('database')) return <DbIcon className={className} />
    if (t.includes('ui') || t.includes('experimental')) return <Layout className={className} />
    return <Briefcase className={className} />
  }

  // Deep Dive content structure
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const sections = (deepDive as any)?.sections as Array<{title: string, content: string}> || []

  const deepContent = sections.length > 0 ? (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div>
          <h3 className={cn(typo.heading, "text-white/90")}>Professional Impact</h3>
          <p className={cn(typo.meta, "text-lume-primary mt-1 uppercase tracking-widest")}>{company}</p>
        </div>
        <div className="p-3 bg-lume-primary/10 rounded-full border border-lume-primary/20">
          <Briefcase className={cn(typo.icon, "text-lume-primary")} />
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-4">
        {sections.map((section, i) => (
          <div key={i} className="group/section">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 bg-white/5 rounded-lg border border-white/5 group-hover/section:border-lume-primary/30 transition-colors">
                {getHighlightIcon(section.title, "size-3.5 text-lume-primary/60")}
              </div>
              <h4 className={cn(typo.meta, "text-white/80 font-bold uppercase tracking-wider")}>{section.title}</h4>
            </div>
            <p className={cn(typo.body, "text-white/50 leading-relaxed pl-9")}>
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  ) : null

  return (
    <BentoTile 
      id={id} 
      size={size} 
      href={`/experience`} 
      glowColor="mint" 
      isDragging={isDragging} 
      sortableProps={sortableProps}
      deepContent={deepContent}
    >
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div>
          <h3 className={cn(typo.heading, "font-medium text-white/90")}>{role}</h3>
          <p className={cn(typo.meta, "text-white/40 mt-1")}>{company} · {date}</p>
        </div>
        <Briefcase className={cn(typo.icon, "text-lume-primary/40 mt-1")} />
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-3">
        {highlights.slice(0, 5).map((highlight, i) => (
          <div key={i} className="flex items-center gap-3 group/item">
            <div className="shrink-0 p-1 bg-white/5 rounded-md border border-white/5 group-hover/item:border-lume-primary/30 transition-colors">
              {getHighlightIcon(highlight, "size-3 text-lume-primary/40 group-hover/item:text-lume-primary/60")}
            </div>
            <span className={cn(typo.body, "text-white/60 group-hover/item:text-white/80 transition-colors line-clamp-1")}>
              {highlight}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 flex items-center justify-between border-t border-white/5 pb-0">
        <span className={cn(typo.meta, "text-white/20 uppercase tracking-widest leading-none")}>DBS Bank</span>
      </div>
    </BentoTile>
  )
}
