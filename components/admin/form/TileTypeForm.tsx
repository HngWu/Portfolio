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

  // 3. EXPERIENCE TILE (Stackable Deck Support)
  if (type === "experience") {
    const rawItems: any[] = Array.isArray(content.items) && content.items.length > 0
      ? content.items
      : [
          {
            role: content.role || "Software Engineer Intern",
            company: content.company || "DBS Bank",
            date: content.date || "Apr 2025 - Mar 2026",
            category: "Enterprise & Fintech",
            highlights: content.highlights || [
              "Led full-stack system migrations and automated pipeline deployments",
              "Optimized data processing to speed up heavy application modules"
            ],
            deepDiveHighlights: deepDive.highlights || content.highlights || [
              "Migrated Martech Request Portal from MongoDB to MariaDB using Java Spring Boot APIs",
              "Automated CI/CD deployment pipelines using Jenkins on OpenShift"
            ],
          },
        ]

    const updateItem = (index: number, updatedFields: Record<string, any>) => {
      const copy = rawItems.map((item, idx) => (idx === index ? { ...item, ...updatedFields } : item))
      onChangeContent({
        ...content,
        role: copy[0]?.role || "",
        company: copy[0]?.company || "",
        date: copy[0]?.date || "",
        highlights: copy[0]?.highlights || [],
        items: copy,
      })
      onChangeDeepDive({
        ...deepDive,
        highlights: copy[0]?.deepDiveHighlights || copy[0]?.highlights || [],
        items: copy,
      })
    }

    const addItem = () => {
      const newItem = {
        role: "New Role Title",
        company: "Company Name",
        date: "2024 - Present",
        category: "Engineering",
        highlights: ["Contributed to core application modules and feature releases"],
        deepDiveHighlights: ["Architected and delivered high-impact engineering solutions"],
      }
      const copy = [...rawItems, newItem]
      onChangeContent({
        ...content,
        role: copy[0]?.role || "",
        company: copy[0]?.company || "",
        date: copy[0]?.date || "",
        highlights: copy[0]?.highlights || [],
        items: copy,
      })
      onChangeDeepDive({
        ...deepDive,
        highlights: copy[0]?.deepDiveHighlights || copy[0]?.highlights || [],
        items: copy,
      })
    }

    const removeItem = (index: number) => {
      if (rawItems.length <= 1) return
      const copy = rawItems.filter((_, idx) => idx !== index)
      onChangeContent({
        ...content,
        role: copy[0]?.role || "",
        company: copy[0]?.company || "",
        date: copy[0]?.date || "",
        highlights: copy[0]?.highlights || [],
        items: copy,
      })
      onChangeDeepDive({
        ...deepDive,
        highlights: copy[0]?.deepDiveHighlights || copy[0]?.highlights || [],
        items: copy,
      })
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h3 className="text-sm font-semibold text-white/90">Stackable Experience Roles ({rawItems.length})</h3>
            <p className="text-[11px] text-white/40 mt-0.5">
              Manage the 3D card deck. Cards are displayed in reverse-chronological order from top to bottom.
            </p>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 text-xs font-mono text-lume-primary hover:underline px-3 py-1.5 rounded-lg bg-lume-primary/10 hover:bg-lume-primary/20 transition-colors"
          >
            <Plus className="size-3.5" />
            <span>Add Role Card</span>
          </button>
        </div>

        <div className="space-y-6">
          {rawItems.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-5 relative group/card"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-lume-primary/10 border border-lume-primary/20 text-lume-primary font-bold">
                    #{idx + 1} {idx === 0 ? "(Top / Active Card)" : `(Peek ${idx})`}
                  </span>
                  <span className="text-xs font-medium text-white/80">
                    {item.role || "Untitled Role"} {item.company ? `· ${item.company}` : ""}
                  </span>
                </div>
                {rawItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remove this role card"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                    Role Title
                  </label>
                  <input
                    type="text"
                    value={item.role || ""}
                    onChange={(e) => updateItem(idx, { role: e.target.value })}
                    placeholder="e.g. Software Engineer Intern"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={item.company || ""}
                    onChange={(e) => updateItem(idx, { company: e.target.value })}
                    placeholder="e.g. DBS Bank"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                    Date Range
                  </label>
                  <input
                    type="text"
                    value={item.date || ""}
                    onChange={(e) => updateItem(idx, { date: e.target.value })}
                    placeholder="e.g. Apr 2025 - Mar 2026"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={item.category || ""}
                    onChange={(e) => updateItem(idx, { category: e.target.value })}
                    placeholder="e.g. Enterprise & Fintech / Web & 3D"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
                  />
                </div>
              </div>

              {renderListEditor(
                "Quick Pitch Highlights",
                item.highlights || [],
                (hls) => updateItem(idx, { highlights: hls }),
                "e.g. Led full-stack system migrations...",
                `exp-card-${idx}-hl`,
                "Summary bullet points shown on the front face."
              )}

              <div className="pt-3 border-t border-white/5">
                {renderListEditor(
                  "Deep Dive Technical Achievements",
                  item.deepDiveHighlights || item.highlights || [],
                  (hls) => updateItem(idx, { deepDiveHighlights: hls }),
                  "e.g. Migrated Martech Request Portal from MongoDB to MariaDB...",
                  `exp-card-${idx}-deep-hl`,
                  "Extended achievements shown in the Deep Dive mode."
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 4. EDUCATION TILE (Stackable Deck Support)
  if (type === "education") {
    const rawItems: any[] = Array.isArray(content.items) && content.items.length > 0
      ? content.items
      : [
          {
            degree: content.degree || "Diploma in Information Technology with Merit",
            institution: content.institution || "Nanyang Polytechnic",
            date: content.date || "Apr 2023 - Apr 2026",
            gpa: content.gpa || "3.91",
            honours: deepDive.honours || "Gold Medalist & Ngee Ann Kongsi Tertiary Award",
            level: "polytechnic",
            levelLabel: "Diploma",
          },
        ]

    const updateItem = (index: number, updatedFields: Record<string, any>) => {
      const copy = rawItems.map((item, idx) => (idx === index ? { ...item, ...updatedFields } : item))
      onChangeContent({
        ...content,
        degree: copy[0]?.degree || "",
        institution: copy[0]?.institution || "",
        date: copy[0]?.date || "",
        gpa: copy[0]?.gpa || "",
        items: copy,
      })
      onChangeDeepDive({
        ...deepDive,
        degree: copy[0]?.degree || "",
        institution: copy[0]?.institution || "",
        date: copy[0]?.date || "",
        gpa: copy[0]?.gpa || "",
        honours: copy[0]?.honours || "",
        items: copy,
      })
    }

    const addItem = () => {
      const newItem = {
        degree: "New Degree / Certificate",
        institution: "Institution Name",
        date: "2024 - 2028",
        gpa: "-",
        honours: "-",
        level: "university",
        levelLabel: "University",
      }
      const copy = [...rawItems, newItem]
      onChangeContent({
        ...content,
        degree: copy[0]?.degree || "",
        institution: copy[0]?.institution || "",
        date: copy[0]?.date || "",
        gpa: copy[0]?.gpa || "",
        items: copy,
      })
      onChangeDeepDive({
        ...deepDive,
        degree: copy[0]?.degree || "",
        institution: copy[0]?.institution || "",
        date: copy[0]?.date || "",
        gpa: copy[0]?.gpa || "",
        honours: copy[0]?.honours || "",
        items: copy,
      })
    }

    const removeItem = (index: number) => {
      if (rawItems.length <= 1) return
      const copy = rawItems.filter((_, idx) => idx !== index)
      onChangeContent({
        ...content,
        degree: copy[0]?.degree || "",
        institution: copy[0]?.institution || "",
        date: copy[0]?.date || "",
        gpa: copy[0]?.gpa || "",
        items: copy,
      })
      onChangeDeepDive({
        ...deepDive,
        degree: copy[0]?.degree || "",
        institution: copy[0]?.institution || "",
        date: copy[0]?.date || "",
        gpa: copy[0]?.gpa || "",
        honours: copy[0]?.honours || "",
        items: copy,
      })
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h3 className="text-sm font-semibold text-white/90">Stackable Education Levels ({rawItems.length})</h3>
            <p className="text-[11px] text-white/40 mt-0.5">
              Manage the 3D education stack. Items are displayed from top to bottom (NUS → NYP → O-Level → PSLE).
            </p>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 text-xs font-mono text-blue-400 hover:underline px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
          >
            <Plus className="size-3.5" />
            <span>Add Education Level</span>
          </button>
        </div>

        <div className="space-y-6">
          {rawItems.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-5 relative group/card"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-[#4A8FFF] font-bold">
                    #{idx + 1} {idx === 0 ? "(Top / Active Card)" : `(Peek ${idx})`}
                  </span>
                  <span className="text-xs font-medium text-white/80">
                    {item.degree || "Untitled Program"} {item.institution ? `· ${item.institution}` : ""}
                  </span>
                </div>
                {rawItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remove this education card"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                    Degree / Qualification Title
                  </label>
                  <input
                    type="text"
                    value={item.degree || ""}
                    onChange={(e) => updateItem(idx, { degree: e.target.value })}
                    placeholder="e.g. Bachelor of Computing in Computer Science"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    value={item.institution || ""}
                    onChange={(e) => updateItem(idx, { institution: e.target.value })}
                    placeholder="e.g. National University of Singapore"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                    Study Period / Date Range
                  </label>
                  <input
                    type="text"
                    value={item.date || ""}
                    onChange={(e) => updateItem(idx, { date: e.target.value })}
                    placeholder="e.g. Aug 2028 - Aug 2032"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                    GPA / Score
                  </label>
                  <input
                    type="text"
                    value={item.gpa || ""}
                    onChange={(e) => updateItem(idx, { gpa: e.target.value })}
                    placeholder="e.g. 3.91 / 4.00 or 251"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                    Level Badge Label
                  </label>
                  <input
                    type="text"
                    value={item.levelLabel || item.level || ""}
                    onChange={(e) =>
                      updateItem(idx, {
                        levelLabel: e.target.value,
                        level: e.target.value.toLowerCase(),
                      })
                    }
                    placeholder="e.g. University / Diploma / Secondary / Primary"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                    Honours / Awards & Distinctions
                  </label>
                  <input
                    type="text"
                    value={item.honours || ""}
                    onChange={(e) => updateItem(idx, { honours: e.target.value })}
                    placeholder="e.g. Gold Medalist & Ngee Ann Kongsi Tertiary Award"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>
          ))}
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
