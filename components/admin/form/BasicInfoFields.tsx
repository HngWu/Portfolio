"use client"

import * as React from "react"
import { GlassCard } from "@/components/ui/GlassCard"

interface BasicInfoFieldsProps {
  type: string
  setType: (val: string) => void
  customType: string
  setCustomType: (val: string) => void
  itemTitle: string
  setItemTitle: (val: string) => void
  subtitle: string
  setSubtitle: (val: string) => void
  dateRange: string
  setDateRange: (val: string) => void
  orderVal: number
  setOrderVal: (val: number) => void
}

export function BasicInfoFields({
  type,
  setType,
  customType,
  setCustomType,
  itemTitle,
  setItemTitle,
  subtitle,
  setSubtitle,
  dateRange,
  setDateRange,
  orderVal,
  setOrderVal
}: BasicInfoFieldsProps) {
  return (
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
  )
}
