# Command Menu Button Shimmer Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revamp the command menu button shimmer effect in `HeroTile` to feature an idle rotating border-beam glow (A+B3) and a hover-triggered pulse wave background sheen.

**Architecture:** Update `app/globals.css` with custom GPU-accelerated keyframe animations (`border-beam-rotate` and `shimmer-pulse-wave`) and apply them inside `components/bento/tiles/HeroTile.tsx` using a static nested container with a rotating conic-gradient child masked to the border.

**Tech Stack:** React 19, Next.js 16 (App Router), Tailwind CSS 4, CSS masks.

---

### Task 1: Add Custom Keyframes and Classes to CSS

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add keyframes and class declarations**
  
  Append the following declarations inside [app/globals.css](file:///C:/Projects/Portfolio/app/globals.css) at the end of the file:

  ```css
  /* === Command Menu Button Shimmer Revamp === */
  @keyframes border-beam-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes shimmer-pulse-wave {
    0% { background-position: -150% 0; }
    100% { background-position: 150% 0; }
  }

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

- [ ] **Step 2: Commit CSS additions**

  Run:
  ```bash
  git add app/globals.css
  git commit -m "style: add border-beam and pulse-wave keyframe animations to globals.css"
  ```

---

### Task 2: Revamp the Button Element in HeroTile

**Files:**
- Modify: `components/bento/tiles/HeroTile.tsx`

- [ ] **Step 1: Replace button elements in HeroTile**

  Locate both `<button>` elements in [components/bento/tiles/HeroTile.tsx](file:///C:/Projects/Portfolio/components/bento/tiles/HeroTile.tsx) (approx. lines 152 and 207). Replace the original `<button>` markup and classes with the revamped layout.
  
  Specifically, target lines 152-169 (under `deepContent`) and lines 207-224 (under standard content) and replace them with:

  ```tsx
  <button
    onClick={handleBadgeClick}
    className="relative flex items-center gap-2 cursor-pointer select-none border-none focus:outline-none group/cmd text-white/40 hover:text-[#4AFFB4] transition-all duration-300 rounded-lg px-2.5 py-1 bg-white/[0.01] overflow-hidden"
  >
    {/* Hover-triggered background sheen (Pulse Wave) */}
    <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-[#4AFFB4]/10 to-transparent bg-[length:200%_100%] bg-no-repeat opacity-0 group-hover/cmd:opacity-100 group-hover/cmd:animate-shimmer-pulse pointer-events-none transition-opacity duration-300" />
    
    {/* Idle border-beam orbit container */}
    <div className="absolute inset-0 z-0 rounded-[inherit] padding-[1.5px] pointer-events-none [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] [-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:xor]">
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_60%,#4AFFB4_85%,transparent_100%)] animate-border-beam group-hover/cmd:animate-border-beam-fast" />
    </div>

    {/* Button Contents */}
    <span className="relative z-10 text-sm tracking-wide text-white/40 group-hover/cmd:text-[#4AFFB4] transition-colors pl-1">
      Try the command menu
    </span>
    {!isMobile && (
      <div className="relative z-10 flex items-center gap-1 font-mono text-[11px] text-white/20 ml-1">
        <kbd className="bg-white/[0.04] border border-white/10 text-white/40 group-hover/cmd:text-[#4AFFB4] group-hover/cmd:border-[#4AFFB4]/30 px-1.5 py-0.5 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_1.5px_0_rgba(0,0,0,0.3)] transition-all duration-300">
          {isMac ? "⌘" : "Ctrl"}
        </kbd>
        <kbd className="bg-white/[0.04] border border-white/10 text-white/40 group-hover/cmd:text-[#4AFFB4] group-hover/cmd:border-[#4AFFB4]/30 px-1.5 py-0.5 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_1.5px_0_rgba(0,0,0,0.3)] transition-all duration-300">
          K
        </kbd>
      </div>
    )}
  </button>
  ```

- [ ] **Step 2: Verify type safety and syntax correctness**

  Ensure that TypeScript files compile cleanly. Run:
  ```bash
  npx tsc --noEmit
  ```
  Expected: Command finishes successfully with no compilation errors.

- [ ] **Step 3: Commit HeroTile changes**

  Run:
  ```bash
  git add components/bento/tiles/HeroTile.tsx
  git commit -m "feat: revamp try the command menu button with idle border-beam and hover pulse"
  ```

---

### Task 3: Build Verification & Lint Checks

**Files:**
- N/A

- [ ] **Step 1: Run linter**

  Run:
  ```bash
  npm run lint
  ```
  Expected: No linting issues or errors related to our changes.

- [ ] **Step 2: Build the production bundle**

  Validate that Next.js successfully compiles the entire application. Run:
  ```bash
  npm run build
  ```
  Expected: Bundle is compiled successfully.
