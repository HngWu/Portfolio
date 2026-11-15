"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Palette,
  X,
  Gauge,
  Sparkles,
  Compass,
  FolderGit2,
  Briefcase,
  Trophy,
  Cpu,
  GraduationCap,
  User,
  FileText,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePageTransition } from "@/hooks/usePageTransition"
import { useThemeStore } from "@/store/useThemeStore"
import { useViewModeStore } from "@/store/useViewModeStore"
import { useModeTransitionStore } from "@/store/useModeTransitionStore"
import { usePerformanceStore } from "@/store/usePerformanceStore"
import { SEARCHABLE_CONTENT, type SearchResult } from "@/lib/search"

interface CommandAction {
  id: string
  label: string
  description?: string
  category: string
  icon?: LucideIcon
  path?: string
  action?: () => void
}

function getCategoryIcon(category: string, id: string): LucideIcon {
  const cat = category.toLowerCase()
  if (id === "home") return Compass
  if (id === "about") return User
  if (id === "cv") return FileText
  if (id === "projects" || cat.includes("project")) return FolderGit2
  if (id === "experience" || cat.includes("experience")) return Briefcase
  if (id === "skills" || cat.includes("skill")) return Cpu
  if (id === "awards" || cat.includes("award")) return Trophy
  if (id === "education" || cat.includes("education")) return GraduationCap
  return Compass
}

export function CommandPalette({ initialContent }: { initialContent?: SearchResult[] }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const listRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const { navigateWithTransition } = usePageTransition()
  const toggleTheme = useThemeStore((state) => state.togglePrimaryColor)
  const { mode } = useViewModeStore()
  const startModeTransition = useModeTransitionStore((state) => state.startTransition)
  const setPerfPromptOpen = usePerformanceStore((state) => state.setPromptOpen)

  // Listen for custom trigger from navbar
  React.useEffect(() => {
    const handleOpenPalette = () => {
      setIsOpen(true)
    }
    window.addEventListener("open-command-palette", handleOpenPalette)
    return () => window.removeEventListener("open-command-palette", handleOpenPalette)
  }, [])

  // Global keyboard shortcuts (⌘K, Ctrl+K, Escape)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [isOpen])

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      setSearch("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Dynamic commands list
  const commands: CommandAction[] = React.useMemo(() => {
    const quickActions: CommandAction[] = [
      {
        id: "theme",
        label: "Toggle Accent Color",
        description: "Cycle primary accent through Electric Mint, Blueprint Blue, Hot Pink, and Radiant Amber",
        action: toggleTheme,
        category: "Quick Actions",
        icon: Palette,
      },
      {
        id: "mode",
        label: `Switch to ${mode === "quick" ? "Deep Dive" : "Quick-Pitch"} Mode`,
        description:
          mode === "quick"
            ? "Switch to technical, architectural mode with deep dive specifications"
            : "Switch to high-velocity, cinematic executive pitch mode",
        action: () => startModeTransition(mode === "quick" ? "deep" : "quick"),
        category: "Quick Actions",
        icon: Sparkles,
      },
      {
        id: "performance",
        label: "Graphics & Performance Settings",
        description: "Fine-tune 3D HexCore WebGL, background FX, and perspective card tilt",
        action: () => {
          setIsOpen(false)
          setPerfPromptOpen(true)
        },
        category: "Quick Actions",
        icon: Gauge,
      },
    ]

    const sourceContent = initialContent || SEARCHABLE_CONTENT

    // Filter and map searchable content
    const contentActions: CommandAction[] = sourceContent.map((item) => ({
      id: item.id,
      label: item.title,
      description: item.description,
      category: item.category,
      path: item.path,
      icon: getCategoryIcon(item.category, item.id),
    }))

    return [...quickActions, ...contentActions]
  }, [toggleTheme, mode, startModeTransition, initialContent, setPerfPromptOpen])

  // Filter commands by search term
  const filteredCommands = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return commands
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        (cmd.description && cmd.description.toLowerCase().includes(q)) ||
        cmd.category.toLowerCase().includes(q)
    )
  }, [search, commands])

  // Action executor
  const handleAction = React.useCallback(
    (cmd: CommandAction) => {
      setIsOpen(false)
      setSearch("")
      if (cmd.action) {
        cmd.action()
      } else if (cmd.path) {
        navigateWithTransition(cmd.path)
      }
    },
    [navigateWithTransition]
  )

  // Arrow key navigation inside open palette
  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredCommands.length === 0) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          handleAction(filteredCommands[selectedIndex])
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, handleAction])

  // Auto-scroll selected item into view
  React.useEffect(() => {
    if (!listRef.current) return
    const selectedEl = listRef.current.querySelector(`[data-selected="true"]`) as HTMLElement | null
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }, [selectedIndex])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setSelectedIndex(0)
  }

  // Group commands by category preserving order
  const categories = React.useMemo(() => {
    const set = new Set<string>()
    filteredCommands.forEach((c) => set.add(c.category))
    return Array.from(set)
  }, [filteredCommands])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] sm:pt-[14vh] p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Lume-Glass Palette Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ type: "spring", damping: 26, stiffness: 360 }}
            className="relative w-full max-w-2xl z-10 overflow-hidden rounded-2xl border border-white/10 bg-[#0c0d12]/95 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(var(--mode-glow-rgb,74,255,180),0.06)] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette"
          >
            {/* Blueprint Grid Texture & Sub-surface Noise */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            {/* Corner Crosshair Accents */}
            <div className="absolute top-2.5 left-2.5 size-2 border-t border-l border-white/20 pointer-events-none" />
            <div className="absolute top-2.5 right-2.5 size-2 border-t border-r border-white/20 pointer-events-none" />
            <div className="absolute bottom-2.5 left-2.5 size-2 border-b border-l border-white/20 pointer-events-none" />
            <div className="absolute bottom-2.5 right-2.5 size-2 border-b border-r border-white/20 pointer-events-none" />

            {/* Top Specular Accent Beam */}
            <div
              className="absolute top-0 left-1/4 right-1/4 h-[1px] pointer-events-none transition-colors duration-500"
              style={{
                background: "linear-gradient(90deg, transparent, var(--mode-accent), transparent)",
              }}
            />

            {/* Header: Search Input & Controls */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-white/10 bg-white/[0.01]">
              <Search className="size-4 text-[var(--mode-accent,var(--lume-primary))] shrink-0 mr-3" />
              
              <input
                ref={inputRef}
                className="w-full bg-transparent border-none focus:outline-none text-white font-mono placeholder:text-white/30 text-sm leading-relaxed"
                placeholder="Type a command or search portfolio..."
                value={search}
                onChange={handleSearchChange}
              />

              {/* Pulsing Lume Cursor Indicator */}
              <span className="w-1.5 h-4 bg-[var(--mode-accent,var(--lume-primary))] animate-pulse rounded shrink-0 mr-3 shadow-[0_0_8px_var(--mode-accent,var(--lume-primary))]" />

              {/* Clear search query button */}
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("")
                    inputRef.current?.focus()
                  }}
                  className="p-1 mr-2 text-white/40 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}

              {/* Active Mode Pill Indicator / Quick Switch */}
              <button
                type="button"
                onClick={() => startModeTransition(mode === "quick" ? "deep" : "quick")}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border border-white/10 bg-white/5 text-white/70 hover:border-[var(--mode-accent)] hover:text-[var(--mode-accent-bright)] transition-colors cursor-pointer mr-2 shrink-0"
                title={`Active: ${mode === "quick" ? "Quick-Pitch (Click to toggle Deep Dive)" : "Deep Dive (Click to toggle Quick-Pitch)"}`}
              >
                <Sparkles className="size-3 text-[var(--mode-accent)]" />
                <span>{mode === "quick" ? "Quick-Pitch" : "Deep Dive"}</span>
              </button>

              {/* Close Button on Mobile / ESC Keycap on Desktop */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close command palette"
                className="sm:hidden p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg shrink-0 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>

              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.05] border border-white/15 text-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1.5px_0_rgba(0,0,0,0.5)] shrink-0">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div
              ref={listRef}
              className="p-2 overflow-y-auto max-h-[55vh] scrollbar-custom relative z-10"
            >
              {filteredCommands.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {categories.map((category) => {
                    const categoryCommands = filteredCommands.filter((c) => c.category === category)
                    return (
                      <React.Fragment key={category}>
                        <div className="px-3 py-1.5 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono flex items-center justify-between mt-1">
                          <span>{category}</span>
                          <span className="text-[9px] text-white/20">{categoryCommands.length}</span>
                        </div>

                        {categoryCommands.map((cmd) => {
                          const globalIndex = filteredCommands.indexOf(cmd)
                          const isSelected = globalIndex === selectedIndex
                          const Icon = cmd.icon || Compass

                          return (
                            <button
                              key={cmd.id}
                              data-selected={isSelected}
                              onClick={() => handleAction(cmd)}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={cn(
                                "w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all duration-150 flex items-center justify-between group border relative overflow-hidden cursor-pointer",
                                isSelected
                                  ? "bg-white/[0.05] border-white/10 text-white shadow-[inset_0_0_16px_rgba(255,255,255,0.02)]"
                                  : "border-transparent text-white/70 hover:bg-white/[0.02] hover:text-white"
                              )}
                            >
                              {/* Glowing Left Indicator Bar */}
                              {isSelected && (
                                <motion.span
                                  layoutId="command-selected-indicator"
                                  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-full bg-[var(--mode-accent,var(--lume-primary))]"
                                  style={{
                                    boxShadow: "0 0 12px var(--mode-accent, var(--lume-primary))",
                                  }}
                                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                />
                              )}

                              <div className="flex items-center gap-3 pl-3 pr-2 min-w-0">
                                {/* Icon Pill */}
                                <div
                                  className={cn(
                                    "size-8 rounded-lg border flex items-center justify-center shrink-0 transition-colors",
                                    isSelected
                                      ? "bg-[var(--mode-accent)]/15 border-[var(--mode-accent)]/30 text-[var(--mode-accent-bright)]"
                                      : "bg-white/5 border-white/10 text-white/40 group-hover:text-white/70"
                                  )}
                                >
                                  <Icon className="size-4" />
                                </div>

                                {/* Label & Descriptive Subtext */}
                                <div className="flex flex-col min-w-0">
                                  <span className="font-mono text-sm tracking-tight text-white/90 group-hover:text-white truncate">
                                    {cmd.label}
                                  </span>
                                  {cmd.description && (
                                    <span className="text-xs text-white/40 group-hover:text-white/60 truncate font-sans">
                                      {cmd.description}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Action Badges / Keycaps */}
                              <div className="flex items-center gap-2 shrink-0">
                                {isSelected ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--mode-accent)]/30 bg-[var(--mode-accent)]/10 text-[var(--mode-accent-bright)] shadow-[0_0_10px_var(--mode-accent)]/10">
                                    <span>SELECT</span>
                                    <CornerDownLeft className="size-2.5" />
                                  </span>
                                ) : (
                                  cmd.category !== "Quick Actions" && (
                                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-wider hidden sm:inline">
                                      {cmd.category}
                                    </span>
                                  )
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </React.Fragment>
                    )
                  })}
                </div>
              ) : (
                /* Cinematic Empty State with Suggestion Chips */
                <div className="px-6 py-12 text-center space-y-4">
                  <div className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/30">
                    <Search className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-white/80 font-mono">
                      No results found for &quot;<span className="text-[var(--mode-accent-bright)]">{search}</span>&quot;
                    </p>
                    <p className="text-xs text-white/40">Try searching for projects, experience, or system commands:</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {["Projects", "Theme", "Experience", "Skills", "Deep Dive"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSearch(tag)
                          inputRef.current?.focus()
                        }}
                        className="px-2.5 py-1 rounded-lg font-mono text-[11px] bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer HUD Bar */}
            <div className="px-4 py-2.5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] font-mono text-white/40 relative z-10">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[9px]">↑</kbd>
                  <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[9px]">↓</kbd>
                  <span className="text-[10px] text-white/50">Navigate</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px]">↵</kbd>
                  <span className="text-[10px] text-white/50">Select</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[9px]">ESC</kbd>
                  <span className="text-[10px] text-white/50">Dismiss</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/30">{filteredCommands.length} results</span>
                <span className="size-1 rounded-full bg-white/20" />
                <span className="text-[10px] text-[var(--mode-accent)] capitalize">
                  {mode === "quick" ? "Quick-Pitch" : "Deep Dive"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
