"use client"

import * as React from "react"
import { GlassCard } from "@/components/ui/GlassCard"
import { Code2, ChevronDown, ChevronUp } from "lucide-react"

interface RawJsonEditorProps {
  showRawJson: boolean
  setShowRawJson: (val: boolean) => void
  rawContent: string
  setRawContent: (val: string) => void
  rawDeepDive: string
  setRawDeepDive: (val: string) => void
}

export function RawJsonEditor({
  showRawJson,
  setShowRawJson,
  rawContent,
  setRawContent,
  rawDeepDive,
  setRawDeepDive
}: RawJsonEditorProps) {
  return (
    <GlassCard className="p-6 sm:p-8 space-y-4 bg-white/[0.01] border-white/5 rounded-3xl">
      <button
        type="button"
        id="raw-json-toggle-btn"
        aria-expanded={showRawJson}
        aria-controls="raw-json-editor-panel"
        onClick={() => setShowRawJson(!showRawJson)}
        className="flex items-center justify-between w-full text-left text-sm font-mono text-white/70 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          <Code2 className="size-4 text-lume-primary" />
          <span className="font-semibold">Advanced Raw JSON Editors (content & deep_dive)</span>
        </div>
        {showRawJson ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>

      {showRawJson && (
        <div id="raw-json-editor-panel" role="region" aria-labelledby="raw-json-toggle-btn" className="space-y-6 pt-4 border-t border-white/5">
          <div>
            <label htmlFor="raw-content-json" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Content JSON
            </label>
            <textarea
              id="raw-content-json"
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              rows={6}
              className="w-full font-mono text-xs bg-black/60 border border-white/10 rounded-xl p-4 text-emerald-400 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all resize-y"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Raw JSON representation of the summary payload.
            </p>
          </div>

          <div>
            <label htmlFor="raw-deep-dive-json" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Deep Dive JSON
            </label>
            <textarea
              id="raw-deep-dive-json"
              value={rawDeepDive}
              onChange={(e) => setRawDeepDive(e.target.value)}
              rows={6}
              className="w-full font-mono text-xs bg-black/60 border border-white/10 rounded-xl p-4 text-emerald-400 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all resize-y"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Raw JSON representation of the deep dive payload.
            </p>
          </div>
        </div>
      )}
    </GlassCard>
  )
}
