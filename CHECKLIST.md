# Lume-Glass Portfolio — Master Checklist

## Phase 1: Foundation (Functionality)
- [x] Initialize Next.js 16 (App Router), Tailwind, and ShadCN.
- [x] Setup Supabase client and schema (Tiles, Projects, Experience).
- [ ] Apply initial global CSS variables (from DESIGN.md).
- [x] Initialize Zustand stores (ViewMode, Navigation state).

## Phase 2: The Bento Engine (Functionality)
- [ ] Build `BentoGrid` layout system.
- [ ] Implement base `BentoTile` component wrapper.
- [ ] Build tile variants (`ProjectTile`, `ExperienceTile`, `StatTile`, etc.).
- [ ] Implement "Quick-Pitch" vs "Deep Dive" content toggle logic in tiles.
- [ ] Fetch and render dynamic tiles from Supabase.

## Phase 3: Detail Pages & Routing (Functionality)
- [ ] Build the shared Detail Page shell (`DetailShell`, `PageHero`, `BackLink`).
- [ ] Implement `/projects` listing and `/projects/[slug]` detail views.
- [ ] Implement `/experience`, `/awards`, `/skills`, `/education` routes.
- [ ] Implement basic Command Palette (⌘K) for navigation.

## Phase 4: Lume-Glass & Motion (Design)
- [ ] Implement full "Lume-Glass" CSS utility system (blur, borders, glows).
- [ ] Add GSAP `ScrollTrigger` for staggered reveals on detail pages.
- [ ] Add GSAP entry animations for Bento Grid tiles.
- [ ] Implement 3D Tilt perspective transform on tile hover.
- [ ] Implement Curtain Page Transition effect (shared-element logic).

## Phase 5: High-End Visuals (Design)
- [ ] Build React Three Fiber (R3F) Morphing Glass hero background.
- [ ] Build WebGL Generative background art layer.
- [ ] Enhance CLI/Terminal overlay with page-aware commands.
- [ ] Implement "sudo ignite" Easter Egg sequence and hidden tile.

## Final Review
- [ ] Cross-browser / responsive testing (Mobile adaptations).
- [ ] Performance audit (LCP, FID, CLS, JS bundle size).
- [ ] Accessibility review (Focus rings, ARIA labels, Contrast).