"use client"

import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useDeityControls } from "@/store/useDeityControls"

interface MechHeadProps {
  titaniumMaterial: THREE.Material
  darkTitaniumMaterial: THREE.Material
  crownGoldMaterial: THREE.Material
  copperCircuitMaterial: THREE.Material
  energyChassisMaterial: THREE.Material
  visorGlowMaterial: THREE.Material
  chromeMaterial: THREE.Material
  isOverdrive: boolean
  isCad: boolean
  pHead: number
}

export function MechHead({
  titaniumMaterial,
  darkTitaniumMaterial,
  crownGoldMaterial,
  copperCircuitMaterial,
  energyChassisMaterial,
  visorGlowMaterial,
  chromeMaterial,
  isOverdrive,
  isCad,
  pHead,
}: MechHeadProps) {
  const headRootRef = useRef<THREE.Group>(null)
  const crownGroupRef = useRef<THREE.Group>(null)
  const aureoleRef = useRef<THREE.Group>(null)
  const thirdEyeRef = useRef<THREE.Mesh>(null)
  const opticalGazeRef = useRef<THREE.Mesh>(null)

  const kineticPulse = useDeityControls((s) => s.kineticPulse)

  // 13 Radiant Sunburst Aureole Spikes (Cathedral Halo)
  const aureoleRays = useMemo(() => {
    return Array.from({ length: 13 }, (_, i) => {
      // Fan across -110 deg to +110 deg
      const angle = -Math.PI * 0.62 + (i * (Math.PI * 1.24)) / 12
      const radius = 0.52
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius + 0.18
      const rotZ = angle - Math.PI / 2
      const length = 0.38 + Math.sin(i * 0.45) * 0.12
      return { id: i, x, y, rotZ, length }
    })
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    const pointer = state.pointer
    const speed = delta * 4.5

    // ──────────────────────────────────────────────────────────
    // 1. Autonomous Hierarchical 3D Cursor Gaze Tracking
    // ──────────────────────────────────────────────────────────
    if (headRootRef.current) {
      // Resting solemn downward gaze looking at the mortal observer (0.08 rad)
      const basePitch = 0.08
      const targetPitch = THREE.MathUtils.clamp(
        basePitch - pointer.y * 0.24 - kineticPulse * 0.18,
        -0.2,
        0.36
      )
      const targetYaw = THREE.MathUtils.clamp(pointer.x * 0.42, -0.48, 0.48)
      const targetRoll = -pointer.x * 0.09

      headRootRef.current.rotation.x = THREE.MathUtils.lerp(
        headRootRef.current.rotation.x,
        targetPitch,
        speed
      )
      headRootRef.current.rotation.y = THREE.MathUtils.lerp(
        headRootRef.current.rotation.y,
        targetYaw,
        speed
      )
      headRootRef.current.rotation.z = THREE.MathUtils.lerp(
        headRootRef.current.rotation.z,
        targetRoll,
        speed
      )
    }

    // ──────────────────────────────────────────────────────────
    // 2. Cathedral Aureole Gentle Sway & Precession
    // ──────────────────────────────────────────────────────────
    if (aureoleRef.current) {
      const sway = Math.sin(t * 1.2) * 0.03
      aureoleRef.current.rotation.z = sway
      aureoleRef.current.rotation.y = Math.sin(t * 0.8) * 0.04
    }

    // ──────────────────────────────────────────────────────────
    // 3. Floating Archon Crown Precession
    // ──────────────────────────────────────────────────────────
    if (crownGroupRef.current) {
      crownGroupRef.current.position.y = 0.68 + Math.sin(t * 1.6) * 0.04
      crownGroupRef.current.rotation.y += delta * 0.4 * (isOverdrive ? 3.5 : 1)
    }

    // ──────────────────────────────────────────────────────────
    // 4. Transcendent Third Eye Pulse & Dynamic Click Flare
    // ──────────────────────────────────────────────────────────
    const eyeScale =
      pHead < 0.7
        ? 0
        : (0.9 + Math.sin(t * 3.5) * 0.18) * (1.0 + kineticPulse * 0.8)
    if (thirdEyeRef.current) {
      thirdEyeRef.current.scale.set(eyeScale, eyeScale, eyeScale)
    }
    if (opticalGazeRef.current) {
      const gazePulse =
        pHead < 0.7
          ? 0
          : (0.85 + Math.sin(t * 5.0) * 0.15) * (1.0 + kineticPulse * 0.6)
      opticalGazeRef.current.scale.set(1, gazePulse, 1)
    }
  })

  return (
    <group ref={headRootRef} position={[0, 0, 0]}>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. Sacred Monolithic Obsidian & Gold Divine Mask           */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* Central Mask Carapace (Polished Dark Obsidian) */}
      <mesh position={[0, 0.04, 0.12]} rotation={[0.08, 0, 0]} material={darkTitaniumMaterial}>
        <boxGeometry args={[0.26, 0.36, 0.22]} />
      </mesh>

      {/* Sloped High Cranial Dome */}
      <mesh position={[0, 0.22, -0.04]} rotation={[-0.15, 0, 0]} material={titaniumMaterial}>
        <boxGeometry args={[0.3, 0.24, 0.32]} />
      </mesh>

      {/* Chiseled Divine Cheekbone Planes (Left & Right) */}
      <mesh position={[-0.14, 0.02, 0.13]} rotation={[0.08, -0.25, 0.12]} material={titaniumMaterial}>
        <boxGeometry args={[0.07, 0.28, 0.16]} />
      </mesh>
      <mesh position={[0.14, 0.02, 0.13]} rotation={[0.08, 0.25, -0.12]} material={titaniumMaterial}>
        <boxGeometry args={[0.07, 0.28, 0.16]} />
      </mesh>

      {/* Solemn Tapered Ceremonial Chin Cowl */}
      <mesh position={[0, -0.16, 0.18]} rotation={[0.2, 0, 0]} material={crownGoldMaterial}>
        <boxGeometry args={[0.1, 0.14, 0.12]} />
      </mesh>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. Celestial Transcendent Optical Gaze & Third Eye         */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* Piercing Horizontal Celestial Gaze Slit */}
      <mesh ref={opticalGazeRef} position={[0, 0.06, 0.235]} material={visorGlowMaterial}>
        <boxGeometry args={[0.3, 0.016, 0.02]} />
      </mesh>

      {/* Central Third Eye Radiant Node (Octahedron Diamond) */}
      <group position={[0, 0.13, 0.23]}>
        <mesh material={crownGoldMaterial}>
          <boxGeometry args={[0.05, 0.05, 0.03]} />
        </mesh>
        <mesh ref={thirdEyeRef} position={[0, 0, 0.02]} material={visorGlowMaterial}>
          <octahedronGeometry args={[0.032]} />
        </mesh>
      </group>

      {/* Axial Vertical Energy Seam running down the center of the mask */}
      <mesh position={[0, -0.04, 0.232]} material={visorGlowMaterial}>
        <boxGeometry args={[0.012, 0.18, 0.015]} />
      </mesh>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. Radiant Cathedral Aureole (Sacred Sunburst Halo)        */}
      {/* ────────────────────────────────────────────────────────── */}
      <group ref={aureoleRef} position={[0, 0.08, -0.12]}>
        {/* Inner Aureole Halo Arch */}
        <mesh material={crownGoldMaterial}>
          <torusGeometry args={[0.48, 0.018, 12, 48, Math.PI * 1.3]} />
        </mesh>

        {/* Mid Halo Ring with Runic Glyphs */}
        <mesh material={crownGoldMaterial}>
          <torusGeometry args={[0.62, 0.012, 8, 48, Math.PI * 1.3]} />
        </mesh>

        {/* 13 Radiant Golden Sunburst Spikes */}
        {aureoleRays.map((ray) => (
          <group key={ray.id} position={[ray.x, ray.y, 0]} rotation={[0, 0, ray.rotZ]}>
            {/* Tapered Golden Ray */}
            <mesh position={[0, ray.length * 0.5, 0]} material={crownGoldMaterial}>
              <coneGeometry args={[0.024, ray.length, 4]} />
            </mesh>
            {/* Celestial Radiant Diamond Finial */}
            <mesh position={[0, ray.length + 0.03, 0]} material={visorGlowMaterial}>
              <octahedronGeometry args={[0.022]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. Ceremonial Fluted Nemes / Seraphic Head Cowl            */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* Left Nemes Flange */}
      <group position={[-0.19, 0.08, 0.02]} rotation={[0.1, -0.12, 0.18]}>
        <mesh material={titaniumMaterial}>
          <boxGeometry args={[0.08, 0.38, 0.22]} />
        </mesh>
        <mesh position={[-0.045, 0, 0]} material={crownGoldMaterial}>
          <boxGeometry args={[0.015, 0.34, 0.18]} />
        </mesh>
      </group>

      {/* Right Nemes Flange */}
      <group position={[0.19, 0.08, 0.02]} rotation={[0.1, 0.12, -0.18]}>
        <mesh material={titaniumMaterial}>
          <boxGeometry args={[0.08, 0.38, 0.22]} />
        </mesh>
        <mesh position={[0.045, 0, 0]} material={crownGoldMaterial}>
          <boxGeometry args={[0.015, 0.34, 0.18]} />
        </mesh>
      </group>

      {/* Temple Celestial Mandalas */}
      <group position={[-0.18, 0.04, 0.08]} rotation={[0, 0, Math.PI / 2]}>
        <mesh material={crownGoldMaterial}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
        </mesh>
        <mesh position={[0, 0.015, 0]} material={energyChassisMaterial}>
          <cylinderGeometry args={[0.025, 0.025, 0.01, 12]} />
        </mesh>
      </group>

      <group position={[0.18, 0.04, 0.08]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh material={crownGoldMaterial}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
        </mesh>
        <mesh position={[0, 0.015, 0]} material={energyChassisMaterial}>
          <cylinderGeometry args={[0.025, 0.025, 0.01, 12]} />
        </mesh>
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. Braided Golden Neural Conduits                          */}
      {/* ────────────────────────────────────────────────────────── */}
      {[-0.1, -0.04, 0.04, 0.1].map((x, i) => (
        <mesh key={i} position={[x, -0.16, -0.1]} rotation={[-0.4, 0, 0]} material={copperCircuitMaterial}>
          <cylinderGeometry args={[0.016, 0.016, 0.28, 8]} />
        </mesh>
      ))}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 6. Floating Archon Crown of Light                          */}
      {/* ────────────────────────────────────────────────────────── */}
      <group ref={crownGroupRef} position={[0, 0.68, 0]}>
        <mesh material={crownGoldMaterial}>
          <torusGeometry args={[0.38, 0.02, 12, 32]} />
        </mesh>
        <mesh material={crownGoldMaterial}>
          <torusGeometry args={[0.48, 0.01, 8, 40]} />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i * Math.PI * 2) / 8
          const x = Math.cos(angle) * 0.38
          const z = Math.sin(angle) * 0.38
          return (
            <mesh key={i} position={[x, 0.1, z]} rotation={[0, -angle, 0]} material={crownGoldMaterial}>
              <coneGeometry args={[0.025, 0.22, 4]} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}
