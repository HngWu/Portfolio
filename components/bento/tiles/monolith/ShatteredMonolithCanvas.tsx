"use client"

import React, { Suspense, useRef, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"
import { ShatteredMonolithScene } from "./ShatteredMonolithScene"

interface ShatteredMonolithCanvasProps {
  isActive?: boolean
  viewMode?: "quick-pitch" | "deep-dive"
  isIgnited?: boolean
  isLockdown?: boolean
  shatterImpulse?: number
  onTelemetry?: (data: { shardCount: number; tension: number; activeArcs: number }) => void
}

function ResponsiveCamera() {
  const { camera, size } = useThree()

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const aspect = size.width / (size.height || 1)
      camera.aspect = aspect
      // Dynamic camera distance to keep the full monolith in frame on mobile
      const baseDist = 8.5
      camera.position.z = aspect < 1.0 ? baseDist / Math.max(aspect, 0.65) : baseDist
      camera.updateProjectionMatrix()
    }
  }, [camera, size.width, size.height])

  return null
}

export default function ShatteredMonolithCanvas({
  isActive = false,
  viewMode = "quick-pitch",
  isIgnited = false,
  isLockdown = false,
  shatterImpulse = 0,
  onTelemetry,
}: ShatteredMonolithCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative w-full h-full select-none">
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 42 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
      >
        <ResponsiveCamera />

        {/* Ambient & Directional Lighting for Basalt Stone Grain & Specular Glints */}
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 8, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-6, -4, -3]} intensity={0.9} color="#6688aa" />
        <directionalLight position={[0, -6, 4]} intensity={0.4} color="#ffb44a" />

        <Suspense fallback={null}>
          <ShatteredMonolithScene
            isActive={isActive}
            viewMode={viewMode}
            isIgnited={isIgnited}
            isLockdown={isLockdown}
            shatterImpulse={shatterImpulse}
            onTelemetry={onTelemetry}
          />

          <EffectComposer multisampling={4}>
            <Bloom
              luminanceThreshold={0.32}
              luminanceSmoothing={0.75}
              intensity={1.25}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  )
}
