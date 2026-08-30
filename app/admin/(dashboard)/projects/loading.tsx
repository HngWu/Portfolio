import * as React from "react"

export default function ProjectsLoading() {
  return (
    <div className="space-y-6 pb-20 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-48 bg-white/15 rounded-xl" />
            <div className="h-5 w-16 bg-white/5 border border-white/5 rounded-full" />
          </div>
          <div className="h-4 w-72 sm:w-96 bg-white/5 rounded-lg" />
        </div>

        <div className="h-10 w-36 bg-lume-primary/20 border border-lume-primary/30 rounded-xl" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-xl">
        <div className="relative w-full max-w-md">
          <div className="h-9 w-full bg-black/50 border border-white/10 rounded-xl" />
        </div>
      </div>

      {/* Projects List Skeleton */}
      <div className="grid gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
              <div className="size-9 rounded-xl bg-white/5 border border-white/5 shrink-0" />

              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-4 w-32 sm:w-44 bg-white/15 rounded" />
                  {i % 2 === 1 && (
                    <div className="h-4 w-16 bg-lume-primary/10 border border-lume-primary/20 rounded" />
                  )}
                </div>

                <div className="h-3 w-full max-w-md bg-white/5 rounded" />

                <div className="flex items-center gap-1.5 pt-0.5">
                  <div className="h-4 w-12 bg-white/5 rounded" />
                  <div className="h-4 w-16 bg-white/5 rounded" />
                  <div className="h-4 w-14 bg-white/5 rounded" />
                </div>
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 shrink-0">
              <div className="size-8 rounded-xl bg-white/5 border border-white/5" />
              <div className="size-8 rounded-xl bg-white/5 border border-white/5" />
              <div className="h-8 w-16 rounded-xl bg-white/5 border border-white/5" />
              <div className="size-8 rounded-xl bg-red-500/10 border border-red-500/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
