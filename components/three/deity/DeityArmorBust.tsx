"use client"

import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useViewModeStore } from "@/store/useViewModeStore"
import { useDeityControls } from "@/store/useDeityControls"
import {
  COLOR_GOLD_PRIMARY,
  COLOR_CYAN_PRIMARY,
  COLOR_GOLD_ACCENT,
  COLOR_CYAN_ACCENT,
  COLOR_ARMOR_TITANIUM,
  COLOR_ARMOR_DARK,
  COLOR_COPPER_CIRCUIT,
  COLOR_CHROME_PISTON,
  _scratchVecAssembly1,
  _scratchVecAssembly2,
  _scratchVecAssembly3,
  _scratchVecAssembly4,
  _scratchVecAssembly5,
} from "./types"
import { MechHead } from "./robot/MechHead"
import { MechNeck } from "./robot/MechNeck"
import { MechTorso } from "./robot/MechTorso"
import { MechPelvis } from "./robot/MechPelvis"
import { MechLeg } from "./robot/MechLeg"
import { MechArm } from "./robot/MechArm"

export function DeityArmorBust() {
  const mode = useViewModeStore((s) => s.mode)
  const deityMode = useDeityControls((s) => s.mode)
  const isHovered = useDeityControls((s) => s.isHovered)
  const assemblyProgress = useDeityControls((s) => s.assemblyProgress)
  const isDeepDive = mode === "deep"
  const isOverdrive = deityMode === "OVERDRIVE"
  const isCad = deityMode === "CAD SCHEMATIC"

  // Assembly & Exploded suspension factor
  const explodedFactor = isOverdrive ? 1.5 : isHovered ? 1.0 : 0.0

  // Refs for animated assembly groups
  const bustRootRef = useRef<THREE.Group>(null)
  const headGroupRef = useRef<THREE.Group>(null)
  const neckGroupRef = useRef<THREE.Group>(null)
  const torsoGroupRef = useRef<THREE.Group>(null)
  const pelvisGroupRef = useRef<THREE.Group>(null)
  const legLGroupRef = useRef<THREE.Group>(null)
  const legRGroupRef = useRef<THREE.Group>(null)
  const armLGroupRef = useRef<THREE.Group>(null)
  const armRGroupRef = useRef<THREE.Group>(null)

  // Target positions for Genesis Assembly interpolation
  const targetHeadPos = useMemo(() => new THREE.Vector3(), [])
  const targetNeckPos = useMemo(() => new THREE.Vector3(), [])
  const targetTorsoPos = useMemo(() => new THREE.Vector3(), [])
  const targetPelvisPos = useMemo(() => new THREE.Vector3(), [])
  const targetLegLPos = useMemo(() => new THREE.Vector3(), [])
  const targetLegRPos = useMemo(() => new THREE.Vector3(), [])
  const targetArmLPos = useMemo(() => new THREE.Vector3(), [])
  const targetArmRPos = useMemo(() => new THREE.Vector3(), [])

  // Deep space scatter origins for assembly awakening
  const scatterHead = useMemo(() => new THREE.Vector3(0, 5.5, -2.0), [])
  const scatterNeck = useMemo(() => new THREE.Vector3(0, 3.2, -1.0), [])
  const scatterTorso = useMemo(() => new THREE.Vector3(0, -4.5, 3.0), [])
  const scatterPelvis = useMemo(() => new THREE.Vector3(0, -3.5, 1.5), [])
  const scatterLegL = useMemo(() => new THREE.Vector3(-2.5, -6.0, 2.0), [])
  const scatterLegR = useMemo(() => new THREE.Vector3(2.5, -6.0, 2.0), [])
  const scatterArmL = useMemo(() => new THREE.Vector3(-5.0, 1.5, 2.5), [])
  const scatterArmR = useMemo(() => new THREE.Vector3(5.0, 1.5, 2.5), [])

  // Shared Materials
  const titaniumMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: COLOR_ARMOR_TITANIUM,
      metalness: 0.94,
      roughness: 0.2,
      wireframe: isCad,
    })
  }, [isCad])

  const darkTitaniumMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: COLOR_ARMOR_DARK,
      metalness: 0.92,
      roughness: 0.28,
      wireframe: isCad,
    })
  }, [isCad])

  const crownGoldMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: isDeepDive ? COLOR_CYAN_PRIMARY : COLOR_GOLD_PRIMARY,
      emissiveIntensity: 0.85,
      metalness: 0.96,
      roughness: 0.14,
      wireframe: isCad,
    })
  }, [isDeepDive, isCad])

  const energyChassisMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x060912,
      emissive: isDeepDive ? COLOR_CYAN_PRIMARY : COLOR_GOLD_PRIMARY,
      emissiveIntensity: 1.8,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: isCad,
    })
  }, [isDeepDive, isCad])

  const copperCircuitMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: COLOR_COPPER_CIRCUIT,
      emissive: isDeepDive ? COLOR_CYAN_PRIMARY : COLOR_GOLD_PRIMARY,
      emissiveIntensity: 0.4,
      metalness: 0.9,
      roughness: 0.3,
      wireframe: isCad,
    })
  }, [isDeepDive, isCad])

  const chromeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: COLOR_CHROME_PISTON,
      metalness: 0.98,
      roughness: 0.08,
      wireframe: isCad,
    })
  }, [isCad])

  const visorGlowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: isDeepDive ? COLOR_CYAN_ACCENT : COLOR_GOLD_ACCENT,
      wireframe: isCad,
    })
  }, [isDeepDive, isCad])

  const targetEmissive = isDeepDive ? COLOR_CYAN_PRIMARY : COLOR_GOLD_PRIMARY
  const targetVisor = isDeepDive ? COLOR_CYAN_ACCENT : COLOR_GOLD_ACCENT

  useFrame((_, delta) => {
    const speed = delta * 4.5

    // Color transitions
    energyChassisMaterial.emissive.lerp(targetEmissive, speed)
    crownGoldMaterial.emissive.lerp(targetEmissive, speed)
    copperCircuitMaterial.emissive.lerp(targetEmissive, speed)
    visorGlowMaterial.color.lerp(targetVisor, speed)

    // Wireframe updates
    titaniumMaterial.wireframe = isCad
    darkTitaniumMaterial.wireframe = isCad
    crownGoldMaterial.wireframe = isCad
    energyChassisMaterial.wireframe = isCad
    copperCircuitMaterial.wireframe = isCad
    chromeMaterial.wireframe = isCad
    visorGlowMaterial.wireframe = isCad

    // Staggered Genesis Assembly Progress Factors
    const pTorso = THREE.MathUtils.clamp((assemblyProgress - 0.2) / 0.35, 0, 1)
    const pPelvis = THREE.MathUtils.clamp((assemblyProgress - 0.35) / 0.35, 0, 1)
    const pLegs = THREE.MathUtils.clamp((assemblyProgress - 0.45) / 0.35, 0, 1)
    const pNeck = THREE.MathUtils.clamp((assemblyProgress - 0.4) / 0.35, 0, 1)
    const pHead = THREE.MathUtils.clamp((assemblyProgress - 0.55) / 0.33, 0, 1)
    const pArms = THREE.MathUtils.clamp((assemblyProgress - 0.65) / 0.33, 0, 1)

    // Torso Target: [0, 0, 0]
    _scratchVecAssembly1.set(0, 0, 0)
    targetTorsoPos.lerpVectors(scatterTorso, _scratchVecAssembly1, pTorso)

    // Neck Target: [0, 0.54, 0.08] (forward cervical arch)
    _scratchVecAssembly2.set(0, 0.54, 0.08)
    targetNeckPos.lerpVectors(scatterNeck, _scratchVecAssembly2, pNeck)

    // Head Target: [0, 0.98 + 0.15 * explodedFactor, 0.12]
    _scratchVecAssembly3.set(0, 0.98 + 0.15 * explodedFactor, 0.12)
    targetHeadPos.lerpVectors(scatterHead, _scratchVecAssembly3, pHead)

    // Pelvis Target: [0, -0.02, 0.02]
    _scratchVecAssembly4.set(0, -0.02, 0.02)
    targetPelvisPos.lerpVectors(scatterPelvis, _scratchVecAssembly4, pPelvis)

    // Leg Targets: Left leg slightly forward (lead), right leg slightly trailing
    _scratchVecAssembly5.set(0, 0, 0.04)
    targetLegLPos.lerpVectors(scatterLegL, _scratchVecAssembly5, pLegs)
    _scratchVecAssembly5.set(0, 0, -0.04)
    targetLegRPos.lerpVectors(scatterLegR, _scratchVecAssembly5, pLegs)

    // Arm Targets: [0, 0, 0]
    targetArmLPos.lerpVectors(scatterArmL, _scratchVecAssembly5, pArms)
    targetArmRPos.lerpVectors(scatterArmR, _scratchVecAssembly5, pArms)

    // Apply positions with smooth lerp
    if (torsoGroupRef.current) torsoGroupRef.current.position.lerp(targetTorsoPos, speed)
    if (neckGroupRef.current) neckGroupRef.current.position.lerp(targetNeckPos, speed)
    if (headGroupRef.current) headGroupRef.current.position.lerp(targetHeadPos, speed)
    if (pelvisGroupRef.current) pelvisGroupRef.current.position.lerp(targetPelvisPos, speed)
    if (legLGroupRef.current) legLGroupRef.current.position.lerp(targetLegLPos, speed)
    if (legRGroupRef.current) legRGroupRef.current.position.lerp(targetLegRPos, speed)
    if (armLGroupRef.current) armLGroupRef.current.position.lerp(targetArmLPos, speed)
    if (armRGroupRef.current) armRGroupRef.current.position.lerp(targetArmRPos, speed)
  })

  // Staggered assembly progress values for children
  const pTorsoVal = THREE.MathUtils.clamp((assemblyProgress - 0.2) / 0.35, 0, 1)
  const pPelvisVal = THREE.MathUtils.clamp((assemblyProgress - 0.35) / 0.35, 0, 1)
  const pLegsVal = THREE.MathUtils.clamp((assemblyProgress - 0.45) / 0.35, 0, 1)
  const pNeckVal = THREE.MathUtils.clamp((assemblyProgress - 0.4) / 0.35, 0, 1)
  const pHeadVal = THREE.MathUtils.clamp((assemblyProgress - 0.55) / 0.33, 0, 1)
  const pArmsVal = THREE.MathUtils.clamp((assemblyProgress - 0.65) / 0.33, 0, 1)

  return (
    <group ref={bustRootRef} position={[0, 0, 0]}>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. Torso, Clavicles, V-Taper Pectorals, 3-Tier Abs         */}
      {/* ────────────────────────────────────────────────────────── */}
      <group ref={torsoGroupRef}>
        <MechTorso
          titaniumMaterial={titaniumMaterial}
          darkTitaniumMaterial={darkTitaniumMaterial}
          crownGoldMaterial={crownGoldMaterial}
          copperCircuitMaterial={copperCircuitMaterial}
          energyChassisMaterial={energyChassisMaterial}
          chromeMaterial={chromeMaterial}
          explodedFactor={explodedFactor}
          pChest={pTorsoVal}
          pSpine={pTorsoVal}
        />
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. Cervical Pivot & Dual Hydraulic Neck Piston Rams        */}
      {/* ────────────────────────────────────────────────────────── */}
      <group ref={neckGroupRef} position={[0, 0.54, 0.06]}>
        <MechNeck
          titaniumMaterial={titaniumMaterial}
          darkTitaniumMaterial={darkTitaniumMaterial}
          crownGoldMaterial={crownGoldMaterial}
          copperCircuitMaterial={copperCircuitMaterial}
          chromeMaterial={chromeMaterial}
          energyChassisMaterial={energyChassisMaterial}
          pNeck={pNeckVal}
        />
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. Sculpted Mecha Cranium, Cathedral Aureole & Archon Crown*/}
      {/* ────────────────────────────────────────────────────────── */}
      <group ref={headGroupRef} position={[0, 0.98, 0.1]}>
        <MechHead
          titaniumMaterial={titaniumMaterial}
          darkTitaniumMaterial={darkTitaniumMaterial}
          crownGoldMaterial={crownGoldMaterial}
          copperCircuitMaterial={copperCircuitMaterial}
          energyChassisMaterial={energyChassisMaterial}
          visorGlowMaterial={visorGlowMaterial}
          chromeMaterial={chromeMaterial}
          isOverdrive={isOverdrive}
          isCad={isCad}
          pHead={pHeadVal}
        />
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. Pelvic Chassis & Flaring Armored Hip Tassets            */}
      {/* ────────────────────────────────────────────────────────── */}
      <group ref={pelvisGroupRef}>
        <MechPelvis
          titaniumMaterial={titaniumMaterial}
          darkTitaniumMaterial={darkTitaniumMaterial}
          crownGoldMaterial={crownGoldMaterial}
          copperCircuitMaterial={copperCircuitMaterial}
          energyChassisMaterial={energyChassisMaterial}
          chromeMaterial={chromeMaterial}
          explodedFactor={explodedFactor}
          pPelvis={pPelvisVal}
        />
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. Full Articulated Hovering Legs (Asymmetric Zero-G Stance)*/}
      {/* ────────────────────────────────────────────────────────── */}
      <group ref={legLGroupRef}>
        <MechLeg
          side="left"
          stance="lead"
          titaniumMaterial={titaniumMaterial}
          darkTitaniumMaterial={darkTitaniumMaterial}
          crownGoldMaterial={crownGoldMaterial}
          copperCircuitMaterial={copperCircuitMaterial}
          energyChassisMaterial={energyChassisMaterial}
          chromeMaterial={chromeMaterial}
          visorGlowMaterial={visorGlowMaterial}
          isOverdrive={isOverdrive}
          isCad={isCad}
          pLeg={pLegsVal}
        />
      </group>

      <group ref={legRGroupRef}>
        <MechLeg
          side="right"
          stance="trailing"
          titaniumMaterial={titaniumMaterial}
          darkTitaniumMaterial={darkTitaniumMaterial}
          crownGoldMaterial={crownGoldMaterial}
          copperCircuitMaterial={copperCircuitMaterial}
          energyChassisMaterial={energyChassisMaterial}
          chromeMaterial={chromeMaterial}
          visorGlowMaterial={visorGlowMaterial}
          isOverdrive={isOverdrive}
          isCad={isCad}
          pLeg={pLegsVal}
        />
      </group>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 6. Ceremonial Mantle Arms & Mudra Sovereign Hands (L & R)  */}
      {/* ────────────────────────────────────────────────────────── */}
      <group ref={armLGroupRef}>
        <MechArm
          side="left"
          titaniumMaterial={titaniumMaterial}
          darkTitaniumMaterial={darkTitaniumMaterial}
          crownGoldMaterial={crownGoldMaterial}
          copperCircuitMaterial={copperCircuitMaterial}
          energyChassisMaterial={energyChassisMaterial}
          chromeMaterial={chromeMaterial}
          visorGlowMaterial={visorGlowMaterial}
          explodedFactor={explodedFactor}
          isOverdrive={isOverdrive}
          isCad={isCad}
          pArm={pArmsVal}
        />
      </group>

      <group ref={armRGroupRef}>
        <MechArm
          side="right"
          titaniumMaterial={titaniumMaterial}
          darkTitaniumMaterial={darkTitaniumMaterial}
          crownGoldMaterial={crownGoldMaterial}
          copperCircuitMaterial={copperCircuitMaterial}
          energyChassisMaterial={energyChassisMaterial}
          chromeMaterial={chromeMaterial}
          visorGlowMaterial={visorGlowMaterial}
          explodedFactor={explodedFactor}
          isOverdrive={isOverdrive}
          isCad={isCad}
          pArm={pArmsVal}
        />
      </group>
    </group>
  )
}
