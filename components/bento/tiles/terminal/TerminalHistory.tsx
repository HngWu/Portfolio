"use client"

import * as React from "react"
import { HistoryItem, OSType } from "@/lib/cli/terminalCommands"

interface TerminalHistoryProps {
  history: HistoryItem[]
  prompt: string
  os: OSType
}

export function TerminalHistory({ history, prompt, os }: TerminalHistoryProps) {
  return (
    <div className="space-y-1.5 font-mono text-xs text-white/80">
      {history.map((item, idx) => (
        <div key={idx} className="leading-relaxed">
          {item.type === "command" ? (
            <div className="flex items-center gap-2 text-white/90">
              <span className={os === "windows" ? "text-white font-semibold" : "text-lume-primary font-semibold"}>
                {prompt}
              </span>
              <span>{item.content}</span>
            </div>
          ) : (
            <div className="text-white/70 whitespace-pre-wrap">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  )
}
