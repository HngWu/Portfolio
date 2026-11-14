"use client"

import React, { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useDeityControls } from "@/store/useDeityControls"

interface MechTorsoProps {
  titaniumMaterial: THREE.Material
  darkTitaniumMaterial: THREE.Material
  crownGoldMaterial: THREE.Material
  copperCircuitMaterial: THREE.Material
  energyChassisMaterial: THREE.Material
  chromeMaterial: THREE.Material
  explodedFactor: number
  pChest: number
  pSpine: number
}

export function MechTorso({
  titaniumMaterial,
  darkTitaniumMaterial,
  crownGoldMaterial,
  copperCircuitMaterial,
  energyChassisMaterial,
  chromeMaterial,
  explodedFactor,
  pChest,
  pSpine,
}: MechTorsoProps) {
  const torsoRootRef = useRef<THREE.Group>(null)
  const chestPlateLRef = useRef<THREE.Group>(null)
  const chestPlateRRef = useRef<THREE.Group>(null)

  const kineticPulse = useDeityControls((s) => s.kineticPulse)

  // 4 Pairs of Cyber-Ribs Wrapping Around Chest Flanks
  const ribs = useMemo(() => {
    return [
      { id: 0, y: 0.16, width: 0.54, depth: 0.42, rotZ: 0.08 },
      { id: 1, y: 0.02, width: 0.56, depth: 0.44, rotZ: 0.0 },
      { id: 2, y: -0.14, width: 0.52, depth: 0.42, rotZ: -0.06 },
      { id: 3, y: -0.28, width: 0.46, depth: 0.38, rotZ: -0.12 },
    ]
  }, [])

  // 3-Tier Articulated Abdominal Wall Plates
  const absPlates = useMemo(() => {
    return [
      { id: 0, y: -0.06, width: 0.44, height: 0.12, depth: 0.22 },
      { id: 1, y: -0.20, width: 0.40, height: 0.12, depth: 0.20 },
      { id: 2, y: -0.34, width: 0.36, height: 0.12, depth: 0.18 },
    ]
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    const speed = delta * 4.5

    // Dynamic S-Curve Sternum: Proud, elevated backward pitch with subtle breathing
    if (torsoRootRef.current) {
      const targetPitch = -0.05 + Math.sin(t * 1.5) * 0.015 - kineticPulse * 0.08
      torsoRootRef.current.rotation.x = THREE.MathUtils.lerp(
        torsoRootRef.current.rotation.x,
        targetPitch,
        speed
      )
    }

    // Dynamic Pectoral Breathing & Kinetic Expansion
    const breath = Math.sin(t * 1.5) * 0.02
    const totalOffset = 0.25 * explodedFactor + breath + kineticPulse * 0.22

    if (chestPlateLRef.current) {
      chestPlateLRef.current.position.x = -0.34 - totalOffset
      chestPlateLRef.current.position.y = 0.24 + totalOffset * 0.4
      chestPlateLRef.current.position.z = 0.24 + totalOffset * 0.8
    }
    if (chestPlateRRef.current) {
      chestPlateRRef.current.position.x = 0.34 + totalOffset
      chestPlateRRef.current.position.y = 0.24 + totalOffset * 0.4
      chestPlateRRef.current.position.z = 0.24 + totalOffset * 0.8
    }
  })

  return (
    <group ref={torsoRootRef} position={[0, 0, 0]}>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. Clavicle & Collarbone Broad Royal Mantle Arch           */}
      {/* ────────────────────────────────────────────────────────── */}
      <group position={[0, 0.48, 0.06]}>
        {/* Main Clavicle Crossbeam */}
        <mesh material={darkTitaniumMaterial}>
          <boxGeometry args={[1.38, 0.1, 0.24]} />
        </mesh>
        {/* Left & Right Fluted Gold Shoulder Plates */}
        <mesh position={[-0.44, 0.04, 0.04]} rotation={[0, 0, 0.06]} material={crownGoldMaterial}>
          <boxGeometry args={[0.48, 0.05, 0.22]} />
        </mesh>
        <mesh position={[0.44, 0.04, 0.04]} rotation={[0, 0, -0.06]} material={crownGoldMaterial}>
          <boxGeometry args={[0.48, 0.05, 0.22]} />
        </mesh>
        {/* Suprasternal Notch (Neck Recess Bed) */}
        <mesh position={[0, 0.02, 0.04]} material={energyChassisMaterial}>
          <boxGeometry args={[0.26, 0.06, 0.18]} />
        </mesh>
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. Solid V-Taper Pectoral Breastplates & Heart Bezel       */}
      {/* ────────────────────────────────────────────────────────── */}
      {/* Left Pectoral Plate */}
      <group ref={chestPlateLRef} position={[-0.34, 0.24, 0.24]}>
        <mesh rotation={[0.12, 0.18, -0.06]} material={titaniumMaterial}>
          <boxGeometry args={[0.44, 0.42, 0.14]} />
        </mesh>
        {/* Gilded Inner Chamfer Filigree */}
        <mesh position={[0.16, 0, 0.075]} material={crownGoldMaterial}>
          <boxGeometry args={[0.04, 0.38, 0.015]} />
        </mesh>
        {/* Copper Power Rails */}
        <mesh position={[-0.04, 0.04, 0.075]} material={copperCircuitMaterial}>
          <boxGeometry args={[0.025, 0.32, 0.015]} />
        </mesh>
        {/* Cooling Intake Louver Slats */}
        {[-0.08, 0.02, 0.12].map((y, idx) => (
          <mesh key={idx} position={[-0.08, y, 0.075]} material={darkTitaniumMaterial}>
            <boxGeometry args={[0.14, 0.018, 0.015]} />
          </mesh>
        ))}
      </group>

      {/* Right Pectoral Plate */}
      <group ref={chestPlateRRef} position={[0.34, 0.24, 0.24]}>
        <mesh rotation={[0.12, -0.18, 0.06]} material={titaniumMaterial}>
          <boxGeometry args={[0.44, 0.42, 0.14]} />
        </mesh>
        {/* Gilded Inner Chamfer Filigree */}
        <mesh position={[-0.16, 0, 0.075]} material={crownGoldMaterial}>
          <boxGeometry args={[0.04, 0.38, 0.015]} />
        </mesh>
        {/* Copper Power Rails */}
        <mesh position={[0.04, 0.04, 0.075]} material={copperCircuitMaterial}>
          <boxGeometry args={[0.025, 0.32, 0.015]} />
        </mesh>
        {/* Cooling Intake Louver Slats */}
        {[-0.08, 0.02, 0.12].map((y, idx) => (
          <mesh key={idx} position={[0.08, y, 0.075]} material={darkTitaniumMaterial}>
            <boxGeometry args={[0.14, 0.018, 0.015]} />
          </mesh>
        ))}
      </group>

      {/* Recessed Divine Heart Chamber Bezel (Framing the Singularity Core) */}
      <group position={[0, 0.22, 0.14]}>
        {/* Beveled Hexagonal Frame Ring */}
        <mesh material={darkTitaniumMaterial}>
          <torusGeometry args={[0.44, 0.028, 8, 24]} />
        </mesh>
        <mesh material={crownGoldMaterial}>
          <torusGeometry args={[0.49, 0.015, 6, 24]} />
        </mesh>

        {/* 4 Titanium Magnetic Clamps with Gold Contact Pads */}
        {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => {
          const x = Math.cos(angle) * 0.45
          const y = Math.sin(angle) * 0.45
          return (
            <group key={i} position={[x, y, 0.02]} rotation={[0, 0, angle + Math.PI / 2]}>
              <mesh material={titaniumMaterial}>
                <boxGeometry args={[0.05, 0.09, 0.06]} />
              </mesh>
              <mesh position={[0, -0.05, 0]} material={crownGoldMaterial}>
                <octahedronGeometry args={[0.025]} />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. 3-Tier Articulated Abdominal Wall                       */}
      {/* ────────────────────────────────────────────────────────── */}
      <group position={[0, 0, 0.12]}>
        {absPlates.map((ab) => (
          <group key={ab.id} position={[0, ab.y, 0]}>
            {/* Center Ab Carapace */}
            <mesh material={darkTitaniumMaterial}>
              <boxGeometry args={[ab.width, ab.height, ab.depth]} />
            </mesh>
            {/* Axial Gilded Fluting Strip */}
            <mesh position={[0, 0, ab.depth * 0.52]} material={crownGoldMaterial}>
              <boxGeometry args={[0.04, ab.height * 0.8, 0.01]} />
            </mesh>
            {/* Lateral Fluting Accents */}
            {[-1, 1].map((s) => (
              <mesh
                key={s}
                position={[s * (ab.width * 0.36), 0, ab.depth * 0.51]}
                material={titaniumMaterial}
              >
                <boxGeometry args={[0.06, ab.height * 0.7, 0.01]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. Symmetrical Cyber-Ribcage Flanks                        */}
      {/* ────────────────────────────────────────────────────────── */}
      <group position={[0, 0, 0]}>
        {ribs.map((r) => (
          <group key={r.id} position={[0, r.y, -0.02]}>
            {/* Left Rib Arch */}
            <group position={[-r.width * 0.52, 0, 0]} rotation={[0, 0.35, r.rotZ]}>
              <mesh material={titaniumMaterial}>
                <boxGeometry args={[r.width * 0.82, 0.05, 0.08]} />
              </mesh>
              <mesh position={[r.width * 0.4, 0, 0]} material={crownGoldMaterial}>
                <boxGeometry args={[0.04, 0.045, 0.07]} />
              </mesh>
              <mesh position={[0, 0, 0.042]} material={energyChassisMaterial}>
                <boxGeometry args={[r.width * 0.7, 0.014, 0.014]} />
              </mesh>
            </group>

            {/* Right Rib Arch */}
            <group position={[r.width * 0.52, 0, 0]} rotation={[0, -0.35, -r.rotZ]}>
              <mesh material={titaniumMaterial}>
                <boxGeometry args={[r.width * 0.82, 0.05, 0.08]} />
              </mesh>
              <mesh position={[-r.width * 0.4, 0, 0]} material={crownGoldMaterial}>
                <boxGeometry args={[0.04, 0.045, 0.07]} />
              </mesh>
              <mesh position={[0, 0, 0.042]} material={energyChassisMaterial}>
                <boxGeometry args={[r.width * 0.7, 0.014, 0.014]} />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. Dorsal Lumbar Spine & Oblique Abdominal Hydraulic Rams  */}
      {/* ────────────────────────────────────────────────────────── */}
      <group position={[0, 0, -0.08]}>
        {/* Central Dorsal Fluid Conduit */}
        <mesh material={energyChassisMaterial}>
          <cylinderGeometry args={[0.06, 0.075, 0.95, 16]} />
        </mesh>

        {/* Left Oblique Abdominal Hydraulic Ram */}
        <group position={[-0.22, -0.28, 0.08]} rotation={[0.1, 0, -0.3]}>
          <mesh material={darkTitaniumMaterial}>
            <cylinderGeometry args={[0.024, 0.024, 0.34, 12]} />
          </mesh>
          <mesh position={[0, 0.14, 0]} material={chromeMaterial}>
            <cylinderGeometry args={[0.015, 0.015, 0.22, 12]} />
          </mesh>
        </group>

        {/* Right Oblique Abdominal Hydraulic Ram */}
        <group position={[0.22, -0.28, 0.08]} rotation={[0.1, 0, 0.3]}>
          <mesh material={darkTitaniumMaterial}>
            <cylinderGeometry args={[0.024, 0.024, 0.34, 12]} />
          </mesh>
          <mesh position={[0, 0.14, 0]} material={chromeMaterial}>
            <cylinderGeometry args={[0.015, 0.015, 0.22, 12]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
