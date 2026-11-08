"use client"

import * as React from "react"
import { Gauge, Zap } from "lucide-react"
import { usePerformanceStore } from "@/store/usePerformanceStore"
import { cn } from "@/lib/utils"

export function PerformanceToggle() {
  const {
    fps,
    isLagging,
    enable3DModel,
    enableCustomCursor,
    enableBackgroundFx,
    enableCardTilt,
    setPromptOpen,
  } = usePerformanceStore()

  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-8 w-8 sm:w-20 bg-white/[0.03] border border-white/10 rounded-full animate-pulse" />
    )
  }

  const isEcoMode = !enable3DModel || !enableCustomCursor || !enableBackgroundFx || !enableCardTilt

  return (
    <button
      type="button"
      onClick={() => setPromptOpen(true)}
      className={cn(
        "inline-flex items-center justify-center h-8 rounded-full cursor-pointer select-none gap-1.5 px-2.5 sm:px-3 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 border",
        isLagging
          ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
          : isEcoMode
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
          : "bg-white/[0.03] border-white/10 text-white/50 hover:bg-lume-primary/10 hover:border-lume-primary/30 hover:text-lume-primary"
      )}
      title="Graphics & Performance Settings"
      aria-label="Graphics & Performance Settings"
    >
      {isEcoMode ? <Zap className="size-3.5" /> : <Gauge className="size-3.5" />}

      {/* Status indicator dot */}
      <span
        className={cn(
          "size-1.5 rounded-full shrink-0",
          isLagging
            ? "bg-amber-400 animate-pulse"
            : isEcoMode
            ? "bg-emerald-400"
            : "bg-white/30"
        )}
      />

      <span className="text-[11px] font-mono font-bold tracking-wider hidden sm:inline">
        {isLagging ? "LOW FPS" : isEcoMode ? "ECO" : `${fps} FPS`}
      </span>
    </button>
  )
}
