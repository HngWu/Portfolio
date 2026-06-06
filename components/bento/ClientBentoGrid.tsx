"use client"

import * as React from "react"
import { BentoGrid } from "./BentoGrid"
import { TileRenderer } from "./TileRenderer"
import { EasterEggTile } from "./tiles/EasterEggTile"
import { Database } from "@/types/supabase"

type Tile = Database["public"]["Tables"]["tiles"]["Row"]

interface ClientBentoGridProps {
  initialTiles: Tile[]
  showEasterEgg: boolean
}

export default function ClientBentoGrid({
  initialTiles,
  showEasterEgg,
}: ClientBentoGridProps) {
  const isMobile = React.useSyncExternalStore(
    React.useCallback((callback: () => void) => {
      const mediaQuery = window.matchMedia("(max-width: 767px)")
      mediaQuery.addEventListener("change", callback)
      return () => mediaQuery.removeEventListener("change", callback)
    }, []),
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false
  )

  const sortedTiles = React.useMemo(() => {
    // Filter out config, hidden, and easter_egg tiles from the main bento layout loop
    const filtered = initialTiles.filter(
      (tile) => !tile.is_hidden && tile.type !== "config" && tile.type !== "easter_egg"
    )

    return filtered.sort((a, b) => {
      if (isMobile) {
        const valA = a.order_val_mobile ?? a.order_val
        const valB = b.order_val_mobile ?? b.order_val
        if (valA === valB) {
          return a.order_val - b.order_val
        }
        return valA - valB
      } else {
        return a.order_val - b.order_val
      }
    })
  }, [initialTiles, isMobile])

  return (
    <BentoGrid>
      {sortedTiles.map((tile) => (
        <TileRenderer key={tile.id} tile={tile} />
      ))}
      {showEasterEgg && <EasterEggTile />}
    </BentoGrid>
  )
}
