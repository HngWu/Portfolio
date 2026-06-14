# Design Spec: Command Menu Button Shimmer Revamp (A+B3)

**Author:** Antigravity AI
**Date:** 2026-06-15
**Status:** Approved

---

## 1. Goal Description

Revamp the command palette trigger button ("Try the command menu") inside the `HeroTile` component to replace the static two-loop shimmer with a highly dynamic, premium "Lume-Glass" cinematic style.

The design is a hybrid combining:
1. **Idle Border Beam Orbit (Concept B)**: A laser-sharp accent line tracing around the border of the button continuously on idle, speeding up on hover.
2. **Hover Pulse Wave (Concept A)**: A subtle, green-tinted background sheen gradient that animates across the button when hovered.

---

## 2. Architecture & Implementation Plan

### 2.1 CSS-Mask Border Beam
To achieve a high-performance border beam animation that works reliably across all modern browsers without requiring `@property` CSS registrations or causing border-clipping/wobble artifacts:
- We use a outer wrapper `.border-beam-container` inside the button that is absolutely positioned to `inset: 0` with `border-radius: inherit`.
- We apply a mask composition using standard CSS `mask` rules that exclude the center content box, exposing only a `1.5px` border region.
- Inside this masked wrapper, we place a rotating square child containing a `conic-gradient`. As this child rotates via GPU-accelerated `transform: rotate()`, the gradient orbits seamlessly around the border.

### 2.2 Pulse Wave Highlight
- An absolute container `div` positioned behind the text/kbd symbols.
- At rest, its `opacity` is `0`.
- On hover, it transitions to `opacity: 100%` and runs a looping linear gradient horizontal shift animation (`shimmer-pulse-wave`) with an electric-mint (`#4AFFB4`) color profile.

---

## 3. Target Files & Code Changes

### 3.1 [MODIFY] [globals.css](file:///C:/Projects/Portfolio/app/globals.css)

Add new animation keyframes and classes:
```css
  /* Border Beam Rotation */
  @keyframes border-beam-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Pulse Shimmer Wave */
  @keyframes shimmer-pulse-wave {
    0% { background-position: -150% 0; }
    100% { background-position: 150% 0; }
  }

  /* Custom utility classes */
  .animate-border-beam {
    animation: border-beam-rotate 4s linear infinite;
  }
  .animate-border-beam-fast {
    animation: border-beam-rotate 2s linear infinite;
  }
  .animate-shimmer-pulse {
    animation: shimmer-pulse-wave 1.5s linear infinite;
  }
```

### 3.2 [MODIFY] [HeroTile.tsx](file:///C:/Projects/Portfolio/components/bento/tiles/HeroTile.tsx)

Update the `<button>` element inside both the standard view and the deep content view faces.
Remove `animate-shimmer` and `bg-gradient-to-r` styles from the button element, and instead nest:
- A `div` for the background pulse: `bg-gradient-to-r from-transparent via-[#4AFFB4]/10 to-transparent bg-[length:200%_100%] bg-no-repeat opacity-0 group-hover/cmd:opacity-100 group-hover/cmd:animate-shimmer-pulse transition-opacity duration-300`
- A masked `div` container for the border beam containing a child `div` rotating `conic-gradient(from 0deg, transparent 60%, #4AFFB4 85%, transparent 100%)`.

---

## 4. Verification & Testing Plan

### 4.1 Visual Verification
- Deploy/run the local Next.js server.
- Inspect the button on the home page hero section:
  - Verify that when the mouse is **not** hovering, the border beam is orbiting at a slow rate.
  - Verify that when **hovering** over the button:
    - The border beam speeds up.
    - The background pulse wave sheen plays continuously.
    - The button text and `Ctrl K` / `⌘ K` keys glow with `#4AFFB4`.
  - Check responsiveness and corners at different scaling sizes.

### 4.2 Cross-Browser Testing
- Verify that standard mask properties work under Chrome, Edge, Safari, and Firefox.
