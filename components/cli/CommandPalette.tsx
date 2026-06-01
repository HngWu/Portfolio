"use client"

import * as React from "react"
import { Search, Palette, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePageTransition } from "@/hooks/usePageTransition"
import { useThemeStore } from "@/store/useThemeStore"
import { useViewModeStore } from "@/store/useViewModeStore"
import { SEARCHABLE_CONTENT } from "@/lib/search"

type CommandAction = {
  id: string
  label: string
  category: string
  icon?: React.ElementType
  path?: string
  action?: () => void
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [isMacOrLinux, setIsMacOrLinux] = React.useState(false)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent.toLowerCase()
      setIsMacOrLinux(ua.includes("mac") || ua.includes("linux"))
    }
  }, [])

  React.useEffect(() => {
    const handleOpenPalette = () => {
      setIsOpen(true)
    }
    window.addEventListener("open-command-palette", handleOpenPalette)
    return () => window.removeEventListener("open-command-palette", handleOpenPalette)
  }, [])
  
  const { navigateWithTransition } = usePageTransition()
  const toggleTheme = useThemeStore((state) => state.togglePrimaryColor)
  const { mode, setMode } = useViewModeStore()

  const commands: CommandAction[] = React.useMemo(() => [
    { id: "home", label: "Home", path: "/", category: "Navigation" },
    { id: "projects", label: "Projects", path: "/projects", category: "Navigation" },
    { id: "experience", label: "Experience", path: "/experience", category: "Navigation" },
    { id: "theme", label: "Toggle Accent Color", action: toggleTheme, category: "Theme", icon: Palette },
    { id: "mode", label: `Switch to ${mode === "quick" ? "Deep Dive" : "Quick-Pitch"}`, action: () => setMode(mode === "quick" ? "deep" : "quick"), category: "Theme", icon: Monitor },
    ...SEARCHABLE_CONTENT.filter(item => !["home", "projects", "experience"].includes(item.id)).map(item => ({
      id: item.id,
      label: item.title,
      category: item.category,
      path: item.path
    }))
  ], [toggleTheme, mode, setMode])

  const filteredCommands = React.useMemo(() => {
    if (!search) return commands
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, commands])

  const handleAction = React.useCallback((cmd: CommandAction) => {
    setIsOpen(false)
    setSearch("")
    if (cmd.action) {
      cmd.action()
    } else if (cmd.path) {
      navigateWithTransition(cmd.path)
    }
  }, [navigateWithTransition])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setSelectedIndex(0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-start justify-center pt-[15vh] transition-all duration-300">
      <div className="w-full max-w-2xl bg-[#0f0f0f]/85 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_30px_rgba(74,255,180,0.02)] overflow-hidden flex flex-col mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 border-b border-white/5 bg-white/[0.01]">
          <Search className="w-4 h-4 text-white/30 shrink-0" />
          <input
            autoFocus
            className="w-full bg-transparent border-none focus:outline-none text-white font-mono p-4 placeholder:text-white/20 text-sm"
            placeholder="Search or type a command..."
            value={search}
            onChange={handleSearchChange}
          />
          <span className="w-1.5 h-4 bg-lume-primary animate-pulse rounded shrink-0 mr-3 shadow-[0_0_8px_var(--lume-primary)]" />
          <kbd className="bg-white/[0.05] border border-white/10 text-white/40 px-2 py-0.5 rounded text-[10px] font-mono shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1.5px_0_rgba(0,0,0,0.4)] shrink-0">
            ESC
          </kbd>
        </div>

        <div className="p-2 overflow-y-auto max-h-[60vh] scrollbar-custom">
          {filteredCommands.length > 0 ? (
            <div className="flex flex-col gap-1">
              {Array.from(new Set(filteredCommands.map(c => c.category))).map(category => (
                <React.Fragment key={category}>
                  <div className="px-4 py-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-2 font-mono">{category}</div>
                  {filteredCommands.filter(c => c.category === category).map((cmd) => {
                    const globalIndex = filteredCommands.indexOf(cmd)
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => handleAction(cmd)}
                        className={cn(
                          "w-full text-left pl-7 pr-4 py-3 text-sm rounded-xl transition-all duration-200 flex items-center justify-between group border border-transparent relative overflow-hidden",
                          globalIndex === selectedIndex 
                            ? "bg-white/[0.03] border-white/5 text-white shadow-[inset_0_0_12px_rgba(255,255,255,0.01)]" 
                            : "text-white/60 hover:bg-white/[0.01] hover:text-white"
                        )}
                      >
                        {globalIndex === selectedIndex && (
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 w-[3px] h-[16px] rounded-full bg-lume-primary shadow-[0_0_10px_var(--lume-primary)] animate-in fade-in zoom-in duration-200" />
                        )}
                        <div className="flex items-center gap-3">
                          {cmd.icon && (
                            <span className={cn(
                              "w-5 h-5 flex items-center justify-center rounded-lg transition-colors",
                              globalIndex === selectedIndex ? "text-lume-primary" : "text-white/30"
                            )}>
                              {React.createElement(cmd.icon, { size: 16 })}
                            </span>
                          )}
                          <span className="font-mono text-sm tracking-tight">{cmd.label}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {globalIndex === selectedIndex && (
                            <span className="text-[10px] font-mono text-lume-primary bg-lume-primary/10 border border-lume-primary/20 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(var(--lume-primary),0.1)]">
                              ENTER
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            Select
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-white/30 font-mono">No results found for &quot;{search}&quot;</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
