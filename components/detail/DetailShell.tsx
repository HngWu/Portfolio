"use client"

import * as React from "react"
import { BackLink } from "./BackLink"
import { PageHero } from "./PageHero"
import { SearchButton } from "../nav/SearchButton"
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
}

export function DetailShell({ typeLabel, title, descriptor, children }: DetailShellProps) {
  const mode = useViewModeStore((s) => s.mode)
  const curtainState = useNavigationStore((s) => s.curtainState)
  const originRect = useNavigationStore((s) => s.originRect)

  const maskPathRef = React.useRef<SVGPathElement | null>(null)

  React.useLayoutEffect(() => {
    if (mode !== "quick" || !maskPathRef.current) return
    
    if (curtainState === "revealing") {
      gsap.fromTo(maskPathRef.current,
        { scale: 0, transformOrigin: "center" },
        { scale: 15, duration: 1.2, ease: "power3.inOut" }
      )
    }
  }, [curtainState, mode])

  useGsap(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) {
      // Respect the user setting — a simple fade, no blur/trace/gild.
      gsap.from(".reveal-item", { opacity: 0, duration: 0.4, stagger: 0.05 })
      return
    }

    if (mode === "quick") {
      // Golden Canvas reveal: soft blur-to-focus + gilded headers.
      gsap.from(".reveal-item", {
        opacity: 0,
        filter: "blur(8px)",
        y: 16,
        duration: 0.9,
        stagger: 0.12,
        ease: "expo.out",
      })
      // Gild-in the hero title + reveal-item headings via a gold-gradient
      // clip-path width sweep (left → right), evoking gold leaf laid down.
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
  }, [mode])

  return (
    <main
      className="min-h-screen pt-24 pb-24 px-4 md:px-8 max-w-4xl mx-auto"
      style={
        mode === "quick" && curtainState !== "idle"
          ? {
              maskImage: "url(#brush-mask-clip)",
              WebkitMaskImage: "url(#brush-mask-clip)",
              maskSize: "100% 100%",
            }
          : undefined
      }
    >
      <ModeScrollFx />
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <mask id="brush-mask-clip" maskUnits="userSpaceOnUse">
            <rect width="100%" height="100%" fill="black" />
            <path
              ref={maskPathRef}
              d="M 500 500 C 350 450, 650 350, 500 500 C 400 600, 300 400, 500 500 Z"
              fill="white"
            />
          </mask>
        </defs>
      </svg>
      <div className="fixed top-6 right-6 z-50">
        <SearchButton />
      </div>
      <BackLink />
      <PageHero typeLabel={typeLabel} title={title} descriptor={descriptor} />
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
