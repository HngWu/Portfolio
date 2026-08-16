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
    <GlassCard className="p-6 space-y-4">
      <button
        type="button"
        onClick={() => setShowRawJson(!showRawJson)}
        className="flex items-center justify-between w-full text-left text-sm font-mono text-white/70 hover:text-white"
      >
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-lume-primary" />
          <span>Advanced Raw JSON Editors (content & deep_dive)</span>
        </div>
        {showRawJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showRawJson && (
        <div className="space-y-6 pt-4 border-t border-white/5">
          <div>
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">Content JSON</label>
            <textarea
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              rows={6}
              className="w-full font-mono text-xs bg-black/60 border border-white/10 rounded-xl p-4 text-emerald-400 focus:outline-none focus:border-lume-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">Deep Dive JSON</label>
            <textarea
              value={rawDeepDive}
              onChange={(e) => setRawDeepDive(e.target.value)}
              rows={6}
              className="w-full font-mono text-xs bg-black/60 border border-white/10 rounded-xl p-4 text-emerald-400 focus:outline-none focus:border-lume-primary/50"
            />
          </div>
        </div>
      )}
    </GlassCard>
  )
}
