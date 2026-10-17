"use client"

import * as React from "react"
import Link from "next/link"
import { usePageTransition } from "@/hooks/usePageTransition"
import { cn } from "@/lib/utils"
import type { LayoutType, SortOption } from "@/lib/projects/types"
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  CircleDot,
  Dna,
  LayoutGrid,
  List,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"

interface DiscoveryBarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  selectedLanguage: string
  onLanguageChange: (lang: string) => void
  availableLanguages: string[]
  selectedStatus: string
  onStatusChange: (status: string) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  layoutType: LayoutType
  onLayoutChange: (layout: LayoutType) => void
  isListView: boolean
  onToggleListView: () => void
  isAudioMuted: boolean
  onToggleAudio: () => void
  totalCount: number
  filteredCount: number
}

export function DiscoveryBar({
  searchQuery,
  onSearchChange,
  selectedLanguage,
  onLanguageChange,
  availableLanguages,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  layoutType,
  onLayoutChange,
  isListView,
  onToggleListView,
  isAudioMuted,
  onToggleAudio,
  totalCount,
  filteredCount,
}: DiscoveryBarProps) {
  const { navigateWithTransition } = usePageTransition()
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Global '/' shortcut to focus search input
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)

      if (e.key === "/" && !isTyping) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 px-2 select-none z-30 relative">
      {/* Top Search & Layout Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Back to Home Button */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault()
            navigateWithTransition("/")
          }}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0e0f14]/80 backdrop-blur-md text-white/70 hover:text-white hover:border-white/20 transition-all active:scale-95 text-xs font-mono shrink-0 shadow-lg group"
          aria-label="Back to home"
          title="Back to home (Esc)"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="inline font-medium">Home</span>
        </Link>

        {/* Search input with '/' hotkey hint */}
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects by name, technology, or tag..."
            className={cn(
              "w-full pl-10 pr-12 py-2.5 rounded-xl border border-white/10 bg-[#0e0f14]/80 backdrop-blur-md",
              "text-sm text-white placeholder-white/40 font-sans focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
            )}
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X className="size-4" />
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/50 border border-white/10">
                /
              </kbd>
            </div>
          )}
        </div>

        {/* Layout Switcher & Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
          {/* Layout Mode Group (Ring, Helix, Grid) */}
          <div className="flex items-center p-1 rounded-xl border border-white/10 bg-[#0e0f14]/80 backdrop-blur-md">
            <button
              onClick={() => onLayoutChange("ring")}
              title="Ring Layout (3D Infinite Cylinder)"
              className={cn(
                "p-1.5 px-2.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all",
                layoutType === "ring" && !isListView
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/50 hover:text-white"
              )}
            >
              <CircleDot className="size-3.5" />
              <span className="hidden md:inline">Ring</span>
            </button>

            <button
              onClick={() => onLayoutChange("helix")}
              title="Helix Layout (3D Spiral)"
              className={cn(
                "p-1.5 px-2.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all",
                layoutType === "helix" && !isListView
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/50 hover:text-white"
              )}
            >
              <Dna className="size-3.5" />
              <span className="hidden md:inline">Helix</span>
            </button>

            <button
              onClick={() => onLayoutChange("grid")}
              title="Grid Layout (Multi-column Matrix)"
              className={cn(
                "p-1.5 px-2.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all",
                layoutType === "grid" && !isListView
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/50 hover:text-white"
              )}
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden md:inline">Grid</span>
            </button>
          </div>

          {/* List View Toggle */}
          <button
            onClick={onToggleListView}
            title={isListView ? "Switch to 3D View" : "View as List (Accessible 2D Mode)"}
            className={cn(
              "p-2.5 rounded-xl border border-white/10 bg-[#0e0f14]/80 backdrop-blur-md transition-all",
              isListView ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
            )}
          >
            <List className="size-4" />
          </button>

          {/* Audio Mute/Unmute Toggle */}
          <button
            onClick={onToggleAudio}
            title={isAudioMuted ? "Unmute snap ticks" : "Mute snap ticks"}
            className={cn(
              "p-2.5 rounded-xl border border-white/10 bg-[#0e0f14]/80 backdrop-blur-md transition-all",
              !isAudioMuted
                ? "bg-[var(--lume-secondary)]/20 border-[var(--lume-secondary)]/40 text-[var(--lume-secondary)]"
                : "text-white/40 hover:text-white"
            )}
          >
            {isAudioMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
        </div>
      </div>

      {/* Filter Chips & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Languages & Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              onLanguageChange("all")
              onStatusChange("all")
            }}
            className={cn(
              "px-2.5 py-1 rounded-lg font-mono transition-all border",
              selectedLanguage === "all" && selectedStatus === "all"
                ? "bg-white/15 border-white/25 text-white"
                : "bg-white/[0.02] border-white/5 text-white/50 hover:text-white hover:border-white/15"
            )}
          >
            All ({totalCount})
          </button>

          {availableLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(selectedLanguage === lang ? "all" : lang)}
              className={cn(
                "px-2.5 py-1 rounded-lg font-mono transition-all border",
                selectedLanguage === lang
                  ? "bg-[var(--lume-secondary)]/20 border-[var(--lume-secondary)]/40 text-[var(--lume-secondary)]"
                  : "bg-white/[0.02] border-white/5 text-white/50 hover:text-white hover:border-white/15"
              )}
            >
              {lang}
            </button>
          ))}

          {/* Status chips */}
          {["Shipped", "In progress"].map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(selectedStatus === status ? "all" : status)}
              className={cn(
                "px-2.5 py-1 rounded-lg font-mono transition-all border",
                selectedStatus === status
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                  : "bg-white/[0.02] border-white/5 text-white/50 hover:text-white hover:border-white/15"
              )}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-white/40 font-mono text-[11px] mr-1 hidden sm:inline">Sort:</span>
          {(
            [
              { key: "featured", label: "Featured" },
              { key: "stars", label: "Stars" },
              { key: "recent", label: "Recent" },
            ] as const
          ).map((s) => (
            <button
              key={s.key}
              onClick={() => onSortChange(s.key)}
              className={cn(
                "px-2 py-0.5 rounded-md font-mono text-[11px] transition-all",
                sortBy === s.key
                  ? "bg-white/15 text-white font-medium"
                  : "text-white/40 hover:text-white"
              )}
            >
              {s.label}
            </button>
          ))}

          {filteredCount < totalCount && (
            <span className="text-[11px] font-mono text-white/40 ml-2">
              ({filteredCount} of {totalCount})
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
