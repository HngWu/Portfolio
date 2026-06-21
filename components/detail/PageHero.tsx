"use client"

import { useViewModeStore } from "@/store/useViewModeStore"

interface PageHeroProps {
  typeLabel: string
  title: string
  descriptor: string
}

export function PageHero({ typeLabel, title, descriptor }: PageHeroProps) {
  const mode = useViewModeStore((s) => s.mode)

  return (
    <div className="reveal-item mb-12">
      <span className="text-xs font-mono uppercase tracking-widest text-[var(--mode-accent,#C9A227)]">{typeLabel}</span>
      <div className="relative mt-2">
        {mode === "quick" ? (
          <>
            {/* Base grey layer */}
            <h1 className="text-4xl md:text-5xl font-display text-white/30 tracking-tight">{title}</h1>
            {/* Golden gilded layer */}
            <h1 className="gild-text absolute inset-0 text-4xl md:text-5xl font-display bg-gradient-to-r from-[var(--lume-warm,#FFB44A)] via-[var(--mode-accent-bright,#FFE875)] to-[var(--lume-warm,#FFB44A)] bg-clip-text text-transparent tracking-tight">
              {title}
            </h1>
          </>
        ) : (
          <h1 className="text-4xl md:text-5xl font-display text-white tracking-tight">{title}</h1>
        )}
      </div>
      <p className="mt-4 text-sm text-[var(--text-secondary,rgba(255,255,255,0.55))] max-w-xl leading-relaxed">{descriptor}</p>
      <div className="h-[1px] w-full bg-white/10 mt-12" />
    </div>
  )
}
