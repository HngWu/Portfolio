"use client"

import * as React from "react"
import { BentoTile } from "../BentoTile"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
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
  
  const chars = "!<>-_\\/[]{}—=+*^?#________"

  const scramble = (element: HTMLElement, text: string) => {
    let iteration = 0
    let interval: NodeJS.Timeout | null = null
    
    clearInterval(interval!)
    
    interval = setInterval(() => {
      element.innerText = text
        .split("")
        .map((letter, index) => {
          if (index < iteration) {
            return text[index]
          }
          return chars[Math.floor(Math.random() * chars.length)]
        })
        .join("")
      
      if (iteration >= text.length) {
        clearInterval(interval!)
      }
      
      iteration += 1 / 3
    }, 30)
  }

  React.useEffect(() => {
    // Initial scramble on load
    if (markRef.current) scramble(markRef.current, mark)
    if (roleRef.current) scramble(roleRef.current, role)

    // Periodic scramble
    const timer = setInterval(() => {
      if (markRef.current) scramble(markRef.current, mark)
    }, 5000)

    return () => clearInterval(timer)
  }, [mark, role])

  return (
    <BentoTile 
      id={id} 
      size={size} 
      className="bg-white/[0.02] border border-white/5 p-8 flex flex-col justify-center"
      isDragging={isDragging}
      sortableProps={sortableProps}
      canMorph={false}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-lume-primary/10 rounded-lg">
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
