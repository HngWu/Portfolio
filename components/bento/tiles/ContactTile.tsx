"use client"

import * as React from "react"
import { BentoTile } from "../BentoTile"
import { cn, getTypographyClasses } from "@/lib/utils"
import { ForceMobileContext } from "../ForceMobileContext"
import { Mail, Github, Linkedin, Check, Copy } from "lucide-react"

import type { ContactContent } from "@/lib/tiles/schemas"

interface ContactTileProps {
  id: string
  size: string
  content: ContactContent
  deepDive?: unknown
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

export function ContactTile({
  id,
  size,
  content,
  deepDive: _deepDive,
  isDragging,
  sortableProps
}: ContactTileProps) {
  const { email, github, linkedin, telegram } = content
  const forceMobile = React.useContext(ForceMobileContext)
  const typo = getTypographyClasses(size, false, forceMobile)
  const deepTypo = getTypographyClasses(size, true, forceMobile)

  const [copied, setCopied] = React.useState(false)

  // Dynamic social links with production defaults to guarantee they show up
  const linkedinUrl = linkedin || "https://www.linkedin.com/in/tan-hng-wu-8ab093262/"
  const telegramUrl = telegram
  const githubUrl = github || "https://github.com/HngWu"

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <BentoTile
      id={id}
      size={size}
      glowColor="mint"
      isDragging={isDragging}
      sortableProps={sortableProps}
      canDeepDive={true}
      canMorph={false}
      canExpand={false}
      deepContent={
        <div className="flex flex-col h-full w-full justify-between">
          <div className="flex-1 select-none">
            <div className="flex items-center justify-between mb-5">
              <h3 className={cn(deepTypo.heading, "text-white/90 font-mono tracking-tight font-bold")}>Contact</h3>
              <Mail className={cn(deepTypo.icon, "text-white/20")} />
            </div>

            {/* Clean Copiable Email Container */}
            <div 
              onClick={handleCopy}
              className="group/email flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-mode-accent/30 rounded-2xl cursor-pointer transition-all duration-300 select-all"
            >
              <div className="flex flex-col gap-1 min-w-0 pr-3">
                <span className={cn("text-white/90 font-mono font-medium text-sm md:text-base leading-tight break-all selection:bg-mode-accent selection:text-black")}>
                  {email}
                </span>
              </div>
              <div className="shrink-0 p-2.5 bg-white/5 rounded-xl border border-white/5 group-hover/email:border-mode-accent/30 transition-all flex items-center justify-center relative">
                {copied ? (
                  <Check className="size-4 text-mode-accent-bright animate-in zoom-in-75 duration-200" />
                ) : (
                  <>
                    <Copy className="size-4 text-white/40 group-hover/email:text-mode-accent-bright group-hover/email:scale-105 transition-all" />
                    <span className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover/email:opacity-100 font-mono text-[8px] uppercase text-mode-accent-bright bg-black/85 border border-mode-accent/30 px-2 py-0.5 rounded shadow-lg tracking-widest transition-all duration-300 pointer-events-none whitespace-nowrap scale-90 group-hover/email:scale-100 translate-y-1 group-hover/email:translate-y-0 backdrop-blur-sm z-50">
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
              rel="noopener noreferrer"
              onPointerDown={(e) => e.stopPropagation()}
              className="group/link inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-mode-accent/30 transition-all font-mono text-[10px] text-white/40 hover:text-mode-accent-bright shadow-sm cursor-pointer"
            >
              <Linkedin className="size-3.5 group-hover/link:scale-105 transition-transform" />
              <span>LinkedIn</span>
            </a>

            {telegramUrl && (
              <a 
                href={telegramUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onPointerDown={(e) => e.stopPropagation()}
                className="group/link inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-mode-accent/30 transition-all font-mono text-[10px] text-white/40 hover:text-mode-accent-bright shadow-sm cursor-pointer"
              >
                <svg 
                  className="size-3.5 fill-current text-white/40 group-hover/link:text-mode-accent-bright group-hover/link:scale-105 transition-transform" 
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
              rel="noopener noreferrer"
              onPointerDown={(e) => e.stopPropagation()}
              className="group/link inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-mode-accent/30 transition-all font-mono text-[10px] text-white/40 hover:text-mode-accent-bright shadow-sm cursor-pointer"
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
          className="group/email flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-mode-accent/30 rounded-2xl cursor-pointer transition-all duration-300 select-all"
        >
          <div className="flex flex-col gap-1 min-w-0 pr-3">
            <span className={cn("text-white/90 font-mono font-medium text-sm md:text-base leading-tight break-all selection:bg-mode-accent selection:text-black")}>
              {email}
            </span>
          </div>
          <div className="shrink-0 p-2.5 bg-white/5 rounded-xl border border-white/5 group-hover/email:border-mode-accent/30 transition-all flex items-center justify-center relative">
            {copied ? (
              <Check className="size-4 text-mode-accent-bright animate-in zoom-in-75 duration-200" />
            ) : (
              <>
                <Copy className="size-4 text-white/40 group-hover/email:text-mode-accent-bright group-hover/email:scale-105 transition-all" />
                <span className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover/email:opacity-100 font-mono text-[8px] uppercase text-mode-accent-bright bg-black/85 border border-mode-accent/30 px-2 py-0.5 rounded shadow-lg tracking-widest transition-all duration-300 pointer-events-none whitespace-nowrap scale-90 group-hover/email:scale-100 translate-y-1 group-hover/email:translate-y-0 backdrop-blur-sm z-50">
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
          rel="noopener noreferrer"
          onPointerDown={(e) => e.stopPropagation()}
          className="group/link inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-mode-accent/30 transition-all font-mono text-[10px] text-white/40 hover:text-mode-accent-bright shadow-sm cursor-pointer"
        >
          <Linkedin className="size-3.5 group-hover/link:scale-105 transition-transform" />
          <span>LinkedIn</span>
        </a>

        {telegramUrl && (
          <a 
            href={telegramUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            className="group/link inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-mode-accent/30 transition-all font-mono text-[10px] text-white/40 hover:text-mode-accent-bright shadow-sm cursor-pointer"
          >
            <svg 
              className="size-3.5 fill-current text-white/40 group-hover/link:text-mode-accent-bright group-hover/link:scale-105 transition-transform" 
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
          rel="noopener noreferrer"
          onPointerDown={(e) => e.stopPropagation()}
          className="group/link inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-mode-accent/30 transition-all font-mono text-[10px] text-white/40 hover:text-mode-accent-bright shadow-sm cursor-pointer"
        >
          <Github className="size-3.5 group-hover/link:scale-105 transition-transform" />
          <span>GitHub</span>
        </a>
      </div>
    </BentoTile>
  )
}
