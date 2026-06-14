# Command Menu Button Shimmer & Layout Revamp Implementation Plan

**Goal:** Revamp the command menu button shimmer effect in `HeroTile` to feature an idle rotating border-beam glow (A+B3) and a hover-triggered pulse wave background sheen, and clean up the header layout.

**Architecture:** Update `app/globals.css` with custom GPU-accelerated keyframe animations registered inside `@theme inline` for Tailwind CSS v4 compatibility, and apply them inside `components/bento/tiles/HeroTile.tsx` using a static nested container with standard mask properties. Remove the `SearchButton` from `app/page.tsx` next to the toggle.

---

### Task 1: Add Custom Keyframes and Classes to CSS Theme
**Files:**
- Modify: [globals.css](file:///C:/Projects/Portfolio/app/globals.css)

- [x] **Step 1: Add keyframes and variables to `@theme inline`**
  Registered the border-beam-rotate, shimmer-pulse-wave variables and keyframes directly within the `@theme inline` block so Tailwind CSS v4 compiles them properly and supports responsive/interactive modifiers.
- [x] **Step 2: Clean up duplicate definitions**
  Removed the old raw keyframes and animation classes from the bottom of the file.

---

### Task 2: Revamp the Button Element in HeroTile
**Files:**
- Modify: [HeroTile.tsx](file:///C:/Projects/Portfolio/components/bento/tiles/HeroTile.tsx)

- [x] **Step 1: Update button elements in HeroTile**
  Replaced the old button markup on both Quick-Pitch and Deep-Dive faces to support the new rotating conic-gradient mask and shimmer.
- [x] **Step 2: Add standard mask properties**
  Defined standard `mask` and `maskComposite` properties alongside browser-prefixed `WebkitMask` and `WebkitMaskComposite` styles in the inline style attribute to ensure wide browser compatibility.

---

### Task 3: Clean Up Header Layout
**Files:**
- Modify: [page.tsx](file:///C:/Projects/Portfolio/app/page.tsx)

- [x] **Step 1: Remove Search Button next to ViewModeToggle**
  Removed the `<SearchButton />` instance and its unused import from the home page.

---

### Task 4: Build Verification & Lint Checks
**Files:**
- N/A

- [x] **Step 1: Verify TypeScript compilation**
  Checked that the Next.js bundle compiles successfully without syntax or type errors.
- [x] **Step 2: Verify animation behavior**
  Inspected the element inside Chrome to verify standard keyframes, computed animations, and the hover acceleration.
