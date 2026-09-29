"use client"

import * as React from "react"
import { FileText, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Layers } from "lucide-react"
import type { VaultDocument } from "@/lib/cv/documents"

export interface DocxViewportProps {
  doc: VaultDocument
}

export function DocxViewport({ doc }: DocxViewportProps) {
  const pages = doc.previewPages || []
  const [currentPage, setCurrentPage] = React.useState(0)
  const [zoom, setZoom] = React.useState(100)
  const [containerWidth, setContainerWidth] = React.useState<number>(800)

  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null)
  const imageContainerRef = React.useRef<HTMLDivElement | null>(null)
  const touchStartDistRef = React.useRef<number | null>(null)
  const initialTouchZoomRef = React.useRef<number>(100)
  const currentRatioRef = React.useRef<number>(1)
  const isPinchingRef = React.useRef<boolean>(false)
  const lastTapRef = React.useRef<number>(0)
  const touchStartPosRef = React.useRef<{ x: number; y: number } | null>(null)

  // Track container width for responsive fit-to-width base sizing
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
  const baseWidth = isMobile
    ? Math.max(280, containerWidth - 16)
    : Math.min(Math.max(400, containerWidth - 48), 760)
  const currentTargetWidth = Math.round(baseWidth * (zoom / 100))

  // Mobile touch gestures: pinch-to-zoom & double-tap to toggle zoom
  React.useEffect(() => {
    const el = scrollContainerRef.current
    const target = imageContainerRef.current
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

        if (dx < 10 && dy < 10) {
          const now = Date.now()
          if (now - lastTapRef.current < 300) {
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

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1))
  }

  const handleZoomIn = () => setZoom((z) => Math.min(220, z + 15))
  const handleZoomOut = () => setZoom((z) => Math.max(60, z - 15))
  const handleResetZoom = () => setZoom(100)

  return (
    <div className="w-full h-full flex flex-col bg-[#090b10] select-none">
      {/* Top Document Controls Bar */}
      <div className="h-12 px-4 border-b border-white/10 bg-white/[0.02] backdrop-blur-md flex items-center justify-between text-xs text-white/60 font-mono">
        {/* Left: Page navigation */}
        <div className="flex items-center gap-2">
          {pages.length > 0 && (
            <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-lg p-0.5">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <span className="px-2 text-white/90 text-xs">
                Page {currentPage + 1} of {pages.length || 1}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= pages.length - 1}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          <span className="text-white/70 truncate hidden md:inline max-w-[280px]">
            {doc.title}
          </span>
        </div>

        {/* Right: Zoom & Download */}
        <div className="flex items-center gap-2">
          {pages.length > 0 && (
            <div className="hidden sm:flex items-center bg-white/[0.04] border border-white/10 rounded-lg p-0.5">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 60}
                className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 text-[11px] text-white/60 hover:text-white transition-colors cursor-pointer"
                title="Reset zoom to 100%"
                aria-label="Reset zoom to 100%"
              >
                {zoom}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 220}
                className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <a
            href={doc.url}
            download={doc.filename}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4AFFB4]/10 hover:bg-[#4AFFB4]/20 border border-[#4AFFB4]/30 text-[#4AFFB4] text-xs font-semibold transition-all cursor-pointer"
            title="Download original Microsoft Word document"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download .docx</span>
          </a>
        </div>
      </div>

      {/* Main Document Viewport Area */}
      <div className="relative flex-1 w-full overflow-hidden bg-[#12151c]">
        <div
          ref={scrollContainerRef}
          className="w-full h-full overflow-auto p-2 sm:p-8 custom-scrollbar touch-pan-x touch-pan-y"
        >
          {pages.length > 0 ? (
            <div
              ref={imageContainerRef}
              className="min-w-full w-fit mx-auto flex flex-col items-center justify-center origin-top py-2"
            >
              <div
                className="transition-[width] duration-100 ease-out shadow-2xl rounded-sm sm:rounded-xl overflow-hidden border border-white/10 bg-white shrink-0"
                style={{ width: `${currentTargetWidth}px` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pages[currentPage]}
                  alt={`Document statement page ${currentPage + 1}`}
                  className="w-full h-auto object-contain block"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-white my-auto h-full">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 max-w-md backdrop-blur-xl">
                <FileText className="w-10 h-10 text-[#4AFFB4] mx-auto mb-3" />
                <h3 className="text-base font-semibold">{doc.title}</h3>
                <p className="text-xs text-white/50 mt-1 mb-4">
                  Microsoft Word Document ({doc.sizeLabel})
                </p>
                <a
                  href={doc.url}
                  download={doc.filename}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4AFFB4] text-black font-semibold text-xs transition-transform hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {doc.filename}</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Floating Zoom Pill */}
        {pages.length > 0 && (
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

      {/* Bottom Thumbnail Strip */}
      {pages.length > 1 && (
        <div className="h-14 px-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-center gap-3 overflow-x-auto custom-scrollbar">
          {pages.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentPage(idx)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                currentPage === idx
                  ? "bg-[#4AFFB4]/15 border border-[#4AFFB4]/40 text-[#4AFFB4] font-medium shadow-sm"
                  : "bg-white/[0.02] border border-white/10 text-white/50 hover:text-white"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Page {idx + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default DocxViewport
