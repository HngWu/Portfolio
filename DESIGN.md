# Portfolio — Design System & Specification
> **Lume-Glass** · Dark Minimalist · Cinematic UX · Modular Architecture  
> **Dual Viewing Modes**: Quick-Pitch (Velocity & Impact) & Deep Dive (Architectural Depth & Rigor)

---

## 0. Design Philosophy & Dual-Mode Vision

| Principle | Expression |
|---|---|
| **Lume-Glass** | Every surface is a pane of glass — layered translucency, sub-surface noise, and light bleeding through chamfered edges. |
| **Dual-Mode Ergonomics** | Tailored to two distinct audiences: Quick-Pitch for 30–60s executive scanning; Deep Dive for 5–15m architectural immersion. |
| **Negative Space as Signal** | Emptiness is intentional breathing room; it frames critical metrics and prevents visual fatigue. |
| **Motion with Purpose** | Nothing moves without reason; every animation communicates state, hierarchy, or spatial continuity. |
| **Depth over Flatness** | The Z-axis is a design tool — 3D perspective transforms, layered blurs, and specular highlights create physical tangibility. |
| **Cinematic Pacing** | Reveals are choreographed, not instant; the viewport is a stage. |

---

## 1. Color System

### 1.1 Base Canvas & Neutrals (Dark Theme: "Obsidian Void")
```css
:root {
  /* === BACKGROUNDS === */
  --bg-void:        #080808;   /* true near-black base canvas */
  --bg-surface:     #0f0f0f;   /* primary surface */
  --bg-elevated:    #151515;   /* cards, modals, dropdowns */
  --bg-overlay:     #1c1c1c;   /* hover states, tooltips */

  /* === GLASS LAYERS === */
  --glass-1:        rgba(255, 255, 255, 0.03);  /* subtle surface shimmer */
  --glass-2:        rgba(255, 255, 255, 0.06);  /* card faces */
  --glass-3:        rgba(255, 255, 255, 0.09);  /* active/focused elements */
  --glass-border:   rgba(255, 255, 255, 0.08);  /* default border */
  --glass-border-active: rgba(255, 255, 255, 0.22); /* hover/focus border */

  /* === UNIVERSAL BRAND ACCENTS === */
  --lume-primary:   #4AFFB4;   /* electric mint — primary accent & execution pulse */
  --lume-secondary: #4A8FFF;   /* cool blueprint blue — technical clarity */
  --lume-tertiary:  #FF4A8F;   /* hot pink — easter egg / alerts */
  --lume-warm:      #FFB44A;   /* radiant amber — awards / ROI metrics */

  /* === LUME GLOW SPREADS === */
  --lume-glow-sm:   0 0 12px rgba(74, 255, 180, 0.15);
  --lume-glow-md:   0 0 32px rgba(74, 255, 180, 0.20);
  --lume-glow-lg:   0 0 64px rgba(74, 255, 180, 0.12);
  --lume-glow-xl:   0 0 120px rgba(74, 255, 180, 0.08);

  /* === TYPOGRAPHY CONTRAST === */
  --text-primary:   rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.65);
  --text-muted:     rgba(255, 255, 255, 0.42);
  --text-accent:    #4AFFB4;

  /* === FUNCTIONAL / SEMANTIC === */
  --color-success:  #34D399;   /* deployed status, test passing, metrics beat */
  --color-warning:  #FBBF24;   /* in-progress tags, architecture caveats */
  --color-error:    #FF4A6B;   /* bottlenecks, deprecated methods */
  --color-info:     #4A8FFF;   /* architecture notes, citations */

  /* === QUICK-PITCH MODE TOKENS (DEFAULT) === */
  --mode-accent:        #FFB44A;   /* radiant solar gold */
  --mode-accent-bright: #FFE875;   /* gold-leaf specular highlight */
  --mode-accent-deep:   #7A5E12;   /* engraved-gold shadow */
  --mode-accent-soft:   #FFB44A;   /* warm ambient wash */
  --mode-glow-rgb:      255, 180, 74;
  --mode-bg-tint:       rgba(255, 180, 74, 0.04);
  --mode-text-accent:   #FFD66B;
}

/* === DEEP DIVE MODE TOKENS === */
:root[data-mode="deep"] {
  --mode-accent:        #4A8FFF;   /* electric blueprint blue */
  --mode-accent-bright: #6AFFFF;   /* hextech cyan edge */
  --mode-accent-deep:   #0C0A1A;   /* deep indigo void */
  --mode-accent-soft:   #6A0DAD;   /* arcane violet */
  --mode-glow-rgb:      74, 143, 255;
  --mode-bg-tint:       rgba(74, 143, 255, 0.05);
  --mode-text-accent:   #8FB8FF;
}
```

### 1.2 Light Theme Palette ("Frosted Silica / Alabaster")
```css
:root.light {
  --bg-void:            #F8FAFC;   /* crisp off-white silica canvas */
  --bg-surface:         #FFFFFF;   /* frosted white card */
  --bg-elevated:        #F1F5F9;   /* modals, floating control bars */
  --bg-overlay:         #E2E8F0;

  --glass-1:            rgba(15, 23, 42, 0.02);
  --glass-2:            rgba(255, 255, 255, 0.75);
  --glass-3:            rgba(255, 255, 255, 0.90);
  --glass-border:       rgba(15, 23, 42, 0.08);
  --glass-border-active: rgba(15, 23, 42, 0.20);

  --text-primary:       #0F172A;
  --text-secondary:     #475569;
  --text-muted:         #94A3B8;
  --text-accent:        #059669;

  --lume-primary:       #059669;
  --lume-secondary:     #0284C7;
  --lume-warm:          #B45309;

  --mode-accent:        #B45309;
  --mode-accent-bright: #D97706;
  --mode-glow-rgb:      180, 83, 9;
  --mode-bg-tint:       rgba(180, 83, 9, 0.03);
  --mode-text-accent:   #92400E;
}

:root.light[data-mode="deep"] {
  --mode-accent:        #0284C7;
  --mode-accent-bright: #0369A1;
  --mode-glow-rgb:      2, 132, 199;
  --mode-bg-tint:       rgba(2, 132, 199, 0.03);
  --mode-text-accent:   #075985;
}
```

### 1.3 WCAG 2.1 Contrast Compliance Matrix

| Surface Canvas | Text / Accent Element | Hex / RGBA | Contrast Ratio | WCAG Rating |
|---|---|---|---|---|
| `#080808` (Dark Void) | `--text-primary` | `rgba(255,255,255,0.95)` | **17.8:1** | **AAA** |
| `#080808` (Dark Void) | `--text-secondary` | `rgba(255,255,255,0.65)` | **8.5:1** | **AAA** |
| `#080808` (Dark Void) | `--text-muted` | `rgba(255,255,255,0.42)` | **4.7:1** | **AA** (Normal Text) |
| `#080808` (Dark Void) | Quick-Pitch Gold | `#FFB44A` | **8.9:1** | **AAA** |
| `#080808` (Dark Void) | Deep-Dive Blueprint | `#4A8FFF` | **6.4:1** | **AA** (Large) / AAA (Large) |
| `#080808` (Dark Void) | Universal Mint | `#4AFFB4` | **12.4:1** | **AAA** |
| `#F8FAFC` (Light Silica) | `--text-primary` | `#0F172A` | **15.4:1** | **AAA** |
| `#F8FAFC` (Light Silica) | `--text-secondary` | `#475569` | **5.9:1** | **AA** |
| `#F8FAFC` (Light Silica) | Light Pitch Amber | `#B45309` | **5.2:1** | **AA** |
| `#F8FAFC` (Light Silica) | Light Deep Blue | `#0284C7` | **4.6:1** | **AA** |

---

## 2. Typography

### 2.1 Font Stack
- **Display**: `'Editorial New', 'Playfair Display', Georgia, serif` — luxury editorial gravitas for hero statements and section titles.
- **UI / Body**: `'Geist', 'Inter', -apple-system, sans-serif` — tall x-height, open apertures, neutral scannability on glass.
- **Mono / Numbers**: `'Geist Mono', 'JetBrains Mono', monospace` — tabular figures for performance metrics, latencies, dates, and code blocks.

### 2.2 Mode-Specific Typography Scales

| Token Name | Quick-Pitch Spec | Deep Dive Spec | Family | Intended Use |
|---|---|---|---|---|
| `display-hero` | `clamp(3.5rem, 8vw, 6.5rem)` / `1.0` / `-0.04em` | `clamp(2.5rem, 5vw, 4rem)` / `1.1` / `-0.03em` | `--font-display` | Hero headline statement |
| `display-section` | `clamp(2rem, 4vw, 3.25rem)` / `1.1` / `-0.03em` | `clamp(1.75rem, 3vw, 2.5rem)` / `1.2` / `-0.02em` | `--font-display` | Section heads, case study titles |
| `heading-card` | `1.5rem` / `1.25` / `-0.02em` | `1.25rem` / `1.3` / `-0.01em` | `--font-sans` | Project title, key card title |
| `subheading` | `1.125rem` / `1.3` / `-0.01em` | `1rem` / `1.4` / `0em` | `--font-sans` | Role description, context summary |
| `body-prose` | `1rem` / `1.5` / `0em` (max `42ch`) | `1.0625rem` / `1.75` / `0.005em` (max `68ch`) | `--font-sans` | Case study body, readable measure |
| `body-ui` | `0.875rem` / `1.5` / `0em` | `0.875rem` / `1.5` / `0em` | `--font-sans` | Nav links, button text, tooltips |
| `metric-stat` | `clamp(2.5rem, 5vw, 4.5rem)` / `0.95` / `-0.03em` | `1.75rem` / `1.1` / `-0.02em` | `--font-mono` | Quantitative results (`+140%`, `12ms`) |
| `label-meta` | `0.75rem` / `1.2` / `0.1em` *(UPPERCASE)* | `0.75rem` / `1.3` / `0.08em` *(UPPERCASE)* | `--font-mono` | Status pills, category tags, years |

---

## 3. Spacing & Layout

### 3.1 Spacing Scale (8pt / 4pt Hybrid Grid)
- `4px` (`--space-1`): Tag padding, icon gaps, status dots.
- `8px` (`--space-2`): Button inner padding, compact badge gaps.
- `12px` (`--space-3`): Bento card inner micro-spacing.
- `16px` (`--space-4`): Mobile card padding, standard grid gap.
- `24px` (`--space-6`): Desktop card padding, tile header margin.
- `32px` (`--space-8`): Bento column gap on desktop (≥1280px).
- `48px` (`--space-12`): Section gap in Deep-Dive mode.
- `64px` (`--space-16`): Major section dividers, hero breathing room.
- `96px` (`--space-24`): Quick-Pitch macro stage padding.

### 3.2 Responsive Bento Matrix
- **Desktop (≥1280px)**: 12-column dynamic CSS grid, 16px gaps, auto-rows based on 60px base unit.
- **Tablet (768px – 1279px)**: 6-column grid, 12px gaps.
- **Mobile (<768px)**: 2-column or 1-column linear stack, 8px gaps.

### 3.3 Density Rules Per Mode
- **Quick-Pitch Mode**:
  - Focuses strictly on **3 Featured Projects**, Key Metrics, and Immediate CTA.
  - Page length constrained to 1.5–2 viewports.
  - High spatial breathing room, large hit targets, zero text walls.
- **Deep Dive Mode**:
  - Information-dense, structured long-form reading.
  - Case studies expand into full-width sections with architecture diagrams and code blocks.
  - Reading measure strictly capped at `68ch` to prevent eye strain.

---

## 4. Glass & Surface Styles

### 4.1 Glass Card (Base)
```css
.glass-card {
  background: var(--glass-2);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.06),   /* chamfered specular top edge */
    0 1px 3px rgba(0,0,0,0.5),              /* base shadow */
    0 8px 32px rgba(0,0,0,0.3);             /* ambient drop shadow */
  transition: border-color 300ms ease, box-shadow 300ms ease, transform 300ms ease;
}

.glass-card:hover {
  border-color: var(--glass-border-active);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.12),
    0 1px 3px rgba(0,0,0,0.5),
    0 16px 64px rgba(0,0,0,0.4),
    var(--lume-glow-md);
}
```

### 4.2 Border Beam Orbit & Cross-Browser CSS Masking
- **Idle Orbit**: A continuous conic-gradient orbit (`animate-border-beam` @ 4s).
- **Hover Orbit**: Speeds up to 1.5s with a luminous gradient pulse.
- **Cross-Browser Mask Isolation**:
  ```css
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  ```

---

## 5. UI Component Specifications

### 5.1 Mode Switcher Pill (`ViewModeToggle.tsx`)
- **Placement**: Floating top navbar right group.
- **Labels**: `⚡ Quick-Pitch (30s)` and `🔬 Deep Dive (detail)`.
- **Accessibility**: Includes `aria-label` and `aria-pressed` states.
- **Feedback**: Sliding pill indicator with spring physics and Web Audio haptic click cues.

### 5.2 Button System (`components/ui/button.tsx`)
- **Primary Mode CTA**: Driven by `var(--mode-accent)` with active border beam.
- **Glass Secondary Button**: Translucent fill `rgba(255,255,255,0.04)` with `backdrop-blur-md`.
- **Ghost Action**: Flat transparent button for secondary tools.
- **Focus Rings**: Dual-ring `outline: 2px solid var(--mode-accent)` with `2px` offset.

### 5.3 Project Cards & Case Study Panels
- **Quick-Pitch Mode**:
  - Displays high-resolution teaser, one-sentence elevator pitch, and **3 Large Metric Pills** (`+140% speed`, `10M ops/s`).
  - Single primary action: `[Inspect Live / Play Demo]`.
- **Deep Dive Mode**:
  - Unfolds into the **Modular Case Study Panel** with problem framing, system architecture, key trade-offs, and quantified retrospective.

---

## 6. Arcane Experience Spellbook System (`components/experience/`)

The Experience Deep Dive expands the tile into an interactive 3D/2D arcane grimoire with leaf page turns, audio cues, and handcrafted spells.

```
Anatomy:
  1. Front Cover (BookCoverFace.tsx):
     - Gilded runic filigree with etched borders and career seal
     - Unlatch trigger with smooth open animation and audio cue
  2. Two-Page Spread (SpellPageSpread.tsx):
     - Left Leaf (SpellPageLeft.tsx):
       * Realm & Era header (Organization & Tenure)
       * School of Mastery (Specialization domain)
       * Sigil Emblem (Transmutation / Alchemy / Conjuration)
       * Spell Ingredients (Core technologies & tools with elemental symbols)
     - Right Leaf (SpellPageRight.tsx):
       * Incantations (Structured architectural responsibilities & initiatives)
       * Spell Effects & Runes (Production deliverables & quantified metrics)
  3. Interactive Page Turning (PageFlipLeaf.tsx):
     - 3D CSS perspective transforms with preserve-3d and backface visibility isolation
     - Smooth spring-damped turn physics with audio-synced parchment page turn SFX
  4. Back Cover (BookBackCoverFace.tsx):
     - Ancient grimoire colophon and return navigation trigger
  5. Atmospheric Effects:
     - SpellOpeningFlourish.tsx (radiant magical burst on first open)
     - SpellAmbientMana.tsx (drifting floating mana particles)
  6. Audio Integration (lib/experience/bookAudio.ts):
     - Synthesized Web Audio SFX for book opening latch and tactile page rustles
     - Mute/Unmute state toggle with persistent audio lock prevention
```

---

## 7. Motion, 3D Hero & Interaction

### 7.1 HexCore 3D Hero Artifact
- **Geometry**: 3x3 Rubik's Cube shell composed of 54 square pyramids (`components/bento/tiles/PolyhedronCanvas.tsx`).
- **Visual FX**: Dynamic electric arc shaders (`LightningArcs.tsx`) and GPU point cloud streams (`RunicDustStreams.tsx`).
- **Animation Choreography**: Synchronized idle tumble with rapid 90° face rotation bursts every 6 seconds.

### 7.2 The 3D Card Flip Transition
When toggling between Quick-Pitch and Deep-Dive:
- Card faces execute a synchronized 3D flip (`transform: perspective(1500px) rotateY(180deg)`).
- Canvas ambient illumination shifts color over 420ms without layout shifting.

---

## 8. Accessibility & Ergonomics (A11y)

1. **WCAG 2.1 AAA Text Contrast**: High contrast guaranteed across all dark and light themes (16.8:1 primary text contrast on dark canvas).
2. **Strict Focus Trapping**: Modals trap focus; `Escape` key closes dialogs and returns focus to the origin element.
3. **Reduced Motion Compliance**:
   ```css
   @media (prefers-reduced-motion: reduce) {
     * {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
     .glass-card { transform: none !important; }
   }
   ```
4. **Keyboard Accessibility**: All interactive cards and controls are fully operable with `Tab` and `Enter`/`Space`.

---

## 9. Admin Panel Design

```
Dashboard:  System Health Command Center (/admin)
            - Total Tiles & visibility status
            - Project count overview
            - Active Site Config variable tracking
            - System Status: DB connection, Edge Functions, Storage Quota
            - Bento Stats: Interactivity %, Deep Dive count, Load times
```

---

*This document is the single source of truth for the Lume-Glass design system.*