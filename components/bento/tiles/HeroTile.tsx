"use client"

import * as React from "react"
import { BentoTile } from "../BentoTile"
import { Download } from "lucide-react"
import { useViewModeStore } from "@/store/useViewModeStore"

interface HeroTileProps {
  id: string
  size: string
  role: string
  mark: string
  description: string
  typo: {
    heading: string
    body: string
    meta: string
    icon: string
  }
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

export function HeroTile({ id, size, mark, description, isDragging, sortableProps }: HeroTileProps) {
  const markRef = React.useRef<HTMLHeadingElement>(null)
  
  const deepMarkRef = React.useRef<HTMLHeadingElement>(null)

  const mode = useViewModeStore((state) => state.mode)
  
  const chars = "!<>-_\\/[]{}—=+*^?#________"
  const runes = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ"]

  const [mounted, setMounted] = React.useState(false)
  const [isMac, setIsMac] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    setIsMac(/mac/i.test(navigator.userAgent))
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])


  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent click through to underlying bento tile actions
    window.dispatchEvent(new CustomEvent("open-command-palette"))
  }

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
      if (markRef.current) scramble("mark", markRef.current, mark, runes)
    } else {
      if (deepMarkRef.current) scramble("deepMark", deepMarkRef.current, mark, chars.split(""))
    }
  }, [mode, mark])

  React.useEffect(() => {
    // Periodic scramble on the active face's mark together safely
    const timer = setInterval(() => {
      if (mode === "quick") {
        if (markRef.current) scramble("mark", markRef.current, mark, runes)
      } else {
        if (deepMarkRef.current) scramble("deepMark", deepMarkRef.current, mark, chars.split(""))
      }
    }, 5000)

    return () => clearInterval(timer)
  }, [mode, mark])

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
      className="bg-white/[0.02] border border-white/5 p-6 md:p-8 flex flex-col justify-center h-full"
      isDragging={isDragging}
      sortableProps={sortableProps}
      canMorph={false}
      canExpand={false}
      deepContent={
        <div className="flex flex-col h-full justify-center relative">
          {/* Main Content */}
          <h1 
            ref={deepMarkRef}
            className="text-3xl md:text-4xl font-display leading-tight text-white/90 min-h-[1.2em] font-extrabold tracking-tight"
          >
            {mark}
          </h1>
          <p className="text-base md:text-lg mt-6 text-white/50 w-full leading-relaxed">
            {description}
          </p>

          {/* Horizontal Footer Chrome */}
          <div className="border-t border-white/5 pt-4 flex items-center justify-between w-full mt-8">
            {/* Bottom Left: Download CV Button */}
            <div className="flex items-center gap-2">
              <a 
                href="/cv.pdf" 
                download
                className="flex items-center gap-2 px-2.5 py-1.5 bg-white/[0.02] hover:bg-[#4AFFB4]/10 border border-white/5 hover:border-[#4AFFB4]/30 rounded-xl text-white/50 hover:text-[#4AFFB4] transition-all duration-300 select-none cursor-pointer group/cv"
              >
                <Download className="w-4 h-4 transition-transform group-hover/cv:-translate-y-0.5" />
                <span className="text-sm font-semibold tracking-wide pl-1 text-white/50 group-hover/cv:text-[#4AFFB4] transition-colors">
                  Download CV
                </span>
              </a>
            </div>

            {/* Bottom Right: Command Palette Trigger */}
            {mounted ? (
              <button
                onClick={handleBadgeClick}
                className="relative flex items-center gap-2 cursor-pointer select-none border-none focus:outline-none group/cmd text-white/40 hover:text-[#4AFFB4] transition-all duration-300 rounded-lg px-2.5 py-1 bg-white/[0.01] overflow-hidden"
              >
                {/* Hover-triggered background sheen (Pulse Wave) */}
                <div className="shimmer-pulse-bg group-hover/cmd:opacity-100 group-hover/cmd:animate-shimmer-pulse" />
                
                {/* Idle border-beam orbit container */}
                <div className="border-beam-mask">
                  <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_60%,#4AFFB4_85%,transparent_100%)] animate-border-beam group-hover/cmd:animate-border-beam-fast" />
                </div>

                {/* Button Contents */}
                <span className="relative z-10 text-sm tracking-wide text-white/40 group-hover/cmd:text-[#4AFFB4] transition-colors pl-1">
                  Try the command menu
                </span>
                {!isMobile && (
                  <div className="relative z-10 flex items-center gap-1 font-mono text-[11px] text-white/20 ml-1">
                    <kbd className="bg-white/[0.04] border border-white/10 text-white/40 group-hover/cmd:text-[#4AFFB4] group-hover/cmd:border-[#4AFFB4]/30 px-1.5 py-0.5 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_1.5px_0_rgba(0,0,0,0.3)] transition-all duration-300">
                      {isMac ? "⌘" : "Ctrl"}
                    </kbd>
                    <kbd className="bg-white/[0.04] border border-white/10 text-white/40 group-hover/cmd:text-[#4AFFB4] group-hover/cmd:border-[#4AFFB4]/30 px-1.5 py-0.5 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_1.5px_0_rgba(0,0,0,0.3)] transition-all duration-300">
                      K
                    </kbd>
                  </div>
                )}
              </button>
            ) : (
              <div className="h-8 w-24" />
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full justify-center relative">
        {/* Main Content */}
        <h1 
          ref={markRef}
          className="text-3xl md:text-4xl font-display leading-tight text-white/90 min-h-[1.2em] font-extrabold tracking-tight"
        >
          {mark}
        </h1>
        <p className="text-base md:text-lg mt-6 text-white/50 w-full leading-relaxed">
          {description}
        </p>

        {/* Horizontal Footer Chrome */}
        <div className="border-t border-white/5 pt-4 flex items-center justify-between w-full mt-8">
          {/* Bottom Left: Download CV Button */}
          <div className="flex items-center gap-2">
            <a 
              href="/cv.pdf" 
              download
              className="flex items-center gap-2 px-2.5 py-1.5 bg-white/[0.02] hover:bg-[#4AFFB4]/10 border border-white/5 hover:border-[#4AFFB4]/30 rounded-xl text-white/50 hover:text-[#4AFFB4] transition-all duration-300 select-none cursor-pointer group/cv"
            >
              <Download className="w-4 h-4 transition-transform group-hover/cv:-translate-y-0.5" />
              <span className="text-sm font-semibold tracking-wide pl-1 text-white/50 group-hover/cv:text-[#4AFFB4] transition-colors">
                Download CV
              </span>
            </a>
          </div>

          {/* Bottom Right: Command Palette Trigger */}
          {mounted ? (
            <button
              onClick={handleBadgeClick}
              className="relative flex items-center gap-2 cursor-pointer select-none border-none focus:outline-none group/cmd text-white/40 hover:text-[#4AFFB4] transition-all duration-300 rounded-lg px-2.5 py-1 bg-white/[0.01] overflow-hidden"
            >
              {/* Hover-triggered background sheen (Pulse Wave) */}
              <div className="shimmer-pulse-bg group-hover/cmd:opacity-100 group-hover/cmd:animate-shimmer-pulse" />
              
              {/* Idle border-beam orbit container */}
              <div className="border-beam-mask">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_60%,#4AFFB4_85%,transparent_100%)] animate-border-beam group-hover/cmd:animate-border-beam-fast" />
              </div>

              {/* Button Contents */}
              <span className="relative z-10 text-sm tracking-wide text-white/40 group-hover/cmd:text-[#4AFFB4] transition-colors pl-1">
                Try the command menu
              </span>
              {!isMobile && (
                <div className="relative z-10 flex items-center gap-1 font-mono text-[11px] text-white/20 ml-1">
                  <kbd className="bg-white/[0.04] border border-white/10 text-white/40 group-hover/cmd:text-[#4AFFB4] group-hover/cmd:border-[#4AFFB4]/30 px-1.5 py-0.5 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_1.5px_0_rgba(0,0,0,0.3)] transition-all duration-300">
                    {isMac ? "⌘" : "Ctrl"}
                  </kbd>
                  <kbd className="bg-white/[0.04] border border-white/10 text-white/40 group-hover/cmd:text-[#4AFFB4] group-hover/cmd:border-[#4AFFB4]/30 px-1.5 py-0.5 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_1.5px_0_rgba(0,0,0,0.3)] transition-all duration-300">
                    K
                  </kbd>
                </div>
              )}
            </button>
          ) : (
            <div className="h-8 w-24" />
          )}
        </div>
      </div>
    </BentoTile>
  )
}

