"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Suspense, useRef, useMemo, useState, useEffect } from "react"
import { Float, Text } from "@react-three/drei"
import * as THREE from "three"

// Ancient runes for a mystical high-tech look
const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ"]

/**
 * 3x3 CUBE SHELL ARCHITECTURE (54 Pyramids)
 * Provides high density and a classic Rubik's feel.
 */
function getUniformHexCoreFaces(radius = 2.1) {
  const faces: FaceData[] = []
  const directions = [
    new THREE.Vector3(0, 1, 0),  // Top
    new THREE.Vector3(0, -1, 0), // Bottom
    new THREE.Vector3(0, 0, 1),  // Front
    new THREE.Vector3(0, 0, -1), // Back
    new THREE.Vector3(1, 0, 0),  // Right
    new THREE.Vector3(-1, 0, 0), // Left
  ]

  const gapFactor = 0.93 // Balance between gap visibility and core concealment

  directions.forEach((dir, dirIdx) => {
    let tangent = new THREE.Vector3(1, 0, 0)
    if (Math.abs(dir.x) > 0.9) tangent = new THREE.Vector3(0, 1, 0)
    const bitangent = new THREE.Vector3().crossVectors(dir, tangent).normalize()
    tangent.crossVectors(bitangent, dir).normalize()

    // 3x3 grid vertices (from -1 to 1)
    const gridPoints = [-1, -1/3, 1/3, 1]

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const u1 = gridPoints[i], u2 = gridPoints[i+1]
        const v1 = gridPoints[j], v2 = gridPoints[j+1]

        // Corners in cube-space
        const corners = [
          dir.clone().add(tangent.clone().multiplyScalar(u1)).add(bitangent.clone().multiplyScalar(v1)),
          dir.clone().add(tangent.clone().multiplyScalar(u2)).add(bitangent.clone().multiplyScalar(v1)),
          dir.clone().add(tangent.clone().multiplyScalar(u2)).add(bitangent.clone().multiplyScalar(v2)),
          dir.clone().add(tangent.clone().multiplyScalar(u1)).add(bitangent.clone().multiplyScalar(v2)),
        ]

        // Project cube corners onto sphere
        const p = corners.map(c => c.normalize().multiplyScalar(radius))
        
        // Spherical center and normal
        const center = new THREE.Vector3().add(p[0]).add(p[1]).add(p[2]).add(p[3]).divideScalar(4)
        const normal = center.clone().normalize()

        // Apply uniform shrink for gaps
        const s = p.map(point => new THREE.Vector3().lerpVectors(center, point, gapFactor))

        faces.push({ id: `${dirIdx}-${i}-${j}`, vertices: s, center, normal })
      }
    }
  })

  return faces
}

interface FaceData {
  id: string
  vertices: THREE.Vector3[]
  center: THREE.Vector3
  normal: THREE.Vector3
}

// Global move state
const moveAxes = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)]
let currentMove = {
  axis: new THREE.Vector3(0, 1, 0),
  slice: 0, // -1, 0, or 1 for 3x3
  angle: 0,
  version: 0
}

function PolyhedronScene({ isDeepDive }: { isDeepDive: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const [assemblyProgress, setAssemblyProgress] = useState(0)
  const faces = useMemo(() => getUniformHexCoreFaces() as FaceData[], [])

  const sharedMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#05061f", 
    roughness: 0.4,
    metalness: 0.8,
  }), [])

  const currentScale = useRef(1.0)

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    if (assemblyProgress < 1) setAssemblyProgress(prev => Math.min(1, prev + 0.01))
    
    // Smooth global rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002
      groupRef.current.rotation.z += 0.001

      // Scale animation for deep dive
      const targetScale = isDeepDive ? 1.4 : 1.0;
      currentScale.current += (targetScale - currentScale.current) * delta * 5;
      groupRef.current.scale.setScalar(currentScale.current);
    }

    // High-activity Rubik sequencer
    const interval = 6.0 
    const moveSubInterval = 0.6 // Faster moves
    const moveTime = t % interval
    
    // Perform 4 moves in a rapid burst
    const moveInBurst = Math.floor(moveTime / moveSubInterval)
    const moveBatchId = Math.floor(t / interval) * 10 + moveInBurst
    
    if (moveTime < 2.4 && moveBatchId > currentMove.version) { 
      currentMove = {
        axis: moveAxes[Math.floor(Math.random() * 3)],
        slice: Math.floor(Math.random() * 3) - 1, // Randomly pick one of the 3 slices
        angle: Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2,
        version: moveBatchId
      }
    }

    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 4) * 0.05
      coreRef.current.scale.setScalar(0.5 * pulse)
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh ref={coreRef}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#4AFFB4" emissive="#4AFFB4" emissiveIntensity={25} toneMapped={false} />
        </mesh>
        <pointLight intensity={50} color="#4AFFB4" distance={10} />
        
        {faces.map((face) => (
          <Fragment key={face.id} data={face} assemblyProgress={assemblyProgress} sharedMaterial={sharedMaterial} isDeepDive={isDeepDive} />
        ))}
      </Float>
    </group>
  )
}

function Fragment({ data, assemblyProgress, sharedMaterial, isDeepDive }: { data: FaceData, assemblyProgress: number, sharedMaterial: THREE.MeshStandardMaterial, isDeepDive: boolean }) {
  const meshGroupRef = useRef<THREE.Group>(null)
  const lineMatRef = useRef<THREE.LineBasicMaterial>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textRefs = useRef<any[]>([])
  
  const stateRef = useRef({
    currentMatrix: new THREE.Matrix4(),
    targetMatrix: new THREE.Matrix4(),
    lastVersion: 0,
    currentExpansion: 0.25,
    targetExpansion: 0.25
  })

  // Deep dive color transitions
  const runeColorDefault = useMemo(() => new THREE.Color("#ffcc00"), [])
  const runeColorDeep = useMemo(() => new THREE.Color("#4A8FFF"), []) // Blue
  const currentRuneColor = useRef(new THREE.Color("#ffcc00"))

  const flyInOffset = useMemo(() => {
    let localSeed = data.center.x * 1000 + data.center.y * 100 + data.center.z * 10
    const offsets = []
    for (let i = 0; i < 3; i++) {
      localSeed = (localSeed * 1664525 + 1013904223) % 4294967296
      offsets.push((localSeed / 4294967296 - 0.5) * 20)
    }
    return new THREE.Vector3(offsets[0], offsets[1], offsets[2])
  }, [data])

  const { geometry, edgeGeo, runeData } = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const height = 0.35 // Shorter pyramids
    const apex = data.normal.clone().multiplyScalar(height)
    
    // Scale up slightly (1.2) to bridge gaps and hide core completely
    const rv = data.vertices.map(v => new THREE.Vector3().subVectors(v, data.center).multiplyScalar(1.2))
    
    const vertices = new Float32Array([
      // Base
      rv[0].x, rv[0].y, rv[0].z, rv[1].x, rv[1].y, rv[1].z, rv[2].x, rv[2].y, rv[2].z,
      rv[0].x, rv[0].y, rv[0].z, rv[2].x, rv[2].y, rv[2].z, rv[3].x, rv[3].y, rv[3].z,
      // Sides
      rv[0].x, rv[0].y, rv[0].z, rv[1].x, rv[1].y, rv[1].z, apex.x, apex.y, apex.z,
      rv[1].x, rv[1].y, rv[1].z, rv[2].x, rv[2].y, rv[2].z, apex.x, apex.y, apex.z,
      rv[2].x, rv[2].y, rv[2].z, rv[3].x, rv[3].y, rv[3].z, apex.x, apex.y, apex.z,
      rv[3].x, rv[3].y, rv[3].z, rv[0].x, rv[0].y, rv[0].z, apex.x, apex.y, apex.z,
    ])
    
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    
    // Add placeholder UVs to prevent shader fallbacks (Red/Green artifacts)
    const uvs = new Float32Array(vertices.length / 3 * 2).fill(0)
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    
    geo.computeVertexNormals()

    const sides = [[rv[0], rv[1], apex], [rv[1], rv[2], apex], [rv[2], rv[3], apex], [rv[3], rv[0], apex]]
    const runeData = sides.map((sideVertices, sideIdx) => {
      const faceCenter = new THREE.Vector3().add(sideVertices[0]).add(sideVertices[1]).add(sideVertices[2]).divideScalar(3)
      const edge1 = new THREE.Vector3().subVectors(sideVertices[1], sideVertices[0])
      const edge2 = new THREE.Vector3().subVectors(sideVertices[2], sideVertices[0])
      const faceNormal = new THREE.Vector3().crossVectors(edge1, edge2).normalize()

      // Use a stable index based on face ID and side index to satisfy React purity rules
      const hash = data.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + sideIdx
      const runeIndex = hash % RUNES.length

      return { pos: faceCenter.clone().add(faceNormal.clone().multiplyScalar(0.02)), normal: faceNormal, rune: RUNES[runeIndex] }
    })

    return { geometry: geo, edgeGeo: new THREE.EdgesGeometry(geo), runeData }
    }, [data])

    useFrame((state, delta) => {
    // Update target expansion based on mode (Reduced from 0.7 to 0.45)
    stateRef.current.targetExpansion = isDeepDive ? 0.45 : 0.25;

    // Smoothly interpolate expansion
    stateRef.current.currentExpansion += (stateRef.current.targetExpansion - stateRef.current.currentExpansion) * delta * 5;

    // Runes change to blue, but let's keep the pyramid edges golden as requested before
    // If the user meant EVERYTHING golden, I would remove this, but "runes color should still change to blue"
    currentRuneColor.current.lerp(isDeepDive ? runeColorDeep : runeColorDefault, delta * 5);

    if (lineMatRef.current) {
      // Keeping edge color golden as per "don't change the pyramid edge color to blue"
      lineMatRef.current.color.copy(runeColorDefault);
    }

    textRefs.current.forEach(t => {
      if (t) {
        // Runes get the animated color
        t.color = currentRuneColor.current.getStyle();
      }
    });

    // Synchronized multi-slice logic
    if (currentMove.version > stateRef.current.lastVersion) {
      stateRef.current.lastVersion = currentMove.version

      const { axis, slice, angle } = currentMove
      const currentLogicalPos = data.center.clone().applyMatrix4(stateRef.current.targetMatrix)

      // Determine if piece belongs to the slice (-1, 0, 1)
      const coord = currentLogicalPos.dot(axis)
      const sliceThreshold = 0.5 // Separates the 3 layers clearly

      let inSlice = false
      if (slice === 1) inSlice = coord > sliceThreshold
      else if (slice === -1) inSlice = coord < -sliceThreshold
      else inSlice = Math.abs(coord) < sliceThreshold

      if (inSlice) {
        const moveMatrix = new THREE.Matrix4().makeRotationAxis(axis, angle)
        stateRef.current.targetMatrix.premultiply(moveMatrix)
      }
    }

    if (meshGroupRef.current) {
      const matrix = stateRef.current.currentMatrix
      const target = stateRef.current.targetMatrix

      const currQuat = new THREE.Quaternion(), targetQuat = new THREE.Quaternion()
      const dummyP = new THREE.Vector3(), dummyS = new THREE.Vector3()

      matrix.decompose(dummyP, currQuat, dummyS)
      target.decompose(dummyP, targetQuat, dummyS)

      currQuat.slerp(targetQuat, 0.15) // Snappier rotation
      matrix.compose(dummyP, currQuat, dummyS)

      const expansionFactor = stateRef.current.currentExpansion
      const rotatedNormal = data.normal.clone().applyQuaternion(currQuat)
      const assembledPos = data.center.clone().applyMatrix4(matrix).add(rotatedNormal.multiplyScalar(expansionFactor))

      const currentPos = new THREE.Vector3().lerpVectors(flyInOffset, assembledPos, assemblyProgress)

      meshGroupRef.current.position.copy(currentPos)
      meshGroupRef.current.quaternion.copy(currQuat)
    }
    })

    return (
    <group ref={meshGroupRef}>
      <mesh geometry={geometry} material={sharedMaterial} />
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial 
          ref={lineMatRef} 
          color="#ffcc00" 
          opacity={0.5} 
          transparent 
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={2}
          polygonOffsetUnits={1}
        />
      </lineSegments>
      {runeData.map((rd, i) => (
        <Text
          key={i}
          ref={(el) => { textRefs.current[i] = el }}
          position={rd.pos}
          fontSize={0.28}
          color="#ffcc00"
          anchorX="center"
          anchorY="middle"
          rotation={new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), rd.normal))}
        >
          {rd.rune}
        </Text>
      ))}
    </group>
    )
    }

    export default function PolyhedronCanvas({ isDeepDive = false }: { isHovered?: boolean, isDeepDive?: boolean }) {  const [ready, setReady] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  if (!ready) return null

  return (
    <Canvas 
      camera={{ position: [0, 0, 13], fov: 35 }}
      dpr={[1, 2]}
      gl={{ alpha: true }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Suspense fallback={null}>
        <PolyhedronScene isDeepDive={isDeepDive} />
      </Suspense>
    </Canvas>
  )
}
