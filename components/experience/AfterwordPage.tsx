"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ExternalLink, Github, Linkedin, Mail, Send, Terminal, Layers } from "lucide-react"

export interface AfterwordPageProps {
  onReturnHome: () => void
  autoReturnDurationMs?: number
}

export function AfterwordPage({
  onReturnHome,
  autoReturnDurationMs = 3000,
}: AfterwordPageProps) {
  const [progress, setProgress] = React.useState(0)

  // Auto-return progress timer
  React.useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const p = Math.min(100, Math.round((elapsed / autoReturnDurationMs) * 100))
      setProgress(p)
      if (p >= 100) {
        clearInterval(interval)
      }
    }, 40)

    return () => clearInterval(interval)
  }, [autoReturnDurationMs])

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#0c1228] via-[#070b1a] to-[#04060e] select-none rounded-r-3xl border-r border-y border-white/25 shadow-[-15px_0_35px_rgba(0,0,0,0.85)]"
    >
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

      {/* 3. Gilded Margin Frame */}
      <div className="absolute inset-3 border border-white/[0.12] rounded-2xl pointer-events-none" />
      <div className="absolute inset-4 border border-dashed border-[var(--lume-primary,#4affb4)]/30 rounded-xl pointer-events-none" />

      {/* 4. Spine Crease Shadow Gradient (Left Edge of Right Page) */}
      <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-black/90 via-black/45 to-transparent pointer-events-none z-10" />

      {/* 5. Metallic Corner Clasps */}
      <div className="absolute top-3.5 right-3.5 size-6 border-t-2 border-r-2 border-[var(--lume-primary,#4affb4)]/70 rounded-tr-md pointer-events-none">
        <div className="absolute top-1 right-1 size-1.5 rounded-full bg-[#ffd700] shadow-[0_0_6px_#ffd700]" />
      </div>
      <div className="absolute bottom-3.5 right-3.5 size-6 border-b-2 border-r-2 border-[var(--lume-primary,#4affb4)]/70 rounded-br-md pointer-events-none">
        <div className="absolute bottom-1 right-1 size-1.5 rounded-full bg-[#ffd700] shadow-[0_0_6px_#ffd700]" />
      </div>

      {/* 6. Page Content */}
      <div className="relative z-10 p-5 sm:p-7 md:p-9 flex flex-col justify-between h-full font-mono pl-7 sm:pl-10">
        {/* Top Runic Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-[11px] tracking-widest">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[var(--lume-primary,#4affb4)] shadow-[0_0_6px_var(--lume-primary)]" />
            <span className="font-serif tracking-[0.28em] text-[var(--lume-primary,#4affb4)]/80 text-[12px] font-semibold drop-shadow-[0_0_8px_rgba(74,255,180,0.3)]">
              ᚛ ᚲ ᛟ ᛚ ᛟ ᛈ ᚺ ᛟ ᚾ ᚜
            </span>
          </span>
          <span className="text-[10px] tracking-[0.3em] text-[#ffd700] font-mono font-bold drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]">
            ᛫ AFTERWORD ᛫
          </span>
        </div>

        {/* Center Content: Colophon & Coordinates */}
        <div className="relative my-auto flex flex-col justify-center py-2">
          <div className="flex items-center gap-2 mb-1.5">
            <Layers className="size-4 text-[var(--lume-primary,#4affb4)]" />
            <span className="text-xs font-mono tracking-widest text-[var(--lume-primary,#4affb4)] uppercase font-semibold">
              Colophon & System Registry
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight leading-tight mb-2.5">
            Craftsmanship & Stack
          </h2>

          {/* Colophon Stack Specs */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mb-3.5">
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10">
              <span className="text-white/40 block text-[9px] uppercase">Engine</span>
              <span className="text-white/90 font-medium">Next.js 16 App Router</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10">
              <span className="text-white/40 block text-[9px] uppercase">Physics & 3D</span>
              <span className="text-white/90 font-medium">Framer Motion & R3F</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10">
              <span className="text-white/40 block text-[9px] uppercase">Styling</span>
              <span className="text-white/90 font-medium">Tailwind CSS v4</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10">
              <span className="text-white/40 block text-[9px] uppercase">Audio</span>
              <span className="text-white/90 font-medium">Web Audio Foley API</span>
            </div>
          </div>

          {/* Social Coordinates Strip */}
          <div className="flex items-center gap-2 mb-4">
            <a
              href="https://github.com/HngWu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[var(--lume-primary,#4affb4)]/50 hover:bg-white/10 text-white/70 hover:text-white transition-all"
            >
              <Github className="size-3.5" />
            </a>
            <a
              href="https://www.linkedin.com/in/tan-hng-wu-8ab093262/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[var(--lume-primary,#4affb4)]/50 hover:bg-white/10 text-white/70 hover:text-white transition-all"
            >
              <Linkedin className="size-3.5" />
            </a>
            <a
              href="https://t.me/hngwu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[var(--lume-primary,#4affb4)]/50 hover:bg-white/10 text-white/70 hover:text-white transition-all"
            >
              <Send className="size-3.5" />
            </a>
            <a
              href="mailto:hngwudev@gmail.com"
              aria-label="Email"
              className="p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[var(--lume-primary,#4affb4)]/50 hover:bg-white/10 text-white/70 hover:text-white transition-all"
            >
              <Mail className="size-3.5" />
            </a>
            <span className="text-[10px] font-mono text-white/40 ml-1">
              hngwudev@gmail.com
            </span>
          </div>

          {/* Return Home Action Button with Countdown Line */}
          <div className="flex flex-col items-start gap-1.5 pt-1">
            <button
              type="button"
              onClick={onReturnHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--lume-primary,#4affb4)] text-black font-semibold text-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(74,255,180,0.3)]"
            >
              <ArrowLeft className="size-3.5" />
              <span>Return to Portfolio</span>
            </button>

            {/* Countdown line */}
            <div className="w-40 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-[var(--lume-primary,#4affb4)] transition-all duration-75 ease-linear shadow-[0_0_6px_var(--lume-primary)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-white/35">
              Auto-returning in {Math.max(0, Math.ceil((autoReturnDurationMs * (1 - progress / 100)) / 1000))}s · Click to return now
            </span>
          </div>
        </div>

        {/* Bottom Colophon Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-[10px] tracking-widest">
          <span className="font-mono text-[#ffd700]/80 tracking-[0.22em] font-semibold drop-shadow-[0_0_6px_rgba(255,215,0,0.3)]">
            FOLIO // 04 ᛫ AFTERWORD
          </span>
          <span className="font-serif text-[var(--lume-primary,#4affb4)]/80 tracking-[0.28em] font-semibold drop-shadow-[0_0_8px_rgba(74,255,180,0.3)]">
            ᚛ ᚨ ᚱ ᚲ ᚐ ᚾ ᛖ ᚜
          </span>
        </div>
      </div>
    </div>
  )
}
