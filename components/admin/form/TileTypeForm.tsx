"use client"

import * as React from "react"
import { Plus, Trash2, Tag, Link2 } from "lucide-react"

interface TileTypeFormProps {
  type: string
  content: Record<string, any>
  deepDive: Record<string, any>
  onChangeContent: (content: Record<string, any>) => void
  onChangeDeepDive: (deepDive: Record<string, any>) => void
}

export function TileTypeForm({
  type,
  content,
  deepDive,
  onChangeContent,
  onChangeDeepDive,
}: TileTypeFormProps) {
  const updateContentField = (key: string, value: any) => {
    onChangeContent({ ...content, [key]: value })
  }

  const updateDeepDiveField = (key: string, value: any) => {
    onChangeDeepDive({ ...deepDive, [key]: value })
  }

  // Helper for bullet list editing
  const renderListEditor = (
    label: string,
    items: string[],
    onUpdate: (newItems: string[]) => void,
    placeholder: string,
    idPrefix: string,
    helperText?: string
  ) => {
    const list = Array.isArray(items) ? items : []

    const handleAdd = () => {
      onUpdate([...list, ""])
    }

    const handleChange = (index: number, val: string) => {
      const updated = [...list]
      updated[index] = val
      onUpdate(updated)
    }

    const handleRemove = (index: number) => {
      onUpdate(list.filter((_, idx) => idx !== index))
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60 font-medium">
              {label} ({list.length})
            </label>
            {helperText && (
              <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">{helperText}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add item to ${label}`}
            className="flex items-center gap-1.5 text-xs font-mono text-lume-primary hover:underline px-2.5 py-1 rounded-lg bg-lume-primary/10 hover:bg-lume-primary/20 transition-colors"
          >
            <Plus className="size-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {list.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                id={`${idPrefix}-${idx}`}
                type="text"
                value={item}
                onChange={(e) => handleChange(idx, e.target.value)}
                placeholder={placeholder}
                aria-label={`${label} item ${idx + 1}`}
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                aria-label={`Remove ${label} item ${idx + 1}`}
                className="p-3 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                title="Remove item"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}

          {list.length === 0 && (
            <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-white/30 font-mono">
              No items added yet. Click &quot;Add Item&quot; to begin.
            </div>
          )}
        </div>
      </div>
    )
  }

  // 1. HERO TILE
  if (type === "hero") {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="hero-role" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Role / Headline
          </label>
          <input
            id="hero-role"
            type="text"
            value={content.role || ""}
            onChange={(e) => updateContentField("role", e.target.value)}
            placeholder="e.g. Software Engineer / Creative Developer"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-semibold"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Primary headline displayed prominently in the hero section.
          </p>
        </div>

        <div>
          <label htmlFor="hero-mark" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Identity Badge / Mark
          </label>
          <input
            id="hero-mark"
            type="text"
            value={content.mark || ""}
            onChange={(e) => updateContentField("mark", e.target.value)}
            placeholder="e.g. Available for Q3 2026 / Systems Architect"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Sub-badge or availability tagline displayed alongside the hero.
          </p>
        </div>

        <div>
          <label htmlFor="hero-description" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Quick Bio Description
          </label>
          <textarea
            id="hero-description"
            rows={3}
            value={content.description || ""}
            onChange={(e) => updateContentField("description", e.target.value)}
            placeholder="Enter brief high-level bio..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all resize-y"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Concise overview shown in the default Quick-Pitch view.
          </p>
        </div>

        <div>
          <label htmlFor="hero-deep-description" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Deep Dive Biography
          </label>
          <textarea
            id="hero-deep-description"
            rows={4}
            value={deepDive.description || content.description || ""}
            onChange={(e) => updateDeepDiveField("description", e.target.value)}
            placeholder="Extended detailed background for Deep Dive view..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all resize-y"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Comprehensive background and architectural philosophy for Deep Dive view.
          </p>
        </div>
      </div>
    )
  }

  // 2. PROJECT TILE
  if (type === "project") {
    const techStackStr = Array.isArray(content.tech_stack)
      ? content.tech_stack.join(", ")
      : content.tech_stack || ""

    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="project-name" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Project Name
          </label>
          <input
            id="project-name"
            type="text"
            value={content.name || ""}
            onChange={(e) => updateContentField("name", e.target.value)}
            placeholder="e.g. TriviaDuel / SecureAsset"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-semibold"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Project title as rendered on card headers and modal dialogs.
          </p>
        </div>

        <div>
          <label htmlFor="project-description" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Short Description
          </label>
          <textarea
            id="project-description"
            rows={2}
            value={content.description || ""}
            onChange={(e) => updateContentField("description", e.target.value)}
            placeholder="High-level description of what the project does..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all resize-y"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Succinct one-to-two sentence overview of the product.
          </p>
        </div>

        <div>
          <label htmlFor="project-tech-stack" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium flex items-center gap-1.5">
            <Tag className="size-3.5 text-lume-primary" />
            <span>Tech Stack (Comma Separated)</span>
          </label>
          <input
            id="project-tech-stack"
            type="text"
            value={techStackStr}
            onChange={(e) => {
              const tags = e.target.value.split(",").map((s) => s.trim())
              updateContentField("tech_stack", tags)
            }}
            placeholder="e.g. Next.js 16, React 19, SQLite, GSAP"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            List of core frameworks and libraries, separated by commas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <div>
            <label htmlFor="project-github-url" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium flex items-center gap-1.5">
              <Link2 className="size-3.5 text-blue-400" />
              <span>GitHub URL</span>
            </label>
            <input
              id="project-github-url"
              type="text"
              value={content.github_url || ""}
              onChange={(e) => updateContentField("github_url", e.target.value)}
              placeholder="https://github.com/..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Public or private source repository link.
            </p>
          </div>
          <div>
            <label htmlFor="project-live-url" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium flex items-center gap-1.5">
              <Link2 className="size-3.5 text-emerald-400" />
              <span>Live Demo URL</span>
            </label>
            <input
              id="project-live-url"
              type="text"
              value={content.live_url || ""}
              onChange={(e) => updateContentField("live_url", e.target.value)}
              placeholder="https://..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Production deployment or live staging URL.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <label htmlFor="project-featured" className="flex items-center gap-3 cursor-pointer p-3.5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors">
            <input
              id="project-featured"
              type="checkbox"
              checked={Boolean(content.featured)}
              onChange={(e) => updateContentField("featured", e.target.checked)}
              className="size-4 rounded bg-black/50 border-white/10 text-lume-primary focus:ring-0 cursor-pointer"
            />
            <div>
              <span className="text-sm text-white/90 font-medium">Highlight as Featured Project</span>
              <p className="text-[11px] text-white/40 leading-relaxed">Displays a glowing accent badge on the bento tile.</p>
            </div>
          </label>
        </div>

        <div className="pt-4 border-t border-white/5">
          <label htmlFor="project-notes" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Deep Dive Architectural Notes
          </label>
          <textarea
            id="project-notes"
            rows={3}
            value={deepDive.notes || ""}
            onChange={(e) => updateDeepDiveField("notes", e.target.value)}
            placeholder="Technical details, engineering decisions, and sub-second metrics..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all resize-y"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Detailed performance benchmarks and design rationale for Deep Dive mode.
          </p>
        </div>
      </div>
    )
  }

  // 3. EXPERIENCE TILE
  if (type === "experience") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <div>
            <label htmlFor="experience-role" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Role Title
            </label>
            <input
              id="experience-role"
              type="text"
              value={content.role || ""}
              onChange={(e) => updateContentField("role", e.target.value)}
              placeholder="e.g. Software Engineer Intern"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-semibold"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Designation held during the tenure.
            </p>
          </div>
          <div>
            <label htmlFor="experience-company" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Company / Organization
            </label>
            <input
              id="experience-company"
              type="text"
              value={content.company || ""}
              onChange={(e) => updateContentField("company", e.target.value)}
              placeholder="e.g. DBS Bank"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-semibold"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Employer or sponsoring institution.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="experience-date" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Date Range
          </label>
          <input
            id="experience-date"
            type="text"
            value={content.date || ""}
            onChange={(e) => updateContentField("date", e.target.value)}
            placeholder="e.g. Apr 2025 - Mar 2026"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Start and conclusion period of employment.
          </p>
        </div>

        {renderListEditor(
          "Quick Pitch Highlights",
          content.highlights || [],
          (items) => updateContentField("highlights", items),
          "e.g. Led full-stack system migrations...",
          "experience-highlight",
          "High-impact bullet points for scanning."
        )}

        <div className="pt-4 border-t border-white/5">
          {renderListEditor(
            "Deep Dive Achievements",
            deepDive.highlights || content.highlights || [],
            (items) => updateDeepDiveField("highlights", items),
            "e.g. Migrated Martech Request Portal from MongoDB to MariaDB...",
            "experience-deep-highlight",
            "Detailed technical accomplishments and quantified impact."
          )}
        </div>
      </div>
    )
  }

  // 4. EDUCATION TILE
  if (type === "education") {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="education-degree" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Degree / Certification
          </label>
          <input
            id="education-degree"
            type="text"
            value={content.degree || deepDive.degree || ""}
            onChange={(e) => {
              updateContentField("degree", e.target.value)
              updateDeepDiveField("degree", e.target.value)
            }}
            placeholder="e.g. Diploma in Information Technology with Merit"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-semibold"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Name of degree, diploma, or educational program.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <div>
            <label htmlFor="education-institution" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Institution
            </label>
            <input
              id="education-institution"
              type="text"
              value={content.institution || deepDive.institution || ""}
              onChange={(e) => {
                updateContentField("institution", e.target.value)
                updateDeepDiveField("institution", e.target.value)
              }}
              placeholder="e.g. Nanyang Polytechnic"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              University, polytechnic, or awarding body.
            </p>
          </div>
          <div>
            <label htmlFor="education-gpa" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              GPA / Grade
            </label>
            <input
              id="education-gpa"
              type="text"
              value={content.gpa || deepDive.gpa || ""}
              onChange={(e) => {
                updateContentField("gpa", e.target.value)
                updateDeepDiveField("gpa", e.target.value)
              }}
              placeholder="e.g. 3.91 / 4.00"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Cumulative score or honors standing.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="education-date" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Study Period / Date
          </label>
          <input
            id="education-date"
            type="text"
            value={content.date || deepDive.date || ""}
            onChange={(e) => {
              updateContentField("date", e.target.value)
              updateDeepDiveField("date", e.target.value)
            }}
            placeholder="e.g. 2023 - 2026"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Duration or graduation year.
          </p>
        </div>

        <div>
          <label htmlFor="education-honours" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Honours / Awards
          </label>
          <input
            id="education-honours"
            type="text"
            value={deepDive.honours || ""}
            onChange={(e) => updateDeepDiveField("honours", e.target.value)}
            placeholder="e.g. Gold Medalist & Ngee Ann Kongsi Tertiary Award"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Distinctions, scholarships, or academic accolades.
          </p>
        </div>
      </div>
    )
  }

  // 5. SKILL TILE
  if (type === "skill") {
    const tags = Array.isArray(content.tags) ? content.tags : []

    const handleAddTag = () => {
      updateContentField("tags", [...tags, ""])
    }

    const handleTagChange = (index: number, val: string) => {
      const updated = [...tags]
      updated[index] = val
      updateContentField("tags", updated)
    }

    const handleRemoveTag = (index: number) => {
      updateContentField("tags", tags.filter((_, idx) => idx !== index))
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/60 font-medium">
              Skill Tags ({tags.length})
            </label>
            <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">
              Interactive tags rendered within the skills marquee and matrix.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddTag}
            aria-label="Add Skill Tag"
            className="flex items-center gap-1.5 text-xs font-mono text-lume-primary hover:underline px-2.5 py-1 rounded-lg bg-lume-primary/10 hover:bg-lume-primary/20 transition-colors"
          >
            <Plus className="size-3.5" />
            <span>Add Skill Tag</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {tags.map((tag, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-lume-primary/60 focus-within:ring-1 focus-within:ring-lume-primary/20 transition-all"
            >
              <input
                id={`skill-tag-${idx}`}
                type="text"
                value={tag}
                onChange={(e) => handleTagChange(idx, e.target.value)}
                placeholder="e.g. Next.js 16"
                aria-label={`Skill tag ${idx + 1}`}
                className="w-full bg-transparent py-1 text-xs text-white placeholder:text-white/25 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => handleRemoveTag(idx)}
                aria-label={`Remove skill tag ${idx + 1}`}
                className="p-1 text-white/40 hover:text-red-400 rounded-lg transition-colors shrink-0"
                title="Remove tag"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>

        {tags.length === 0 && (
          <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-white/30 font-mono">
            No skill tags added. Click &quot;Add Skill Tag&quot; to begin.
          </div>
        )}
      </div>
    )
  }

  // 6. STAT TILE
  if (type === "stat") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <div>
            <label htmlFor="stat-value" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Metric Value / Figure
            </label>
            <input
              id="stat-value"
              type="text"
              value={content.value || ""}
              onChange={(e) => updateContentField("value", e.target.value)}
              placeholder="e.g. 12+ / 1yr / 99.9%"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono font-bold"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Large stat counter value (supports suffix/symbols).
            </p>
          </div>
          <div>
            <label htmlFor="stat-label" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Metric Label
            </label>
            <input
              id="stat-label"
              type="text"
              value={content.label || ""}
              onChange={(e) => updateContentField("label", e.target.value)}
              placeholder="e.g. Projects / Repositories"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Short descriptive caption below the numeric figure.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="stat-deep-label" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Deep Dive Label Extension
          </label>
          <input
            id="stat-deep-label"
            type="text"
            value={deepDive.label || content.label || ""}
            onChange={(e) => updateDeepDiveField("label", e.target.value)}
            placeholder="e.g. Total Open Source Repositories"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Extended context label displayed when deep dive mode is active.
          </p>
        </div>
      </div>
    )
  }

  // 7. CONTACT TILE
  if (type === "contact") {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="contact-email" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Primary Email Address
          </label>
          <input
            id="contact-email"
            type="email"
            value={content.email || ""}
            onChange={(e) => updateContentField("email", e.target.value)}
            placeholder="e.g. developer@example.com"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Direct email contact address for copy and click actions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <div>
            <label htmlFor="contact-github" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              GitHub Profile URL
            </label>
            <input
              id="contact-github"
              type="text"
              value={content.github || ""}
              onChange={(e) => updateContentField("github", e.target.value)}
              placeholder="https://github.com/..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Public GitHub developer profile link.
            </p>
          </div>
          <div>
            <label htmlFor="contact-linkedin" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              LinkedIn Profile URL
            </label>
            <input
              id="contact-linkedin"
              type="text"
              value={content.linkedin || ""}
              onChange={(e) => updateContentField("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Professional LinkedIn profile link.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <div>
            <label htmlFor="contact-timezone" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Timezone / Location
            </label>
            <input
              id="contact-timezone"
              type="text"
              value={deepDive.timezone || ""}
              onChange={(e) => updateDeepDiveField("timezone", e.target.value)}
              placeholder="e.g. Singapore (SST - UTC+8)"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Standard operational timezone and country.
            </p>
          </div>
          <div>
            <label htmlFor="contact-availability" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Availability Status
            </label>
            <input
              id="contact-availability"
              type="text"
              value={deepDive.availability || ""}
              onChange={(e) => updateDeepDiveField("availability", e.target.value)}
              placeholder="e.g. Available Q3 2026"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-lume-primary placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono font-medium"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Current hiring / contract availability status.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 8. AWARD TILE
  if (type === "award") {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="award-name" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Award Name
          </label>
          <input
            id="award-name"
            type="text"
            value={content.name || ""}
            onChange={(e) => updateContentField("name", e.target.value)}
            placeholder="e.g. WorldSkills Singapore Silver Medalist"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-semibold"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Official title of the award or competition award.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <div>
            <label htmlFor="award-issuer" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Issuer / Organization
            </label>
            <input
              id="award-issuer"
              type="text"
              value={content.issuer || ""}
              onChange={(e) => updateContentField("issuer", e.target.value)}
              placeholder="e.g. WorldSkills / NYP"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Conferring organization or organizer.
            </p>
          </div>
          <div>
            <label htmlFor="award-date" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Date Awarded
            </label>
            <input
              id="award-date"
              type="text"
              value={content.date || ""}
              onChange={(e) => updateContentField("date", e.target.value)}
              placeholder="e.g. Aug 2025"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Month and year received.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="award-desc" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Award Description
          </label>
          <textarea
            id="award-desc"
            rows={3}
            value={content.desc || ""}
            onChange={(e) => updateContentField("desc", e.target.value)}
            placeholder="Brief details regarding the achievement..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all resize-y"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Brief summary of criteria, challenge scope, and achievement.
          </p>
        </div>
      </div>
    )
  }

  // Generic / Default fallback
  return (
    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-xs text-white/60 font-mono leading-relaxed space-y-1">
      <p className="font-semibold text-white/80">Custom Type Schema: &quot;{type}&quot;</p>
      <p className="text-white/40 text-[11px]">
        Use the Raw JSON editor to configure arbitrary attributes, or select a standard category above.
      </p>
    </div>
  )
}
