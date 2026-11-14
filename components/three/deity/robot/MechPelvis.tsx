"use client"

import React from "react"
import * as THREE from "three"
import { useDeityControls } from "@/store/useDeityControls"

interface MechPelvisProps {
  titaniumMaterial: THREE.Material
  darkTitaniumMaterial: THREE.Material
  crownGoldMaterial: THREE.Material
  copperCircuitMaterial: THREE.Material
  energyChassisMaterial: THREE.Material
  chromeMaterial: THREE.Material
  explodedFactor: number
  pPelvis: number
}

export function MechPelvis({
  titaniumMaterial,
  darkTitaniumMaterial,
  crownGoldMaterial,
  copperCircuitMaterial,
  energyChassisMaterial,
  chromeMaterial,
  explodedFactor,
  pPelvis,
}: MechPelvisProps) {
  const kineticPulse = useDeityControls((s) => s.kineticPulse)
  const tassetOffset = 0.22 * explodedFactor + kineticPulse * 0.18

  return (
    <group position={[0, -0.52, 0.06]}>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. Pelvic Saddle Crossbar Chassis                          */}
      {/* ────────────────────────────────────────────────────────── */}
      <mesh material={darkTitaniumMaterial}>
        <boxGeometry args={[0.74, 0.12, 0.22]} />
      </mesh>
      <mesh position={[0, 0.04, 0.02]} material={titaniumMaterial}>
        <boxGeometry args={[0.62, 0.06, 0.2]} />
      </mesh>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. Central Groin Chevron Carapace & Solar Crest            */}
      {/* ────────────────────────────────────────────────────────── */}
      <group position={[0, -0.1, 0.08]}>
        {/* Angular Groin Shield */}
        <mesh rotation={[0.2, 0, 0]} material={darkTitaniumMaterial}>
          <boxGeometry args={[0.22, 0.26, 0.16]} />
        </mesh>
        {/* Gilded Solar Chevron Crest */}
        <mesh position={[0, -0.02, 0.095]} rotation={[0, 0, Math.PI]} material={crownGoldMaterial}>
          <coneGeometry args={[0.07, 0.14, 3]} />
        </mesh>
        {/* Central Power Conduit */}
        <mesh position={[0, 0.06, 0.09]} material={energyChassisMaterial}>
          <boxGeometry args={[0.04, 0.08, 0.015]} />
        </mesh>
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. Dual Spherical Hip Joint Rotational Servos              */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* Left Hip Servo */}
      <group position={[-0.28, -0.1, 0.0]}>
        <mesh material={darkTitaniumMaterial}>
          <sphereGeometry args={[0.11, 16, 16]} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} material={crownGoldMaterial}>
          <torusGeometry args={[0.115, 0.015, 8, 24]} />
        </mesh>
      </group>

      {/* Right Hip Servo */}
      <group position={[0.28, -0.1, 0.0]}>
        <mesh material={darkTitaniumMaterial}>
          <sphereGeometry args={[0.11, 16, 16]} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} material={crownGoldMaterial}>
          <torusGeometry args={[0.115, 0.015, 8, 24]} />
        </mesh>
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. Articulated Flaring Armored Hip Skirts / Tassets        */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* Left Tasset */}
      <group
        position={[-0.44 - tassetOffset, -0.12, 0.04 + tassetOffset * 0.3]}
        rotation={[0.12, 0.1, 0.34]}
      >
        <mesh material={titaniumMaterial}>
          <boxGeometry args={[0.24, 0.38, 0.1]} />
        </mesh>
        <mesh position={[-0.1, 0, 0.045]} material={crownGoldMaterial}>
          <boxGeometry args={[0.03, 0.34, 0.015]} />
        </mesh>
        <mesh position={[0.04, 0, 0.045]} material={copperCircuitMaterial}>
          <boxGeometry args={[0.02, 0.28, 0.015]} />
        </mesh>
      </group>

      {/* Right Tasset */}
      <group
        position={[0.44 + tassetOffset, -0.12, 0.04 + tassetOffset * 0.3]}
        rotation={[0.12, -0.1, -0.34]}
      >
        <mesh material={titaniumMaterial}>
          <boxGeometry args={[0.24, 0.38, 0.1]} />
        </mesh>
        <mesh position={[0.1, 0, 0.045]} material={crownGoldMaterial}>
          <boxGeometry args={[0.03, 0.34, 0.015]} />
        </mesh>
        <mesh position={[-0.04, 0, 0.045]} material={copperCircuitMaterial}>
          <boxGeometry args={[0.02, 0.28, 0.015]} />
        </mesh>
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. Posterior Sacral Armor Cowl                             */}
      {/* ────────────────────────────────────────────────────────── */}
      <mesh position={[0, -0.06, -0.12]} rotation={[-0.2, 0, 0]} material={darkTitaniumMaterial}>
        <boxGeometry args={[0.34, 0.24, 0.1]} />
      </mesh>
    </group>
  )
}
