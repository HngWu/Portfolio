"use client"

import * as React from "react"
import { BentoTile } from "./BentoTile"
import { AlertTriangle } from "lucide-react"

/**
 * Fallback rendered when a tile's content fails schema validation. Keeps the
 * grid layout intact (same id/size) while making the failure visible in dev
 * rather than silently rendering `undefined` fields.
 */
export function TileError({
  id,
  size,
  type,
  message,
}: {
  id: string
  size: string
  type: string
  message: string
}) {
  if (process.env.NODE_ENV === "production") {
    // In production, render an empty placeholder so a bad row never breaks the
    // grid — it just leaves a gap.
    return <BentoTile id={id} size={size} canDeepDive={false}>{null}</BentoTile>
  }

  return (
    <BentoTile
      id={id}
      size={size}
      glowColor="pink"
      canDeepDive={false}
      className="flex flex-col items-center justify-center text-center"
    >
      <AlertTriangle className="size-5 text-lume-tertiary mb-2" />
      <span className="text-[10px] font-mono uppercase tracking-widest text-lume-tertiary">
        Invalid {type} tile
      </span>
      <p className="text-[9px] mt-1 text-white/40 font-mono break-all px-2">{message}</p>
    </BentoTile>
  )
}
