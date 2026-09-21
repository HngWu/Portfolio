"use client"

import * as React from "react"
import { ShieldCheck, Cpu, Terminal, Layers, FileCode2, CheckCircle2 } from "lucide-react"

export function CoverEndpaper() {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-8 md:p-12 select-none overflow-hidden bg-[#05070e] border-l border-white/10 rounded-l-3xl shadow-[inset_0_0_80px_rgba(0,0,0,0.9)]">
      {/* Decorative Gilded Page Inner Border */}
      <div className="absolute inset-2.5 sm:inset-3 border border-white/[0.06] rounded-2xl pointer-events-none" />

      {/* Subtle Background Blueprint Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Decorative Spine Stitching Line (Right Border) */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/80 via-white/[0.04] to-transparent border-l border-white/10 flex flex-col justify-around items-center py-8">
        <div className="size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)]/50 shadow-[0_0_6px_var(--lume-primary)]" />
        <div className="size-1.5 rounded-full bg-white/20" />
        <div className="size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)]/50 shadow-[0_0_6px_var(--lume-primary)]" />
      </div>

      {/* Metallic Corner Clasps (Left side) */}
      <div className="absolute top-4 left-4 size-6 border-t-2 border-l-2 border-[var(--lume-primary,#4affb4)]/50 rounded-tl-lg pointer-events-none">
        <div className="absolute top-1 left-1 size-1 rounded-full bg-[var(--lume-primary,#4affb4)] shadow-[0_0_4px_var(--lume-primary)]" />
      </div>
      <div className="absolute bottom-4 left-4 size-6 border-b-2 border-l-2 border-[var(--lume-primary,#4affb4)]/50 rounded-bl-lg pointer-events-none">
        <div className="absolute bottom-1 left-1 size-1 rounded-full bg-[var(--lume-primary,#4affb4)] shadow-[0_0_4px_var(--lume-primary)]" />
      </div>

      {/* Top Section */}
      <div className="relative z-10 flex items-center justify-between pr-6 border-b border-white/10 pb-4">
        <span className="font-mono text-[10px] md:text-xs text-white/50 uppercase tracking-widest flex items-center gap-1.5 font-medium">
          <Terminal className="size-3.5 text-[var(--lume-primary,#4affb4)]" />
          Systems Archive
        </span>
        <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
          Document ID: THW-2026
        </span>
      </div>

      {/* Center Metadata Plate */}
      <div className="relative z-10 my-auto pr-6 space-y-6">
        <div>
          <span className="text-[10px] font-mono text-[var(--lume-primary,#4affb4)] uppercase tracking-wider block mb-1">
            Engineering Portfolio
          </span>
          <h3 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight">
            Tan Hng Wu
          </h3>
          <p className="text-xs font-mono text-white/60 mt-1">
            Full-Stack Software Engineer & IT Application Support Specialist
          </p>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
            <span className="text-[9px] font-mono uppercase text-white/40 flex items-center gap-1">
              <Layers className="size-3 text-[var(--lume-primary,#4affb4)]" />
              Document Scope
            </span>
            <span className="text-xs font-mono font-medium text-white/90 mt-1 block">
              2 Verified Roles
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
            <span className="text-[9px] font-mono uppercase text-white/40 flex items-center gap-1">
              <Cpu className="size-3 text-[var(--mode-accent-bright,#6affff)]" />
              Core Competencies
            </span>
            <span className="text-xs font-mono font-medium text-white/90 mt-1 block">
              Full-Stack & IT Support
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
            <span className="text-[9px] font-mono uppercase text-white/40 flex items-center gap-1">
              <ShieldCheck className="size-3 text-[var(--lume-primary,#4affb4)]" />
              Testing & QA
            </span>
            <span className="text-xs font-mono font-medium text-white/90 mt-1 block">
              UAT, SIT & Automation
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
            <span className="text-[9px] font-mono uppercase text-white/40 flex items-center gap-1">
              <FileCode2 className="size-3 text-[var(--mode-accent-bright,#6affff)]" />
              Documentation
            </span>
            <span className="text-xs font-mono font-medium text-white/90 mt-1 block">
              Technical & SOP Guides
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 pr-6 text-xs font-mono text-white/40">
        <span className="flex items-center gap-1.5 text-[11px] text-[var(--lume-primary,#4affb4)]">
          <CheckCircle2 className="size-3" />
          Ready for Review
        </span>
        <span className="text-[10px] uppercase">Confidential & Proprietary</span>
      </div>
    </div>
  )
}
