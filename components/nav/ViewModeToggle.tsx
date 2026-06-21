"use client"

import { useViewModeStore } from "@/store/useViewModeStore"
import { useModeTransitionStore } from "@/store/useModeTransitionStore"
import { Zap, Microscope } from "lucide-react"

export function ViewModeToggle() {
  const { mode } = useViewModeStore()
  const startTransition = useModeTransitionStore((s) => s.startTransition)
  const isTransitioning = useModeTransitionStore((s) => s.phase !== "idle")

  const select = (target: "quick" | "deep") => {
    if (mode === target || isTransitioning) return
    startTransition(target)
  }

  return (
    <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-full p-1 w-fit backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Background Grain */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <button
        onClick={() => select("quick")}
        disabled={isTransitioning}
        className={`relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-500 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed ${
          mode === "quick"
            ? "bg-lume-warm/20 text-lume-warm shadow-[0_0_20px_rgba(255,180,74,0.2)]"
            : "text-white/40 hover:text-white/70"
        }`}
      >
        <Zap className={`size-3 transition-transform duration-500 ${mode === "quick" ? "scale-110" : ""}`} />
        Quick-Pitch
      </button>
      <button
        onClick={() => select("deep")}
        disabled={isTransitioning}
        className={`relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-500 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed ${
          mode === "deep"
            ? "bg-lume-secondary/20 text-lume-secondary shadow-[0_0_20px_rgba(74,143,255,0.2)]"
            : "text-white/40 hover:text-white/70"
        }`}
      >
        <Microscope className={`size-3 transition-transform duration-500 ${mode === "deep" ? "scale-110" : ""}`} />
        Deep Dive
      </button>
    </div>
  )
}
