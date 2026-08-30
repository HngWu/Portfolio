import * as React from "react"

export default function DetailedItemsLoading() {
  return (
    <div className="space-y-6 pb-20 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-56 bg-white/15 rounded-xl" />
            <div className="h-5 w-16 bg-white/5 border border-white/5 rounded-full" />
          </div>
          <div className="h-4 w-72 sm:w-96 bg-white/5 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-lume-primary/20 border border-lume-primary/30 rounded-xl" />
      </div>

      {/* Filter Tabs & Search Bar Skeleton */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center p-2 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-xl">
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 gap-1 overflow-x-auto scrollbar-none">
          {["All Entries", "Experience", "Education", "Projects", "Custom"].map((tab, idx) => (
            <div
              key={tab}
              className={`h-7 px-3.5 rounded-lg ${
                idx === 0
                  ? "w-24 bg-lume-primary/15 border border-lume-primary/30"
                  : "w-20 bg-white/5"
              }`}
            />
          ))}
        </div>

        <div className="h-9 min-w-[240px] bg-black/50 border border-white/10 rounded-xl" />
      </div>

      {/* Items List Skeleton */}
      <div className="grid gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
              <div className="size-9 rounded-xl bg-white/5 border border-white/5 shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="h-4 w-36 sm:w-48 bg-white/15 rounded" />
                  <div className="h-4 w-16 bg-lume-primary/10 border border-lume-primary/20 rounded" />
                  <div className="h-3.5 w-24 bg-white/5 rounded" />
                </div>
                <div className="h-3 w-full max-w-sm bg-white/5 rounded" />
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 shrink-0">
              <div className="h-8 w-16 rounded-xl bg-white/5 border border-white/5" />
              <div className="size-8 rounded-xl bg-red-500/10 border border-red-500/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
