"use client"

import * as React from "react"
import { Plus, Trash2, Tag, Link2, Star, Sparkles } from "lucide-react"

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
    placeholder: string
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
            {label} ({list.length})
          </label>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1 text-[10px] font-mono text-lume-primary hover:underline"
          >
            <Plus className="size-3" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-2">
          {list.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleChange(idx, e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50"
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
              >
                <Trash2 className="size-3.5" />
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
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
            Role / Headline
          </label>
          <input
            type="text"
            value={content.role || ""}
            onChange={(e) => updateContentField("role", e.target.value)}
            placeholder="e.g. Software Engineer / Creative Developer"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
            Identity Badge / Mark
          </label>
          <input
            type="text"
            value={content.mark || ""}
            onChange={(e) => updateContentField("mark", e.target.value)}
            placeholder="e.g. Available for Q3 2026 / Systems Architect"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-mono"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
            Quick Bio Description
          </label>
          <textarea
            rows={3}
            value={content.description || ""}
            onChange={(e) => updateContentField("description", e.target.value)}
            placeholder="Enter brief high-level bio..."
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
            Deep Dive Biography
          </label>
          <textarea
            rows={4}
            value={deepDive.description || content.description || ""}
            onChange={(e) => updateDeepDiveField("description", e.target.value)}
            placeholder="Extended detailed background for Deep Dive view..."
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50"
          />
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
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
            Project Name
          </label>
          <input
            type="text"
            value={content.name || ""}
            onChange={(e) => updateContentField("name", e.target.value)}
            placeholder="e.g. TriviaDuel / SecureAsset"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-semibold"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
            Short Description
          </label>
          <textarea
            rows={2}
            value={content.description || ""}
            onChange={(e) => updateContentField("description", e.target.value)}
            placeholder="High-level description of what the project does..."
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Tag className="size-3 text-lume-primary" />
            <span>Tech Stack (Comma Separated)</span>
          </label>
          <input
            type="text"
            value={techStackStr}
            onChange={(e) => {
              const tags = e.target.value.split(",").map((s) => s.trim())
              updateContentField("tech_stack", tags)
            }}
            placeholder="e.g. Next.js 16, React 19, SQLite, GSAP"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-mono"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Link2 className="size-3 text-blue-400" />
              <span>GitHub URL</span>
            </label>
            <input
              type="text"
              value={content.github_url || ""}
              onChange={(e) => updateContentField("github_url", e.target.value)}
              placeholder="https://github.com/..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Link2 className="size-3 text-emerald-400" />
              <span>Live Demo URL</span>
            </label>
            <input
              type="text"
              value={content.live_url || ""}
              onChange={(e) => updateContentField("live_url", e.target.value)}
              placeholder="https://..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-mono"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(content.featured)}
              onChange={(e) => updateContentField("featured", e.target.checked)}
              className="rounded bg-black/40 border-white/10 text-lume-primary focus:ring-0"
            />
            <span className="text-xs text-white/80 font-medium">Highlight as Featured Project</span>
          </label>
        </div>

        <div className="pt-3 border-t border-white/5">
          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
            Deep Dive Architectural Notes
          </label>
          <textarea
            rows={3}
            value={deepDive.notes || ""}
            onChange={(e) => updateDeepDiveField("notes", e.target.value)}
            placeholder="Technical details, engineering decisions, and sub-second metrics..."
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50"
          />
        </div>
      </div>
    )
  }

  // 3. EXPERIENCE TILE
  if (type === "experience") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
              Role Title
            </label>
            <input
              type="text"
              value={content.role || ""}
              onChange={(e) => updateContentField("role", e.target.value)}
              placeholder="e.g. Software Engineer Intern"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-semibold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
              Company / Organization
            </label>
            <input
              type="text"
              value={content.company || ""}
              onChange={(e) => updateContentField("company", e.target.value)}
              placeholder="e.g. DBS Bank"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
            Date Range
          </label>
          <input
            type="text"
            value={content.date || ""}
            onChange={(e) => updateContentField("date", e.target.value)}
            placeholder="e.g. Apr 2025 - Mar 2026"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-mono"
          />
        </div>

        {renderListEditor(
          "Quick Pitch Highlights",
          content.highlights || [],
          (items) => updateContentField("highlights", items),
          "e.g. Led full-stack system migrations..."
        )}

        <div className="pt-3 border-t border-white/5">
          {renderListEditor(
            "Deep Dive Achievements",
            deepDive.highlights || content.highlights || [],
            (items) => updateDeepDiveField("highlights", items),
            "e.g. Migrated Martech Request Portal from MongoDB to MariaDB..."
          )}
        </div>
      </div>
    )
  }

  // 4. EDUCATION TILE
  if (type === "education") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
            Degree / Certification
          </label>
          <input
            type="text"
            value={content.degree || deepDive.degree || ""}
            onChange={(e) => {
              updateContentField("degree", e.target.value)
              updateDeepDiveField("degree", e.target.value)
            }}
            placeholder="e.g. Diploma in Information Technology with Merit"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
              Institution
            </label>
            <input
              type="text"
              value={content.institution || deepDive.institution || ""}
              onChange={(e) => {
                updateContentField("institution", e.target.value)
                updateDeepDiveField("institution", e.target.value)
              }}
              placeholder="e.g. Nanyang Polytechnic"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
              GPA / Grade
            </label>
            <input
              type="text"
              value={content.gpa || deepDive.gpa || ""}
              onChange={(e) => {
                updateContentField("gpa", e.target.value)
                updateDeepDiveField("gpa", e.target.value)
              }}
              placeholder="e.g. 3.91 / 4.00"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
            Honours / Awards
          </label>
          <input
            type="text"
            value={deepDive.honours || ""}
            onChange={(e) => updateDeepDiveField("honours", e.target.value)}
            placeholder="e.g. Gold Medalist & Ngee Ann Kongsi Tertiary Award"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50"
          />
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
          <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
            Skill Tags ({tags.length})
          </label>
          <button
            type="button"
            onClick={handleAddTag}
            className="flex items-center gap-1 text-[10px] font-mono text-lume-primary hover:underline"
          >
            <Plus className="size-3" />
            <span>Add Skill Tag</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {tags.map((tag, idx) => (
            <div key={idx} className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl p-1.5">
              <input
                type="text"
                value={tag}
                onChange={(e) => handleTagChange(idx, e.target.value)}
                placeholder="e.g. Next.js 16"
                className="w-full bg-transparent px-2 py-1 text-xs text-white focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => handleRemoveTag(idx)}
                className="p-1 text-white/30 hover:text-red-400 rounded-lg shrink-0"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 6. STAT TILE
  if (type === "stat") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
              Metric Value / Figure
            </label>
            <input
              type="text"
              value={content.value || ""}
              onChange={(e) => updateContentField("value", e.target.value)}
              placeholder="e.g. 12+ / 1yr / 99.9%"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
              Metric Label
            </label>
            <input
              type="text"
              value={content.label || ""}
              onChange={(e) => updateContentField("label", e.target.value)}
              placeholder="e.g. Projects / Repositories"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
            Deep Dive Label Extension
          </label>
          <input
            type="text"
            value={deepDive.label || content.label || ""}
            onChange={(e) => updateDeepDiveField("label", e.target.value)}
            placeholder="e.g. Total Open Source Repositories"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50"
          />
        </div>
      </div>
    )
  }

  // 7. CONTACT TILE
  if (type === "contact") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
            Primary Email Address
          </label>
          <input
            type="email"
            value={content.email || ""}
            onChange={(e) => updateContentField("email", e.target.value)}
            placeholder="e.g. developer@example.com"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-mono"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
              GitHub Profile URL
            </label>
            <input
              type="text"
              value={content.github || ""}
              onChange={(e) => updateContentField("github", e.target.value)}
              placeholder="https://github.com/..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
              LinkedIn Profile URL
            </label>
            <input
              type="text"
              value={content.linkedin || ""}
              onChange={(e) => updateContentField("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
              Timezone / Location
            </label>
            <input
              type="text"
              value={deepDive.timezone || ""}
              onChange={(e) => updateDeepDiveField("timezone", e.target.value)}
              placeholder="e.g. Singapore (SST - UTC+8)"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
              Availability Status
            </label>
            <input
              type="text"
              value={deepDive.availability || ""}
              onChange={(e) => updateDeepDiveField("availability", e.target.value)}
              placeholder="e.g. Available Q3 2026"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-medium text-lume-primary"
            />
          </div>
        </div>
      </div>
    )
  }

  // 8. AWARD TILE
  if (type === "award") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
            Award Name
          </label>
          <input
            type="text"
            value={content.name || ""}
            onChange={(e) => updateContentField("name", e.target.value)}
            placeholder="e.g. WorldSkills Singapore Silver Medalist"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
              Issuer / Organization
            </label>
            <input
              type="text"
              value={content.issuer || ""}
              onChange={(e) => updateContentField("issuer", e.target.value)}
              placeholder="e.g. WorldSkills / NYP"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
              Date Awarded
            </label>
            <input
              type="text"
              value={content.date || ""}
              onChange={(e) => updateContentField("date", e.target.value)}
              placeholder="e.g. Aug 2025"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
            Award Description
          </label>
          <textarea
            rows={3}
            value={content.desc || ""}
            onChange={(e) => updateContentField("desc", e.target.value)}
            placeholder="Brief details regarding the achievement..."
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-lume-primary/50"
          />
        </div>
      </div>
    )
  }

  // Generic / Default fallback
  return (
    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-xs text-white/50 font-mono leading-relaxed">
      Custom type &quot;{type}&quot; detected. Use the Raw JSON editor to configure arbitrary attributes, or select a standard category above.
    </div>
  )
}
