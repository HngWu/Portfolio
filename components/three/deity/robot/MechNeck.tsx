"use client"

import React from "react"
import * as THREE from "three"

interface MechNeckProps {
  titaniumMaterial: THREE.Material
  darkTitaniumMaterial: THREE.Material
  crownGoldMaterial: THREE.Material
  copperCircuitMaterial: THREE.Material
  chromeMaterial: THREE.Material
  energyChassisMaterial: THREE.Material
  pNeck: number
}

export function MechNeck({
  titaniumMaterial,
  darkTitaniumMaterial,
  crownGoldMaterial,
  copperCircuitMaterial,
  chromeMaterial,
  energyChassisMaterial,
  pNeck,
}: MechNeckProps) {
  return (
    <group position={[0, 0, 0]}>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. Ceremonial Divine Gorget Collar Base                    */}
      {/* ────────────────────────────────────────────────────────── */}
      <group position={[0, -0.06, 0.04]} rotation={[0.15, 0, 0]}>
        {/* Tier 1: Outer Fluted Golden Gorget Mantle */}
        <mesh material={crownGoldMaterial}>
          <cylinderGeometry args={[0.26, 0.32, 0.04, 24]} />
        </mesh>
        {/* Tier 2: Inlaid Dark Titanium Tier */}
        <mesh position={[0, 0.025, 0]} material={darkTitaniumMaterial}>
          <cylinderGeometry args={[0.22, 0.25, 0.03, 24]} />
        </mesh>
        {/* Sacred Concentric Radiating Rays */}
        {[-0.2, -0.1, 0, 0.1, 0.2].map((x, i) => (
          <mesh key={i} position={[x, 0.035, 0.12]} rotation={[0, 0, x * 1.5]} material={copperCircuitMaterial}>
            <boxGeometry args={[0.015, 0.06, 0.01]} />
          </mesh>
        ))}
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. Cervical Pivot Ball-and-Socket Joint                    */}
      {/* ────────────────────────────────────────────────────────── */}
      <mesh position={[0, 0.1, 0]} material={darkTitaniumMaterial}>
        <sphereGeometry args={[0.11, 16, 16]} />
      </mesh>

      {/* Stepped Cervical Discs */}
      <mesh position={[0, 0.04, 0]} material={titaniumMaterial}>
        <cylinderGeometry args={[0.09, 0.1, 0.05, 16]} />
      </mesh>
      <mesh position={[0, -0.02, 0]} material={crownGoldMaterial}>
        <cylinderGeometry args={[0.1, 0.12, 0.04, 16]} />
      </mesh>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. Dual Cervical Hydraulic Piston Actuators                */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* Left Hydraulic Cylinder & Chrome Ram */}
      <group position={[-0.12, 0.04, 0.02]} rotation={[0.06, 0, 0.22]}>
        <mesh position={[0, -0.05, 0]} material={darkTitaniumMaterial}>
          <cylinderGeometry args={[0.022, 0.022, 0.14, 12]} />
        </mesh>
        <mesh position={[0, 0.04, 0]} material={chromeMaterial}>
          <cylinderGeometry args={[0.013, 0.013, 0.12, 12]} />
        </mesh>
        <mesh position={[0, 0.1, 0]} material={crownGoldMaterial}>
          <sphereGeometry args={[0.018, 8, 8]} />
        </mesh>
        <mesh position={[0, -0.12, 0]} material={titaniumMaterial}>
          <boxGeometry args={[0.035, 0.03, 0.035]} />
        </mesh>
      </group>

      {/* Right Hydraulic Cylinder & Chrome Ram */}
      <group position={[0.12, 0.04, 0.02]} rotation={[0.06, 0, -0.22]}>
        <mesh position={[0, -0.05, 0]} material={darkTitaniumMaterial}>
          <cylinderGeometry args={[0.022, 0.022, 0.14, 12]} />
        </mesh>
        <mesh position={[0, 0.04, 0]} material={chromeMaterial}>
          <cylinderGeometry args={[0.013, 0.013, 0.12, 12]} />
        </mesh>
        <mesh position={[0, 0.1, 0]} material={crownGoldMaterial}>
          <sphereGeometry args={[0.018, 8, 8]} />
        </mesh>
        <mesh position={[0, -0.12, 0]} material={titaniumMaterial}>
          <boxGeometry args={[0.035, 0.03, 0.035]} />
        </mesh>
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. Flexible Ribbed Energy Conduits                         */}
      {/* ────────────────────────────────────────────────────────── */}
      {[-0.08, 0.08].map((x, i) => (
        <mesh key={i} position={[x, 0.0, -0.08]} rotation={[-0.2, 0, 0]} material={copperCircuitMaterial}>
          <cylinderGeometry args={[0.018, 0.018, 0.2, 8]} />
        </mesh>
      ))}
    </group>
  )
}
