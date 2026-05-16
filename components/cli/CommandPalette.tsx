"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

const COMMANDS = [
  { id: "home", label: "Home", path: "/", category: "Navigation" },
  { id: "projects", label: "Projects", path: "/projects", category: "Navigation" },
  { id: "experience", label: "Experience", path: "/experience", category: "Navigation" },
  { id: "awards", label: "Awards & Honours", path: "/awards", category: "Navigation" },
  { id: "skills", label: "Skills & Technologies", path: "/skills", category: "Navigation" },
  { id: "education", label: "Education", path: "/education", category: "Navigation" },
]

export function CommandPalette() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const router = useRouter()

  const filteredCommands = React.useMemo(() => {
    return COMMANDS.filter(cmd => 
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const handleNavigate = React.useCallback((path: string) => {
    setIsOpen(false)
    setSearch("")
    router.push(path)
  }, [router])

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

  // Handle keyboard navigation when open
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
          handleNavigate(filteredCommands[selectedIndex].path)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, handleNavigate])

  // Reset selected index when search changes
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div className="w-full max-w-2xl bg-[#141414]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-4">
        <div className="flex items-center px-4 border-b border-white/10">
          <Search className="w-5 h-5 text-white/50" />
          <input
            autoFocus
            className="w-full bg-transparent border-none focus:outline-none text-white p-4 placeholder:text-white/30"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="text-xs font-mono text-white/30 bg-white/5 px-2 py-1 rounded">ESC</div>
        </div>

        <div className="p-2 overflow-y-auto max-h-[60vh]">
          {filteredCommands.length > 0 ? (
            <div className="flex flex-col gap-1">
              <div className="px-3 py-2 text-xs font-semibold text-white/30 uppercase tracking-widest">Commands</div>
              {filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  onClick={() => handleNavigate(cmd.path)}
                  className={cn(
                    "w-full text-left px-3 py-3 text-sm rounded-lg transition-colors flex items-center justify-between",
                    index === selectedIndex 
                      ? "bg-white/10 text-white" 
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span>{cmd.label}</span>
                  <span className="text-[10px] font-mono text-white/20">{cmd.category}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-8 text-center text-sm text-white/30">
              No commands found for &quot;{search}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  )
  }