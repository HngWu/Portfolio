"use client"

import React, { useState } from "react"
import ShatteredMonolithCanvas from "@/components/bento/tiles/monolith/ShatteredMonolithCanvas"
import { Sparkles, Zap, ShieldAlert, Flame, Compass, Maximize2, RefreshCw } from "lucide-react"

export default function MonolithTestPage() {
  const [isActive, setIsActive] = useState(false)
  const [viewMode, setViewMode] = useState<"quick-pitch" | "deep-dive">("quick-pitch")
  const [isIgnited, setIsIgnited] = useState(false)
  const [isLockdown, setIsLockdown] = useState(false)
  const [shatterImpulse, setShatterImpulse] = useState(0)
  const [telemetry, setTelemetry] = useState({
    shardCount: 18,
    tension: 0,
    activeArcs: 14,
  })

  const triggerShatter = () => {
    if (isLockdown) return
    setShatterImpulse(1.4)
    setTimeout(() => {
      setShatterImpulse(0)
    }, 450)
  }

  return (
    <div className="relative w-screen h-screen bg-[#07090e] overflow-hidden flex flex-col font-sans select-none text-slate-100">
      {/* Background Decorative Tech Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0f_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0f_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_#34d399]" />
          <div>
            <h1 className="text-sm font-semibold tracking-wider uppercase text-white/90">
              Shattered Magnetic Monolith
            </h1>
            <p className="text-xs text-white/50">
              Tension-Locked Core Lab &bull; Model 4 &bull; Procedural 3D Shards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-white/70">
            {viewMode === "quick-pitch" ? "Gold Resonance (#ffb44a)" : "Emerald Teal Resonance (#4AFFB4)"}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
            Isolated Preview &bull; PolyhedronCanvas Untouched
          </span>
        </div>
      </header>

      {/* Main Interactive 3D Canvas Area */}
      <div className="relative flex-1 w-full h-full">
        <ShatteredMonolithCanvas
          isActive={isActive}
          viewMode={viewMode}
          isIgnited={isIgnited}
          isLockdown={isLockdown}
          shatterImpulse={shatterImpulse}
          onTelemetry={setTelemetry}
        />

        {/* HUD Telemetry Overlay (Top Left) */}
        <div className="absolute top-6 left-6 z-10 p-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md w-72 pointer-events-none space-y-2">
          <div className="flex items-center justify-between text-xs text-white/60 border-b border-white/10 pb-2">
            <span className="font-mono uppercase tracking-wider">Telemetry Core</span>
            <span className="text-emerald-400 font-mono">60 FPS</span>
          </div>

          <div className="space-y-1 text-xs font-mono text-white/80">
            <div className="flex justify-between">
              <span className="text-white/50">Geometry:</span>
              <span>Hexagonal Bipyramid</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Shard Count:</span>
              <span className="text-amber-300">{telemetry.shardCount} Razor Shards</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Center Core:</span>
              <span className="text-cyan-300">Negative Hollow Space</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Tension State:</span>
              <span className={isActive ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                {isActive ? "LOCKED (Spring Snap)" : "IDLE (Drifting)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Exterior PBR:</span>
              <span>Rough Basalt Stone (0.88)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Interior Facets:</span>
              <span>Mirror-Sheen + FBM Caustics</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Micro-Arcs:</span>
              <span className={isLockdown ? "text-red-400" : "text-emerald-400"}>
                {isLockdown ? "Halted (EMP)" : `${telemetry.activeArcs} Dynamic Arcs`}
              </span>
            </div>
          </div>
        </div>

        {/* Floating Instruction Hint (Bottom Center) */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full border border-white/10 bg-black/50 backdrop-blur-md text-xs text-white/70 pointer-events-none flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-white/40" />
          <span>Move cursor across the viewport to observe magnetic spring tilt and facet reflections</span>
        </div>

        {/* HUD Interactive Controls Panel (Bottom Floating Bar) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-wrap items-center gap-3 p-3 rounded-2xl border border-white/15 bg-black/60 backdrop-blur-xl shadow-2xl">
          {/* Tension State Switch */}
          <button
            onClick={() => setIsActive(!isActive)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isActive
                ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)] font-bold scale-105"
                : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isActive ? "text-black fill-current" : "text-amber-400"}`} />
            {isActive ? "Active (Tension Locked)" : "Idle (Drifting Apart)"}
          </button>

          <div className="w-[1px] h-6 bg-white/15 mx-1" />

          {/* Mode Switch: Quick-Pitch vs Deep Dive */}
          <button
            onClick={() => setViewMode(viewMode === "quick-pitch" ? "deep-dive" : "quick-pitch")}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all border ${
              viewMode === "deep-dive"
                ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                : "bg-amber-950/60 border-amber-500/50 text-amber-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Mode: {viewMode === "quick-pitch" ? "Quick Pitch (Gold)" : "Deep Dive (Teal)"}
          </button>

          <div className="w-[1px] h-6 bg-white/15 mx-1" />

          {/* Spell: Ignite Overload */}
          <button
            onClick={() => {
              if (isLockdown) return
              setIsIgnited(!isIgnited)
            }}
            disabled={isLockdown}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
              isIgnited
                ? "bg-orange-600 border-orange-400 text-white shadow-[0_0_15px_rgba(249,115,22,0.6)] font-bold"
                : "bg-white/5 hover:bg-white/10 text-white/80 border-white/10 disabled:opacity-30"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Ignite Overload
          </button>

          {/* Spell: Lockdown EMP */}
          <button
            onClick={() => {
              const next = !isLockdown
              setIsLockdown(next)
              if (next) setIsIgnited(false)
            }}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
              isLockdown
                ? "bg-slate-700 border-slate-500 text-white shadow-[0_0_15px_rgba(100,116,139,0.5)] font-bold"
                : "bg-white/5 hover:bg-white/10 text-white/80 border-white/10"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            Lockdown EMP
          </button>

          <div className="w-[1px] h-6 bg-white/15 mx-1" />

          {/* Shatter Shockwave Impulse */}
          <button
            onClick={triggerShatter}
            disabled={isLockdown}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 border border-white/15 transition-all disabled:opacity-30"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            Shatter Impulse
          </button>
        </div>
      </div>
    </div>
  )
}
