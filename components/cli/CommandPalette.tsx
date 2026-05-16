"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

export function CommandPalette() {
  const [isOpen, setIsOpen] = React.useState(false)
  const router = useRouter()

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

  if (!isOpen) return null

  const handleNavigate = (path: string) => {
    setIsOpen(false)
    router.push(path)
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div className="w-full max-w-2xl bg-[#141414]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-4">
        <div className="flex items-center px-4 border-b border-white/10">
          <Search className="w-5 h-5 text-white/50" />
          <input
            autoFocus
            className="w-full bg-transparent border-none focus:outline-none text-white p-4 placeholder:text-white/30"
            placeholder="Type a command or search..."
          />
          <div className="text-xs font-mono text-white/30 bg-white/5 px-2 py-1 rounded">ESC</div>
        </div>
        
        <div className="p-2 overflow-y-auto max-h-[60vh]">
          <div className="px-3 py-2 text-xs font-semibold text-white/30 uppercase tracking-widest">Navigation</div>
          <button onClick={() => handleNavigate("/")} className="w-full text-left px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-colors">Home</button>
          <button onClick={() => handleNavigate("/projects")} className="w-full text-left px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-colors">Projects</button>
          <button onClick={() => handleNavigate("/experience")} className="w-full text-left px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-colors">Experience</button>
        </div>
      </div>
    </div>
  )
}
