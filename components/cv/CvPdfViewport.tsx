"use client"

import * as React from "react"
import {
  FileText,
  ExternalLink,
  RefreshCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import type { VaultDocument } from "@/lib/cv/documents"

export interface CvPdfViewportProps {
  containerRef?: React.RefObject<HTMLDivElement | null>
  doc?: VaultDocument
  pdfUrl?: string
}

declare global {
  interface Window {
    pdfjsLib?: any
  }
}

export function CvPdfViewport({
  containerRef,
  doc,
  pdfUrl = "/resume.pdf",
}: CvPdfViewportProps) {
  const activeUrl = doc?.url || pdfUrl
  const activeFilename = doc?.filename || "resume.pdf"
  const activeSize = doc?.sizeLabel || "Official Document"

  const [loading, setLoading] = React.useState(true)
  const [numPages, setNumPages] = React.useState(0)
  const [zoom, setZoom] = React.useState(100)
  const [useCanvas, setUseCanvas] = React.useState(true)
  const [reloadCounter, setReloadCounter] = React.useState(0)
  const canvasContainerRef = React.useRef<HTMLDivElement | null>(null)

  // Load PDF.js library dynamically
  React.useEffect(() => {
    let active = true

    const loadPdfJs = async () => {
      if (window.pdfjsLib) return window.pdfjsLib

      return new Promise<any>((resolve, reject) => {
        const existing = document.getElementById("pdfjs-cdn-script")
        if (existing) {
          existing.addEventListener("load", () => resolve(window.pdfjsLib))
          existing.addEventListener("error", reject)
          return
        }

        const script = document.createElement("script")
        script.id = "pdfjs-cdn-script"
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        script.onload = () => {
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
            resolve(window.pdfjsLib)
          } else {
            reject(new Error("pdfjsLib not available"))
          }
        }
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    setLoading(true)

    loadPdfJs()
      .then(async (pdfjs) => {
        if (!active) return
        const loadingTask = pdfjs.getDocument(activeUrl)
        const pdf = await loadingTask.promise
        if (!active) return

        setNumPages(pdf.numPages)

        // Render pages into container
        const container = canvasContainerRef.current
        if (!container) return

        container.innerHTML = ""

        const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
        const scale = (zoom / 100) * 1.5 * Math.min(dpr, 2)

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          if (!active) return

          const viewport = page.getViewport({ scale })

          const pageWrapper = document.createElement("div")
          pageWrapper.className =
            "rounded-xl shadow-2xl overflow-hidden border border-white/10 bg-white transition-all duration-150 relative"
          pageWrapper.style.width = `${(viewport.width / (1.5 * Math.min(dpr, 2))) * (zoom / 100)}px`
          pageWrapper.style.maxWidth = "100%"

          const canvas = document.createElement("canvas")
          canvas.width = viewport.width
          canvas.height = viewport.height
          canvas.style.width = "100%"
          canvas.style.height = "auto"
          canvas.style.display = "block"

          const context = canvas.getContext("2d")
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise
          }

          pageWrapper.appendChild(canvas)
          container.appendChild(pageWrapper)
        }

        setLoading(false)
      })
      .catch((err) => {
        console.warn("PDF.js render fallback to iframe:", err)
        if (active) {
          setUseCanvas(false)
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [activeUrl, zoom, reloadCounter])

  const handleZoomIn = () => setZoom((z) => Math.min(160, z + 15))
  const handleZoomOut = () => setZoom((z) => Math.max(70, z - 15))
  const handleResetZoom = () => setZoom(100)

  const handleReload = () => {
    setReloadCounter((prev) => prev + 1)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[600px] flex flex-col overflow-hidden bg-[#090b10] select-none"
    >
      {/* Modern Minimalist Viewport Chrome Bar */}
      <div className="h-11 px-4 border-b border-white/10 bg-[#0c1017] backdrop-blur-xl flex items-center justify-between text-xs text-white/50 font-mono select-none">
        {/* Document Title & Pages */}
        <div className="flex items-center gap-2.5 truncate">
          <FileText className="w-3.5 h-3.5 text-[#4AFFB4] shrink-0" />
          <span className="text-white/90 font-medium truncate">{activeFilename}</span>
          <span className="text-white/20">|</span>
          <span className="text-[11px] text-white/40 shrink-0">{activeSize}</span>
          {numPages > 1 && (
            <>
              <span className="text-white/20 hidden sm:inline">|</span>
              <span className="text-[11px] text-[#4AFFB4] font-mono hidden sm:inline">
                {numPages} Pages
              </span>
            </>
          )}
        </div>

        {/* Viewport Actions & Zoom Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Zoom controls (Active for Canvas View) */}
          {useCanvas && (
            <div className="hidden sm:flex items-center bg-white/[0.04] border border-white/10 rounded-lg p-0.5">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 text-[11px] text-white/60 hover:text-white transition-colors cursor-pointer"
                title="Reset zoom"
              >
                {zoom}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleReload}
            title="Reload document"
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/60 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#4AFFB4]" : ""}`} />
            <span className="hidden md:inline">Reload</span>
          </button>

          <a
            href={activeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/60 hover:text-[#4AFFB4] transition-colors flex items-center gap-1"
            title="Open raw PDF file in new browser tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Open Native</span>
          </a>
        </div>
      </div>

      {/* Main Canvas / Native Document Viewport Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-[#12151c]">
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 font-mono text-xs gap-3 z-20 bg-[#12151c]/80 backdrop-blur-sm">
            <div className="w-6 h-6 border-2 border-[#4AFFB4]/20 border-t-[#4AFFB4] rounded-full animate-spin" />
            <span>Rendering High-Resolution Document...</span>
          </div>
        )}

        {useCanvas ? (
          /* PDF.js Canvas Rendering Container with sleek Custom Scrollbar */
          <div className="w-full h-full overflow-y-auto custom-scrollbar p-4 sm:p-8 pb-20 flex flex-col items-center gap-6">
            <div
              ref={canvasContainerRef}
              className="w-full flex flex-col items-center gap-8 max-w-4xl"
            />
          </div>
        ) : (
          /* Native Fallback Iframe */
          <iframe
            key={`${activeUrl}-${reloadCounter}`}
            src={`${activeUrl}#view=FitH`}
            title={`${activeFilename} Preview`}
            className="w-full h-full border-none"
          />
        )}
      </div>
    </div>
  )
}

export default CvPdfViewport
