"use client"

import * as React from "react"
import { BackLink } from "./BackLink"
import { PageHero } from "./PageHero"
import { ModeScrollFx } from "./ModeScrollFx"
import { useGsap } from "@/hooks/useGsap"
import { useViewModeStore } from "@/store/useViewModeStore"
import { useNavigationStore } from "@/store/useNavigationStore"
import gsap from "gsap"

interface DetailShellProps {
  typeLabel: string
  title: string
  descriptor: string
  children: React.ReactNode
  hideHero?: boolean
}

export function DetailShell({ typeLabel, title, descriptor, children, hideHero = false }: DetailShellProps) {
  const mode = useViewModeStore((s) => s.mode)
  const curtainState = useNavigationStore((s) => s.curtainState)
  const originRect = useNavigationStore((s) => s.originRect)

  const shellRef = React.useRef<HTMLElement | null>(null)

  // 1. Pre-hide content while the cover is still up. If the canvas ever lags a
  //    frame behind the route swap, nothing can flash through. Set on mount and
  //    again whenever we re-enter a covered phase.
  React.useLayoutEffect(() => {
    if (!shellRef.current) return
    if (curtainState === "covering" || curtainState === "peak") {
      gsap.set(shellRef.current.querySelectorAll(".reveal-item"), { opacity: 0 })
      gsap.set(shellRef.current.querySelectorAll(".gild-text"), { clipPath: "inset(0 100% 0 0)" })
    }
  }, [curtainState])

  // 2. Reveal — only play once the curtain is unwinding (or immediately on a
  //    direct load / refresh where curtainState is idle). Gating on curtainState
  //    means the reveal now lands *after* the canvas opens instead of racing it
  //    underneath.
  useGsap(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    // Respect the user setting — a simple fade, no blur/trace/gild.
    if (prefersReducedMotion) {
      gsap.from(".reveal-item", { opacity: 0, duration: 0.4, stagger: 0.05 })
      return
    }

    // Origin point for the gold clip-path open (viewport coords). Falls back to
    // the shell's top-center when there's no captured tile (⌘K, refresh).
    const shell = shellRef.current
    let cx = "50%"
    let cy = "0%"
    if (shell && originRect) {
      const r = shell.getBoundingClientRect()
      cx = `${((originRect.left + originRect.width / 2 - r.left) / r.width) * 100}%`
      cy = `${((originRect.top + originRect.height / 2 - r.top) / r.height) * 100}%`
    }

    if (mode === "quick") {
      // Golden Canvas reveal: open the page from the clicked tile via a
      // circle clip-path, coordinated with the canvas brush-edge ring.
      if (shell) {
        gsap.fromTo(
          shell,
          { clipPath: `circle(0% at ${cx} ${cy})` },
          {
            clipPath: `circle(150% at ${cx} ${cy})`,
            duration: 0.9,
            ease: "power3.out",
            onComplete: () => {
              gsap.set(shell, { clearProps: "clipPath" })
            }
          }
        )
      }
      // Soft blur-to-focus + gilded headers.
      gsap.from(".reveal-item", {
        opacity: 0,
        filter: "blur(8px)",
        y: 16,
        duration: 0.9,
        stagger: 0.12,
        ease: "expo.out",
      })
      // Gild-in the hero title via a gold-gradient clip-path width sweep
      // (left → right), evoking gold leaf laid down.
      gsap.fromTo(
        ".gild-text",
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 1.1,
          delay: 0.25,
          ease: "power3.out",
          stagger: 0.1,
        }
      )
    } else {
      // Hextech reveal: each item slides in with a blue vector-line trace
      // sweeping across its top border, then settles — like a blueprint load.
      gsap.from(".reveal-item", {
        opacity: 0,
        y: 24,
        duration: 0.55,
        stagger: 0.08,
        ease: "power2.out",
      })
      // Vector-trace the top edge of each card with a bright blue line.
      gsap.fromTo(
        ".reveal-item .trace-line",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.5,
          delay: 0.15,
          ease: "power3.out",
          stagger: 0.08,
        }
      )
    }
  }, [mode, curtainState])

  return (
    <main
      ref={shellRef}
      className="min-h-screen pt-24 pb-24 px-4 md:px-8 max-w-4xl mx-auto"
    >
      <ModeScrollFx />
      <BackLink />
      {!hideHero && <PageHero typeLabel={typeLabel} title={title} descriptor={descriptor} />}
      <div className="flex flex-col gap-6">
        {React.Children.map(children, (child) => (
          <div className="reveal-item relative">
            {mode === "deep" && (
              <span
                aria-hidden
                className="trace-line pointer-events-none absolute left-0 right-0 top-0 h-[2px] origin-left bg-[var(--mode-accent-bright,#6AFFFF)] opacity-70"
              />
            )}
            {child}
          </div>
        ))}
      </div>
      {mode === "deep" && (
        <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
          <defs>
            <filter id="hextech-aberration">
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cyan"/>
              <feOffset id="matrix-red-offset" dx="0" dy="0" in="red" result="red-offset"/>
              <feOffset id="matrix-cyan-offset" dx="0" dy="0" in="cyan" result="cyan-offset"/>
              <feBlend mode="screen" in="red-offset" in2="cyan-offset"/>
            </filter>
          </defs>
        </svg>
      )}
    </main>
  )
}
