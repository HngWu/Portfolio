"use client"

import { BentoTile } from "../BentoTile"
import { useViewModeStore } from "@/store/useViewModeStore"
import { Briefcase } from "lucide-react"
import { cn, getTypographyClasses } from "@/lib/utils"
import { Json } from "@/types/supabase"

interface ExperienceTileProps {
  id: string
  size: string
  role: string
  company: string
  date: string
  bullets: string[]
  deepDive?: Json
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

export function ExperienceTile({ id, size, role, company, date, bullets, deepDive, isDragging, sortableProps }: ExperienceTileProps) {
  const mode = useViewModeStore((state) => state.mode)
  const isDeepDive = mode === "deep"
  const typo = getTypographyClasses(size, isDeepDive)

  // Safely handle deep dive content
  const deepContent = deepDive ? (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <h3 className={cn(typo.heading, "text-white/90")}>Impact Analytics</h3>
        <Briefcase className={cn(typo.icon, "text-lume-primary/60")} />
      </div>
      <div className="space-y-6">
        <ul className={cn(typo.body, "space-y-4 text-white/70 list-disc pl-4 leading-relaxed")}>
          {bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {typeof deepDive === 'object' && deepDive !== null && !Array.isArray(deepDive) && (deepDive as any).extra && (
          <div className="pt-4 border-t border-white/5">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <p className={cn(typo.meta, "text-lume-secondary")}>{(deepDive as any).extra}</p>
          </div>
        )}
      </div>
    </div>
  ) : null

  return (
    <BentoTile 
      id={id} 
      size={size} 
      href={`/experience`} 
      glowColor="mint" 
      className="border-l-2 border-l-[var(--lume-primary)]/50" 
      isDragging={isDragging} 
      sortableProps={sortableProps}
      deepContent={deepContent}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className={cn(typo.heading, "font-medium text-white/90")}>{role}</h3>
          <p className={cn(typo.meta, "text-white/40 mt-1")}>{company} · {date}</p>
        </div>
        <Briefcase className={cn(typo.icon, "text-lume-primary/40 mt-1")} />
      </div>

      <ul className={cn(typo.body, "space-y-2 text-white/60 list-disc pl-4")}>
        {bullets.slice(0, size === '1x1' ? 1 : 2).map((bullet, i) => (
          <li key={i}>{bullet}</li>
        ))}
        {bullets.length > (size === '1x1' ? 1 : 2) && (
          <li className={cn(typo.meta, "list-none text-lume-primary/60 uppercase tracking-widest mt-2")}>
            + {bullets.length - (size === '1x1' ? 1 : 2)} more details in deep dive
          </li>
        )}
      </ul>
    </BentoTile>
  )
}
