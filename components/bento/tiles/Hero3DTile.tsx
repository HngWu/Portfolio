"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"
import { BentoTile } from "../BentoTile"

function GlassObject() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
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

export function Hero3DTile({ id, size }: { id: string; size: string }) {
  return (
    <BentoTile id={id} size={size} className="p-0 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} color="#4AFFB4" intensity={1} />
          <pointLight position={[-10, -10, -10]} color="#4A8FFF" intensity={1} />
          <GlassObject />
        </Canvas>
      </div>
      <div className="relative z-10 p-6 pointer-events-none">
        <div className="text-[0.6875rem] font-mono tracking-widest text-lume-primary uppercase">3D Visualization</div>
      </div>
    </BentoTile>
  )
}