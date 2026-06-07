# Spec: Mobile Layout Orchestrator 3D Placeholder and Spacing Fixes

Resolve layout collapse of fixed-height tiles (specifically the 3D tile placeholder/drag issue) and align grid spacing inside the simulated mobile preview of the admin layout dashboard.

## 1. Goals
* Fix the 3D tile placeholder collapsing to 0 height in the admin mobile preview mode.
* Enable dragging of the 3D tile in the mobile preview mode.
* Align the grid spacing (gap) in the mobile preview mode to match actual mobile devices (8px / `gap-2`).

## 2. Proposed Changes

### 2.1 BentoTile & Hero3DTile Fixed Height Support
* Introduce `forceFullHeight?: boolean` prop in `BentoTileProps` to bypass the `h-auto` collapse on mobile viewport simulations.
* Use `forceFullHeight` to force `h-full` and `absolute inset-0 h-full` on inner card components.
* Pass `forceFullHeight={true}` inside `Hero3DTile`.

### 2.2 BentoGrid Spacing & Gap Corrections
* Read `ForceMobileContext` inside `BentoGrid`.
* If `forceMobile` is true, dynamically strip out all desktop responsive class prefixes (starts with `md:` or `xl:`) from the grid wrapper classes. This forces the grid to utilize `grid-cols-2` and `gap-2` instead of desktop sizing and gaps.
* Remove manual grid overrides in `app/admin/tiles/page.tsx`.

## 3. Verification Plan
* Validate typescript compilation using `npx tsc --noEmit`.
* Validate page production build using `npm run build`.
