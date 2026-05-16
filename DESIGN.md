# Portfolio — Design System & Specification
> **Lume-Glass** · Dark Minimalist · Cinematic UX · Modular Architecture

---

## 0. Design Philosophy

| Principle | Expression |
|---|---|
| **Lume-Glass** | Every surface is a dark pane of glass — layered translucency, light bleeds through at edges |
| **Negative Space as Signal** | Emptiness is intentional, not lazy — breathing room frames content |
| **Motion with Purpose** | Nothing moves without reason; every animation communicates state or hierarchy |
| **Depth over Flatness** | Z-axis is a design tool — parallax, 3D transforms, and layered blur create dimensionality |
| **Cinematic Pacing** | Reveals are choreographed, not instant; the viewport is a stage |

---

## 1. Color System

### Base Palette (CSS Variables)

```css
:root {
  /* === BACKGROUNDS === */
  --bg-void:        #080808;   /* true near-black base canvas */
  --bg-surface:     #0f0f0f;   /* primary surface */
  --bg-elevated:    #141414;   /* cards, modals */
  --bg-overlay:     #1a1a1a;   /* hover states, tooltips */

  /* === GLASS LAYERS === */
  --glass-1:        rgba(255, 255, 255, 0.03);  /* subtle surface shimmer */
  --glass-2:        rgba(255, 255, 255, 0.06);  /* card faces */
  --glass-3:        rgba(255, 255, 255, 0.09);  /* active/focused elements */
  --glass-border:   rgba(255, 255, 255, 0.08);  /* default border */
  --glass-border-active: rgba(255, 255, 255, 0.18); /* hover/focus border */

  /* === LUME GLOW (accent) === */
  --lume-primary:   #4AFFB4;   /* electric mint — primary accent */
  --lume-secondary: #4A8FFF;   /* cool blue — secondary accent */
  --lume-tertiary:  #FF4A8F;   /* hot pink — easter egg / alerts */
  --lume-warm:      #FFB44A;   /* amber — awards / highlights */

  /* === LUME GLOW SPREADS === */
  --lume-glow-sm:   0 0 12px rgba(74, 255, 180, 0.15);
  --lume-glow-md:   0 0 32px rgba(74, 255, 180, 0.20);
  --lume-glow-lg:   0 0 64px rgba(74, 255, 180, 0.12);
  --lume-glow-xl:   0 0 120px rgba(74, 255, 180, 0.08);

  /* === TYPOGRAPHY === */
  --text-primary:   rgba(255, 255, 255, 0.92);
  --text-secondary: rgba(255, 255, 255, 0.55);
  --text-muted:     rgba(255, 255, 255, 0.28);
  --text-accent:    #4AFFB4;

  /* === FUNCTIONAL === */
  --success:        #4AFFB4;
  --warning:        #FFB44A;
  --error:          #FF4A6B;
  --info:           #4A8FFF;
}
```

### Semantic Color Usage

| Token | Used For |
|---|---|
| `--lume-primary` | CTAs, active nav, focus rings, CLI cursor |
| `--lume-secondary` | Links, code blocks, skill tags |
| `--lume-tertiary` | Easter egg reveal, error states |
| `--lume-warm` | Awards section, certifications, "Quick-Pitch" mode badge |
| `--glass-border` | All card/tile outlines at rest |
| `--glass-border-active` | Hover, focus, selected states |

---

## 2. Typography

### Font Stack

```css
/* Display — used for headings, section titles, hero text */
--font-display: 'Editorial New', 'Playfair Display', Georgia, serif;

/* Mono — used for CLI, code, labels, "Deep Dive" technical content */
--font-mono: 'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;

/* UI — used for body, descriptions, navigation */
--font-ui: 'Geist', 'DM Sans', 'Sora', sans-serif;
```

> **Preferred loading order**: Geist Mono + Geist (via `next/font/google` or Vercel CDN), fallback to system mono/sans. For display headings, consider self-hosting Editorial New for the editorial-luxury contrast.

### Type Scale

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `display-xl` | `clamp(3rem, 8vw, 7rem)` | 300 | 0.95 | -0.04em | Hero headline |
| `display-lg` | `clamp(2rem, 5vw, 4rem)` | 400 | 1.0 | -0.03em | Section titles |
| `display-md` | `clamp(1.5rem, 3vw, 2.5rem)` | 400 | 1.1 | -0.02em | Card headlines |
| `heading` | `1.125rem` | 500 | 1.3 | -0.01em | Sub-headings |
| `body` | `0.9375rem` | 400 | 1.65 | 0em | Body text |
| `body-sm` | `0.8125rem` | 400 | 1.6 | 0.01em | Captions, metadata |
| `label` | `0.6875rem` | 600 | 1.2 | 0.12em | Tags, badges (UPPERCASE) |
| `mono` | `0.875rem` | 400 | 1.7 | 0.02em | CLI, code, technical |
| `mono-sm` | `0.75rem` | 400 | 1.6 | 0.02em | Inline code |

### Typography Rules

- **Display headings**: Thin/light weight + extra-tight tracking creates editorial luxury
- **Never bold body text** — use color contrast (`--text-primary` vs `--text-secondary`) for hierarchy instead
- **Mono for all numbers** — metrics, years, percentages use `--font-mono` for visual consistency
- **Uppercase labels**: `0.07em` to `0.14em` letter-spacing, always `--text-secondary` or accent color

---

## 3. Spacing & Layout

### Spacing Scale (8px base grid)

```
4px   → xs   (inline gaps, icon padding)
8px   → sm   (tag padding, input padding)
12px  → md   (compact card padding)
16px  → lg   (standard component padding)
24px  → xl   (section inner padding)
32px  → 2xl  (card padding, bento cell padding)
48px  → 3xl  (section gaps)
64px  → 4xl  (major section margins)
96px  → 5xl  (hero spacing)
128px → 6xl  (between page sections)
```

### Layout Containers

```css
/* Page max-width */
--container-max:   1440px;
--container-tight: 1024px;   /* for readable text sections */
--container-wide:  1600px;   /* for full-bleed grids */

/* Gutters */
--gutter-mobile:  1rem;
--gutter-tablet:  2rem;
--gutter-desktop: 3rem;
--gutter-wide:    4rem;
```

### Bento Grid Layout

The Bento grid is the centrepiece of the portfolio. It operates on a **12-column, auto-row** CSS Grid.

> **Navigation Model**: Every clickable tile navigates to a dedicated Detail Page for its type. Tiles that share a type (e.g., multiple `award` tiles) all route to the same listing page (`/awards`), which shows all entries of that type in full detail. Stat tiles and the hero tile are non-navigable (display-only). Contact tiles open an anchor/external link rather than an internal page.

```
DESKTOP (≥1280px)  — 12 cols, 1fr each, gap: 16px
TABLET  (≥768px)   — 6 cols,  1fr each, gap: 12px
MOBILE  (<768px)   — 2 cols,  1fr each, gap: 8px
```

**Tile Size Classes** (column-span × row-span):

| Size Key | Cols | Rows | Typical Use |
|---|---|---|---|
| `1x1` | 1 | 1 | Skill badge, stat |
| `2x1` | 2 | 1 | Certification, short info |
| `2x2` | 2 | 2 | Contact card, social links |
| `3x2` | 3 | 2 | Experience summary |
| `4x2` | 4 | 2 | Project card (standard) |
| `4x3` | 4 | 3 | Project card (featured) |
| `6x2` | 6 | 2 | Hero / intro banner |
| `6x4` | 6 | 4 | 3D morphing glass |
| `3x3` | 3 | 3 | Award showcase |
| `2x4` | 2 | 4 | Skills column |

---

## 4. Glass & Surface Styles

### Glass Card (Base)

```css
.glass-card {
  background: var(--glass-2);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.06),   /* top highlight */
    0 1px 3px rgba(0,0,0,0.5),              /* base shadow */
    0 8px 32px rgba(0,0,0,0.3);             /* depth shadow */
  transition: border-color 300ms ease, box-shadow 300ms ease, transform 300ms ease;
}

.glass-card:hover {
  border-color: var(--glass-border-active);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.10),
    0 1px 3px rgba(0,0,0,0.5),
    0 16px 64px rgba(0,0,0,0.4),
    var(--lume-glow-md);
}
```

### Lume Glow Variants

```css
/* Applied on hover or active state, per card type */
.lume-mint   { --lume-color: rgba(74, 255, 180, 0.15); }
.lume-blue   { --lume-color: rgba(74, 143, 255, 0.15); }
.lume-pink   { --lume-color: rgba(255, 74, 143, 0.15); }
.lume-amber  { --lume-color: rgba(255, 180, 74, 0.15); }

.lume-card:hover {
  box-shadow: 0 0 40px var(--lume-color), inset 0 0 20px var(--lume-color);
}
```

### Border Utilities (Tailwind Extension)

```js
// tailwind.config.ts additions
borderColor: {
  'glass':        'rgba(255, 255, 255, 0.08)',
  'glass-active': 'rgba(255, 255, 255, 0.18)',
  'lume':         'rgba(74, 255, 180, 0.40)',
  'lume-dim':     'rgba(74, 255, 180, 0.15)',
}
```

### Blur Scale (Tailwind Extension)

```js
backdropBlur: {
  'xs':  '4px',
  'sm':  '8px',
  'md':  '16px',    // standard glass card
  'lg':  '24px',    // modal, command palette
  'xl':  '40px',    // nav bar
  '2xl': '64px',    // hero overlay
}
```

---

## 5. Component Specifications

### 5.1 Navigation Bar

```
Layout:     Sticky top, full-width, z-index: 100
Background: backdrop-blur-xl + bg-void/60
Border:     Bottom 1px solid --glass-border
Height:     56px (mobile) / 64px (desktop)

Left:       Logo mark (animated SVG, single character or abstract mark)
Center:     Navigation links — hidden on mobile, revealed on ≥768px
Right:      [Mode Toggle] [Search ⌘K] [Menu (mobile)]
```

**Mode Toggle (Quick-Pitch / Deep Dive)**:
- Pill-shaped toggle, 80px wide
- Quick-Pitch: amber tint, bolt icon
- Deep Dive: blue tint, code icon
- Smooth slide animation between states (250ms ease)
- Stored in Zustand + URL param: `?mode=quick` or `?mode=deep`

### 5.2 Hero Section

```
Height:     100svh (safe viewport)
Layout:     Centered vertically, left-aligned text on desktop

Background: R3F Canvas (full bleed) — 3D morphing glass object
Overlay:    Generative art layer (responds to mouse) — canvas z-index: 1
Content:    z-index: 10, relative

Elements:
  - Role label (UPPERCASE mono, --lume-primary, animated in)
  - Name placeholder / identity mark
  - Single-line descriptor (max 60 chars)
  - Two CTAs: [View Projects ↓] [⌘K Open CLI]
  - Scroll indicator (animated arrow, fades after first scroll)
```

**Hero Text Animation Sequence** (GSAP timeline, 200ms delays):
1. Role label slides up from y:20, fade in
2. Main headline character-by-character reveal (stagger 0.03s)
3. Descriptor slides up, fade in
4. CTAs scale up from 0.9, fade in
5. Scroll indicator pulses in

### 5.3 Bento Grid Tiles

Each tile type has a specific visual treatment:

**Project Tile** (`type: "project"`)
```
Background: --glass-2 base
Header:     Project name (heading), 1-line descriptor
Tags:       Tech stack badges (label style, --lume-secondary tint)
Footer:     GitHub link icon + year
Hover:      3D tilt (rotateX/Y ±8°), parallax inner content shift
            Lume glow border (--lume-secondary) appears
            "View Project →" ghost label slides up from bottom-left
Click:      Navigate to /projects (listing) or /projects/[slug] (detail)
            Exit animation: tile scales up + fades, page transitions in
Cursor:     pointer, custom cursor dot swaps to arrow-right glyph on hover
```

**Experience Tile** (`type: "experience"`)
```
Background: --glass-2
Layout:     Company logo (or initials monogram) top-right
            Role title (heading), company + date (mono-sm, --text-muted)
            Bullet list (max 2 in Quick-Pitch, full in Deep Dive)
Accent:     Left border 2px --lume-primary
Hover:      Lume glow border (--lume-primary), left border brightens
            "View Full Experience →" label fades in at bottom
Click:      Navigate to /experience
Cursor:     pointer
```

**Award Tile** (`type: "award"`)
```
Background: Linear gradient from --glass-2 to amber-tinted glass
            (rgba(255, 180, 74, 0.04))
Icon:       Trophy / medal SVG, --lume-warm colored
Animation:  Shimmer sweep on hover (pseudo-element, 1.2s ease)
Hover:      Lume glow border (--lume-warm), shimmer sweep
            "View All Awards →" label fades in
Click:      Navigate to /awards
Cursor:     pointer
```

**Skill Tile** (`type: "skill"`)
```
Layout:     Icon grid or tag cloud
Background: --glass-1 (most subtle)
Hover:      Individual skill tags light up with --lume-secondary glow
            "View All Skills →" label fades in at bottom
Click:      Navigate to /skills
Cursor:     pointer
```

**Education Tile** (`type: "education"`)
```
Background: --glass-2
Layout:     Institution name (heading), diploma + grade (mono)
            Dates (mono-sm, --text-muted)
Hover:      Lume glow border (--lume-secondary)
            "View Education →" label fades in
Click:      Navigate to /education
Cursor:     pointer
```

**Contact Tile** (`type: "contact"`)
```
Background: --glass-3 (slightly brighter)
Layout:     Large email address, LinkedIn/GitHub icon buttons
CTA button: "Get in Touch" — mint gradient border, hover fills
Click:      Icon buttons open external links (LinkedIn, GitHub)
            Email opens mailto: link
            NOT a navigable detail page — external anchors only
Cursor:     pointer (per icon button)
```

**Stats/Metric Tile** (`type: "stat"`)
```
Number:     display-lg, --font-mono, --lume-primary
Label:      label uppercase, --text-muted
Animation:  Count-up on scroll entry (GSAP)
Click:      Non-navigable — display only
Cursor:     default
```

### 5.4 Command Palette (⌘K)

```
Trigger:    ⌘K or Ctrl+K (global keyboard listener)
Position:   Fixed center, z-index: 9999
Size:       640px wide (mobile: 92vw), max-height: 480px
Background: --bg-elevated + backdrop-blur-lg
Border:     1px solid --glass-border-active
Border-radius: 16px
Shadow:     0 32px 96px rgba(0,0,0,0.6)

Structure:
  ┌─────────────────────────────────────────────┐
  │ 🔍  Search or type a command...    [Esc]    │
  ├─────────────────────────────────────────────┤
  │  Navigation                                 │
  │  → Home           ↩                         │
  │  → Projects       ↩                         │
  │  → Experience     ↩                         │
  │                                             │
  │  Theme                                      │
  │  → Toggle Lume Primary Color                │
  │  → Toggle View Mode                         │
  │                                             │
  │  Search Results (RAG)                       │
  │  → "TriviaDuel uses Next.js and..."         │
  └─────────────────────────────────────────────┘

Keyboard:   ↑↓ navigate, ↩ select, Esc close
Animation:  Scale from 0.94 + opacity 0 to 1, 180ms spring
            Backdrop scrim fades in at 0.4 opacity
```

### 5.5 Terminal / CLI Overlay

```
Trigger:    Type 'terminal' in command palette, or dedicated CLI button
Position:   Fixed bottom-right, draggable
Size:       Default 600×360px, resizable
Background: --bg-void + slight glass border
Font:       --font-mono, 0.8125rem

Prompt:     > portfolio ~ $  (with blinking cursor, --lume-primary)

Commands:
  ls projects         → lists all projects with emoji bullets
  cat project/<name>  → shows project details
  ls skills           → grouped skill list
  whoami              → prints role + bio
  open <url>          → opens GitHub/LinkedIn
  help                → lists all commands
  clear               → clears terminal
  sudo ignite         → 🔒 EASTER EGG TRIGGER
```

### 5.6 Easter Egg — "sudo ignite"

```
Trigger:    Global keyboard listener detects "sudo ignite" (any context)
            Also works in terminal overlay

Sequence:
  1. Screen flash (white, 40ms, opacity 0.15)
  2. All Bento tiles briefly ripple outward (GSAP stagger, 40ms each)
  3. Hidden tile slides into grid with spring physics
  4. Hidden tile content: personal easter egg message + glitch animation
  5. Terminal prompt shows: "🔥 Root access granted. Welcome to the real grid."

Hidden Tile Style:
  - Animated glitch border (RGB split effect)
  - Background: dark with scanline overlay
  - Lume tertiary (--lume-pink) glow
  - Contents: fun personal message, hidden project, or secret animation
```

---

## 6. Motion & Animation

### 6.1 Animation Tokens

```css
/* Durations */
--dur-instant:  80ms;
--dur-fast:     150ms;
--dur-normal:   250ms;
--dur-slow:     400ms;
--dur-xslow:    700ms;
--dur-cinematic: 1200ms;

/* Easings */
--ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);
--ease-out-spring: cubic-bezier(0.34, 1.56, 0.64, 1);  /* slight overshoot */
--ease-in-out:     cubic-bezier(0.4, 0, 0.2, 1);
--ease-glide:      cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### 6.2 Scroll-Triggered Animations (GSAP ScrollTrigger)

| Trigger | Element | Animation |
|---|---|---|
| Section enters viewport | Section title | Slide up 30px + fade, `--ease-out-expo` |
| Bento tile enters | Each tile | Scale from 0.96 + fade, stagger 80ms |
| Experience section | Left border | Grows in height from 0 to 100% |
| Stats tile | Numbers | Count-up from 0 |
| 3D Glass object | MeshPhysical | Morphs shape, changes roughness |
| Scroll speed | Background | Particle velocity responds to delta |

### 6.3 3D Tile Hover (Perspective Transform)

```js
// Applied to every Bento tile on mousemove
const tilt = {
  maxRotate: 8,         // degrees
  maxShift: 12,         // px inner content shift (parallax)
  perspective: '800px',
  transitionOut: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  layers: [
    { depth: 0,  element: '.tile-bg' },        // base, no shift
    { depth: 6,  element: '.tile-content' },   // content shifts slightly
    { depth: 14, element: '.tile-icon' },      // icons shift most
    { depth: 20, element: '.tile-label' },     // top labels float
  ]
}
```

### 6.4 Generative Background

```
Type:           WebGL shader (GLSL) or Canvas 2D fallback
Effect:         Flowing field lines / noise topology
Mouse response: Field lines orbit/warp near cursor position
Scroll response:  Speed delta increases turbulence temporarily
Colors:         Monochromatic, very low opacity (0.04–0.08 on --lume-primary)
Performance:    requestAnimationFrame, throttled on mobile (30fps cap)
               Disabled if prefers-reduced-motion
```

### 6.5 R3F 3D Morphing Glass (Hero Background)

```
Object:         Blob/Torus geometry or custom GLSL morph
Material:       MeshPhysicalMaterial
  transmission:   0.95
  roughness:      0.0–0.15 (varies with scroll)
  thickness:      1.5
  ior:            1.5
  envMapIntensity: 2.0
  color:          #0a0a0a (very dark, nearly black glass)

Animation:
  - Idle: slow rotation, subtle morph (sin-wave vertex displacement)
  - ScrollTrigger 0–30%:   scale up, roughness decreases
  - ScrollTrigger 30–60%:  morphs to different geometry
  - ScrollTrigger 60–100%: fades out, translates offscreen

Lighting:
  - AmbientLight: 0.2 intensity
  - PointLight 1: --lume-primary tint, moves with time
  - PointLight 2: --lume-secondary tint, counter-movement
```

---

## 7. View Mode System (Quick-Pitch / Deep Dive)

### State

```ts
// Zustand store, synced with URL: ?mode=quick | ?mode=deep
interface ViewModeStore {
  mode: 'quick' | 'deep'
  setMode: (mode: 'quick' | 'deep') => void
}
```

### Content Visibility Matrix

| Content Type | Quick-Pitch | Deep Dive |
|---|---|---|
| Project headline | ✅ | ✅ |
| Project tech tags | ✅ (max 3) | ✅ (all) |
| Project description | 1 line | Full paragraph |
| Architecture notes | ❌ | ✅ |
| Experience bullets | Max 2 | All bullets |
| Skill categories | Group labels only | Individual skills + proficiency |
| Cert details | Name only | Issuer + date + description |
| Education | Grade only | Full description |
| Stats | ✅ | ✅ + methodology notes |

### Mode Transition Animation

```
Transition: 300ms --ease-in-out
Expanding content: height 0 → auto (use GSAP height animation, not CSS)
Collapsing content: auto → 0, opacity fades first (150ms), then height collapses
Tile resize: grid cells animate size change over 400ms
```

---

## 8. Detail Pages — Routing & Page Specifications

Each navigable tile type maps to a dedicated detail page that lists all content of that type in full. These pages share the Lume-Glass design system and the same generative background, but use a **linear scroll layout** instead of the Bento grid.

### 8.1 Routing Map

| Tile Type | Route | Page Title | Navigable? |
|---|---|---|---|
| `project` | `/projects` | Projects | ✅ Listing page |
| `project` (individual) | `/projects/[slug]` | Project detail | ✅ From listing or direct link |
| `experience` | `/experience` | Experience | ✅ Listing page |
| `award` | `/awards` | Awards & Honours | ✅ Listing page |
| `skill` | `/skills` | Skills & Technologies | ✅ Listing page |
| `education` | `/education` | Education | ✅ Listing page |
| `contact` | — | — | ❌ External anchors only |
| `stat` | — | — | ❌ Display only |
| `hero` | — | — | ❌ Display only |
| `easter_egg` | — | — | ❌ In-grid reveal only |

> **Design Rule**: Listing pages always show ALL entries of their type, with both Quick-Pitch and Deep Dive views honoured. The URL param `?mode=quick|deep` persists across page transitions.

---

### 8.2 Shared Detail Page Shell

Every detail page wraps its content in this consistent shell:

```
┌──────────────────────────────────────────────────────┐
│  [Navbar — identical to home]                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ← Back to Home          [breadcrumb, top-left]      │
│                                                      │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░  [Page Hero]             │
│  TYPE LABEL (mono-sm, --lume-primary, uppercase)     │
│  Page Title (display-lg, editorial serif)            │
│  Short descriptor (body, --text-secondary)           │
│                                                      │
│  ─────────────────────────────────────────────────   │
│                                                      │
│  [Content Area — type-specific layout]               │
│                                                      │
│  ─────────────────────────────────────────────────   │
│  [Footer — back to home link + ⌘K prompt]            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Back Navigation**:
- Top-left `← Back` link always present, navigates to `/#` (home Bento grid)
- Browser back button also works — state (scroll position, mode) is restored via `sessionStorage`
- On mobile: back arrow is sticky at the top of the viewport

**Page Entry Animation** (GSAP, triggered on mount):
1. Background generative art fades in (400ms)
2. Breadcrumb slides in from left (200ms)
3. Type label fades up (250ms, delay 100ms)
4. Page title character-stagger reveal (delay 200ms, 0.025s per char)
5. Descriptor fades up (delay 400ms)
6. Divider line draws from left to right (500ms, delay 500ms)
7. Content cards stagger in from bottom (80ms each, delay 600ms start)

**Page Exit Animation** (on back navigate):
- Content fades and translates down (200ms)
- Transition to home: previous tile on the Bento grid briefly pulses with lume glow to "return" the user's eye

---

### 8.3 `/projects` — Projects Listing Page

```
URL:        /projects
Title:      "Projects"
Type label: "WORK"
Descriptor: "Things I've built — real-time, full-stack, and thoughtfully crafted."
```

**Layout**: Vertical stack of full-width project cards, each with consistent anatomy.

**Project Card Anatomy**:

```
┌─────────────────────────────────────────────────────────┐
│  [Featured badge — optional]          [Year · --mono]   │
│                                                         │
│  Project Name                         (display-md)      │
│  One-line description                 (body, --text-secondary) │
│                                                         │
│  ── Quick-Pitch content ──────────────────────────────  │
│  [Tag] [Tag] [Tag]  (tech stack, max 5 shown)           │
│  [GitHub ↗] [Live ↗]  (icon + label buttons)            │
│                                                         │
│  ── Deep Dive content (hidden in Quick-Pitch) ─────── ▼ │
│  Full description paragraph                             │
│  Key Features:                                          │
│    · Real-Time Multiplayer — description                │
│    · Resilient AI Generation — description              │
│    · ...                                                │
│  Tech Stack breakdown (grouped by category)             │
│  Architecture notes / diagrams (if available)           │
│                                                         │
│  [View Full Details →]  (navigates to /projects/[slug]) │
└─────────────────────────────────────────────────────────┘
```

**Card Visual Treatment**:
- Glass card base (`--glass-2`, `border-radius: 20px`)
- Left accent bar: 2px, `--lume-secondary` colour, full card height
- Featured projects: slightly elevated (`--glass-3`), mint top-border instead of left-border
- Tech tags: `label` style, `--lume-secondary` tint background, pill-shaped
- Hover: card lifts (`translateY(-4px)`), lume-blue glow spreads

**Ordering**: Featured projects first (`featured: true`), then by `order` field in Supabase.

---

### 8.4 `/projects/[slug]` — Individual Project Detail Page

```
URL:        /projects/triviaduel | /projects/secureasset | ...
Title:      "[Project Name]"
Type label: "PROJECT"
```

**Layout**: Long-form, editorial scroll — designed to be read top-to-bottom.

```
┌─────────────────────────────────────────────────────────┐
│  ← Projects                                             │
│                                                         │
│  PROJECT                                                │
│  Project Name                         (display-xl)      │
│  Full description (1–2 sentences)                       │
│                                                         │
│  [GitHub ↗]  [Live Demo ↗]            (CTA buttons)     │
│                                                         │
│  ═══════════════════════════════════════════════════    │
│                                                         │
│  Tech Stack                           (heading)         │
│  [Tag] [Tag] [Tag] [Tag] [Tag] [Tag]                    │
│                                                         │
│  ───────────────────────────────────────────────────    │
│                                                         │
│  Key Features                         (heading)         │
│  Each feature as a titled row:                          │
│  ┌────────────────────────────────────────────────┐     │
│  │ ▸ Feature Title       Feature description body │     │
│  └────────────────────────────────────────────────┘     │
│                                                         │
│  ── Deep Dive only ──────────────────────────────────   │
│  Architecture Overview                (heading)         │
│  [Diagram or text schema]                               │
│  Infrastructure choices + rationale                     │
│                                                         │
│  ─────────────────────────────────────────────────      │
│  ← Previous Project      Next Project →                 │
└─────────────────────────────────────────────────────────┘
```

**Feature Row Cards**:
- Glass card (`--glass-1`), subtle inset
- Left icon: small circle glyph (▸), `--lume-primary`
- Title: `heading` weight, `--text-primary`
- Description: `body`, `--text-secondary`
- Scroll-triggered fade-in, staggered 60ms per row

**Back Link**: `← Projects` (not `← Home`) — always goes to `/projects` list, preserving context depth.

---

### 8.5 `/experience` — Experience Listing Page

```
URL:        /experience
Title:      "Experience"
Type label: "CAREER"
Descriptor: "How I've contributed in professional settings."
```

**Layout**: Vertical timeline with a connecting line on the left (desktop) or top (mobile).

```
Timeline visual:
  │
  ●── [Role Title]          (heading)
  │   [Company · Date]      (mono-sm, --text-muted)
  │   [Type badge: Internship / Full-time]
  │
  │   ── Quick-Pitch ───────────────────────────────────
  │   2 bullet-point highlights
  │
  │   ── Deep Dive (collapsed by default) ──────────────
  │   All bullet points, fully expanded
  │   Grouped by category if > 4 bullets
  │   [Skills Used] tag row
  │
  │   ─────────────────────────────────────────────────
  │
  ●── [Next Role]
```

**Timeline Line**:
- 1px solid, `--glass-border` colour at rest
- On scroll: line "draws" from top to bottom using GSAP `drawSVG` / clip-path
- Timeline dot (●): 10px circle, `--lume-primary` fill, subtle pulse animation

**Experience Card Visual**:
- No outer border — timeline structure replaces card container
- Company monogram / initials badge: 48×48px, `--glass-3`, `border-radius: 12px`
- Role type badge: `label` uppercase, coloured pill (`--lume-warm` for Internship, `--lume-secondary` for Full-time)
- Deep Dive expand: chevron toggle, GSAP height animation (not CSS transition)

**Ordering**: Most recent first (by start date descending).

---

### 8.6 `/awards` — Awards & Honours Listing Page

```
URL:        /awards
Title:      "Awards & Honours"
Type label: "RECOGNITION"
Descriptor: "Competitions, scholarships, and milestones."
```

**Layout**: Asymmetric masonry-style grid — two columns on desktop, single column on mobile. Each award is a glass card.

**Award Card Anatomy**:

```
┌────────────────────────────────────────┐
│  [Icon: Trophy / Medal / Star]         │
│  [--lume-warm, 32px]                   │
│                                        │
│  Award Name              (heading)     │
│  Issuer · Date           (mono-sm)     │
│                                        │
│  ── Quick-Pitch ─────────────────────  │
│  One-line context                      │
│                                        │
│  ── Deep Dive ───────────────────────  │
│  Full description                      │
│  Context / significance paragraph      │
└────────────────────────────────────────┘
```

**Card Visual Treatment**:
- Background: subtle amber gradient tint (`rgba(255, 180, 74, 0.04)`)
- Border: `--glass-border` at rest, `--lume-warm` at hover
- Shimmer sweep animation on hover (left→right, `pseudo-element`, 1.2s ease)
- Icon: SVG, `--lume-warm`, with slow rotation on hover (15°, spring easing)
- Entry animation: scale from 0.95 + fade, staggered 100ms per card

**Ordering**: Most recent first (by issued date).

---

### 8.7 `/skills` — Skills & Technologies Listing Page

```
URL:        /skills
Title:      "Skills & Technologies"
Type label: "CAPABILITIES"
Descriptor: "Languages, frameworks, tools, and methodologies."
```

**Layout**: Categorised sections, each as a full-width glass panel. Within each panel, skills are displayed as an interactive tag cloud.

**Section Structure**:

```
┌─────────────────────────────────────────────────────────┐
│  Languages                            (heading)         │
│                                                         │
│  [Java] [Python] [JavaScript] [TypeScript] [Kotlin]     │
│  [C#] [SQL] [HTML5] [CSS]                               │
│                                                         │
│  ── Deep Dive only ──────────────────────────────────── │
│  Brief proficiency note or context per language         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Frameworks & Libraries               (heading)         │
│  [Spring Boot] [React.js] [Next.js] [Node.js] ...       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Databases                            (heading)         │
│  [MariaDB] [MongoDB] [MSSQL] [MySQL]                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  DevOps & Tools                       (heading)         │
│  [Jenkins] [OpenShift] [Git] [Liquibase] ...            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Methodologies                        (heading)         │
│  [SDLC] [A/B Testing] [UX Design] [Full-Stack Dev]      │
└─────────────────────────────────────────────────────────┘
```

**Skill Tag Visual**:
- `label` typography, uppercase, pill-shaped
- Background: `--glass-1`, border: `--glass-border`
- Hover: background shifts to `rgba(74, 143, 255, 0.12)`, border to `--lume-secondary`
  - Tag "lights up" with `--lume-secondary` glow (`box-shadow: 0 0 12px ...`)
- Entry animation: tags scatter-in from random positions → settle into rows (GSAP stagger)

**Quick-Pitch**: Shows category headings and tags only (no descriptions).
**Deep Dive**: Adds a one-line proficiency/context note per category group.

---

### 8.8 `/education` — Education Listing Page

```
URL:        /education
Title:      "Education"
Type label: "ACADEMIC"
Descriptor: "Foundations built through structured learning."
```

**Layout**: Single or few entries — uses a large-format card per institution, not a grid.

**Education Card Anatomy**:

```
┌─────────────────────────────────────────────────────────┐
│  [Institution monogram badge, 64×64px]                  │
│                                                         │
│  Nanyang Polytechnic                  (display-md)      │
│  Information Technology              (heading, --text-secondary) │
│  Apr 2023 – Apr 2026                 (mono-sm, --text-muted)    │
│                                                         │
│  ── Quick-Pitch ─────────────────────────────────────── │
│  GPA / Grade:  3.91                  (display-md, --font-mono, --lume-primary) │
│  Diploma in Information Technology with Merit           │
│                                                         │
│  ── Deep Dive ───────────────────────────────────────── │
│  Full programme description                             │
│  Notable coursework or modules (if any)                 │
│  Relevant skills developed                              │
└─────────────────────────────────────────────────────────┘
```

**GPA Display**:
- Rendered large in `--font-mono`, `--lume-primary` colour
- Count-up animation on scroll entry (GSAP, 1.5s, `--ease-out-expo`)
- Decimal animates separately for precision effect

**Card Visual**:
- Large glass card (`--glass-2`, `border-radius: 24px`, generous padding `2xl`)
- Subtle top-border `--lume-secondary`
- Entry: slides up 40px + fades

---

### 8.9 Page Transition System

All navigations between Bento home and detail pages use a **coordinated shared-element + curtain transition**:

**Tile → Detail Page (click)**:

```
1. Clicked tile: border brightens to --lume-primary (80ms)
2. Tile scales up very slightly (1.02, 120ms, ease-out)
3. Black curtain slides up from bottom of viewport (300ms, ease-in-out)
4. New page mounts under curtain
5. Curtain retracts upward (400ms, ease-out-expo)
6. Page hero animates in (sequence defined in §8.2)
```

**Detail Page → Home (back)**:

```
1. Current page content fades (150ms)
2. Black curtain slides down from top (300ms)
3. Bento grid mounts; grid restores scroll position
4. Curtain retracts downward (400ms)
5. The originating tile briefly pulses with lume glow (500ms, then fades)
   — ties the return journey back visually to the entry point
```

**Implementation Note**: Use Next.js `<Link>` with a custom `TransitionLayout` wrapper component. Zustand stores the `originTileId` so the return pulse can target the correct tile.

```ts
// Zustand navigation store
interface NavigationStore {
  originTileId: string | null
  setOriginTileId: (id: string | null) => void
  curtainState: 'idle' | 'covering' | 'revealing'
  setCurtainState: (state: 'idle' | 'covering' | 'revealing') => void
}
```

---

### 8.10 Detail Page — Terminal Commands

The CLI overlay gains page-aware commands when on a detail page:

| Command | Context | Output |
|---|---|---|
| `ls` | `/projects` | Lists all project names |
| `cat triviaduel` | `/projects` | Prints TriviaDuel full detail |
| `ls awards` | `/awards` | Lists all awards by year |
| `ls skills` | `/skills` | Lists all skill categories |
| `whoami` | Any | Role + education + years exp |
| `back` | Any detail page | Triggers page exit → home |

---

## 9. Responsive Breakpoints

```css
/* Mobile-first approach */
sm:   640px   /* Large mobile landscape */
md:   768px   /* Tablet portrait */
lg:   1024px  /* Tablet landscape / small laptop */
xl:   1280px  /* Desktop */
2xl:  1536px  /* Large desktop */
3xl:  1920px  /* Wide */
```

### Mobile Adaptations

| Feature | Desktop | Mobile |
|---|---|---|
| Bento Grid | 12-col flexible | 2-col stacked |
| 3D Tilt | Full parallax | Disabled (gyroscope optional) |
| 3D Glass | Full R3F canvas | Simplified CSS animation |
| Generative bg | Full WebGL | Canvas 2D, 30fps, lower density |
| Command Palette | ⌘K trigger | Bottom-sheet slide-up |
| Terminal | Floating panel | Full-screen overlay |
| Nav | Horizontal links | Hamburger → drawer |
| Hero | Two-column | Single-column centered |

---

## 10. Data Architecture (Supabase Schema)

```sql
-- Bento tile definitions
tiles (
  id          uuid PRIMARY KEY,
  type        text,              -- 'project' | 'experience' | 'award' | 'skill' | 'contact' | 'stat'
  size        text,              -- '4x2' | '2x2' | etc.
  col_start   int,               -- optional manual placement
  row_start   int,
  order       int,               -- default sort order
  is_hidden   boolean DEFAULT false,   -- for easter egg tile
  is_active   boolean DEFAULT true,
  content     jsonb,             -- flexible content payload
  created_at  timestamptz,
  updated_at  timestamptz
)

-- Project-specific content (joined to tile)
projects (
  id          uuid PRIMARY KEY,
  tile_id     uuid REFERENCES tiles(id),
  name        text,
  description text,
  tech_stack  text[],
  github_url  text,
  live_url    text,
  featured    boolean,
  deep_dive   jsonb,   -- architecture notes, schema diagrams
  order       int
)

-- Embeddings for RAG search
tile_embeddings (
  id          uuid PRIMARY KEY,
  tile_id     uuid REFERENCES tiles(id),
  content     text,         -- flattened searchable content
  embedding   vector(1536), -- pgvector
  updated_at  timestamptz
)

-- Site config
site_config (
  key   text PRIMARY KEY,
  value jsonb
)
-- Keys: 'theme', 'mode_default', 'easter_egg_enabled', 'nav_links'
```

---

## 11. File & Folder Structure

```
portfolio/
├── app/
│   ├── layout.tsx                    # Root layout, providers, global styles
│   ├── page.tsx                      # Home (Bento grid)
│   │
│   ├── projects/
│   │   ├── page.tsx                  # /projects — listing all projects
│   │   └── [slug]/
│   │       └── page.tsx              # /projects/[slug] — individual project
│   │
│   ├── experience/
│   │   └── page.tsx                  # /experience — full timeline
│   │
│   ├── awards/
│   │   └── page.tsx                  # /awards — all awards & honours
│   │
│   ├── skills/
│   │   └── page.tsx                  # /skills — skills by category
│   │
│   ├── education/
│   │   └── page.tsx                  # /education — academic background
│   │
│   ├── admin/
│   │   ├── layout.tsx                # Admin layout (auth guard)
│   │   └── page.tsx                  # Admin dashboard
│   │
│   └── api/
│       ├── tiles/route.ts
│       ├── search/route.ts           # RAG semantic search endpoint
│       └── terminal/route.ts         # CLI command execution
│
├── components/
│   ├── bento/
│   │   ├── BentoGrid.tsx
│   │   ├── BentoTile.tsx             # Wraps all tile types, handles click → navigate
│   │   ├── tiles/
│   │   │   ├── ProjectTile.tsx
│   │   │   ├── ExperienceTile.tsx
│   │   │   ├── AwardTile.tsx
│   │   │   ├── SkillTile.tsx
│   │   │   ├── EducationTile.tsx
│   │   │   ├── ContactTile.tsx
│   │   │   └── EasterEggTile.tsx
│   │   └── useTilt.ts                # 3D tilt hook
│   │
│   ├── detail/
│   │   ├── DetailShell.tsx           # Shared page shell (back link, hero, footer)
│   │   ├── PageHero.tsx              # Type label + title + descriptor
│   │   ├── BackLink.tsx              # ← navigation with origin pulse
│   │   ├── PageCurtain.tsx           # Transition curtain overlay (GSAP)
│   │   │
│   │   ├── projects/
│   │   │   ├── ProjectList.tsx       # /projects listing layout
│   │   │   ├── ProjectCard.tsx       # Individual project card in listing
│   │   │   ├── ProjectDetail.tsx     # /projects/[slug] long-form layout
│   │   │   └── FeatureRow.tsx        # Key feature entry component
│   │   │
│   │   ├── experience/
│   │   │   ├── ExperienceTimeline.tsx # Timeline wrapper with SVG line
│   │   │   └── ExperienceEntry.tsx    # Single role entry
│   │   │
│   │   ├── awards/
│   │   │   ├── AwardsGrid.tsx         # Masonry-style grid
│   │   │   └── AwardCard.tsx          # Individual award card
│   │   │
│   │   ├── skills/
│   │   │   ├── SkillsPage.tsx         # Categorised sections layout
│   │   │   ├── SkillCategory.tsx      # Single category panel
│   │   │   └── SkillTag.tsx           # Interactive tag with glow
│   │   │
│   │   └── education/
│   │       └── EducationCard.tsx      # Institution card with GPA count-up
│   │
│   ├── canvas/
│   │   ├── GenerativeBackground.tsx  # WebGL / Canvas 2D generative art
│   │   └── MorphingGlass.tsx         # R3F scene
│   │
│   ├── cli/
│   │   ├── CommandPalette.tsx
│   │   ├── TerminalOverlay.tsx
│   │   └── useCommandRegistry.ts     # Page-aware command registry
│   │
│   ├── nav/
│   │   ├── Navbar.tsx
│   │   └── ViewModeToggle.tsx
│   │
│   ├── ui/                           # ShadCN + custom base components
│   │   ├── GlassCard.tsx
│   │   ├── LumeButton.tsx
│   │   ├── Badge.tsx
│   │   └── Tooltip.tsx
│   │
│   └── providers/
│       ├── ViewModeProvider.tsx
│       ├── NavigationProvider.tsx    # Origin tile tracking, curtain state
│       └── EasterEggProvider.tsx
│
├── hooks/
│   ├── useScrollVelocity.ts
│   ├── useMousePosition.ts
│   ├── useEasterEgg.ts
│   ├── useViewMode.ts
│   └── usePageTransition.ts         # Curtain trigger + origin tile pulse
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── migrations/              # SQL migration files
│   ├── gsap/
│   │   └── animations.ts            # Reusable GSAP timelines (incl. curtain, stagger)
│   └── rag/
│       └── search.ts                # Vector search + embedding
│
├── store/
│   ├── useViewModeStore.ts           # Zustand — Quick-Pitch / Deep Dive
│   └── useNavigationStore.ts         # Zustand — originTileId, curtainState
│
├── styles/
│   ├── globals.css
│   └── lume-glass.css               # Custom glass utilities
│
├── tailwind.config.ts
└── DESIGN.md                        # ← This file
```

---

## 12. Admin Panel Design

```
Route:      /admin (protected, Supabase Auth)
Layout:     Split — Sidebar (240px) + Main content area
Theme:      Same Lume-Glass system, but slightly higher surface brightness

Sidebar:
  - Tiles Manager
  - Projects
  - Site Config
  - Embeddings (regenerate RAG index)
  - Preview (opens portfolio in iframe)

Tiles Manager:
  - Drag-to-reorder grid preview (miniature Bento)
  - Add / Edit / Delete tiles
  - Toggle visibility (hides from public without deleting)
  - JSONB content editor (CodeMirror embedded)

Site Config:
  - Default view mode
  - Active lume accent color
  - Easter egg enabled/disabled toggle
  - Nav link order
```

---

## 13. Accessibility & Performance

### Accessibility

- **Focus rings**: 2px solid `--lume-primary`, 2px offset — visible on all interactive elements
- **Reduced motion**: All GSAP animations check `prefers-reduced-motion`, instant fallbacks
- **ARIA labels**: All icon buttons, toggle states, modal open/close states
- **Keyboard navigation**: Full tab order, command palette fully keyboard-operated
- **Color contrast**: All text meets WCAG AA on dark backgrounds; muted text (`--text-secondary`) only used for non-critical information

### Performance Targets

| Metric | Target |
|---|---|
| LCP | < 2.0s |
| FID | < 50ms |
| CLS | < 0.05 |
| TTI | < 3.5s |
| 3D canvas FPS | 60fps desktop, 30fps mobile |
| Initial JS bundle | < 200KB (gzipped, excluding R3F) |

### Performance Strategies

- **R3F canvas**: Lazy loaded, `Suspense` boundary with CSS fallback
- **Bento tile data**: Fetched server-side, streamed with React Suspense
- **Images**: `next/image`, AVIF format, lazy loading below fold
- **Generative bg**: Web Worker for generation, main thread only for render
- **Fonts**: `font-display: swap`, preconnect hints
- **Animations**: `will-change: transform` on tiles during hover, removed after

---

## 14. Content Map

### Tile Inventory (Initial Layout)

| # | Type | Size | Content | Click Destination |
|---|---|---|---|---|
| 1 | `hero` | 6×4 | Role label + intro text + CTAs (overlay on R3F canvas) | Non-navigable |
| 2 | `project` | 4×3 | TriviaDuel — featured | `/projects/triviaduel` |
| 3 | `project` | 4×3 | SecureAsset | `/projects/secureasset` |
| 4 | `experience` | 4×2 | DBS Bank internship summary | `/experience` |
| 5 | `education` | 2×2 | Nanyang Polytechnic, 3.91 GPA | `/education` |
| 6 | `award` | 3×2 | WorldSkills Singapore 2025 Silver | `/awards` |
| 7 | `award` | 3×1 | Ngee Ann Kongsi Award | `/awards` |
| 8 | `award` | 3×1 | WorldSkills ASEAN Cert of Appreciation | `/awards` |
| 9 | `skill` | 2×4 | Languages + Frameworks grid | `/skills` |
| 10 | `stat` | 1×1 | GPA: 3.91 | Non-navigable |
| 11 | `stat` | 1×1 | 1yr exp | Non-navigable |
| 12 | `stat` | 1×1 | 2 projects | Non-navigable |
| 13 | `cert` | 2×1 | Google UX Design | `/awards` (certs listed alongside) |
| 14 | `contact` | 2×2 | LinkedIn + Email + GitHub | External anchors only |
| 15 | `easter_egg` | 3×2 | Hidden — revealed by "sudo ignite" | Non-navigable |

### Detail Page → Content Source Matrix

| Detail Page | Supabase Source | Notes |
|---|---|---|
| `/projects` | `projects` table (all rows) | Joined to `tiles` for display metadata |
| `/projects/[slug]` | `projects` where `slug = [slug]` | Slug derived from project name |
| `/experience` | `tiles` where `type = 'experience'` | Content from `content` JSONB field |
| `/awards` | `tiles` where `type = 'award'` OR `type = 'cert'` | Certs rendered in a separate subsection |
| `/skills` | `tiles` where `type = 'skill'` | Tags parsed from JSONB array per category |
| `/education` | `tiles` where `type = 'education'` | GPA stored as numeric in JSONB |

---

*This document is the single source of truth for design decisions. Update it before implementing any visual or structural change.*