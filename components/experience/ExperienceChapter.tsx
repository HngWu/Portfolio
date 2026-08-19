"use client"

import * as React from "react"
import { GlassCard } from "@/components/ui/GlassCard"
import { ExperienceParallaxBg } from "./ExperienceParallaxBg"
import { useViewModeStore } from "@/store/useViewModeStore"
import { Briefcase, Calendar, Layers, Zap, BarChart3, Database as DbIcon, Layout, CheckCircle2 } from "lucide-react"
import type { ParsedExperience } from "@/lib/content/portfolio"

interface ExperienceChapterProps {
  experience: ParsedExperience
  index: number
  total: number
}

export function ExperienceChapter({ experience, index, total }: ExperienceChapterProps) {
  const mode = useViewModeStore((s) => s.mode)
  const isDeep = mode === "deep"

  const { role, company, date, highlights = [], deepDiveHighlights = [] } = experience

  const getHighlightIcon = (title: string, className: string) => {
    const t = title.toLowerCase()
    if (t.includes("migration") || t.includes("devops")) return <Layers className={className} />
    if (t.includes("performance") || t.includes("optimization")) return <Zap className={className} />
    if (t.includes("testing") || t.includes("analytics")) return <BarChart3 className={className} />
    if (t.includes("database")) return <DbIcon className={className} />
    if (t.includes("ui") || t.includes("experimental")) return <Layout className={className} />
    return <CheckCircle2 className={className} />
  }

  return (
    <section
      id={`experience-chapter-${index}`}
      data-chapter-index={index}
      className="min-h-screen relative flex items-center justify-center px-4 md:px-8 py-16 snap-start"
    >
      {/* Background Parallax Typography */}
      <ExperienceParallaxBg company={company} index={index} />

      {/* Main Experience Glass Card */}
      <div className="relative z-10 w-full max-w-3xl">
        <GlassCard
          glowColor={isDeep ? "blue" : "mint"}
          className="p-6 md:p-10 border-l-4 border-l-[var(--lume-primary)] shadow-2xl backdrop-blur-xl"
        >
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--lume-primary)] uppercase tracking-widest mb-2">
                <span>Chapter {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
                <span>•</span>
                <span>{company}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white/90 tracking-tight">{role}</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-white/50 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[var(--lume-primary)]" />
              <span>{date}</span>
            </div>
          </div>

          {/* Highlights List */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Key Impact & Achievements</h3>
            <ul className="space-y-3">
              {highlights.map((highlight, hIdx) => (
                <li key={hIdx} className="flex items-start gap-3 group/item text-sm text-white/70 leading-relaxed">
                  <div className="shrink-0 mt-1 p-1 rounded-md bg-white/5 border border-white/10 group-hover/item:border-[var(--lume-primary)] transition-colors">
                    {getHighlightIcon(highlight, "w-3.5 h-3.5 text-[var(--lume-primary)]")}
                  </div>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Deep Dive Section */}
          {isDeep && deepDiveHighlights.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--mode-accent-bright,#6AFFFF)] uppercase tracking-widest mb-4">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Deep-Dive Technical Details</span>
              </div>
              <ul className="space-y-2.5">
                {deepDiveHighlights.map((dh, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-3 text-xs text-white/50 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--mode-accent-bright,#6AFFFF)] mt-1.5 shrink-0" />
                    <span>{dh}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </GlassCard>
      </div>
    </section>
  )
}
