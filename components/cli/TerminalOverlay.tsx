"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIgniteStore } from "@/store/useIgniteStore"

type HistoryItem = {
  type: "command" | "output"
  content: string | React.ReactNode
}

const COMMANDS = {
  help: "Available commands: help, clear, ls projects, whoami, sudo ignite",
  whoami: "HW - Creative Developer / Systems Architect. Specialized in high-performance web applications and immersive interfaces.",
  "sudo ignite": "Igniting easter egg sequences... [OK] Initializing neural bridge... [OK] System status: STABLE.",
}

const PROJECTS = [
  { name: "triviaduel", desc: "Real-time multiplayer trivia platform." },
  { name: "secureasset", desc: "Blockchain asset tracking system." }
]

export function TerminalOverlay() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [history, setHistory] = React.useState<HistoryItem[]>([
    { type: "output", content: "Lume-Glass Terminal v1.0.0" },
    { type: "output", content: 'Type "help" to see available commands.' }
  ])
  const [input, setInput] = React.useState("")
  const [commandHistory, setCommandHistory] = React.useState<string[]>([])
  const [historyIndex, setHistoryIndex] = React.useState(-1)
  
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const ignite = useIgniteStore(state => state.ignite)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [history])

  // Focus input when terminal opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase()
    const newHistory: HistoryItem[] = [...history, { type: "command", content: cmd }]

    // Add to command history if not empty and different from last command
    if (cmd.trim() && commandHistory[commandHistory.length - 1] !== cmd) {
      setCommandHistory(prev => [...prev, cmd])
    }
    setHistoryIndex(-1)

    if (trimmedCmd === "clear") {
      setHistory([])
      return
    }

    if (trimmedCmd === "sudo ignite") {
      ignite()
      setHistory([...newHistory, { type: "output", content: COMMANDS["sudo ignite"] }])
      return
    }

    if (trimmedCmd === "ls projects") {
      setHistory([
        ...newHistory,
        { 
          type: "output", 
          content: (
            <div className="grid gap-1 mt-1">
              {PROJECTS.map(p => (
                <div key={p.name} className="flex gap-4">
                  <span className="text-emerald-400 min-w-[100px]">{p.name}</span>
                  <span className="text-white/50">{p.desc}</span>
                </div>
              ))}
            </div>
          )
        }
      ])
      return
    }

    if (trimmedCmd in COMMANDS) {
      setHistory([...newHistory, { type: "output", content: COMMANDS[trimmedCmd as keyof typeof COMMANDS] }])
    } else if (trimmedCmd !== "") {
      setHistory([...newHistory, { type: "output", content: `Command not found: ${trimmedCmd}. Type "help" for options.` }])
    } else {
      setHistory(newHistory)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCommand(input)
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length === 0) return
      
      const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(nextIndex)
      setInput(commandHistory[nextIndex])
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex === -1) return
      
      const nextIndex = historyIndex + 1
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1)
        setInput("")
      } else {
        setHistoryIndex(nextIndex)
        setInput(commandHistory[nextIndex])
      }
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-8 right-8 z-[1000] size-14 rounded-full flex items-center justify-center transition-colors",
          "bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xl",
          "hover:bg-white/20 hover:border-white/40",
          isOpen && "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
        )}
      >
        <Terminal className="size-6" />
      </motion.button>

      {/* Terminal Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            drag
            dragHandleClassName="terminal-header"
            dragMomentum={false}
            className={cn(
              "fixed bottom-24 right-8 z-[1000] w-[500px] h-[350px] min-w-[300px] min-h-[200px]",
              "bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden",
              "resize" // Standard CSS resize
            )}
          >
            {/* Header / Drag Handle */}
            <div className="terminal-header flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5 cursor-move select-none">
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-emerald-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Developer Console</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsOpen(false)} className="hover:text-white text-white/30 transition-colors">
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Content / History */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-2 scrollbar-none [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onClick={() => inputRef.current?.focus()}
            >
              {history.map((item, i) => (
                <div key={i} className={cn(
                  item.type === "command" ? "text-white" : "text-white/60"
                )}>
                  {item.type === "command" && <span className="text-emerald-400 mr-2">$</span>}
                  {item.content}
                </div>
              ))}
              
              {/* Input Line */}
              <form onSubmit={handleSubmit} className="flex items-center relative min-h-[1.5rem]">
                <span className="text-emerald-400 mr-2">$</span>
                <div className="relative flex-1 flex items-center">
                  <span className="text-white whitespace-pre-wrap break-all">{input}</span>
                  <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-0.5" />
                  <input
                    ref={inputRef}
                    autoFocus
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="absolute inset-0 w-full opacity-0 cursor-default"
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
