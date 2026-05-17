"use client"

import * as React from "react"
import { useIgniteStore } from "@/store/useIgniteStore"
import { BentoTile } from "../BentoTile"
import { cn } from "@/lib/utils"
import { usePageTransition } from "@/hooks/usePageTransition"
import { usePathname } from "next/navigation"
import { SEARCHABLE_CONTENT } from "@/lib/search"
import { X } from "lucide-react"

type HistoryItem = {
  type: "command" | "output"
  content: string | React.ReactNode
}

type OSType = "windows" | "mac" | "linux"

interface TerminalConfig {
  prompt: string
  cursorColor: string
  headerTitle: string
  commands: {
    list: string
    read: string
    clear: string
  }
}

const BIO = "HW - Creative Developer / Systems Architect. Specialized in high-performance web applications and immersive interfaces. Bridging the gap between engineering and aesthetic design."

const SKILLS = [
  { category: "Languages", items: ["Java", "Python", "JavaScript", "TypeScript", "Kotlin", "C#", "SQL"] },
  { category: "Frameworks", items: ["Spring Boot", "React.js", "Next.js", "Node.js"] },
  { category: "Databases", items: ["MariaDB", "MongoDB", "MSSQL", "MySQL"] }
]

export function TerminalTile({ id, size, isDragging, sortableProps }: { id: string; size: string; isDragging?: boolean; sortableProps?: Record<string, unknown> }) {
  const [input, setInput] = React.useState("")
  const [os, setOS] = React.useState<OSType>("linux")
  const [history, setHistory] = React.useState<HistoryItem[]>([])
  const [commandHistory, setCommandHistory] = React.useState<string[]>([])
  const [historyIndex, setHistoryIndex] = React.useState(-1)
  
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  const ignite = useIgniteStore((state) => state.ignite)
  const { navigateWithTransition } = usePageTransition()
  const pathname = usePathname()

  // Terminal Configurations based on OS
  const config: TerminalConfig = React.useMemo(() => {
    if (os === "windows") {
      return {
        prompt: "C:\\Users\\HW> ",
        cursorColor: "bg-[#cccccc]",
        headerTitle: "Command Prompt",
        commands: { list: "dir", read: "type", clear: "cls" }
      }
    }
    return {
      prompt: os === "mac" ? "hw@mac:~$ " : "hw@linux:~$ ",
      cursorColor: "bg-lume-primary",
      headerTitle: os === "mac" ? "zsh" : "bash",
      commands: { list: "ls", read: "cat", clear: "clear" }
    }
  }, [os])

  React.useEffect(() => {
    // Detect OS
    const ua = window.navigator.userAgent
    const timer = setTimeout(() => {
      if (ua.includes("Win")) setOS("windows")
      else if (ua.includes("Mac")) setOS("mac")
      else setOS("linux")

      // Welcome Message
      setHistory([
        { 
          type: "output", 
          content: ua.includes("Win")
            ? "Microsoft Windows [Version 10.0.22631.3447]\n(c) Microsoft Corporation. All rights reserved." 
            : `Welcome to HW OS v1.0.0 (${ua.includes("Mac") ? "Darwin" : "Linux"} kernel)` 
        },
        { type: "output", content: `Type 'help' to see available commands.` }
      ])
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [history])

  const renderHelp = () => {
    const commonCmds = [
      { cmd: "help", desc: "Show this help menu" },
      { cmd: config.commands.clear, desc: "Clear terminal screen" },
      { cmd: `${config.commands.list} projects`, desc: "List all portfolio projects" },
      { cmd: `${config.commands.read} project/<name>`, desc: "View project details" },
      { cmd: `${config.commands.list} skills`, desc: "List technical capabilities" },
      { cmd: "whoami", desc: "Display developer bio" },
      { cmd: "open <url>", desc: "Navigate to a URL or page" },
      { cmd: "back", desc: "Return to home page" },
      { cmd: "sudo ignite", desc: "Initialize neural bridge" }
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mt-2 mb-2">
        {commonCmds.map((c, i) => (
          <div key={i} className="flex gap-2">
            <span className={cn("min-w-[120px]", os === "windows" ? "text-white" : "text-lume-primary")}>{c.cmd}</span>
            <span className="text-white/40">- {c.desc}</span>
          </div>
        ))}
      </div>
    )
  }

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase()
    const newHistory: HistoryItem[] = [...history, { type: "command", content: cmd }]

    if (cmd.trim() && commandHistory[commandHistory.length - 1] !== cmd) {
      setCommandHistory(prev => [...prev, cmd])
    }
    setHistoryIndex(-1)

    if (trimmedCmd === "help") {
      setHistory([...newHistory, { type: "output", content: renderHelp() }])
    } else if (trimmedCmd === config.commands.clear) {
      setHistory([])
    } else if (trimmedCmd === "sudo ignite") {
      setHistory([...newHistory, { type: "output", content: "🔥 Root access granted. Initializing neural bridge..." }])
      ignite()
    } else if (trimmedCmd === `${config.commands.list} projects`) {
      const projects = SEARCHABLE_CONTENT.filter(item => item.category === "Projects")
      setHistory([
        ...newHistory,
        { 
          type: "output", 
          content: (
            <div className="grid gap-1 mt-1">
              {projects.map(p => (
                <div key={p.id} className="flex gap-4">
                  <span className={os === "windows" ? "text-white font-bold" : "text-lume-primary"}>{p.id}</span>
                  <span className="text-white/40">{p.title}</span>
                </div>
              ))}
            </div>
          )
        }
      ])
    } else if (trimmedCmd.startsWith(`${config.commands.read} project/`)) {
      const name = trimmedCmd.replace(`${config.commands.read} project/`, "").trim()
      const project = SEARCHABLE_CONTENT.find(item => item.id === name && item.category === "Projects")
      if (project) {
        setHistory([
          ...newHistory,
          { type: "output", content: `Project: ${project.title}` },
          { type: "output", content: `Description: ${project.description}` },
          { type: "output", content: `Path: ${project.path}` },
          { type: "output", content: `Type 'open ${project.path}' to view.` }
        ])
      } else {
        setHistory([...newHistory, { type: "output", content: `Project not found: ${name}` }])
      }
    } else if (trimmedCmd === `${config.commands.list} skills`) {
      setHistory([
        ...newHistory,
        {
          type: "output",
          content: (
            <div className="space-y-2 mt-1">
              {SKILLS.map(s => (
                <div key={s.category}>
                  <div className={os === "windows" ? "text-white font-bold" : "text-lume-secondary uppercase text-[10px] tracking-widest"}>{s.category}</div>
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
      setHistory([...newHistory, { type: "output", content: `'${trimmedCmd}' is not recognized as an internal or external command.` }])
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
    <BentoTile id={id} size={size} className="p-0 md:p-0 overflow-hidden h-full w-full border-none" isDragging={isDragging} sortableProps={sortableProps}>
      <div className="flex flex-col h-full w-full">
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-3 py-2 border-b",
          os === "windows" ? "bg-[#0c0c0c] border-[#333333]" : "bg-white/5 border-white/5"
        )}>
          <div className="flex items-center gap-2">
            {os === "windows" ? (
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 16 16" className="size-3.5 fill-[#cccccc]">
                  <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2z"/>
                  <path d="M4.5 11a.5.5 0 0 1-.5-.5V5.5a.5.5 0 0 1 1 0v5a.5.5 0 0 1-.5.5zm2.5-3a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 1 0v2a.5.5 0 0 1-.5.5zm3 3a.5.5 0 0 1-.5-.5v-5a.5.5 0 0 1 1 0v5a.5.5 0 0 1-.5.5z"/>
                </svg>
                <span className="text-[#cccccc] text-[10px] font-bold">C:\Windows\System32\cmd.exe</span>
              </div>
            ) : (
              <div className="flex gap-2 ml-0.5 text-white">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-inner" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-inner" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-inner" />
                <span className={cn(
                  "ml-2 uppercase tracking-[0.2em] text-[9px] font-black",
                  os === "mac" ? "text-white/40" : "text-white/30"
                )}>
                  {config.headerTitle}
                </span>
              </div>
            )}
          </div>
          
          {os === "windows" && (
            <div className="flex items-center">
              {/* Minimize */}
              <div className="px-4 py-2 hover:bg-white/10 transition-colors cursor-default group/win">
                <div className="w-2.5 h-[1px] bg-[#cccccc]" />
              </div>
              {/* Maximize */}
              <div className="px-4 py-2 hover:bg-white/10 transition-colors cursor-default group/win">
                <div className="size-2.5 border border-[#cccccc]" />
              </div>
              {/* Close */}
              <div className="px-4 py-2 hover:bg-[#e81123] transition-colors cursor-default group/win">
                <X className="size-3.5 text-[#cccccc] group-hover/win:text-white" />
              </div>
            </div>
          )}
        </div>
        
        {/* Terminal Body */}
        <div 
          ref={scrollRef}
          className={cn(
            "flex-1 p-5 overflow-y-auto flex flex-col gap-1 [&::-webkit-scrollbar]:hidden w-full h-full",
            os === "windows" ? "bg-black" : "bg-transparent"
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((item, i) => (
            <div key={i} className={cn(item.type === "command" ? "text-white/60" : "text-white/90 whitespace-pre-wrap")}>
              {item.type === "command" && <span>{config.prompt}</span>}
              {item.content}
            </div>
          ))}
          
          <form onSubmit={handleSubmit} className="flex items-start relative min-h-[1.5rem] mt-1">
            <span className="text-white shrink-0 leading-tight">{config.prompt}</span>
            <div className="relative flex-1 inline-flex items-baseline ml-0.5">
              <span className="text-white whitespace-pre-wrap break-all leading-tight">{input}</span>
              <span className={cn(
                "inline-block w-2 h-[1.1em] translate-y-[0.1em] ml-0.5 shrink-0", 
                config.cursorColor, 
                os === "windows" ? "" : "animate-pulse"
              )} />
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
