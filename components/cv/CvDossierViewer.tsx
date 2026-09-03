"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { CvHeaderBar } from "./CvHeaderBar"
import { CvFileExplorer } from "./CvFileExplorer"
import { CvPdfViewport } from "./CvPdfViewport"
import { DocxViewport } from "./viewers/DocxViewport"
import {
  VAULT_DOCUMENTS,
  VAULT_FOLDERS,
  type VaultDocument,
  type DocumentFolder,
} from "@/lib/cv/documents"
import type { PortfolioContent } from "@/lib/content/portfolio"

export interface CvDossierViewerProps {
  portfolio: PortfolioContent
  initialFolders?: DocumentFolder[]
  initialDocuments?: VaultDocument[]
}

export function CvDossierViewer({
  portfolio,
  initialFolders,
  initialDocuments,
}: CvDossierViewerProps) {
  const folders = initialFolders && initialFolders.length > 0 ? initialFolders : VAULT_FOLDERS
  const documents =
    initialDocuments && initialDocuments.length > 0 ? initialDocuments : VAULT_DOCUMENTS

  const searchParams = useSearchParams()
  const docParam = searchParams.get("doc")

  const [selectedDocId, setSelectedDocId] = React.useState<string>(
    () => (docParam && documents.some((d) => d.id === docParam) ? docParam : documents[0]?.id || "resume")
  )
  const [activeMobileTab, setActiveMobileTab] = React.useState<"explorer" | "document">("explorer")
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const activeDoc: VaultDocument =
    documents.find((d) => d.id === selectedDocId) || documents[0] || VAULT_DOCUMENTS[0]

  // Handle download if navigated with ?download=true
  React.useEffect(() => {
    if (searchParams.get("download") === "true") {
      const link = document.createElement("a")
      link.href = activeDoc.url
      link.download = activeDoc.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up URL without triggering re-render or reload
      const url = new URL(window.location.href)
      url.searchParams.delete("download")
      const newQuery = url.searchParams.toString()
      window.history.replaceState({}, "", url.pathname + (newQuery ? `?${newQuery}` : ""))
    }
  }, [searchParams, activeDoc.url, activeDoc.filename])

  // Fullscreen change listener
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  // Active file download trigger
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = activeDoc.url
    link.download = activeDoc.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Direct print trigger
  const handlePrint = () => {
    if (activeDoc.format === "pdf") {
      window.open(activeDoc.url, "_blank")?.print()
    } else {
      window.print()
    }
  }

  const handleSelectDoc = (docId: string) => {
    setSelectedDocId(docId)
    // On mobile, automatically switch to document view when user selects a file
    setActiveMobileTab("document")
  }

  const renderActiveViewport = () => {
    switch (activeDoc.format) {
      case "docx":
        return <DocxViewport doc={activeDoc} />
      case "pdf":
      default:
        return <CvPdfViewport doc={activeDoc} />
    }
  }

  return (
    <div className="min-h-screen bg-[#050609] text-white flex flex-col selection:bg-[#4AFFB4]/30 selection:text-white">
      {/* Top Header */}
      <CvHeaderBar
        activeDoc={activeDoc}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onDownload={handleDownload}
        onPrint={handlePrint}
        activeMobileTab={activeMobileTab}
        onTabChange={setActiveMobileTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: File Explorer (Desktop: always visible, Mobile: when explorer tab active) */}
          <div
            className={`md:col-span-4 lg:col-span-4 ${
              activeMobileTab === "explorer" ? "block" : "hidden md:block"
            }`}
          >
            <CvFileExplorer
              folders={folders}
              documents={documents}
              selectedDocId={selectedDocId}
              onSelectDoc={handleSelectDoc}
              contact={portfolio.contact}
            />
          </div>

          {/* Right Column: Dynamic Multi-Format Viewport (Desktop: always visible, Mobile: when document tab active) */}
          <div
            className={`md:col-span-8 lg:col-span-8 ${
              activeMobileTab === "document" ? "block" : "hidden md:block"
            }`}
          >
            <div
              ref={containerRef}
              className="w-full h-[calc(100vh-6.5rem)] min-h-[600px] rounded-2xl bg-[#090b10] border border-white/10 flex flex-col overflow-hidden shadow-2xl relative"
            >
              {renderActiveViewport()}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CvDossierViewer
