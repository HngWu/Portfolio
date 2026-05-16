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
