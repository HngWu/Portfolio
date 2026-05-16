# Phase 5: High-End Visuals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complex 3D and WebGL visual layers, the CLI terminal overlay, and the "sudo ignite" easter egg.

**Architecture:** We use React Three Fiber (R3F) for the 3D morphing glass object in the hero section. The generative background will be a separate canvas layer using either R3F or standard WebGL shaders. The CLI will be a global draggable panel mounted in the layout.

**Tech Stack:** React Three Fiber, Three.js, GSAP, Zustand.

---

### Task 1: R3F Morphing Glass Background

**Files:**
- Create: `components/canvas/MorphingGlass.tsx`
- Modify: `app/page.tsx` (mount the canvas)

- [ ] **Step 1: Implement MorphingGlass component**
```tsx
"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { MeshPhysicalMaterial, TorusKnotGeometry } from "three"
import { useRef, useMemo } from "react"
import * as THREE from "three"

function GlassObject() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.2
      meshRef.current.rotation.y = time * 0.3
      // Subtle vertex pulse logic would go here or via shader
    }
  })

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 128, 32]} />
      <meshPhysicalMaterial
        transmission={0.95}
        thickness={1.5}
        roughness={0.05}
        ior={1.5}
        color="#0a0a0a"
        envMapIntensity={2}
      />
    </mesh>
  )
}

export function MorphingGlass() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color="#4AFFB4" intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#4A8FFF" intensity={1} />
        <GlassObject />
      </Canvas>
    </div>
  )
}
```

### Task 2: WebGL Generative Background Art

**Files:**
- Create: `components/canvas/GenerativeBackground.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Implement GenerativeBackground**
```tsx
"use client"

import { useEffect, useRef } from "react"

export function GenerativeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const render = () => {
      // Simple particle/noise field logic for Phase 5 validation
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      // Implementation logic...
      animationFrameId = window.requestAnimationFrame(render)
    }

    render()
    return () => window.cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[-1] opacity-[0.05] pointer-events-none" 
    />
  )
}
```

### Task 3: CLI / Terminal Overlay

**Files:**
- Create: `components/cli/TerminalOverlay.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Implement TerminalOverlay component**
```tsx
"use client"

import * as React from "react"
import { useViewModeStore } from "@/store/useViewModeStore"

export function TerminalOverlay() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [input, setInput] = React.useState("")
  const [history, setHistory] = React.useState<string[]>(["Welcome to HW Portfolio CLI. Type 'help' for commands."])

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    const cmd = input.trim().toLowerCase()
    
    if (cmd === "help") {
      setHistory(prev => [...prev, "> help", "Available: projects, experience, clear, sudo ignite"])
    } else if (cmd === "clear") {
      setHistory([])
    } else if (cmd === "sudo ignite") {
      // Easter egg trigger
      setHistory(prev => [...prev, "> sudo ignite", "🔥 Root access granted. Welcome to the real grid."])
    } else {
      setHistory(prev => [...prev, `> ${cmd}`, `Command not found: ${cmd}`])
    }
    
    setInput("")
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
      >
        <span className="text-xs font-mono text-lume-primary">$_</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-lg h-[400px] bg-black/90 border border-white/10 rounded-xl flex flex-col overflow-hidden shadow-2xl">
      <div className="p-2 border-b border-white/10 flex justify-between items-center bg-white/5">
        <span className="text-[10px] font-mono text-white/40 ml-2 uppercase tracking-widest">Terminal</span>
        <button onClick={() => setIsOpen(false)} className="px-2 text-white/40 hover:text-white">×</button>
      </div>
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto flex flex-col gap-1 text-white/70">
        {history.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        <form onSubmit={handleCommand} className="flex items-center gap-2 mt-2">
          <span className="text-lume-primary">{">"}</span>
          <input 
            autoFocus
            className="flex-1 bg-transparent outline-none border-none text-white/90"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </form>
      </div>
    </div>
  )
}
```

### Task 4: Easter Egg — "sudo ignite"

**Files:**
- Create: `hooks/useEasterEgg.ts`
- Modify: `components/cli/TerminalOverlay.tsx`
- Modify: `components/bento/BentoGrid.tsx`

- [ ] **Step 1: Implement useEasterEgg hook**
Manage a global easter egg state in a new Zustand store or existing Navigation store.

- [ ] **Step 2: Implement "ignite" animation sequence**
Use GSAP to ripple the tiles when the easter egg is triggered.
