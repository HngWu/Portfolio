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
      <GlassCard className="p-6 sm:p-8 space-y-6 bg-white/[0.01] border-white/5 rounded-3xl">
        <div className="border-b border-white/5 pb-3">
          <h2 className="text-lg font-semibold text-white/90">Experience Highlights</h2>
          <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
            Detailed accomplishment bullet points for Quick-Pitch and Deep-Dive modes.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60 font-medium">
              Quick-Pitch Bullet Highlights ({expHighlights.length})
            </label>
            <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">
              High-impact career highlights shown in the summary view.
            </p>
          </div>

          <div className="space-y-2.5">
            {expHighlights.map((hl, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  id={`payload-exp-highlight-${idx}`}
                  type="text"
                  value={hl}
                  onChange={(e) => {
                    const copy = [...expHighlights]
                    copy[idx] = e.target.value
                    setExpHighlights(copy)
                  }}
                  placeholder="e.g. Led architectural migration of core microservices..."
                  aria-label={`Quick-Pitch bullet highlight ${idx + 1}`}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setExpHighlights(expHighlights.filter((_, i) => i !== idx))}
                  aria-label={`Remove quick-pitch highlight ${idx + 1}`}
                  className="p-3 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                  title="Remove highlight"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}

            {expHighlights.length === 0 && (
              <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-white/30 font-mono">
                No quick-pitch highlights added yet.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setExpHighlights([...expHighlights, ""])}
            aria-label="Add Quick-Pitch Highlight"
            className="flex items-center gap-1.5 text-xs font-mono text-lume-primary hover:underline px-3 py-1.5 rounded-lg bg-lume-primary/10 hover:bg-lume-primary/20 transition-all"
          >
            <Plus className="size-3.5" /> Add Highlight
          </button>
        </div>

        <div className="space-y-3 pt-6 border-t border-white/5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60 font-medium">
              Deep-Dive Technical Highlights ({expDeepHighlights.length})
            </label>
            <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">
              Extended technical achievements and architecture metrics.
            </p>
          </div>

          <div className="space-y-2.5">
            {expDeepHighlights.map((hl, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  id={`payload-exp-deep-highlight-${idx}`}
                  type="text"
                  value={hl}
                  onChange={(e) => {
                    const copy = [...expDeepHighlights]
                    copy[idx] = e.target.value
                    setExpDeepHighlights(copy)
                  }}
                  placeholder="e.g. Achieved sub-second response times across 50,000 req/min..."
                  aria-label={`Deep-Dive technical highlight ${idx + 1}`}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setExpDeepHighlights(expDeepHighlights.filter((_, i) => i !== idx))}
                  aria-label={`Remove deep-dive highlight ${idx + 1}`}
                  className="p-3 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                  title="Remove deep-dive highlight"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}

            {expDeepHighlights.length === 0 && (
              <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-white/30 font-mono">
                No deep-dive highlights added yet.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setExpDeepHighlights([...expDeepHighlights, ""])}
            aria-label="Add Deep-Dive Highlight"
            className="flex items-center gap-1.5 text-xs font-mono text-lume-primary hover:underline px-3 py-1.5 rounded-lg bg-lume-primary/10 hover:bg-lume-primary/20 transition-all"
          >
            <Plus className="size-3.5" /> Add Deep-Dive Highlight
          </button>
        </div>
      </GlassCard>
    )
  }

  if (activeType === "education") {
    return (
      <GlassCard className="p-6 sm:p-8 space-y-6 bg-white/[0.01] border-white/5 rounded-3xl">
        <div className="border-b border-white/5 pb-3">
          <h2 className="text-lg font-semibold text-white/90">Education Details</h2>
          <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
            Academic standing, degrees, institutions, and honors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <div>
            <label htmlFor="payload-edu-gpa" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              GPA / Grade
            </label>
            <input
              id="payload-edu-gpa"
              type="text"
              value={eduGpa}
              onChange={(e) => setEduGpa(e.target.value)}
              placeholder="e.g. 3.91 / 4.00"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Cumulative score or honors standing.
            </p>
          </div>
          <div>
            <label htmlFor="payload-edu-degree" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Degree / Certificate
            </label>
            <input
              id="payload-edu-degree"
              type="text"
              value={eduDegree}
              onChange={(e) => setEduDegree(e.target.value)}
              placeholder="Diploma / Degree title"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-semibold"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Name of degree, diploma, or certificate awarded.
            </p>
          </div>
          <div>
            <label htmlFor="payload-edu-institution" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Institution
            </label>
            <input
              id="payload-edu-institution"
              type="text"
              value={eduInstitution}
              onChange={(e) => setEduInstitution(e.target.value)}
              placeholder="School / Academy name"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              University, polytechnic, or awarding body.
            </p>
          </div>
          <div>
            <label htmlFor="payload-edu-honours" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Honours / Awards
            </label>
            <input
              id="payload-edu-honours"
              type="text"
              value={eduHonours}
              onChange={(e) => setEduHonours(e.target.value)}
              placeholder="Gold Medalist, Director's List, etc."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Distinctions, scholarships, or academic accolades.
            </p>
          </div>
        </div>
      </GlassCard>
    )
  }

  if (activeType === "project") {
    return (
      <GlassCard className="p-6 sm:p-8 space-y-6 bg-white/[0.01] border-white/5 rounded-3xl">
        <div className="border-b border-white/5 pb-3">
          <h2 className="text-lg font-semibold text-white/90">Project Details</h2>
          <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
            Tech stack, deployment URLs, featured state, and architectural notes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <div className="md:col-span-2">
            <label htmlFor="payload-proj-tech-stack" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Tech Stack (comma-separated)
            </label>
            <input
              id="payload-proj-tech-stack"
              type="text"
              value={projTechStack}
              onChange={(e) => setProjTechStack(e.target.value)}
              placeholder="Next.js 16, Supabase, Tailwind CSS, Redis"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Comma-delimited technologies used in development.
            </p>
          </div>

          <div>
            <label htmlFor="payload-proj-github-url" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              GitHub URL
            </label>
            <input
              id="payload-proj-github-url"
              type="url"
              value={projGithubUrl}
              onChange={(e) => setProjGithubUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Source code repository URL.
            </p>
          </div>

          <div>
            <label htmlFor="payload-proj-live-url" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Live Demo URL
            </label>
            <input
              id="payload-proj-live-url"
              type="url"
              value={projLiveUrl}
              onChange={(e) => setProjLiveUrl(e.target.value)}
              placeholder="https://demo.app"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Live staging or production deployment URL.
            </p>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="payload-proj-featured" className="flex items-center gap-3 cursor-pointer p-3.5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors">
              <input
                id="payload-proj-featured"
                type="checkbox"
                checked={projFeatured}
                onChange={(e) => setProjFeatured(e.target.checked)}
                className="size-4 rounded border-white/10 bg-black/50 text-lume-primary focus:ring-0 cursor-pointer"
              />
              <div>
                <span className="text-sm font-medium text-white/90">Featured Project</span>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  Highlight project prominently with glowing accent on the portfolio grid.
                </p>
              </div>
            </label>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="payload-proj-notes" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Deep-Dive Notes
            </label>
            <textarea
              id="payload-proj-notes"
              value={projNotes}
              onChange={(e) => setProjNotes(e.target.value)}
              rows={3}
              placeholder="Architecture notes, latency metrics, or internal details"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all resize-y"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Technical decisions, performance metrics, and implementation notes.
            </p>
          </div>
        </div>
      </GlassCard>
    )
  }

  return null
}
