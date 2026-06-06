"use client"

import * as React from "react"
import { BentoTile } from "../BentoTile"
import { cn, getTypographyClasses } from "@/lib/utils"
import { ForceMobileContext } from "../ForceMobileContext"
import { Mail, Github, Linkedin, ExternalLink, Check, Copy, Key, Calendar, Clock } from "lucide-react"

interface ContactTileProps {
  id: string
  size: string
  email: string
  github: string
  linkedin: string
  telegram?: string
  deepDive?: unknown
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

// 🕒 Unique Lume-Glass SGT Clock Animation Widget
function SgtClockAnimation() {
  const [time, setTime] = React.useState<Date | null>(null)

  React.useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!time) {
    return (
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-full border border-white/5 bg-white/5 animate-pulse shrink-0" />
        <div className="space-y-1.5">
          <div className="h-2 w-12 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  // Parse current hour, minute, second in SGT (Singapore Timezone)
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Singapore",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false
  })
  
  const formattedParts = formatter.formatToParts(time)
  const hourPart = formattedParts.find(p => p.type === 'hour')?.value || "0"
  const minPart = formattedParts.find(p => p.type === 'minute')?.value || "0"
  const secPart = formattedParts.find(p => p.type === 'second')?.value || "0"

  const hours = parseInt(hourPart)
  const minutes = parseInt(minPart)
  const seconds = parseInt(secPart)

  // Rotation angles for smooth ticking analog hands
  const secDeg = seconds * 6
  const minDeg = minutes * 6 + seconds * 0.1
  const hrDeg = (hours % 12) * 30 + minutes * 0.5

  return (
    <div className="flex items-center gap-4 select-none">
      {/* Cinematic Glowing Analog Clock Face (Size-12 / 48px) */}
      <div className="relative size-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center shrink-0 shadow-inner group/clock overflow-hidden">
        {/* Outer radial scan sweep animation */}
        <div className="absolute inset-0 bg-gradient-conic from-lume-primary/20 via-transparent to-transparent animate-spin duration-10000 opacity-60 pointer-events-none" />

        <svg viewBox="0 0 40 40" className="absolute inset-0 size-full z-10 select-none">
          <circle 
            cx="20" 
            cy="20" 
            r="18" 
            fill="none" 
            className="stroke-lume-primary/10" 
            strokeWidth="0.5" 
          />
          {/* Minimal tick notches */}
          {[0, 90, 180, 270].map((deg) => (
            <line
              key={deg}
              x1="20"
              y1="2"
              x2="20"
              y2="4"
              className="stroke-lume-primary/45"
              strokeWidth="1"
              transform={`rotate(${deg} 20 20)`}
            />
          ))}
          {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => (
            <line
              key={deg}
              x1="20"
              y1="2"
              x2="20"
              y2="3.5"
              className="stroke-white/10"
              strokeWidth="0.6"
              transform={`rotate(${deg} 20 20)`}
            />
          ))}

          {/* Hour Hand */}
          <line
            x1="20"
            y1="20"
            x2="20"
            y2="11"
            className="stroke-white/80 transition-transform duration-500 ease-out"
            strokeWidth="1.6"
            strokeLinecap="round"
            style={{
              transform: `rotate(${hrDeg}deg)`,
              transformOrigin: "20px 20px"
            }}
          />

          {/* Minute Hand */}
          <line
            x1="20"
            y1="20"
            x2="20"
            y2="7"
            className="stroke-lume-primary transition-transform duration-500 ease-out"
            strokeWidth="1.6"
            strokeLinecap="round"
            style={{
              transform: `rotate(${minDeg}deg)`,
              transformOrigin: "20px 20px",
              filter: "drop-shadow(0 0 2px rgba(74,255,200,0.5))"
            }}
          />

          {/* Second Hand */}
          <line
            x1="20"
            y1="20"
            x2="20"
            y2="5"
            className="stroke-rose-500 transition-transform duration-300"
            strokeWidth="0.8"
            strokeLinecap="round"
            style={{
              transform: `rotate(${secDeg}deg)`,
              transformOrigin: "20px 20px"
            }}
          />

          {/* Hub Pivot */}
          <circle
            cx="20"
            cy="20"
            r="1.2"
            className="fill-white stroke-rose-500"
            strokeWidth="0.4"
          />
        </svg>
      </div>

      {/* Sleek Digital timezone clock */}
      <div className="flex flex-col min-w-0">
        <span className="block text-[9px] md:text-[10px] font-mono uppercase text-white/40 tracking-widest leading-none">SGT (UTC+8)</span>
        <span className="text-[12px] md:text-sm font-mono font-bold text-white/90 leading-tight mt-1.5 tabular-nums drop-shadow-[0_0_6px_rgba(255,255,255,0.15)]">
          {hourPart.padStart(2, "0")}:{minPart.padStart(2, "0")}:{secPart.padStart(2, "0")}
        </span>
      </div>
    </div>
  )
}

export function ContactTile({
  id,
  size,
  email,
  github,
  linkedin,
  telegram,
  deepDive,
  isDragging,
  sortableProps
}: ContactTileProps) {
  const forceMobile = React.useContext(ForceMobileContext)
  const typo = getTypographyClasses(size, false, forceMobile)
  const deepTypo = getTypographyClasses(size, true, forceMobile)

  const [copied, setCopied] = React.useState(false)
  
  const deep = deepDive as Record<string, unknown> | null
  const pgpKey = deep?.pgp_key as string | undefined
  const availability = deep?.availability as string || "Available Q3 2026"

  // Dynamic social links with production defaults to guarantee they show up
  const linkedinUrl = linkedin || "https://linkedin.com/in/hngwu"
  const telegramUrl = telegram || "https://t.me/hngwu"
  const githubUrl = github || "https://github.com/HngWu"

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Pre-filled intent email URLs
  const projectMailto = `mailto:${email}?subject=${encodeURIComponent("[Project Request] System Architecture & Frontend Overhaul")}&body=${encodeURIComponent("Hi HW,\n\nI saw your portfolio and would love to discuss a potential project collaboration. Here are some brief details:\n\nScope:\nTimeline:\nBudget:\n\nLooking forward to speaking with you!")}`
  const chatMailto = `mailto:${email}?subject=${encodeURIComponent("[Coffee Chat] Discussing UI Engineering & Immersive 3D")}&body=${encodeURIComponent("Hi HW,\n\nI really enjoyed exploring your cinematic portfolio grids. I would love to hop on a quick virtual coffee chat to discuss UI animations, three.js, or simply connect as fellow engineers.\n\nBest regards,")}`

  return (
    <BentoTile
      id={id}
      size={size}
      glowColor="mint"
      isDragging={isDragging}
      sortableProps={sortableProps}
      canDeepDive={true}
      canMorph={true}
      deepContent={
        <div className="flex flex-col h-full w-full justify-between relative">
          {/* Header */}
          <div className="flex justify-between items-start mb-5 shrink-0 select-none">
            <div>
              <h3 className={cn(deepTypo.heading, "font-medium text-white/90 font-mono text-base md:text-lg")}>Contact</h3>
            </div>
            <div className="flex items-center gap-2 p-2 bg-lume-primary/5 rounded-lg border border-lume-primary/10 select-none">
              <div className="size-2 rounded-full bg-lume-primary animate-pulse" />
              <span className="font-mono text-[9px] text-lume-primary tracking-widest font-black uppercase">Online</span>
            </div>
          </div>

          {/* Availability Grid featuring the Unique Animated SGT Clock */}
          <div className="grid grid-cols-2 gap-4 mb-6 select-none">
            <div className="p-4 md:p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/[0.04] transition-all duration-300">
              <Calendar className="size-5 text-white/30 shrink-0" />
              <div>
                <span className="block text-[9px] md:text-[10px] font-mono uppercase text-white/40 tracking-widest">Availability</span>
                <span className="text-[11px] md:text-xs font-bold text-white/90 mt-0.5 block">{availability}</span>
              </div>
            </div>
            
            {/* Unique custom analog and digital SGT clock box */}
            <div className="p-4 md:p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center hover:bg-white/[0.04] transition-all duration-300">
              <SgtClockAnimation />
            </div>
          </div>

          <div className="flex-1" />

          {/* Social Capsules Grid incorporating LinkedIn, Telegram, and GitHub in order */}
          <div className="flex flex-wrap gap-2 mt-auto select-none pt-4 border-t border-white/5">
            <a 
              href={linkedinUrl} 
              target="_blank" 
              onPointerDown={(e) => e.stopPropagation()}
              className="group/link inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-lume-primary/30 transition-all font-mono text-[10px] text-white/40 hover:text-lume-primary shadow-sm cursor-pointer"
            >
              <Linkedin className="size-3.5 group-hover/link:scale-105 transition-transform" />
              <span>LinkedIn</span>
            </a>

            {telegramUrl && (
              <a 
                href={telegramUrl} 
                target="_blank" 
                onPointerDown={(e) => e.stopPropagation()}
                className="group/link inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-lume-primary/30 transition-all font-mono text-[10px] text-white/40 hover:text-lume-primary shadow-sm cursor-pointer"
              >
                <svg 
                  className="size-3.5 fill-current text-white/40 group-hover/link:text-lume-primary group-hover/link:scale-105 transition-transform" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.75-.79 4.54-1.11 6.26-.14.73-.41.97-.67.99-.57.05-1-.38-1.55-.74-.86-.56-1.35-.91-2.19-1.46-.97-.64-.34-1 .21-1.57.14-.15 2.66-2.44 2.71-2.66.01-.03.01-.13-.05-.18-.06-.05-.15-.03-.21-.02-.1.02-1.63 1.03-4.6 3.04-.44.3-.83.45-1.18.44-.38 0-1.12-.2-1.67-.39-.67-.22-1.2-.34-1.15-.72.03-.2.3-.4.81-.6 3.14-1.36 5.24-2.26 6.28-2.69 3-.1.62-.21 1.34.21 1.34 0 0 .15.02.23.08.08.06.1.13.1.21-.01.07-.02.15-.04.22z" />
                </svg>
                <span>Telegram</span>
              </a>
            )}

            <a 
              href={githubUrl} 
              target="_blank" 
              onPointerDown={(e) => e.stopPropagation()}
              className="group/link inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-lume-primary/30 transition-all font-mono text-[10px] text-white/40 hover:text-lume-primary shadow-sm cursor-pointer"
            >
              <Github className="size-3.5 group-hover/link:scale-105 transition-transform" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      }
    >
      <div className="flex-1 select-none">
        <div className="flex items-center justify-between mb-5">
          <div className={cn(typo.meta, "text-white/30 uppercase tracking-[0.15em] font-mono")}>Contact</div>
          <Mail className={cn(typo.icon, "text-white/20")} />
        </div>
        
        {/* Clean Copiable Email Container without Transmission label */}
        <div 
          onClick={handleCopy}
          className="group/email flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-lume-primary/25 rounded-2xl cursor-pointer transition-all duration-300 select-all"
        >
          <div className="flex flex-col gap-1 min-w-0 pr-3">
            <span className={cn("text-white/90 font-mono font-medium leading-tight break-all text-sm md:text-base selection:bg-lume-primary selection:text-black")}>
              {email}
            </span>
          </div>
          <div className="shrink-0 p-2.5 bg-white/5 rounded-xl border border-white/5 group-hover/email:border-lume-primary/20 transition-all flex items-center justify-center relative">
            {copied ? (
              <Check className="size-4 text-lume-primary animate-in zoom-in-75 duration-200" />
            ) : (
              <>
                <Copy className="size-4 text-white/40 group-hover/email:text-lume-primary group-hover/email:scale-105 transition-all" />
                <span className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover/email:opacity-100 font-mono text-[8px] uppercase text-lume-primary bg-black/85 border border-lume-primary/20 px-2 py-0.5 rounded shadow-lg tracking-widest transition-all duration-300 pointer-events-none whitespace-nowrap scale-90 group-hover/email:scale-100 translate-y-1 group-hover/email:translate-y-0 backdrop-blur-sm z-50">
                  Click to Copy
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Social Capsules Grid incorporating LinkedIn, Telegram, and GitHub in order */}
      <div className="flex flex-wrap gap-2 mt-8 select-none">
        <a 
          href={linkedinUrl} 
          target="_blank" 
          onPointerDown={(e) => e.stopPropagation()}
          className="group/link inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-lume-primary/30 transition-all font-mono text-[10px] text-white/40 hover:text-lume-primary shadow-sm cursor-pointer"
        >
          <Linkedin className="size-3.5 group-hover/link:scale-105 transition-transform" />
          <span>LinkedIn</span>
        </a>

        {telegramUrl && (
          <a 
            href={telegramUrl} 
            target="_blank" 
            onPointerDown={(e) => e.stopPropagation()}
            className="group/link inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-lume-primary/30 transition-all font-mono text-[10px] text-white/40 hover:text-lume-primary shadow-sm cursor-pointer"
          >
            <svg 
              className="size-3.5 fill-current text-white/40 group-hover/link:text-lume-primary group-hover/link:scale-105 transition-transform" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.75-.79 4.54-1.11 6.26-.14.73-.41.97-.67.99-.57.05-1-.38-1.55-.74-.86-.56-1.35-.91-2.19-1.46-.97-.64-.34-1 .21-1.57.14-.15 2.66-2.44 2.71-2.66.01-.03.01-.13-.05-.18-.06-.05-.15-.03-.21-.02-.1.02-1.63 1.03-4.6 3.04-.44.3-.83.45-1.18.44-.38 0-1.12-.2-1.67-.39-.67-.22-1.2-.34-1.15-.72.03-.2.3-.4.81-.6 3.14-1.36 5.24-2.26 6.28-2.69 3-.1.62-.21 1.34.21 1.34 0 0 .15.02.23.08.08.06.1.13.1.21-.01.07-.02.15-.04.22z" />
            </svg>
            <span>Telegram</span>
          </a>
        )}

        <a 
          href={githubUrl} 
          target="_blank" 
          onPointerDown={(e) => e.stopPropagation()}
          className="group/link inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-lume-primary/30 transition-all font-mono text-[10px] text-white/40 hover:text-lume-primary shadow-sm cursor-pointer"
        >
          <Github className="size-3.5 group-hover/link:scale-105 transition-transform" />
          <span>GitHub</span>
        </a>
      </div>
    </BentoTile>
  )
}
