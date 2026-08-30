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
  const isCustomType = type === "custom" || !["project", "experience", "education"].includes(type)

  return (
    <GlassCard className="p-6 sm:p-8 space-y-6 bg-white/[0.01] border-white/5 rounded-3xl">
      <div className="border-b border-white/5 pb-3">
        <h2 className="text-lg font-semibold text-white/90">Basic Information</h2>
        <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
          Primary metadata and classification for this detailed entity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        <div>
          <label htmlFor="basic-item-type" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Item Type <span className="text-lume-primary">*</span>
          </label>
          <select
            id="basic-item-type"
            value={["project", "experience", "education"].includes(type) ? type : "custom"}
            onChange={(e) => {
              const val = e.target.value
              setType(val)
              if (val !== "custom") {
                setCustomType("")
              } else if (!customType && !["project", "experience", "education"].includes(type)) {
                setCustomType(type)
              }
            }}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono cursor-pointer"
          >
            <option value="project" className="bg-[#0f0f0f]">Project</option>
            <option value="experience" className="bg-[#0f0f0f]">Experience</option>
            <option value="education" className="bg-[#0f0f0f]">Education</option>
            <option value="custom" className="bg-[#0f0f0f]">Custom Type</option>
          </select>
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Select the category schema for this item.
          </p>
        </div>

        {isCustomType && (
          <div>
            <label htmlFor="basic-custom-type" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
              Custom Type Name <span className="text-lume-primary">*</span>
            </label>
            <input
              id="basic-custom-type"
              type="text"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              placeholder="e.g. certification, award"
              required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
            />
            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
              Unique identifier slug for custom item schemas.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="basic-item-title" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Title <span className="text-lume-primary">*</span>
          </label>
          <input
            id="basic-item-title"
            type="text"
            value={itemTitle}
            onChange={(e) => setItemTitle(e.target.value)}
            placeholder="Item Title (e.g. Software Engineer)"
            required
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Primary title or role name displayed prominently.
          </p>
        </div>

        <div>
          <label htmlFor="basic-item-subtitle" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Subtitle / Subheading
          </label>
          <input
            id="basic-item-subtitle"
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Company, institution, or description"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Company, school, or secondary contextual description.
          </p>
        </div>

        <div>
          <label htmlFor="basic-item-date-range" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Date Range
          </label>
          <input
            id="basic-item-date-range"
            type="text"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            placeholder="e.g. Apr 2025 - Mar 2026 or 2025"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Period of active engagement or graduation year.
          </p>
        </div>

        <div>
          <label htmlFor="basic-item-order-val" className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-2 font-medium">
            Display Order (order_val)
          </label>
          <input
            id="basic-item-order-val"
            type="number"
            value={orderVal}
            onChange={(e) => setOrderVal(Number(e.target.value))}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-lume-primary/60 focus:ring-1 focus:ring-lume-primary/20 transition-all font-mono"
          />
          <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
            Integer index for sorting order (lower values appear first).
          </p>
        </div>
      </div>
    </GlassCard>
  )
}
