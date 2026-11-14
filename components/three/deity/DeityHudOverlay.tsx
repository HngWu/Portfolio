"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDeityControls, DeityMode } from "@/store/useDeityControls"
import { useViewModeStore } from "@/store/useViewModeStore"
import {
  LucideIcon,
  Eye,
  EyeOff,
  Radio,
  Zap,
  Box,
  Compass,
  Sparkles,
  RotateCcw,
} from "lucide-react"

const MODES: { id: DeityMode; label: string; icon: LucideIcon }[] = [
  { id: "OBSERVER", label: "OBSERVER", icon: Compass },
  { id: "SWARM COMMAND", label: "SWARM", icon: Radio },
  { id: "OVERDRIVE", label: "OVERDRIVE", icon: Zap },
  { id: "CAD SCHEMATIC", label: "CAD", icon: Box },
  { id: "PURE SHOWCASE", label: "SHOWCASE", icon: Eye },
]

export function DeityHudOverlay() {
  const mode = useDeityControls((s) => s.mode)
  const setMode = useDeityControls((s) => s.setMode)
  const triggerShockwave = useDeityControls((s) => s.triggerShockwave)
  const triggerAssembly = useDeityControls((s) => s.triggerAssembly)
  const isAssembling = useDeityControls((s) => s.isAssembling)
  const assemblyProgress = useDeityControls((s) => s.assemblyProgress)
  const viewMode = useViewModeStore((s) => s.mode)
  const isDeepDive = viewMode === "deep"

  const isPureShowcase = mode === "PURE SHOWCASE"

  return (
    <div className="absolute inset-x-0 bottom-6 sm:bottom-10 z-30 pointer-events-none flex flex-col items-center justify-end px-4">
      {/* ────────────────────────────────────────────────────────── */}
      {/* Minimized Reveal Pill (Only visible in PURE SHOWCASE mode) */}
      {/* ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isPureShowcase && (
          <motion.button
            key="restore-hud-btn"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={() => setMode("OBSERVER")}
            className="pointer-events-auto px-4 py-2 rounded-full bg-[rgba(13,16,23,0.85)] border border-white/20 backdrop-blur-xl text-white/90 text-xs font-mono flex items-center gap-2 hover:bg-white/10 hover:border-lume-primary transition-all shadow-[0_8px_32px_rgba(0,0,0,0.6)] cursor-pointer group"
          >
            <EyeOff className="size-3.5 text-lume-primary group-hover:scale-110 transition-transform" />
            <span>EXIT PURE SHOWCASE</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Main HUD Bar (Visible in all interactive modes)             */}
      {/* ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isPureShowcase && (
          <motion.div
            key="main-hud-panel"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex flex-col items-center gap-3 max-w-full"
          >
            {/* Top Telemetry Ticker */}
            <div className="flex items-center gap-3 sm:gap-5 text-[10px] font-mono tracking-wider text-white/50 bg-[rgba(13,16,23,0.6)] border border-white/10 px-4 py-1 rounded-full backdrop-blur-md">
              <span className="flex items-center gap-1.5">
                <span
                  className={`size-1.5 rounded-full ${
                    isAssembling
                      ? "bg-yellow-400 animate-ping"
                      : isDeepDive
                      ? "bg-[#00F0FF] animate-pulse"
                      : "bg-[#F5B041] animate-pulse"
                  }`}
                />
                CORE:{" "}
                <strong className="text-white/85">
                  {isAssembling ? "IGNITING" : "ACTIVE"}
                </strong>
              </span>
              <span className="hidden sm:inline">
                FORMATION:{" "}
                <strong className={isAssembling ? "text-yellow-400" : "text-white/85"}>
                  {Math.round(assemblyProgress * 100)}%
                </strong>
              </span>
              <span className="hidden md:inline">
                SWARM: <strong className="text-white/85">1,250 NODES</strong>
              </span>
              <span>
                MODE:{" "}
                <strong className={isDeepDive ? "text-[#00F0FF]" : "text-[#F5B041]"}>
                  {mode}
                </strong>
              </span>
            </div>

            {/* Central Controls Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-[rgba(13,16,23,0.78)] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
              {/* State Pills */}
              {MODES.map((item) => {
                const isActive = mode === item.id
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setMode(item.id)}
                    className={`relative px-3 sm:px-4 py-2 rounded-xl text-xs font-mono transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? isDeepDive
                          ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                          : "bg-[#F5B041]/15 text-[#F5B041] border border-[#F5B041]/40 shadow-[0_0_20px_rgba(245,176,65,0.2)]"
                        : "text-white/60 hover:text-white/90 hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span className="hidden sm:inline font-medium tracking-wide">
                      {item.label}
                    </span>
                  </button>
                )
              })}

              <div className="w-[1px] h-5 bg-white/15 mx-1 hidden sm:block" />

              {/* Gravitational Shockwave Button */}
              <button
                onClick={() => triggerShockwave()}
                title="Dispatch Singularity Force Pulse"
                className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all duration-300 cursor-pointer ${
                  isDeepDive
                    ? "border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/10 active:scale-95"
                    : "border-[#F5B041]/30 text-[#F5B041] hover:bg-[#F5B041]/10 active:scale-95"
                }`}
              >
                <Sparkles className="size-3.5 animate-spin-slow" />
                <span className="hidden md:inline font-semibold tracking-wider">
                  PULSE
                </span>
              </button>

              {/* Re-Assemble / Genesis Assembly Button */}
              <button
                onClick={() => triggerAssembly()}
                disabled={isAssembling}
                title="Replay Genesis Assembly Sequence"
                className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all duration-300 cursor-pointer ${
                  isAssembling
                    ? "border-yellow-400/50 text-yellow-400 bg-yellow-400/10"
                    : "border-white/15 text-white/60 hover:text-white/90 hover:bg-white/5 active:scale-95"
                }`}
              >
                <RotateCcw
                  className={`size-3.5 ${isAssembling ? "animate-spin" : ""}`}
                />
                <span className="hidden lg:inline font-semibold tracking-wider">
                  {isAssembling ? "FORMING..." : "RE-ASSEMBLE"}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
