"use client"

import * as React from "react"
import { BentoTile } from "../BentoTile"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
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

export function HeroTile({ id, size, role, mark, description, typo, isDragging, sortableProps }: HeroTileProps) {
  const markRef = React.useRef<HTMLHeadingElement>(null)
  const roleRef = React.useRef<HTMLDivElement>(null)
  
  const deepMarkRef = React.useRef<HTMLHeadingElement>(null)
  const deepRoleRef = React.useRef<HTMLDivElement>(null)

  const mode = useViewModeStore((state) => state.mode)
  
  const chars = "!<>-_\\/[]{}—=+*^?#________"
  const runes = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ"]

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
    // When mode switches, trigger scramble on the visible elements
    if (mode === "quick") {
      if (markRef.current) scramble("mark", markRef.current, mark, runes)
      if (roleRef.current) scramble("role", roleRef.current, role, runes)
    } else {
      if (deepMarkRef.current) scramble("deepMark", deepMarkRef.current, mark, chars.split(""))
      if (deepRoleRef.current) scramble("deepRole", deepRoleRef.current, role, chars.split(""))
    }
  }, [mode, mark, role])

  React.useEffect(() => {
    // Periodic scramble on the active face's mark
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
      className="bg-white/[0.02] border border-white/5 p-8 flex flex-col justify-center"
      isDragging={isDragging}
      sortableProps={sortableProps}
      canMorph={false}
      canExpand={false}
      deepContent={
        <div className="flex flex-col justify-center h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-lume-secondary/15 rounded-lg border border-lume-secondary/20">
              <Sparkles className={cn(typo.icon, "text-lume-secondary")} />
            </div>
            <div 
              ref={deepRoleRef}
              className={cn(typo.meta, "tracking-widest text-lume-secondary uppercase min-h-[1em]")}
            >
              {role}
            </div>
          </div>
          <h1 
            ref={deepMarkRef}
            className={cn(typo.heading, "leading-tight text-white/90 min-h-[1.2em]")}
          >
            {mark}
          </h1>
          <p className={cn(typo.body, "mt-6 text-white/50 max-w-md leading-relaxed")}>
            {description}
          </p>
        </div>
      }
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-lume-primary/10 rounded-lg border border-lume-primary/20">
          <Sparkles className={cn(typo.icon, "text-lume-primary")} />
        </div>
        <div 
          ref={roleRef}
          className={cn(typo.meta, "tracking-widest text-lume-primary uppercase min-h-[1em]")}
        >
          {role}
        </div>
      </div>
      <h1 
        ref={markRef}
        className={cn(typo.heading, "leading-tight text-white/90 min-h-[1.2em]")}
      >
        {mark}
      </h1>
      <p className={cn(typo.body, "mt-6 text-white/50 max-w-md leading-relaxed")}>
        {description}
      </p>
    </BentoTile>
  )
}

