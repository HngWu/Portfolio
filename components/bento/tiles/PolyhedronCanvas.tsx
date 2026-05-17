"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Suspense, useRef, useMemo, useState, useEffect } from "react"
import { Float } from "@react-three/drei"
import * as THREE from "three"

// Helper to get triangle vertices for an icosahedron face
function getIcosahedronFaces() {
  const geo = new THREE.IcosahedronGeometry(1.5, 0)
  const pos = geo.getAttribute('position')
  const faces = []
  
  for (let i = 0; i < pos.count; i += 3) {
    const v1 = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i))
    const v2 = new THREE.Vector3(pos.getX(i+1), pos.getY(i+1), pos.getZ(i+1))
    const v3 = new THREE.Vector3(pos.getX(i+2), pos.getY(i+2), pos.getZ(i+2))
    
    const center = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3)
    const normal = center.clone().normalize()
    
    faces.push({ v1, v2, v3, center, normal })
  }
  return faces
}

interface FaceData {
  v1: THREE.Vector3
  v2: THREE.Vector3
  v3: THREE.Vector3
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
  const faces = useMemo(() => getIcosahedronFaces() as FaceData[], [])

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
    // Deterministic pseudo-random for React 19 purity rules
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
    const vertices = new Float32Array([
      data.v1.x - data.center.x, data.v1.y - data.center.y, data.v1.z - data.center.z,
      data.v2.x - data.center.x, data.v2.y - data.center.y, data.v2.z - data.center.z,
      data.v3.x - data.center.x, data.v3.y - data.center.y, data.v3.z - data.center.z,
    ])
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
