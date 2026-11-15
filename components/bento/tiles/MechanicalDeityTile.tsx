"use client"

import React from "react"
import dynamic from "next/dynamic"
import { BentoTile } from "../BentoTile"

const MechanicalDeityScene = dynamic(
  () => import("@/components/three/MechanicalDeityScene").then((m) => m.MechanicalDeityScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-black/20 rounded-2xl">
        <div className="size-12 border-2 border-lume-primary/20 border-t-lume-primary rounded-full animate-spin" />
      </div>
    ),
  }
)

interface MechanicalDeityTileProps {
  id: string
  size: string
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

export function MechanicalDeityTile({
  id,
  size,
  isDragging,
  sortableProps,
}: MechanicalDeityTileProps) {
  return (
    <BentoTile
      id={id}
      size={size}
      className="p-0 bg-transparent overflow-hidden h-full w-full min-h-[480px] sm:min-h-[580px]"
      isDragging={isDragging}
      sortableProps={sortableProps}
      canDeepDive={false}
      canMorph={false}
      noPadding={true}
      forceFullHeight={true}
      disableHoverScale={true}
    >
      <div className="w-full h-full relative rounded-3xl overflow-hidden border border-white/10 bg-[#08080A]">
        <MechanicalDeityScene />
      </div>
    </BentoTile>
  )
}

