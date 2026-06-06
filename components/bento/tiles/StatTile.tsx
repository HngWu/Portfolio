import * as React from "react"
import { BentoTile } from "../BentoTile"
import { GraduationCap, Zap, LayoutGrid, BarChart3 } from "lucide-react"
import { cn, getTypographyClasses } from "@/lib/utils"
import { ForceMobileContext } from "../ForceMobileContext"

export function StatTile({ 
  id, 
  size, 
  value, 
  label, 
  deepDive,
  isDragging, 
  sortableProps 
}: { 
  id: string
  size: string
  value: string | number
  label: string
  deepDive?: unknown
  isDragging?: boolean
  sortableProps?: Record<string, unknown> 
}) {
  const forceMobile = React.useContext(ForceMobileContext)
  const typo = getTypographyClasses(size, false, forceMobile)

  const deep = deepDive as Record<string, unknown> | null
  const deepValue = deep?.value as string | number | undefined
  const deepLabel = deep?.label as string | undefined
  const deepDetail = deep?.detail as string | undefined

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
      className="flex flex-col p-4 md:p-5 group/stat" 
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
              size === '1x1' ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl"
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
          "font-mono text-lume-primary tracking-tighter drop-shadow-[0_0_10px_rgba(74,255,180,0.3)] leading-none",
          size === '1x1' ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl"
        )}>
          {value}
        </div>
      </div>
    </BentoTile>
  )
}
