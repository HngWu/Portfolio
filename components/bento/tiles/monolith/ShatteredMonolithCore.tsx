"use client"

import React, { useRef, useMemo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { createBasaltStoneMaterial } from "./shaders/BasaltStoneMaterial"
import { createEmissiveFractureMaterial } from "./shaders/EmissiveFractureShader"

interface ShardData {
  id: number
  geometry: THREE.BufferGeometry
  restPosition: THREE.Vector3
  restRotation: THREE.Euler
  driftDirection: THREE.Vector3
  driftDistance: number
  freq: THREE.Vector3
  phase: THREE.Vector3
  tumbleAxis: THREE.Vector3
  sampleVertices: THREE.Vector3[] // Local vertices used for micro-arc tracking
}

/**
 * Procedurally generates 18-24 razor-sharp irregular shards
 * from an elongated hexagonal bipyramid with a negative hollow center.
 */
function generateMonolithShards(): ShardData[] {
  const shards: ShardData[] = []

  const numSectors = 6 // Hexagonal base
  const numLayers = 3  // 3 height layers = 18 irregular shards
  const totalHeight = 2.8
  const halfH = totalHeight / 2
  const outerR = 1.15
  const innerR = 0.38

  // Base layer boundary definitions with slight jitter for asymmetric cuts
  const layerBounds = [-halfH, -halfH * 0.28, halfH * 0.28, halfH]

  let shardId = 0

  for (let l = 0; l < numLayers; l++) {
    const yBot = layerBounds[l]
    const yTop = layerBounds[l + 1]

    for (let s = 0; s < numSectors; s++) {
      const angleStart = (s / numSectors) * Math.PI * 2
      const angleEnd = ((s + 1) / numSectors) * Math.PI * 2
      const midAngle = (angleStart + angleEnd) / 2

      // Asymmetric angular and height jitter per shard
      const jitterA = Math.sin(s * 3.7 + l * 2.1) * 0.06
      const jitterY = Math.cos(s * 2.3 + l * 4.1) * 0.05

      // Calculate radius at yBot and yTop (tapering to 0 at the tips)
      const rOuterBot = outerR * (1.0 - Math.abs(yBot + jitterY) / halfH)
      const rOuterTop = outerR * (1.0 - Math.abs(yTop + jitterY) / halfH)

      const rInnerBot = innerR * Math.max(0.1, 1.0 - Math.abs(yBot) / halfH)
      const rInnerTop = innerR * Math.max(0.1, 1.0 - Math.abs(yTop) / halfH)

      // Angles with jitter
      const a0 = angleStart + jitterA
      const a1 = angleEnd - jitterA

      // Compute 8 corner vertices of the shard wedge:
      // Outer 4 corners:
      const pOuterBot0 = new THREE.Vector3(rOuterBot * Math.cos(a0), yBot, rOuterBot * Math.sin(a0))
      const pOuterBot1 = new THREE.Vector3(rOuterBot * Math.cos(a1), yBot, rOuterBot * Math.sin(a1))
      const pOuterTop1 = new THREE.Vector3(rOuterTop * Math.cos(a1), yTop, rOuterTop * Math.sin(a1))
      const pOuterTop0 = new THREE.Vector3(rOuterTop * Math.cos(a0), yTop, rOuterTop * Math.sin(a0))

      // Inner 4 corners (surrounding the hollow negative core):
      const pInnerBot0 = new THREE.Vector3(rInnerBot * Math.cos(a0), yBot, rInnerBot * Math.sin(a0))
      const pInnerBot1 = new THREE.Vector3(rInnerBot * Math.cos(a1), yBot, rInnerBot * Math.sin(a1))
      const pInnerTop1 = new THREE.Vector3(rInnerTop * Math.cos(a1), yTop, rInnerTop * Math.sin(a1))
      const pInnerTop0 = new THREE.Vector3(rInnerTop * Math.cos(a0), yTop, rInnerTop * Math.sin(a0))

      // Shard centroid at rest
      const centroid = new THREE.Vector3()
        .add(pOuterBot0).add(pOuterBot1).add(pOuterTop1).add(pOuterTop0)
        .add(pInnerBot0).add(pInnerBot1).add(pInnerTop1).add(pInnerTop0)
        .multiplyScalar(1 / 8)

      // Center vertices relative to centroid so rotation/floating behaves naturally
      const verts = [
        pOuterBot0.clone().sub(centroid),
        pOuterBot1.clone().sub(centroid),
        pOuterTop1.clone().sub(centroid),
        pOuterTop0.clone().sub(centroid),
        pInnerBot0.clone().sub(centroid),
        pInnerBot1.clone().sub(centroid),
        pInnerTop1.clone().sub(centroid),
        pInnerTop0.clone().sub(centroid),
      ]

      // Build triangulated geometry with two distinct material groups:
      // Group 0: Exterior basalt faces (indices into material 0)
      // Group 1: Cleavage / inner fracture faces (indices into material 1)
      const positions: number[] = []
      const normals: number[] = []

      // Helper to append a quad as 2 triangles
      const addQuad = (i0: number, i1: number, i2: number, i3: number) => {
        const v0 = verts[i0]
        const v1 = verts[i1]
        const v2 = verts[i2]
        const v3 = verts[i3]

        // Triangle 1: v0, v1, v2
        const n1 = new THREE.Vector3().crossVectors(
          new THREE.Vector3().subVectors(v1, v0),
          new THREE.Vector3().subVectors(v2, v0)
        ).normalize()

        positions.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z)
        normals.push(n1.x, n1.y, n1.z, n1.x, n1.y, n1.z, n1.x, n1.y, n1.z)

        // Triangle 2: v0, v2, v3
        const n2 = new THREE.Vector3().crossVectors(
          new THREE.Vector3().subVectors(v2, v0),
          new THREE.Vector3().subVectors(v3, v0)
        ).normalize()

        positions.push(v0.x, v0.y, v0.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z)
        normals.push(n2.x, n2.y, n2.z, n2.x, n2.y, n2.z, n2.x, n2.y, n2.z)
      }

      // 1. Exterior Face: [0, 1, 2, 3] -> Group 0 (Basalt stone)
      addQuad(0, 1, 2, 3)
      const exteriorVertexCount = 6

      // 2. Interior & Cleavage Faces -> Group 1 (Mirror-sheen emissive)
      // Inner face (hollow core facing): [7, 6, 5, 4]
      addQuad(7, 6, 5, 4)
      // Left side fracture plane: [3, 2, 6, 7]
      addQuad(3, 2, 6, 7)
      // Right side fracture plane: [1, 0, 4, 5]
      addQuad(1, 0, 4, 5)
      // Top cut plane: [2, 1, 5, 6]
      addQuad(2, 1, 5, 6)
      // Bottom cut plane: [0, 3, 7, 4]
      addQuad(0, 3, 7, 4)
      const interiorVertexCount = 30

      const geo = new THREE.BufferGeometry()
      geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
      geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))

      // Define multi-material groups
      geo.addGroup(0, exteriorVertexCount, 0) // Material 0: Basalt Stone
      geo.addGroup(exteriorVertexCount, interiorVertexCount, 1) // Material 1: Emissive Fracture

      // Radial drift direction (pointing away from Y axis, with layer vertical bias)
      const driftDir = new THREE.Vector3(Math.cos(midAngle), (l - 1) * 0.35, Math.sin(midAngle)).normalize()

      shards.push({
        id: shardId++,
        geometry: geo,
        restPosition: centroid,
        restRotation: new THREE.Euler(0, 0, 0),
        driftDirection: driftDir,
        driftDistance: 0.45 + (shardId % 3) * 0.12,
        freq: new THREE.Vector3(
          1.4 + (shardId % 5) * 0.22,
          1.1 + (shardId % 4) * 0.28,
          1.6 + (shardId % 3) * 0.25
        ),
        phase: new THREE.Vector3(
          (shardId * 1.7) % Math.PI,
          (shardId * 2.3) % Math.PI,
          (shardId * 3.1) % Math.PI
        ),
        tumbleAxis: new THREE.Vector3(
          Math.sin(shardId * 1.5),
          Math.cos(shardId * 2.1),
          Math.sin(shardId * 0.9)
        ).normalize(),
        sampleVertices: [verts[0], verts[2], verts[4], verts[6]],
      })
    }
  }

  return shards
}

export interface ShatteredMonolithCoreProps {
  isActive: boolean
  isIgnited?: boolean
  isLockdown?: boolean
  modeProgress?: number
  shatterImpulse?: number
  onVerticesUpdate?: (vertices: THREE.Vector3[]) => void
}

export const ShatteredMonolithCore: React.FC<ShatteredMonolithCoreProps> = ({
  isActive,
  isIgnited = false,
  isLockdown = false,
  modeProgress = 0,
  shatterImpulse = 0,
  onVerticesUpdate,
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const shards = useMemo(() => generateMonolithShards(), [])

  // Create materials once
  const basaltMat = useMemo(() => createBasaltStoneMaterial(), [])
  const emissiveMat = useMemo(() => createEmissiveFractureMaterial(), [])
  const materials = useMemo(() => [basaltMat, emissiveMat], [basaltMat, emissiveMat])

  // Track each shard's live mesh reference
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  // Kinematic spring physics state
  const springState = useRef({
    currentTension: 0.0,
    velocity: 0.0,
    shatterOffset: 0.0,
  })

  // Pre-allocated scratch objects for zero GC in useFrame
  const _scratchPos = useMemo(() => new THREE.Vector3(), [])
  const _scratchFloat = useMemo(() => new THREE.Vector3(), [])
  const _scratchShudder = useMemo(() => new THREE.Vector3(), [])
  const _scratchQuat = useMemo(() => new THREE.Quaternion(), [])
  const _scratchEuler = useMemo(() => new THREE.Euler(), [])

  // Vertex tracking array to feed MonolithMicroArcs
  const liveWorldVertices = useMemo(() => {
    const totalSamples = shards.length * 4
    return Array.from({ length: totalSamples }, () => new THREE.Vector3())
  }, [shards])

  // Clean disposal on unmount
  useEffect(() => {
    return () => {
      basaltMat.dispose()
      emissiveMat.dispose()
      shards.forEach((s) => s.geometry.dispose())
    }
  }, [basaltMat, emissiveMat, shards])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    // 1. Update Emissive Fracture Shader Uniforms
    const uniforms = emissiveMat.uniforms
    uniforms.uTime.value = t
    uniforms.uModeProgress.value = modeProgress
    uniforms.uIgniteActive.value = isIgnited ? 1.0 : 0.0
    uniforms.uLockdownActive.value = isLockdown ? 1.0 : 0.0

    // 2. Second-Order Underdamped Spring Kinematics for Tension-Locking
    const targetTension = isActive ? 1.0 : 0.0
    const zeta = 0.58    // Underdamped damping ratio
    const omega = 16.0   // Natural angular frequency
    const dt = Math.min(delta, 0.05)

    // Spring-damper integration: a = -omega^2 * (x - target) - 2 * zeta * omega * v
    const disp = springState.current.currentTension - targetTension
    const springForce = -omega * omega * disp - 2.0 * zeta * omega * springState.current.velocity
    springState.current.velocity += springForce * dt
    springState.current.currentTension += springState.current.velocity * dt

    // Clamped tension progress [0, 1.15] allowing slight elastic overshoot
    const currentTension = Math.max(0.0, springState.current.currentTension)
    uniforms.uTensionProgress.value = THREE.MathUtils.clamp(currentTension, 0.0, 1.0)

    // Handle explosive shatter impulse
    if (shatterImpulse > 0.01) {
      springState.current.shatterOffset = THREE.MathUtils.lerp(springState.current.shatterOffset, shatterImpulse, dt * 10.0)
    } else {
      springState.current.shatterOffset = THREE.MathUtils.lerp(springState.current.shatterOffset, 0.0, dt * 4.0)
    }

    // 3. Tension Shudder intensity when tension is locked
    const isLocked = currentTension > 0.92 && !isLockdown
    const shudderAmp = isLocked ? (isIgnited ? 0.007 : 0.0035) : 0.0
    uniforms.uShudder.value = shudderAmp

    // 4. Update each shard transform
    let sampleIdx = 0

    shards.forEach((shard, idx) => {
      const mesh = meshRefs.current[idx]
      if (!mesh) return

      // Idle float offset (per-shard sinusoidal oscillation)
      const floatAmp = (1.0 - THREE.MathUtils.clamp(currentTension, 0.0, 1.0)) * 0.06
      _scratchFloat.set(
        Math.sin(t * shard.freq.x + shard.phase.x) * floatAmp,
        Math.cos(t * shard.freq.y + shard.phase.y) * floatAmp * 1.3,
        Math.sin(t * shard.freq.z + shard.phase.z) * floatAmp
      )

      // Tension locked micro-shudder
      if (shudderAmp > 0) {
        _scratchShudder.set(
          Math.sin(t * 36.0 + idx * 4.2) * shudderAmp,
          Math.cos(t * 42.0 + idx * 2.8) * shudderAmp,
          Math.sin(t * 31.0 + idx * 5.1) * shudderAmp
        )
      } else {
        _scratchShudder.set(0, 0, 0)
      }

      // Radial drift displacement (drifts apart when idle, snaps to 0 when active)
      const driftScalar = (1.0 - currentTension) * shard.driftDistance + springState.current.shatterOffset * 0.9

      _scratchPos.copy(shard.restPosition)
        .addScaledVector(shard.driftDirection, driftScalar)
        .add(_scratchFloat)
        .add(_scratchShudder)

      mesh.position.copy(_scratchPos)

      // Idle tumbling rotation that aligns strictly to (0,0,0) when locked
      const tumbleAngle = (1.0 - THREE.MathUtils.clamp(currentTension, 0.0, 1.0)) * 0.25 * Math.sin(t * 1.2 + idx)
      _scratchQuat.setFromAxisAngle(shard.tumbleAxis, tumbleAngle)
      mesh.quaternion.copy(_scratchQuat)

      // Collect live world vertices for micro-arc electricity
      mesh.updateMatrixWorld()
      for (let v = 0; v < shard.sampleVertices.length; v++) {
        liveWorldVertices[sampleIdx].copy(shard.sampleVertices[v]).applyMatrix4(mesh.matrixWorld)
        sampleIdx++
      }
    })

    // Broadcast updated vertex positions to micro-arcs generator
    if (onVerticesUpdate) {
      onVerticesUpdate(liveWorldVertices)
    }

    // Slow ambient rotation of the entire monolith group
    if (groupRef.current) {
      const rotSpeed = isLockdown ? 0.02 : (isIgnited ? 0.45 : 0.18)
      groupRef.current.rotation.y += delta * rotSpeed
    }
  })

  return (
    <group ref={groupRef}>
      {shards.map((shard, idx) => (
        <mesh
          key={shard.id}
          ref={(el) => {
            meshRefs.current[idx] = el
          }}
          geometry={shard.geometry}
          material={materials}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  )
}
