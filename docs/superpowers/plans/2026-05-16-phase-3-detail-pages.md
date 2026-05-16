# Phase 3: Detail Pages & Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared Detail Page shell, implement listing and detail routes for all tile types (`/projects`, `/experience`, etc.), and implement the Command Palette (⌘K) for global navigation.

**Architecture:** We use Next.js App Router for all routes. The `DetailShell` component will wrap the content of all detail pages to provide a consistent top navigation (back link) and page hero. The Command Palette will be a global client component mounted in the root layout.

**Tech Stack:** Next.js (App Router), Tailwind CSS, Lucide React (icons), Zustand.

---

### Task 1: Shared Detail Page Shell

**Files:**
- Create: `components/detail/BackLink.tsx`
- Create: `components/detail/PageHero.tsx`
- Create: `components/detail/DetailShell.tsx`

- [ ] **Step 1: Implement BackLink**
```tsx
"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export function BackLink() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push("/")}
      className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white/90 transition-colors group mb-12"
    >
      <ArrowLeft className="w-4 h-4 transform transition-transform group-hover:-translate-x-1" />
      Back to Home
    </button>
  )
}
```

- [ ] **Step 2: Implement PageHero**
```tsx
interface PageHeroProps {
  typeLabel: string
  title: string
  descriptor: string
}

export function PageHero({ typeLabel, title, descriptor }: PageHeroProps) {
  return (
    <div className="mb-16">
      <div className="text-[0.6875rem] font-mono tracking-widest text-lume-primary uppercase mb-4">
        {typeLabel}
      </div>
      <h1 className="text-4xl md:text-5xl font-display text-white/90 mb-4">{title}</h1>
      <p className="text-lg text-white/60 max-w-2xl">{descriptor}</p>
      
      <div className="h-[1px] w-full bg-white/10 mt-12" />
    </div>
  )
}
```

- [ ] **Step 3: Implement DetailShell**
```tsx
import * as React from "react"
import { BackLink } from "./BackLink"
import { PageHero } from "./PageHero"

interface DetailShellProps {
  typeLabel: string
  title: string
  descriptor: string
  children: React.ReactNode
}

export function DetailShell({ typeLabel, title, descriptor, children }: DetailShellProps) {
  return (
    <main className="min-h-screen pt-24 pb-24 px-4 md:px-8 max-w-4xl mx-auto">
      <BackLink />
      <PageHero typeLabel={typeLabel} title={title} descriptor={descriptor} />
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </main>
  )
}
```

### Task 2: Implement Projects Routes

**Files:**
- Create: `app/projects/page.tsx`
- Create: `app/projects/[slug]/page.tsx`

- [ ] **Step 1: Implement /projects listing page**
```tsx
import { DetailShell } from "@/components/detail/DetailShell"
import { GlassCard } from "@/components/ui/GlassCard"
import Link from "next/link"

export default function ProjectsPage() {
  // Mock data for Phase 3
  const projects = [
    { slug: "triviaduel", name: "TriviaDuel", desc: "Real-time multiplayer trivia platform." },
    { slug: "secureasset", name: "SecureAsset", desc: "Blockchain asset tracking system." }
  ]

  return (
    <DetailShell typeLabel="WORK" title="Projects" descriptor="Things I've built — real-time, full-stack, and thoughtfully crafted.">
      {projects.map(p => (
        <Link key={p.slug} href={`/projects/${p.slug}`}>
          <GlassCard className="p-6 cursor-pointer border-l-2 border-l-lume-secondary hover:-translate-y-1">
            <h3 className="text-xl font-medium text-white/90">{p.name}</h3>
            <p className="text-white/60 mt-2">{p.desc}</p>
          </GlassCard>
        </Link>
      ))}
    </DetailShell>
  )
}
```

- [ ] **Step 2: Implement /projects/[slug] detail page**
```tsx
import { BackLink } from "@/components/detail/BackLink"
import { GlassCard } from "@/components/ui/GlassCard"

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <main className="min-h-screen pt-24 pb-24 px-4 md:px-8 max-w-3xl mx-auto">
      <div className="mb-12">
        <Link href="/projects" className="text-white/50 hover:text-white/90 text-sm">← Projects</Link>
      </div>
      
      <div className="text-[0.6875rem] font-mono text-lume-primary uppercase mb-4">PROJECT</div>
      <h1 className="text-4xl font-display text-white/90 mb-4 capitalize">{slug}</h1>
      <p className="text-white/60 mb-12">Detailed implementation notes and architecture overview will go here.</p>

      <h2 className="text-xl font-medium text-white/90 mb-4">Key Features</h2>
      <GlassCard className="p-6">
        <div className="flex gap-4">
          <div className="text-lume-primary">▸</div>
          <div>
            <h4 className="text-white/90 font-medium">Real-Time Sync</h4>
            <p className="text-white/60 text-sm mt-1">WebSockets via Supabase Realtime.</p>
          </div>
        </div>
      </GlassCard>
    </main>
  )
}

// Ensure the Link component is imported
import Link from "next/link"
```

### Task 3: Implement Other Listing Routes

**Files:**
- Create: `app/experience/page.tsx`
- Create: `app/awards/page.tsx`
- Create: `app/skills/page.tsx`
- Create: `app/education/page.tsx`

- [ ] **Step 1: Implement /experience page**
```tsx
import { DetailShell } from "@/components/detail/DetailShell"

export default function ExperiencePage() {
  return (
    <DetailShell typeLabel="CAREER" title="Experience" descriptor="How I've contributed in professional settings.">
      <div className="pl-6 border-l border-white/10 relative">
        <div className="absolute w-3 h-3 rounded-full bg-lume-primary -left-[6.5px] top-2" />
        <h3 className="text-lg font-medium text-white/90">Software Engineer Intern</h3>
        <p className="text-sm font-mono text-white/40 mt-1">DBS Bank · 2024 - Present</p>
        <ul className="mt-4 text-white/60 text-sm list-disc pl-4 space-y-2">
          <li>Engineered internal dashboard for transaction monitoring.</li>
          <li>Reduced load times by 40% using React Server Components.</li>
        </ul>
      </div>
    </DetailShell>
  )
}
```

- [ ] **Step 2: Implement /awards page**
```tsx
import { DetailShell } from "@/components/detail/DetailShell"
import { GlassCard } from "@/components/ui/GlassCard"

export default function AwardsPage() {
  return (
    <DetailShell typeLabel="RECOGNITION" title="Awards & Honours" descriptor="Competitions, scholarships, and milestones.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-6 border-l-2 border-l-lume-warm">
          <h3 className="text-lg font-medium text-white/90">WorldSkills Singapore</h3>
          <p className="text-sm font-mono text-white/40 mt-1">2025 · Silver Medal</p>
        </GlassCard>
      </div>
    </DetailShell>
  )
}
```

- [ ] **Step 3: Implement /skills and /education pages**
```tsx
// app/skills/page.tsx
import { DetailShell } from "@/components/detail/DetailShell"
import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/Badge"

export default function SkillsPage() {
  return (
    <DetailShell typeLabel="CAPABILITIES" title="Skills & Technologies" descriptor="Languages, frameworks, tools, and methodologies.">
      <GlassCard className="p-6">
        <h3 className="text-lg font-medium text-white/90 mb-4">Frameworks & Libraries</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="lume">Next.js</Badge>
          <Badge variant="lume">React</Badge>
          <Badge variant="lume">TailwindCSS</Badge>
        </div>
      </GlassCard>
    </DetailShell>
  )
}
```

```tsx
// app/education/page.tsx
import { DetailShell } from "@/components/detail/DetailShell"
import { GlassCard } from "@/components/ui/GlassCard"

export default function EducationPage() {
  return (
    <DetailShell typeLabel="ACADEMIC" title="Education" descriptor="Foundations built through structured learning.">
      <GlassCard className="p-8">
        <h3 className="text-2xl font-display text-white/90">Nanyang Polytechnic</h3>
        <p className="text-white/60 mt-1">Diploma in Information Technology</p>
        <p className="text-sm font-mono text-white/40 mt-2">Apr 2023 - Apr 2026</p>
        
        <div className="mt-8">
          <div className="text-5xl font-mono text-lume-primary">3.91</div>
          <div className="text-xs tracking-widest text-white/40 uppercase mt-2">Cumulative GPA</div>
        </div>
      </GlassCard>
    </DetailShell>
  )
}
```

### Task 4: Command Palette (⌘K)

**Files:**
- Create: `components/cli/CommandPalette.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Implement CommandPalette**
```tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

export function CommandPalette() {
  const [isOpen, setIsOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  if (!isOpen) return null

  const handleNavigate = (path: string) => {
    setIsOpen(false)
    router.push(path)
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div className="w-full max-w-2xl bg-[#141414]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-4">
        <div className="flex items-center px-4 border-b border-white/10">
          <Search className="w-5 h-5 text-white/50" />
          <input
            autoFocus
            className="w-full bg-transparent border-none focus:outline-none text-white p-4 placeholder:text-white/30"
            placeholder="Type a command or search..."
          />
          <div className="text-xs font-mono text-white/30 bg-white/5 px-2 py-1 rounded">ESC</div>
        </div>
        
        <div className="p-2 overflow-y-auto max-h-[60vh]">
          <div className="px-3 py-2 text-xs font-semibold text-white/30 uppercase tracking-widest">Navigation</div>
          <button onClick={() => handleNavigate("/")} className="w-full text-left px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-colors">Home</button>
          <button onClick={() => handleNavigate("/projects")} className="w-full text-left px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-colors">Projects</button>
          <button onClick={() => handleNavigate("/experience")} className="w-full text-left px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-colors">Experience</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add CommandPalette to Layout**
Modify `app/layout.tsx` to include `<CommandPalette />` just inside the `<body>` tag.
```tsx
import { CommandPalette } from "@/components/cli/CommandPalette"
// ...
      <body className="...">
        <CommandPalette />
        {children}
      </body>
// ...
```
