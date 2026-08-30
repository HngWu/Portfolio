import * as React from "react"
import { Cpu } from "lucide-react"

export default function TilesLoading() {
  return (
    <div className="space-y-6 pb-36 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-52 bg-white/15 rounded-xl" />
            <div className="h-5 w-16 bg-white/5 border border-white/5 rounded-full" />
          </div>
          <div className="h-4 w-72 sm:w-96 bg-white/5 rounded-lg" />
        </div>

        <div className="h-10 w-36 bg-white/5 border border-white/10 rounded-xl" />
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center p-2 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode 1: Canvas vs List View */}
          <div className="flex p-1 bg-black/40 border border-white/10 rounded-xl gap-1">
            <div className="h-7 w-28 bg-white/10 rounded-lg" />
            <div className="h-7 w-28 bg-white/5 rounded-lg" />
          </div>

          {/* Mode 2: Desktop vs Mobile */}
          <div className="flex p-1 bg-black/40 border border-white/10 rounded-xl gap-1">
            <div className="h-7 w-20 bg-white/10 rounded-lg" />
            <div className="h-7 w-20 bg-white/5 rounded-lg" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="h-9 min-w-[220px] bg-black/50 border border-white/10 rounded-xl" />
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <div className="h-3 w-12 bg-white/10 rounded mr-1" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className={`h-6 rounded-lg ${
              i === 1
                ? "w-14 bg-lume-primary/15 border border-lume-primary/30"
                : "w-16 bg-white/[0.02] border border-white/5"
            }`}
          />
        ))}
      </div>

      {/* Canvas Skeleton with Pulsing Lume Loader & Telemetry */}
      <div className="relative w-full border border-white/5 rounded-3xl bg-[#050505] min-h-[600px] sm:min-h-[750px] overflow-hidden p-6 sm:p-10 flex flex-col items-center justify-center shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        {/* Background Grid Lines Blueprint */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: "linear-gradient(#4AFFB4 1px, transparent 1px), linear-gradient(90deg, #4AFFB4 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />

        {/* Pulsing Lume Loader */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-sm mx-auto">
          <div className="relative flex items-center justify-center">
            {/* Outer Glow Ring */}
            <div className="size-20 rounded-2xl bg-lume-primary/10 border border-lume-primary/30 animate-ping absolute" />
            <div className="size-16 rounded-2xl bg-black/80 border border-lume-primary/40 backdrop-blur-xl flex items-center justify-center shadow-[0_0_30px_rgba(74,255,180,0.2)]">
              <Cpu className="size-7 text-lume-primary animate-pulse" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-display text-white tracking-wide">
              Loading Grid Layout...
            </h3>
            <p className="text-xs font-mono text-lume-primary/70">
              Synchronizing Bento stream telemetry & coordinates
            </p>
          </div>

          {/* Simulated telemetry ticker */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-mono text-white/50">
            <span className="size-1.5 rounded-full bg-lume-primary animate-pulse" />
            <span>FETCHING TILE_TOPOLOGY.SQLITE</span>
          </div>
        </div>

        {/* Ghost Grid Tile Cards in Background */}
        <div className="absolute inset-6 sm:inset-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-15 pointer-events-none">
          <div className="col-span-1 md:col-span-2 row-span-2 rounded-2xl border border-white/10 bg-white/[0.02]" />
          <div className="col-span-1 rounded-2xl border border-white/10 bg-white/[0.02]" />
          <div className="col-span-1 rounded-2xl border border-white/10 bg-white/[0.02]" />
          <div className="col-span-1 md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02]" />
          <div className="col-span-1 rounded-2xl border border-white/10 bg-white/[0.02]" />
          <div className="col-span-1 rounded-2xl border border-white/10 bg-white/[0.02]" />
        </div>
      </div>
    </div>
  )
}
