"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Suspense, useRef, useMemo, useState, useEffect } from "react"
import { Float } from "@react-three/drei"
import * as THREE from "three"

// Helper to get faces from a low-poly sphere (quads + triangles at poles)
function getShellFaces(radius = 1.5, widthSeg = 12, heightSeg = 8) {
  const geo = new THREE.SphereGeometry(radius, widthSeg, heightSeg)
  const pos = geo.getAttribute('position')
  const faces = []

  // SphereGeometry vertices are organized in a grid [heightSeg + 1][widthSeg + 1]
  for (let y = 0; y < heightSeg; y++) {
    for (let x = 0; x < widthSeg; x++) {
      const v1_idx = y * (widthSeg + 1) + x
      const v2_idx = y * (widthSeg + 1) + (x + 1)
      const v3_idx = (y + 1) * (widthSeg + 1) + (x + 1)
      const v4_idx = (y + 1) * (widthSeg + 1) + x

      const v1 = new THREE.Vector3().fromBufferAttribute(pos, v1_idx)
      const v2 = new THREE.Vector3().fromBufferAttribute(pos, v2_idx)
      const v3 = new THREE.Vector3().fromBufferAttribute(pos, v3_idx)
      const v4 = new THREE.Vector3().fromBufferAttribute(pos, v4_idx)

      // Top pole triangles
      if (y === 0) {
        const center = new THREE.Vector3().add(v1).add(v3).add(v4).divideScalar(3)
        faces.push({ type: 'tri', vertices: [v1, v3, v4], center, normal: center.clone().normalize() })
      } 
      // Bottom pole triangles
      else if (y === heightSeg - 1) {
        const center = new THREE.Vector3().add(v1).add(v2).add(v4).divideScalar(3)
        faces.push({ type: 'tri', vertices: [v1, v2, v4], center, normal: center.clone().normalize() })
      } 
      // Middle quads
      else {
        const center = new THREE.Vector3().add(v1).add(v2).add(v3).add(v4).divideScalar(4)
        faces.push({ type: 'quad', vertices: [v1, v2, v3, v4], center, normal: center.clone().normalize() })
      }
    }
  }
  return faces
}

interface FaceData {
  type: 'tri' | 'quad'
  vertices: THREE.Vector3[]
  center: THREE.Vector3
  normal: THREE.Vector3
}

interface FragmentProps {
  data: FaceData
  isHovered: boolean
  assemblyProgress: number
  scrollProgress: number
  sharedMaterial: THREE.MeshPhysicalMaterial
}

function PolyhedronScene({ isHovered }: { isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const [assemblyProgress, setAssemblyProgress] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const faces = useMemo(() => getShellFaces() as FaceData[], [])

  const sharedMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    transmission: 0.8,
    thickness: 0.5,
    roughness: 0.1,
    ior: 1.2,
    color: "#1a1a1a",
    transparent: true,
  }), [])

  useEffect(() => {
    const handleScroll = () => {
      const scroll = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
      setScrollProgress(scroll)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useFrame((state) => {
    if (assemblyProgress < 1) setAssemblyProgress(prev => Math.min(1, prev + 0.01))
    
    if (groupRef.current) {
      const targetRX = state.mouse.y * 0.5
      const targetRY = -state.mouse.x * 0.5
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRX, 0.05)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRY, 0.05)
      groupRef.current.rotation.z += 0.002
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh scale={isHovered ? 0.8 : 0.4}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#4AFFB4" emissive="#4AFFB4" emissiveIntensity={isHovered ? 15 : 2} transparent opacity={0.8} />
        </mesh>
        <pointLight intensity={isHovered ? 20 : 5} color="#4AFFB4" distance={5} />
        {faces.map((face, i) => (
          <Fragment key={i} data={face} isHovered={isHovered} assemblyProgress={assemblyProgress} scrollProgress={scrollProgress} sharedMaterial={sharedMaterial} />
        ))}
      </Float>
    </group>
  )
}

function Fragment({ data, isHovered, assemblyProgress, scrollProgress, sharedMaterial }: FragmentProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const flyInOffset = useMemo(() => {
    let localSeed = data.center.x * 1000 + data.center.y * 100 + data.center.z * 10
    const offsets = []
    for (let i = 0; i < 3; i++) {
      localSeed = (localSeed * 1664525 + 1013904223) % 4294967296
      offsets.push((localSeed / 4294967296 - 0.5) * 20)
    }
    return new THREE.Vector3(offsets[0], offsets[1], offsets[2])
  }, [data])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    // Pyramid apex (pointed outward)
    const height = 0.4
    const apex = data.normal.clone().multiplyScalar(height)
    
    // Relative vertices (centered at 0,0,0)
    const rv = data.vertices.map(v => new THREE.Vector3().subVectors(v, data.center))
    
    let vertices: Float32Array
    if (data.type === 'quad') {
      // 5 faces for square pyramid: base (2 tris) + 4 sides
      vertices = new Float32Array([
        // Base
        rv[0].x, rv[0].y, rv[0].z, rv[1].x, rv[1].y, rv[1].z, rv[2].x, rv[2].y, rv[2].z,
        rv[0].x, rv[0].y, rv[0].z, rv[2].x, rv[2].y, rv[2].z, rv[3].x, rv[3].y, rv[3].z,
        // Sides
        rv[0].x, rv[0].y, rv[0].z, rv[1].x, rv[1].y, rv[1].z, apex.x, apex.y, apex.z,
        rv[1].x, rv[1].y, rv[1].z, rv[2].x, rv[2].y, rv[2].z, apex.x, apex.y, apex.z,
        rv[2].x, rv[2].y, rv[2].z, rv[3].x, rv[3].y, rv[3].z, apex.x, apex.y, apex.z,
        rv[3].x, rv[3].y, rv[3].z, rv[0].x, rv[0].y, rv[0].z, apex.x, apex.y, apex.z,
      ])
    } else {
      // 4 faces for triangle pyramid: base (1 tri) + 3 sides
      vertices = new Float32Array([
        // Base
        rv[0].x, rv[0].y, rv[0].z, rv[1].x, rv[1].y, rv[1].z, rv[2].x, rv[2].y, rv[2].z,
        // Sides
        rv[0].x, rv[0].y, rv[0].z, rv[1].x, rv[1].y, rv[1].z, apex.x, apex.y, apex.z,
        rv[1].x, rv[1].y, rv[1].z, rv[2].x, rv[2].y, rv[2].z, apex.x, apex.y, apex.z,
        rv[2].x, rv[2].y, rv[2].z, rv[0].x, rv[0].y, rv[0].z, apex.x, apex.y, apex.z,
      ])
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    geo.computeVertexNormals()
    return geo
  }, [data])

  useFrame(() => {
    if (meshRef.current) {
      const targetPos = data.center.clone()
      const explodeFactor = isHovered ? 1.5 : 0
      targetPos.add(data.normal.clone().multiplyScalar(explodeFactor))
      
      const scrollFactor = scrollProgress * 2
      targetPos.add(data.normal.clone().multiplyScalar(scrollFactor))
      
      const currentPos = new THREE.Vector3().lerpVectors(flyInOffset, targetPos, assemblyProgress)
      meshRef.current.position.copy(currentPos)
      
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, isHovered ? data.normal.y : 0, 0.1)
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, isHovered ? data.normal.z : 0, 0.1)
    }
  })

  return (
    <mesh ref={meshRef} material={sharedMaterial}>
      <primitive object={geometry} attach="geometry" />
    </mesh>
  )
}

export default function PolyhedronCanvas({ isHovered }: { isHovered: boolean }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  if (!ready) return null

  return (
    <Canvas 
      camera={{ position: [0, 0, 8], fov: 35 }}
      dpr={[1, 2]}
      gl={{ alpha: true }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Suspense fallback={null}>
        <PolyhedronScene isHovered={isHovered} />
      </Suspense>
    </Canvas>
  )
}
