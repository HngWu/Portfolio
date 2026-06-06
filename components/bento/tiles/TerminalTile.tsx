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
  
  const [isMaximized, setIsMaximized] = React.useState(false)
  const [isHidden, setIsHidden] = React.useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = React.useState(false)
  
  const tileScrollRef = React.useRef<HTMLDivElement | null>(null)
  const maxScrollRef = React.useRef<HTMLDivElement | null>(null)
  const tileInputRef = React.useRef<HTMLInputElement>(null)
  const maxInputRef = React.useRef<HTMLInputElement>(null)
  
  const handleMinimize = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setIsMaximized(false)
  }

  const handleExpand = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setIsMaximized(true)
  }

  const handleCloseClick = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setShowCloseConfirm(true)
  }

  const confirmClose = () => {
    setShowCloseConfirm(false)
    setIsMaximized(false)
    setIsHidden(true)
  }
  
  const { ignite, reset: resetIgnite } = useIgniteStore()
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
    const detectOS = (): OSType => {
      const ua = (window.navigator.userAgent || "").toLowerCase()
      const platform = (window.navigator.platform || "").toLowerCase()
      const userAgentDataPlatform = (
        (window.navigator as any).userAgentData?.platform || ""
      ).toLowerCase()

      const isWin = ua.includes("win") || platform.includes("win") || userAgentDataPlatform.includes("win")
      const isMac = ua.includes("mac") || platform.includes("mac") || userAgentDataPlatform.includes("mac") || platform.includes("ipad") || platform.includes("iphone")
      
      if (isWin) return "windows"
      if (isMac) return "mac"
      return "linux"
    }

    const detected = detectOS()
    setOS(detected)

    // Welcome Message
    setHistory([
      { 
        type: "output", 
        content: detected === "windows"
          ? "Microsoft Windows [Version 10.0.22631.3447]\n(c) Microsoft Corporation. All rights reserved." 
          : `Welcome to HW OS v1.0.0 (${detected === "mac" ? "Darwin" : "Linux"} kernel)` 
      },
      { type: "output", content: `Type 'help' to see available commands.` }
    ])
  }, [])

  React.useEffect(() => {
    if (tileInputRef.current) {
      tileInputRef.current.focus()
    }
  }, [])

  const scrollToBottom = () => {
    if (tileScrollRef.current) {
      tileScrollRef.current.scrollTop = tileScrollRef.current.scrollHeight
    }
    if (maxScrollRef.current) {
      maxScrollRef.current.scrollTop = maxScrollRef.current.scrollHeight
    }
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [history])

  React.useEffect(() => {
    const activeInput = isMaximized ? maxInputRef.current : tileInputRef.current
    if (activeInput) {
      activeInput.focus()
    }
    scrollToBottom()
  }, [isMaximized])

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
      { cmd: "login", desc: "Access administration portal" },
      { cmd: "sudo ignite", desc: "Initialize neural bridge" },
      { cmd: "shatter", desc: "Shatter 3D core fragments" },
      { cmd: "pulse", desc: "Emit 3D core kinetic shockwave" },
      { cmd: "antigravity <on/off>", desc: "Control 3D gravity field" },
      { cmd: "ignite <on/off>", desc: "Control thermal core overload" },
      { cmd: "lightning <on/off>", desc: "Control electrical ionization arcs" },
      { cmd: "lockdown <on/off>", desc: "Control EMP grid lockdown" },
      { cmd: "reset", desc: "Restore 3D core to default state" }
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mt-2 mb-2">
        {commonCmds.map((c, i) => (
          <div key={i} className="flex gap-2">
            <span className={cn("min-w-[120px] font-mono", os === "windows" ? "text-white" : "text-lume-primary")}>{c.cmd}</span>
            <span className="text-white/40 font-sans">- {c.desc}</span>
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
      if (typeof window !== "undefined" && (window as any).__hexcore_cmd) {
        (window as any).__hexcore_cmd("ignite on")
      }
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
      let targetUrl = url
      if (!targetUrl.startsWith("http")) {
        if (targetUrl.startsWith("./")) {
          targetUrl = targetUrl.slice(2)
        }
        if (!targetUrl.startsWith("/")) {
          targetUrl = "/" + targetUrl
        }
      }
      setHistory([...newHistory, { type: "output", content: `Opening ${targetUrl}...` }])
      if (targetUrl.startsWith("http")) {
        window.open(targetUrl, "_blank")
      } else {
        navigateWithTransition(targetUrl)
      }
    } else if (trimmedCmd === "back") {
      if (pathname === "/") {
        setHistory([...newHistory, { type: "output", content: "Already at root." }])
      } else {
        setHistory([...newHistory, { type: "output", content: "Returning to base..." }])
        navigateWithTransition("/")
      }
    } else if (trimmedCmd === "login") {
      setHistory([...newHistory, { type: "output", content: "Accessing administrative portal..." }])
      navigateWithTransition("/admin")
    } else if (
      trimmedCmd === "shatter" ||
      trimmedCmd === "pulse" ||
      trimmedCmd === "reset" ||
      trimmedCmd.startsWith("antigravity") ||
      trimmedCmd.startsWith("ignite") ||
      trimmedCmd.startsWith("lightning") ||
      trimmedCmd.startsWith("lockdown")
    ) {
      if (typeof window !== "undefined" && (window as any).__hexcore_cmd) {
        const hexRes = (window as any).__hexcore_cmd(trimmedCmd)
        setHistory([...newHistory, { type: "output", content: hexRes }])

        // Synchronize bento grid global overlay with Hexcore spell telemetry
        if (trimmedCmd === "ignite" || trimmedCmd === "ignite on") {
          ignite()
        } else if (trimmedCmd === "ignite off" || trimmedCmd.startsWith("lockdown") || trimmedCmd === "reset") {
          resetIgnite()
        }
      } else {
        setHistory([...newHistory, { type: "output", content: "Hexcore telemetry link offline. Cannot execute command." }])
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

  const renderHeaderAndBody = (maximized: boolean) => {
    const activeInputRef = maximized ? maxInputRef : tileInputRef
    const activeScrollRef = maximized ? maxScrollRef : tileScrollRef
    return (
      <div className="flex flex-col h-full w-full relative">
        {/* Close Confirmation Overlay */}
        {showCloseConfirm && (
          <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl max-w-xs shadow-2xl backdrop-blur-md">
              <h4 className="text-white font-medium mb-2 text-sm font-sans">Terminate Session?</h4>
              <p className="text-[11px] text-white/55 mb-5 leading-normal font-sans">This will terminate the active shell session and hide the terminal.</p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={confirmClose} 
                  type="button"
                  className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/35 border border-red-500/35 rounded-lg text-xs font-semibold text-red-200 cursor-pointer transition-colors"
                >
                  Terminate
                </button>
                <button 
                  onClick={() => setShowCloseConfirm(false)} 
                  type="button"
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-white/70 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-3 py-2 border-b select-none shrink-0",
          os === "windows" ? "bg-[#0c0c0c] border-[#333333]" : "bg-white/5 border-white/5"
        )}>
          <div className="flex items-center gap-2">
            {os === "windows" ? (
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 16 16" className="size-3.5 fill-[#cccccc]">
                  <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2z"/>
                  <path d="M4.5 11a.5.5 0 0 1-.5-.5V5.5a.5.5 0 0 1 1 0v5a.5.5 0 0 1-.5.5zm2.5-3a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 1 0v2a.5.5 0 0 1-.5.5zm3 3a.5.5 0 0 1-.5-.5v-5a.5.5 0 0 1 1 0v5a.5.5 0 0 1-.5.5z"/>
                </svg>
                <span className="text-[#cccccc] text-[10px] font-bold font-mono">C:\Windows\System32\cmd.exe</span>
              </div>
            ) : (
              <div className="flex gap-2 ml-0.5 text-white items-center group/mac-buttons">
                {/* Mac Close Button (Red) */}
                <button 
                  onClick={handleCloseClick} 
                  type="button"
                  className="size-3 rounded-full bg-[#ff5f56] shadow-inner flex items-center justify-center text-[7px] text-black/60 font-black cursor-pointer border-none outline-none hover:brightness-90 active:scale-95 transition-all"
                >
                  <span className="opacity-0 group-hover/mac-buttons:opacity-100 transition-opacity font-sans">×</span>
                </button>
                {/* Mac Minimize Button (Yellow) */}
                <button 
                  onClick={maximized ? handleMinimize : undefined} 
                  disabled={!maximized}
                  type="button"
                  className={cn(
                    "size-3 rounded-full shadow-inner flex items-center justify-center text-[7px] font-black border-none outline-none transition-all",
                    maximized 
                      ? "bg-[#ffbd2e] hover:brightness-90 active:scale-95 cursor-pointer text-black/60" 
                      : "bg-[#555] opacity-40 cursor-not-allowed text-transparent"
                  )}
                >
                  <span className={cn("opacity-0 transition-opacity font-sans", maximized && "group-hover/mac-buttons:opacity-100")}>-</span>
                </button>
                {/* Mac Expand Button (Green) */}
                <button 
                  onClick={maximized ? handleMinimize : handleExpand} 
                  type="button"
                  className="size-3 rounded-full bg-[#27c93f] shadow-inner flex items-center justify-center text-[6px] text-black/60 font-black cursor-pointer border-none outline-none hover:brightness-90 active:scale-95 transition-all"
                >
                  <span className="opacity-0 group-hover/mac-buttons:opacity-100 transition-opacity font-sans">{maximized ? "⤭" : "⤢"}</span>
                </button>
                <span className={cn(
                  "ml-2 uppercase tracking-[0.2em] text-[9px] font-black font-sans",
                  os === "mac" ? "text-white/40" : "text-white/30"
                )}>
                  {config.headerTitle}
                </span>
              </div>
            )}
          </div>
          
          {os === "windows" && (
            <div className="flex items-center">
              {/* Windows Minimize */}
              <button 
                onClick={maximized ? handleMinimize : undefined}
                disabled={!maximized}
                type="button"
                className={cn(
                  "px-4 py-2 transition-colors border-none outline-none bg-transparent flex items-center justify-center h-8",
                  maximized 
                    ? "hover:bg-white/10 cursor-pointer text-[#cccccc]" 
                    : "opacity-25 cursor-not-allowed text-white/10"
                )}
              >
                <div className="w-2.5 h-[1px] bg-[#cccccc]" />
              </button>
              {/* Windows Maximize / Expand */}
              <button 
                onClick={maximized ? handleMinimize : handleExpand}
                type="button"
                className="px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer border-none outline-none bg-transparent flex items-center justify-center h-8"
              >
                {maximized ? (
                  <div className="size-2.5 relative">
                    <div className="size-2 border border-[#cccccc] absolute top-0 right-0 bg-[#0c0c0c]" />
                    <div className="size-2 border border-[#cccccc] absolute bottom-0 left-0 bg-[#0c0c0c]" />
                  </div>
                ) : (
                  <div className="size-2.5 border border-[#cccccc]" />
                )}
              </button>
              {/* Windows Close */}
              <button 
                onClick={handleCloseClick}
                type="button"
                className="px-4 py-2 hover:bg-[#e81123] transition-colors cursor-pointer border-none outline-none bg-transparent flex items-center justify-center h-8 group/win"
              >
                <X className="size-3.5 text-[#cccccc] group-hover/win:text-white" />
              </button>
            </div>
          )}
        </div>
        
        {/* Terminal Body */}
        <div 
          ref={activeScrollRef}
          className={cn(
            "flex-1 p-5 overflow-y-auto flex flex-col gap-1 scrollbar-none [&::-webkit-scrollbar]:hidden w-full h-full font-mono text-base md:text-sm select-text cursor-text",
            os === "windows" ? "bg-black" : "bg-transparent"
          )}
          onClick={() => activeInputRef.current?.focus()}
        >
          {history.map((item, i) => (
            <div key={i} className="text-white/90 whitespace-pre-wrap font-mono text-base md:text-sm">
              {item.type === "command" && <span className="text-white/60 font-mono text-base md:text-sm mr-1">{config.prompt}</span>}
              {item.content}
            </div>
          ))}
          
          <form onSubmit={handleSubmit} className="flex items-center relative min-h-[1.5rem] mt-1">
            <span className="text-white shrink-0 leading-tight font-mono text-base md:text-sm">{config.prompt}</span>
            <div className="relative flex-1 inline-flex items-center ml-0.5">
              <span className="text-white whitespace-pre-wrap break-all leading-tight font-mono text-base md:text-sm">{input}</span>
              <span className={cn(
                "inline-block w-2 h-[1.15em] ml-0.5 shrink-0", 
                config.cursorColor, 
                "animate-terminal-blink"
              )} />
              <input
                ref={activeInputRef}
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
    )
  }

  if (isHidden) return null

  return (
    <>
      <style>{`
        @keyframes terminal-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-terminal-blink {
          animation: terminal-blink 1s step-end infinite;
        }
        .scrollbar-none {
          scrollbar-width: none;
        }
      `}</style>
      <BentoTile 
        id={id} 
        size={size} 
        className="p-0 md:p-0 overflow-hidden h-full w-full border-none" 
        isDragging={isDragging} 
        sortableProps={sortableProps}
        canDeepDive={false}
        layout={false}
        noPadding={true}
      >
        {renderHeaderAndBody(false)}
      </BentoTile>

      {/* Maximized Full-Screen Viewport Overlay */}
      {isMaximized && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl p-4 md:p-8 flex items-center justify-center animate-in fade-in duration-300">
          <div className="w-full h-full max-w-6xl bg-[#0c0c0c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300">
            {renderHeaderAndBody(true)}
          </div>
        </div>
      )}
    </>
  )
}
