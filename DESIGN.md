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
| `4x5` | 4 | 5 | Featured Expertise / Mega Tile |
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
### 4.3 Border Beam Orbit (A+B3 Shimmer)

- **Idle Orbit Animation**: A conic-gradient segment orbiting around the edge of glass cards/buttons continuously (`animate-border-beam` @ 4s duration).
- **Interactive State**: Speeds up on hover (`animate-border-beam-fast` @ 2s duration) and triggers a background Pulse Wave gradient shift (`animate-shimmer-pulse`) with a subtle mint sheen.
- **Cross-Browser CSS Masking**: Isolates the button's perimeter (hollowing out the center region) by applying standard and webkit-prefixed mask rules:
  ```css
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
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
Right:      [Mode Toggle] [Menu (mobile)] (Search Button removed to reduce layout clutter; global Ctrl+K / ⌘K command palette triggers remain active)
```

### 5.2 Hero Section

```
Height:     100svh (safe viewport)
Layout:     Centered vertically & horizontally (app/page.tsx flex-col justify-center)

Background: R3F Canvas (full bleed) — 3x3 Rubik's HexCore Shell
Content:    z-index: 10, relative

Elements:
  - Role label (UPPERCASE mono, --lume-primary, animated in)
  - Name placeholder / identity mark
  - Single-line descriptor (max 60 chars)
  - Two CTAs: [View Projects ↓] [⌘K Open CLI]
```

### 5.3 Bento Grid Tiles

**Education Tile** (`type: "education"`)
```
Quick-Pitch: Institution heading + Degree body. Footer: Date only.
Deep Dive:   High-end Academic Profile dashboard.
             - Cumulative GPA progress bar (animated)
             - Degree focus & Specialization
             - Core Mastery list (if enabled in DB)
             - Honours & Rank badges
Glow:        Blue (--lume-secondary)
```

**Experience Tile** (`type: "experience"`)
```
Quick-Pitch: Role heading + Company/Date. 
             List of 5 categorized highlights with dynamic icons (Zap, Layers, BarChart, etc.)
Deep Dive:   "Professional Impact" linear layout. 
             Full descriptions grouped by the 5 highlights categories.
Footer:      Company name (DBS Bank), symmetric spacing.
```

### 5.5 Terminal / CLI Overlay

```
Commands:
  ls projects         → lists all projects
  login               → REDIRECT TO /admin
  sudo ignite         → 🔒 EASTER EGG TRIGGER
```

---

## 6. Motion & Animation

### 6.5 HexCore 3D Visual (Hero)

```
Architecture:   3x3 Rubik's Cube Shell (54 Square Pyramids)
Material:       MeshStandardMaterial (Matte Indigo #1c1b43)
Features:       - 3D Square Pyramids with golden wireframe edges
                - Opaque pyramids completely hide core in closed state
                - Unique golden Runes on every pyramid face (Text component)
                - Dark Bluish-Purple energy core heart

Animation:      - Idle: Slow cinematic multi-axis rotation
                - Rubik Move: Burst of 4 rapid 90-degree rotations every 6 seconds
                - Permanent expansion (factor 0.25) reveals core aura gaps
```

---

## 12. Admin Panel Design

```
Dashboard:  System Health Command Center
            - Total Tiles & visibility status
            - Project count overview
            - Active Site Config variable tracking
            - System Status: DB connection, Edge Functions, Storage Quota
            - Bento Stats: Interactivity %, Deep Dive count, Load times
```

---

*This document is the single source of truth for design decisions. Updated May 2026.*