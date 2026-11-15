"use client"

import React from "react"

interface DeityHaloGyroscopeProps {
  reducedMotion?: boolean
  className?: string
}

export function DeityHaloGyroscope({ reducedMotion = false, className = "" }: DeityHaloGyroscopeProps) {
  return (
    <div
      data-deity-halo="true"
      data-reduced-motion={reducedMotion ? "true" : "false"}
      className={`absolute top-[4%] left-1/2 -translate-x-1/2 w-[340px] h-[340px] pointer-events-none z-10 ${className}`}
      style={{
        transform: "perspective(900px) rotateX(60deg) translateZ(-20px)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Outer Gyro Ring (Clockwise) */}
      <div
        className={`absolute inset-0 rounded-full border border-cyan-400/40 shadow-[0_0_30px_rgba(0,240,255,0.35)] ${
          reducedMotion ? "" : "animate-[halo-spin-cw_24s_linear_infinite]"
        }`}
        style={{
          borderTopColor: "rgba(74, 255, 180, 0.8)",
          borderRightColor: "rgba(0, 240, 255, 0.6)",
          borderBottomColor: "rgba(168, 85, 247, 0.4)",
          borderLeftColor: "rgba(0, 240, 255, 0.2)",
        }}
      >
        {/* Orbiting micro capacitor nodes */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#00F0FF]" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_#A855F7]" />
      </div>

      {/* Mid Concentric Halo Layer (Artwork extracted) */}
      <div
        className={`absolute inset-4 rounded-full overflow-hidden ${
          reducedMotion ? "" : "animate-[halo-spin-cw_32s_linear_infinite]"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/deity/layer-halo-rings.webp"
          alt="Celestial Astrolabe Halo"
          className="w-full h-full object-contain opacity-80 mix-blend-screen filter drop-shadow-[0_0_20px_rgba(0,240,255,0.5)]"
        />
      </div>

      {/* Inner Runic Glyph Gyro Ring (Counter-Clockwise) */}
      <div
        className={`absolute inset-10 rounded-full border border-dashed border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] ${
          reducedMotion ? "" : "animate-[halo-spin-ccw_16s_linear_infinite]"
        }`}
      >
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 size-2 rounded-full bg-lume-primary shadow-[0_0_10px_#4AFFB4]" />
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]" />
      </div>

      {/* Core Plasma Aura */}
      <div className="absolute inset-16 rounded-full bg-[radial-gradient(circle,rgba(0,240,255,0.2)_0%,transparent_70%)] animate-pulse" />
    </div>
  )
}
