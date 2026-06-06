"use client"

import * as React from "react"
import { BentoTile } from "../BentoTile"
import { cn, getTypographyClasses } from "@/lib/utils"
import { ForceMobileContext } from "../ForceMobileContext"
import { Cpu, Terminal, Braces, Brain, Code2 } from "lucide-react"

interface SkillsTileProps {
  id: string
  size: string
  tags: string[]
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
}

interface TechTagInfo {
  icon: React.ReactNode
  color: string
  bg: string
  border: string
  text: string
}

function getTechTagInfo(tag: string): TechTagInfo {
  const t = tag.toLowerCase()

  if (t.includes("java") && !t.includes("javascript")) {
    return {
      icon: (
        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.7 15.3c-.5.8-.8 1.8-.8 2.8M10 11.5c.3 1-.3 2-1 2.8M10.8 7.5c-1-.2-2.2.3-2.7 1.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      ),
      color: "#EA2D2E",
      bg: "bg-[#EA2D2E]/10",
      border: "border-[#EA2D2E]/25",
      text: "text-[#FF7C7C]"
    }
  }

  if (t.includes("spring")) {
    return {
      icon: (
        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
          <path d="M12.02 2C6.51 2 2.01 6.5 2.01 12.01c0 2.5 1 4.9 2.8 6.7l13.9-13.9c-1.8-1.8-4.2-2.8-6.7-2.8zm6.4 3.3L4.51 19.2c1.8 1.8 4.2 2.8 6.7 2.8 5.5 0 10-4.5 10-10.01 0-2.5-1-4.9-2.8-6.7zM11 7.2c-.3 0-.5.2-.5.5s.2.5.5.5c1.8 0 3.3 1.5 3.3 3.3 0 .3.2.5.5.5s.5-.2.5-.5c0-2.4-1.9-4.3-4.3-4.3z" />
        </svg>
      ),
      color: "#6DB33F",
      bg: "bg-[#6DB33F]/10",
      border: "border-[#6DB33F]/25",
      text: "text-[#9DE270]"
    }
  }

  if (t.includes("next")) {
    return {
      icon: (
        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.7 14.5l-4.5-6.5V16h-1.5V8h1.5l4.5 6.5V8h1.5v8.5h-1.5z" />
        </svg>
      ),
      color: "#FFFFFF",
      bg: "bg-white/10",
      border: "border-white/20",
      text: "text-white/90"
    }
  }

  if (t.includes("typescript") || t === "ts") {
    return {
      icon: (
        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
          <path d="M2 2h20v20H2V2zm11.5 14.6c.9 0 1.6-.3 2.1-.8.5-.5.8-1.2.8-2h-1.5c0 .4-.1.7-.3.9-.2.2-.5.3-.9.3-.4 0-.7-.1-.9-.4s-.3-.7-.3-1.3.1-1 .3-1.3c.2-.3.5-.4.9-.4.4 0 .7.1.9.3.2.2.3.5.3.9h1.5c0-.8-.3-1.5-.8-2-.5-.5-1.2-.8-2.1-.8-1.1 0-1.9.4-2.5 1.1-.6.7-.9 1.7-.9 3s.3 2.3.9 3c.6.7 1.4 1.1 2.5 1.1zm-4.3 0c.9 0 1.5-.3 1.9-.8.4-.5.6-1.3.6-2.3h-1.5c0 .6-.1 1-.2 1.2s-.4.3-.8.3-.7-.1-.9-.4-.3-.7-.3-1.3h3.8c0-1.4-.3-2.4-1-3.1s-1.6-1.1-2.9-1.1c-1.1 0-2 .4-2.6 1.1-.6.7-.9 1.7-.9 3.1s.3 2.4.9 3.1c.6.7 1.5 1.1 2.6 1.1zm3.8-6.1h-4.8c0-.6.1-1 .3-1.2.2-.2.5-.3.9-.3s.7.1.9.3.3.6.3 1.2z" />
        </svg>
      ),
      color: "#3178C6",
      bg: "bg-[#3178C6]/10",
      border: "border-[#3178C6]/25",
      text: "text-[#7FB6F5]"
    }
  }

  if (t.includes("mariadb") || t.includes("mysql") || t.includes("database")) {
    return {
      icon: (
        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
          <path d="M12 2C6.5 2 2 3.8 2 6v12c0 2.2 4.5 4 10 4s10-1.8 10-4V6c0-2.2-4.5-4-10-4zm0 2c4.4 0 8 1.3 8 2s-3.6 2-8 2-8-1.3-8-2 3.6-2 8-2zm-8 4.4c1.8.8 4.8 1.6 8 1.6s6.2-.8 8-1.6V10c0 .7-3.6 2-8 2s-8-1.3-8-2V8.4zm0 6c1.8.8 4.8 1.6 8 1.6s6.2-.8 8-1.6V16c0 .7-3.6 2-8 2s-8-1.3-8-2v-1.6z" />
        </svg>
      ),
      color: "#00758F",
      bg: "bg-[#00758F]/10",
      border: "border-[#00758F]/25",
      text: "text-[#5FC8E0]"
    }
  }

  if (t.includes("openshift") || t.includes("redhat")) {
    return {
      icon: (
        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v8h-2zm-3 2h2v4H8zm6 0h2v4h-2z" />
        </svg>
      ),
      color: "#EE0000",
      bg: "bg-[#EE0000]/10",
      border: "border-[#EE0000]/25",
      text: "text-[#FF6666]"
    }
  }

  if (t.includes("jenkins")) {
    return {
      icon: (
        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 4h2v2h-2zm0 4h2v8h-2z" />
        </svg>
      ),
      color: "#D24939",
      bg: "bg-[#D24939]/10",
      border: "border-[#D24939]/25",
      text: "text-[#FF8D7F]"
    }
  }

  if (t.includes("gsap") || t.includes("animation")) {
    return {
      icon: (
        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
          <path d="M12 2L2 22h20L12 2zm0 4.8l6.2 12.4H5.8L12 6.8zm-1 8h2v2h-2v-2z" />
        </svg>
      ),
      color: "#88CE02",
      bg: "bg-[#88CE02]/10",
      border: "border-[#88CE02]/25",
      text: "text-[#C2FF51]"
    }
  }

  if (t.includes("three")) {
    return {
      icon: (
        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
          <path d="M12 2L2 8.5v7L12 22l10-6.5v-7L12 2zm8 6l-8 5.2L4 8V6.8l8-5.2 8 5.2V8zm-8 7.3L4 10.1v5.1l8 5.2 8-5.2v-5.1l-8 5.2z" />
        </svg>
      ),
      color: "#049EF4",
      bg: "bg-[#049EF4]/10",
      border: "border-[#049EF4]/25",
      text: "text-[#6BD5FF]"
    }
  }

  if (t.includes("react")) {
    return {
      icon: (
        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
        </svg>
      ),
      color: "#61DAFB",
      bg: "bg-[#61DAFB]/10",
      border: "border-[#61DAFB]/25",
      text: "text-[#A8EFFF]"
    }
  }

  if (t.includes("node")) {
    return {
      icon: (
        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
          <path d="M12 2L2 7.8v8.4L12 22l10-5.8v-8.4L12 2zm8 5.2v7.6L12 20.3 4 14.8V7.2L12 3.7l8 3.5zm-5 4.8h-6v2h6v-2z" />
        </svg>
      ),
      color: "#339933",
      bg: "bg-[#339933]/10",
      border: "border-[#339933]/25",
      text: "text-[#7AE57A]"
    }
  }

  if (t.includes("supabase")) {
    return {
      icon: (
        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
        </svg>
      ),
      color: "#3ECF8E",
      bg: "bg-[#3ECF8E]/10",
      border: "border-[#3ECF8E]/25",
      text: "text-[#87FFA7]"
    }
  }

  if (t.includes("tailwind")) {
    return {
      icon: (
        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
        </svg>
      ),
      color: "#38BDF8",
      bg: "bg-[#38BDF8]/10",
      border: "border-[#38BDF8]/25",
      text: "text-[#8EE5FF]"
    }
  }

  if (t.includes("javascript") || t === "js") {
    return {
      icon: (
        <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
          <path d="M3 3h18v18H3V3zm12.5 14.5c.9 0 1.6-.3 2.1-.8.5-.5.8-1.2.8-2h-1.5c0 .4-.1.7-.3.9-.2.2-.5.3-.9.3-.4 0-.7-.1-.9-.4s-.3-.7-.3-1.3.1-1 .3-1.3c.2-.3.5-.4.9-.4.4 0 .7.1.9.3.2.2.3.5.3.9h1.5c0-.8-.3-1.5-.8-2-.5-.5-1.2-.8-2.1-.8-1.1 0-1.9.4-2.5 1.1-.6.7-.9 1.7-.9 3s.3 2.3.9 3c.6.7 1.4 1.1 2.5 1.1z" />
        </svg>
      ),
      color: "#F7DF1E",
      bg: "bg-[#F7DF1E]/10",
      border: "border-[#F7DF1E]/25",
      text: "text-[#F5E668]"
    }
  }

  // Fallback
  return {
    icon: (
      <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
        <path d="M12 2c5.522 0 10 4.477 10 10s-4.478 10-10 10S2 17.523 2 12 6.478 2 12 2zm0 18c4.41 0 8-3.59 8-8s-3.59-8-8-8-8 3.59-8 8 3.59 8 8 8zm-1-11h2v2h-2zm0 4h2v4h-2z" />
      </svg>
    ),
    color: "#4A8FFF",
    bg: "bg-[#4A8FFF]/10",
    border: "border-[#4A8FFF]/25",
    text: "text-[#94C0FF]"
  }
}

export function SkillsTile({ id, size, tags, isDragging, sortableProps }: SkillsTileProps) {
  const forceMobile = React.useContext(ForceMobileContext)
  const typo = getTypographyClasses(size, false, forceMobile)
  const deepTypo = getTypographyClasses(size, true, forceMobile)

  const categorizedSkills = [
    {
      category: "Languages",
      skills: ["Java", "TypeScript", "JavaScript"],
      icon: <Braces className="size-3.5 text-lume-primary" />
    },
    {
      category: "Frameworks & UI",
      skills: ["Spring Boot", "Next.js 16", "Three.js", "GSAP"],
      icon: <Code2 className="size-3.5 text-lume-secondary" />
    },
    {
      category: "Infrastructure",
      skills: ["OpenShift", "Jenkins", "MariaDB"],
      icon: <Terminal className="size-3.5 text-lume-warm" />
    }
  ]

  return (
    <BentoTile
      id={id}
      size={size}
      href="/skills"
      glowColor="blue"
      isDragging={isDragging}
      sortableProps={sortableProps}
      canDeepDive={true}
      canMorph={true}
      deepContent={
        <div className="flex flex-col h-full w-full">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className={cn(deepTypo.meta, "text-white/30 uppercase tracking-widest")}>Expertise Breakdown</div>
            <Brain className={cn(deepTypo.icon, "text-lume-secondary/60")} />
          </div>
          <div className="space-y-6">
            {categorizedSkills.map((cat) => (
              <div key={cat.category} className="space-y-2.5">
                <div className="flex items-center gap-2 select-none">
                  {cat.icon}
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/70">{cat.category}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((tag) => {
                    const info = getTechTagInfo(tag)
                    return (
                      <span
                        key={tag}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-wider uppercase border select-none transition-all duration-300 hover:scale-[1.03] shadow-sm hover:shadow-md cursor-default",
                          info.bg,
                          info.border,
                          info.text
                        )}
                        style={{
                          textShadow: `0 0 10px ${info.color}15`
                        }}
                      >
                        <span className="shrink-0 leading-none">{info.icon}</span>
                        <span className="leading-none">{tag}</span>
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <div className="flex items-center justify-between mb-6 select-none">
        <div className={cn(typo.meta, "text-white/30 uppercase tracking-widest")}>Skills</div>
        <Cpu className={cn(typo.icon, "text-[#4A8FFF]/40")} />
      </div>
      <div className="flex flex-wrap gap-2.5">
        {(tags || []).map((tag: string) => {
          const info = getTechTagInfo(tag)
          return (
            <span 
              key={tag}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase border select-none transition-all duration-300 hover:scale-[1.03] shadow-sm hover:shadow-md cursor-default",
                info.bg,
                info.border,
                info.text
              )}
              style={{
                textShadow: `0 0 10px ${info.color}15`
              }}
            >
              <span className="shrink-0 leading-none">{info.icon}</span>
              <span className="leading-none">{tag}</span>
            </span>
          )
        })}
      </div>
    </BentoTile>
  )
}
