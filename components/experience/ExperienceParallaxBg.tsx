"use client"

import * as React from "react"
import { useGsap } from "@/hooks/useGsap"
import gsap from "gsap"

interface ExperienceParallaxBgProps {
  company: string
  index: number
}

export function ExperienceParallaxBg({ company, index }: ExperienceParallaxBgProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const textRef = React.useRef<HTMLDivElement | null>(null)

  useGsap(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion || !containerRef.current || !textRef.current) return

    gsap.fromTo(
      textRef.current,
      { y: 50, opacity: 0.03 },
      {
        y: -100,
        opacity: 0.08,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
        },
      }
    )
  }, [])

  const indexStr = String(index + 1).padStart(2, "0")

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center select-none"
      aria-hidden="true"
    >
      <div
        ref={textRef}
        className="text-[14vw] font-black uppercase tracking-tighter text-white/[0.04] whitespace-nowrap leading-none transition-colors duration-500"
      >
        {indexStr}. {company}
      </div>
    </div>
  )
}
