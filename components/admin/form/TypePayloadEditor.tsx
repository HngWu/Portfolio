"use client"

import * as React from "react"
import { GlassCard } from "@/components/ui/GlassCard"
import { Plus, Trash2 } from "lucide-react"

interface TypePayloadEditorProps {
  activeType: string
  // Experience props
  expHighlights: string[]
  setExpHighlights: (val: string[]) => void
  expDeepHighlights: string[]
  setExpDeepHighlights: (val: string[]) => void
  // Education props
  eduGpa: string
  setEduGpa: (val: string) => void
  eduDegree: string
  setEduDegree: (val: string) => void
  eduInstitution: string
  setEduInstitution: (val: string) => void
  eduHonours: string
  setEduHonours: (val: string) => void
  // Project props
  projTechStack: string
  setProjTechStack: (val: string) => void
  projGithubUrl: string
  setProjGithubUrl: (val: string) => void
  projLiveUrl: string
  setProjLiveUrl: (val: string) => void
  projFeatured: boolean
  setProjFeatured: (val: boolean) => void
  projNotes: string
  setProjNotes: (val: string) => void
}

export function TypePayloadEditor({
  activeType,
  expHighlights,
  setExpHighlights,
  expDeepHighlights,
  setExpDeepHighlights,
  eduGpa,
  setEduGpa,
  eduDegree,
  setEduDegree,
  eduInstitution,
  setEduInstitution,
  eduHonours,
  setEduHonours,
  projTechStack,
  setProjTechStack,
  projGithubUrl,
  setProjGithubUrl,
  projLiveUrl,
  setProjLiveUrl,
  projFeatured,
  setProjFeatured,
  projNotes,
  setProjNotes
}: TypePayloadEditorProps) {
  if (activeType === "experience") {
    return (
      <GlassCard className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white/90 border-b border-white/5 pb-3">Experience Highlights</h2>

        <div className="space-y-4">
          <label className="block text-xs font-mono uppercase text-white/50">Quick-Pitch Bullet Highlights</label>
          {expHighlights.map((hl, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={hl}
                onChange={(e) => {
                  const copy = [...expHighlights]
                  copy[idx] = e.target.value
                  setExpHighlights(copy)
                }}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-lume-primary/50"
              />
              <button
                type="button"
                onClick={() => setExpHighlights(expHighlights.filter((_, i) => i !== idx))}
                className="p-2 text-red-400/60 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setExpHighlights([...expHighlights, ""])}
            className="flex items-center gap-2 text-xs font-mono text-lume-primary bg-lume-primary/10 hover:bg-lume-primary/20 px-3 py-1.5 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Highlight
          </button>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <label className="block text-xs font-mono uppercase text-white/50">Deep-Dive Technical Highlights</label>
          {expDeepHighlights.map((hl, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={hl}
                onChange={(e) => {
                  const copy = [...expDeepHighlights]
                  copy[idx] = e.target.value
                  setExpDeepHighlights(copy)
                }}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-lume-primary/50"
              />
              <button
                type="button"
                onClick={() => setExpDeepHighlights(expDeepHighlights.filter((_, i) => i !== idx))}
                className="p-2 text-red-400/60 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setExpDeepHighlights([...expDeepHighlights, ""])}
            className="flex items-center gap-2 text-xs font-mono text-lume-primary bg-lume-primary/10 hover:bg-lume-primary/20 px-3 py-1.5 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Deep-Dive Highlight
          </button>
        </div>
      </GlassCard>
    )
  }

  if (activeType === "education") {
    return (
      <GlassCard className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white/90 border-b border-white/5 pb-3">Education Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">GPA</label>
            <input
              type="text"
              value={eduGpa}
              onChange={(e) => setEduGpa(e.target.value)}
              placeholder="e.g. 3.91"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">Degree / Certificate</label>
            <input
              type="text"
              value={eduDegree}
              onChange={(e) => setEduDegree(e.target.value)}
              placeholder="Diploma / Degree title"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">Institution</label>
            <input
              type="text"
              value={eduInstitution}
              onChange={(e) => setEduInstitution(e.target.value)}
              placeholder="School / Academy name"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">Honours / Awards</label>
            <input
              type="text"
              value={eduHonours}
              onChange={(e) => setEduHonours(e.target.value)}
              placeholder="Gold Medalist, Director's List, etc."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50"
            />
          </div>
        </div>
      </GlassCard>
    )
  }

  if (activeType === "project") {
    return (
      <GlassCard className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white/90 border-b border-white/5 pb-3">Project Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">Tech Stack (comma-separated)</label>
            <input
              type="text"
              value={projTechStack}
              onChange={(e) => setProjTechStack(e.target.value)}
              placeholder="Next.js 16, Supabase, Tailwind CSS, Redis"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">GitHub URL</label>
            <input
              type="url"
              value={projGithubUrl}
              onChange={(e) => setProjGithubUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">Live Demo URL</label>
            <input
              type="url"
              value={projLiveUrl}
              onChange={(e) => setProjLiveUrl(e.target.value)}
              placeholder="https://demo.app"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="featured-check"
              checked={projFeatured}
              onChange={(e) => setProjFeatured(e.target.checked)}
              className="size-4 rounded border-white/10 bg-black/40 text-lume-primary focus:ring-0"
            />
            <label htmlFor="featured-check" className="text-sm font-medium text-white/90">
              Featured Project
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">Deep-Dive Notes</label>
            <textarea
              value={projNotes}
              onChange={(e) => setProjNotes(e.target.value)}
              rows={3}
              placeholder="Architecture notes, latency metrics, or internal details"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50 resize-y"
            />
          </div>
        </div>
      </GlassCard>
    )
  }

  return null
}
