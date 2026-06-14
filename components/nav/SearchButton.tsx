"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SearchButton() {
  const [shortcut, setShortcut] = React.useState<string | null>(null)

  React.useEffect(() => {
    const ua = typeof window !== "undefined" ? navigator.userAgent.toLowerCase() : ""
    const isMac = ua.includes("mac") || ua.includes("linux")
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShortcut(isMac ? "⌘K" : "Ctrl+K")
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.dispatchEvent(new CustomEvent("open-command-palette"))
  }

  if (shortcut === null) {
    return (
      <div className="h-8 w-[40px] sm:w-[100px] md:w-[150px] bg-white/[0.03] border border-white/10 rounded-full animate-pulse" />
    )
  }
  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={cn(
        "h-8 rounded-full cursor-pointer select-none gap-2 px-3.5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300",
        "bg-white/[0.03] border-white/10 text-white/50",
        "hover:bg-[#4AFFB4]/10 hover:border-[#4AFFB4]/30 hover:text-[#4AFFB4]"
      )}
      title="Open Command Palette"
    >
      <Search className="size-3.5" />
      <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Search</span>
      <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white/[0.05] border border-white/10 rounded text-white/30 group-hover/button:text-[#4AFFB4] group-hover/button:border-[#4AFFB4]/30 transition-all duration-300">
        {shortcut}
      </kbd>
    </Button>
  )
}
