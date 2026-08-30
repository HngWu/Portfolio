"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { useViewModeStore } from "@/store/useViewModeStore"

// WebGL can't read CSS variables, so we map the mode → hex directly. These
// mirror --mode-accent in globals.css so the point field recolors with the
// gold/blue theme.
const MODE_COLOR: Record<"quick" | "deep", string> = {
  quick: "#C9A227", // burnished gold
  deep: "#4A8FFF", // electric blueprint blue
}

function Scene() {
  const count = 1500
  const mode = useViewModeStore((s) => s.mode)
  const isVisibleRef = useRef(true)

  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden
    }
    handleVisibilityChange()
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // Use a deterministic pseudo-random generator to satisfy React's purity rules
  // Simple LCG (Linear Generator)
  const [pos, s] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const s = new Float32Array(count)
    let seed = 12345
    const pseudoRandom = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (pseudoRandom() - 0.5) * 20
      pos[i * 3 + 1] = (pseudoRandom() - 0.5) * 20
      pos[i * 3 + 2] = (pseudoRandom() - 0.5) * 10
      s[i] = pseudoRandom()
    }
    return [pos, s]
  }, [])

  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.PointsMaterial>(null)

  useFrame(() => {
    if (!isVisibleRef.current || (typeof document !== "undefined" && document.hidden)) {
      return
    }
    const time = performance.now() / 1000
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.05
      pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[pos, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[s, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.015}
        color={MODE_COLOR[mode]}
        transparent
        sizeAttenuation
      />
    </points>
  )
}

export function GenerativeBackground() {
  return (
    <div className="fixed inset-0 z-[-10] opacity-[0.05] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={1.0}>
        <Scene />
      </Canvas>
    </div>
  )
}
