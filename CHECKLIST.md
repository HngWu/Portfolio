# Lume-Glass Portfolio — Master Checklist

## Phase 1: Foundation (Functionality)
- [x] Initialize Next.js 16 (App Router), Tailwind, and ShadCN.
- [x] Setup Supabase client and schema (Tiles, Projects, Experience).
- [x] Apply initial global CSS variables (from DESIGN.md).
- [x] Initialize Zustand stores (ViewMode, Navigation state).

## Phase 2: The Bento Engine (Functionality)
- [x] Build `BentoGrid` layout system.
- [x] Implement base `BentoTile` component wrapper.
- [x] Build tile variants (`ProjectTile`, `ExperienceTile`, `StatTile`, etc.).
- [x] Implement "Quick-Pitch" vs "Deep Dive" content toggle logic in tiles.
- [ ] Fetch and render dynamic tiles from Supabase.

## Phase 3: Detail Pages & Routing (Functionality)
- [x] Build the shared Detail Page shell (`DetailShell`, `PageHero`, `BackLink`).
- [x] Implement `/projects` listing and `/projects/[slug]` detail views.
- [x] Implement `/experience`, `/awards`, `/skills`, `/education` routes.
- [x] Implement basic Command Palette (⌘K) for navigation.

## Phase 4: Lume-Glass & Motion (Design)
- [x] Implement full "Lume-Glass" CSS utility system (blur, borders, glows).
- [x] Add GSAP `ScrollTrigger` for staggered reveals on detail pages.
- [x] Add GSAP entry animations for Bento Grid tiles.
- [x] Implement 3D Tilt perspective transform on tile hover.
- [x] Implement Curtain Page Transition effect (shared-element logic).

## Phase 5: High-End Visuals (Design)
- [x] Build React Three Fiber (R3F) Morphing Glass hero background.
- [x] Build WebGL Generative background art layer.
- [ ] Enhance CLI/Terminal overlay with page-aware commands.
- [ ] Implement "sudo ignite" Easter Egg sequence and hidden tile.

## Final Review
- [ ] Cross-browser / responsive testing (Mobile adaptations).
- [ ] Performance audit (LCP, FID, CLS, JS bundle size).
- [ ] Accessibility review (Focus rings, ARIA labels, Contrast).