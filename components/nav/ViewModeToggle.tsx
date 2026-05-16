"use client"

import { useViewModeStore } from "@/store/useViewModeStore"
import { cn } from "@/lib/utils"

export function ViewModeToggle() {
  const { mode, setMode } = useViewModeStore()

  return (
    <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 w-fit z-50 fixed top-6 right-6">
      <button
        onClick={() => setMode("quick")}
        className={cn(
          "px-4 py-1.5 rounded-full text-xs font-medium transition-colors",
          mode === "quick" ? "bg-[#FFB44A]/20 text-[#FFB44A]" : "text-white/50 hover:text-white/80"
        )}
      >
        Quick-Pitch
      </button>
      <button
        onClick={() => setMode("deep")}
        className={cn(
          "px-4 py-1.5 rounded-full text-xs font-medium transition-colors",
          mode === "deep" ? "bg-[#4A8FFF]/20 text-[#4A8FFF]" : "text-white/50 hover:text-white/80"
        )}
      >
        Deep Dive
      </button>
    </div>
  )
}
