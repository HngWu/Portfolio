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

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1))
  }

  const handleZoomIn = () => setZoom((z) => Math.min(160, z + 15))
  const handleZoomOut = () => setZoom((z) => Math.max(70, z - 15))
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
      <div className="flex-1 w-full overflow-auto p-4 sm:p-8 flex items-start justify-center bg-[#12151c] custom-scrollbar">
        {pages.length > 0 ? (
          <div
            className="transition-all duration-200 ease-out shadow-2xl rounded-xl overflow-hidden border border-white/10 bg-white"
            style={{ width: `${zoom}%`, maxWidth: `${Math.max(650, zoom * 8)}px` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pages[currentPage]}
              alt={`Document statement page ${currentPage + 1}`}
              className="w-full h-auto object-contain block"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-white my-auto">
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
