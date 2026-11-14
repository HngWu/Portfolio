"use client"

import React, { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useDeityControls } from "@/store/useDeityControls"

interface MechLegProps {
  side: "left" | "right"
  stance?: "lead" | "trailing"
  titaniumMaterial: THREE.Material
  darkTitaniumMaterial: THREE.Material
  crownGoldMaterial: THREE.Material
  copperCircuitMaterial: THREE.Material
  energyChassisMaterial: THREE.Material
  chromeMaterial: THREE.Material
  visorGlowMaterial: THREE.Material
  isOverdrive: boolean
  isCad: boolean
  pLeg: number
}

export function MechLeg({
  side,
  stance,
  titaniumMaterial,
  darkTitaniumMaterial,
  crownGoldMaterial,
  copperCircuitMaterial,
  energyChassisMaterial,
  chromeMaterial,
  visorGlowMaterial,
  isOverdrive,
  isCad,
  pLeg,
}: MechLegProps) {
  const isLeft = side === "left"
  const sign = isLeft ? -1 : 1
  const isLead = stance ? stance === "lead" : isLeft

  const thighRef = useRef<THREE.Group>(null)
  const kneeRef = useRef<THREE.Group>(null)
  const calfRef = useRef<THREE.Group>(null)
  const thrusterRef = useRef<THREE.Mesh>(null)
  const footRef = useRef<THREE.Group>(null)

  const kineticPulse = useDeityControls((s) => s.kineticPulse)

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    const speed = delta * 4.0

    // Dynamic Calf Hovering Thruster Pulse (pulsing rhythmically with upward levitation)
    if (thrusterRef.current) {
      const levitationThrust = Math.max(0, Math.sin(t * 1.8 + (isLead ? 0 : 0.3))) * 0.4
      const pulse =
        (1.0 + levitationThrust + (isOverdrive ? 0.8 : 0)) * (1.0 + kineticPulse * 1.8)
      thrusterRef.current.scale.set(1, pulse, 1)
    }

    // Dynamic S-Curve Zero-G Ankle Hovering Sway
    if (footRef.current) {
      const baseFootX = isLead ? 0.62 : 0.72
      const sway = Math.sin(t * 1.5 + (isLead ? 0 : 0.8)) * 0.04 - kineticPulse * 0.12
      footRef.current.rotation.x = THREE.MathUtils.lerp(
        footRef.current.rotation.x,
        baseFootX + sway,
        speed
      )
    }
  })

  // Asymmetric Posture Joint Rotations:
  // Lead Leg: flexed forward with knee bend
  // Trailing Leg: extended back as cosmic rudder
  const thighPitch = isLead ? 0.14 : -0.08
  const kneePitch = isLead ? 0.22 : 0.04
  const calfPitch = isLead ? -0.18 : -0.08

  return (
    <group position={[sign * 0.28, -0.66, 0.04]}>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. Upper Thigh (Femur) Chassis                             */}
      {/* ────────────────────────────────────────────────────────── */}
      <group
        ref={thighRef}
        position={[0, -0.28, 0]}
        rotation={[thighPitch, 0, sign * 0.05]}
      >
        {/* Main Thigh Armor Carapace */}
        <mesh material={titaniumMaterial}>
          <boxGeometry args={[0.22, 0.58, 0.24]} />
        </mesh>

        {/* Anterior Hydraulic Quad Cylinder */}
        <group position={[0, 0, 0.13]}>
          <mesh position={[0, 0.08, 0]} material={darkTitaniumMaterial}>
            <cylinderGeometry args={[0.024, 0.024, 0.28, 12]} />
          </mesh>
          <mesh position={[0, -0.1, 0]} material={chromeMaterial}>
            <cylinderGeometry args={[0.015, 0.015, 0.24, 12]} />
          </mesh>
        </group>

        {/* Lateral Gilded Fluting Strip */}
        <mesh position={[sign * 0.115, 0, 0]} material={crownGoldMaterial}>
          <boxGeometry args={[0.015, 0.5, 0.08]} />
        </mesh>

        {/* Medial Copper Energy Rail */}
        <mesh position={[-sign * 0.115, 0, 0]} material={copperCircuitMaterial}>
          <boxGeometry args={[0.015, 0.42, 0.04]} />
        </mesh>

        {/* ────────────────────────────────────────────────────────── */}
        {/* 2. Articulated Knee Joint Servo & Diamond Kneecap          */}
        {/* ────────────────────────────────────────────────────────── */}
        <group ref={kneeRef} position={[0, -0.32, 0]} rotation={[kneePitch, 0, 0]}>
          {/* Transverse Knee Pivot Axle */}
          <mesh rotation={[0, 0, Math.PI / 2]} material={darkTitaniumMaterial}>
            <cylinderGeometry args={[0.07, 0.07, 0.18, 16]} />
          </mesh>
          <mesh
            position={[sign * 0.095, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            material={crownGoldMaterial}
          >
            <cylinderGeometry args={[0.045, 0.045, 0.015, 8]} />
          </mesh>

          {/* Forward-Projecting Diamond Kneecap Flange */}
          <mesh position={[0, 0, 0.11]} rotation={[0.4, 0, 0]} material={crownGoldMaterial}>
            <octahedronGeometry args={[0.065]} />
          </mesh>

          {/* ────────────────────────────────────────────────────────── */}
          {/* 3. Lower Leg, Calf Greave & Hovering Thruster              */}
          {/* ────────────────────────────────────────────────────────── */}
          <group
            ref={calfRef}
            position={[0, -0.38, -0.04]}
            rotation={[calfPitch, 0, sign * -0.03]}
          >
            {/* Aerodynamic Shin Greave */}
            <mesh material={titaniumMaterial}>
              <boxGeometry args={[0.18, 0.68, 0.22]} />
            </mesh>

            {/* Anterior Gilded Shin Ridge */}
            <mesh position={[0, 0.02, 0.115]} material={crownGoldMaterial}>
              <boxGeometry args={[0.03, 0.6, 0.02]} />
            </mesh>

            {/* Glowing Shin Telemetry Strip */}
            <mesh position={[0, 0.02, 0.128]} material={visorGlowMaterial}>
              <boxGeometry args={[0.012, 0.5, 0.01]} />
            </mesh>

            {/* Rear Calf Hovering Thruster Cowl */}
            <group position={[0, 0.08, -0.14]} rotation={[-0.4, 0, 0]}>
              <mesh material={darkTitaniumMaterial}>
                <boxGeometry args={[0.14, 0.28, 0.1]} />
              </mesh>
              {/* Exhaust Nozzle */}
              <mesh ref={thrusterRef} position={[0, -0.15, 0]} material={energyChassisMaterial}>
                <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
              </mesh>
            </group>

            {/* Ankle Pivot Ball Joint */}
            <mesh position={[0, -0.36, 0]} material={darkTitaniumMaterial}>
              <sphereGeometry args={[0.06, 12, 12]} />
            </mesh>

            {/* ────────────────────────────────────────────────────────── */}
            {/* 4. Zero-G Hovering Divine Talon Foot (Pointed Downward)    */}
            {/* ────────────────────────────────────────────────────────── */}
            <group
              ref={footRef}
              position={[0, -0.42, 0.02]}
              rotation={[0.65, 0, sign * 0.06]}
            >
              {/* Foot Instep Chassis */}
              <mesh material={darkTitaniumMaterial}>
                <boxGeometry args={[0.12, 0.07, 0.28]} />
              </mesh>

              {/* Gilded Top Bridge */}
              <mesh position={[0, 0.04, 0]} material={crownGoldMaterial}>
                <boxGeometry args={[0.08, 0.02, 0.24]} />
              </mesh>

              {/* Center Golden Toe Talon */}
              <mesh position={[0, -0.01, 0.18]} rotation={[0.3, 0, 0]} material={crownGoldMaterial}>
                <coneGeometry args={[0.022, 0.14, 4]} />
              </mesh>

              {/* Left & Right Splaying Toe Talons */}
              <mesh
                position={[-0.045, -0.01, 0.16]}
                rotation={[0.3, -0.15, 0.1]}
                material={titaniumMaterial}
              >
                <coneGeometry args={[0.018, 0.12, 4]} />
              </mesh>
              <mesh
                position={[0.045, -0.01, 0.16]}
                rotation={[0.3, 0.15, -0.1]}
                material={titaniumMaterial}
              >
                <coneGeometry args={[0.018, 0.12, 4]} />
              </mesh>

              {/* Rear Heel Stabilization Spur */}
              <mesh position={[0, 0.04, -0.16]} rotation={[-0.6, 0, 0]} material={crownGoldMaterial}>
                <coneGeometry args={[0.02, 0.15, 4]} />
              </mesh>

              {/* Gravitational Repulsor Pad on Sole */}
              <mesh position={[0, -0.04, 0]} material={energyChassisMaterial}>
                <cylinderGeometry args={[0.035, 0.035, 0.01, 16]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
