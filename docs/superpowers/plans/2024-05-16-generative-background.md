# WebGL Generative Background Art Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a Canvas-based generative background art component using React Three Fiber that renders a subtle, atmospheric noise field matching the Lume-Glass theme.

**Architecture:** Use `react-three-fiber` and `three.js` to create a `Points` object with a custom shader (or a noisy vertex manipulation) that moves subtly. The component will be mounted in the root layout with a low opacity and deep z-index.

**Tech Stack:** Next.js, React, Three.js, React Three Fiber.

---

### Task 1: Create GenerativeBackground Component

**Files:**
- Create: `components/canvas/GenerativeBackground.tsx`

- [ ] **Step 1: Implement the GenerativeBackground component**

```tsx
"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useRef, useMemo } from "react"
import * as THREE from "three"

function AmbientField() {
  const pointsRef = useRef<THREE.Points>(null)
  
  // Create a grid of points
  const count = 1500
  const [positions, step] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const s = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
      s[i] = Math.random()
    }
    return [pos, s]
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (pointsRef.current) {
      // Subtle movement
      pointsRef.current.rotation.y = time * 0.05
      pointsRef.current.rotation.x = time * 0.03
      
      const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        // Soft floating effect
        positionsArray[i * 3 + 1] += Math.sin(time * 0.5 + step[i] * 10) * 0.002
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#4AFFB4"
        transparent
        opacity={0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export function GenerativeBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.05]">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <AmbientField />
      </Canvas>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/canvas/GenerativeBackground.tsx
git commit -m "feat: implement GenerativeBackground component"
```

### Task 2: Mount GenerativeBackground in Root Layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Import and add the component to layout**

```tsx
// ... other imports
import { GenerativeBackground } from "@/components/canvas/GenerativeBackground";

// ...
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-[#050505]`}
      >
        <GenerativeBackground />
        <PageCurtain />
        <CommandPalette />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: mount GenerativeBackground in root layout"
```
