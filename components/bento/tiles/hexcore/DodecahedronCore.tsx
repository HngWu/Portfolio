"use client"

import React, { useMemo, useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"
import { sharedSpellState } from "../PolyhedronCanvas"

// 12 Authentic Norse Runes for the 12 pentagonal facets
const FACET_RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᛃ", "ᛈ", "ᛉ", "ᛊ"]

// Pre-allocated static colors for GC-free frame loops
const COLOR_GOLD = new THREE.Color("#ffb44a")
const COLOR_TEAL = new THREE.Color("#4AFFB4")
const COLOR_IGNITE = new THREE.Color("#ff4500")
const COLOR_LOCKDOWN = new THREE.Color("#374151")
const COLOR_RUNE_LOCKDOWN = new THREE.Color("#2E1402")

const _scratchColor = new THREE.Color()
const _scratchVec1 = new THREE.Vector3()
const _scratchVec2 = new THREE.Vector3()

// Precession axis: Golden Ratio diagonal vector (1, phi, 0)
const PHI = (1 + Math.sqrt(5)) / 2
const PRECESSED_AXIS = new THREE.Vector3(1, PHI, 0).normalize()

export const DodecahedronGlassShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;
    void main() {
      vLocalPosition = position;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vNormal = normalize(normalMatrix * normal);
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uGlowIntensity;
    uniform float uHoverActive;
    uniform float uIgniteActive;
    uniform float uLockdownActive;
    uniform float uModeProgress;
    uniform float uHeartbeatPulse;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;

    void main() {
      // Inky dark obsidian glass base (NO MURKY PURPLE)
      vec3 obsidianBase = vec3(0.012, 0.015, 0.022);
      
      // Mode energy caustics: Quick Pitch Gold (#ffb44a) vs Deep Dive Emerald Teal (#4AFFB4)
      vec3 colorGold = vec3(1.0, 0.72, 0.22);
      vec3 colorTeal = vec3(0.29, 1.0, 0.706);
      vec3 accentColor = mix(colorGold, colorTeal, uModeProgress);

      if (uIgniteActive > 0.5) {
        accentColor = vec3(1.0, 0.42, 0.08); // Blazing magma orange
        obsidianBase = vec3(0.035, 0.01, 0.01);
      } else if (uLockdownActive > 0.5) {
        accentColor = vec3(0.25, 0.35, 0.45); // Dim EMP slate
        obsidianBase = vec3(0.01, 0.012, 0.015);
      }

      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float NdotV = max(dot(normal, viewDir), 0.0);
      
      // Crisp Fresnel rim reflection on glass facets
      float fresnel = pow(1.0 - NdotV, 3.2);

      // Directional specular glints across flat pentagonal facet faces
      vec3 lightDir1 = normalize(vec3(0.8, 1.0, 0.6));
      vec3 lightDir2 = normalize(vec3(-0.8, -0.5, 1.0));
      float glint1 = pow(max(dot(reflect(-lightDir1, normal), viewDir), 0.0), 16.0);
      float glint2 = pow(max(dot(reflect(-lightDir2, normal), viewDir), 0.0), 12.0);
      float facetSpecular = glint1 * 0.65 + glint2 * 0.45;

      // Subtle prismatic edge dispersion without wireframe lines
      float facetEdge = pow(1.0 - abs(dot(normal, viewDir)), 4.0) * 0.35;

      // Composite: Translucent obsidian glass prism with radiant facet gleams
      vec3 glassColor = obsidianBase + accentColor * (fresnel * 0.75 + facetSpecular * 0.95 + facetEdge);
      
      // Translucent glass alpha (lets the inner radiant star shine through cleanly!)
      float alpha = (uLockdownActive > 0.5) ? 0.60 : 0.42;

      gl_FragColor = vec4(glassColor * uHeartbeatPulse, alpha);
    }
  `
}

export const ArcaneStarShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vLocalPosition;
    void main() {
      vLocalPosition = position;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uGlowIntensity;
    uniform float uIgniteActive;
    uniform float uLockdownActive;
    uniform float uModeProgress;
    uniform float uHeartbeatPulse;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vLocalPosition;

    void main() {
      vec3 colorGold = vec3(1.0, 0.72, 0.22);
      vec3 colorTeal = vec3(0.29, 1.0, 0.706);
      vec3 accentColor = mix(colorGold, colorTeal, uModeProgress);

      if (uIgniteActive > 0.5) {
        accentColor = vec3(1.0, 0.50, 0.12);
      } else if (uLockdownActive > 0.5) {
        accentColor = vec3(0.20, 0.30, 0.40);
      }

      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float NdotV = max(dot(normal, viewDir), 0.0);
      float rim = pow(1.0 - NdotV, 1.8);

      // Living solar surface harmonic turbulence
      float surfaceWave = sin(vLocalPosition.x * 10.0 + uTime * 3.0) * 
                          cos(vLocalPosition.y * 10.0 - uTime * 2.5) * 
                          sin(vLocalPosition.z * 10.0 + uTime * 3.5);
      float turbulence = surfaceWave * 0.18;

      // Volumetric radiant core: pure brilliant center with glowing solar corona
      vec3 coreColor = mix(accentColor * 1.5, vec3(1.0), 0.35);
      vec3 coronaColor = accentColor * (1.2 + rim * 1.4 + turbulence);
      vec3 finalStar = mix(coreColor, coronaColor, pow(1.0 - NdotV, 0.8));

      float intensity = uGlowIntensity * uHeartbeatPulse * 1.5;
      gl_FragColor = vec4(finalStar * intensity, 0.98);
    }
  `
}

interface FacetData {
  id: number
  center: THREE.Vector3
  normal: THREE.Vector3
  vertices: THREE.Vector3[] // Local vertices centered around (0,0,0)
  geometry: THREE.BufferGeometry
  edgeGeometry: THREE.BufferGeometry
  rune: string
  runeRot: THREE.Euler
}

/**
 * Mathematically generates the 12 regular pentagonal facets of a Dodecahedron
 * with outward normals, local centering, and continuous flow wireframe edges.
 */
function buildDodecahedronFacets(radius = 0.88): {
  facets: FacetData[]
  disposables: THREE.BufferGeometry[]
} {
  const phi = (1 + Math.sqrt(5)) / 2
  const b = 1 / phi
  const c = phi
  const s = radius / Math.sqrt(3)

  const rawVerts: [number, number, number][] = [
    [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
    [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
    [0, b, c], [0, b, -c], [0, -b, c], [0, -b, -c],
    [b, c, 0], [b, -c, 0], [-b, c, 0], [-b, -c, 0],
    [c, 0, b], [c, 0, -b], [-c, 0, b], [-c, 0, -b]
  ]
  const verts = rawVerts.map(v => new THREE.Vector3(v[0] * s, v[1] * s, v[2] * s))

  // 12 Face Directions corresponding to vertices of the dual icosahedron
  const faceDirs: [number, number, number][] = [
    [1, 0, phi], [-1, 0, phi], [1, 0, -phi], [-1, 0, -phi],
    [0, phi, 1], [0, -phi, 1], [0, phi, -1], [0, -phi, -1],
    [phi, 1, 0], [-phi, 1, 0], [phi, -1, 0], [-phi, -1, 0]
  ]

  const facets: FacetData[] = []
  const disposables: THREE.BufferGeometry[] = []

  faceDirs.forEach((dirArray, fIdx) => {
    const dir = new THREE.Vector3(...dirArray).normalize()

    // Find the 5 closest vertices along this face direction
    const dots = verts.map(v => ({ v, dot: v.dot(dir) }))
    dots.sort((a, b) => b.dot - a.dot)
    const faceVerts = dots.slice(0, 5).map(d => d.v.clone())

    // Face center and outward unit normal
    const center = new THREE.Vector3()
    faceVerts.forEach(v => center.add(v))
    center.divideScalar(5)
    const normal = center.clone().normalize()

    // Local orthonormal basis (tangent, bitangent) on the face plane
    let tangent = new THREE.Vector3(1, 0, 0)
    if (Math.abs(normal.x) > 0.9) tangent = new THREE.Vector3(0, 1, 0)
    const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize()
    tangent.crossVectors(bitangent, normal).normalize()

    // Sort 5 vertices in counter-clockwise order around the outward normal
    faceVerts.sort((a, b) => {
      const relA = a.clone().sub(center)
      const relB = b.clone().sub(center)
      const angleA = Math.atan2(relA.dot(bitangent), relA.dot(tangent))
      const angleB = Math.atan2(relB.dot(bitangent), relB.dot(tangent))
      return angleA - angleB
    })

    // Local centered vertices
    const localVerts = faceVerts.map(v => v.clone().sub(center))

    // Build pentagon triangle fan: (0, 1, 2), (0, 2, 3), (0, 3, 4)
    const positions = new Float32Array([
      // Triangle 1
      localVerts[0].x, localVerts[0].y, localVerts[0].z,
      localVerts[1].x, localVerts[1].y, localVerts[1].z,
      localVerts[2].x, localVerts[2].y, localVerts[2].z,
      // Triangle 2
      localVerts[0].x, localVerts[0].y, localVerts[0].z,
      localVerts[2].x, localVerts[2].y, localVerts[2].z,
      localVerts[3].x, localVerts[3].y, localVerts[3].z,
      // Triangle 3
      localVerts[0].x, localVerts[0].y, localVerts[0].z,
      localVerts[3].x, localVerts[3].y, localVerts[3].z,
      localVerts[4].x, localVerts[4].y, localVerts[4].z,
    ])

    const facetGeo = new THREE.BufferGeometry()
    facetGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    facetGeo.computeVertexNormals()
    disposables.push(facetGeo)

    // Build 5 perimeter wireframe ridge edges with continuous line coordinates
    const edgeVerts = new Float32Array(5 * 2 * 3)
    const edgeLineCoords = new Float32Array(5 * 2)
    const edgeTypes = new Float32Array(5 * 2)

    for (let i = 0; i < 5; i++) {
      const vA = localVerts[i]
      const vB = localVerts[(i + 1) % 5]
      const offset = i * 6
      edgeVerts[offset] = vA.x
      edgeVerts[offset + 1] = vA.y
      edgeVerts[offset + 2] = vA.z
      edgeVerts[offset + 3] = vB.x
      edgeVerts[offset + 4] = vB.y
      edgeVerts[offset + 5] = vB.z

      edgeLineCoords[i * 2] = i
      edgeLineCoords[i * 2 + 1] = i + 1.0
      edgeTypes[i * 2] = 1.0
      edgeTypes[i * 2 + 1] = 1.0
    }

    const edgeGeo = new THREE.BufferGeometry()
    edgeGeo.setAttribute("position", new THREE.BufferAttribute(edgeVerts, 3))
    edgeGeo.setAttribute("aLineCoord", new THREE.BufferAttribute(edgeLineCoords, 1))
    edgeGeo.setAttribute("aEdgeType", new THREE.BufferAttribute(edgeTypes, 1))
    disposables.push(edgeGeo)

    // Orientation quaternion for placing runic text flat against the pentagon normal
    const runeQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
    const runeRot = new THREE.Euler().setFromQuaternion(runeQuat)

    facets.push({
      id: fIdx,
      center,
      normal,
      vertices: localVerts,
      geometry: facetGeo,
      edgeGeometry: edgeGeo,
      rune: FACET_RUNES[fIdx % FACET_RUNES.length],
      runeRot
    })
  })

  return { facets, disposables }
}

export function DodecahedronCore({
  isDeepDive,
  isHovered
}: {
  isDeepDive: boolean
  isHovered: boolean
}) {
  const coreGroupRef = useRef<THREE.Group>(null)
  const innerStarRef = useRef<THREE.Mesh>(null)
  const coreLightRef = useRef<THREE.PointLight>(null)
  const facetGroupRefs = useRef<(THREE.Group | null)[]>([])
  const runeTextRefs = useRef<(THREE.Mesh | null)[]>([])

  // 12 Decoupled Pentagonal Facet Geometries
  const { facets, disposables } = useMemo(() => buildDodecahedronFacets(0.88), [])

  // Nested Singularity Star Geometry
  const starGeo = useMemo(() => new THREE.SphereGeometry(0.36, 32, 32), [])

  // Shaders
  const glassUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uGlowIntensity: { value: 1.05 },
    uHoverActive: { value: 0 },
    uIgniteActive: { value: 0 },
    uLockdownActive: { value: 0 },
    uModeProgress: { value: isDeepDive ? 1.0 : 0.0 },
    uHeartbeatPulse: { value: 1.0 }
  }), [isDeepDive])

  const starUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uGlowIntensity: { value: 1.25 },
    uIgniteActive: { value: 0 },
    uLockdownActive: { value: 0 },
    uModeProgress: { value: isDeepDive ? 1.0 : 0.0 },
    uHeartbeatPulse: { value: 1.0 }
  }), [isDeepDive])

  const glassMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: DodecahedronGlassShader.vertexShader,
    fragmentShader: DodecahedronGlassShader.fragmentShader,
    uniforms: glassUniforms,
    transparent: true,
    depthWrite: false
  }), [glassUniforms])

  const starMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: ArcaneStarShader.vertexShader,
    fragmentShader: ArcaneStarShader.fragmentShader,
    uniforms: starUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }), [starUniforms])

  // Wireframe Edge Flow Material
  const edgeMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `
      attribute float aLineCoord;
      varying float vLineCoord;
      void main() {
        vLineCoord = aLineCoord;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uIgnite;
      uniform float uLockdown;
      uniform float uHeartbeatPulse;
      varying float vLineCoord;

      void main() {
        float speed = (uIgnite > 0.5) ? 4.0 : (uLockdown > 0.5 ? 0.3 : 1.8);
        float wave = sin(vLineCoord * 3.5 - uTime * speed) * 0.5 + 0.5;
        float surge = pow(wave, 2.0);

        float baseGlow = (uLockdown > 0.5) ? 0.25 : 0.75;
        float intensity = (baseGlow + surge * 0.85) * uHeartbeatPulse;
        float alpha = (uLockdown > 0.5) ? 0.35 : 0.88;

        gl_FragColor = vec4(uColor * intensity, alpha);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(isDeepDive ? "#4AFFB4" : "#ffb44a") },
      uIgnite: { value: 0 },
      uLockdown: { value: 0 },
      uHeartbeatPulse: { value: 1.0 }
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }), [isDeepDive])

  // Clean resource disposal on unmount to prevent GPU memory leaks
  useEffect(() => {
    return () => {
      disposables.forEach(g => g.dispose())
      starGeo.dispose()
      glassMaterial.dispose()
      starMaterial.dispose()
      edgeMaterial.dispose()
    }
  }, [disposables, starGeo, glassMaterial, starMaterial, edgeMaterial])

  // Wrap materials in ref for zero-warning useFrame mutation under React 19
  const materialsRef = useRef({
    glass: glassMaterial,
    star: starMaterial,
    edge: edgeMaterial
  })

  // Animation Kinetics Loop
  useFrame((state, rawDelta) => {
    if (!sharedSpellState.isVisible || (typeof document !== "undefined" && document.hidden)) return
    const delta = Math.min(rawDelta, 0.1)
    const t = state.clock.getElapsedTime()

    const isIgnited = sharedSpellState.ignite
    const isLockdown = sharedSpellState.lockdown
    const modeProg = sharedSpellState.modeProgress

    // 1. Systolic Dual-Heartbeat Pulse (72 BPM living heart)
    const beatPhase = (t * 1.2) % 1.0
    const beat1 = Math.pow(Math.max(0, Math.sin(beatPhase * Math.PI * 2.0)), 6.0) * 0.08
    const beat2 = Math.pow(Math.max(0, Math.sin((beatPhase - 0.22) * Math.PI * 2.0)), 6.0) * 0.04
    const heartbeat = 1.0 + (beat1 + beat2) * (isLockdown ? 0.2 : 1.0)
    sharedSpellState.heartbeatPulse = heartbeat

    const mats = materialsRef.current

    // 2. Drive Uniforms via ref
    mats.glass.uniforms.uTime.value = t
    mats.glass.uniforms.uModeProgress.value = modeProg
    mats.glass.uniforms.uHeartbeatPulse.value = heartbeat * sharedSpellState.pulseScale
    mats.glass.uniforms.uIgniteActive.value = isIgnited ? 1.0 : 0.0
    mats.glass.uniforms.uLockdownActive.value = isLockdown ? 1.0 : 0.0

    mats.star.uniforms.uTime.value = t
    mats.star.uniforms.uModeProgress.value = modeProg
    mats.star.uniforms.uHeartbeatPulse.value = heartbeat * sharedSpellState.pulseScale
    mats.star.uniforms.uIgniteActive.value = isIgnited ? 1.0 : 0.0
    mats.star.uniforms.uLockdownActive.value = isLockdown ? 1.0 : 0.0

    mats.edge.uniforms.uTime.value = t
    mats.edge.uniforms.uHeartbeatPulse.value = heartbeat * sharedSpellState.pulseScale
    mats.edge.uniforms.uIgnite.value = isIgnited ? 1.0 : 0.0
    mats.edge.uniforms.uLockdown.value = isLockdown ? 1.0 : 0.0

    // Dynamic Edge & Rune Color Transition
    const targetColor = _scratchColor.copy(COLOR_GOLD).lerp(COLOR_TEAL, modeProg)
    if (isIgnited) targetColor.copy(COLOR_IGNITE)
    else if (isLockdown) targetColor.copy(COLOR_LOCKDOWN)
    mats.edge.uniforms.uColor.value.lerp(targetColor, delta * 6.0)

    // 3. Golden-Ratio Precession Rotation (Outer Dodecahedron)
    if (coreGroupRef.current) {
      let speed = isIgnited ? 0.77 : (isLockdown ? 0.0 : 0.22)
      if (isHovered) speed *= 1.25
      coreGroupRef.current.rotateOnAxis(PRECESSED_AXIS, speed * delta)

      // Zero-G Antigravity 3D Float Drift
      if (sharedSpellState.antigravity) {
        coreGroupRef.current.position.set(
          Math.sin(t * 0.9) * 0.15,
          Math.cos(t * 1.1) * 0.18,
          Math.sin(t * 1.3) * 0.15
        )
      } else {
        coreGroupRef.current.position.lerp(_scratchVec2.set(0, 0, 0), delta * 6.0)
      }

      // Base Scale Pulse
      const basePulse = isIgnited ? (1.12 + Math.sin(t * 16.0) * 0.08) : (isLockdown ? 0.92 : 1.0)
      coreGroupRef.current.scale.setScalar(0.78 * basePulse * sharedSpellState.pulseScale)
    }

    // 4. Counter-Rotating Inner Singularity Star
    if (innerStarRef.current) {
      const starSpeed = isIgnited ? 2.4 : (isLockdown ? 0.0 : 0.65)
      innerStarRef.current.rotation.y -= starSpeed * delta
      innerStarRef.current.rotation.x += starSpeed * 0.4 * delta
    }

    // 5. Facet Blooming & Runic Orbital Shimmer Wave
    const shatterProg = sharedSpellState.shatterProgress
    facets.forEach((f, idx) => {
      const facetGroup = facetGroupRefs.current[idx]
      if (facetGroup) {
        // Normal outward translation during click / shatter
        const blossomDist = shatterProg * 0.68
        _scratchVec1.copy(f.normal).multiplyScalar(blossomDist)
        facetGroup.position.copy(_scratchVec1)

        // Subtle individual facet tumble during shatter
        if (shatterProg > 0.01) {
          const tumble = shatterProg * 0.35
          facetGroup.rotation.x = Math.sin(t * 3.0 + idx) * tumble
          facetGroup.rotation.y = Math.cos(t * 2.5 + idx) * tumble
        } else {
          facetGroup.rotation.set(0, 0, 0)
        }
      }

      // Asynchronous Runic Traveling Wave Shimmer
      const textMesh = runeTextRefs.current[idx]
      if (textMesh && textMesh.material && !Array.isArray(textMesh.material)) {
        const mat = textMesh.material as THREE.MeshBasicMaterial
        // Orbital wave phase across the 12 faces
        const wave = Math.sin(t * 2.4 + (idx * Math.PI * 2) / 12) * 0.5 + 0.5
        const runeOpacity = isLockdown ? 0.25 : 0.65 + wave * 0.35
        mat.opacity = runeOpacity

        const runeCol = _scratchColor.copy(COLOR_GOLD).lerp(COLOR_TEAL, modeProg)
        if (isIgnited) runeCol.copy(COLOR_IGNITE)
        else if (isLockdown) runeCol.copy(COLOR_RUNE_LOCKDOWN)
        mat.color.copy(runeCol)
      }
    })

    // 6. Synchronized Point Light
    if (coreLightRef.current) {
      let targetIntensity = isIgnited ? 6.5 : (isLockdown ? 0.5 : 2.5 * heartbeat)
      if (shatterProg > 0.01) targetIntensity += shatterProg * 4.5
      coreLightRef.current.intensity = THREE.MathUtils.lerp(coreLightRef.current.intensity, targetIntensity, delta * 8.0)
      coreLightRef.current.color.lerp(targetColor, delta * 6.0)
    }
  })

  return (
    <group ref={coreGroupRef}>
      {/* 12 Decoupled Pentagonal Glass Facets */}
      {facets.map((facet, idx) => (
        <group
          key={facet.id}
          position={facet.center}
        >
          <group ref={el => { facetGroupRefs.current[idx] = el }}>
            {/* Obsidian Glass Pentagon Face */}
            <mesh geometry={facet.geometry} material={glassMaterial} />

            {/* Glowing Wireframe Ridge Seams */}
            <lineSegments geometry={facet.edgeGeometry} material={edgeMaterial} />

            {/* Etched Norse Rune Sigil */}
            <Text
              ref={el => { runeTextRefs.current[idx] = el as THREE.Mesh | null }}
              position={[facet.normal.x * 0.025, facet.normal.y * 0.025, facet.normal.z * 0.025]}
              rotation={facet.runeRot}
              fontSize={0.24}
              font="/fonts/NotoSansRunic-Regular.ttf"
              anchorX="center"
              anchorY="middle"
            >
              <meshBasicMaterial
                color={isDeepDive ? "#4AFFB4" : "#ffb44a"}
                toneMapped={false}
                transparent
                depthWrite={false}
              />
              {facet.rune}
            </Text>
          </group>
        </group>
      ))}

      {/* Nested Radiant Arcane Star Singularity */}
      <mesh ref={innerStarRef} geometry={starGeo} material={starMaterial} />

      {/* Concentric Dynamic Core Point Light */}
      <pointLight ref={coreLightRef} intensity={2.5} color={isDeepDive ? "#4AFFB4" : "#ffb44a"} distance={8} />
    </group>
  )
}
