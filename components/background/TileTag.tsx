"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useViewModeStore } from "@/store/useViewModeStore"

export interface TileTagProps {
  id: string
  index?: number
  className?: string
}

const RUNIC_GLYPHS = [
  "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ",
  "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ",
  "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ",
] as const

function computePolynomialHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}

function getHexHash(id: string): string {
  const hash = computePolynomialHash(id)
  return (hash & 0xffff).toString(16).toUpperCase().padStart(4, "0")
}

function getRuneText(id: string): string {
  let h1 = 0
  let h2 = 5381
  for (let i = 0; i < id.length; i++) {
    const c = id.charCodeAt(i)
    h1 = (h1 * 31 + c) >>> 0
    h2 = ((h2 << 5) + h2 + c) >>> 0
  }
  const r1 = RUNIC_GLYPHS[h1 % RUNIC_GLYPHS.length]
  const r2 = RUNIC_GLYPHS[(h1 >>> 5) % RUNIC_GLYPHS.length]
  const r3 = RUNIC_GLYPHS[h2 % RUNIC_GLYPHS.length]
  const r4 = RUNIC_GLYPHS[(h2 >>> 5) % RUNIC_GLYPHS.length]
  return `${r1}${r2} // ${r3}${r4}`
}

export const TileTag = React.memo(function TileTag({ id, index, className }: TileTagProps) {
  const mode = useViewModeStore((s) => s.mode)
  const isDeep = mode === "deep"

  const hexHash = React.useMemo(() => getHexHash(id), [id])
  const runeText = React.useMemo(() => getRuneText(id), [id])
  const deepText = isDeep ? `NODE_${String((index ?? 0) + 1).padStart(2, "0")} // 0x${hexHash}` : ""

  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute top-2.5 right-5 z-20 pointer-events-none select-none font-mono text-[10px] tracking-widest text-[var(--mode-text-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        className
      )}
    >
      {isDeep ? deepText : runeText}
    </div>
  )
})

export default TileTag
