# Cinematic Page Transitions & Core Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement smooth, mode-aware page transitions (Golden Canvas Brush and Hextech Matrix Boot) and synchronize the Core Stabilization mode toggle with the 3D HexCore model.

**Architecture:** We will extend Zustand stores to capture tile dimensions and trigger animations. We'll use CSS SVG masks and GSAP for the Quick Pitch painting reveal, SVG chromatic aberration filters and GSAP scroll velocity monitoring for the Deep Dive blueprint style, and event-driven commands on the Three.js canvas for Core Stabilization.

**Tech Stack:** Next.js (App Router), Zustand, GSAP (ScrollTrigger), Tailwind CSS, Three.js (React Three Fiber).

---

### Task 1: Navigation Store Updates

**Files:**
- Modify: [useNavigationStore.ts](file:///C:/Projects/Portfolio/store/useNavigationStore.ts)

- [ ] **Step 1: Write updated interface and state variables**
  Add `originTileId` and `bentoTilesBounds` to tracking state.
  ```typescript
  // In store/useNavigationStore.ts
  export interface OriginRect {
    left: number
    top: number
    width: number
    height: number
    right: number
    bottom: number
  }

  interface NavigationStore {
    originTileId: string | null
    setOriginTileId: (id: string | null) => void
    originRect: OriginRect | null
    setOriginRect: (rect: OriginRect | null) => void
    bentoTilesBounds: Record<string, OriginRect> | null
    setBentoTilesBounds: (bounds: Record<string, OriginRect> | null) => void
    curtainState: 'idle' | 'covering' | 'revealing'
    setCurtainState: (state: 'idle' | 'covering' | 'revealing') => void
  }
  ```

- [ ] **Step 2: Implement store setters**
  Replace the store creation logic with the full updated interface.
  ```typescript
  import { create } from 'zustand'

  export const useNavigationStore = create<NavigationStore>((set) => ({
    originTileId: null,
    setOriginTileId: (id) => set({ originTileId: id }),
    originRect: null,
    setOriginRect: (rect) => set({ originRect: rect }),
    bentoTilesBounds: null,
    setBentoTilesBounds: (bounds) => set({ bentoTilesBounds: bounds }),
    curtainState: 'idle',
    setCurtainState: (state) => set({ curtainState: state }),
  }))
  ```

- [ ] **Step 3: Run typescript check to verify compilation**
  Run: `npx tsc --noEmit`
  Expected: PASS with zero type errors.

- [ ] **Step 4: Commit**
  ```bash
  git add store/useNavigationStore.ts
  git commit -m "feat: add originTileId and bentoTilesBounds to navigation store"
  ```

---

### Task 2: Bento Grid Tile capture & Card Dissolves

**Files:**
- Modify: [usePageTransition.ts](file:///C:/Projects/Portfolio/hooks/usePageTransition.ts)
- Modify: [BentoTile.tsx](file:///C:/Projects/Portfolio/components/bento/BentoTile.tsx)

- [ ] **Step 1: Update usePageTransition to capture all bento tile bounds**
  Modify `navigateWithTransition` in `hooks/usePageTransition.ts` to capture and set bounds for all visible tiles.
  ```typescript
  import { useRouter } from "next/navigation"
  import { useNavigationStore, type OriginRect } from "@/store/useNavigationStore"

  export const TRANSITION_DURATION = 500

  export function usePageTransition() {
    const router = useRouter()
    const { setCurtainState, setOriginRect, setOriginTileId, setBentoTilesBounds } = useNavigationStore()

    const navigateWithTransition = async (path: string, originEl?: Element | null) => {
      // 1. Capture origin element and its ID
      let clickedId: string | null = null
      if (originEl) {
        clickedId = originEl.getAttribute("data-id")
        setOriginTileId(clickedId)
        if (typeof originEl.getBoundingClientRect === "function") {
          const r = originEl.getBoundingClientRect()
          setOriginRect({
            left: r.left,
            top: r.top,
            width: r.width,
            height: r.height,
            right: r.right,
            bottom: r.bottom,
          })
        }
      } else {
        setOriginTileId(null)
        setOriginRect(null)
      }

      // 2. Capture bounds of all other bento tiles
      const boundsMap: Record<string, OriginRect> = {}
      document.querySelectorAll("[data-id]").forEach((el) => {
        const id = el.getAttribute("data-id")
        if (id && id !== clickedId) {
          const r = el.getBoundingClientRect()
          boundsMap[id] = {
            left: r.left,
            top: r.top,
            width: r.width,
            height: r.height,
            right: r.right,
            bottom: r.bottom,
          }
        }
      })
      setBentoTilesBounds(boundsMap)

      setCurtainState("covering")
      await new Promise((resolve) => setTimeout(resolve, TRANSITION_DURATION))
      router.push(path)
      await new Promise((resolve) => setTimeout(resolve, 100))
      setCurtainState("revealing")

      setTimeout(() => {
        setCurtainState("idle")
        setOriginRect(null)
        setOriginTileId(null)
        setBentoTilesBounds(null)
      }, TRANSITION_DURATION)
    }

    return { navigateWithTransition }
  }
  ```

- [ ] **Step 2: Update BentoTile to react to transition states (Card Dissolve)**
  Modify `BentoTile.tsx` to read transition status and fade out all tiles except the clicked one.
  ```typescript
  // In components/bento/BentoTile.tsx
  import { useNavigationStore } from "@/store/useNavigationStore"

  // Inside BentoTile component:
  const curtainState = useNavigationStore((state) => state.curtainState)
  const originTileId = useNavigationStore((state) => state.originTileId)
  
  const isDissolving = curtainState !== "idle" && originTileId !== null && originTileId !== id

  // In the wrapper motion.div's className:
  className={cn(
    spanClass,
    isMobileOverride && !forceFullHeight ? "h-auto" : "h-full",
    "perspective-[1500px]",
    isDragging ? "touch-none opacity-30" : "touch-pan-y",
    isDissolving && "opacity-0 scale-95 duration-500 pointer-events-none"
  )}
  ```

- [ ] **Step 3: Run typescript check to verify compilation**
  Run: `npx tsc --noEmit`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add hooks/usePageTransition.ts components/bento/BentoTile.tsx
  git commit -m "feat: implement bento tiles bounds capture and tile dissolve effect"
  ```

---

### Task 3: 2D Canvas Overlay Updates (Particle Dissolve)

**Files:**
- Modify: [PageEntryOverlay.tsx](file:///C:/Projects/Portfolio/components/layout/PageEntryOverlay.tsx)
- Modify: [page-entry.ts](file:///C:/Projects/Portfolio/components/layout/page-entry.ts)

- [ ] **Step 1: Modify PageEntryOverlay to retrieve bentoTilesBounds**
  Read bounds from navigation store and pass them to canvas initializer.
  ```typescript
  // In components/layout/PageEntryOverlay.tsx
  const bentoTilesBounds = useNavigationStore((s) => s.bentoTilesBounds)

  // In standard useEffect covering block:
  stateRef.current = initEntry(mode, w, h, originRect, bentoTilesBounds)
  ```

- [ ] **Step 2: Update page-entry.ts to spawn particles from non-clicked bento positions**
  Modify `initEntry` to accept the bounds map and generate dissolve particles.
  ```typescript
  // In components/layout/page-entry.ts
  export function initEntry(
    mode: EntryMode,
    w: number,
    h: number,
    originRect: OriginRect | null,
    bentoTilesBounds: Record<string, OriginRect> | null
  ): EntryState {
    const cores = (typeof navigator !== "undefined" && navigator.hardwareConcurrency) || 4
    const { x: ox, y: oy } = resolveOrigin(originRect, w, h)
    
    const particles: Particle[] = []

    // Spawns particles from clicked tile / origin
    const baseCount = cores < 4 ? 30 : 60
    for (let i = 0; i < baseCount; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.random() * 50
      const speed = 100 + Math.random() * 200
      particles.push({
        x: ox + Math.cos(a) * r,
        y: oy + Math.sin(a) * r,
        vx: Math.cos(a) * speed,
        vy: mode === "quick" ? Math.sin(a) * speed - 60 : Math.sin(a) * speed,
        life: 0.5 + Math.random() * 0.5,
        size: 1 + Math.random() * 2.5,
        hue: mode === "quick" ? "gold" : "blue",
      })
    }

    // Spawns dissolve particles from other bento cards
    if (mode === "deep" && bentoTilesBounds) {
      Object.values(bentoTilesBounds).forEach((bounds) => {
        const count = cores < 4 ? 5 : 10
        const cx = bounds.left + bounds.width / 2
        const cy = bounds.top + bounds.height / 2
        for (let i = 0; i < count; i++) {
          const a = Math.random() * Math.PI * 2
          const r = Math.random() * Math.min(bounds.width, bounds.height) * 0.4
          const speed = 60 + Math.random() * 120
          particles.push({
            x: cx + Math.cos(a) * r,
            y: cy + Math.sin(a) * r,
            vx: Math.cos(a) * speed * 0.5,
            vy: Math.sin(a) * speed * 0.5 - 40, // float upwards
            life: 0.4 + Math.random() * 0.4,
            size: 1 + Math.random() * 2,
            hue: "blue",
          })
        }
      })
    }

    // (Keep strokes, traces, and matrix logic unchanged)
  ```

- [ ] **Step 3: Run typescript check to verify compilation**
  Run: `npx tsc --noEmit`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add components/layout/PageEntryOverlay.tsx components/layout/page-entry.ts
  git commit -m "feat: animate dissolve particles from bento bounds in canvas overlay"
  ```

---

### Task 4: Quick Pitch (Mel’s Magic) — SVG Brush Mask

**Files:**
- Modify: [DetailShell.tsx](file:///C:/Projects/Portfolio/components/detail/DetailShell.tsx)

- [ ] **Step 1: Inject inline SVG brush mask definition**
  Add the SVG structure to the DOM of `DetailShell.tsx` and configure the CSS mask on the main page content wrapper.
  ```typescript
  // In components/detail/DetailShell.tsx
  // Add reference to navigation store to check curtainState
  import { useNavigationStore } from "@/store/useNavigationStore"

  // Inside DetailShell:
  const curtainState = useNavigationStore((s) => s.curtainState)
  const originRect = useNavigationStore((s) => s.originRect)

  // Use a React ref to reference the SVG mask path
  const maskPathRef = React.useRef<SVGPathElement | null>(null)

  // Add a layout effect to animate the SVG brush scale
  React.useLayoutEffect(() => {
    if (mode !== "quick" || !maskPathRef.current) return
    
    if (curtainState === "revealing") {
      gsap.fromTo(maskPathRef.current,
        { scale: 0, transformOrigin: "center" },
        { scale: 15, duration: 1.2, ease: "power3.inOut" }
      )
    }
  }, [curtainState, mode])
  ```

- [ ] **Step 2: Apply the mask styling on detailed main container**
  Update the main wrapper JSX layout:
  ```typescript
  return (
    <main 
      className="min-h-screen pt-24 pb-24 px-4 md:px-8 max-w-4xl mx-auto"
      style={
        mode === "quick" 
          ? { 
              maskImage: "url(#brush-mask-clip)", 
              WebkitMaskImage: "url(#brush-mask-clip)",
              maskSize: "100% 100%" 
            } 
          : undefined
      }
    >
      <ModeScrollFx />
      {/* Inline SVG definitions */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <mask id="brush-mask-clip" maskUnits="userSpaceOnUse">
            <rect width="100%" height="100%" fill="black" />
            <path
              ref={maskPathRef}
              d="M 500 500 C 350 450, 650 350, 500 500 C 400 600, 300 400, 500 500 Z"
              fill="white"
            />
          </mask>
        </defs>
      </svg>
      {/* ... rest of page content ... */}
  ```

- [ ] **Step 3: Run typescript check to verify compilation**
  Run: `npx tsc --noEmit`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add components/detail/DetailShell.tsx
  git commit -m "feat: implement SVG brush-stroke mask unmask reveal in Quick Pitch"
  ```

---

### Task 5: Quick Pitch — Typography Reveals

**Files:**
- Modify: [DetailShell.tsx](file:///C:/Projects/Portfolio/components/detail/DetailShell.tsx)
- Modify: [PageHero.tsx](file:///C:/Projects/Portfolio/components/detail/PageHero.tsx)

- [ ] **Step 1: Setup Gilded Headers double layer inside PageHero.tsx**
  Implement double-layered gold headings in `PageHero.tsx`.
  ```typescript
  // In components/detail/PageHero.tsx
  import { useViewModeStore } from "@/store/useViewModeStore"

  export function PageHero({ typeLabel, title, descriptor }: { typeLabel: string, title: string, descriptor: string }) {
    const mode = useViewModeStore((s) => s.mode)

    return (
      <div className="reveal-item mb-12">
        <span className="text-xs font-mono uppercase tracking-widest text-mode-accent">{typeLabel}</span>
        <div className="relative mt-2">
          {mode === "quick" ? (
            <>
              {/* Base grey layer */}
              <h1 className="text-4xl md:text-5xl font-display text-white/30 tracking-tight">{title}</h1>
              {/* Golden gilded layer */}
              <h1 className="gild-text absolute inset-0 text-4xl md:text-5xl font-display bg-gradient-to-r from-lume-warm via-mode-accent-bright to-lume-warm bg-clip-text text-transparent tracking-tight">
                {title}
              </h1>
            </>
          ) : (
            <h1 className="text-4xl md:text-5xl font-display text-white tracking-tight">{title}</h1>
          )}
        </div>
        <p className="mt-4 text-sm text-text-secondary max-w-xl leading-relaxed">{descriptor}</p>
      </div>
    )
  }
  ```

- [ ] **Step 2: Update typography reveal animation inside DetailShell.tsx**
  Ensure the gilded titles unmask left-to-right via `clipPath` and main items fade in via blur-to-focus.
  ```typescript
  // In components/detail/DetailShell.tsx GSAP callback:
  if (mode === "quick") {
    // Blur to focus reveal
    gsap.fromTo(".reveal-item",
      { opacity: 0, filter: "blur(12px)", y: 16 },
      { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.9, stagger: 0.12, ease: "expo.out" }
    )
    // Gilded text sweep
    gsap.fromTo(".gild-text",
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0% 0 0)", duration: 1.2, delay: 0.25, ease: "power3.out" }
    )
  }
  ```

- [ ] **Step 3: Run typescript check to verify compilation**
  Run: `npx tsc --noEmit`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add components/detail/DetailShell.tsx components/detail/PageHero.tsx
  git commit -m "feat: add blur-to-focus typography reveal and gilded gold leaf headers"
  ```

---

### Task 6: Quick Pitch — Scroll Transitions

**Files:**
- Modify: [ModeScrollFx.tsx](file:///C:/Projects/Portfolio/components/detail/ModeScrollFx.tsx)

- [ ] **Step 1: Check slow parallax geometric rings rotation speed**
  Ensure rings rotation is linked exactly to scroll trigger and scrubs at `0.05x`.
  ```typescript
  // In components/detail/ModeScrollFx.tsx mountGoldFx:
  gsap.to(rot, {
    v: 360,
    ease: "none",
    scrollTrigger: {
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    },
    onUpdate: () => {
      ringsEl.style.transform = `translate(-50%, -50%) rotate(${rot.v * 0.05}deg)`
    },
  })
  ```

- [ ] **Step 2: Verify unmask reveal animation with golden leading edge**
  Make sure images unmask horizontally, guided by a 2px bright gold leading edge.
  ```typescript
  // In mountGoldFx inside components/detail/ModeScrollFx.tsx:
  gsap.utils.toArray<HTMLElement>(".unmask-media").forEach((el) => {
    const edge = el.querySelector<HTMLElement>(".unmask-edge")
    gsap.fromTo(el,
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 85%", end: "center 60%", scrub: true },
      }
    )
    if (edge) {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 85%", end: "center 60%", scrub: true },
      })
      tl.fromTo(edge, { left: "0%" }, { left: "100%", ease: "none" })
        .to(edge, { opacity: 0, duration: 0.05 })
    }
  })
  ```

- [ ] **Step 3: Run typescript check to verify compilation**
  Run: `npx tsc --noEmit`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add components/detail/ModeScrollFx.tsx
  git commit -m "feat: configure slow geometric rotation and gilded scroll image reveal"
  ```

---

### Task 7: Deep Dive (Hextech Tech) — Blueprint Grid & Snapping

**Files:**
- Modify: [ModeScrollFx.tsx](file:///C:/Projects/Portfolio/components/detail/ModeScrollFx.tsx)
- Modify: [globals.css](file:///C:/Projects/Portfolio/app/globals.css)

- [ ] **Step 1: Implement grid warp rotation shift**
  Coordinate grid warp depth using GSAP ScrollTrigger.
  ```typescript
  // In components/detail/ModeScrollFx.tsx mountBlueFx:
  if (gridInner) {
    gsap.fromTo(gridInner,
      { transform: "rotateX(60deg) translateZ(0px)" },
      {
        transform: "rotateX(75deg) translateZ(-80px)",
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      }
    )
  }
  ```

- [ ] **Step 2: Configure scroll snap and lock-in flashes**
  Update custom scroll snap styling and border flash details.
  ```typescript
  // In mountBlueFx inside components/detail/ModeScrollFx.tsx:
  document.documentElement.style.scrollSnapType = "y proximity"
  sections.forEach((s) => {
    s.style.scrollSnapAlign = "start"
    s.style.scrollMarginTop = "5rem"
  })

  // Flash border logic with shadow blur and bright cyan glow
  function flashBorder(el: HTMLElement) {
    gsap.fromTo(el,
      { boxShadow: "0 0 0 1px rgba(106,255,255,0.0)" },
      {
        boxShadow: "0 0 30px rgba(106,255,255,0.65), inset 0 0 15px rgba(106,255,255,0.3)",
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      }
    )
  }
  ```

- [ ] **Step 3: Run typescript check to verify compilation**
  Run: `npx tsc --noEmit`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add components/detail/ModeScrollFx.tsx
  git commit -m "feat: implement 3D grid warping perspective and snapping border flash"
  ```

---

### Task 8: Deep Dive — Chromatic Aberration SVG Filter

**Files:**
- Modify: [DetailShell.tsx](file:///C:/Projects/Portfolio/components/detail/DetailShell.tsx)
- Modify: [ModeScrollFx.tsx](file:///C:/Projects/Portfolio/components/detail/ModeScrollFx.tsx)

- [ ] **Step 1: Inject SVG Chromatic Aberration filter in DetailShell.tsx**
  Add the SVG filter definition at the bottom of the JSX tree.
  ```typescript
  // In components/detail/DetailShell.tsx (inside return statement):
  {mode === "deep" && (
    <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
      <defs>
        <filter id="hextech-aberration">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cyan"/>
          <feOffset id="matrix-red-offset" dx="0" dy="0" in="red" result="red-offset"/>
          <feOffset id="matrix-cyan-offset" dx="0" dy="0" in="cyan" result="cyan-offset"/>
          <feBlend mode="screen" in="red-offset" in2="cyan-offset"/>
        </filter>
      </defs>
    </svg>
  )}
  ```

- [ ] **Step 2: Implement dynamic filter displacement via scroll velocity in ModeScrollFx.tsx**
  Track scroll velocity and offset the SVG displacement values on elements marked `.deep-media`.
  ```typescript
  // In mountBlueFx inside components/detail/ModeScrollFx.tsx:
  const redOffsetEl = document.getElementById("matrix-red-offset")
  const cyanOffsetEl = document.getElementById("matrix-cyan-offset")
  const aberrationMedia = gsap.utils.toArray<HTMLElement>(".deep-media")

  let velocity = 0
  let decayRegistered = false

  const applyAberration = () => {
    const amt = Math.min(velocity * 0.02, 3.5) // Split offset (cap at 3.5px)
    if (redOffsetEl && cyanOffsetEl) {
      redOffsetEl.setAttribute("dx", `${amt}`)
      cyanOffsetEl.setAttribute("dx", `${-amt}`)
    }
    
    // Apply SVG filter to media elements when scrolling
    aberrationMedia.forEach((el) => {
      if (amt > 0.1) {
        el.style.filter = "url(#hextech-aberration)"
      } else {
        el.style.filter = "none"
      }
    })
  }

  const decay = () => {
    velocity *= 0.88
    if (velocity < 0.2) {
      velocity = 0
      if (redOffsetEl && cyanOffsetEl) {
        redOffsetEl.setAttribute("dx", "0")
        cyanOffsetEl.setAttribute("dx", "0")
      }
      aberrationMedia.forEach((el) => (el.style.filter = "none"))
      if (decayRegistered) {
        gsap.ticker.remove(decay)
        decayRegistered = false
      }
      return
    }
    applyAberration()
  }

  if (animate) {
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        velocity = Math.abs(self.getVelocity())
        applyAberration()
        if (!decayRegistered) {
          gsap.ticker.add(decay)
          decayRegistered = true
        }
      },
    })
  }
  ```

- [ ] **Step 3: Run typescript check to verify compilation**
  Run: `npx tsc --noEmit`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add components/detail/DetailShell.tsx components/detail/ModeScrollFx.tsx
  git commit -m "feat: add chromatic aberration SVG displacement filter driven by scroll velocity"
  ```

---

### Task 9: Core Stabilization (Mode Switch)

**Files:**
- Modify: [PolyhedronCanvas.tsx](file:///C:/Projects/Portfolio/components/bento/tiles/PolyhedronCanvas.tsx)

- [ ] **Step 1: Subscribe PolyhedronCanvas to mode transition states**
  Listen to transition phases and coordinate the Three.js mesh animations.
  ```typescript
  // In components/bento/tiles/PolyhedronCanvas.tsx:
  import { useModeTransitionStore } from "@/store/useModeTransitionStore"

  // Inside PolyhedronCanvas component:
  const transitionPhase = useModeTransitionStore((s) => s.phase)
  const transitionDirection = useModeTransitionStore((s) => s.direction)

  useEffect(() => {
    if (transitionPhase === "covering" && transitionDirection === "gold-to-blue") {
      executeCommand("shatter")
    } else if (transitionPhase === "peak" && transitionDirection === "gold-to-blue") {
      executeCommand("pulse")
    } else if (transitionPhase === "covering" && transitionDirection === "blue-to-gold") {
      executeCommand("reset") // release blue charge and lightning
    }
  }, [transitionPhase, transitionDirection])
  ```

- [ ] **Step 2: Run typescript check to verify compilation**
  Run: `npx tsc --noEmit`
  Expected: PASS

- [ ] **Step 3: Commit**
  ```bash
  git add components/bento/tiles/PolyhedronCanvas.tsx
  git commit -m "feat: synchronize 3D HexCore model shatter/pulse triggers with mode transition phases"
  ```
