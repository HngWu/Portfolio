# Mobile Orchestrator Fixed Height & Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 3D tile placeholder display/drag behavior and grid gap spacing in the admin mobile layout simulator.

**Architecture:** Use a `forceFullHeight` prop on `BentoTile` to bypass mobile height auto-collapsing. Use `ForceMobileContext` inside `BentoGrid` to dynamically clean up desktop responsive classes (md: and xl:).

**Tech Stack:** React, Tailwind CSS, TypeScript.

---

### Task 1: BentoTile Fixed Height Support

**Files:**
- Modify: `components/bento/BentoTile.tsx`

- [ ] **Step 1: Update BentoTileProps interface**

Modify the interface around line 11 to include `forceFullHeight?: boolean`:
```typescript
interface BentoTileProps {
  id: string
  size: string // Base size like '4x2'
  href?: string
  glowColor?: "mint" | "blue" | "pink" | "amber" | "none"
  className?: string
  children: React.ReactNode // Usually the Quick Pitch content
  deepContent?: React.ReactNode // Content for the back of the card
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
  canDeepDive?: boolean
  canMorph?: boolean
  canExpand?: boolean
  layout?: boolean | "position" | "size"
  noPadding?: boolean
  forceFullHeight?: boolean
}
```

- [ ] **Step 2: Destructure forceFullHeight in component signature**

Modify the BentoTile component signature to destructure `forceFullHeight = false`:
```typescript
export function BentoTile({
  id,
  size,
  href,
  glowColor = "none",
  className,
  children,
  deepContent,
  isDragging,
  sortableProps,
  canDeepDive = true,
  canMorph = true,
  canExpand = true,
  layout = true,
  noPadding = false,
  forceFullHeight = false,
}: BentoTileProps) {
```

- [ ] **Step 3: Override mobile height styling when forceFullHeight is true**

Update `layout`, `style`, and `className` logic in BentoTile to preserve height classes:
```typescript
  return (
    <motion.div
      layout={isMobileOverride ? false : layout}
      whileHover={!sortableProps ? { scale: 1.01, translateY: -4 } : undefined}
      transition={{ 
        layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
        scale: { duration: 0.4, ease: "easeOut" },
        translateY: { duration: 0.4, ease: "easeOut" }
      }}
      style={{
        ...(dynamicRows ? { gridRow: `span ${dynamicRows}` } : {}),
        ...(isMobileOverride && !forceFullHeight ? { gridRow: "auto" } : {})
      }}
      className={cn(
        spanClass, 
        isMobileOverride && !forceFullHeight ? "h-auto" : "h-full",
        "perspective-[1500px]", 
        isDragging ? "touch-none opacity-30" : "touch-pan-y",
        className
      )}
      {...sortableProps}
    >
      <motion.div
        animate={{ rotateY: isDeepDive ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className={cn("relative w-full preserve-3d", isMobileOverride && !forceFullHeight ? "h-auto" : "h-full")}
      >
        {/* Front Face (Quick Pitch) */}
        <div className={cn("backface-hidden z-10 w-full", isMobileOverride && !forceFullHeight ? (isDeepDive ? "absolute inset-0 h-0 overflow-hidden" : "relative h-auto") : "absolute inset-0 h-full")}>
          <GlassCard
            ref={ref}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            glowColor={glowColor}
            onClick={handleClick}
            interactive={!isDragging}
            data-id={id}
            className={cn(
              noPadding ? "p-0" : "p-4 md:p-6",
              "flex flex-col",
              isMobileOverride && !forceFullHeight ? "h-auto" : "h-full",
              isClickable && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lume-primary",
              className
            )}
          >
            {children}
            {isClickable && !href?.startsWith("http") && (
              <div className="absolute bottom-0 right-4 z-20 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 flex items-center gap-2 text-xs font-mono text-white/50 pointer-events-none">
                <span>View Details</span>
                <span>→</span>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Back Face (Deep Dive) */}
        <div className={cn("backface-hidden rotate-y-180 z-0 w-full", isMobileOverride && !forceFullHeight ? (isDeepDive ? "relative h-auto" : "absolute inset-0 h-0 overflow-hidden") : "absolute inset-0 h-full")}>
          <GlassCard
            glowColor={glowColor}
            onClick={handleClick}
            interactive={!isDragging}
            className={cn(
              noPadding ? "p-0" : "p-4 md:p-6",
              "flex flex-col bg-lume-secondary/5 border-lume-secondary/20",
              isMobileOverride && !forceFullHeight ? "h-auto" : "h-full",
              isClickable && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lume-primary",
              className
            )}
          >
            <div ref={backRef} className={cn("w-full", canMorph ? "h-fit" : "h-full flex flex-col flex-1")}>
              {deepContent || (
                <div className="flex flex-col h-full justify-center items-center text-center opacity-40 italic">
                  <span className="text-xs font-mono uppercase tracking-widest">Enhanced Insight</span>
                  <p className="text-[10px] mt-2">Deep dive content coming soon.</p>
                </div>
              )}
            </div>
            {isClickable && !href?.startsWith("http") && (
              <div className="absolute bottom-0 right-4 z-20 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 flex items-center gap-2 text-xs font-mono text-white/50 pointer-events-none">
                <span>View Details</span>
                <span>→</span>
              </div>
            )}
          </GlassCard>
        </div>
      </motion.div>
    </motion.div>
```

- [ ] **Step 4: Commit changes**

```bash
git add components/bento/BentoTile.tsx
git commit -m "feat(bento): add forceFullHeight prop to BentoTile to prevent mobile layout collapse"
```

---

### Task 2: Hero3DTile Fixed Height Integration

**Files:**
- Modify: `components/bento/tiles/Hero3DTile.tsx`

- [ ] **Step 1: Set forceFullHeight to true in BentoTile call**

Modify the BentoTile rendering inside Hero3DTile:
```typescript
  return (
    <BentoTile 
      id={id} 
      size={size} 
      className="p-0 bg-transparent overflow-hidden h-[320px] md:h-full" 
      isDragging={isDragging} 
      sortableProps={sortableProps}
      canDeepDive={false}
      canMorph={false}
      noPadding={true}
      forceFullHeight={true}
    >
```

- [ ] **Step 2: Commit changes**

```bash
git add components/bento/tiles/Hero3DTile.tsx
git commit -m "feat(bento): enable forceFullHeight on Hero3DTile"
```

---

### Task 3: BentoGrid Dynamic Spacing Fix

**Files:**
- Modify: `components/bento/BentoGrid.tsx`

- [ ] **Step 1: Import ForceMobileContext and useContext**

At the top of BentoGrid.tsx:
```typescript
import { ForceMobileContext } from "./ForceMobileContext"
```

- [ ] **Step 2: Read context and clean responsive class prefixes**

```typescript
export function BentoGrid({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { isIgnited } = useIgniteStore()
  const forceMobile = React.useContext(ForceMobileContext)
  const gridRef = React.useRef<HTMLDivElement>(null)
  const flashRef = React.useRef<HTMLDivElement>(null)
  const prevIgnited = React.useRef(isIgnited)
  ...
```

Update the JSX grid className construction:
```typescript
  const baseGridClasses = "grid grid-cols-2 md:grid-cols-6 xl:grid-cols-12 auto-rows-[minmax(60px,auto)] grid-flow-dense gap-2 md:gap-3 xl:gap-4 max-w-[1440px] mx-auto w-full px-2"
  const gridClasses = forceMobile
    ? baseGridClasses.split(' ').filter(c => !c.startsWith('md:') && !c.startsWith('xl:')).join(' ')
    : baseGridClasses

  return (
    <div className="relative">
      {/* Flash Overlay */}
      <div 
        ref={flashRef}
        className="fixed inset-0 bg-white pointer-events-none z-[100] opacity-0"
      />
      
      <div className="w-full relative" ref={gridRef}>
        <div
          className={cn(
            gridClasses,
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
```

- [ ] **Step 3: Commit changes**

```bash
git add components/bento/BentoGrid.tsx
git commit -m "feat(bento): strip desktop responsive classes from BentoGrid in simulated mobile view"
```

---

### Task 4: Clean Up Admin Layout Page BentoGrid Overrides

**Files:**
- Modify: `app/admin/tiles/page.tsx`

- [ ] **Step 1: Remove custom grid-cols class overrides in mobile layout**

Remove the custom Tailwind overrides passed to BentoGrid at line 252:
```typescript
                  <BentoGrid className={cn(layoutMode === 'mobile' && "max-w-[480px]")}>
```

- [ ] **Step 2: Commit changes**

```bash
git add app/admin/tiles/page.tsx
git commit -m "refactor(admin): remove manual mobile layout grid-cols overrides on BentoGrid"
```

---

### Task 5: Compilation and Production Build Check

- [ ] **Step 1: Run TypeScript compiler check**

Run: `npx tsc --noEmit`
Expected: exit code 0, no errors.

- [ ] **Step 2: Run production build check**

Run: `npm run build`
Expected: exit code 0, all routes compiled cleanly.
