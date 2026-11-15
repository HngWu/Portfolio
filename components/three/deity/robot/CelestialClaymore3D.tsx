"use client"

import React, { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useDeityControls } from "@/store/useDeityControls"

interface CelestialClaymore3DProps {
  titaniumMaterial: THREE.Material
  crownGoldMaterial: THREE.Material
  chromeMaterial: THREE.Material
  visorGlowMaterial: THREE.Material
  isOverdrive?: boolean
  className?: string
}

export function CelestialClaymore3D({
  titaniumMaterial,
  crownGoldMaterial,
  chromeMaterial,
  visorGlowMaterial,
  isOverdrive = false,
}: CelestialClaymore3DProps) {
  const claymoreRootRef = useRef<THREE.Group>(null)
  const plasmaCoreRef = useRef<THREE.Mesh>(null)
  const tipRef = useRef<THREE.Mesh>(null)
  const socketRef = useRef<THREE.Mesh>(null)

  const kineticPulse = useDeityControls((s) => s.kineticPulse)

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    // 1. Plasma core rhythmic high-frequency pulse
    if (plasmaCoreRef.current) {
      const pulseScale = 1.0 + Math.sin(t * 12.0) * 0.08 + kineticPulse * 0.4
      plasmaCoreRef.current.scale.set(
        pulseScale * (isOverdrive ? 1.4 : 1.0),
        1.0,
        pulseScale * (isOverdrive ? 1.4 : 1.0)
      )
    }

    // 2. Crossguard socket singularity rotation
    if (socketRef.current) {
      socketRef.current.rotation.z += delta * (isOverdrive ? 6.0 : 2.5)
    }
  })

  const plasmaColor = isOverdrive ? "#A855F7" : "#00F0FF"
  const edgeGlowColor = isOverdrive ? "#F472B6" : "#6AFFFF"

  return (
    <group
      ref={claymoreRootRef}
      name="celestial-claymore"
      userData={{ celestialClaymore: true, isOverdrive }}
      dispose={null}
    >
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. CENTRAL HIGH-FREQUENCY PLASMA CORE BEAM                 */}
      {/* ────────────────────────────────────────────────────────── */}
      <mesh ref={plasmaCoreRef} position={[0, 1.15, 0]}>
        <boxGeometry args={[0.07, 2.1, 0.024]} />
        <meshBasicMaterial color={plasmaColor} toneMapped={false} />
      </mesh>

      {/* Plasma Core Secondary Aura */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.11, 2.05, 0.038]} />
        <meshBasicMaterial
          color={edgeGlowColor}
          transparent
          opacity={isOverdrive ? 0.75 : 0.45}
          toneMapped={false}
        />
      </mesh>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. DOUBLE-EDGED TITANIUM CUTTING BLADES & CHAMFERS        */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* Left Cutting Edge */}
      <mesh position={[-0.095, 1.1, 0]} rotation={[0, 0, 0.012]} material={titaniumMaterial}>
        <boxGeometry args={[0.07, 2.05, 0.032]} />
      </mesh>

      {/* Right Cutting Edge */}
      <mesh position={[0.095, 1.1, 0]} rotation={[0, 0, -0.012]} material={titaniumMaterial}>
        <boxGeometry args={[0.07, 2.05, 0.032]} />
      </mesh>

      {/* Gold Inlaid Edge Trim (Left) */}
      <mesh position={[-0.13, 1.08, 0]} material={crownGoldMaterial}>
        <boxGeometry args={[0.02, 1.95, 0.022]} />
      </mesh>

      {/* Gold Inlaid Edge Trim (Right) */}
      <mesh position={[0.13, 1.08, 0]} material={crownGoldMaterial}>
        <boxGeometry args={[0.02, 1.95, 0.022]} />
      </mesh>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. DIAMOND PIERCING BLADE TIP                              */}
      {/* ────────────────────────────────────────────────────────── */}
      <mesh
        ref={tipRef}
        position={[0, 2.22, 0]}
        rotation={[0, 0, Math.PI / 4]}
        material={crownGoldMaterial}
      >
        <boxGeometry args={[0.14, 0.14, 0.03]} />
      </mesh>
      {/* Luminous Point Emitter at Tip */}
      <mesh position={[0, 2.32, 0]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshBasicMaterial color={edgeGlowColor} toneMapped={false} />
      </mesh>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. CEREMONIAL WINGED CROSSGUARD (ARCHON QUILONS)           */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* Main Guard Block */}
      <mesh position={[0, 0.06, 0]} material={crownGoldMaterial}>
        <boxGeometry args={[0.54, 0.12, 0.12]} />
      </mesh>

      {/* Left Upward Swept Quillon Wing */}
      <mesh position={[-0.32, 0.18, 0]} rotation={[0, 0, 0.45]} material={titaniumMaterial}>
        <boxGeometry args={[0.22, 0.09, 0.09]} />
      </mesh>
      <mesh position={[-0.41, 0.28, 0]} rotation={[0, 0, 0.8]} material={crownGoldMaterial}>
        <boxGeometry args={[0.14, 0.06, 0.06]} />
      </mesh>

      {/* Right Upward Swept Quillon Wing */}
      <mesh position={[0.32, 0.18, 0]} rotation={[0, 0, -0.45]} material={titaniumMaterial}>
        <boxGeometry args={[0.22, 0.09, 0.09]} />
      </mesh>
      <mesh position={[0.41, 0.28, 0]} rotation={[0, 0, -0.8]} material={crownGoldMaterial}>
        <boxGeometry args={[0.14, 0.06, 0.06]} />
      </mesh>

      {/* Guard Micro Singularity Core Socket */}
      <mesh ref={socketRef} position={[0, 0.06, 0.065]}>
        <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
        <meshBasicMaterial color={plasmaColor} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.06, -0.065]}>
        <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
        <meshBasicMaterial color={plasmaColor} toneMapped={false} />
      </mesh>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. HILT, KNURLED GRIP & COUNTERWEIGHT POMMEL               */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* Main Two-Handed Grip Cylinder */}
      <mesh position={[0, -0.38, 0]} material={chromeMaterial}>
        <cylinderGeometry args={[0.036, 0.038, 0.72, 16]} />
      </mesh>

      {/* Titanium Grip Ring Bands */}
      {[-0.15, -0.32, -0.5, -0.68].map((yOffset) => (
        <mesh key={yOffset} position={[0, yOffset, 0]} material={titaniumMaterial}>
          <cylinderGeometry args={[0.044, 0.044, 0.03, 16]} />
        </mesh>
      ))}

      {/* Heavy Octagonal Pommel Counterweight */}
      <mesh position={[0, -0.82, 0]} material={crownGoldMaterial}>
        <dodecahedronGeometry args={[0.08]} />
      </mesh>
      {/* Pommel Radiant Spike Tip */}
      <mesh position={[0, -0.92, 0]} rotation={[0, 0, Math.PI]} material={titaniumMaterial}>
        <coneGeometry args={[0.04, 0.12, 12]} />
      </mesh>
    </group>
  )
}
