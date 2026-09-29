"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ProjectItemData } from "@/lib/projects/types"
import {
  X,
  Github,
  ExternalLink,
  Star,
  GitFork,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Cpu,
  Layers,
  ArrowRight,
} from "lucide-react"

interface CaseStudyPanelProps {
  project: ProjectItemData | null
  isOpen: boolean
  onClose: () => void
}

export function CaseStudyPanel({ project, isOpen, onClose }: CaseStudyPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const closeButtonRef = React.useRef<HTMLButtonElement>(null)

  // Trap focus inside modal when open
  React.useEffect(() => {
    if (!isOpen) return

    // Focus close button on mount
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!project) return null

  const caseStudy = project.caseStudy || {}
  const langColor = project.languageColor || "var(--lume-secondary, #4A8FFF)"

  const hasCaseStudyContent = Boolean(
    caseStudy.problem ||
      caseStudy.approach ||
      caseStudy.keyTechnicalDecision ||
      caseStudy.result ||
      caseStudy.whatIdDoDifferently
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={cn(
              "relative w-full max-w-4xl max-h-[90vh] my-auto overflow-hidden rounded-3xl border border-white/10",
              "bg-[#0a0b0f]/95 shadow-[0_30px_90px_rgba(0,0,0,0.85)] flex flex-col z-10"
            )}
            style={{
              borderColor: `${langColor}33`,
              boxShadow: `0 30px 90px rgba(0,0,0,0.85), 0 0 50px ${langColor}15`,
            }}
          >
            {/* Header Ambient Glow Bar */}
            <div
              style={{
                background: `linear-gradient(90deg, transparent, ${langColor}, transparent)`,
              }}
              className="absolute top-0 inset-x-0 h-[2px] opacity-80"
            />

            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-white/8 flex items-start justify-between gap-4 bg-white/[0.01]">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: langColor, boxShadow: `0 0 8px ${langColor}` }}
                  />
                  <span className="font-mono text-xs uppercase tracking-wider text-white/50">
                    {project.language} Case Study
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold border bg-white/5 border-white/10 text-white/70">
                    {project.status}
                  </span>
                </div>

                <h2
                  id="case-study-title"
                  className="text-2xl sm:text-4xl font-display font-medium text-white tracking-tight"
                >
                  {project.name}
                </h2>
                <p className="text-sm sm:text-base text-white/60 max-w-2xl leading-relaxed">
                  {project.description}
                </p>

                {/* Tech Chips */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-white/5 border border-white/10 text-white/70"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Close case study panel (Escape)"
                className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 flex-shrink-0"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 scrollbar-custom">
              {/* Media banner if available */}
              {project.previewImage && (
                <div className="relative w-full h-48 sm:h-72 rounded-2xl overflow-hidden border border-white/10 bg-black/50">
                  <img
                    src={project.previewImage}
                    alt={project.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLElement).parentElement!.style.display = "none"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0f] via-transparent to-transparent opacity-80" />
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-all font-mono text-xs uppercase tracking-wider font-semibold active:scale-95"
                  >
                    <Github className="size-4" />
                    <span>View Repository</span>
                  </a>
                )}

                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 transition-all font-mono text-xs uppercase tracking-wider font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
                  >
                    <ExternalLink className="size-4" />
                    <span>Open Live Demo</span>
                  </a>
                )}

                <div className="ml-auto flex items-center gap-4 text-xs font-mono text-white/40">
                  <span className="flex items-center gap-1.5">
                    <Star className="size-3.5 text-amber-400" />
                    <span>{project.stars} Stars</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GitFork className="size-3.5 text-white/40" />
                    <span>{project.forks} Forks</span>
                  </span>
                </div>
              </div>

              {/* Case Study Sections */}
              {hasCaseStudyContent ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Problem Section */}
                  {caseStudy.problem && (
                    <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.015] space-y-2">
                      <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-wider font-semibold">
                        <AlertCircle className="size-4" />
                        <span>Problem & Challenge</span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">
                        {caseStudy.problem}
                      </p>
                    </div>
                  )}

                  {/* Approach Section */}
                  {caseStudy.approach && (
                    <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.015] space-y-2">
                      <div className="flex items-center gap-2 text-sky-400 font-mono text-xs uppercase tracking-wider font-semibold">
                        <Lightbulb className="size-4" />
                        <span>Architecture & Approach</span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">
                        {caseStudy.approach}
                      </p>
                    </div>
                  )}

                  {/* Key Decision Section */}
                  {caseStudy.keyTechnicalDecision && (
                    <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.015] space-y-2 md:col-span-2">
                      <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider font-semibold">
                        <Cpu className="size-4" />
                        <span>Key Technical Decision</span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">
                        {caseStudy.keyTechnicalDecision}
                      </p>
                    </div>
                  )}

                  {/* Result Section */}
                  {caseStudy.result && (
                    <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.015] space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider font-semibold">
                        <CheckCircle2 className="size-4" />
                        <span>Results & Metrics</span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">
                        {caseStudy.result}
                      </p>
                    </div>
                  )}

                  {/* What I'd Do Differently Section */}
                  {caseStudy.whatIdDoDifferently && (
                    <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.015] space-y-2">
                      <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-wider font-semibold">
                        <Layers className="size-4" />
                        <span>Retrospective & Next Steps</span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">
                        {caseStudy.whatIdDoDifferently}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Fallback when full case study is not yet authored */
                <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
                  <p className="text-sm text-white/50 font-mono">
                    Case study documentation in progress. View the repository code for implementation details.
                  </p>
                </div>
              )}
            </div>

            {/* Footer with Keyboard Hint */}
            <div className="p-4 px-6 sm:px-8 border-t border-white/8 bg-black/40 flex items-center justify-between text-xs font-mono text-white/40">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60">ESC</kbd>
                <span>to close and return to 3D carousel</span>
              </span>
              <button
                onClick={onClose}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Close</span>
                <ArrowRight className="size-3" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
