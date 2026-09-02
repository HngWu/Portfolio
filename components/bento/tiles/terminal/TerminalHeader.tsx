"use client"

import * as React from "react"
import { X, Minus, Square, Terminal as TerminalIcon } from "lucide-react"
import type { OSType } from "@/lib/cli/terminalCommands"

interface TerminalHeaderProps {
  headerTitle: string
  isMaximized: boolean
  onMinimize: (e?: React.MouseEvent) => void
  onExpand: (e?: React.MouseEvent) => void
  onCloseClick: (e?: React.MouseEvent) => void
  showCloseConfirm?: boolean
  confirmClose?: () => void
  setShowCloseConfirm?: (val: boolean) => void
  os?: OSType
}

export function TerminalHeader({
  headerTitle,
  isMaximized,
  onMinimize,
  onExpand,
  onCloseClick,
  showCloseConfirm,
  confirmClose,
  setShowCloseConfirm,
  os = "linux",
}: TerminalHeaderProps) {
  const isWindows = os === "windows"

  return (
    <div className="relative flex items-center justify-between px-3 py-1.5 bg-black/60 border-b border-white/10 select-none">
      {/* Left side */}
      {isWindows ? (
        <div className="flex items-center gap-2">
          <div className="size-4 rounded flex items-center justify-center bg-white/10 text-white/80">
            <TerminalIcon className="size-2.5 text-[#cccccc]" />
          </div>
          <span className="text-[11px] font-mono text-white/80 font-medium tracking-wide">
            {headerTitle || "Command Prompt"}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCloseClick}
            className="size-3 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-colors group cursor-pointer"
            title="Close window"
          >
            <X className="size-2 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            type="button"
            onClick={onMinimize}
            className="size-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer"
            title="Minimize"
          />
          <button
            type="button"
            onClick={isMaximized ? onMinimize : onExpand}
            className="size-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer"
            title={isMaximized ? "Restore window" : "Maximize window"}
          />
        </div>
      )}

      {/* Center (Mac/Linux only) */}
      {!isWindows && (
        <div className="text-xs font-mono text-white/50">{headerTitle}</div>
      )}

      {/* Right side */}
      {isWindows ? (
        <div className="flex items-center -mr-2">
          <button
            type="button"
            onClick={onMinimize}
            className="h-7 px-3 text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            title="Minimize"
          >
            <Minus className="size-3" />
          </button>
          <button
            type="button"
            onClick={isMaximized ? onMinimize : onExpand}
            className="h-7 px-3 text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            <Square className="size-2.5" />
          </button>
          <button
            type="button"
            onClick={onCloseClick}
            className="h-7 px-3 text-white/60 hover:text-white hover:bg-red-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <div className="w-12" />
      )}

      {/* Close Confirmation Dialog */}
      {showCloseConfirm && (
        <div className="absolute inset-0 bg-red-950/95 backdrop-blur-md flex items-center justify-between px-4 z-20">
          <span className="text-xs font-mono text-white">Close terminal session?</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmClose}
              className="px-2 py-0.5 text-xs bg-red-600 text-white rounded font-mono hover:bg-red-500 cursor-pointer"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setShowCloseConfirm?.(false)}
              className="px-2 py-0.5 text-xs bg-white/10 text-white rounded font-mono hover:bg-white/20 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
