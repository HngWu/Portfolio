"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ShieldCheck, Award, Terminal, CheckCircle2 } from "lucide-react"

export function EpiloguePage() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#0c1228] via-[#070b1a] to-[#04060e] select-none rounded-l-3xl border-l border-y border-white/25 shadow-[15px_0_35px_rgba(0,0,0,0.85)]">
      {/* 1. Luminous Ambient Radial Halo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,255,180,0.12)_0%,rgba(255,215,0,0.08)_45%,transparent_75%)] pointer-events-none" />

      {/* 2. Blueprint Grid Watermark */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* 3. Inner Gilded Deckle Margin Frame */}
      <div className="absolute inset-3 border border-white/[0.12] rounded-2xl pointer-events-none" />
      <div className="absolute inset-4 border border-dashed border-[var(--lume-primary,#4affb4)]/30 rounded-xl pointer-events-none" />

      {/* 4. Spine Crease Shadow Gradient (Right Edge of Left Page) */}
      <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-black/90 via-black/45 to-transparent pointer-events-none z-10" />

      {/* 5. Metallic Corner Clasps */}
      <div className="absolute top-3.5 left-3.5 size-6 border-t-2 border-l-2 border-[var(--lume-primary,#4affb4)]/70 rounded-tl-md pointer-events-none">
        <div className="absolute top-1 left-1 size-1.5 rounded-full bg-[#ffd700] shadow-[0_0_6px_#ffd700]" />
      </div>
      <div className="absolute bottom-3.5 left-3.5 size-6 border-b-2 border-l-2 border-[var(--lume-primary,#4affb4)]/70 rounded-bl-md pointer-events-none">
        <div className="absolute bottom-1 left-1 size-1.5 rounded-full bg-[#ffd700] shadow-[0_0_6px_#ffd700]" />
      </div>

      {/* 6. Page Content */}
      <div className="relative z-10 p-5 sm:p-7 md:p-9 flex flex-col justify-between h-full font-mono pr-7 sm:pr-10">
        {/* Top Runic Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-[11px] tracking-widest">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)] shadow-[0_0_6px_var(--lume-primary)]" />
            <span className="font-serif tracking-[0.28em] text-[var(--lume-primary,#4affb4)]/80 text-[12px] font-semibold drop-shadow-[0_0_8px_rgba(74,255,180,0.3)]">
              ᚛ ᛖ ᛈ ᛁ ᛚ ᛟ ᚷ ᚢ ᛖ ᚜
            </span>
          </span>
          <span className="text-[10px] tracking-[0.3em] text-[#ffd700] font-mono font-bold drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]">
            ᛫ FINALIS ᛫
          </span>
        </div>

        {/* Center Content: Epilogue Essay */}
        <div className="relative my-auto flex flex-col justify-center py-2 sm:py-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="size-4 text-[#ffd700]" />
            <span className="text-xs font-mono tracking-widest text-[#ffd700] uppercase font-semibold">
              Chapter Reflections
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight leading-tight mb-3">
            The Ongoing Odyssey
          </h2>

          <div className="space-y-2.5 text-xs sm:text-[13px] text-white/70 leading-relaxed font-sans">
            <p>
              From migrating mission-critical relational schemas at <strong className="text-white font-medium">DBS Bank</strong> to resolving complex enterprise software defects at <strong className="text-white font-medium">To The Point</strong>, every milestone has reinforced the core philosophy of software craftsmanship.
            </p>
            <p>
              Engineering excellence is forged not in isolation, but in production: where data integrity is absolute, automated CI/CD pipelines guarantee velocity, and system resilience protects user trust.
            </p>
          </div>

          {/* Golden Quote Block */}
          <div className="mt-4 p-3.5 rounded-xl bg-white/[0.03] border-l-2 border-[var(--lume-primary,#4affb4)] border-y border-r border-white/10 backdrop-blur-sm">
            <p className="font-serif italic text-xs text-white/90 leading-snug">
              &ldquo;True mastery lies not merely in writing code, but in engineering architectures that endure the tests of scale, concurrency, and time.&rdquo;
            </p>
            <span className="text-[10px] font-mono text-[#ffd700] block mt-1.5 font-semibold">
              — Tan Hng Wu · Software Engineer
            </span>
          </div>

          {/* Status Badge */}
          <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-white/60">
            <CheckCircle2 className="size-3.5 text-[var(--lume-primary,#4affb4)]" />
            <span>Record Inscribed & Sealed in Dossier</span>
          </div>
        </div>

        {/* Bottom Colophon Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-[10px] tracking-widest">
          <span className="font-mono text-[#ffd700]/80 tracking-[0.22em] font-semibold drop-shadow-[0_0_6px_rgba(255,215,0,0.3)]">
            FOLIO // 03 ᛫ EPILOGUE
          </span>
          <span className="font-serif text-[var(--lume-primary,#4affb4)]/80 tracking-[0.28em] font-semibold drop-shadow-[0_0_8px_rgba(74,255,180,0.3)]">
            ᚛ ᚨ ᚱ ᚲ ᚐ ᚾ ᛖ ᚜
          </span>
        </div>
      </div>
    </div>
  )
}
