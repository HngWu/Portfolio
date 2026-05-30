"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Suspense, useRef, useMemo, useState, useEffect } from "react"
import { Float, Text } from "@react-three/drei"
import * as THREE from "three"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"

// Ancient runes for a mystical high-tech look
const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ"]

const RUNE_LORES: Record<string, string> = {
  "ᚠ": "Vex - Flow: Transmutative catalyst",
  "ᚢ": "Sol - Bind: Gravitational binding",
  "ᚦ": "Kai - Shatter: Volumetric kinetic force",
  "ᚨ": "Orn - Root: Crystalline stabilization",
  "ᚱ": "Myr - Seek: Directed tracking resonance",
  "ᚲ": "Tha - Hold: Cohesive energy shell",
  "ᚷ": "Alg - Ward: Deflective energy shield",
  "ᚹ": "Sig - Flash: Electrical burst ionization"
}

// Module-level shared states for zero-lag frame communication
const sharedSpellState = {
  antigravity: false,
  ignite: false,
  lightning: false,
  lockdown: false,
  shatterProgress: 0,
  pulseScale: 1.0,
  hitPoint: new THREE.Vector3(),
  isHit: false,
  modeProgress: 0.0 // 0 for quick pitch (gold), 1 for deep dive (default indigo)
}

// 3D Simplex Noise GLSL helper embedded inside the Plasma core shader
const SIMPLEX_NOISE_GLSL = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - D.yyy;

  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0) )
           + i.y + vec4(0.0, i1.y, i2.y, 1.0) )
           + i.x + vec4(0.0, i1.x, i2.x, 1.0) );

  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}
`

/**
 * 3x3 CUBE SHELL ARCHITECTURE (54 Pyramids)
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

  const gapFactor = 0.93

  directions.forEach((dir, dirIdx) => {
    let tangent = new THREE.Vector3(1, 0, 0)
    if (Math.abs(dir.x) > 0.9) tangent = new THREE.Vector3(0, 1, 0)
    const bitangent = new THREE.Vector3().crossVectors(dir, tangent).normalize()
    tangent.crossVectors(bitangent, dir).normalize()

    const gridPoints = [-1, -1/3, 1/3, 1]

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const u1 = gridPoints[i], u2 = gridPoints[i+1]
        const v1 = gridPoints[j], v2 = gridPoints[j+1]

        const corners = [
          dir.clone().add(tangent.clone().multiplyScalar(u1)).add(bitangent.clone().multiplyScalar(v1)),
          dir.clone().add(tangent.clone().multiplyScalar(u2)).add(bitangent.clone().multiplyScalar(v1)),
          dir.clone().add(tangent.clone().multiplyScalar(u2)).add(bitangent.clone().multiplyScalar(v2)),
          dir.clone().add(tangent.clone().multiplyScalar(u1)).add(bitangent.clone().multiplyScalar(v2)),
        ]

        const p = corners.map(c => c.normalize().multiplyScalar(radius))
        const center = new THREE.Vector3().add(p[0]).add(p[1]).add(p[2]).add(p[3]).divideScalar(4)
        const normal = center.clone().normalize()
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

// Global Rubik move state
const moveAxes = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)]
const currentMove = {
  axis: new THREE.Vector3(0, 1, 0),
  slice: 0,
  angle: 0,
  version: 0
}

function makeRectangularTorus(
  radius: number, 
  tube: number, 
  radialScale: number, 
  zScale: number
): THREE.BufferGeometry {
  const baseGeo = new THREE.TorusGeometry(radius, tube, 4, 64)
  const geo = baseGeo.toNonIndexed()
  baseGeo.dispose()
  
  const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
  if (!posAttr) return geo
  
  const cosA = Math.cos(Math.PI / 4)
  const sinA = Math.sin(Math.PI / 4)
  
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i)
    const y = posAttr.getY(i)
    const z = posAttr.getZ(i)
    
    // Optimize: calculate radial distance directly to avoid Math.atan2, Math.cos, and Math.sin calls
    const r = Math.sqrt(x * x + y * y)
    const cosT = r > 0.0001 ? x / r : 1
    const sinT = r > 0.0001 ? y / r : 0
    
    // d_radial = x * cosT + y * sinT - radius => simplifies to r - radius
    const d_radial = r - radius
    const d_z = z
    
    // Rotate cross-section by 45 degrees
    const d_radial_new = d_radial * cosA - d_z * sinA
    const d_z_new = d_radial * sinA + d_z * cosA
    
    // Scale along radial and z axes
    const d_radial_scaled = d_radial_new * radialScale
    const d_z_scaled = d_z_new * zScale
    
    posAttr.setXYZ(i, (radius + d_radial_scaled) * cosT, (radius + d_radial_scaled) * sinT, d_z_scaled)
  }
  
  geo.computeVertexNormals()
  return geo
}

/**
 * CUSTOM PLASMA ENERGY HEART SHADER
 */
function createPlasmaMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      void main() {
        vUv = uv;
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
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      ${SIMPLEX_NOISE_GLSL}

      void main() {
        // Mode interpolation: Quick Pitch (0.0, Gold theme) vs Deep Dive (1.0, Default Arcane)
        vec3 colorVoidBase  = vec3(0.09, 0.03, 0.18); // Arcane Deep Violet
        vec3 colorTealBase  = vec3(0.02, 0.94, 0.70); // Arcane Electric Teal
        vec3 colorWhiteBase = vec3(1.0, 1.0, 1.0);

        vec3 colorVoidGold  = vec3(0.18, 0.08, 0.0);  // Warm Gold Void
        vec3 colorTealGold  = vec3(1.0, 0.73, 0.08);  // Shiny Yellow Gold

        vec3 colorVoid  = mix(colorVoidGold, colorVoidBase, uModeProgress);
        vec3 colorTeal  = mix(colorTealGold, colorTealBase, uModeProgress);
        vec3 colorWhite = colorWhiteBase;

        if (uIgniteActive > 0.5) {
          colorVoid  = vec3(0.18, 0.01, 0.01); // Dark Magma
          colorTeal  = vec3(1.0, 0.47, 0.0);   // Smoldering Gold/Orange
        } else if (uLockdownActive > 0.5) {
          colorVoid  = vec3(0.06, 0.08, 0.14); // Low-power Slate Blue
          colorTeal  = vec3(0.48, 0.27, 0.05); // Dim Amber
        }

        // Noise waves
        float noise = snoise(vWorldPosition * 2.8 + vec3(0.0, uTime * 0.75, 0.0));
        float pulse = 0.85 + 0.15 * sin(uTime * 3.5);
        
        // Base mixing
        vec3 mixColor = mix(colorVoid, colorTeal, noise * 0.5 + 0.5);
        
        // Emissive center hotspot
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
        
        mixColor = mix(mixColor, colorWhite, fresnel * 0.7 * pulse);
        
        // Lissajous Energy Filaments in UV Space
        float fil1 = sin(vUv.x * 25.0 + sin(uTime * 1.5)) * cos(vUv.y * 25.0 - cos(uTime * 1.5));
        float fil2 = sin(vUv.y * 35.0 - uTime * 2.0) * cos(vUv.x * 15.0 + uTime * 1.0);
        float filament = pow(abs(fil1 * fil2), 3.5) * 0.35;
        vec3 filamentColor = (uIgniteActive > 0.5) ? vec3(1.0, 0.9, 0.4) : mix(vec3(1.0, 0.88, 0.5), vec3(0.8, 0.95, 1.0), uModeProgress);
        mixColor += filament * filamentColor;

        // Emanating radial halo rings
        float dist = length(vViewPosition.xy);
        float ringWave = sin(dist * 12.0 - uTime * 5.0) * 0.5 + 0.5;
        float ring = pow(ringWave, 10.0) * 0.15 * (1.0 - clamp(dist / 3.0, 0.0, 1.0));
        mixColor += ring * colorTeal;

        float finalGlow = uGlowIntensity * (1.0 + uHoverActive * 0.8) * pulse;
        gl_FragColor = vec4(mixColor * finalGlow, 0.95);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uGlowIntensity: { value: 2.0 },
      uHoverActive: { value: 0 },
      uIgniteActive: { value: 0 },
      uLockdownActive: { value: 0 },
      uModeProgress: { value: 0.0 }
    },
    transparent: true
  })
}

/**
 * ANIMATED LATTICE EDGE GLOW SHADER
 */
function createEdgeGlowMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor1; 
      uniform vec3 uColor2; 
      uniform float uHover;
      uniform float uIgnite;
      uniform float uLockdown;
      varying vec3 vWorldPosition;
      void main() {
        float wave = sin(vWorldPosition.y * 2.5 - uTime * 3.5) * 0.5 + 0.5;
        vec3 col = mix(uColor1, uColor2, wave);

        if (uIgnite > 0.5) {
          col = mix(vec3(1.0, 0.29, 0.0), vec3(1.0, 0.82, 0.0), wave);
        } else if (uLockdown > 0.5) {
          col = mix(vec3(0.1, 0.13, 0.22), vec3(0.48, 0.27, 0.05), wave);
        }

        // Energy current dashed sparks
        float dash = sin(vWorldPosition.x * 8.0 + vWorldPosition.y * 8.0 + vWorldPosition.z * 8.0 - uTime * 5.0) * 0.5 + 0.5;
        dash = 0.35 + 0.65 * pow(dash, 3.5);

        // VIBRANT, HIGH-CONTRAST GLOW - Boosted Baseline & Peak
        float opacity = 0.20 + 0.40 * dash * (0.4 + uHover * 0.6);
        if (uLockdown > 0.5) opacity *= 0.25;

        // Multiply col by an HDR multiplier so it glows brilliantly under Bloom
        float glowIntensity = 2.5 + uHover * 2.5;
        if (uIgnite > 0.5) glowIntensity *= 2.0;

        gl_FragColor = vec4(col * glowIntensity, opacity);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#ffe875") }, // Golden default
      uColor2: { value: new THREE.Color("#ffb44a") }, 
      uHover: { value: 0 },
      uIgnite: { value: 0 },
      uLockdown: { value: 0 }
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
}

/**
 * DYNAMIC RUNIC RING SHADER MATERIAL
 */
function createRunicRingMaterial(glowColorStr: string) {
  return new THREE.ShaderMaterial({
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
      uniform float uModeProgress;
      uniform float uIgnite;
      uniform float uLockdown;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), uFresnelPower);
        
        // Animated scanline wave
        float scanline = sin(vWorldPosition.y * 15.0 - uTime * 4.0) * 0.5 + 0.5;
        scanline = pow(scanline, 3.0) * 0.3;
        float pulse = 0.85 + 0.15 * sin(uTime * 3.0);
        
        // Mode transition color blends (Quick Pitch Gold vs Deep Dive default)
        vec3 goldGlow = vec3(1.0, 0.73, 0.08); // Gold relic glow
        vec3 activeGlow = mix(goldGlow, uGlowColor, uModeProgress);
        
        vec3 goldBase = vec3(0.18, 0.08, 0.0); // Gold base
        vec3 activeBase = mix(goldBase, uColor, uModeProgress);
        
        if (uIgnite > 0.5) {
          activeBase = vec3(0.18, 0.01, 0.01);
          activeGlow = vec3(1.0, 0.45, 0.0);
        } else if (uLockdown > 0.5) {
          activeBase = vec3(0.06, 0.08, 0.14);
          activeGlow = vec3(0.48, 0.27, 0.05);
        }
        
        vec3 glow = activeGlow * fresnel * uGlowIntensity * pulse;
        vec3 finalColor = activeBase + glow + activeGlow * scanline;
        float alpha = 0.85 + 0.15 * fresnel;
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    uniforms: {
      uColor: { value: new THREE.Color("#0c0a1a") },
      uGlowColor: { value: new THREE.Color(glowColorStr) },
      uTime: { value: 0 },
      uFresnelPower: { value: 2.0 },
      uGlowIntensity: { value: 0.8 },
      uModeProgress: { value: 0.0 },
      uIgnite: { value: 0.0 },
      uLockdown: { value: 0.0 }
    },
    transparent: true,
    depthWrite: true,
  })
}



/**
 * ANTIGRAVITY FALLING DUST STREAM
 */
function GravityParticles() {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 200
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6
      pos[i * 3 + 1] = Math.random() * 5 - 2
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6
      vel[i * 3 + 1] = -(0.5 + Math.random() * 1.2) // fall speed
    }
    return [pos, vel]
  }, [])

  useFrame((state, delta) => {
    const active = sharedSpellState.antigravity
    if (pointsRef.current) {
      pointsRef.current.visible = active
    }
    if (!active) return

    const geo = pointsRef.current?.geometry
    if (!geo) return
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3 + 1] += velocities[i3 + 1] * delta // fall downwards
      
      // Turbulence
      positions[i3] += (Math.random() - 0.5) * 0.1 * delta
      positions[i3 + 2] += (Math.random() - 0.5) * 0.1 * delta

      if (positions[i3 + 1] < -3.0) {
        // Recycle to top
        positions[i3] = (Math.random() - 0.5) * 6
        positions[i3 + 1] = 3.0
        positions[i3 + 2] = (Math.random() - 0.5) * 6
      }
    }
    posAttr.needsUpdate = true
  })

  const dustTex = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 16
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8)
      grad.addColorStop(0, 'rgba(100, 200, 255, 0.9)')
      grad.addColorStop(0.5, 'rgba(40, 90, 255, 0.4)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 16, 16)
    }
    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.16} 
        map={dustTex} 
        transparent 
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  )
}

/**
 * FRACTAL LIGHTNING ARCS GENERATION (MIDPOINT DISPLACEMENT)
 */
function generateLightningPath(start: THREE.Vector3, end: THREE.Vector3, detail = 4, displace = 0.35) {
  let points = [start, end]
  for (let d = 0; d < detail; d++) {
    const nextPoints: THREE.Vector3[] = []
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i]
      const p2 = points[i+1]
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)
      
      const dir = new THREE.Vector3().subVectors(p2, p1).normalize()
      let tangent = new THREE.Vector3(1, 0, 0)
      if (Math.abs(dir.x) > 0.9) tangent = new THREE.Vector3(0, 1, 0)
      const normal = new THREE.Vector3().crossVectors(dir, tangent).normalize()
      
      const shift = normal.clone().multiplyScalar((Math.random() - 0.5) * displace)
      mid.add(shift)
      
      nextPoints.push(p1, mid)
    }
    nextPoints.push(points[points.length - 1])
    points = nextPoints
    displace *= 0.5
  }
  return points
}

function LightningArcs({ faces }: { faces: FaceData[] }) {
  const lineRef = useRef<THREE.LineSegments>(null)
  
  useFrame((state) => {
    const active = sharedSpellState.lightning
    
    // Check Detonation Act (0.50 to 0.75 scroll)
    const docH = typeof document !== 'undefined' ? document.documentElement.scrollHeight : 1000
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800
    const maxScroll = docH - winH
    const scrollPercent = maxScroll > 0 && typeof window !== 'undefined' ? window.scrollY / maxScroll : 0
    const isDetonationAct = scrollPercent > 0.50 && scrollPercent < 0.75

    const showLightning = active || (isDetonationAct && Math.random() > 0.3)
    
    if (lineRef.current) {
      lineRef.current.visible = !!showLightning
    }
    if (!showLightning || !lineRef.current) return

    const lineGeo = lineRef.current.geometry
    const vertices: number[] = []
    
    const count = 3
    for (let l = 0; l < count; l++) {
      const p1Idx = Math.floor(Math.random() * faces.length)
      let p2Idx = Math.floor(Math.random() * faces.length)
      if (p1Idx === p2Idx) p2Idx = (p2Idx + 1) % faces.length
      
      const f1 = faces[p1Idx]
      const f2 = faces[p2Idx]
      
      // Centroid positions
      const p1 = f1.center.clone().multiplyScalar(1.3)
      const p2 = f2.center.clone().multiplyScalar(1.3)
      
      const path = generateLightningPath(p1, p2, 4, 0.45)
      for (let i = 0; i < path.length - 1; i++) {
        vertices.push(path[i].x, path[i].y, path[i].z)
        vertices.push(path[i+1].x, path[i+1].y, path[i+1].z)
      }
    }
    
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    lineGeo.attributes.position.needsUpdate = true
  })

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial 
        color="#ffffff" 
        linewidth={1.5} 
        transparent 
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </lineSegments>
  )
}

/**
 * MAIN 3D POLYHEDRON SCENE
 */
function PolyhedronScene({ 
  isHovered, 
  isDeepDive, 
  onHoverFragment 
}: { 
  isHovered: boolean, 
  isDeepDive: boolean,
  onHoverFragment: (rune: string | null, name: string | null, desc: string | null) => void 
}) {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const ring1Ref = useRef<THREE.Group>(null)
  const ring2Ref = useRef<THREE.Group>(null)
  const ring3Ref = useRef<THREE.Group>(null)
  const coreLightRef = useRef<THREE.PointLight>(null)
  const resonanceLineGeoRef = useRef<THREE.BufferGeometry>(null)
  const pyramidsGroupRef = useRef<THREE.Group>(null)

  const [assemblyProgress, setAssemblyProgress] = useState(0)
  const faces = useMemo(() => getUniformHexCoreFaces(2.32) as FaceData[], [])

  const { ring1Geo, ring2Geo, ring3Geo } = useMemo(() => {
    return {
      ring1Geo: makeRectangularTorus(1.5, 0.28, 0.45, 2.2),
      ring2Geo: makeRectangularTorus(1.9, 0.28, 0.45, 2.2),
      ring3Geo: makeRectangularTorus(2.3, 0.22, 0.45, 2.2)
    }
  }, [])

  // Shaders
  const coreMaterial = useMemo(() => createPlasmaMaterial(), [])
  const edgeMaterial = useMemo(() => createEdgeGlowMaterial(), [])

  // Concentric Rings: Beautiful custom Runic Shader Materials
  const ring1Material = useMemo(() => createRunicRingMaterial("#4AFFB4"), [])
  const ring2Material = useMemo(() => createRunicRingMaterial("#4A8FFF"), [])
  const ring3Material = useMemo(() => createRunicRingMaterial("#9f4aff"), [])

  // Shared single PBR material for optimal 54-pyramid rendering and smooth mode color transition
  const sharedMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#c9a227", // Starts as Premium Warm Gold
    roughness: 0.12,
    metalness: 0.95,
    bumpScale: 0.05
  }), [])

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

  // Gymbal speeds
  const ring1SpeedX = useRef(0.6)
  const ring1SpeedY = useRef(0.4)
  const ring2SpeedY = useRef(-0.5)
  const ring2SpeedZ = useRef(0.7)
  const ring3SpeedX = useRef(0.3)
  const ring3SpeedZ = useRef(-0.4)

  const currentScale = useRef(1.0)
  const currentMagneticTilt = useRef(new THREE.Euler(0, 0, 0))

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    if (assemblyProgress < 1) setAssemblyProgress(prev => Math.min(1, prev + 0.01))

    // 1. Smooth mode transition logic: Quick Pitch (isDeepDive=false -> Gold) to Deep Dive (isDeepDive=true -> Indigo PBR)
    const targetMode = isDeepDive ? 1.0 : 0.0
    sharedSpellState.modeProgress = THREE.MathUtils.lerp(sharedSpellState.modeProgress, targetMode, delta * 3.5)

    // Drive modeProgress into Core Shader
    coreMaterial.uniforms.uModeProgress.value = sharedSpellState.modeProgress

    // Smooth transition for face material color
    const goldColor = new THREE.Color("#c9a227") // Warm metallic gold
    const defaultColor = new THREE.Color("#0c0a1a") // Deep void indigo
    sharedMaterial.color.copy(goldColor).lerp(defaultColor, sharedSpellState.modeProgress)
    
    sharedMaterial.roughness = THREE.MathUtils.lerp(0.12, 0.22, sharedSpellState.modeProgress)
    sharedMaterial.metalness = THREE.MathUtils.lerp(0.95, 0.9, sharedSpellState.modeProgress)

    // Smooth transition for edge colors
    const goldEdge1 = new THREE.Color("#ffe875")
    const goldEdge2 = new THREE.Color("#ffb44a")
    const defaultEdge1 = new THREE.Color("#6A0DAD") // Violet
    const defaultEdge2 = new THREE.Color("#4AFFB4") // Teal
    
    edgeMaterial.uniforms.uColor1.value.copy(goldEdge1).lerp(defaultEdge1, sharedSpellState.modeProgress)
    edgeMaterial.uniforms.uColor2.value.copy(goldEdge2).lerp(defaultEdge2, sharedSpellState.modeProgress)

    // Drive Shaders Time uniform
    coreMaterial.uniforms.uTime.value = t
    edgeMaterial.uniforms.uTime.value = t
    
    // Drive uniforms to Ring Shaders
    const ringMats = [ring1Material, ring2Material, ring3Material]
    ringMats.forEach(mat => {
      mat.uniforms.uTime.value = t
      mat.uniforms.uModeProgress.value = sharedSpellState.modeProgress
      mat.uniforms.uIgnite.value = sharedSpellState.ignite ? 1.0 : 0.0
      mat.uniforms.uLockdown.value = sharedSpellState.lockdown ? 1.0 : 0.0
    })

    // Drive special Spell states to Shaders
    coreMaterial.uniforms.uIgniteActive.value = sharedSpellState.ignite ? 1.0 : 0.0
    coreMaterial.uniforms.uLockdownActive.value = sharedSpellState.lockdown ? 1.0 : 0.0
    edgeMaterial.uniforms.uIgnite.value = sharedSpellState.ignite ? 1.0 : 0.0
    edgeMaterial.uniforms.uLockdown.value = sharedSpellState.lockdown ? 1.0 : 0.0

    // Capture pointer ray hits for 54 fragment Proximity Swells
    const { raycaster, pointer, camera } = state
    raycaster.setFromCamera(pointer, camera)
    
    // Intersect objects in group
    if (pyramidsGroupRef.current) {
      const intersects = raycaster.intersectObjects(pyramidsGroupRef.current.children, true)
      const pyrMeshIntersects = intersects.filter(i => i.object.name === "pyramid-mesh")
      if (pyrMeshIntersects.length > 0) {
        sharedSpellState.hitPoint.copy(pyrMeshIntersects[0].point)
        sharedSpellState.isHit = true
      } else {
        sharedSpellState.isHit = false
      }
    }

    // Scroll progress calculations
    const docH = typeof document !== 'undefined' ? document.documentElement.scrollHeight : 1000
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800
    const maxScroll = docH - winH
    const scrollPercent = maxScroll > 0 && typeof window !== 'undefined' ? window.scrollY / maxScroll : 0

    // Act 3 Detonation: Camera Dolly Closer
    const act3Progress = THREE.MathUtils.clamp((scrollPercent - 0.50) / 0.25, 0, 1)
    camera.position.z = THREE.MathUtils.lerp(13, 9, act3Progress)

    // Gyroscopic Damping Ring Spin rates
    let speedMult = isHovered ? 2.5 : 1.0
    if (sharedSpellState.lockdown) speedMult = 0.0 // Freeze rings on EMP lockdown
    if (sharedSpellState.ignite) speedMult = 5.0    // Overload speed

    const target1X = 0.6 * speedMult
    const target1Y = 0.4 * speedMult
    const target2Y = -0.5 * speedMult
    const target2Z = 0.7 * speedMult
    const target3X = 0.3 * speedMult
    const target3Z = -0.4 * speedMult

    ring1SpeedX.current = THREE.MathUtils.lerp(ring1SpeedX.current, target1X, delta * 3.0)
    ring1SpeedY.current = THREE.MathUtils.lerp(ring1SpeedY.current, target1Y, delta * 3.0)
    ring2SpeedY.current = THREE.MathUtils.lerp(ring2SpeedY.current, target2Y, delta * 3.0)
    ring2SpeedZ.current = THREE.MathUtils.lerp(ring2SpeedZ.current, target2Z, delta * 3.0)
    ring3SpeedX.current = THREE.MathUtils.lerp(ring3SpeedX.current, target3X, delta * 3.0)
    ring3SpeedZ.current = THREE.MathUtils.lerp(ring3SpeedZ.current, target3Z, delta * 3.0)

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * ring1SpeedX.current
      ring1Ref.current.rotation.y += delta * ring1SpeedY.current
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y += delta * ring2SpeedY.current
      ring2Ref.current.rotation.z += delta * ring2SpeedZ.current
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x += delta * ring3SpeedX.current
      ring3Ref.current.rotation.z += delta * ring3SpeedZ.current
    }

    // Dynamic Plane Intersection Beam (Mathematics)
    if (ring1Ref.current && ring2Ref.current && resonanceLineGeoRef.current) {
      const q1 = ring1Ref.current.quaternion
      const q2 = ring2Ref.current.quaternion
      const n1 = new THREE.Vector3(0, 0, 1).applyQuaternion(q1)
      const n2 = new THREE.Vector3(0, 0, 1).applyQuaternion(q2)
      
      const dir = new THREE.Vector3().crossVectors(n1, n2).normalize()
      const p1 = dir.clone().multiplyScalar(-2.3)
      const p2 = dir.clone().multiplyScalar(2.3)
      
      const pts = new Float32Array([p1.x, p1.y, p1.z, p2.x, p2.y, p2.z])
      resonanceLineGeoRef.current.setAttribute('position', new THREE.BufferAttribute(pts, 3))
      resonanceLineGeoRef.current.attributes.position.needsUpdate = true
    }

    // Core pulsing & lightning flickers
    if (coreRef.current) {
      let corePulse = 1.0 + Math.sin(t * 5.0) * 0.05
      
      if (sharedSpellState.ignite) {
        corePulse = 1.05 + Math.sin(t * 18.0) * 0.15
        coreMaterial.uniforms.uGlowIntensity.value = 3.5 + Math.sin(t * 18.0) * 0.8
      } else if (sharedSpellState.lockdown) {
        corePulse = 0.90
        coreMaterial.uniforms.uGlowIntensity.value = 0.4
      } else {
        coreMaterial.uniforms.uGlowIntensity.value = 2.0
      }

      coreRef.current.scale.setScalar(0.72 * corePulse * sharedSpellState.pulseScale)
    }

    // 5.1 Hover Magnetic spring-damped Tilt
    let targetTiltX = 0
    let targetTiltY = 0
    if (isHovered) {
      targetTiltX = pointer.y * 0.32 // Pitch up/down
      targetTiltY = pointer.x * 0.38 // Yaw left/right
      coreMaterial.uniforms.uHoverActive.value = THREE.MathUtils.lerp(coreMaterial.uniforms.uHoverActive.value, 1.0, delta * 6.0)
      edgeMaterial.uniforms.uHover.value = THREE.MathUtils.lerp(edgeMaterial.uniforms.uHover.value, 1.0, delta * 6.0)
    } else {
      coreMaterial.uniforms.uHoverActive.value = THREE.MathUtils.lerp(coreMaterial.uniforms.uHoverActive.value, 0.0, delta * 6.0)
      edgeMaterial.uniforms.uHover.value = THREE.MathUtils.lerp(edgeMaterial.uniforms.uHover.value, 0.0, delta * 6.0)
    }

    currentMagneticTilt.current.x = THREE.MathUtils.lerp(currentMagneticTilt.current.x, targetTiltX, delta * 4.0)
    currentMagneticTilt.current.y = THREE.MathUtils.lerp(currentMagneticTilt.current.y, targetTiltY, delta * 4.0)

    if (groupRef.current) {
      groupRef.current.rotation.x = currentMagneticTilt.current.x
      groupRef.current.rotation.y = t * 0.1 + currentMagneticTilt.current.y
      groupRef.current.rotation.z = t * 0.05
    }

    // Standard Rubik Move background rotations
    const interval = 6.0 
    const moveSubInterval = 0.6
    const moveTime = t % interval
    
    const moveInBurst = Math.floor(moveTime / moveSubInterval)
    const moveBatchId = Math.floor(t / interval) * 10 + moveInBurst
    
    if (moveTime < 2.4 && moveBatchId > currentMove.version && !sharedSpellState.antigravity && !sharedSpellState.lockdown) { 
      currentMove.axis = moveAxes[Math.floor(Math.random() * 3)]
      currentMove.slice = Math.floor(Math.random() * 3) - 1
      currentMove.angle = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2
      currentMove.version = moveBatchId
    }
  })

  // Programmatic Canvas Radial Gradient additive lens flare sprite
  const flareTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
      grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
      grad.addColorStop(0.2, 'rgba(74, 255, 180, 0.7)')
      grad.addColorStop(0.5, 'rgba(106, 13, 173, 0.25)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 128, 128)
    }
    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
        
        {/* Core sphere with glowing GLSL shader */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[1.0, 32, 32]} />
          <primitive object={coreMaterial} attach="material" />
        </mesh>

        <pointLight ref={coreLightRef} intensity={55} color="#4AFFB4" distance={10} />

        {/* Dynamic Lens Flare sprite */}
        <sprite scale={isHovered ? 2.5 : 1.8}>
          <spriteMaterial 
            map={flareTexture} 
            transparent 
            blending={THREE.AdditiveBlending} 
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>



        {/* Falling zero gravity particles */}
        <GravityParticles />

        {/* Fractal lightning arcs */}
        <LightningArcs faces={faces} />

        {/* Plane intersection resonance line */}
        <line>
          <bufferGeometry ref={resonanceLineGeoRef} />
          <lineBasicMaterial 
            color="#4AFFB4" 
            transparent 
            opacity={sharedSpellState.lockdown ? 0.05 : 0.8}
            blending={THREE.AdditiveBlending} 
            linewidth={2} 
            toneMapped={false}
          />
        </line>
        
        {/* Ring 1 (X-Y Diagonal) */}
        <group ref={ring1Ref} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <mesh geometry={ring1Geo}>
            <primitive object={ring1Material} attach="material" />
          </mesh>
          {ring1Runes.map((rd, i) => (
            <Text
              key={i}
              position={rd.pos}
              rotation={rd.rot}
              fontSize={0.20}
              font="/fonts/NotoSansRunic-Regular.ttf"
              anchorX="center"
              anchorY="middle"
            >
              <meshBasicMaterial color="#000000" toneMapped={false} depthWrite={true} />
              {rd.rune}
            </Text>
          ))}
        </group>

        {/* Ring 2 (Y-Z Diagonal) */}
        <group ref={ring2Ref} rotation={[-Math.PI / 4, 0, Math.PI / 4]}>
          <mesh geometry={ring2Geo}>
            <primitive object={ring2Material} attach="material" />
          </mesh>
          {ring2Runes.map((rd, i) => (
            <Text
              key={i}
              position={rd.pos}
              rotation={rd.rot}
              fontSize={0.24}
              font="/fonts/NotoSansRunic-Regular.ttf"
              anchorX="center"
              anchorY="middle"
            >
              <meshBasicMaterial color="#000000" toneMapped={false} depthWrite={true} />
              {rd.rune}
            </Text>
          ))}
        </group>

        {/* Ring 3 (Z-X Diagonal) */}
        <group ref={ring3Ref} rotation={[0, -Math.PI / 4, -Math.PI / 4]}>
          <mesh geometry={ring3Geo}>
            <primitive object={ring3Material} attach="material" />
          </mesh>
        </group>

        {/* 54 Pyramid fragments wrapped in dedicated group to prevent empty raycast issues */}
        <group ref={pyramidsGroupRef}>
          {faces.map((face) => (
            <PyramidFragment 
              key={face.id} 
              data={face} 
              assemblyProgress={assemblyProgress} 
              sharedMaterial={sharedMaterial}
              edgeMat={edgeMaterial}
              isDeepDive={isDeepDive} 
              onHover={onHoverFragment}
            />
          ))}
        </group>
      </Float>
    </group>
  )
}

/**
 * RECONSTRUCTED PYRAMID FRAGMENT WITH PHYSICS AND SWELLS
 */
function PyramidFragment({ 
  data, 
  assemblyProgress, 
  sharedMaterial,
  edgeMat, 
  isDeepDive,
  onHover 
}: { 
  data: FaceData, 
  assemblyProgress: number, 
  sharedMaterial: THREE.MeshStandardMaterial,
  edgeMat: THREE.ShaderMaterial, 
  isDeepDive: boolean,
  onHover: (rune: string | null, name: string | null, desc: string | null) => void 
}) {
  const meshGroupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const currentProximity = useRef(0.0)
  const textRefs = useRef<(THREE.Mesh | null)[]>([])
  
  const stateRef = useRef({
    currentMatrix: new THREE.Matrix4(),
    targetMatrix: new THREE.Matrix4(),
    lastVersion: 0,
    currentExpansion: 0.25,
    targetExpansion: 0.25,
    tumbleRotation: new THREE.Euler(0, 0, 0),
    tumbleVelocity: new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ),
    shatterVal: 0.0
  })

  const flyInOffset = useMemo(() => {
    let localSeed = data.center.x * 1000 + data.center.y * 100 + data.center.z * 10
    const offsets: number[] = []
    for (let i = 0; i < 3; i++) {
      localSeed = (localSeed * 1664525 + 1013904223) % 4294967296
      offsets.push((localSeed / 4294967296 - 0.5) * 22)
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
    geo.computeVertexNormals()

    const sides = [[rv[0], rv[1], apex], [rv[1], rv[2], apex], [rv[2], rv[3], apex], [rv[3], rv[0], apex]]
    const runeData = sides.map((sideVertices, sideIdx) => {
      const faceCenter = new THREE.Vector3().add(sideVertices[0]).add(sideVertices[1]).add(sideVertices[2]).divideScalar(3)
      const edge1 = new THREE.Vector3().subVectors(sideVertices[1], sideVertices[0])
      const edge2 = new THREE.Vector3().subVectors(sideVertices[2], sideVertices[0])
      const faceNormal = new THREE.Vector3().crossVectors(edge1, edge2).normalize()

      const hash = data.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + sideIdx
      const runeIndex = hash % RUNES.length

      return { 
        pos: faceCenter.clone().add(faceNormal.clone().multiplyScalar(0.025)), 
        normal: faceNormal, 
        rune: RUNES[runeIndex] 
      }
    })

    return { geometry: geo, edgeGeo: new THREE.EdgesGeometry(geo), runeData }
  }, [data])

  const currentRuneColor = useRef(new THREE.Color("#ffe875"))

  useFrame((state, delta) => {
    // Proximity swell calculation based on pointer raycast
    let proximityFactor = 0.0
    if (sharedSpellState.isHit && !sharedSpellState.antigravity) {
      const worldPos = new THREE.Vector3()
      if (meshGroupRef.current) {
        meshGroupRef.current.getWorldPosition(worldPos)
        const dist = worldPos.distanceTo(sharedSpellState.hitPoint)
        if (dist < 2.2) {
          proximityFactor = 1.0 - (dist / 2.2)
          proximityFactor = Math.pow(proximityFactor, 2.5) 
        }
      }
    }
    currentProximity.current = THREE.MathUtils.lerp(currentProximity.current, proximityFactor, delta * 7.5)

    // Dynamic scroll logic
    const docH = typeof document !== 'undefined' ? document.documentElement.scrollHeight : 1000
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800
    const maxScroll = docH - winH
    const scrollPercent = maxScroll > 0 && typeof window !== 'undefined' ? window.scrollY / maxScroll : 0

    // Assemble acts
    let targetExp = isDeepDive ? 0.45 : 0.25
    
    // Act 3 Detonation: Expand outward
    const act3Progress = THREE.MathUtils.clamp((scrollPercent - 0.50) / 0.25, 0, 1)
    targetExp += act3Progress * 2.8

    // Act 4 Lockdown: Slam completely shut
    const act4Progress = THREE.MathUtils.clamp((scrollPercent - 0.75) / 0.25, 0, 1)
    targetExp = THREE.MathUtils.lerp(targetExp, 0.02, act4Progress)

    // Override with Proximity swell
    if (!sharedSpellState.lockdown) {
      targetExp += currentProximity.current * 0.45
    }

    // Recoil Snap-back interpolation logic for clicks
    stateRef.current.shatterVal = THREE.MathUtils.lerp(
      stateRef.current.shatterVal, 
      sharedSpellState.shatterProgress, 
      delta * (7.5 - data.center.length() * 1.5)
    )

    // Base expansion + scroll + proximity + shatter offset
    targetExp += stateRef.current.shatterVal * 4.2

    stateRef.current.targetExpansion = targetExp
    stateRef.current.currentExpansion += (stateRef.current.targetExpansion - stateRef.current.currentExpansion) * delta * 5.0

    // Transition runes color: Gold (#ffb44a) -> Default Arcane (#4AFFB4)
    const goldRune = new THREE.Color("#ffb44a")
    const defaultRune = new THREE.Color("#4AFFB4")
    const targetRuneCol = new THREE.Color().lerpColors(goldRune, defaultRune, sharedSpellState.modeProgress)

    // Base color or ignite/lockdown colors
    if (sharedSpellState.ignite) {
      currentRuneColor.current.lerp(new THREE.Color("#FF7800"), delta * 8.0)
    } else if (sharedSpellState.lockdown) {
      currentRuneColor.current.lerp(new THREE.Color("#2E1402"), delta * 8.0)
    } else {
      // Proximity glow effect
      const hoverGlowColor = targetRuneCol.clone().lerp(new THREE.Color("#ffffff"), currentProximity.current * 0.5)
      currentRuneColor.current.lerp(hoverGlowColor, delta * 8.0)
    }

    textRefs.current.forEach(t => {
      if (t && t.material && !Array.isArray(t.material)) {
        const mat = t.material as THREE.MeshBasicMaterial
        mat.color.copy(currentRuneColor.current)
      }
    })

    // Handle Antigravity zero-g float drift
    if (sharedSpellState.antigravity) {
      stateRef.current.tumbleRotation.x += stateRef.current.tumbleVelocity.x * delta
      stateRef.current.tumbleRotation.y += stateRef.current.tumbleVelocity.y * delta
      stateRef.current.tumbleRotation.z += stateRef.current.tumbleVelocity.z * delta
    } else {
      stateRef.current.tumbleRotation.x = THREE.MathUtils.lerp(stateRef.current.tumbleRotation.x, 0, delta * 6.0)
      stateRef.current.tumbleRotation.y = THREE.MathUtils.lerp(stateRef.current.tumbleRotation.y, 0, delta * 6.0)
      stateRef.current.tumbleRotation.z = THREE.MathUtils.lerp(stateRef.current.tumbleRotation.z, 0, delta * 6.0)
    }

    // Logical Rubik sequential moves
    if (currentMove.version > stateRef.current.lastVersion && !sharedSpellState.antigravity && !sharedSpellState.lockdown) {
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

    // Combine matrix decompositions and snap positions
    if (meshGroupRef.current) {
      const matrix = stateRef.current.currentMatrix
      const target = stateRef.current.targetMatrix

      const currQuat = new THREE.Quaternion()
      const targetQuat = new THREE.Quaternion()
      const currPos = new THREE.Vector3()
      const currScale = new THREE.Vector3()
      const dummyP = new THREE.Vector3()
      const dummyS = new THREE.Vector3()

      matrix.decompose(currPos, currQuat, currScale)
      target.decompose(dummyP, targetQuat, dummyS)

      currQuat.slerp(targetQuat, 0.15)
      matrix.compose(currPos, currQuat, currScale)

      const expansionFactor = stateRef.current.currentExpansion
      const rotatedNormal = data.normal.clone().applyQuaternion(currQuat)
      
      const driftOffset = new THREE.Vector3(0, 0, 0)
      if (sharedSpellState.antigravity) {
        const driftAmp = 1.0 + Math.sin(state.clock.getElapsedTime() * 1.5 + data.center.x) * 0.25
        driftOffset.set(
          Math.sin(state.clock.getElapsedTime() * 0.8 + data.center.y) * 0.5,
          Math.cos(state.clock.getElapsedTime() * 1.1 + data.center.z) * 0.5 + driftAmp,
          Math.cos(state.clock.getElapsedTime() * 0.9 + data.center.x) * 0.5
        )
      }

      const assembledPos = data.center.clone()
        .applyMatrix4(matrix)
        .add(rotatedNormal.multiplyScalar(expansionFactor))
        .add(driftOffset)

      const currentPos = new THREE.Vector3().lerpVectors(flyInOffset, assembledPos, assemblyProgress)

      meshGroupRef.current.position.copy(currentPos)
      meshGroupRef.current.quaternion.copy(currQuat).multiply(new THREE.Quaternion().setFromEuler(stateRef.current.tumbleRotation))
    }
  })

  const triggerHover = (e: any) => {
    e.stopPropagation()
    setHovered(true)
    
    // Find active rune for HUD overlays
    const r = runeData[0]?.rune || "ᚠ"
    const fullLore = RUNE_LORES[r] || "Arcane resonance anchor"
    
    const parts = fullLore.split(":")
    const name = parts[0]?.trim() || "Runic Inscription"
    const desc = parts[1]?.trim() || "Arcane stabilizer"
    
    onHover(r, name, desc)
  }

  const triggerHoverOut = () => {
    setHovered(false)
    onHover(null, null, null)
  }

  // Double click or single click triggers explosive shatter
  const triggerClick = (e: any) => {
    e.stopPropagation()
    if (sharedSpellState.lockdown) return

    // Animate global shatter value
    gsap.killTweensOf(sharedSpellState)
    gsap.fromTo(sharedSpellState, 
      { shatterProgress: 0.0 },
      {
        shatterProgress: 1.0,
        duration: 0.75,
        ease: "expo.out",
        onComplete: () => {
          gsap.to(sharedSpellState, {
            shatterProgress: 0.0,
            delay: 1.1,
            duration: 1.4,
            ease: "elastic.out(1.0, 0.65)"
          })
        }
      }
    )
  }

  return (
    <group 
      ref={meshGroupRef}
      onPointerOver={triggerHover}
      onPointerOut={triggerHoverOut}
      onClick={triggerClick}
    >
      <mesh name="pyramid-mesh" geometry={geometry} material={sharedMaterial} />
      <lineSegments geometry={edgeGeo}>
        <primitive object={edgeMat} attach="material" />
      </lineSegments>

      {/* Glowing Runic Extrusions */}
      {runeData.map((rd, i) => (
        <Text
          key={i}
          ref={(el) => { textRefs.current[i] = el }}
          position={rd.pos}
          fontSize={0.28}
          color="#ffb44a" // Matches golden Quick Pitch default
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

/**
 * CONTAINER AND RENDER EXPORT
 */
export default function PolyhedronCanvas({ 
  isHovered = false, 
  isDeepDive = false 
}: { 
  isHovered?: boolean, 
  isDeepDive?: boolean 
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  
  // Tooltip HUD Overlay state
  const [hud, setHud] = useState<{
    rune: string | null
    runeName: string | null
    loreDesc: string | null
  }>({ rune: null, runeName: null, loreDesc: null })

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Window command executor sequence (called by our consolidated static TerminalTile)
  const executeCommand = (cmd: string): string => {
    const t = cmd.trim().toLowerCase()
    
    if (t === "help") {
      return "Available Hex Core spells: [antigravity on/off], [shatter], [ignite on/off], [lightning on/off], [pulse], [lockdown on/off], [reset]"
    }
    
    if (t === "antigravity on" || t === "antigravity") {
      sharedSpellState.antigravity = true
      return "Antigravity sequence: Active. Fragments floating."
    }
    
    if (t === "antigravity off") {
      sharedSpellState.antigravity = false
      return "Antigravity sequence: Suspended. Snap-back initialized."
    }

    if (t === "shatter") {
      if (sharedSpellState.lockdown) return "Error: Cannot shatter during lockdown."
      gsap.killTweensOf(sharedSpellState)
      gsap.fromTo(sharedSpellState,
        { shatterProgress: 0.0 },
        {
          shatterProgress: 1.0,
          duration: 0.8,
          ease: "expo.out",
          onComplete: () => {
            gsap.to(sharedSpellState, {
              shatterProgress: 0.0,
              delay: 1.2,
              duration: 1.5,
              ease: "elastic.out(1.0, 0.6)"
            })
          }
        }
      )
      return "Volumetric shatter triggered."
    }

    if (t === "ignite" || t === "ignite on") {
      if (sharedSpellState.lockdown) return "Error: Cannot ignite during lockdown."
      sharedSpellState.ignite = true
      return "Ignition core overload: Connected. Overheating..."
    }

    if (t === "ignite off") {
      sharedSpellState.ignite = false
      return "Ignition core overload: Suspended."
    }

    if (t === "lightning" || t === "lightning on") {
      if (sharedSpellState.lockdown) return "Error: Lockdown prevents lightning induction."
      sharedSpellState.lightning = true
      return "Electrical ionization active. Jagged fractal arcs triggered."
    }

    if (t === "lightning off") {
      sharedSpellState.lightning = false
      return "Electrical ionization: Suspended."
    }

    if (t === "pulse") {
      if (sharedSpellState.lockdown) return "Error: Pulsing offline."
      gsap.killTweensOf(sharedSpellState)
      gsap.fromTo(sharedSpellState,
        { pulseScale: 1.0 },
        {
          pulseScale: 1.7,
          duration: 0.35,
          yoyo: true,
          repeat: 1,
          ease: "sine.out"
        }
      )
      return "Volumetric core shockwave emitted."
    }

    if (t === "lockdown" || t === "lockdown on") {
      sharedSpellState.lockdown = true
      sharedSpellState.ignite = false
      sharedSpellState.lightning = false
      sharedSpellState.antigravity = false
      return "EMP shockwave. Hexcore completely Locked Down."
    }

    if (t === "lockdown off") {
      sharedSpellState.lockdown = false
      return "EMP lockdown released. Core systems rebooting."
    }

    if (t === "reset") {
      sharedSpellState.lockdown = false
      sharedSpellState.ignite = false
      sharedSpellState.lightning = false
      sharedSpellState.antigravity = false
      sharedSpellState.shatterProgress = 0.0
      sharedSpellState.pulseScale = 1.0
      return "Hexcore successfully restored to default state."
    }

    return `Error: unknown command '${cmd}'`
  }

  // Expose global window CLI spell API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__hexcore_cmd = (cmdStr: string) => {
        const res = executeCommand(cmdStr)
        console.log(`[Hexcore CLI] ${res}`)
        return res
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__hexcore_cmd
      }
    }
  }, [])

  if (!ready) return null

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Canvas 
        camera={{ position: [0, 0, 13], fov: 35 }}
        dpr={[1, 2]}
        gl={{ alpha: true }}
        style={{ pointerEvents: 'auto' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={3.0} />
        <directionalLight position={[-10, 8, -5]} intensity={1.5} color="#ffffff" />
        
        <Suspense fallback={null}>
          <PolyhedronScene 
            isHovered={isHovered} 
            isDeepDive={isDeepDive} 
            onHoverFragment={(rune, name, desc) => {
              setHud({ rune, runeName: name, loreDesc: desc })
            }}
          />
        </Suspense>

        {/* Volumetric Bloom Postprocessing */}
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.01} 
            luminanceSmoothing={0.9} 
            mipmapBlur 
            intensity={1.2}
          />
        </EffectComposer>
      </Canvas>

      {/* Elegant Heads-Up Display (HUD) Tooltip Overlay in the corner — doesn't block the 3D model! */}
      <AnimatePresence>
        {hud.rune && (
          <motion.div
            initial={{ opacity: 0, x: -15, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -15, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute top-6 left-6 pointer-events-none border border-lume-primary/20 bg-black/85 backdrop-blur-md rounded-xl p-3.5 shadow-2xl z-20 font-mono flex flex-col gap-1 w-[220px] select-none text-left"
          >
            <div className="text-[8px] uppercase tracking-[0.25em] text-lume-primary/60 font-bold leading-none mb-0.5">Arcane Telemetry</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl text-lume-primary font-bold leading-none">{hud.rune}</span>
              <div className="h-6 w-[1px] bg-white/20" />
              <span className="text-[11px] text-white font-bold tracking-wider uppercase leading-none">{hud.runeName}</span>
            </div>
            <div className="text-[10px] text-white/55 leading-relaxed mt-2 border-t border-white/5 pt-2">
              {hud.loreDesc}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

