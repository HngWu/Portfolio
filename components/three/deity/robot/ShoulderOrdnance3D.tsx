"use client"

import React, { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface ShoulderOrdnance3DProps {
  side: "left" | "right"
  titaniumMaterial: THREE.Material
  crownGoldMaterial: THREE.Material
  chromeMaterial: THREE.Material
  visorGlowMaterial: THREE.Material
  isOverdrive?: boolean
}

export function ShoulderOrdnance3D({
  side,
  titaniumMaterial,
  crownGoldMaterial,
  chromeMaterial,
  visorGlowMaterial,
  isOverdrive = false,
}: ShoulderOrdnance3DProps) {
  const isLeft = side === "left"
  const sign = isLeft ? -1 : 1
  const podRef = useRef<THREE.Group>(null)

  // 6 missile launch tube coordinate offsets (2 rows x 3 columns)
  const tubes = [
    { x: -0.05, y: 0.04 },
    { x: 0.0, y: 0.04 },
    { x: 0.05, y: 0.04 },
    { x: -0.05, y: -0.04 },
    { x: 0.0, y: -0.04 },
    { x: 0.05, y: -0.04 },
  ]

  useFrame((state, delta) => {
    // Subtle idle stabilization pitch
    if (podRef.current) {
      const t = state.clock.getElapsedTime()
      podRef.current.rotation.x = -0.15 + Math.sin(t * 1.5 + (isLeft ? 0 : Math.PI)) * 0.02
    }
  })

  const glowColor = isOverdrive ? "#A855F7" : "#00F0FF"

  return (
    <group
      ref={podRef}
      name={`shoulder-ordnance-${side}`}
      userData={{ shoulderOrdnance: true, side, isOverdrive }}
      position={[sign * 0.08, 0.28, 0.02]}
      rotation={[-0.15, sign * 0.15, sign * 0.08]}
      dispose={null}
    >
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. ARMORED ORDNANCE POD CHASSIS                            */}
      {/* ────────────────────────────────────────────────────────── */}
      <mesh material={titaniumMaterial}>
        <boxGeometry args={[0.22, 0.16, 0.34]} />
      </mesh>

      {/* Pauldron Mounting Strut */}
      <mesh position={[0, -0.1, -0.04]} material={chromeMaterial}>
        <cylinderGeometry args={[0.025, 0.035, 0.1, 12]} />
      </mesh>

      {/* Gold Hazard Trim Facets */}
      <mesh position={[sign * 0.115, 0, 0]} material={crownGoldMaterial}>
        <boxGeometry args={[0.015, 0.15, 0.32]} />
      </mesh>
      <mesh position={[0, 0.085, 0]} material={crownGoldMaterial}>
        <boxGeometry args={[0.21, 0.015, 0.32]} />
      </mesh>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. FORWARD 6-TUBE MISSILE BATTERY ARRAY                    */}
      {/* ────────────────────────────────────────────────────────── */}
      {tubes.map((tube, i) => (
        <group key={i} position={[tube.x, tube.y, 0.17]}>
          {/* Outer Tube Rim */}
          <mesh material={chromeMaterial} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.04, 12]} />
          </mesh>
          {/* Recessed Ignition Core */}
          <mesh position={[0, 0, -0.01]}>
            <circleGeometry args={[0.016, 12]} />
            <meshBasicMaterial color={glowColor} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. REAR EXHAUST / PLASMA PURGE PORTS                       */}
      {/* ────────────────────────────────────────────────────────── */}
      <mesh position={[0, 0, -0.175]} material={titaniumMaterial}>
        <boxGeometry args={[0.18, 0.12, 0.02]} />
      </mesh>
      <mesh position={[-0.04, 0, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.03, 12]} />
        <meshBasicMaterial color={glowColor} toneMapped={false} />
      </mesh>
      <mesh position={[0.04, 0, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.03, 12]} />
        <meshBasicMaterial color={glowColor} toneMapped={false} />
      </mesh>
    </group>
  )
}
