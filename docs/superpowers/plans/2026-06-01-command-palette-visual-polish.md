# Command Palette Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revamp the Command Palette selection style and add a dynamic, theme-synchronized narrow scrollbar to align with the premium Lume-Glass ecosystem aesthetic.

**Architecture:** Use global CSS utilities for custom narrow webkit-scrollbars linked to dynamic custom properties (`var(--lume-primary)`), and implement an absolute-positioned floating notch design inside option items to replace static solid left borders.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, Zustand.

---

### Task 1: Add Custom Scrollbar Utility to Global CSS

**Files:**
- Modify: `app/globals.css` (at the end of the file)

- [ ] **Step 1: Append the custom scrollbar utility**
  Add the `.scrollbar-custom` utility to the layer/utilities of `app/globals.css` so that it's universally available and tracks standard webkit bindings.

  ```css
  /* Custom Thin Scrollbar */
  .scrollbar-custom {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
  }

  .scrollbar-custom::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  .scrollbar-custom::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-custom::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 9999px;
    transition: background 0.2s ease, box-shadow 0.2s ease;
  }

  .scrollbar-custom::-webkit-scrollbar-thumb:hover {
    background: var(--lume-primary);
    box-shadow: 0 0 8px var(--lume-primary);
  }
  ```

- [ ] **Step 2: Commit global CSS changes**
  Run git commands to stage and commit the CSS updates.

  ```bash
  git add app/globals.css
  git commit -m "style: add custom thin scrollbar utility to globals"
  ```

---

### Task 2: Implement Option A Layout and Floating Notch in Command Palette

**Files:**
- Modify: `components/cli/CommandPalette.tsx`

- [ ] **Step 1: Update Command Palette Button Layout & Classes**
  Modify the `button` mapping in `components/cli/CommandPalette.tsx` to support the soft floating card highlight, relative positioning, and dynamic text/icon theme colors. Replace:
  
  ```tsx
  className={cn(
    "w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-200 flex items-center justify-between group border-l-2 relative overflow-hidden",
    globalIndex === selectedIndex 
      ? "bg-white/[0.03] border-l-[#4AFFB4] text-white shadow-[inset_0_0_12px_rgba(74,255,180,0.02)]" 
      : "border-l-transparent text-white/60 hover:bg-white/[0.01] hover:text-white"
  )}
  ```

  with the new selection classes that remove the left border, align the items, and support the absolute notch overlay:

  ```tsx
  className={cn(
    "w-full text-left pl-7 pr-4 py-3 text-sm rounded-xl transition-all duration-200 flex items-center justify-between group border border-transparent relative overflow-hidden",
    globalIndex === selectedIndex 
      ? "bg-white/[0.03] border-white/5 text-white shadow-[inset_0_0_12px_rgba(255,255,255,0.01)]" 
      : "text-white/60 hover:bg-white/[0.01] hover:text-white"
  )}
  ```

- [ ] **Step 2: Inject Absolute Floating Notch & Dynamic Accent Colors**
  Add the floating capsule notch inside the button's children so it lights up on selection. Place it right at the beginning of the button's children (before `palette-item-left`):
  
  ```tsx
  {globalIndex === selectedIndex && (
    <span className="absolute left-2 top-1/2 -translate-y-1/2 w-[3px] h-[16px] rounded-full bg-lume-primary shadow-[0_0_10px_var(--lume-primary)] animate-in fade-in zoom-in duration-200" />
  )}
  ```

  And change the icon selection color class from static `text-[#4AFFB4]` to dynamic `text-lume-primary`. Replace:
  
  ```tsx
  globalIndex === selectedIndex ? "text-[#4AFFB4]" : "text-white/30"
  ```
  
  with:
  
  ```tsx
  globalIndex === selectedIndex ? "text-lume-primary" : "text-white/30"
  ```

- [ ] **Step 3: Update the ENTER key pill and Cursor Dynamic Colors**
  Refactor static accent color properties to use the dynamic theme settings.
  
  For the input cursor blinker, replace:
  ```tsx
  <span className="w-1.5 h-4 bg-[#4AFFB4] animate-pulse rounded shrink-0 mr-3 shadow-[0_0_8px_rgba(74,255,180,0.6)]" />
  ```
  with:
  ```tsx
  <span className="w-1.5 h-4 bg-lume-primary animate-pulse rounded shrink-0 mr-3 shadow-[0_0_8px_var(--lume-primary)]" />
  ```
  
  For the action buttons, replace the hardcoded ENTER badge styling:
  ```tsx
  <span className="text-[10px] font-mono text-[#4AFFB4] bg-[#4AFFB4]/10 border border-[#4AFFB4]/20 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(74,255,180,0.1)]">
    ENTER
  </span>
  ```
  with:
  ```tsx
  <span className="text-[10px] font-mono text-lume-primary bg-lume-primary/10 border border-lume-primary/20 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(var(--lume-primary),0.1)]">
    ENTER
  </span>
  ```

- [ ] **Step 4: Integrate the Custom Scrollbar Class**
  Apply the `.scrollbar-custom` class to the command list container. Replace:
  
  ```tsx
  <div className="p-2 overflow-y-auto max-h-[60vh]">
  ```
  
  with:
  
  ```tsx
  <div className="p-2 overflow-y-auto max-h-[60vh] scrollbar-custom">
  ```

- [ ] **Step 5: Verify types and imports**
  Run typescript compile checks locally to guarantee standard layout safety.
  
  Command: `npx tsc --noEmit`
  Expected output: Clean compile without errors on the modified component.

- [ ] **Step 6: Commit component updates**
  Run git commands to stage and commit the modified React file.

  ```bash
  git add components/cli/CommandPalette.tsx
  git commit -m "feat: implement option A selection style and custom scrollbars in command palette"
  ```

---

### Task 3: Development Server Manual Validation

- [ ] **Step 1: Start Next.js Development Server**
  Fire up the development environment using `npm run dev` to host the site locally.
  
  Command: `npm run dev`
  Expected output: Next.js dev server starting successfully (e.g. at `http://localhost:3000`).

- [ ] **Step 2: Trigger Command Palette**
  Navigate to the local address and open the Command Palette using `Ctrl+K` or `Cmd+K`.
  
  - Select items using `ArrowDown`/`ArrowUp` keys.
  - Verify that the selection features a rounded dynamic floating notch.
  - Ensure scroll behavior keeps active items centered.

- [ ] **Step 3: Test Dynamic Accent Changing**
  Select the "Toggle Accent Color" command in the palette.
  
  - Press Enter to toggle theme colors (Mint, Blue, Pink, Amber).
  - Verify that the Selection Notch, input cursor, ENTER badge, and scrollbar's hover highlights update instantly.
  - Verify the scrollbar thickness is extremely small (`4px`).
