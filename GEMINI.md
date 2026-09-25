# Project Instructions: Lume-Glass Portfolio

This file contains the foundational mandates, architectural patterns, and development workflows for the Lume-Glass Portfolio project.

---

## 1. Core Architectural Mandates

### 1.1 Technology Stack
- **Framework**: Next.js 16 (App Router, Turbopack).
- **Styling**: Tailwind CSS 4.x+.
- **Database**: Supabase (PostgreSQL + JSONB for flexible tile content).
- **3D Engine**: React Three Fiber (R3F) + Drei.
- **Animation**: GSAP 3.12+ (ScrollTrigger, Flip).
- **State Management**: Zustand.

### 1.2 Custom Animations & CSS Masking
- **Tailwind CSS v4 Integration**: All custom animations and keyframes (e.g., `--animate-border-beam`, `border-beam-rotate`) must be defined inside the `@theme` block in `app/globals.css`. This ensures the compiler generates the proper utility classes and supports interactive modifier prefixes (such as `group-hover/cmd:`).
- **Cross-Browser CSS Masking**: For edge masks (like border beams), always specify standard CSS properties (`mask` and `mask-composite`) alongside browser-prefixed ones (`WebkitMask` and `WebkitMaskComposite`) with corresponding composite values (`exclude` / `xor`) to guarantee consistent rendering across Chrome, Safari, and Firefox.

### 1.3 Bento Grid System
- **Grid Layout**: 12-column dynamic CSS grid (`components/bento/BentoGrid.tsx`).
- **Tile Component**: `BentoTile.tsx` is the universal wrapper. It handles:
    - 3D Hover Tilt effect.
    - View Mode conditional rendering (Quick-Pitch vs Deep Dive).
    - Page transition triggers.
- **Sizes**: Use `getSizeClasses` in `lib/utils.ts`. Supported sizes include standard (1x1, 2x2) and specialized (4x5 Mega Tile).
- **Arcane Experience Spellbook**: The Experience tile expands in Deep Dive mode into an interactive 3D/2D arcane spellbook (`components/experience/ExperienceSpellbook.tsx`) with realistic leaf page turns, audio cues, and handcrafted career spells (`lib/content/experienceSpells.ts`).

### 1.4 View Mode Logic
- **Quick-Pitch**: High-level, optimized for speed and scanning.
- **Deep Dive**: Technical, data-rich, optimized for detail.
- **State**: Managed via `useViewModeStore` and synchronized with the `?mode` URL parameter.

---

## 2. Design & Visual Standards

### 2.1 The "Lume-Glass" Aesthetic
- **Surfaces**: Every card is a `GlassCard.tsx`. Use `backdrop-blur-md` and `bg-white/5`.
- **Glows**: Accent colors (`--lume-primary`, etc.) should be used sparingly as edge glows or hover triggers.
- **Spacing**: Maintain symmetric divider spacing (typically `mt-6 pt-6`) in tile footers.

### 2.2 3D Hero Artifact (HexCore)
- **Geometry**: 3x3 Rubik's Cube shell composed of 54 square pyramids (`components/bento/tiles/PolyhedronCanvas.tsx`).
- **Visual FX**: Includes dynamic electric arc shader geometry (`LightningArcs.tsx`) and GPU point cloud streams (`RunicDustStreams.tsx`).
- **Animation**: Do not add new mouse/scroll listeners to the core without explicit request. Maintain the synchronized Rubik burst rotation sequence.

---

## 3. Development Workflows

### 3.1 Content Management
- **Primary Source**: All tile content is fetched from the `tiles` table in Supabase.
- **JSONB Usage**: The `content` and `deep_dive` columns store flexible payloads. Always cast `unknown` values to their expected types (e.g., `as string`) before rendering to satisfy TypeScript.
- **Sync**: Keep `lib/supabase/seed.sql` updated with the latest production-grade content.

### 3.2 Admin Portal
- **Dashboard**: Use the `/admin` dashboard for system health monitoring.
- **Security**: All admin routes are protected by Supabase Auth middleware.

### 3.3 Git Hygiene & Session Scoping
- **Documentation Isolation**: Never stage or commit generated documentation, specs, plans, or scratch logs (`docs/`, `.superpowers/`) to Git.
- **Selective Staging**: Never run blanket staging commands (`git add .`, `git add -A`, `git commit -a`, `git commit -am`). Always explicitly stage specific files modified in the active session (`git add <file1> <file2>`).
- **Session-Scoped Pushes**: When pushing (`git push`), verify that outgoing commits strictly only contain files modified during the active session. Pre-existing uncommitted files or unrelated modifications must remain untouched.

---

## 4. Documentation
- **DESIGN.md**: Visual and component specifications.
- **CHECKLIST.md**: Project roadmap and feature status.
- **MEMORY.md**: (Private) Local setup and environment-specific notes.

---
*Follow these rules strictly to maintain the cinematic integrity and technical rigor of the Lume-Glass ecosystem.*