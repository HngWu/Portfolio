"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Gauge,
  Box,
  Sparkles,
  Move3d,
  Zap,
  RotateCcw,
  X,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react"
import { usePerformanceStore, type PerformanceToggles } from "@/store/usePerformanceStore"
import { GlassCard } from "@/components/ui/GlassCard"
import { cn } from "@/lib/utils"

interface FeatureItem {
  key: keyof PerformanceToggles
  title: string
  description: string
  activeLabel: string
  disabledLabel: string
  icon: LucideIcon
  impact: "High" | "Medium" | "Low"
}

const FEATURES: FeatureItem[] = [
  {
    key: "enable3DModel",
    title: "3D HexCore Artifact",
    description: "WebGL 3x3 Rubik's pyramid simulation with lightning arcs and particle streams.",
    activeLabel: "Live WebGL Simulation",
    disabledLabel: "Blueprint Mode (0% GPU)",
    icon: Box,
    impact: "High",
  },
  {
    key: "enableBackgroundFx",
    title: "Background Canvas FX",
    description: "Ambient celestial orrery, hextech blueprint, volumetric fog nebulae, and particle streams.",
    activeLabel: "Live 60 FPS Visuals",
    disabledLabel: "Static Backdrop (0% GPU)",
    icon: Sparkles,
    impact: "Medium",
  },
  {
    key: "enableCardTilt",
    title: "3D Perspective Card Tilt",
    description: "Interactive perspective skewing and lighting transforms on bento card hover.",
    activeLabel: "Perspective Tilt Active",
    disabledLabel: "Flat Cards",
    icon: Move3d,
    impact: "Low",
  },
]

function PerformanceModalContent() {
  const fps = usePerformanceStore((s) => s.fps)
  const isLagging = usePerformanceStore((s) => s.isLagging)
  const enable3DModel = usePerformanceStore((s) => s.enable3DModel)
  const enableBackgroundFx = usePerformanceStore((s) => s.enableBackgroundFx)
  const enableCardTilt = usePerformanceStore((s) => s.enableCardTilt)
  const neverShowAutoPrompt = usePerformanceStore((s) => s.neverShowAutoPrompt)
  const setToggle = usePerformanceStore((s) => s.setToggle)
  const optimizeAll = usePerformanceStore((s) => s.optimizeAll)
  const restoreHighQuality = usePerformanceStore((s) => s.restoreHighQuality)
  const dismissPrompt = usePerformanceStore((s) => s.dismissPrompt)

  const [neverShowAgain, setNeverShowAgain] = React.useState(neverShowAutoPrompt)

  React.useEffect(() => {
    setNeverShowAgain(neverShowAutoPrompt)
  }, [neverShowAutoPrompt])

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismissPrompt(neverShowAgain)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [dismissPrompt, neverShowAgain])

  const toggles = {
    enable3DModel,
    enableBackgroundFx,
    enableCardTilt,
  }

  const allOptimized = !enable3DModel && !enableBackgroundFx && !enableCardTilt
  const allMaxQuality = enable3DModel && enableBackgroundFx && enableCardTilt

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 select-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => dismissPrompt(neverShowAgain)}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="relative w-full max-w-xl z-10 max-h-[92dvh] sm:max-h-[88vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="perf-modal-title"
      >
        <GlassCard
          glowColor="mint"
          interactive={false}
          className="p-4 sm:p-7 bg-[#0b0c10]/95 border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden max-h-full"
        >
          {/* Top Accent Light Beam */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-lume-primary/60 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between gap-3 pb-3.5 sm:pb-5 border-b border-white/10 shrink-0">
            <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <div className="p-1 sm:p-1.5 rounded-lg bg-lume-primary/10 border border-lume-primary/30 text-lume-primary shrink-0">
                  <Gauge className="size-3.5 sm:size-4" />
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-lume-primary truncate">
                  Performance Telemetry
                </span>

                {/* Live FPS Tag */}
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[10px] font-medium border shrink-0",
                    fps < 30 || isLagging
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full animate-pulse",
                      fps < 30 || isLagging ? "bg-amber-400" : "bg-emerald-400"
                    )}
                  />
                  <span>{fps} FPS</span>
                  {fps < 30 && <span className="text-[9px] text-amber-400/80">• LAG</span>}
                </div>
              </div>

              <h2 id="perf-modal-title" className="text-base sm:text-xl font-bold text-white tracking-tight">
                {isLagging ? "Optimize Smoothness" : "Graphics & Performance Settings"}
              </h2>
              <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed max-w-md">
                {isLagging
                  ? "We detected frame drops. Toggle off heavy effects below to restore fluid 60 FPS."
                  : "Fine-tune visual fidelity and GPU workload to match your device."}
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => dismissPrompt(neverShowAgain)}
              className="p-1 sm:p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close modal"
            >
              <X className="size-4 sm:size-5" />
            </button>
          </div>

          {/* Feature Toggles List (Scrollable on short screens) */}
          <div className="py-3 sm:py-5 space-y-2.5 sm:space-y-3 overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-1">
            {FEATURES.map((feat) => {
              const Icon = feat.icon
              const isEnabled = toggles[feat.key as keyof typeof toggles]

              return (
                <div
                  key={feat.key}
                  onClick={() => setToggle(feat.key, !isEnabled)}
                  className={cn(
                    "group flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer",
                    isEnabled
                      ? "bg-white/[0.04] border-white/10 hover:border-white/20 hover:bg-white/[0.06]"
                      : "bg-black/30 border-white/5 hover:border-white/10 opacity-70 hover:opacity-90"
                  )}
                >
                  <div className="flex items-start gap-2.5 sm:gap-3.5 pr-2 sm:pr-4 min-w-0 flex-1">
                    <div
                      className={cn(
                        "p-2 sm:p-2.5 rounded-xl border mt-0.5 shrink-0 transition-colors",
                        isEnabled
                          ? "bg-lume-primary/10 border-lume-primary/20 text-lume-primary"
                          : "bg-white/5 border-white/10 text-white/40"
                      )}
                    >
                      <Icon className="size-3.5 sm:size-4" />
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-white/95 group-hover:text-white truncate">
                          {feat.title}
                        </span>
                        <span
                          className={cn(
                            "font-mono text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded border uppercase tracking-wider shrink-0",
                            feat.impact === "High"
                              ? "bg-red-500/10 border-red-500/20 text-red-400"
                              : feat.impact === "Medium"
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          )}
                        >
                          {feat.impact} Impact
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-white/50 leading-snug sm:leading-relaxed line-clamp-2">
                        {feat.description}
                      </p>
                      <span className="inline-block font-mono text-[9px] sm:text-[10px] text-white/40 truncate">
                        Status:{" "}
                        <span className={isEnabled ? "text-lume-primary" : "text-amber-300/80"}>
                          {isEnabled ? feat.activeLabel : feat.disabledLabel}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Switch Element */}
                  <div className="shrink-0 flex items-center ml-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isEnabled}
                      onClick={(e) => {
                        e.stopPropagation()
                        setToggle(feat.key, !isEnabled)
                      }}
                      className={cn(
                        "relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-lume-primary/50",
                        isEnabled ? "bg-lume-primary" : "bg-white/15"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block size-3.5 sm:size-4 transform rounded-full bg-black shadow-md transition-transform duration-200 ease-in-out",
                          isEnabled ? "translate-x-4.5 sm:translate-x-6 bg-[#050505]" : "translate-x-0.5 sm:translate-x-1 bg-white/70"
                        )}
                      />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Actions & Footer */}
          <div className="pt-3 sm:pt-4 border-t border-white/10 space-y-3 sm:space-y-4 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              {/* Preset Shortcuts */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                <button
                  type="button"
                  onClick={optimizeAll}
                  disabled={allOptimized}
                  className={cn(
                    "inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-mono text-[11px] sm:text-xs font-semibold border transition-all active:scale-95",
                    allOptimized
                      ? "bg-white/5 border-white/5 text-white/30 cursor-not-allowed"
                      : "bg-lume-primary/15 border-lume-primary/40 text-lume-primary hover:bg-lume-primary/25 shadow-[0_0_15px_rgba(74,255,180,0.15)]"
                  )}
                >
                  <Zap className="size-3 sm:size-3.5" />
                  <span>Optimize All</span>
                </button>

                <button
                  type="button"
                  onClick={restoreHighQuality}
                  disabled={allMaxQuality}
                  className={cn(
                    "inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-mono text-[11px] sm:text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all active:scale-95",
                    allMaxQuality && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <RotateCcw className="size-3" />
                  <span>Max Quality</span>
                </button>
              </div>

              {/* Apply & Close */}
              <button
                type="button"
                onClick={() => dismissPrompt(neverShowAgain)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-white hover:bg-white/90 text-black font-semibold text-xs transition-all active:scale-95 shadow-lg shadow-white/10 cursor-pointer"
              >
                <CheckCircle2 className="size-3.5" />
                <span>Apply & Close</span>
              </button>
            </div>

            {/* Never Show Again Preference */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-0.5 sm:pt-1 text-[10px] sm:text-[11px] text-white/40 font-mono">
              <label className="flex items-center gap-2 cursor-pointer hover:text-white/60 transition-colors">
                <input
                  type="checkbox"
                  checked={neverShowAgain}
                  onChange={(e) => setNeverShowAgain(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-lume-primary focus:ring-0 focus:ring-offset-0 cursor-pointer size-3.5 shrink-0"
                />
                <span className="truncate">Don&apos;t prompt automatically again</span>
              </label>
              <span className="hidden sm:inline text-white/30">Reopen via Navbar or ⌘K</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export function PerformanceModal() {
  const isPromptOpen = usePerformanceStore((s) => s.isPromptOpen)

  return (
    <AnimatePresence>
      {isPromptOpen && <PerformanceModalContent />}
    </AnimatePresence>
  )
}
