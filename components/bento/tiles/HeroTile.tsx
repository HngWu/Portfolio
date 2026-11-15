"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BentoTile } from "../BentoTile"
import { Download } from "lucide-react"
import { useViewModeStore } from "@/store/useViewModeStore"
import { usePageTransition } from "@/hooks/usePageTransition"
import type { HeroContent } from "@/lib/tiles/schemas"

interface HeroTileProps {
  id: string
  size: string
  content: HeroContent
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

export function HeroTile({ id, size, content, isDragging, sortableProps }: HeroTileProps) {
  const { mark, description } = content
  const markRef = React.useRef<HTMLHeadingElement>(null)

  const deepMarkRef = React.useRef<HTMLHeadingElement>(null)

  const mode = useViewModeStore((state) => state.mode)
  
  const formattedMark = React.useMemo(() => {
    if (!mark) return ""
    if (mark.includes("\n")) return mark
    if (mark.includes("· ")) return mark.replace("· ", "·\n")
    return mark
  }, [mark])

  const chars = "!<>_[]{}~=+*^?#________"

  const [mounted, setMounted] = React.useState(false)
  const [isMac, setIsMac] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    setIsMac(/mac/i.test(navigator.userAgent))
  }, [])


  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent click through to underlying bento tile actions
    window.dispatchEvent(new CustomEvent("open-command-palette"))
  }

  const { navigateWithTransition } = usePageTransition()

  const handleCvClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    e.stopPropagation()
    navigateWithTransition("/cv", e.currentTarget)
  }

  const router = useRouter()
  const prefetchedRef = React.useRef(false)

  const prefetchCvAssets = React.useCallback(() => {
    if (prefetchedRef.current) return
    prefetchedRef.current = true

    // Prefetch Next.js route chunks for /cv
    try {
      router.prefetch("/cv")
    } catch {}

    // Preload PDF document and local PDF.js script into browser HTTP cache
    const urlsToPreload = [
      { href: "/resume.pdf", as: "fetch" },
      { href: "/assets/pdfjs/pdf.min.js", as: "script" },
      { href: "/assets/pdfjs/pdf.worker.min.js", as: "fetch" },
    ]

    urlsToPreload.forEach(({ href, as }) => {
      const existing = document.querySelector(`link[href="${href}"]`)
      if (existing) return
      const link = document.createElement("link")
      link.rel = "preload"
      link.href = href
      link.as = as
      if (as === "fetch") link.crossOrigin = "anonymous"
      document.head.appendChild(link)
    })
  }, [router])

  React.useEffect(() => {
    // Warm up CV assets during idle time after initial mount (1.5s delay)
    const timer = setTimeout(() => {
      prefetchCvAssets()
    }, 1500)
    return () => clearTimeout(timer)
  }, [prefetchCvAssets])

  const intervalsRef = React.useRef<{ [key: string]: NodeJS.Timeout }>({})

  const scramble = (key: string, element: HTMLElement, text: string, characterSet: string[]) => {
    if (intervalsRef.current[key]) {
      clearInterval(intervalsRef.current[key])
    }
    
    let iteration = 0
    intervalsRef.current[key] = setInterval(() => {
      element.innerText = text
          .split("")
          .map((letter, index) => {
            if (letter === " " || letter === "\n") return letter
            if (index < iteration) {
              return text[index]
            }
            return characterSet[Math.floor(Math.random() * characterSet.length)]
          })
          .join("")
      
      if (iteration >= text.length) {
        clearInterval(intervalsRef.current[key])
        delete intervalsRef.current[key]
      }
      
      iteration += 1 / 3
    }, 30)
  }

  React.useEffect(() => {
    // When mode switches, trigger scramble on the visible elements safely
    if (mode === "quick") {
      if (markRef.current) scramble("mark", markRef.current, formattedMark, chars.split(""))
    } else {
      if (deepMarkRef.current) scramble("deepMark", deepMarkRef.current, formattedMark, chars.split(""))
    }
  }, [mode, formattedMark])

  React.useEffect(() => {
    // Periodic scramble on the active face's mark together safely
    const timer = setInterval(() => {
      if (mode === "quick") {
        if (markRef.current) scramble("mark", markRef.current, formattedMark, chars.split(""))
      } else {
        if (deepMarkRef.current) scramble("deepMark", deepMarkRef.current, formattedMark, chars.split(""))
      }
    }, 5000)

    return () => clearInterval(timer)
  }, [mode, formattedMark])

  React.useEffect(() => {
    // Cleanup on unmount
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval)
    }
  }, [])

  return (
    <BentoTile 
      id={id} 
      size={size} 
      className="bg-white/[0.02] border border-white/5 p-4 sm:p-6 md:p-8 flex flex-col justify-between sm:justify-center h-full group/hero"
      isDragging={isDragging}
      sortableProps={sortableProps}
      canMorph={false}
      canExpand={false}
      deepContent={
        <div className="flex flex-col h-full justify-between sm:justify-center relative">
          {/* Main Content */}
          <div>
            <h1 
              ref={deepMarkRef}
              title={mark}
              className="relative z-10 text-[21px] xs:text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-mono tracking-tight font-bold leading-[1.2] text-white/90 min-h-[2.4em] whitespace-pre-line select-none"
            >
              {formattedMark}
            </h1>
            <p className="relative z-10 text-[13px] xs:text-[13.5px] sm:text-sm md:text-base mt-2.5 sm:mt-4 md:mt-6 text-white/60 w-full leading-relaxed">
              {description}
            </p>
          </div>

          {/* Horizontal Footer Chrome */}
          <div className="relative z-10 border-t border-white/5 pt-3 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full mt-3 sm:mt-5 md:mt-8">
            {/* Bottom Left: Download CV Button */}
            <div className="flex items-center">
              <Link 
                href="/cv"
                onClick={handleCvClick}
                onMouseEnter={prefetchCvAssets}
                onFocus={prefetchCvAssets}
                aria-label="View and Download CV"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-2.5 sm:py-1.5 bg-white/[0.02] hover:bg-mode-accent/10 border border-white/5 hover:border-mode-accent/30 rounded-xl text-white/60 hover:text-mode-accent-bright transition-all duration-300 select-none cursor-pointer group/cv"
              >
                <Download className="w-4 h-4 shrink-0 transition-transform group-hover/cv:-translate-y-0.5" />
                <span className="text-xs sm:text-sm font-semibold tracking-wide text-white/60 group-hover/cv:text-mode-accent-bright transition-colors">
                  Download CV
                </span>
              </Link>
            </div>

            {/* Bottom Right: Command Palette Trigger */}
            {mounted ? (
              <button
                onClick={handleBadgeClick}
                className="relative w-full sm:w-auto inline-flex items-center justify-center gap-2 cursor-pointer select-none border-none focus:outline-none group/cmd text-white/50 hover:text-mode-accent-bright transition-all duration-300 rounded-xl sm:rounded-lg px-3 py-2 sm:px-2.5 sm:py-1.5 bg-white/[0.01] overflow-hidden"
              >
                {/* Hover-triggered background sheen (Pulse Wave) */}
                <div className="shimmer-pulse-bg group-hover/cmd:opacity-100 group-hover/cmd:animate-shimmer-pulse" />
                
                {/* Idle border-beam orbit container */}
                <div 
                  className="absolute inset-0 z-0 rounded-[inherit] p-[1.5px] pointer-events-none"
                  style={{
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    WebkitMaskComposite: "xor"
                  }}
                >
                  <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_60%,var(--mode-accent-bright,#FFE875)_85%,transparent_100%)] animate-border-beam group-hover/cmd:animate-border-beam-fast" />
                </div>

                {/* Button Contents */}
                <span className="relative z-10 text-xs sm:text-sm tracking-wide text-white/50 group-hover/cmd:text-mode-accent-bright transition-colors">
                  Try the command menu
                </span>
                <div className="relative z-10 hidden sm:flex items-center gap-1 font-mono text-[11px] text-white/20 ml-1">
                  <kbd className="bg-white/[0.04] border border-white/10 text-white/40 group-hover/cmd:text-mode-accent-bright group-hover/cmd:border-mode-accent/30 px-1.5 py-0.5 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_1.5px_0_rgba(0,0,0,0.3)] transition-all duration-300">
                    {isMac ? "⌘" : "Ctrl"}
                  </kbd>
                  <kbd className="bg-white/[0.04] border border-white/10 text-white/40 group-hover/cmd:text-mode-accent-bright group-hover/cmd:border-mode-accent/30 px-1.5 py-0.5 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_1.5px_0_rgba(0,0,0,0.3)] transition-all duration-300">
                    K
                  </kbd>
                </div>
              </button>
            ) : (
              <div className="h-8 w-24" />
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full justify-between sm:justify-center relative">
        {/* Main Content */}
        <div>
          <h1 
            ref={markRef}
            title={mark}
            className="relative z-10 text-2xl xs:text-[26px] sm:text-3xl md:text-3xl lg:text-4xl font-display leading-[1.2] text-white/90 min-h-[2.4em] font-bold tracking-tight whitespace-pre-line select-none"
          >
            {formattedMark}
          </h1>
          <p className="relative z-10 text-[13px] xs:text-[13.5px] sm:text-sm md:text-base mt-2.5 sm:mt-4 md:mt-6 text-white/60 w-full leading-relaxed">
            {description}
          </p>
        </div>

        {/* Horizontal Footer Chrome */}
        <div className="relative z-10 border-t border-white/5 pt-3 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full mt-3 sm:mt-5 md:mt-8">
          {/* Bottom Left: Download CV Button */}
          <div className="flex items-center">
            <Link 
              href="/cv"
              onClick={handleCvClick}
              onMouseEnter={prefetchCvAssets}
              onFocus={prefetchCvAssets}
              aria-label="View and Download CV"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-2.5 sm:py-1.5 bg-white/[0.02] hover:bg-mode-accent/10 border border-white/5 hover:border-mode-accent/30 rounded-xl text-white/60 hover:text-mode-accent-bright transition-all duration-300 select-none cursor-pointer group/cv"
            >
              <Download className="w-4 h-4 shrink-0 transition-transform group-hover/cv:-translate-y-0.5" />
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-white/60 group-hover/cv:text-mode-accent-bright transition-colors">
                Download CV
              </span>
            </Link>
          </div>

          {/* Bottom Right: Command Palette Trigger */}
          {mounted ? (
            <button
              onClick={handleBadgeClick}
              className="relative w-full sm:w-auto inline-flex items-center justify-center gap-2 cursor-pointer select-none border-none focus:outline-none group/cmd text-white/50 hover:text-mode-accent-bright transition-all duration-300 rounded-xl sm:rounded-lg px-3 py-2 sm:px-2.5 sm:py-1.5 bg-white/[0.01] overflow-hidden"
            >
              {/* Hover-triggered background sheen (Pulse Wave) */}
              <div className="shimmer-pulse-bg group-hover/cmd:opacity-100 group-hover/cmd:animate-shimmer-pulse" />
              
              {/* Idle border-beam orbit container */}
              <div 
                className="absolute inset-0 z-0 rounded-[inherit] p-[1.5px] pointer-events-none"
                style={{
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor"
                }}
              >
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_60%,var(--mode-accent-bright,#FFE875)_85%,transparent_100%)] animate-border-beam group-hover/cmd:animate-border-beam-fast" />
              </div>

              {/* Button Contents */}
              <span className="relative z-10 text-xs sm:text-sm tracking-wide text-white/50 group-hover/cmd:text-mode-accent-bright transition-colors">
                Try the command menu
              </span>
              <div className="relative z-10 hidden sm:flex items-center gap-1 font-mono text-[11px] text-white/20 ml-1">
                <kbd className="bg-white/[0.04] border border-white/10 text-white/40 group-hover/cmd:text-mode-accent-bright group-hover/cmd:border-mode-accent/30 px-1.5 py-0.5 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_1.5px_0_rgba(0,0,0,0.3)] transition-all duration-300">
                  {isMac ? "⌘" : "Ctrl"}
                </kbd>
                <kbd className="bg-white/[0.04] border border-white/10 text-white/40 group-hover/cmd:text-mode-accent-bright group-hover/cmd:border-mode-accent/30 px-1.5 py-0.5 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_1.5px_0_rgba(0,0,0,0.3)] transition-all duration-300">
                  K
                </kbd>
              </div>
            </button>
          ) : (
            <div className="h-8 w-24" />
          )}
        </div>
      </div>
    </BentoTile>
  )
}

