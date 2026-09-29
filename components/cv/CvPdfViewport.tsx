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
  const [containerWidth, setContainerWidth] = React.useState<number>(800)

  const canvasContainerRef = React.useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null)
  const touchStartDistRef = React.useRef<number | null>(null)
  const initialTouchZoomRef = React.useRef<number>(100)
  const currentRatioRef = React.useRef<number>(1)
  const isPinchingRef = React.useRef<boolean>(false)
  const lastTapRef = React.useRef<number>(0)
  const touchStartPosRef = React.useRef<{ x: number; y: number } | null>(null)

  const pdfDocRef = React.useRef<any>(null)
  const renderTasksRef = React.useRef<Map<number, any>>(new Map())

  // Track scroll container width for responsive fit-to-width base sizing
  React.useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    const updateSize = () => {
      if (el.clientWidth > 0) {
        setContainerWidth(el.clientWidth)
      }
    }
    updateSize()

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width
        if (width > 0) {
          setContainerWidth(width)
        }
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const isMobile = containerWidth < 640
  // On mobile: fit to screen width with 16px total margin (8px padding per side)
  // On desktop: fit comfortably up to standard 760px document reading width
  const baseWidth = isMobile
    ? Math.max(280, containerWidth - 16)
    : Math.min(Math.max(400, containerWidth - 48), 760)
  const currentTargetWidth = Math.round(baseWidth * (zoom / 100))

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

        pdfDocRef.current = pdf
        setNumPages(pdf.numPages)
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
  }, [activeUrl, reloadCounter])

  // Responsive page rendering and instantaneous zoom updates without layout blink
  React.useEffect(() => {
    let active = true
    const pdf = pdfDocRef.current
    const container = canvasContainerRef.current
    if (!pdf || !container || !useCanvas || numPages === 0) return

    // Immediately update existing wrappers for instantaneous 60fps visual zoom feedback
    const existingWrappers = container.querySelectorAll<HTMLDivElement>(".cv-pdf-page-wrapper")
    existingWrappers.forEach((wrapper) => {
      const aspect = Number(wrapper.dataset.aspectRatio) || (841.89 / 595.28)
      wrapper.style.width = `${currentTargetWidth}px`
      wrapper.style.height = `${Math.round(currentTargetWidth * aspect)}px`
    })

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1

    const renderPage = async (pageNum: number) => {
      try {
        const page = await pdf.getPage(pageNum)
        if (!active) return

        const unscaledViewport = page.getViewport({ scale: 1.0 })
        const aspectRatio = unscaledViewport.height / unscaledViewport.width
        const targetHeight = Math.round(currentTargetWidth * aspectRatio)

        // Cancel previous in-flight render task for this specific page if any
        const existingTask = renderTasksRef.current.get(pageNum)
        if (existingTask) {
          try {
            existingTask.cancel()
          } catch {}
          renderTasksRef.current.delete(pageNum)
        }

        let wrapper = container.querySelector<HTMLDivElement>(`#cv-pdf-page-${pageNum}`)
        let canvas: HTMLCanvasElement

        if (!wrapper) {
          wrapper = document.createElement("div")
          wrapper.id = `cv-pdf-page-${pageNum}`
          wrapper.className =
            "cv-pdf-page-wrapper rounded-sm shadow-xl overflow-hidden border border-white/10 bg-white transition-[width,height] duration-75 relative shrink-0"
          wrapper.dataset.aspectRatio = String(aspectRatio)
          wrapper.style.width = `${currentTargetWidth}px`
          wrapper.style.height = `${targetHeight}px`

          canvas = document.createElement("canvas")
          canvas.className = "cv-pdf-canvas"
          canvas.style.width = "100%"
          canvas.style.height = "100%"
          canvas.style.display = "block"
          wrapper.appendChild(canvas)
          container.appendChild(wrapper)
        } else {
          wrapper.dataset.aspectRatio = String(aspectRatio)
          wrapper.style.width = `${currentTargetWidth}px`
          wrapper.style.height = `${targetHeight}px`
          canvas = wrapper.querySelector("canvas") || document.createElement("canvas")
          if (!canvas.parentElement) {
            wrapper.appendChild(canvas)
          }
        }

        // Calibrate render scale for crisp high-DPI display without raster bloat
        const cssScale = currentTargetWidth / unscaledViewport.width
        const renderScale = cssScale * Math.min(dpr, 2.0)
        const viewport = page.getViewport({ scale: renderScale })

        canvas.width = viewport.width
        canvas.height = viewport.height

        const context = canvas.getContext("2d")
        if (context) {
          const renderTask = page.render({ canvasContext: context, viewport })
          renderTasksRef.current.set(pageNum, renderTask)
          await renderTask.promise
          renderTasksRef.current.delete(pageNum)
        }
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.warn(`Error rendering page ${pageNum}:`, err)
        }
      }
    }

    // Render Page 1 first for immediate presentation, then subsequent pages sequentially
    const renderAll = async () => {
      await renderPage(1)
      if (!active) return

      for (let i = 2; i <= numPages; i++) {
        if (!active) return
        await renderPage(i)
      }
    }

    renderAll()

    return () => {
      active = false
      renderTasksRef.current.forEach((task) => {
        try {
          task.cancel()
        } catch {}
      })
      renderTasksRef.current.clear()
    }
  }, [currentTargetWidth, numPages, useCanvas])

  // Mobile touch gestures: non-passive 2-finger pinch-to-zoom & double-tap to toggle zoom
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
        isPinchingRef.current = true
        touchStartDistRef.current = getDistance(e.touches)
        initialTouchZoomRef.current = zoom
        currentRatioRef.current = 1
      } else if (e.touches.length === 1) {
        touchStartPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isPinchingRef.current && touchStartDistRef.current) {
        if (e.cancelable) e.preventDefault()
        const currentDist = getDistance(e.touches)
        const ratio = currentDist / touchStartDistRef.current
        currentRatioRef.current = ratio
        // Real-time smooth pinch scaling
        target.style.transform = `scale(${ratio})`
        target.style.transformOrigin = "50% 0"
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (isPinchingRef.current && touchStartDistRef.current) {
        const ratio = currentRatioRef.current
        target.style.transform = ""
        isPinchingRef.current = false
        touchStartDistRef.current = null

        if (Math.abs(ratio - 1) > 0.05) {
          const calculatedZoom = Math.round((initialTouchZoomRef.current * ratio) / 5) * 5
          const finalZoom = Math.min(220, Math.max(60, calculatedZoom))
          setZoom(finalZoom)
        }
        currentRatioRef.current = 1
      } else if (e.changedTouches.length === 1 && !isPinchingRef.current && touchStartPosRef.current) {
        const endTouch = e.changedTouches[0]
        const dx = Math.abs(endTouch.clientX - touchStartPosRef.current.x)
        const dy = Math.abs(endTouch.clientY - touchStartPosRef.current.y)
        touchStartPosRef.current = null

        // If tap moved less than 10px, treat as potential double-tap
        if (dx < 10 && dy < 10) {
          const now = Date.now()
          if (now - lastTapRef.current < 300) {
            // Double-tap detected: toggle between 100% and 150%
            setZoom((current) => (current > 100 ? 100 : 150))
            lastTapRef.current = 0
          } else {
            lastTapRef.current = now
          }
        }
      }
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd, { passive: true })
    el.addEventListener("touchcancel", onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
      el.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [zoom])

  const handleZoomIn = () => setZoom((z) => Math.min(220, z + 15))
  const handleZoomOut = () => setZoom((z) => Math.max(60, z - 15))
  const handleResetZoom = () => setZoom(100)

  const handleReload = () => {
    if (canvasContainerRef.current) {
      canvasContainerRef.current.innerHTML = ""
    }
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
          {/* Zoom controls (Active for Canvas View, visible on sm+ screens) */}
          {useCanvas && (
            <div className="hidden sm:flex items-center bg-white/[0.04] border border-white/10 rounded-lg p-0.5">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 60}
                className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-1.5 sm:px-2 text-[10px] sm:text-[11px] text-white/60 hover:text-white transition-colors cursor-pointer"
                title="Reset zoom to 100%"
                aria-label="Reset zoom to 100%"
              >
                {zoom}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 220}
                className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Zoom in"
                aria-label="Zoom in"
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
        {/* Loading Spinner on initial load */}
        {loading && numPages === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 font-mono text-xs gap-3 z-20 bg-[#12151c]/80 backdrop-blur-sm">
            <div className="w-6 h-6 border-2 border-[#4AFFB4]/20 border-t-[#4AFFB4] rounded-full animate-spin" />
            <span>Rendering High-Resolution Document...</span>
          </div>
        )}

        {useCanvas ? (
          /* PDF.js Canvas Rendering Container with sleek Custom Scrollbar and pan-x pan-y */
          <div
            ref={scrollContainerRef}
            className="w-full h-full overflow-auto custom-scrollbar p-2 sm:p-6 pb-24 touch-pan-x touch-pan-y"
          >
            <div
              ref={canvasContainerRef}
              className="min-w-full w-fit mx-auto flex flex-col items-center gap-3 origin-top py-2"
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

        {/* Mobile Floating Zoom Pill - permanently docked in viewport bottom-right */}
        {useCanvas && (
          <div className="sm:hidden absolute bottom-4 right-4 z-30 flex items-center bg-[#0c1017]/95 backdrop-blur-xl border border-white/15 rounded-full p-1 shadow-[0_4px_20px_rgba(0,0,0,0.6)] select-none">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 60}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2.5 text-xs font-mono font-medium text-white/90 hover:text-[#4AFFB4] transition-colors cursor-pointer"
              title="Reset zoom to 100%"
              aria-label="Reset zoom to 100%"
            >
              {zoom}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 220}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CvPdfViewport
