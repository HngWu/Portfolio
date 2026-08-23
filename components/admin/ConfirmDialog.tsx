"use client"

import * as React from "react"
import { useConfirmStore } from "@/store/useConfirmStore"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export function ConfirmDialog() {
  const { isOpen, options, close } = useConfirmStore()

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        close(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, close])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={() => close(false)} 
        aria-hidden="true" 
      />
      <div className="relative w-full max-w-md bg-[#0e0e0e] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 z-10">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-2xl shrink-0",
            options.isDestructive 
              ? "bg-red-500/10 text-red-400 border border-red-500/20" 
              : "bg-lume-primary/10 text-lume-primary border border-lume-primary/20"
          )}>
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base font-bold text-white/90">{options.title}</h3>
            <p className="text-xs text-white/50 leading-relaxed">{options.message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => close(false)}
            className="px-4 py-2 text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
          >
            {options.cancelText || "Cancel"}
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            className={cn(
              "px-5 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 shadow-lg",
              options.isDestructive
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                : "bg-lume-primary hover:bg-lume-primary/90 text-black shadow-lume-primary/20"
            )}
          >
            {options.confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  )
}
