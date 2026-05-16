# Phase 2: Bento Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the dynamic 12-column Bento Grid system, the base tile wrapper, various tile components, and integrate with Supabase to fetch and display the data on the home page.

**Architecture:** The `BentoGrid` will be a React Server Component (or standard client component if it needs window resizing logic, but CSS Grid handles most responsive behavior). Individual tiles will be Client Components to support 3D hover effects (in Phase 4) and click navigation. Content toggling between "Quick-Pitch" and "Deep Dive" modes will respond to the global Zustand `useViewModeStore`. 

**Tech Stack:** Next.js (App Router), Tailwind CSS, Framer Motion (for smooth height transitions), Zustand, Supabase.

---

### Task 1: Base Components (GlassCard & Badge)

**Files:**
- Create: `components/ui/GlassCard.tsx`
- Create: `components/ui/Badge.tsx`

- [ ] **Step 1: Implement GlassCard**
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: "mint" | "blue" | "pink" | "amber" | "none"
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glowColor = "none", ...props }, ref) => {
    const glowClasses = {
      mint: "hover:shadow-[0_0_40px_rgba(74,255,180,0.15),inset_0_0_20px_rgba(74,255,180,0.15)] border-lume-dim hover:border-lume",
      blue: "hover:shadow-[0_0_40px_rgba(74,143,255,0.15),inset_0_0_20px_rgba(74,143,255,0.15)]",
      pink: "hover:shadow-[0_0_40px_rgba(255,74,143,0.15),inset_0_0_20px_rgba(255,74,143,0.15)]",
      amber: "hover:shadow-[0_0_40px_rgba(255,180,74,0.15),inset_0_0_20px_rgba(255,180,74,0.15)]",
      none: ""
    }

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white/[0.06] backdrop-blur-md border border-white/[0.08] rounded-2xl",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_3px_rgba(0,0,0,0.5),0_8px_32px_rgba(0,0,0,0.3)]",
          "transition-all duration-300 ease-out hover:border-white/[0.18]",
          glowClasses[glowColor],
          className
        )}
        {...props}
      />
    )
  }
)
GlassCard.displayName = "GlassCard"
```

- [ ] **Step 2: Implement Badge**
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "lume" | "outline"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-white/10 text-white/70",
    lume: "bg-[#4A8FFF]/15 text-[#4A8FFF]",
    outline: "border border-white/10 text-white/50"
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold tracking-[0.12em] uppercase",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
```

### Task 2: Bento Grid System & Base Tile Wrapper

**Files:**
- Create: `components/bento/BentoGrid.tsx`
- Create: `components/bento/BentoTile.tsx`

- [ ] **Step 1: Implement BentoGrid**
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export function BentoGrid({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-6 xl:grid-cols-12 auto-rows-[minmax(120px,auto)] gap-2 md:gap-3 xl:gap-4 max-w-[1440px] mx-auto w-full",
        className
      )}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Implement BentoTile Wrapper**
```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/GlassCard"
import { useRouter } from "next/navigation"

interface BentoTileProps {
  id: string
  size: string // e.g., '4x2', '2x2'
  href?: string
  glowColor?: "mint" | "blue" | "pink" | "amber" | "none"
  className?: string
  children: React.ReactNode
}

export function BentoTile({
  id,
  size,
  href,
  glowColor = "none",
  className,
  children,
}: BentoTileProps) {
  const router = useRouter()

  // Map sizes to column and row spans based on DESIGN.md
  const sizeClasses: Record<string, string> = {
    "1x1": "col-span-1 row-span-1",
    "2x1": "col-span-2 row-span-1 md:col-span-3 xl:col-span-2",
    "2x2": "col-span-2 row-span-2 md:col-span-3 xl:col-span-2",
    "3x2": "col-span-2 row-span-2 md:col-span-3 xl:col-span-3",
    "4x2": "col-span-2 row-span-2 md:col-span-6 xl:col-span-4",
    "4x3": "col-span-2 row-span-3 md:col-span-6 xl:col-span-4",
    "6x2": "col-span-2 row-span-2 md:col-span-6 xl:col-span-6",
    "6x4": "col-span-2 row-span-4 md:col-span-6 xl:col-span-6",
    "3x3": "col-span-2 row-span-3 md:col-span-3 xl:col-span-3",
    "2x4": "col-span-2 row-span-4 md:col-span-3 xl:col-span-2",
  }

  const spanClass = sizeClasses[size] || "col-span-2 row-span-2"
  const isClickable = !!href

  const handleClick = () => {
    if (href) {
      if (href.startsWith("http") || href.startsWith("mailto:")) {
        window.open(href, "_blank", "noopener,noreferrer")
      } else {
        router.push(href)
      }
    }
  }

  return (
    <GlassCard
      glowColor={glowColor}
      onClick={handleClick}
      className={cn(
        spanClass,
        "relative overflow-hidden group p-4 md:p-6 flex flex-col",
        isClickable && "cursor-pointer",
        className
      )}
    >
      {children}
      {isClickable && !href.startsWith("http") && (
        <div className="absolute bottom-4 left-4 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 flex items-center gap-2 text-xs font-mono text-white/50">
          <span>View Details</span>
          <span>→</span>
        </div>
      )}
    </GlassCard>
  )
}
```

### Task 3: Build Specific Tile Variants

**Files:**
- Create: `components/bento/tiles/ProjectTile.tsx`
- Create: `components/bento/tiles/ExperienceTile.tsx`
- Create: `components/bento/tiles/StatTile.tsx`

- [ ] **Step 1: Implement ProjectTile with Quick-Pitch Toggle**
```tsx
"use client"

import { BentoTile } from "../BentoTile"
import { Badge } from "@/components/ui/Badge"
import { useViewModeStore } from "@/store/useViewModeStore"
import { motion, AnimatePresence } from "framer-motion"

interface ProjectTileProps {
  id: string
  size: string
  name: string
  description: string
  tags: string[]
  deepDiveContent?: string
}

export function ProjectTile({ id, size, name, description, tags, deepDiveContent }: ProjectTileProps) {
  const mode = useViewModeStore((state) => state.mode)
  const isDeepDive = mode === "deep"

  return (
    <BentoTile id={id} size={size} href={`/projects/${id}`} glowColor="blue" className="justify-between">
      <div>
        <h3 className="text-xl md:text-2xl font-display text-white/90 mb-2">{name}</h3>
        <p className="text-sm text-white/55 line-clamp-2">{description}</p>
        
        <AnimatePresence>
          {isDeepDive && deepDiveContent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="mt-4 text-sm text-white/70">{deepDiveContent}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-2 mt-6">
        {tags.slice(0, isDeepDive ? tags.length : 3).map((tag) => (
          <Badge key={tag} variant="lume">{tag}</Badge>
        ))}
        {!isDeepDive && tags.length > 3 && (
          <Badge variant="outline">+{tags.length - 3}</Badge>
        )}
      </div>
    </BentoTile>
  )
}
```

- [ ] **Step 2: Implement ExperienceTile**
```tsx
"use client"

import { BentoTile } from "../BentoTile"
import { useViewModeStore } from "@/store/useViewModeStore"
import { motion, AnimatePresence } from "framer-motion"

interface ExperienceTileProps {
  id: string
  size: string
  role: string
  company: string
  date: string
  bullets: string[]
}

export function ExperienceTile({ id, size, role, company, date, bullets }: ExperienceTileProps) {
  const mode = useViewModeStore((state) => state.mode)
  const isDeepDive = mode === "deep"

  return (
    <BentoTile id={id} size={size} href={`/experience`} glowColor="mint" className="border-l-2 border-l-[#4AFFB4]/50">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-white/90">{role}</h3>
          <p className="text-xs font-mono text-white/40 mt-1">{company} · {date}</p>
        </div>
      </div>

      <ul className="space-y-2 text-sm text-white/60 list-disc pl-4">
        {bullets.slice(0, 2).map((bullet, i) => (
          <li key={i}>{bullet}</li>
        ))}
        
        <AnimatePresence>
          {isDeepDive && bullets.length > 2 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {bullets.slice(2).map((bullet, i) => (
                <li key={i + 2} className="mt-2">{bullet}</li>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </ul>
    </BentoTile>
  )
}
```

- [ ] **Step 3: Implement StatTile**
```tsx
import { BentoTile } from "../BentoTile"

export function StatTile({ id, size, value, label }: { id: string, size: string, value: string | number, label: string }) {
  return (
    <BentoTile id={id} size={size} className="items-center justify-center text-center">
      <div className="text-4xl md:text-5xl font-mono text-[#4AFFB4] mb-2">{value}</div>
      <div className="text-[0.6875rem] font-semibold tracking-[0.12em] uppercase text-white/30">{label}</div>
    </BentoTile>
  )
}
```

### Task 4: Integrate and Render on Home Page

**Files:**
- Modify: `app/page.tsx`
- Create: `components/nav/ViewModeToggle.tsx`

- [ ] **Step 1: Implement ViewModeToggle**
```tsx
"use client"

import { useViewModeStore } from "@/store/useViewModeStore"
import { cn } from "@/lib/utils"

export function ViewModeToggle() {
  const { mode, setMode } = useViewModeStore()

  return (
    <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 w-fit z-50 fixed top-6 right-6">
      <button
        onClick={() => setMode("quick")}
        className={cn(
          "px-4 py-1.5 rounded-full text-xs font-medium transition-colors",
          mode === "quick" ? "bg-[#FFB44A]/20 text-[#FFB44A]" : "text-white/50 hover:text-white/80"
        )}
      >
        Quick-Pitch
      </button>
      <button
        onClick={() => setMode("deep")}
        className={cn(
          "px-4 py-1.5 rounded-full text-xs font-medium transition-colors",
          mode === "deep" ? "bg-[#4A8FFF]/20 text-[#4A8FFF]" : "text-white/50 hover:text-white/80"
        )}
      >
        Deep Dive
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Render hardcoded/mock tiles on Home Page** (to verify rendering before Supabase fetch, ensuring the layout works)
```tsx
import { BentoGrid } from "@/components/bento/BentoGrid"
import { ProjectTile } from "@/components/bento/tiles/ProjectTile"
import { ExperienceTile } from "@/components/bento/tiles/ExperienceTile"
import { StatTile } from "@/components/bento/tiles/StatTile"
import { ViewModeToggle } from "@/components/nav/ViewModeToggle"

export default async function Home() {
  // In a full implementation, we fetch from Supabase here.
  // For Phase 2 validation, we'll mount the grid with sample data based on DESIGN.md
  
  return (
    <main className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <ViewModeToggle />
      
      <BentoGrid>
        {/* Hero Tile Placeholder (6x4) */}
        <div className="col-span-2 row-span-4 md:col-span-6 xl:col-span-6 bg-white/[0.02] border border-white/5 rounded-2xl p-8 flex flex-col justify-center">
          <div className="text-[0.6875rem] font-mono tracking-widest text-[#4AFFB4] uppercase mb-4">Creative Developer</div>
          <h1 className="text-5xl md:text-7xl font-display text-white/90 leading-tight">HW</h1>
          <p className="mt-6 text-white/50 max-w-md">Bridging the gap between engineering and aesthetic design. Dark minimalist, cinematic UX.</p>
        </div>

        <ProjectTile 
          id="triviaduel" 
          size="4x3" 
          name="TriviaDuel" 
          description="Real-time multiplayer trivia platform with resilient AI question generation."
          deepDiveContent="Architected with Next.js App Router and Supabase Realtime for sub-100ms latency across 5 global edge regions."
          tags={["Next.js", "Supabase", "WebSockets", "Tailwind", "OpenAI"]}
        />

        <ExperienceTile
          id="dbs"
          size="4x2"
          role="Software Engineer Intern"
          company="DBS Bank"
          date="2024 - Present"
          bullets={[
            "Engineered internal dashboard for transaction monitoring.",
            "Reduced load times by 40% using React Server Components.",
            "Collaborated directly with UX researchers for accessibility.",
            "Wrote comprehensive unit tests yielding 95% coverage."
          ]}
        />

        <StatTile id="gpa" size="1x1" value="3.91" label="GPA" />
        <StatTile id="exp" size="1x1" value="1yr" label="Experience" />
        <StatTile id="proj" size="1x1" value="12+" label="Projects" />
      </BentoGrid>
    </main>
  )
}
```

- [ ] **Step 3: Commit Phase 2 Completion**
Run: `git add . && git commit -m "feat: implement bento engine and view mode"`
