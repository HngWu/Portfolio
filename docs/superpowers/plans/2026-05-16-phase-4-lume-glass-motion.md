# Phase 4: Lume-Glass & Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the high-end visual styles and motion system, including GSAP ScrollTrigger reveals, 3D Tile tilts, and the curtain page transition.

**Architecture:** We use GSAP for all complex animations. The "Curtain" transition will use a global `PageCurtain` component in the root layout, synchronized with the Zustand `useNavigationStore`. The 3D Tilt will be implemented as a custom hook applied to the `BentoTile`.

**Tech Stack:** Next.js, Tailwind CSS, GSAP (ScrollTrigger), Framer Motion, Zustand.

---

### Task 1: Lume-Glass Utilities & GSAP Setup

**Files:**
- Create: `hooks/useGsap.ts` (helper for context-safe GSAP)
- Modify: `app/globals.css` (add utility classes)

- [ ] **Step 1: Implement useGsap hook**
```typescript
import { useLayoutEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export const useGsap = (callback: () => void, dependencies: any[] = []) => {
  useLayoutEffect(() => {
    const ctx = gsap.context(callback)
    return () => ctx.revert()
  }, dependencies)
}
```

- [ ] **Step 2: Add utility classes to globals.css**
```css
@layer utilities {
  .glass-card-base {
    @apply bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl transition-all duration-300;
    box-shadow: 
      inset 0 1px 0 rgba(255,255,255,0.06),
      0 1px 3px rgba(0,0,0,0.5),
      0 8px 32px rgba(0,0,0,0.3);
  }
  
  .lume-glow-mint {
    @apply hover:shadow-[0_0_40px_rgba(74,255,180,0.15),inset_0_0_20px_rgba(74,255,180,0.15)] hover:border-[rgba(74,255,180,0.4)];
  }
  
  .lume-glow-blue {
    @apply hover:shadow-[0_0_40px_rgba(74,143,255,0.15),inset_0_0_20px_rgba(74,143,255,0.15)] hover:border-[rgba(74,143,255,0.4)];
  }
}
```

### Task 2: 3D Tile Tilt Hook

**Files:**
- Create: `components/bento/useTilt.ts`
- Modify: `components/bento/BentoTile.tsx`

- [ ] **Step 1: Implement useTilt hook**
```typescript
"use client"

import { useCallback, useRef } from "react"

export function useTilt() {
  const ref = useRef<HTMLDivElement>(null)

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const x = (e.clientX - left) / width
    const y = (e.clientY - top) / height

    const rotateX = (y - 0.5) * -12 // max 12 degrees
    const rotateY = (x - 0.5) * 12

    ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }, [])

  const onMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
  }, [])

  return { ref, onMouseMove, onMouseLeave }
}
```

- [ ] **Step 2: Apply useTilt to BentoTile**
Modify `components/bento/BentoTile.tsx` to use the `useTilt` hook on the `GlassCard`.

### Task 3: GSAP Page Reveals (Detail Pages)

**Files:**
- Modify: `components/detail/DetailShell.tsx`

- [ ] **Step 1: Add staggered reveal animations**
Use `useGsap` to animate the back link, hero text, and children cards when the page mounts.
```typescript
// Inside DetailShell.tsx
useGsap(() => {
  gsap.from(".reveal-item", {
    y: 20,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "expo.out"
  })
})
```

### Task 4: Curtain Page Transition

**Files:**
- Create: `components/layout/PageCurtain.tsx`
- Modify: `app/layout.tsx`
- Modify: `hooks/usePageTransition.ts`

- [ ] **Step 1: Implement PageCurtain component**
```tsx
"use client"

import { useNavigationStore } from "@/store/useNavigationStore"
import { motion, AnimatePresence } from "framer-motion"

export function PageCurtain() {
  const { curtainState } = useNavigationStore()

  return (
    <AnimatePresence>
      {curtainState !== "idle" && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 bg-[#080808] z-[10000]"
        />
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Add PageCurtain to Layout**
Mount `<PageCurtain />` in `app/layout.tsx`.
