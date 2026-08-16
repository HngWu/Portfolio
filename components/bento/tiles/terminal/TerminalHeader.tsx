"use client"

import * as React from "react"
import { X } from "lucide-react"

interface TerminalHeaderProps {
  headerTitle: string
  isMaximized: boolean
  onMinimize: (e?: React.MouseEvent) => void
  onExpand: (e?: React.MouseEvent) => void
  onCloseClick: (e?: React.MouseEvent) => void
  showCloseConfirm?: boolean
  confirmClose?: () => void
  setShowCloseConfirm?: (val: boolean) => void
}

export function TerminalHeader({
  headerTitle,
  isMaximized,
  onMinimize,
  onExpand,
  onCloseClick,
  showCloseConfirm,
  confirmClose,
  setShowCloseConfirm
}: TerminalHeaderProps) {
  return (
    <div className="relative flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/10 select-none">
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

      <div className="text-xs font-mono text-white/50">{headerTitle}</div>

      <div className="w-12" />

      {showCloseConfirm && (
        <div className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex items-center justify-between px-4 z-20">
          <span className="text-xs font-mono text-white">Close terminal session?</span>
          <div className="flex gap-2">
            <button
              onClick={confirmClose}
              className="px-2 py-0.5 text-xs bg-red-600 text-white rounded font-mono hover:bg-red-500"
            >
              Yes
            </button>
            <button
              onClick={() => setShowCloseConfirm?.(false)}
              className="px-2 py-0.5 text-xs bg-white/10 text-white rounded font-mono hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
