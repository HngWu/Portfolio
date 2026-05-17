"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"

function GlassObject() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    const time = performance.now() / 1000
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.2
      meshRef.current.rotation.y = time * 0.3
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
