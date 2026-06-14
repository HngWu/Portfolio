# Design Spec: Command Menu Button Shimmer & Layout Revamp

**Author:** Antigravity AI
**Date:** 2026-06-15
**Status:** Approved & Implemented

---

## 1. Goal Description

Revamp the command palette trigger button ("Try the command menu") inside the `HeroTile` component to replace the static two-loop shimmer with a highly dynamic, premium "Lume-Glass" cinematic style, and optimize the header layout.

The design features:
1. **Idle Border Beam Orbit**: A laser-sharp accent line tracing around the border of the button continuously on idle, speeding up on hover.
2. **Hover Pulse Wave**: A subtle, green-tinted background sheen gradient that animates across the button when hovered.
3. **Clean Header Layout**: The `SearchButton` is removed from beside the `ViewModeToggle` in the top-right header to reduce visual clutter, while retaining full global keybindings (Ctrl+K / ⌘K) and bento triggers.

---

## 2. Architecture & Implementation

### 2.1 CSS-Mask Border Beam (Tailwind CSS v4 & Standard Mask properties)
To achieve a high-performance border beam animation that works reliably across all modern browsers:
- We use a outer wrapper `.border-beam-container` inside the button that is absolutely positioned to `inset: 0` with `border-radius: inherit`.
- We apply a mask composition using standard CSS `mask` and `mask-composite` rules (along with `WebkitMask` and `WebkitMaskComposite`) that exclude the center content box, exposing only a `1.5px` border region.
- Inside this masked wrapper, we place a rotating square child containing a `conic-gradient`. As this child rotates via GPU-accelerated `transform: rotate()`, the gradient orbits seamlessly around the border.

### 2.2 Pulse Wave Highlight
- An absolute container `div` positioned behind the text/kbd symbols.
- At rest, its `opacity` is `0`.
- On hover, it transitions to `opacity: 100%` and runs a looping linear gradient horizontal shift animation (`shimmer-pulse-wave`) with an electric-mint (`#4AFFB4`) color profile.

---

## 3. Implemented File & Code Changes

### 3.1 [globals.css](file:///C:/Projects/Portfolio/app/globals.css)
Custom animation keyframes and animation utility definitions are registered directly inside the `@theme inline` block to comply with **Tailwind CSS v4** architecture, ensuring utility classes are correctly generated:

```css
@theme inline {
  /* ... other theme declarations ... */

  --animate-border-beam: border-beam-rotate 4s linear infinite;
  --animate-border-beam-fast: border-beam-rotate 2s linear infinite;
  --animate-shimmer-pulse: shimmer-pulse-wave 1.5s linear infinite;

  @keyframes border-beam-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes shimmer-pulse-wave {
    0% { background-position: -150% 0; }
    100% { background-position: 150% 0; }
  }
}
```

### 3.2 [HeroTile.tsx](file:///C:/Projects/Portfolio/components/bento/tiles/HeroTile.tsx)
Updated both `<button>` elements (Quick-Pitch and Deep-Dive faces) to utilize standard mask properties alongside Webkit properties to ensure full cross-browser support:
```tsx
style={{
  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
  maskComposite: "exclude",
  WebkitMaskComposite: "xor"
}}
```

### 3.3 [page.tsx](file:///C:/Projects/Portfolio/app/page.tsx)
Removed the `<SearchButton />` instance and import from the top-right header, leaving only the `<ViewModeToggle />` layout component active on the main dashboard.
