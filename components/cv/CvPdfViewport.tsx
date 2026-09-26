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
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null)
  const touchStartDistRef = React.useRef<number | null>(null)
  const initialTouchZoomRef = React.useRef<number>(100)
  const currentRatioRef = React.useRef<number>(1)

  // Load PDF.js library dynamically from local static assets
  React.useEffect(() => {
    let active = true

    const loadPdfJs = async () => {
      if (window.pdfjsLib) return window.pdfjsLib

      return new Promise<any>((resolve, reject) => {
        const existing = document.getElementById("pdfjs-local-script")
        if (existing) {
          if (window.pdfjsLib) {
            resolve(window.pdfjsLib)
            return
          }
          existing.addEventListener("load", () => resolve(window.pdfjsLib))
          existing.addEventListener("error", reject)
          return
        }

        const script = document.createElement("script")
        script.id = "pdfjs-local-script"
        script.src = "/assets/pdfjs/pdf.min.js"
        script.onload = () => {
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "/assets/pdfjs/pdf.worker.min.js"
            resolve(window.pdfjsLib)
          } else {
            reject(new Error("pdfjsLib not available"))
          }
        }
        script.onerror = () => {
          // Resilient CDN fallback if local asset fails
          const fallback = document.createElement("script")
          fallback.id = "pdfjs-cdn-fallback"
          fallback.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
          fallback.onload = () => {
            if (window.pdfjsLib) {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
              resolve(window.pdfjsLib)
            } else {
              reject(new Error("pdfjsLib not available from fallback"))
            }
          }
          fallback.onerror = reject
          document.head.appendChild(fallback)
        }
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
        // Calibrated DPR factor: 1.333 * Math.min(dpr, 1.6) produces razor-sharp rendering on Retina
        // while avoiding 3.0+ over-rasterization and cutting frame render time by ~45%
        const scale = (zoom / 100) * 1.333 * Math.min(dpr, 1.6)

        const renderPage = async (pageNum: number) => {
          const page = await pdf.getPage(pageNum)
          if (!active) return null

          const viewport = page.getViewport({ scale })

          const pageWrapper = document.createElement("div")
          pageWrapper.className =
            "rounded-sm shadow-xl overflow-hidden border border-white/10 bg-white transition-all duration-150 relative"
          pageWrapper.style.width = `${(viewport.width / (1.333 * Math.min(dpr, 1.6))) * (zoom / 100)}px`
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
          return pageWrapper
        }

        // Render Page 1 first for immediate visual reveal
        const page1Wrapper = await renderPage(1)
        if (!active || !page1Wrapper) return
        container.appendChild(page1Wrapper)
        setLoading(false)

        // Asynchronously render remaining pages in subsequent ticks without blocking UI
        for (let i = 2; i <= pdf.numPages; i++) {
          if (!active) return
          const nextWrapper = await renderPage(i)
          if (!active || !nextWrapper) return
          container.appendChild(nextWrapper)
        }
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

  // Mobile touch pinch-to-zoom gesture
  React.useEffect(() => {
    const el = scrollContainerRef.current
    const target = canvasContainerRef.current
    if (!el || !target) return

    const getDistance = (touches: TouchList) => {
      if (touches.length < 2) return 0
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.hypot(dx, dy)
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        touchStartDistRef.current = getDistance(e.touches)
        initialTouchZoomRef.current = zoom
        currentRatioRef.current = 1
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDistRef.current) {
        const currentDist = getDistance(e.touches)
        const ratio = currentDist / touchStartDistRef.current
        currentRatioRef.current = ratio
        // Apply smooth visual scale during active pinch
        target.style.transform = `scale(${ratio})`
        target.style.transformOrigin = "top center"
      }
    }

    const onTouchEnd = () => {
      if (touchStartDistRef.current && currentRatioRef.current !== 1) {
        const calculatedZoom = Math.round((initialTouchZoomRef.current * currentRatioRef.current) / 5) * 5
        const finalZoom = Math.min(180, Math.max(60, calculatedZoom))
        target.style.transform = ""
        setZoom(finalZoom)
      }
      touchStartDistRef.current = null
      currentRatioRef.current = 1
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchmove", onTouchMove, { passive: true })
    el.addEventListener("touchend", onTouchEnd, { passive: true })
    el.addEventListener("touchcancel", onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
      el.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [zoom])

  const handleZoomIn = () => setZoom((z) => Math.min(180, z + 15))
  const handleZoomOut = () => setZoom((z) => Math.max(60, z - 15))
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
            <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-lg p-0.5">
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
                className="px-1.5 sm:px-2 text-[10px] sm:text-[11px] text-white/60 hover:text-white transition-colors cursor-pointer"
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
          <div
            ref={scrollContainerRef}
            className="w-full h-full overflow-y-auto custom-scrollbar p-2 sm:p-6 pb-24 flex flex-col items-center gap-3 relative"
          >
            <div
              ref={canvasContainerRef}
              className="w-full flex flex-col items-center gap-3 max-w-4xl origin-top"
            />

            {/* Mobile Floating Zoom Pill for ergonomic thumb reach */}
            <div className="sm:hidden absolute bottom-4 right-4 z-30 flex items-center bg-[#0c1017]/90 backdrop-blur-xl border border-white/15 rounded-full p-1 shadow-2xl">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 active:scale-95 transition-all cursor-pointer"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 text-xs font-mono font-medium text-white/90 hover:text-[#4AFFB4] transition-colors cursor-pointer"
                title="Reset zoom"
                aria-label="Reset zoom"
              >
                {zoom}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 active:scale-95 transition-all cursor-pointer"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
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
