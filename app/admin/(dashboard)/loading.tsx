import * as React from "react"
import { Sparkles, Activity, Layers } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Welcome Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-r from-lume-primary/[0.04] via-transparent to-blue-500/[0.04] border border-white/5 rounded-3xl backdrop-blur-xl">
        <div className="space-y-3 flex-1">
          <div className="inline-flex items-center gap-2">
            <div className="h-5 w-36 bg-lume-primary/10 border border-lume-primary/20 rounded-full" />
          </div>
          <div className="h-8 w-64 sm:w-80 bg-white/10 rounded-xl" />
          <div className="h-4 w-full max-w-md bg-white/5 rounded-lg" />
        </div>
        <div className="h-10 w-40 bg-lume-primary/20 border border-lume-primary/30 rounded-xl shrink-0" />
      </div>

      {/* Quick Actions Hub Skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <Sparkles className="size-3 text-lume-primary/40" />
          <div className="h-3.5 w-28 bg-white/10 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between space-y-4 h-36"
            >
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-xl bg-white/5 border border-white/5" />
                <div className="size-4 rounded bg-white/5" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 bg-white/10 rounded" />
                <div className="h-3 w-40 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid Skeleton */}
      <div>
        <div className="mb-4 px-1">
          <div className="h-3.5 w-32 bg-white/10 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-2xl"
            >
              <div className="size-11 rounded-2xl bg-lume-primary/10 border border-lume-primary/20 shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-2.5 w-16 bg-white/10 rounded" />
                <div className="h-7 w-12 bg-white/20 rounded" />
                <div className="h-2.5 w-24 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Infrastructure & Active Tiles Snapshot Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status Card */}
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-6 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <Activity className="size-4 text-lume-primary/40" />
              <div className="h-4 w-24 bg-white/10 rounded" />
            </div>
            <div className="h-5 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5"
              >
                <div className="h-3 w-28 bg-white/10 rounded" />
                <div className="h-3 w-24 bg-lume-primary/10 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Active Tiles Snapshot */}
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <Layers className="size-4 text-blue-400/40" />
              <div className="h-4 w-36 bg-white/10 rounded" />
            </div>
            <div className="h-3 w-14 bg-white/10 rounded" />
          </div>

          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="size-7 rounded-lg bg-white/5 shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="h-3.5 w-16 bg-white/15 rounded" />
                      <div className="h-3 w-8 bg-white/5 rounded" />
                    </div>
                    <div className="h-2.5 w-32 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="size-7 rounded-lg bg-white/5 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
