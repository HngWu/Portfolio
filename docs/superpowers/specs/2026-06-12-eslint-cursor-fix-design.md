# Design Specification: ESLint & React 19 Cursor Errors Fix

## 1. Goal
Resolve all current ESLint compile-blocking errors in the project to restore a clean, buildable state.

## 2. Scope & Requirements
- **Cleanup**: Delete unused files `CursorTrail.tsx`, `RuneCursorLayer.tsx`, and `TechCursorLayer.tsx` from `components/cursor/` since they are remnant assets of a reverted feature and violate React 19 linter rules.
- **Config**: Add utility scripts `public/download_font.js` and `start-brainstorm.js` to the ESLint ignore configuration.
- **Verification**: Run `npm run lint` and `npm run build` to confirm the project builds without errors.

## 3. Architecture & Design

### 3.1 Unused Code Deletion
The files below will be removed from the filesystem:
- `components/cursor/CursorTrail.tsx`
- `components/cursor/RuneCursorLayer.tsx`
- `components/cursor/TechCursorLayer.tsx`

### 3.2 ESLint Ignoring
We will modify [eslint.config.mjs](file:///C:/Projects/Portfolio/eslint.config.mjs) to exclude:
- `public/download_font.js`
- `start-brainstorm.js`

This keeps local Node.js development utility scripts out of the Next.js/React compilation lint flow.

## 4. Verification Plan
- Run `npm run lint` to confirm 0 errors.
- Run `npm run build` to confirm compilation success.
