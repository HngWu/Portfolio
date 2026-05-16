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
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div className="w-full max-w-2xl bg-[#141414]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-4">
        <div className="flex items-center px-4 border-b border-white/10">
          <Search className="w-5 h-5 text-white/50" />
          <input
            autoFocus
            className="w-full bg-transparent border-none focus:outline-none text-white p-4 placeholder:text-white/30"
            placeholder="Search or type a command..."
            value={search}
            onChange={handleSearchChange}
          />
          <div className="text-xs font-mono text-white/30 bg-white/5 px-2 py-1 rounded">ESC</div>
        </div>

        <div className="p-2 overflow-y-auto max-h-[60vh]">
          {filteredCommands.length > 0 ? (
            <div className="flex flex-col gap-1">
              {Array.from(new Set(filteredCommands.map(c => c.category))).map(category => (
                <React.Fragment key={category}>
                  <div className="px-3 py-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-2">{category}</div>
                  {filteredCommands.filter(c => c.category === category).map((cmd) => {
                    const globalIndex = filteredCommands.indexOf(cmd)
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => handleAction(cmd)}
                        className={cn(
                          "w-full text-left px-3 py-3 text-sm rounded-lg transition-colors flex items-center justify-between group",
                          globalIndex === selectedIndex 
                            ? "bg-white/10 text-white" 
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {cmd.icon && (
                            <span className="w-4 h-4 text-white/30 flex items-center justify-center">
                              {React.createElement(cmd.icon, { size: 16 })}
                            </span>
                          )}
                          <span>{cmd.label}</span>
                        </div>
                        <span className="text-[10px] font-mono text-white/10 opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                      </button>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="px-3 py-12 text-center">
              <p className="text-sm text-white/30">No results found for &quot;{search}&quot;</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
