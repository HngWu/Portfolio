"use client"

import React from "react"

interface DeityEmissionPulseProps {
  overdrive?: boolean
  className?: string
}

export function DeityEmissionPulse({
  overdrive = false,
  className = "",
}: DeityEmissionPulseProps) {
  return (
    <div
      data-deity-emission="true"
      data-overdrive={overdrive ? "true" : "false"}
      className={`absolute inset-0 pointer-events-none mix-blend-screen transition-all duration-300 z-10 ${
        overdrive
          ? "opacity-100 filter drop-shadow-[0_0_35px_rgba(0,240,255,0.95)] brightness-150 contrast-125"
          : "opacity-85 animate-[emission-breathe_4s_ease-in-out_infinite]"
      } ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/deity/layer-emission-mask.webp"
        alt="Mechanical Deity Emission Channels"
        className="w-full h-full object-cover select-none"
      />
    </div>
  )
}
