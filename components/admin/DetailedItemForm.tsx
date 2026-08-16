"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { GlassCard } from "@/components/ui/GlassCard"
import { ArrowLeft, Save, Plus, Trash2, Code2, ChevronDown, ChevronUp } from "lucide-react"
import { DetailedItemRow, DetailedItemInsert, DetailedItemUpdate } from "@/app/actions/detailed-items"

interface DetailedItemFormProps {
  initialData?: DetailedItemRow
  onSubmit: (data: DetailedItemInsert | DetailedItemUpdate) => Promise<void>
  title: string
}

export function DetailedItemForm({ initialData, onSubmit, title }: DetailedItemFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [type, setType] = React.useState<string>(initialData?.type || "project")
  const [customType, setCustomType] = React.useState<string>(
    initialData?.type && !["project", "experience", "education"].includes(initialData.type) ? initialData.type : ""
  )
  const [itemTitle, setItemTitle] = React.useState(initialData?.title || "")
  const [subtitle, setSubtitle] = React.useState(initialData?.subtitle || "")
  const [dateRange, setDateRange] = React.useState(initialData?.date_range || "")
  const [orderVal, setOrderVal] = React.useState(initialData?.order_val ?? 0)

  // Parse JSON payloads safely
  const initialContent = React.useMemo(() => {
    if (!initialData?.content) return {}
    if (typeof initialData.content === "object") return initialData.content as Record<string, any>
    if (typeof initialData.content === "string") {
      try { return JSON.parse(initialData.content) } catch { return {} }
    }
    return {}
  }, [initialData?.content])

  const initialDeepDive = React.useMemo(() => {
    if (!initialData?.deep_dive) return {}
    if (typeof initialData.deep_dive === "object") return initialData.deep_dive as Record<string, any>
    if (typeof initialData.deep_dive === "string") {
      try { return JSON.parse(initialData.deep_dive) } catch { return {} }
    }
    return {}
  }, [initialData?.deep_dive])

  // Raw JSON inputs
  const [rawContent, setRawContent] = React.useState(JSON.stringify(initialContent, null, 2))
  const [rawDeepDive, setRawDeepDive] = React.useState(JSON.stringify(initialDeepDive, null, 2))
  const [showRawJson, setShowRawJson] = React.useState(false)

  // Experience state
  const [expHighlights, setExpHighlights] = React.useState<string[]>(
    Array.isArray(initialContent?.highlights) ? initialContent.highlights : []
  )
  const [expDeepHighlights, setExpDeepHighlights] = React.useState<string[]>(
    Array.isArray(initialDeepDive?.highlights) ? initialDeepDive.highlights : []
  )

  // Education state
  const [eduGpa, setEduGpa] = React.useState(initialContent?.gpa || initialDeepDive?.gpa || "")
  const [eduDegree, setEduDegree] = React.useState(initialDeepDive?.degree || "")
  const [eduInstitution, setEduInstitution] = React.useState(initialDeepDive?.institution || "")
  const [eduHonours, setEduHonours] = React.useState(initialDeepDive?.honours || "")

  // Project state
  const [projTechStack, setProjTechStack] = React.useState<string>(
    Array.isArray(initialContent?.tech_stack)
      ? initialContent.tech_stack.join(", ")
      : Array.isArray(initialContent?.techStack)
      ? initialContent.techStack.join(", ")
      : ""
  )
  const [projGithubUrl, setProjGithubUrl] = React.useState(initialContent?.github_url || initialContent?.githubUrl || "")
  const [projLiveUrl, setProjLiveUrl] = React.useState(initialContent?.live_url || initialContent?.liveUrl || "")
  const [projFeatured, setProjFeatured] = React.useState<boolean>(Boolean(initialContent?.featured))
  const [projNotes, setProjNotes] = React.useState<string>(initialDeepDive?.notes || "")

  const activeType = type === "custom" ? customType : type

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      let finalContent: any = {}
      let finalDeepDive: any = {}

      if (showRawJson) {
        finalContent = JSON.parse(rawContent)
        finalDeepDive = JSON.parse(rawDeepDive)
      } else {
        if (activeType === "experience") {
          finalContent = { highlights: expHighlights }
          finalDeepDive = { highlights: expDeepHighlights }
        } else if (activeType === "education") {
          finalContent = { gpa: eduGpa }
          finalDeepDive = { gpa: eduGpa, degree: eduDegree, institution: eduInstitution, honours: eduHonours }
        } else if (activeType === "project") {
          const techArray = projTechStack.split(",").map(s => s.trim()).filter(Boolean)
          finalContent = {
            tech_stack: techArray,
            github_url: projGithubUrl,
            live_url: projLiveUrl,
            featured: projFeatured
          }
          finalDeepDive = { notes: projNotes }
        } else {
          finalContent = JSON.parse(rawContent)
          finalDeepDive = JSON.parse(rawDeepDive)
        }
      }

      await onSubmit({
        type: activeType || "custom",
        title: itemTitle,
        subtitle: subtitle || null,
        date_range: dateRange || null,
        order_val: Number(orderVal),
        content: finalContent,
        deep_dive: finalDeepDive
      })

      router.push("/admin/detailed-items")
    } catch (err: any) {
      setError(err?.message || "Failed to save item. Check JSON formatting if using raw editor.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/detailed-items")}
            className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-display text-white/90">{title}</h1>
            <p className="text-sm text-white/50">Manage detailed resume and portfolio database entry.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        <GlassCard className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white/90 border-b border-white/5 pb-3">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase text-white/50 mb-2">Item Type</label>
              <select
                value={["project", "experience", "education"].includes(type) ? type : "custom"}
                onChange={(e) => {
                  const val = e.target.value
                  setType(val)
                  if (val !== "custom") setCustomType("")
                }}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50"
              >
                <option value="project">Project</option>
                <option value="experience">Experience</option>
                <option value="education">Education</option>
                <option value="custom">Custom Type</option>
              </select>
            </div>

            {type === "custom" && (
              <div>
                <label className="block text-xs font-mono uppercase text-white/50 mb-2">Custom Type Name</label>
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="e.g. certification, award"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase text-white/50 mb-2">Title</label>
              <input
                type="text"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                placeholder="Item Title (e.g. Software Engineer)"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-white/50 mb-2">Subtitle / Subheading</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Company, institution, or description"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-white/50 mb-2">Date Range</label>
              <input
                type="text"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                placeholder="e.g. Apr 2025 - Mar 2026 or 2025"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-white/50 mb-2">Display Order (order_val)</label>
              <input
                type="number"
                value={orderVal}
                onChange={(e) => setOrderVal(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lume-primary/50"
              />
            </div>
          </div>
        </GlassCard>

        {/* Tailored Section */}
        {!showRawJson && activeType === "experience" && (
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
        )}

        {!showRawJson && activeType === "education" && (
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
        )}

        {!showRawJson && activeType === "project" && (
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
        )}

        {/* Raw JSON Toggle & Editor */}
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

        {/* Submit Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/detailed-items")}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-lume-primary text-black font-semibold rounded-xl hover:bg-lume-primary/90 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </form>
    </div>
  )
}
