"use client"

import React, { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useDeityControls } from "@/store/useDeityControls"

interface MechArmProps {
  side: "left" | "right"
  titaniumMaterial: THREE.Material
  darkTitaniumMaterial: THREE.Material
  crownGoldMaterial: THREE.Material
  copperCircuitMaterial: THREE.Material
  energyChassisMaterial: THREE.Material
  chromeMaterial: THREE.Material
  visorGlowMaterial: THREE.Material
  explodedFactor: number
  isOverdrive: boolean
  isCad: boolean
  pArm: number
}

export function MechArm({
  side,
  titaniumMaterial,
  darkTitaniumMaterial,
  crownGoldMaterial,
  copperCircuitMaterial,
  energyChassisMaterial,
  chromeMaterial,
  visorGlowMaterial,
  explodedFactor,
  isOverdrive,
  isCad,
  pArm,
}: MechArmProps) {
  const isLeft = side === "left"
  const sign = isLeft ? -1 : 1

  const armRootRef = useRef<THREE.Group>(null)
  const bicepGroupRef = useRef<THREE.Group>(null)
  const pauldronRef = useRef<THREE.Group>(null)
  const thrusterRef = useRef<THREE.Mesh>(null)
  const handRef = useRef<THREE.Group>(null)

  const kineticPulse = useDeityControls((s) => s.kineticPulse)

  // Dynamic exploded displacement for shoulder mantle
  const mantleOffset = 0.38 * explodedFactor + kineticPulse * 0.2

  // 5 Articulated Sovereign Fingers Configuration (Cosmic Mudra Pose)
  const fingerConfigs = useMemo(() => {
    return [
      { id: "thumb", x: sign * 0.075, y: -0.01, z: 0.08, rotY: sign * 0.6, rotZ: sign * 0.45, len: 0.08 },
      { id: "index", x: sign * 0.035, y: 0.005, z: 0.125, rotY: sign * 0.12, rotZ: sign * 0.08, len: 0.095 },
      { id: "middle", x: 0.0, y: -0.005, z: 0.12, rotY: sign * -0.15, rotZ: sign * -0.12, len: 0.09 },
      { id: "ring", x: -sign * 0.035, y: -0.015, z: 0.11, rotY: -sign * 0.2, rotZ: -sign * 0.15, len: 0.085 },
      { id: "pinky", x: -sign * 0.065, y: -0.02, z: 0.095, rotY: -sign * 0.35, rotZ: -sign * 0.25, len: 0.075 },
    ]
  }, [sign])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    const pointer = state.pointer
    const speed = delta * 4.2

    // Pauldron Thruster Pulse (pulsing rhythmically with upward levitation)
    if (thrusterRef.current) {
      const pulse =
        (1.0 + Math.sin(t * 4.5 + (isLeft ? 0 : Math.PI)) * 0.25 * (isOverdrive ? 2.2 : 1)) *
        (1.0 + kineticPulse * 1.5)
      thrusterRef.current.scale.set(1, 1, pulse)
    }

    // Dynamic Cursor Proximity & Kinetic Recoil Flare on Arm Root
    if (armRootRef.current) {
      // Magnetic pull when pointer is on this side
      const proximityPull = Math.max(0, pointer.x * sign) * 0.08
      const targetRotZ = sign * (proximityPull + kineticPulse * 0.22)
      const targetRotY = pointer.x * 0.08 - sign * kineticPulse * 0.15
      armRootRef.current.rotation.z = THREE.MathUtils.lerp(
        armRootRef.current.rotation.z,
        targetRotZ,
        speed
      )
      armRootRef.current.rotation.y = THREE.MathUtils.lerp(
        armRootRef.current.rotation.y,
        targetRotY,
        speed
      )
    }

    // Celestial Mudra Gentle Breathing Gesture & Kinetic Pulse Flare
    if (handRef.current) {
      const gestureSway = Math.sin(t * 1.6 + (isLeft ? 0 : 0.6)) * 0.035
      handRef.current.rotation.x = -0.18 + gestureSway - kineticPulse * 0.25
      handRef.current.rotation.y = sign * 0.28 + gestureSway * sign
    }
  })

  // Asymmetric Posture Configurations:
  // Left Arm: Raised celestial mudra channel framing heart
  // Right Arm: Imperial commanding guard flared slightly downward
  const bicepPitch = isLeft ? 0.26 : 0.18
  const bicepRoll = isLeft ? 0.16 : 0.22
  const forearmPitch = isLeft ? -0.62 : -0.46
  const forearmYaw = isLeft ? 0.44 : 0.28

  return (
    <group ref={armRootRef} position={[sign * 0.9, 0.44, 0.04]}>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. Deltoid Shoulder Ball Joint & Gilded Servo Ring         */}
      {/* ────────────────────────────────────────────────────────── */}
      <group position={[0, 0, 0]}>
        <mesh material={darkTitaniumMaterial}>
          <sphereGeometry args={[0.13, 16, 16]} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} material={crownGoldMaterial}>
          <torusGeometry args={[0.138, 0.016, 8, 24]} />
        </mesh>
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. Ceremonial Divine Mantle Pauldron & Golden Spires       */}
      {/* ────────────────────────────────────────────────────────── */}
      <group
        ref={pauldronRef}
        position={[sign * (0.08 + mantleOffset), 0.18 + mantleOffset * 0.5, mantleOffset * 0.2]}
      >
        {/* Tier 1: Apex Mantle Shell */}
        <mesh rotation={[0.16, sign * 0.08, sign * 0.38]} material={titaniumMaterial}>
          <boxGeometry args={[0.54, 0.22, 0.44]} />
        </mesh>

        {/* Gilded Edge Trim */}
        <mesh
          position={[sign * 0.18, 0.12, 0]}
          rotation={[0.16, sign * 0.08, sign * 0.38]}
          material={crownGoldMaterial}
        >
          <boxGeometry args={[0.1, 0.03, 0.46]} />
        </mesh>

        {/* Radiant Vertical Golden Spire rising from shoulder apex */}
        <group position={[sign * 0.14, 0.24, 0]} rotation={[0, 0, sign * 0.15]}>
          <mesh material={crownGoldMaterial}>
            <coneGeometry args={[0.028, 0.36, 4]} />
          </mesh>
          <mesh position={[0, 0.22, 0]} material={visorGlowMaterial}>
            <octahedronGeometry args={[0.022]} />
          </mesh>
        </group>

        {/* Tier 2: Mid Flange Deflector Plate */}
        <mesh
          position={[sign * 0.12, -0.14, 0]}
          rotation={[0.16, sign * 0.08, sign * 0.48]}
          material={darkTitaniumMaterial}
        >
          <boxGeometry args={[0.46, 0.16, 0.4]} />
        </mesh>

        {/* Tier 3: Under-Cowling Deflector */}
        <mesh
          position={[sign * 0.2, -0.26, 0]}
          rotation={[0.16, sign * 0.08, sign * 0.58]}
          material={titaniumMaterial}
        >
          <boxGeometry args={[0.38, 0.14, 0.36]} />
        </mesh>

        {/* Integrated Rear Thruster Nozzle */}
        <group position={[sign * 0.04, 0.02, -0.24]} rotation={[-0.65, 0, 0]}>
          <mesh material={darkTitaniumMaterial}>
            <cylinderGeometry args={[0.075, 0.05, 0.12, 16]} />
          </mesh>
          <mesh ref={thrusterRef} position={[0, -0.06, 0]} material={energyChassisMaterial}>
            <cylinderGeometry args={[0.048, 0.048, 0.02, 16]} />
          </mesh>
        </group>
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. Upper Bicep Armature & Hydraulic Ram                    */}
      {/* ────────────────────────────────────────────────────────── */}
      <group
        ref={bicepGroupRef}
        position={[sign * 0.1, -0.28, 0.06]}
        rotation={[bicepPitch, sign * -0.15, sign * bicepRoll]}
      >
        {/* Main Bicep Titanium Structural Beam */}
        <mesh material={titaniumMaterial}>
          <boxGeometry args={[0.14, 0.46, 0.16]} />
        </mesh>

        {/* Lateral Hydraulic Ram Cylinder & Chrome Piston */}
        <group position={[sign * 0.08, 0, 0.02]}>
          <mesh position={[0, 0.08, 0]} material={darkTitaniumMaterial}>
            <cylinderGeometry args={[0.022, 0.022, 0.2, 12]} />
          </mesh>
          <mesh position={[0, -0.06, 0]} material={chromeMaterial}>
            <cylinderGeometry args={[0.013, 0.013, 0.18, 12]} />
          </mesh>
        </group>

        {/* Medial Power Conduit Cable */}
        <mesh position={[-sign * 0.07, 0, -0.04]} material={copperCircuitMaterial}>
          <cylinderGeometry args={[0.016, 0.016, 0.42, 8]} />
        </mesh>

        {/* ────────────────────────────────────────────────────────── */}
        {/* 4. Articulated Elbow Hinge Servo                           */}
        {/* ────────────────────────────────────────────────────────── */}
        <group position={[0, -0.26, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={darkTitaniumMaterial}>
            <cylinderGeometry args={[0.065, 0.065, 0.16, 16]} />
          </mesh>
          <mesh
            position={[sign * 0.085, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            material={crownGoldMaterial}
          >
            <cylinderGeometry args={[0.045, 0.045, 0.015, 8]} />
          </mesh>

          {/* ────────────────────────────────────────────────────────── */}
          {/* 5. Forearm Gauntlet & Stabilization Rail (Angled Inward)   */}
          {/* ────────────────────────────────────────────────────────── */}
          <group
            position={[sign * 0.06, -0.32, 0.14]}
            rotation={[forearmPitch, sign * forearmYaw, sign * -0.22]}
          >
            {/* Tapered Forearm Armor Bracer */}
            <mesh material={titaniumMaterial}>
              <boxGeometry args={[0.16, 0.48, 0.18]} />
            </mesh>

            {/* Dorsal Gilded Armor Deflection Plate */}
            <mesh position={[0, 0.04, 0.1]} material={crownGoldMaterial}>
              <boxGeometry args={[0.13, 0.42, 0.035]} />
            </mesh>

            {/* Glowing Telemetry Status Light Strip */}
            <mesh position={[0, 0.04, 0.125]} material={visorGlowMaterial}>
              <boxGeometry args={[0.02, 0.36, 0.01]} />
            </mesh>

            {/* Under-Forearm Heat Sink */}
            {[-0.1, 0, 0.1].map((y, idx) => (
              <mesh key={idx} position={[0, y, -0.095]} material={copperCircuitMaterial}>
                <boxGeometry args={[0.1, 0.02, 0.015]} />
              </mesh>
            ))}

            {/* Wrist Ball Joint */}
            <mesh position={[0, -0.26, 0]} material={darkTitaniumMaterial}>
              <sphereGeometry args={[0.055, 12, 12]} />
            </mesh>

            {/* ────────────────────────────────────────────────────────── */}
            {/* 6. Articulated Celestial Mudra Sovereign Hand              */}
            {/* ────────────────────────────────────────────────────────── */}
            <group ref={handRef} position={[0, -0.34, 0.02]}>
              {/* Palm Base Plate */}
              <mesh material={darkTitaniumMaterial}>
                <boxGeometry args={[0.13, 0.05, 0.14]} />
              </mesh>
              {/* Central Palm Energy Node (Facing Singularity Core) */}
              <mesh position={[0, -0.026, 0]} material={crownGoldMaterial}>
                <cylinderGeometry args={[0.03, 0.03, 0.01, 16]} />
              </mesh>

              {/* 5 Jointed Mudra Fingers */}
              {fingerConfigs.map((f) => (
                <group
                  key={f.id}
                  position={[f.x, f.y, f.z]}
                  rotation={[-0.35, f.rotY, f.rotZ]}
                >
                  {/* Metacarpal Knuckle */}
                  <mesh material={crownGoldMaterial}>
                    <sphereGeometry args={[0.016, 8, 8]} />
                  </mesh>

                  {/* Proximal Phalanx */}
                  <mesh
                    position={[0, -f.len * 0.4, 0.02]}
                    rotation={[-0.3, 0, 0]}
                    material={titaniumMaterial}
                  >
                    <cylinderGeometry args={[0.011, 0.01, f.len * 0.8, 8]} />
                  </mesh>

                  {/* Interphalangeal Knuckle */}
                  <mesh position={[0, -f.len * 0.75, 0.045]} material={chromeMaterial}>
                    <sphereGeometry args={[0.012, 8, 8]} />
                  </mesh>

                  {/* Distal Phalanx with Gilded Claws */}
                  <mesh
                    position={[0, -f.len * 1.1, 0.08]}
                    rotation={[-0.55, 0, 0]}
                    material={crownGoldMaterial}
                  >
                    <cylinderGeometry args={[0.009, 0.006, f.len * 0.7, 8]} />
                  </mesh>
                </group>
              ))}
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
