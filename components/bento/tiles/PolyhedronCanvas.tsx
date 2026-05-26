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

interface RuneData {
  pos: THREE.Vector3
  rot: THREE.Euler
  rune: string
}

// Global move state — module-level, shared across all frames
const moveAxes = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)]
const currentMove = {
  axis: new THREE.Vector3(0, 1, 0),
  slice: 0, // -1, 0, or 1 for 3x3
  angle: 0,
  version: 0
}

// Helper function to build a mathematically perfect 3D rectangular torus (solid flat-sided ring)
function makeRectangularTorus(radius: number, tube: number, radialScale: number, zScale: number) {
  const geo = new THREE.TorusGeometry(radius, tube, 4, 64)
  const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
  const normalAttr = geo.getAttribute('normal') as THREE.BufferAttribute
  
  const cosA = Math.cos(Math.PI / 4)
  const sinA = Math.sin(Math.PI / 4)
  
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i)
    const y = posAttr.getY(i)
    const z = posAttr.getZ(i)
    
    const theta = Math.atan2(y, x)
    const cosT = Math.cos(theta)
    const sinT = Math.sin(theta)
    
    const d_radial = x * cosT + y * sinT - radius
    const d_z = z
    
    const d_radial_new = d_radial * cosA - d_z * sinA
    const d_z_new = d_radial * sinA + d_z * cosA
    
    const d_radial_scaled = d_radial_new * radialScale
    const d_z_scaled = d_z_new * zScale
    
    posAttr.setXYZ(i, (radius + d_radial_scaled) * cosT, (radius + d_radial_scaled) * sinT, d_z_scaled)
    
    const nx = normalAttr.getX(i)
    const ny = normalAttr.getY(i)
    const nz = normalAttr.getZ(i)
    
    const n_radial = nx * cosT + ny * sinT
    const n_z = nz
    
    const n_radial_new = n_radial * cosA - n_z * sinA
    const n_z_new = n_radial * sinA + n_z * cosA
    
    normalAttr.setXYZ(i, n_radial_new * cosT, n_radial_new * sinT, n_z_new)
  }
  
  posAttr.needsUpdate = true
  normalAttr.needsUpdate = true
  
  return geo
}

function PolyhedronScene({ isHovered, isDeepDive }: { isHovered: boolean, isDeepDive: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const ring1Ref = useRef<THREE.Group>(null)
  const ring2Ref = useRef<THREE.Group>(null)
  const coreLightRef = useRef<THREE.PointLight>(null)

  const [assemblyProgress, setAssemblyProgress] = useState(0)
  const faces = useMemo(() => getUniformHexCoreFaces() as FaceData[], [])

  const sharedMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#05061f", 
    roughness: 0.4,
    metalness: 0.8,
  }), [])

  const currentScale = useRef(1.0)

  // Mathematically perfect 3D rectangular cuboid rings
  const { ring1Geo, ring2Geo } = useMemo(() => {
    return {
      ring1Geo: makeRectangularTorus(1.5, 0.28, 0.45, 2.2),
      ring2Geo: makeRectangularTorus(1.9, 0.28, 0.45, 2.2)
    }
  }, [])

  // Concentric Rings: Custom GLSL Runic Shader Materials
  // useRef (not useMemo) so mutations inside useFrame don't violate react-hooks/immutability
  const _mat1Ref = useRef<THREE.ShaderMaterial | null>(null)
  if (!_mat1Ref.current) {
    _mat1Ref.current = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          vNormal = normalize(normalMatrix * normal);
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uGlowColor;
        uniform float uTime;
        uniform float uFresnelPower;
        uniform float uGlowIntensity;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), uFresnelPower);
          float scanline = sin(vWorldPosition.y * 20.0 - uTime * 4.0) * 0.5 + 0.5;
          scanline = pow(scanline, 3.0) * 0.3;
          float pulse = 0.85 + 0.15 * sin(uTime * 3.0);
          vec3 glow = uGlowColor * fresnel * uGlowIntensity * pulse;
          vec3 finalColor = uColor + glow + uGlowColor * scanline;
          float alpha = 0.85 + 0.15 * fresnel;
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color("#ffffff") },
        uGlowColor: { value: new THREE.Color("#4AFFB4") }, // Neon Mint
        uTime: { value: 0 },
        uFresnelPower: { value: 2.0 },
        uGlowIntensity: { value: 0.6 }
      },
      transparent: true,
      depthWrite: true,
    })
  }
  const runicShaderMaterial1 = _mat1Ref.current!

  const _mat2Ref = useRef<THREE.ShaderMaterial | null>(null)
  if (!_mat2Ref.current) {
    _mat2Ref.current = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          vNormal = normalize(normalMatrix * normal);
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uGlowColor;
        uniform float uTime;
        uniform float uFresnelPower;
        uniform float uGlowIntensity;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), uFresnelPower);
          float scanline = sin(vWorldPosition.y * 15.0 + uTime * 3.5) * 0.5 + 0.5;
          scanline = pow(scanline, 3.0) * 0.3;
          float pulse = 0.85 + 0.15 * sin(uTime * 2.5);
          vec3 glow = uGlowColor * fresnel * uGlowIntensity * pulse;
          vec3 finalColor = uColor + glow + uGlowColor * scanline;
          float alpha = 0.85 + 0.15 * fresnel;
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color("#ffffff") },
        uGlowColor: { value: new THREE.Color("#4A8FFF") }, // Neon Blue
        uTime: { value: 0 },
        uFresnelPower: { value: 2.0 },
        uGlowIntensity: { value: 0.6 }
      },
      transparent: true,
      depthWrite: true,
    })
  }
  const runicShaderMaterial2 = _mat2Ref.current!

  // Position and orient runes around outer face of Ring 1
  const ring1Runes = useMemo<RuneData[]>(() => {
    const N = 12
    const radiusRune = 1.5 + (0.28 * Math.cos(Math.PI / 4) * 0.45) + 0.015
    const runesData: RuneData[] = []
    for (let i = 0; i < N; i++) {
      const theta = (2 * Math.PI * i) / N
      const pos = new THREE.Vector3(radiusRune * Math.cos(theta), radiusRune * Math.sin(theta), 0)
      const matrix = new THREE.Matrix4().makeBasis(
        new THREE.Vector3(-Math.sin(theta), Math.cos(theta), 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(Math.cos(theta), Math.sin(theta), 0)
      )
      const rot = new THREE.Euler().setFromRotationMatrix(matrix)
      const runeIndex = (i * 7 + 3) % RUNES.length
      runesData.push({ pos, rot, rune: RUNES[runeIndex] })
    }
    return runesData
  }, [])

  // Position and orient runes around outer face of Ring 2
  const ring2Runes = useMemo<RuneData[]>(() => {
    const N = 16
    const radiusRune = 1.9 + (0.28 * Math.cos(Math.PI / 4) * 0.45) + 0.015
    const runesData: RuneData[] = []
    for (let i = 0; i < N; i++) {
      const theta = (2 * Math.PI * i) / N
      const pos = new THREE.Vector3(radiusRune * Math.cos(theta), radiusRune * Math.sin(theta), 0)
      const matrix = new THREE.Matrix4().makeBasis(
        new THREE.Vector3(-Math.sin(theta), Math.cos(theta), 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(Math.cos(theta), Math.sin(theta), 0)
      )
      const rot = new THREE.Euler().setFromRotationMatrix(matrix)
      const runeIndex = (i * 11 + 5) % RUNES.length
      runesData.push({ pos, rot, rune: RUNES[runeIndex] })
    }
    return runesData
  }, [])

  // Ring Inertia Damping Velocities
  const ring1SpeedX = useRef(0.6)
  const ring1SpeedY = useRef(0.4)
  const ring2SpeedY = useRef(-0.5)
  const ring2SpeedZ = useRef(0.7)

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    if (assemblyProgress < 1) setAssemblyProgress(prev => Math.min(1, prev + 0.01))
    
    // Global scanline uniforms
    runicShaderMaterial1.uniforms.uTime.value = t
    runicShaderMaterial2.uniforms.uTime.value = t

    // Handle Ignite Magma Overload Shaders override
    const igniteActive = typeof window !== 'undefined' ? !!(window as unknown as Record<string, unknown>).__technomancy_ignite : false
    if (igniteActive) {
      runicShaderMaterial1.uniforms.uGlowColor.value.set("#FF4A00")
      runicShaderMaterial1.uniforms.uColor.value.set("#220A00")
      runicShaderMaterial2.uniforms.uGlowColor.value.set("#FF8800")
      runicShaderMaterial2.uniforms.uColor.value.set("#220A00")
      runicShaderMaterial1.uniforms.uGlowIntensity.value = 1.6 + Math.sin(t * 18.0) * 0.4
      runicShaderMaterial2.uniforms.uGlowIntensity.value = 1.6 + Math.cos(t * 18.0) * 0.4
    } else {
      // Keep consistent Quick Pitch (Magic) colors in all modes: Neon Emerald & Warm Gold
      runicShaderMaterial1.uniforms.uGlowColor.value.set("#4AFFB4")
      runicShaderMaterial2.uniforms.uGlowColor.value.set("#FFB44A")
      runicShaderMaterial1.uniforms.uColor.value.set("#ffffff")
      runicShaderMaterial2.uniforms.uColor.value.set("#ffffff")
      runicShaderMaterial1.uniforms.uGlowIntensity.value = 0.6
      runicShaderMaterial2.uniforms.uGlowIntensity.value = 0.6
    }

    // Smooth global rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002
      groupRef.current.rotation.z += 0.001

      // Scale animation for deep dive (disabled overall scale to keep core and rings stable, only outer shell fragments expand)
      const targetScale = 1.0
      currentScale.current += (targetScale - currentScale.current) * delta * 5
      groupRef.current.scale.setScalar(currentScale.current)
    }

    // Gyroscopic Speed Damping with Inertia Coasting
    const speedMultiplier = isHovered ? 2.5 : 1.0
    const target1X = 0.6 * speedMultiplier
    const target1Y = 0.4 * speedMultiplier
    const target2Y = -0.5 * speedMultiplier
    const target2Z = 0.7 * speedMultiplier

    ring1SpeedX.current = THREE.MathUtils.lerp(ring1SpeedX.current, target1X, delta * 3.0)
    ring1SpeedY.current = THREE.MathUtils.lerp(ring1SpeedY.current, target1Y, delta * 3.0)
    ring2SpeedY.current = THREE.MathUtils.lerp(ring2SpeedY.current, target2Y, delta * 3.0)
    ring2SpeedZ.current = THREE.MathUtils.lerp(ring2SpeedZ.current, target2Z, delta * 3.0)

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * ring1SpeedX.current
      ring1Ref.current.rotation.y += delta * ring1SpeedY.current
      
      const targetRotZ = state.pointer.x * 0.4
      ring1Ref.current.rotation.z = THREE.MathUtils.lerp(ring1Ref.current.rotation.z, targetRotZ, delta * 2.0)
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y += delta * ring2SpeedY.current
      ring2Ref.current.rotation.z += delta * ring2SpeedZ.current

      const targetRotX = state.pointer.y * 0.4
      ring2Ref.current.rotation.x = THREE.MathUtils.lerp(ring2Ref.current.rotation.x, targetRotX, delta * 2.0)
    }

    // High-activity Rubik sequencer (maintain beautiful background rotation batches)
    const interval = 6.0 
    const moveSubInterval = 0.6
    const moveTime = t % interval
    
    const moveInBurst = Math.floor(moveTime / moveSubInterval)
    const moveBatchId = Math.floor(t / interval) * 10 + moveInBurst
    
    if (moveTime < 2.4 && moveBatchId > currentMove.version) { 
      currentMove.axis = moveAxes[Math.floor(Math.random() * 3)]
      currentMove.slice = Math.floor(Math.random() * 3) - 1
      currentMove.angle = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2
      currentMove.version = moveBatchId
    }

    // Core pulsing & lightning flickers
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 4) * 0.05
      let emissiveIntensity = 25
      
      const lightningActive = typeof window !== 'undefined' ? !!(window as unknown as Record<string, unknown>).__technomancy_lightning : false
      if (lightningActive) {
        emissiveIntensity = Math.random() > 0.35 ? 130 : 8
      }
      
      coreRef.current.scale.setScalar(0.72 * pulse)
      const coreColor = "#4AFFB4"
      if (coreRef.current.material && !Array.isArray(coreRef.current.material)) {
        const mat = coreRef.current.material as THREE.MeshStandardMaterial
        mat.color.set(coreColor)
        mat.emissive.set(coreColor)
        mat.emissiveIntensity = emissiveIntensity
      }
    }

    if (coreLightRef.current) {
      const coreColor = "#4AFFB4"
      coreLightRef.current.color.set(coreColor)
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh ref={coreRef}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#4AFFB4" emissive="#4AFFB4" emissiveIntensity={25} toneMapped={false} />
        </mesh>
        <pointLight ref={coreLightRef} intensity={50} color="#4AFFB4" distance={10} />
        
        {/* Ring 1: Robust 3D Cuboid Ring (Custom Shader Material) with Dark Engraved Runes */}
        <group ref={ring1Ref} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <mesh geometry={ring1Geo} material={runicShaderMaterial1} />
          {ring1Runes.map((rd, i) => (
            <Text
              key={i}
              position={rd.pos}
              rotation={rd.rot}
              fontSize={0.15}
              font="/fonts/NotoSansRunic-Regular.ttf"
              anchorX="center"
              anchorY="middle"
            >
              <meshBasicMaterial color="#000000" toneMapped={false} depthWrite={true} />
              {rd.rune}
            </Text>
          ))}
        </group>

        {/* Ring 2: Robust 3D Cuboid Ring (Custom Shader Material) with Dark Engraved Runes */}
        <group ref={ring2Ref} rotation={[-Math.PI / 4, 0, Math.PI / 4]}>
          <mesh geometry={ring2Geo} material={runicShaderMaterial2} />
          {ring2Runes.map((rd, i) => (
            <Text
              key={i}
              position={rd.pos}
              rotation={rd.rot}
              fontSize={0.18}
              font="/fonts/NotoSansRunic-Regular.ttf"
              anchorX="center"
              anchorY="middle"
            >
              <meshBasicMaterial color="#000000" toneMapped={false} depthWrite={true} />
              {rd.rune}
            </Text>
          ))}
        </group>

        {faces.map((face) => (
          <PyramidFragment key={face.id} data={face} assemblyProgress={assemblyProgress} sharedMaterial={sharedMaterial} isDeepDive={isDeepDive} />
        ))}
      </Float>
    </group>
  )
}

// Renamed from Fragment (conflicts with React.Fragment) to PyramidFragment
function PyramidFragment({ data, assemblyProgress, sharedMaterial, isDeepDive }: { data: FaceData, assemblyProgress: number, sharedMaterial: THREE.MeshStandardMaterial, isDeepDive: boolean }) {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const runeColorDeep = useMemo(() => new THREE.Color("#4A8FFF"), []) // Blue — reserved for future deep dive mode
  const currentRuneColor = useRef(new THREE.Color("#ffcc00"))

  const flyInOffset = useMemo(() => {
    let localSeed = data.center.x * 1000 + data.center.y * 100 + data.center.z * 10
    const offsets: number[] = []
    for (let i = 0; i < 3; i++) {
      localSeed = (localSeed * 1664525 + 1013904223) % 4294967296
      offsets.push((localSeed / 4294967296 - 0.5) * 20)
    }
    return new THREE.Vector3(offsets[0], offsets[1], offsets[2])
  }, [data])

  const { geometry, edgeGeo, runeData } = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const height = 0.35
    const apex = data.normal.clone().multiplyScalar(height)
    
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
    
    const uvs = new Float32Array(vertices.length / 3 * 2).fill(0)
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    
    geo.computeVertexNormals()

    const sides = [[rv[0], rv[1], apex], [rv[1], rv[2], apex], [rv[2], rv[3], apex], [rv[3], rv[0], apex]]
    const runeData = sides.map((sideVertices, sideIdx) => {
      const faceCenter = new THREE.Vector3().add(sideVertices[0]).add(sideVertices[1]).add(sideVertices[2]).divideScalar(3)
      const edge1 = new THREE.Vector3().subVectors(sideVertices[1], sideVertices[0])
      const edge2 = new THREE.Vector3().subVectors(sideVertices[2], sideVertices[0])
      const faceNormal = new THREE.Vector3().crossVectors(edge1, edge2).normalize()

      const hash = data.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + sideIdx
      const runeIndex = hash % RUNES.length

      return { pos: faceCenter.clone().add(faceNormal.clone().multiplyScalar(0.02)), normal: faceNormal, rune: RUNES[runeIndex] }
    })

    return { geometry: geo, edgeGeo: new THREE.EdgesGeometry(geo), runeData }
  }, [data])

  useFrame((state, delta) => {
    // High-performance scroll percentage solver
    const docH = typeof document !== 'undefined' ? document.documentElement.scrollHeight : 1000
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800
    const maxScroll = docH - winH
    const scrollPercent = maxScroll > 0 && typeof window !== 'undefined' ? window.scrollY / maxScroll : 0

    // Ignite Spell verification
    const igniteActive = typeof window !== 'undefined' ? !!(window as unknown as Record<string, unknown>).__technomancy_ignite : false

    // Base expansion
    let targetExp = isDeepDive ? 0.45 : 0.25

    // Add scroll-driven vertex explosion (expands up to 3.5 extra radius!)
    targetExp += scrollPercent * 3.5

    // Add CLI ignite overload explosion (stronger pulsing explosion)
    if (igniteActive) {
      targetExp += 2.8 + Math.sin(state.clock.getElapsedTime() * 12.0) * 0.4
    }

    stateRef.current.targetExpansion = targetExp
    stateRef.current.currentExpansion += (stateRef.current.targetExpansion - stateRef.current.currentExpansion) * delta * 5.0

    currentRuneColor.current.lerp(runeColorDefault, delta * 5.0)

    if (lineMatRef.current) {
      lineMatRef.current.color.copy(currentRuneColor.current)
    }

    textRefs.current.forEach(t => {
      if (t) {
        t.color = currentRuneColor.current.getStyle()
      }
    })

    if (currentMove.version > stateRef.current.lastVersion) {
      stateRef.current.lastVersion = currentMove.version

      const { axis, slice, angle } = currentMove
      const currentLogicalPos = data.center.clone().applyMatrix4(stateRef.current.targetMatrix)

      const coord = currentLogicalPos.dot(axis)
      const sliceThreshold = 0.5

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

      // Use separate decompose vectors to avoid overwrite bugs
      const currQuat = new THREE.Quaternion()
      const targetQuat = new THREE.Quaternion()
      const currPos = new THREE.Vector3()
      const currScale = new THREE.Vector3()
      const dummyP = new THREE.Vector3()
      const dummyS = new THREE.Vector3()

      matrix.decompose(currPos, currQuat, currScale)
      target.decompose(dummyP, targetQuat, dummyS)

      currQuat.slerp(targetQuat, 0.15)
      // Recompose using the current matrix's own position and scale (not the target's)
      matrix.compose(currPos, currQuat, currScale)

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
          // @ts-ignore
          toneMapped={false}
          font="/fonts/NotoSansRunic-Regular.ttf"
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

export default function PolyhedronCanvas({ isHovered = false, isDeepDive = false }: { isHovered?: boolean, isDeepDive?: boolean }) {
  const [ready, setReady] = useState(false)
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
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={3.5} />
      <directionalLight position={[-10, 8, -5]} intensity={2} color="#ffffff" />
      <Suspense fallback={null}>
        <PolyhedronScene isHovered={isHovered} isDeepDive={isDeepDive} />
      </Suspense>
    </Canvas>
  )
}
