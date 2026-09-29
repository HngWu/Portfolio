"use client"

import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const UP = new THREE.Vector3(0, 1, 0)
const COLOR_GOLD = new THREE.Color("#ffb44a")
const COLOR_CYAN = new THREE.Color("#4AFFB4") // Radiant Cyber Cyan-Green micro-arcs
const COLOR_IGNITE = new THREE.Color("#ff4500")

interface MonolithMicroArcsProps {
  getShardVertices: () => THREE.Vector3[]
  modeProgress?: number
  isIgnited?: boolean
  isLockdown?: boolean
  tensionProgress?: number
}

interface ArcInstance {
  idxA: number
  idxB: number
  life: number
  maxLife: number
  intensity: number
}

export const MonolithMicroArcs: React.FC<MonolithMicroArcsProps> = ({
  getShardVertices,
  modeProgress = 0,
  isIgnited = false,
  isLockdown = false,
  tensionProgress = 0,
}) => {
  const lineRef = useRef<THREE.LineSegments>(null)
  const lineGeoRef = useRef<THREE.BufferGeometry>(null)

  const numArcs = 18
  const segmentsPerArc = 16
  const totalVertices = numArcs * segmentsPerArc * 2

  // 1. Long-lived pre-allocated buffers for zero-allocation useFrame updates
  const positions = useMemo(() => new Float32Array(totalVertices * 3), [totalVertices])
  const colors = useMemo(() => new Float32Array(totalVertices * 3), [totalVertices])

  // 2. Pre-allocated vector scratch pools
  const maxSubdivPoints = 33
  const calcPoints = useMemo(() => Array.from({ length: maxSubdivPoints }, () => new THREE.Vector3()), [])
  const tempPoints = useMemo(() => Array.from({ length: maxSubdivPoints }, () => new THREE.Vector3()), [])
  const scratchPool = useMemo(() => Array.from({ length: 64 }, () => new THREE.Vector3()), [])
  const poolIdx = useRef(0)

  const getScratch = () => {
    const v = scratchPool[poolIdx.current]
    poolIdx.current = (poolIdx.current + 1) % 64
    return v
  }

  // 3. Arc instance states
  const arcs = useRef<ArcInstance[]>(
    Array.from({ length: numArcs }, () => ({
      idxA: 0,
      idxB: 1,
      life: 0,
      maxLife: Math.floor(Math.random() * 4) + 3,
      intensity: 1.0,
    }))
  )

  // Midpoint displacement generator for jagged electric fractal line segments
  const generateArcPath = (
    pA: THREE.Vector3,
    pB: THREE.Vector3,
    displace: number,
    numSegs: number,
    outOffset: number,
    arcColor: THREE.Color,
    intensity: number
  ) => {
    calcPoints[0].copy(pA)
    calcPoints[1].copy(pB)
    let currentDisplace = displace
    let currentCount = 1

    const iterations = Math.round(Math.log2(numSegs))
    for (let i = 0; i < iterations; i++) {
      const ptCount = currentCount + 1
      for (let k = 0; k < ptCount; k++) {
        tempPoints[k].copy(calcPoints[k])
      }

      calcPoints[0].copy(tempPoints[0])
      for (let j = 0; j < ptCount - 1; j++) {
        const pt1 = tempPoints[j]
        const pt2 = tempPoints[j + 1]
        const midIdx = j * 2 + 1
        const pt2Idx = j * 2 + 2

        calcPoints[pt2Idx].copy(pt2)

        const mid = calcPoints[midIdx].addVectors(pt1, pt2).multiplyScalar(0.5)
        const dir = getScratch().subVectors(pt2, pt1).normalize()
        const tangent = getScratch().crossVectors(dir, UP).normalize()
        if (tangent.lengthSq() < 0.01) tangent.set(1, 0, 0)
        const angle = Math.random() * Math.PI * 2
        tangent.applyAxisAngle(dir, angle)
        mid.addScaledVector(tangent, (Math.random() - 0.5) * currentDisplace)
      }
      currentCount *= 2
      currentDisplace *= 0.52
    }

    // Write straight to pre-allocated flat typed arrays
    let vIdx = outOffset * 3
    const finalPoints = currentCount + 1
    for (let i = 0; i < finalPoints - 1; i++) {
      const pt1 = calcPoints[i]
      const pt2 = calcPoints[i + 1]

      // Start vertex
      positions[vIdx] = pt1.x
      positions[vIdx + 1] = pt1.y
      positions[vIdx + 2] = pt1.z

      colors[vIdx] = arcColor.r * intensity
      colors[vIdx + 1] = arcColor.g * intensity
      colors[vIdx + 2] = arcColor.b * intensity
      vIdx += 3

      // End vertex
      positions[vIdx] = pt2.x
      positions[vIdx + 1] = pt2.y
      positions[vIdx + 2] = pt2.z

      colors[vIdx] = arcColor.r * intensity
      colors[vIdx + 1] = arcColor.g * intensity
      colors[vIdx + 2] = arcColor.b * intensity
      vIdx += 3
    }
  }

  const baseColor = useMemo(() => new THREE.Color(), [])
  const targetColor = useMemo(() => new THREE.Color(), [])

  useFrame(() => {
    if (!lineGeoRef.current) return

    if (isLockdown) {
      // Lockdown halts all electrical discharges
      lineGeoRef.current.setDrawRange(0, 0)
      return
    }

    const shardVertices = getShardVertices()
    const vertexCount = shardVertices.length
    if (vertexCount < 4) {
      lineGeoRef.current.setDrawRange(0, 0)
      return
    }

    // Determine current electric hue
    targetColor.copy(COLOR_GOLD).lerp(COLOR_CYAN, modeProgress)
    if (isIgnited) {
      targetColor.copy(COLOR_IGNITE)
    }
    baseColor.lerp(targetColor, 0.15)

    const stride = segmentsPerArc * 2
    let activeVertexSegments = 0

    // Arc strike displacement scaled by idle gap size
    const baseDisplacement = (1.0 - tensionProgress * 0.35) * 0.18

    // Tension-adaptive distance threshold: allows arcs across tight cleavage gaps when tension-locked
    const minDistance = THREE.MathUtils.lerp(0.12, 0.02, tensionProgress)
    const maxDistance = THREE.MathUtils.lerp(1.5, 0.95, tensionProgress)

    for (let a = 0; a < numArcs; a++) {
      const arc = arcs.current[a]
      arc.life++

      if (arc.life >= arc.maxLife) {
        // Strike a new pair of nearby vertices across shard gaps
        arc.life = 0
        arc.maxLife = Math.floor(Math.random() * (tensionProgress > 0.5 ? 3 : 4)) + 2
        arc.intensity = (tensionProgress > 0.5 ? 1.3 : 0.85) + Math.random() * 0.8

        arc.idxA = Math.floor(Math.random() * vertexCount)
        // Find a neighboring vertex that is close, but not identical
        let bestIdxB = (arc.idxA + 1) % vertexCount
        let minD = 999
        for (let tries = 0; tries < 8; tries++) {
          const cand = Math.floor(Math.random() * vertexCount)
          if (cand === arc.idxA) continue
          const d = shardVertices[arc.idxA].distanceTo(shardVertices[cand])
          if (d > minDistance && d < maxDistance && d < minD) {
            minD = d
            bestIdxB = cand
          }
        }
        arc.idxB = bestIdxB
      }

      const pA = shardVertices[arc.idxA]
      const pB = shardVertices[arc.idxB]

      if (pA && pB) {
        const flicker = (Math.sin(arc.life * 4.0) * 0.5 + 0.5) * arc.intensity
        generateArcPath(
          pA,
          pB,
          baseDisplacement,
          segmentsPerArc,
          a * stride,
          baseColor,
          flicker
        )
        activeVertexSegments += stride
      }
    }

    const posAttr = lineGeoRef.current.attributes.position as THREE.BufferAttribute
    const colAttr = lineGeoRef.current.attributes.color as THREE.BufferAttribute

    if (posAttr && colAttr) {
      posAttr.needsUpdate = true
      colAttr.needsUpdate = true
      lineGeoRef.current.setDrawRange(0, activeVertexSegments)
    }
  })

  return (
    <lineSegments ref={lineRef} raycast={() => {}}>
      <bufferGeometry ref={lineGeoRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={totalVertices}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={totalVertices}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        linewidth={1.8}
        transparent
        opacity={0.92}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </lineSegments>
  )
}
