"use client"

import * as React from "react"
import { useIgniteStore } from "@/store/useIgniteStore"
import { BentoTile } from "../BentoTile"
import { cn } from "@/lib/utils"
import { usePageTransition } from "@/hooks/usePageTransition"
import { usePathname } from "next/navigation"
import { SEARCHABLE_CONTENT } from "@/lib/search"

type HistoryItem = {
  type: "command" | "output"
  content: string | React.ReactNode
}

const BIO = "HW - Creative Developer / Systems Architect. Specialized in high-performance web applications and immersive interfaces. Bridging the gap between engineering and aesthetic design."

const SKILLS = [
  { category: "Languages", items: ["Java", "Python", "JavaScript", "TypeScript", "Kotlin", "C#", "SQL"] },
  { category: "Frameworks", items: ["Spring Boot", "React.js", "Next.js", "Node.js"] },
  { category: "Databases", items: ["MariaDB", "MongoDB", "MSSQL", "MySQL"] }
]

export function TerminalTile({ id, size }: { id: string; size: string }) {
  const [input, setInput] = React.useState("")
  const [history, setHistory] = React.useState<HistoryItem[]>([
    { type: "output", content: "HW OS v1.0.0. Type 'help' for commands." }
  ])
  const [commandHistory, setCommandHistory] = React.useState<string[]>([])
  const [historyIndex, setHistoryIndex] = React.useState(-1)
  
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  const ignite = useIgniteStore((state) => state.ignite)
  const { navigateWithTransition } = usePageTransition()
  const pathname = usePathname()

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [history])

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase()
    const newHistory: HistoryItem[] = [...history, { type: "command", content: cmd }]

    if (cmd.trim() && commandHistory[commandHistory.length - 1] !== cmd) {
      setCommandHistory(prev => [...prev, cmd])
    }
    setHistoryIndex(-1)

    if (trimmedCmd === "help") {
      setHistory([
        ...newHistory,
        { type: "output", content: "Available commands: help, clear, ls projects, cat project/<name>, ls skills, whoami, open <url>, back, sudo ignite" }
      ])
    } else if (trimmedCmd === "clear") {
      setHistory([])
    } else if (trimmedCmd === "sudo ignite") {
      setHistory([...newHistory, { type: "output", content: "🔥 Root access granted. Initializing neural bridge..." }])
      ignite()
    } else if (trimmedCmd === "ls projects") {
      const projects = SEARCHABLE_CONTENT.filter(item => item.category === "Projects")
      setHistory([
        ...newHistory,
        { 
          type: "output", 
          content: (
            <div className="grid gap-1 mt-1">
              {projects.map(p => (
                <div key={p.id} className="flex gap-4">
                  <span className="text-lume-primary min-w-[100px]">{p.title}</span>
                  <span className="text-white/40">{p.description}</span>
                </div>
              ))}
            </div>
          )
        }
      ])
    } else if (trimmedCmd.startsWith("cat project/")) {
      const name = trimmedCmd.replace("cat project/", "").trim()
      const project = SEARCHABLE_CONTENT.find(item => item.id === name && item.category === "Projects")
      if (project) {
        setHistory([
          ...newHistory,
          { type: "output", content: `Project: ${project.title}` },
          { type: "output", content: `Description: ${project.description}` },
          { type: "output", content: `Path: ${project.path}` },
          { type: "output", content: "Type 'open <path>' to view." }
        ])
      } else {
        setHistory([...newHistory, { type: "output", content: `Project not found: ${name}` }])
      }
    } else if (trimmedCmd === "ls skills") {
      setHistory([
        ...newHistory,
        {
          type: "output",
          content: (
            <div className="space-y-2 mt-1">
              {SKILLS.map(s => (
                <div key={s.category}>
                  <div className="text-lume-secondary uppercase text-[10px] tracking-widest">{s.category}</div>
                  <div className="text-white/60">{s.items.join(", ")}</div>
                </div>
              ))}
            </div>
          )
        }
      ])
    } else if (trimmedCmd === "whoami") {
      setHistory([...newHistory, { type: "output", content: BIO }])
    } else if (trimmedCmd.startsWith("open ")) {
      const url = cmd.replace("open ", "").trim()
      setHistory([...newHistory, { type: "output", content: `Opening ${url}...` }])
      if (url.startsWith("http")) {
        window.open(url, "_blank")
      } else {
        navigateWithTransition(url)
      }
    } else if (trimmedCmd === "back") {
      if (pathname === "/") {
        setHistory([...newHistory, { type: "output", content: "Already at root." }])
      } else {
        setHistory([...newHistory, { type: "output", content: "Returning to base..." }])
        navigateWithTransition("/")
      }
    } else if (trimmedCmd !== "") {
      setHistory([...newHistory, { type: "output", content: `Command not found: ${trimmedCmd}` }])
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
        
        <div 
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto flex flex-col gap-1 [&::-webkit-scrollbar]:hidden"
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((item, i) => (
            <div key={i} className={cn(item.type === "command" ? "text-white/40" : "text-white/80")}>
              {item.type === "command" && <span className="text-lume-primary mr-2">$</span>}
              {item.content}
            </div>
          ))}
          
          <form onSubmit={handleSubmit} className="flex items-center relative min-h-[1.5rem] mt-1">
            <span className="text-lume-primary mr-2">$</span>
            <div className="relative flex-1 flex items-center">
              <span className="text-white whitespace-pre-wrap break-all">{input}</span>
              <span className="inline-block w-1.5 h-3 bg-lume-primary animate-pulse ml-1" />
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
      </div>
    </BentoTile>
  )
}
