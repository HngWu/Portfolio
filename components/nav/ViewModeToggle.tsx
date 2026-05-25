"use client"

import { useViewModeStore } from "@/store/useViewModeStore"
import { cn } from "@/lib/utils"
import { Zap, Microscope } from "lucide-react"

export function ViewModeToggle() {
  const { mode, setMode } = useViewModeStore()

  return (
    <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-full p-1 w-fit z-50 fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-auto md:left-auto md:translate-x-0 md:top-6 md:right-6 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Background Grain */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <button
        onClick={() => setMode("quick")}
        className={cn(
          "relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-500 uppercase tracking-widest",
          mode === "quick" 
            ? "bg-lume-warm/20 text-lume-warm shadow-[0_0_20px_rgba(255,180,74,0.2)]" 
            : "text-white/40 hover:text-white/70"
        )}
      >
        <Zap className={cn("size-3 transition-transform duration-500", mode === "quick" && "scale-110")} />
        Quick-Pitch
      </button>
      <button
        onClick={() => setMode("deep")}
        className={cn(
          "relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-500 uppercase tracking-widest",
          mode === "deep" 
            ? "bg-lume-secondary/20 text-lume-secondary shadow-[0_0_20px_rgba(74,143,255,0.2)]" 
            : "text-white/40 hover:text-white/70"
        )}
      >
        <Microscope className={cn("size-3 transition-transform duration-500", mode === "deep" && "scale-110")} />
        Deep Dive
      </button>
    </div>
  )
}
