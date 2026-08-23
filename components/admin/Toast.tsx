"use client"

import * as React from "react"
import { useToastStore } from "@/store/useToastStore"
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />,
          error: <AlertCircle className="size-4 text-red-400 shrink-0" />,
          warning: <AlertTriangle className="size-4 text-amber-400 shrink-0" />,
          info: <Info className="size-4 text-lume-primary shrink-0" />
        }

        const borderStyles = {
          success: "border-emerald-500/30 bg-[#0c1a12]/90 shadow-[0_10px_30px_rgba(16,185,129,0.15)]",
          error: "border-red-500/30 bg-[#1c0c0c]/90 shadow-[0_10px_30px_rgba(239,68,68,0.15)]",
          warning: "border-amber-500/30 bg-[#1c1608]/90 shadow-[0_10px_30px_rgba(245,158,11,0.15)]",
          info: "border-lume-primary/30 bg-[#081711]/90 shadow-[0_10px_30px_rgba(74,255,180,0.15)]"
        }

        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl border backdrop-blur-2xl shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-3 duration-300",
              borderStyles[toast.type]
            )}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {icons[toast.type]}
              <span className="text-xs text-white/90 font-medium leading-relaxed truncate">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-white/40 hover:text-white rounded-lg transition-colors shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
