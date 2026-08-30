import * as React from "react"
import { Settings2 } from "lucide-react"

export default function ConfigLoading() {
  return (
    <div className="space-y-6 pb-20 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-64 bg-white/15 rounded-xl" />
          <div className="h-5 w-16 bg-white/5 border border-white/5 rounded-full" />
        </div>
        <div className="h-4 w-72 sm:w-96 bg-white/5 rounded-lg" />
      </div>

      {/* Config Items Skeleton */}
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 sm:p-6 space-y-4 bg-white/[0.01] border border-white/5 rounded-2xl"
          >
            {/* Card Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3.5">
              <div className="flex items-center gap-2.5">
                <Settings2 className="size-4 text-lume-primary/40" />
                <div className="h-4 w-32 bg-white/15 rounded font-mono" />
                <div className="h-4 w-20 bg-emerald-500/10 border border-emerald-500/20 rounded" />
              </div>

              <div className="flex items-center gap-2">
                <div className="h-7 w-16 bg-white/5 border border-white/5 rounded-xl" />
                <div className="h-7 w-20 bg-white/5 border border-white/5 rounded-xl" />
                <div className="h-7 w-16 bg-lume-primary/20 border border-lume-primary/30 rounded-xl" />
              </div>
            </div>

            {/* CodeMirror Mockup Placeholder */}
            <div className="border border-white/10 rounded-2xl p-4 bg-black/60 font-mono space-y-2.5">
              <div className="flex items-center gap-4">
                <span className="text-white/20 text-xs select-none">1</span>
                <div className="h-3.5 w-12 bg-blue-400/20 rounded" />
              </div>
              <div className="flex items-center gap-4 pl-4">
                <span className="text-white/20 text-xs select-none">2</span>
                <div className="h-3.5 w-28 bg-lume-primary/20 rounded" />
                <div className="h-3.5 w-36 bg-amber-400/20 rounded" />
              </div>
              <div className="flex items-center gap-4 pl-4">
                <span className="text-white/20 text-xs select-none">3</span>
                <div className="h-3.5 w-24 bg-lume-primary/20 rounded" />
                <div className="h-3.5 w-48 bg-purple-400/20 rounded" />
              </div>
              <div className="flex items-center gap-4 pl-4">
                <span className="text-white/20 text-xs select-none">4</span>
                <div className="h-3.5 w-20 bg-lume-primary/20 rounded" />
                <div className="h-3.5 w-16 bg-emerald-400/20 rounded" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white/20 text-xs select-none">5</span>
                <div className="h-3.5 w-8 bg-blue-400/20 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
