"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface EmberParticle {
  left: string
  bottom: string
  size: number
  delay: string
  duration: string
  drift: string
}

const DETERMINISTIC_EMBERS: readonly EmberParticle[] = [
  { left: "14%", bottom: "4px", size: 3, delay: "0s", duration: "2.4s", drift: "-6px" },
  { left: "26%", bottom: "10px", size: 2, delay: "0.5s", duration: "2.1s", drift: "5px" },
  { left: "39%", bottom: "2px", size: 3.5, delay: "1.1s", duration: "2.7s", drift: "-7px" },
  { left: "54%", bottom: "8px", size: 2.5, delay: "0.3s", duration: "2.3s", drift: "6px" },
  { left: "67%", bottom: "6px", size: 3, delay: "1.6s", duration: "2.5s", drift: "-4px" },
  { left: "79%", bottom: "2px", size: 2, delay: "0.8s", duration: "2.2s", drift: "5px" },
  { left: "91%", bottom: "10px", size: 2.5, delay: "1.3s", duration: "2.6s", drift: "-5px" },
]

export interface ArcaneEmbersProps {
  className?: string
}

export function ArcaneEmbers({ className }: ArcaneEmbersProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-1/2 overflow-hidden",
        "opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100",
        className
      )}
      style={{
        maskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)",
        WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)",
      }}
    >
      {DETERMINISTIC_EMBERS.map((ember, i) => (
        <span
          key={i}
          className="absolute rounded-full animate-ember-float"
          style={{
            left: ember.left,
            bottom: ember.bottom,
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            backgroundColor: "#E67E22",
            boxShadow: "0 0 6px 1px #FFD95A",
            animationDelay: ember.delay,
            animationDuration: ember.duration,
            ["--drift" as string]: ember.drift,
          }}
        />
      ))}
    </div>
  )
}
