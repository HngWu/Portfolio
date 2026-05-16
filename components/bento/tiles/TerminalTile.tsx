"use client"

import * as React from "react"
import { useIgniteStore } from "@/store/useIgniteStore"
import { BentoTile } from "../BentoTile"
import { cn } from "@/lib/utils"

export function TerminalTile({ id, size }: { id: string; size: string }) {
  const [input, setInput] = React.useState("")
  const [history, setHistory] = React.useState<string[]>(["HW OS v1.0.0. Type 'help' for commands."])
  const ignite = useIgniteStore((state) => state.ignite)

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    const cmd = input.trim().toLowerCase()
    
    if (cmd === "help") {
      setHistory(prev => [...prev, `> ${cmd}`, "Available: projects, experience, clear, sudo ignite"])
    } else if (cmd === "clear") {
      setHistory([])
    } else if (cmd === "sudo ignite") {
      setHistory(prev => [...prev, `> ${cmd}`, "🔥 Root access granted. Welcome to the grid."])
      ignite()
    } else {
      setHistory(prev => [...prev, `> ${cmd}`, `Command not found: ${cmd}`])
    }
    
    setInput("")
  }

  return (
    <BentoTile id={id} size={size} className="bg-black/40 p-0 font-mono text-xs overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="p-2 border-b border-white/5 flex items-center bg-white/5">
          <div className="flex gap-1.5 ml-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
          </div>
          <span className="text-[10px] text-white/30 ml-4 uppercase tracking-widest">Terminal</span>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-1 [&::-webkit-scrollbar]:hidden">
          {history.map((line, i) => (
            <div key={i} className={cn(line.startsWith(">") ? "text-white/40" : "text-white/80")}>{line}</div>
          ))}
          <form onSubmit={handleCommand} className="flex items-center gap-2 mt-1">
            <span className="text-lume-primary">$</span>
            <div className="relative flex-1">
               <input 
                autoFocus
                className="w-full bg-transparent outline-none border-none text-white/90"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
          </form>
        </div>
      </div>
    </BentoTile>
  )
}