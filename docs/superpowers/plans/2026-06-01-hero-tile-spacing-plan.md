# Hero Tile Spacing Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase the internal padding and vertical margins of the Hero Tile in both Quick-Pitch and Deep Dive modes to elevate readability and visual spacing.

**Architecture:** Refactor Tailwind spacing utilities inside `components/bento/tiles/HeroTile.tsx` for responsive outer paddings and symmetric internal element gaps.

**Tech Stack:** React, Tailwind CSS v4, TypeScript.

---

### Task 1: Refactor Paddings and Vertical Margins in HeroTile

**Files:**
- Modify: `components/bento/tiles/HeroTile.tsx`

- [ ] **Step 1: Increase Outer Padding on Desktop**
  Open `components/bento/tiles/HeroTile.tsx`. Locate the outer `BentoTile` wrapper class name (lines 129-136). Replace the static padding:
  
  ```tsx
  className="bg-white/[0.02] border border-white/5 p-6 flex flex-col justify-center h-full"
  ```
  
  with responsive outer padding:
  
  ```tsx
  className="bg-white/[0.02] border border-white/5 p-6 md:p-8 flex flex-col justify-center h-full"
  ```

- [ ] **Step 2: Adjust Spacing in Deep Dive (`deepContent` Face)**
  Locate the description paragraph and horizontal footer container inside the `deepContent` section of `HeroTile.tsx` (lines 146-151).
  
  - Change description margin-top from `mt-4` to `mt-6`:
    ```tsx
    <p className="text-base md:text-lg mt-6 text-white/50 w-full leading-relaxed">
    ```
  - Change footer container margin-top from `mt-5` to `mt-8` and padding-top from `pt-3` to `pt-4`:
    ```tsx
    <div className="border-t border-white/5 pt-4 flex items-center justify-between w-full mt-8">
    ```

- [ ] **Step 3: Adjust Spacing in Quick-Pitch (Collapsed Face)**
  Locate the description paragraph and horizontal footer container inside the standard collapsed view face (lines 204-209).
  
  - Change description margin-top from `mt-4` to `mt-6`:
    ```tsx
    <p className="text-base md:text-lg mt-6 text-white/50 w-full leading-relaxed">
    ```
  - Change footer container margin-top from `mt-5` to `mt-8` and padding-top from `pt-3` to `pt-4`:
    ```tsx
    <div className="border-t border-white/5 pt-4 flex items-center justify-between w-full mt-8">
    ```

- [ ] **Step 4: Verify type safety**
  Run typescript compile check to guarantee standard type safety.
  
  Command: `npx tsc --noEmit`
  Expected: Clean compilation with zero errors.

- [ ] **Step 5: Commit local spacing changes**
  Stage the files and commit using Git.
  
  ```bash
  git add components/bento/tiles/HeroTile.tsx
  git commit -m "feat: refine outer padding and vertical margins in HeroTile"
  ```

---

### Task 2: Local Development Verification

- [ ] **Step 1: Start Next.js Development Server**
  Fire up the development environment using `npm run dev` to verify the rendering.
  
  Command: `npm run dev`
  Expected: Dev server starting successfully at `http://localhost:3000`.

- [ ] **Step 2: Visual Inspection of Spacing**
  Open the local portfolio page.
  
  - Confirm the Hero Tile looks more spacious on larger displays.
  - Test clicking "Try the command menu" and downloading CV targets.
  - Flip between Quick-Pitch and Deep Dive modes to verify zero layout jump or content shifting.
