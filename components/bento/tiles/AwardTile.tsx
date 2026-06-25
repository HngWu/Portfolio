"use client"

import * as React from "react"
import { BentoTile } from "../BentoTile"
import { cn, getTypographyClasses } from "@/lib/utils"
import { ForceMobileContext } from "../ForceMobileContext"
import { useViewModeStore } from "@/store/useViewModeStore"
import { Trophy } from "lucide-react"
import type { AwardContent } from "@/lib/tiles/schemas"

interface AwardTileProps {
  id: string
  size: string
  content: AwardContent
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

export function AwardTile({ id, size, content, isDragging, sortableProps }: AwardTileProps) {
  const forceMobile = React.useContext(ForceMobileContext)
  const mode = useViewModeStore((state) => state.mode)
  const typo = getTypographyClasses(size, mode === "deep", forceMobile)

  return (
    <BentoTile
      id={id}
      size={size}
      href="/awards"
      glowColor="amber"
      className="border-l-2 border-l-[var(--lume-warm)]/50"
      isDragging={isDragging}
      sortableProps={sortableProps}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn(typo.heading, "text-white/90 leading-tight max-w-[80%]")}>{content.name}</h3>
        <Trophy className={cn(typo.icon, "text-lume-warm/40")} />
      </div>
      <p className={cn(typo.meta, "text-white/40 mb-4")}>
        {content.issuer} · {content.date}
      </p>
      <p className={cn(typo.body, "text-white/60 line-clamp-2 italic")}>&quot;{content.desc}&quot;</p>
    </BentoTile>
  )
}
