"use client"

import * as React from "react"
import { Mail, Check, Github, Linkedin, Sparkles, Briefcase, MapPin } from "lucide-react"
import type { PortfolioContent } from "@/lib/content/portfolio"

export interface CvOverviewPanelProps {
  portfolio: PortfolioContent
}

export function CvOverviewPanel({ portfolio }: CvOverviewPanelProps) {
  const [copied, setCopied] = React.useState(false)

  const hero = portfolio.hero
  const contact = portfolio.contact
  const skills = portfolio.skills?.flatMap((s) => s.tags) || []
  const experienceCount = portfolio.experience?.length || 0
  const projectCount = portfolio.projects?.length || 0

  const handleCopyEmail = () => {
    if (!contact?.email) return
    navigator.clipboard.writeText(contact.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <aside className="w-full flex flex-col gap-5 text-white">
      {/* Profile Card */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#4AFFB4]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#4AFFB4]/10 border border-[#4AFFB4]/30 text-[#4AFFB4] text-[11px] font-mono font-medium tracking-wide mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4AFFB4] animate-pulse" />
              {contact?.availability || "AVAILABLE FOR SELECT OPPORTUNITIES"}
            </div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-white/90">
              {hero?.mark || "Software Engineer"}
            </h1>
            <p className="text-sm font-mono text-[#4AFFB4]/90 mt-1">
              {hero?.role || "Full Stack & Creative Developer"}
            </p>
          </div>
        </div>

        {contact?.timezone && (
          <div className="flex items-center gap-1.5 text-xs text-white/40 mt-3 font-mono">
            <MapPin className="w-3.5 h-3.5 text-white/40" />
            <span>Timezone: {contact.timezone}</span>
          </div>
        )}

        <p className="text-sm text-white/60 mt-4 leading-relaxed">
          {hero?.description ||
            "Senior engineer focused on high-performance web systems, interactive 3D web applications, and refined user experiences."}
        </p>
      </div>

      {/* Highlights & Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
            <Briefcase className="w-3.5 h-3.5 text-[#4AFFB4]" />
            <span>Positions</span>
          </div>
          <p className="text-2xl font-bold font-display text-white mt-1">
            {experienceCount}+
          </p>
          <p className="text-[11px] text-white/40">Engineering roles</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#4AFFB4]" />
            <span>Projects</span>
          </div>
          <p className="text-2xl font-bold font-display text-white mt-1">
            {projectCount}+
          </p>
          <p className="text-[11px] text-white/40">Featured builds</p>
        </div>
      </div>

      {/* Core Competencies */}
      {skills.length > 0 && (
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
          <h2 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3">
            Core Competencies
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 18).map((skill, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-md bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 text-white/70 text-xs font-medium transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Direct Contact Links */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col gap-3">
        <h2 className="text-xs font-mono uppercase tracking-wider text-white/50">
          Direct Connect
        </h2>

        {contact?.email && (
          <button
            type="button"
            onClick={handleCopyEmail}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs text-white/80 hover:text-white transition-all cursor-pointer group active:scale-[0.99]"
            title="Click to copy email address"
          >
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-4 h-4 text-[#4AFFB4] shrink-0" />
              <span className="font-mono truncate">{contact.email}</span>
            </div>
            {copied ? (
              <span className="flex items-center gap-1 text-[11px] font-mono text-[#4AFFB4] shrink-0">
                <Check className="w-3.5 h-3.5" /> Copied
              </span>
            ) : (
              <span className="text-[11px] font-mono text-white/40 group-hover:text-white/70 shrink-0">
                Copy
              </span>
            )}
          </button>
        )}

        <div className="flex items-center gap-2">
          {contact?.github && (
            <a
              href={contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs text-white/70 hover:text-white transition-all"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          )}
          {contact?.linkedin && (
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs text-white/70 hover:text-white transition-all"
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
          )}
        </div>
      </div>
    </aside>
  )
}

export default CvOverviewPanel
