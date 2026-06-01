# Hero Tile Spacing Refinement Design Specification

This document details the design specifications for refining the internal spacing of the Hero Tile in the Bento Grid system, increasing padding and margin distributions to achieve a balanced, high-end visual layout.

---

## 1. Objectives

- **Refined Negative Space**: Increase the tile's internal padding on larger screens to make the typography feel less congested and more cinematic.
- **Balanced Flow**: Distribute vertical margins between the mark heading, description body text, and control footer chrome proportionately.
- **Identical Flip Symmetry**: Ensure the increased margins are completely mirrored in both the collapsed (Quick-Pitch) and expanded (Deep Dive) visual states to prevent transition shifting.

---

## 2. Layout Specifications

### 2.1 Outer Padding (`components/bento/tiles/HeroTile.tsx`)
Currently, the outer padding uses a small static utility:
```tsx
className="bg-white/[0.02] border border-white/5 p-6 flex flex-col justify-center h-full"
```
We will scale this padding responsively:
*   **Mobile Screens (< 768px)**: Keep `p-6` to avoid wrapping labels unnecessarily or pushing content out of view.
*   **Medium & Large Screens (>= 768px)**: Increase padding to `md:p-8` for premium breathing space.

Updated BentoTile element class:
```tsx
className="bg-white/[0.02] border border-white/5 p-6 md:p-8 flex flex-col justify-center h-full"
```

### 2.2 Content Separation (Collapsed & Deep Dive Content)
To establish a premium text flow, the vertical elements inside the tile's layout will gain spacing adjustments:

1. **Description Paragraph Separation**:
   - Change `mt-4` to `mt-6` to give the body description space relative to the scrambling mark headline:
     ```tsx
     <p className="text-base md:text-lg mt-6 text-white/50 w-full leading-relaxed">
     ```
2. **Footer Divider separation**:
   - Change the horizontal line divider margin-top from `mt-5` to `mt-8`, and increase the border padding-top from `pt-3` to `pt-4` to separate action targets cleanly:
     ```tsx
     <div className="border-t border-white/5 pt-4 flex items-center justify-between w-full mt-8">
     ```

These spacing updates will be made to both faces of the card (`deepContent` and collapsed main face).

---

## 3. Verification Plan

### 3.1 Visual Consistency
- Confirm no visual shifting of elements occurs when flipping the card between Quick-Pitch and Deep Dive modes.
- Verify download CV and try the command menu elements sit perfectly at the bottom with the increased spacing.

### 3.2 Mobile/Desktop Scale Verification
- Compile and load the page to confirm `p-6` is active on mobile sizes and `p-8` correctly overrides on larger viewport breakpoints.
