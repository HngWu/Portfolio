import * as React from "react"
import { BentoTile } from "../BentoTile"
import { GraduationCap, Zap, LayoutGrid, BarChart3 } from "lucide-react"
import { cn, getTypographyClasses } from "@/lib/utils"
import { ForceMobileContext } from "../ForceMobileContext"

import type { StatContent } from "@/lib/tiles/schemas"

export function StatTile({ 
  id, 
  size, 
  content, 
  deepDive,
  isDragging, 
  sortableProps 
}: { 
  id: string
  size: string
  content: StatContent
  deepDive?: unknown
  isDragging?: boolean
  sortableProps?: Record<string, unknown> 
}) {
  const { value, label } = content
  const forceMobile = React.useContext(ForceMobileContext)
  const typo = getTypographyClasses(size, false, forceMobile)

  const deep = deepDive as Record<string, unknown> | null
  const deepValue = deep?.value as string | number | undefined
  const deepLabel = deep?.label as string | undefined

  const getIcon = () => {
    const l = label.toLowerCase()
    const iconClass = cn(typo.icon, "opacity-40")
    if (l.includes('gpa')) return <GraduationCap className={cn(iconClass, "text-lume-primary")} />
    if (l.includes('exp')) return <Zap className={cn(iconClass, "text-lume-warm")} />
    if (l.includes('proj')) return <LayoutGrid className={cn(iconClass, "text-lume-secondary")} />
    return <BarChart3 className={cn(iconClass, "text-white")} />
  }

  return (
    <BentoTile 
      id={id} 
      size={size} 
      className="flex flex-col p-3 sm:p-4 md:p-5 group/stat" 
      isDragging={isDragging} 
      sortableProps={sortableProps} 
      canDeepDive={true} 
      canMorph={false}
      canExpand={false}
      deepContent={
        <div className="flex flex-col h-full w-full">
          <div className="flex items-start justify-between w-full mb-1">
            <div className={cn(typo.meta, "font-semibold tracking-[0.12em] uppercase text-white/20 line-clamp-1 mr-2")}>
              {deepLabel || label}
            </div>
            <div className="shrink-0">
              {getIcon()}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 w-full h-full pb-2">
            <div className={cn(
              "font-mono text-lume-secondary tracking-tighter drop-shadow-[0_0_10px_rgba(74,180,255,0.3)] leading-none",
              size === '1x1' ? "text-2xl md:text-3xl" : "text-3xl sm:text-4xl md:text-5xl"
            )}>
              {deepValue || value}
            </div>
          </div>
        </div>
      }
    >
      <div className="flex items-start justify-between w-full mb-1">
        <div className={cn(typo.meta, "font-semibold tracking-[0.12em] uppercase text-white/20 line-clamp-1 mr-2")}>
          {label}
        </div>
        <div className="shrink-0">
          {getIcon()}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center flex-1 w-full h-full pb-2">
        <div className={cn(
          "font-mono text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.15)] leading-none",
          size === '1x1' ? "text-2xl md:text-3xl" : "text-3xl sm:text-4xl md:text-5xl"
        )}>
          {String(value).split('').map((char, i) => {
            const digit = parseInt(char)
            const isDigit = !isNaN(digit)

            if (!isDigit) {
              return (
                <span key={i} className="inline-block">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              )
            }

            return (
              <span key={i} className="inline-block overflow-hidden h-[1em] leading-[1] align-bottom">
                <span className="block" style={{ transform: `translateY(${-digit}em)` }}>
                  <span
                    className="flex flex-col group-hover/stat:animate-odometer-roll"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {[0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9].map((n, j) => (
                      <span key={j} className="block h-[1em] leading-[1]">{n}</span>
                    ))}
                  </span>
                </span>
              </span>
            )
          })}
        </div>
      </div>
    </BentoTile>
  )
}
