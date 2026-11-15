"use client"

import Link from "next/link"
import { usePageTransition } from "@/hooks/usePageTransition"
import {
  ArrowLeft,
  Download,
  Printer,
  Maximize2,
  Minimize2,
  ExternalLink,
  FolderOpen,
  Eye,
} from "lucide-react"
import type { VaultDocument } from "@/lib/cv/documents"

export interface CvHeaderBarProps {
  activeDoc: VaultDocument
  isFullscreen: boolean
  onToggleFullscreen: () => void
  onDownload: () => void
  onPrint: () => void
  activeMobileTab: "explorer" | "document"
  onTabChange: (tab: "explorer" | "document") => void
}

export function CvHeaderBar({
  activeDoc,
  isFullscreen,
  onToggleFullscreen,
  onDownload,
  onPrint,
  activeMobileTab,
  onTabChange,
}: CvHeaderBarProps) {
  const { navigateWithTransition } = usePageTransition()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl transition-all select-none">
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 gap-2 sm:gap-4 w-full">
        {/* Left: Back Link & Dynamic Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault()
              navigateWithTransition("/", e.currentTarget)
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white/60 hover:text-white transition-colors group shrink-0"
            aria-label="Back to Portfolio"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-white/60 group-hover:text-lume-primary" />
            <span className="font-mono text-xs uppercase tracking-wider group-hover:text-white">PORTFOLIO</span>
          </Link>
          <span className="text-white/20 select-none text-xs sm:text-sm" aria-hidden="true">
            /
          </span>
          <span className="text-xs sm:text-sm font-medium text-white/40 hidden sm:inline shrink-0 font-mono">
            Vault
          </span>
          <span className="text-white/20 select-none text-xs sm:text-sm hidden sm:inline" aria-hidden="true">
            /
          </span>
          <span className="text-xs sm:text-sm font-display font-bold text-white/90 truncate max-w-[140px] sm:max-w-[260px] md:max-w-md tracking-wide">
            {activeDoc.title}
          </span>
        </div>

        {/* Center: Mobile Segmented Tab Switcher */}
        <div
          className="flex md:hidden items-center p-0.5 sm:p-1 bg-white/[0.03] border border-white/10 rounded-lg gap-1 shrink-0 backdrop-blur-md"
          role="tablist"
          aria-label="Vault Mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeMobileTab === "explorer"}
            onClick={() => onTabChange("explorer")}
            className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeMobileTab === "explorer"
                ? "bg-lume-primary/15 text-lume-primary border border-lume-primary/30 shadow-[0_0_15px_rgba(74,255,180,0.15)]"
                : "text-white/60 hover:text-white border border-transparent hover:bg-white/5"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Vault</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeMobileTab === "document"}
            onClick={() => onTabChange("document")}
            className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeMobileTab === "document"
                ? "bg-lume-primary/15 text-lume-primary border border-lume-primary/30 shadow-[0_0_15px_rgba(74,255,180,0.15)]"
                : "text-white/60 hover:text-white border border-transparent hover:bg-white/5"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Viewer</span>
          </button>
        </div>

        {/* Right: Adaptive Action Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Download Active File */}
          <button
            type="button"
            onClick={onDownload}
            aria-label={`Download ${activeDoc.filename}`}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-lume-primary/10 hover:bg-lume-primary/20 border border-lume-primary/30 text-lume-primary transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(74,255,180,0.1)] hover:shadow-[0_0_20px_rgba(74,255,180,0.2)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
            <span className="text-[10px] opacity-75 uppercase font-mono hidden md:inline">
              .{activeDoc.format}
            </span>
          </button>

          {/* Print (Available for PDF and HTML views) */}
          <button
            type="button"
            onClick={onPrint}
            aria-label="Print Document"
            title="Print Document"
            className="inline-flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Fullscreen (hidden on mobile, visible on sm+) */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="hidden sm:inline-flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer active:scale-95"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Open Raw URL */}
          <a
            href={activeDoc.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Raw File in new tab"
            title="Open Raw File in new tab"
            className="inline-flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  )
}

export default CvHeaderBar
