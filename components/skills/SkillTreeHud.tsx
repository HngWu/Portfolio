"use client"

import * as React from "react"
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import type { SkillCategory, SkillCategoryDef } from "@/types/skill-tree"

export interface SkillTreeHudProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
  selectedCategory: SkillCategory | "all"
  onSelectCategory: (category: SkillCategory | "all") => void
  categories: SkillCategoryDef[]
  activeView: "graph" | "roadmap"
  onToggleView: (view: "graph" | "roadmap") => void
}

export function SkillTreeHud({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  selectedCategory,
  onSelectCategory,
  categories,
  activeView,
  onToggleView,
}: SkillTreeHudProps) {
  return (
    <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none">
      {/* Category Filter Pills & View Switcher */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onSelectCategory("all")}
          className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-200 border cursor-pointer ${
            selectedCategory === "all"
              ? "bg-white/15 border-white/30 text-white shadow-sm"
              : "bg-white/[0.03] border-white/10 text-white/50 hover:text-white/80"
          }`}
        >
          All Domains
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? "bg-white/15 shadow-sm"
                  : "bg-white/[0.03] border-white/10 text-white/50 hover:text-white/80"
              }`}
              style={{
                borderColor: isSelected ? cat.color : undefined,
                color: isSelected ? cat.color : undefined,
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{
                  backgroundColor: cat.color,
                  boxShadow: isSelected ? `0 0 6px ${cat.color}` : undefined,
                }}
              />
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Right Controls: View Switcher & Zoom Controls */}
      <div className="flex items-center gap-3 self-end md:self-auto">
        {/* View Toggle */}
        <div className="inline-flex rounded-lg bg-white/[0.04] p-1 border border-white/10">
          <button
            type="button"
            onClick={() => onToggleView("graph")}
            className={`px-3 py-1 text-xs font-mono uppercase rounded-md transition-colors cursor-pointer ${
              activeView === "graph"
                ? "bg-white/15 text-white font-medium"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            Graph
          </button>
          <button
            type="button"
            onClick={() => onToggleView("roadmap")}
            className={`px-3 py-1 text-xs font-mono uppercase rounded-md transition-colors cursor-pointer ${
              activeView === "roadmap"
                ? "bg-white/15 text-white font-medium"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            Roadmap
          </button>
        </div>

        {/* Zoom Controls (Graph View Only) */}
        {activeView === "graph" && (
          <div className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-white/[0.04] p-1 border border-white/10">
            <button
              type="button"
              onClick={onZoomOut}
              aria-label="Zoom out"
              title="Zoom Out"
              className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <span className="text-[11px] font-mono text-white/50 px-1 min-w-[38px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={onZoomIn}
              aria-label="Zoom in"
              title="Zoom In"
              className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ZoomIn className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={onResetView}
              aria-label="Reset viewport"
              title="Reset View"
              className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-0.5"
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
