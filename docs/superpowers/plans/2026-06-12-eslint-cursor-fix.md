# ESLint & React 19 Cursor Errors Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up the repository by removing three unused, non-compiling cursor components and configuring ESLint to ignore two local utility scripts, restoring the codebase to a fully linted and buildable state.

**Architecture:** 
1. Delete the unused files `CursorTrail.tsx`, `RuneCursorLayer.tsx`, and `TechCursorLayer.tsx`.
2. Add `public/download_font.js` and `start-brainstorm.js` to `globalIgnores` in `eslint.config.mjs`.
3. Verify linting and build pipeline pass successfully.

**Tech Stack:** Next.js 16, TypeScript, ESLint 9+

---

### Task 1: Delete Unused Cursor Components

**Files:**
- Delete: `components/cursor/CursorTrail.tsx`
- Delete: `components/cursor/RuneCursorLayer.tsx`
- Delete: `components/cursor/TechCursorLayer.tsx`

- [ ] **Step 1: Delete the unused cursor files**

Run the following commands in PowerShell to delete the files:
```powershell
Remove-Item components/cursor/CursorTrail.tsx
Remove-Item components/cursor/RuneCursorLayer.tsx
Remove-Item components/cursor/TechCursorLayer.tsx
```

- [ ] **Step 2: Commit file deletions**

Run:
```bash
git add components/cursor/CursorTrail.tsx components/cursor/RuneCursorLayer.tsx components/cursor/TechCursorLayer.tsx
git commit -m "clean: remove unused cursor files violating React 19 linter rules"
```

---

### Task 2: Exclude Utility Scripts from Linting

**Files:**
- Modify: `eslint.config.mjs`

- [ ] **Step 1: Modify `eslint.config.mjs` to add `public/download_font.js` and `start-brainstorm.js` to `globalIgnores`**

Replace the contents of `eslint.config.mjs` with:
```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/download_font.js",
    "start-brainstorm.js",
  ]),
]);

export default eslintConfig;
```

- [ ] **Step 2: Verify git diff for config modification**

Run:
```bash
git diff eslint.config.mjs
```

- [ ] **Step 3: Commit config modification**

Run:
```bash
git add eslint.config.mjs
git commit -m "chore: ignore public/download_font.js and start-brainstorm.js in eslint"
```

---

### Task 3: Run Verification Checks

- [ ] **Step 1: Run project linter**

Run:
```bash
npm run lint
```
Expected output: No errors, compilation succeeds.

- [ ] **Step 2: Run production build**

Run:
```bash
npm run build
```
Expected output: Next.js project builds successfully (exit code 0).
