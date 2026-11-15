"use client"

import * as React from "react"
import { ZoomIn, ZoomOut, Maximize2, Volume2, VolumeX } from "lucide-react"
import type { CelestialHouse, CelestialHouseDef, SkillCategoryDef } from "@/types/skill-tree"
import { playBrassClick } from "@/lib/skills/astrolabeAudio"

export interface AstrolabeHudProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
  selectedHouse: CelestialHouse | "all"
  onSelectHouse: (house: CelestialHouse | "all") => void
  houses: (CelestialHouseDef | SkillCategoryDef)[]
  activeView: "astrolabe" | "grimoire"
  onToggleView: (view: "astrolabe" | "grimoire") => void
  isMuted: boolean
  onToggleMute: () => void
}

export function AstrolabeHud({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  selectedHouse,
  onSelectHouse,
  houses,
  activeView,
  onToggleView,
  isMuted,
  onToggleMute,
}: AstrolabeHudProps) {
  const handleHouseSelect = (house: CelestialHouse | "all") => {
    playBrassClick(isMuted)
    onSelectHouse(house)
  }

  const handleToggleView = (view: "astrolabe" | "grimoire") => {
    playBrassClick(isMuted)
    onToggleView(view)
  }

  const handleZoomIn = () => {
    playBrassClick(isMuted)
    onZoomIn()
  }

  const handleZoomOut = () => {
    playBrassClick(isMuted)
    onZoomOut()
  }

  const handleResetView = () => {
    playBrassClick(isMuted)
    onResetView()
  }

  const handleToggleMute = () => {
    // Play tactile feedback on both muting and unmuting
    playBrassClick(false)
    onToggleMute()
  }

  return (
    <nav
      aria-label="Celestial Astrolabe Controls"
      className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none"
    >
      {/* House Filter Pills (Left) */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleHouseSelect("all")}
          className={`px-3.5 py-1.5 min-h-[38px] rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-200 border cursor-pointer ${
            selectedHouse === "all"
              ? "bg-white/15 border-white/40 text-white shadow-[0_0_12px_rgba(255,255,255,0.2)] font-medium"
              : "bg-white/[0.03] border-white/10 text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
          }`}
          aria-pressed={selectedHouse === "all"}
        >
          All Constellations
        </button>

        {houses.map((house) => {
          const isSelected = selectedHouse === house.id
          return (
            <button
              type="button"
              key={house.id}
              onClick={() => handleHouseSelect(house.id as CelestialHouse)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 min-h-[38px] rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? "bg-white/15 shadow-sm font-medium"
                  : "bg-white/[0.03] border-white/10 text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
              }`}
              style={{
                borderColor: isSelected ? house.color : undefined,
                color: isSelected ? house.color : undefined,
                boxShadow: isSelected ? `0 0 14px ${house.color}40` : undefined,
              }}
              aria-pressed={isSelected}
            >
              <span
                className="size-2 rounded-full transition-shadow duration-200"
                style={{
                  backgroundColor: house.color,
                  boxShadow: isSelected
                    ? `0 0 8px ${house.color}, 0 0 14px ${house.color}`
                    : `0 0 4px ${house.color}80`,
                }}
                aria-hidden="true"
              />
              <span>{house.label}</span>
            </button>
          )
        })}
      </div>

      {/* Right Controls: View Switcher, Zoom Controls, Audio Toggle */}
      <div className="flex items-center gap-2.5 self-end md:self-auto">
        {/* View Toggle */}
        <div className="inline-flex rounded-lg bg-white/[0.04] p-1 border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => handleToggleView("astrolabe")}
            className={`px-3 py-1.5 min-h-[32px] text-xs font-mono uppercase tracking-wider rounded-md transition-all cursor-pointer ${
              activeView === "astrolabe"
                ? "bg-white/15 text-white font-medium shadow-sm"
                : "text-white/40 hover:text-white/70"
            }`}
            aria-pressed={activeView === "astrolabe"}
          >
            Astrolabe
          </button>
          <button
            type="button"
            onClick={() => handleToggleView("grimoire")}
            className={`px-3 py-1.5 min-h-[32px] text-xs font-mono uppercase tracking-wider rounded-md transition-all cursor-pointer ${
              activeView === "grimoire"
                ? "bg-white/15 text-white font-medium shadow-sm"
                : "text-white/40 hover:text-white/70"
            }`}
            aria-pressed={activeView === "grimoire"}
          >
            Grimoire
          </button>
        </div>

        {/* Zoom Controls (Astrolabe View Only) */}
        {activeView === "astrolabe" && (
          <div className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] p-1 border border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom out astrolabe"
              title="Zoom Out"
              className="p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <span
              className="text-[11px] font-mono text-white/60 px-1.5 min-w-[42px] text-center"
              aria-live="polite"
              aria-atomic="true"
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in astrolabe"
              title="Zoom In"
              className="p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ZoomIn className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              aria-label="Reset celestial astrolabe view"
              title="Reset Astrolabe"
              className="p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-0.5 border-l border-white/10 pl-2"
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        )}

        {/* Audio Toggle */}
        <button
          type="button"
          onClick={handleToggleMute}
          aria-label={isMuted ? "Unmute celestial resonance" : "Mute celestial resonance"}
          title={isMuted ? "Unmute Astrolabe Audio" : "Mute Astrolabe Audio"}
          className={`p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg border transition-all cursor-pointer backdrop-blur-md ${
            isMuted
              ? "bg-white/[0.03] border-white/10 text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
              : "bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:bg-amber-500/20"
          }`}
          aria-pressed={!isMuted}
        >
          {isMuted ? (
            <VolumeX className="size-4" />
          ) : (
            <Volume2 className="size-4 animate-pulse" />
          )}
        </button>
      </div>
    </nav>
  )
}
