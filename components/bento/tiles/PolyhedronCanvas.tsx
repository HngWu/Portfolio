"use client"

import { Canvas, useFrame, ThreeEvent, useThree } from "@react-three/fiber"
import React, { Suspense, useRef, useMemo, useState, useEffect, useContext } from "react"
import { Float, Text } from "@react-three/drei"
import * as THREE from "three"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
import { RunicDustStreams } from "./hexcore/RunicDustStreams"
import { RingLightningArcs } from "./hexcore/LightningArcs"
import { DodecahedronCore } from "./hexcore/DodecahedronCore"
import { useIgniteStore } from "@/store/useIgniteStore"
import { useModeTransitionStore } from "@/store/useModeTransitionStore"
import { useSiteLoaderStore } from "@/store/useSiteLoaderStore"
import { ForceMobileContext } from "@/components/bento/ForceMobileContext"

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
export const sharedSpellState = {
  antigravity: false,
  ignite: false,
  lightning: false,
  lockdown: false,
  shatterProgress: 0,
  pulseScale: 1.0,
  heartbeatPulse: 1.0,
  hitPoint: new THREE.Vector3(),
  isHit: false,
  modeProgress: 0.0, // 0 for quick pitch (gold), 1 for deep dive (default indigo)
  scrollProgress: 0.0,
  assemblyProgress: 1.0,
  isVisible: true
}

if (typeof window !== 'undefined') {
  (window as unknown as { sharedSpellState?: typeof sharedSpellState }).sharedSpellState = sharedSpellState;
}

// Pre-allocated static colors to avoid 60fps GC allocation overhead
const COLOR_GOLD = new THREE.Color("#c9a227")
const COLOR_DEFAULT = new THREE.Color("#030308")
const COLOR_GOLD_EDGE1 = new THREE.Color("#ffe875")
const COLOR_GOLD_EDGE2 = new THREE.Color("#ffb44a")
const COLOR_DEFAULT_EDGE1 = new THREE.Color("#4AFFB4")
const COLOR_DEFAULT_EDGE2 = new THREE.Color("#4A8FFF")
const COLOR_IGNITE_GLOW = new THREE.Color("#ff4500")
const COLOR_LOCKDOWN_BASE = new THREE.Color("#05070a")

const COLOR_RUNE_GOLD = new THREE.Color("#ffb44a")
const COLOR_RUNE_DEFAULT = new THREE.Color("#4AFFB4")
const COLOR_RUNE_IGNITE = new THREE.Color("#FF7800")
const COLOR_RUNE_LOCKDOWN = new THREE.Color("#2E1402")
const COLOR_WHITE = new THREE.Color("#ffffff")

const COLOR_GLASS_GOLD_BASE = new THREE.Color("#1a1005")
const COLOR_GLASS_INDIGO_BASE = new THREE.Color("#0e0b1f")
const COLOR_GLASS_GOLD_ATTEN = new THREE.Color("#ffb44a")
const COLOR_GLASS_INDIGO_ATTEN = new THREE.Color("#0e2e22")

// Global scratch variables for zero-allocation hot loops
const _scratchColor1 = new THREE.Color()
const _scratchColor2 = new THREE.Color()
const _scratchColor3 = new THREE.Color()
const _scratchColor4 = new THREE.Color()

const _scratchVector1 = new THREE.Vector3()
const _scratchVector2 = new THREE.Vector3()
const _scratchVector3 = new THREE.Vector3()
const _scratchVector4 = new THREE.Vector3()
const _scratchVector5 = new THREE.Vector3()

const _scratchQuat1 = new THREE.Quaternion()
const _scratchQuat2 = new THREE.Quaternion()
const _scratchQuat3 = new THREE.Quaternion()
const _scratchEuler = new THREE.Euler()

// Dedicated scratch variables for gyroscopic motion precession
const _gyroPrecess1 = new THREE.Vector3()
const _gyroPrecess2 = new THREE.Vector3()
const _gyroPrecess3 = new THREE.Vector3()
const _gyroCursor = new THREE.Vector3()
const _gyroAxisY = new THREE.Vector3(0, 1, 0)
const _gyroZero = new THREE.Vector3(0, 0, 0)

// Pre-allocated vector pool for high-performance midpoint displacement lightning arcs
const LIGHTNING_POOL_SIZE = 128
const _lightningPool = Array.from({ length: LIGHTNING_POOL_SIZE }, () => new THREE.Vector3())
let _lightningPoolIdx = 0
function getScratchVector() {
  const v = _lightningPool[_lightningPoolIdx]
  _lightningPoolIdx = (_lightningPoolIdx + 1) % LIGHTNING_POOL_SIZE
  return v
}

const MAX_PATH_POINTS = 33
const _pathPoints = Array.from({ length: MAX_PATH_POINTS }, () => new THREE.Vector3())

// 3D Simplex Noise & FBM Domain Warping GLSL helper embedded inside the Plasma core shader
const FBM_DOMAIN_WARPING_GLSL = `
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

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  vec3 shift = vec3(100.0);
  int octaves = (uLowPowerMode > 0.5) ? 2 : 4;
  for (int i = 0; i < 4; ++i) {
    if (i >= octaves) break;
    v += a * snoise(p);
    p = p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

float domainWarpNoise(vec3 p, float time) {
  vec3 q = vec3(
    fbm(p + vec3(0.0, time * 0.35, 0.0)),
    fbm(p + vec3(4.3, -time * 0.28, 2.8)),
    fbm(p + vec3(1.7, 9.2, time * 0.30))
  );
  vec3 r = vec3(
    fbm(p + 2.5 * q + vec3(1.7, 9.2, 0.15 * time)),
    fbm(p + 2.5 * q + vec3(8.3, 2.8, -0.12 * time)),
    fbm(p + 2.5 * q + vec3(2.2, 5.1, 0.18 * time))
  );
  return fbm(p + 3.0 * r);
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

function attachEdgeFlowAttributes(edgeGeo: THREE.BufferGeometry): THREE.BufferGeometry {
  const pos = edgeGeo.getAttribute('position') as THREE.BufferAttribute
  if (!pos) return edgeGeo
  const count = pos.count
  const lineCoords = new Float32Array(count)
  const edgeTypes = new Float32Array(count)

  for (let i = 0; i < count; i += 2) {
    const x0 = pos.getX(i), y0 = pos.getY(i)
    const x1 = pos.getX(i + 1), y1 = pos.getY(i + 1)
    
    // Calculate polar angle around ring center in the XY plane
    const angle0 = Math.atan2(y0, x0)
    const angle1 = Math.atan2(y1, x1)
    
    // Map angle [-PI, PI] to [0, 8]
    let u0 = ((angle0 + Math.PI) / (Math.PI * 2)) * 8.0
    let u1 = ((angle1 + Math.PI) / (Math.PI * 2)) * 8.0
    
    // Fix wrap-around discontinuity across the -PI / +PI boundary
    if (u1 - u0 > 4.0) u0 += 8.0
    else if (u0 - u1 > 4.0) u1 += 8.0
    
    lineCoords[i] = u0
    lineCoords[i + 1] = u1
    edgeTypes[i] = 1.0
    edgeTypes[i + 1] = 1.0
  }
  edgeGeo.setAttribute('aLineCoord', new THREE.BufferAttribute(lineCoords, 1))
  edgeGeo.setAttribute('aEdgeType', new THREE.BufferAttribute(edgeTypes, 1))
  return edgeGeo
}

function attachPolyhedronEdgeFlowAttributes(edgeGeo: THREE.BufferGeometry): THREE.BufferGeometry {
  const pos = edgeGeo.getAttribute('position') as THREE.BufferAttribute
  if (!pos) return edgeGeo
  const count = pos.count
  const lineCoords = new Float32Array(count)
  const edgeTypes = new Float32Array(count)

  for (let i = 0; i < count; i += 2) {
    const x0 = pos.getX(i), y0 = pos.getY(i), z0 = pos.getZ(i)
    const x1 = pos.getX(i + 1), y1 = pos.getY(i + 1), z1 = pos.getZ(i + 1)

    // Spatial coordinate mapping for fluid continuous traveling energy along 3D edges
    const u0 = (Math.atan2(y0, x0) + Math.PI) * 1.5 + z0 * 2.0
    const u1 = (Math.atan2(y1, x1) + Math.PI) * 1.5 + z1 * 2.0

    lineCoords[i] = u0
    lineCoords[i + 1] = u1
    edgeTypes[i] = 1.0
    edgeTypes[i + 1] = 1.0
  }
  edgeGeo.setAttribute('aLineCoord', new THREE.BufferAttribute(lineCoords, 1))
  edgeGeo.setAttribute('aEdgeType', new THREE.BufferAttribute(edgeTypes, 1))
  return edgeGeo
}

/**
 * ARCANE RELIC STAR SHADERS (V2)
 * Layer 1: Translucent Smoky Obsidian Glass Octahedron Prism (Zero Wireframe Lines)
 * Layer 2: Radiant Symmetrical Spherical Arcane Star
 */
export const ObsidianGlassPrismShader = {
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
      // Inky dark obsidian glass base (NO PURPLE)
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

      // Directional specular glints across flat facet faces
      vec3 lightDir1 = normalize(vec3(0.8, 1.0, 0.6));
      vec3 lightDir2 = normalize(vec3(-0.8, -0.5, 1.0));
      float glint1 = pow(max(dot(reflect(-lightDir1, normal), viewDir), 0.0), 16.0);
      float glint2 = pow(max(dot(reflect(-lightDir2, normal), viewDir), 0.0), 12.0);
      float facetSpecular = glint1 * 0.6 + glint2 * 0.4;

      // Subtle prismatic edge dispersion without wireframe lines
      float facetEdge = pow(1.0 - abs(dot(normal, viewDir)), 4.0) * 0.35;

      // Composite: Translucent obsidian glass prism with radiant facet gleams
      vec3 glassColor = obsidianBase + accentColor * (fresnel * 0.70 + facetSpecular * 0.90 + facetEdge);
      
      // Translucent glass alpha (lets the inner radiant star shine through cleanly!)
      float alpha = (uLockdownActive > 0.5) ? 0.60 : 0.40;

      gl_FragColor = vec4(glassColor, alpha);
    }
  `,
  uniforms: {
    uTime: { value: 0 },
    uGlowIntensity: { value: 1.05 },
    uHoverActive: { value: 0 },
    uIgniteActive: { value: 0 },
    uLockdownActive: { value: 0 },
    uModeProgress: { value: 0.0 },
    uHeartbeatPulse: { value: 1.0 }
  }
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
  `,
  uniforms: {
    uTime: { value: 0 },
    uGlowIntensity: { value: 1.05 },
    uIgniteActive: { value: 0 },
    uLockdownActive: { value: 0 },
    uModeProgress: { value: 0.0 },
    uHeartbeatPulse: { value: 1.0 }
  }
}

function createPrismMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: ObsidianGlassPrismShader.vertexShader,
    fragmentShader: ObsidianGlassPrismShader.fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uGlowIntensity: { value: 1.05 },
      uHoverActive: { value: 0 },
      uIgniteActive: { value: 0 },
      uLockdownActive: { value: 0 },
      uModeProgress: { value: 0.0 },
      uHeartbeatPulse: { value: 1.0 }
    },
    transparent: true,
    depthWrite: false
  })
}

function createStarMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: ArcaneStarShader.vertexShader,
    fragmentShader: ArcaneStarShader.fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uGlowIntensity: { value: 1.05 },
      uIgniteActive: { value: 0 },
      uLockdownActive: { value: 0 },
      uModeProgress: { value: 0.0 },
      uHeartbeatPulse: { value: 1.0 }
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
}

// Backwards-compatible aliases
export const ArcaneCrystalShader = ObsidianGlassPrismShader
export const SingularitySeedShader = ArcaneStarShader
export const DomainWarpPlasmaShader = ObsidianGlassPrismShader
function createCrystalMaterial() { return createPrismMaterial() }
function createSeedMaterial() { return createStarMaterial() }
function createPlasmaMaterial() { return createPrismMaterial() }

/**
 * ANIMATED FLOWING LATTICE EDGE GLOW SHADER
 */
function createEdgeGlowMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: `
      attribute float aLineCoord;
      attribute float aEdgeType;
      varying vec3 vWorldPosition;
      varying vec3 vLocalPosition;
      varying float vLineCoord;
      varying float vEdgeType;
      void main() {
        vLocalPosition = position;
        vLineCoord = aLineCoord;
        vEdgeType = aEdgeType;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uRuneColor;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform float uHover;
      uniform float uIgnite;
      uniform float uLockdown;
      uniform float uPulseScale;
      varying vec3 vWorldPosition;
      varying vec3 vLocalPosition;
      varying float vLineCoord;
      varying float vEdgeType;

      void main() {
        // Direct continuous coordinate mapping along all line segments
        float coord = vLineCoord;
        
        // Graceful, energetic flow speed
        float speed = (uIgnite > 0.5) ? 3.2 : (uLockdown > 0.5 ? 0.35 : (1.4 + uHover * 0.45));

        // Primary continuous traveling energy wave
        float wave1 = sin(coord * 3.2 - uTime * speed) * 0.5 + 0.5;
        float surge1 = pow(wave1, 1.8);

        // Interleaved secondary harmonic wave to maintain unbroken, consistent flow
        float wave2 = sin(coord * 3.2 - uTime * (speed * 0.85) + 2.2) * 0.5 + 0.5;
        float surge2 = pow(wave2, 2.0) * 0.50;

        float flowSurge = max(surge1, surge2);

        // Subtle harmonic shimmer along the edge
        float shimmer = sin(coord * 2.5 - uTime * (speed * 0.7)) * 0.06;

        // Flowing dual-color wave gradient between uColor1 and uColor2
        float colorFlow = sin(coord * 1.8 - uTime * (speed * 0.6)) * 0.5 + 0.5;
        vec3 col = mix(uColor1, uColor2, colorFlow) * (1.0 + shimmer);

        // Moderated baseline glow so edges are clearly defined without overpowering,
        // allowing the bright traveling energy surges to POP dramatically with high visual contrast
        float baseGlow = (uLockdown > 0.5) ? 0.20 : (0.42 + uHover * 0.15);
        float flowBoost = (uLockdown > 0.5) ? 0.35 : (1.35 + uHover * 0.35);
        if (uIgnite > 0.5) {
          baseGlow = 1.15;
          flowBoost = 1.35;
        }

        float intensity = (baseGlow + flowSurge * flowBoost) * uPulseScale;

        // Rich saturated core highlight during energy crest
        vec3 finalColor = mix(col, col * 1.35, flowSurge * 0.35);

        // Clear baseline opacity so wireframe remains crisp, peaking to 1.0 along surges
        float opacity = (uLockdown > 0.5) ? 0.35 : clamp(0.70 + flowSurge * 0.30, 0.0, 1.0);

        gl_FragColor = vec4(finalColor * intensity, opacity);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uRuneColor: { value: new THREE.Color("#ffb44a") },
      uColor1: { value: new THREE.Color("#ffe875") },
      uColor2: { value: new THREE.Color("#ffb44a") },
      uHover: { value: 0 },
      uIgnite: { value: 0 },
      uLockdown: { value: 0 },
      uPulseScale: { value: 1.0 }
    },
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2.0,
    polygonOffsetUnits: -4.0,
    blending: THREE.AdditiveBlending
  })
}

const SuspendedRunesShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uRuneColor;
    uniform float uHoverActive;
    uniform float uPulseScale;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    float runeNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float n = sin(i.x + i.y * 57.0) * 43758.5453;
      return fract(n);
    }

    void main() {
      float speed = uTime * 1.5;
      float circuit = sin(vUv.x * 35.0 - speed) * cos(vUv.y * 8.0 + sin(uTime));
      float runeMask = pow(abs(circuit), 4.0) * 2.0;
      
      float noiseVal = runeNoise(vWorldPosition.xy * 8.0 + vec2(uTime, -uTime * 0.5));
      runeMask *= (0.4 + 0.6 * noiseVal);
      
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(max(dot(normal, viewDir), 0.0), 2.5);
      
      vec3 glowColor = uRuneColor * (0.95 + uHoverActive * 0.3) * uPulseScale;
      vec3 finalColor = glowColor * runeMask * fresnel;
      float alpha = clamp(runeMask * fresnel * 0.90, 0.0, 1.0);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
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
      // Deterministic, coordinate-based pseudo-random numbers
      const r1 = (Math.abs(Math.sin(i * 12.9898)) * 43758.5453) % 1
      const r2 = (Math.abs(Math.cos(i * 78.233)) * 43758.5453) % 1
      const r3 = (Math.abs(Math.sin(i * 93.123)) * 43758.5453) % 1
      const r4 = (Math.abs(Math.cos(i * 45.456)) * 43758.5453) % 1
      pos[i * 3] = (r1 - 0.5) * 6
      pos[i * 3 + 1] = r2 * 5 - 2
      pos[i * 3 + 2] = (r3 - 0.5) * 6
      vel[i * 3 + 1] = -(0.5 + r4 * 1.2) // fall speed
    }
    return [pos, vel]
  }, [])

  useFrame((_state, rawDelta) => {
    if (!sharedSpellState.isVisible || (typeof document !== 'undefined' && document.hidden)) return
    const delta = Math.min(rawDelta, 0.1)
    const active = sharedSpellState.antigravity
    if (pointsRef.current) {
      pointsRef.current.visible = active
    }
    if (!active) return

    const geo = pointsRef.current?.geometry
    if (!geo) return
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
    const pos = posAttr.array as Float32Array

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      pos[i3 + 1] += velocities[i3 + 1] * delta // fall downwards
      
      // Turbulence
      pos[i3] += (Math.random() - 0.5) * 0.1 * delta
      pos[i3 + 2] += (Math.random() - 0.5) * 0.1 * delta

      if (pos[i3 + 1] < -3.0) {
        // Recycle to top
        pos[i3] = (Math.random() - 0.5) * 6
        pos[i3 + 1] = 3.0
        pos[i3 + 2] = (Math.random() - 0.5) * 6
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

  useEffect(() => {
    return () => {
      dustTex.dispose()
    }
  }, [dustTex])

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
function generateLightningPath(start: THREE.Vector3, end: THREE.Vector3, detail = 4, displace = 0.35): number {
  _lightningPoolIdx = 0 // Reset pool for this path
  
  _pathPoints[0].copy(start)
  _pathPoints[1].copy(end)
  
  let currentSegmentCount = 1
  
  for (let d = 0; d < detail; d++) {
    for (let i = currentSegmentCount - 1; i >= 0; i--) {
      const p1 = _pathPoints[i]
      const p2 = _pathPoints[i + 1]
      
      const midIdx = i * 2 + 1
      const p2Idx = i * 2 + 2
      
      _pathPoints[p2Idx].copy(p2)
      
      const mid = _pathPoints[midIdx].addVectors(p1, p2).multiplyScalar(0.5)
      
      const dir = getScratchVector().subVectors(p2, p1).normalize()
      const tangent = getScratchVector().set(1, 0, 0)
      if (Math.abs(dir.x) > 0.9) tangent.set(0, 1, 0)
      const normal = getScratchVector().crossVectors(dir, tangent).normalize()
      
      const shift = getScratchVector().copy(normal).multiplyScalar((Math.random() - 0.5) * displace)
      mid.add(shift)
    }
    currentSegmentCount *= 2
  }
  
  return currentSegmentCount + 1
}

function LightningArcs({ 
  faces, 
  pyramidsGroupRef 
}: { 
  faces: FaceData[], 
  pyramidsGroupRef: React.RefObject<THREE.Group | null> 
}) {
  const lineRef = useRef<THREE.LineSegments>(null)
  const lineGeoRef = useRef<THREE.BufferGeometry>(null)
  
  const maxVertices = 800 // Increased from 400 for 16 paths
  const positions = useMemo(() => new Float32Array(maxVertices * 3), [])
  const updateIndex = useRef(0) // For staggered scheduling
  const numPaths = 16 // Increased from 8
  
  useFrame(() => {
    if (!sharedSpellState.isVisible || (typeof document !== 'undefined' && document.hidden)) return
    const active = sharedSpellState.lightning
    
    // Check Detonation Act (0.0 to 0.25 scroll) using the centralized scroll progress
    const scrollVal = sharedSpellState.scrollProgress
    const isDetonationAct = scrollVal > 0.0 && scrollVal < 0.25

    const showLightning = active || (isDetonationAct && Math.random() > 0.3)
    
    if (lineRef.current) {
      lineRef.current.visible = !!showLightning
    }
    if (!showLightning || !lineRef.current || !lineGeoRef.current) return

    const pos = lineGeoRef.current.attributes.position.array as Float32Array
    const pathsToUpdate = 4 // Compute 4 paths per frame
    const pathVertexStride = 50 

    const idx = updateIndex.current

    for (let k = 0; k < pathsToUpdate; k++) {
      const l = (idx + k) % numPaths

      // Select random nodes based on index seed to keep them relatively stable per slot
      const p1Idx = (l * 7 + 3) % faces.length
      let p2Idx = (l * 11 + 5) % faces.length
      if (p1Idx === p2Idx) p2Idx = (p2Idx + 1) % faces.length
      
      const f1 = faces[p1Idx]
      const f2 = faces[p2Idx]
      
      const p1 = _scratchVector1
      const p2 = _scratchVector2
      
      let gotP1 = false
      let gotP2 = false
      
      if (pyramidsGroupRef.current && pyramidsGroupRef.current.children[p1Idx]) {
        p1.copy(pyramidsGroupRef.current.children[p1Idx].position)
        gotP1 = true
      }
      if (pyramidsGroupRef.current && pyramidsGroupRef.current.children[p2Idx]) {
        p2.copy(pyramidsGroupRef.current.children[p2Idx].position)
        gotP2 = true
      }
      
      if (!gotP1) p1.copy(f1.center).multiplyScalar(1.3)
      if (!gotP2) p2.copy(f2.center).multiplyScalar(1.3)
      
      const numPoints = generateLightningPath(p1, p2, 4, 0.45)
      
      // Calculate buffer offset for this path
      const vertexOffset = l * pathVertexStride
      let segmentIndex = 0
      for (let i = 0; i < numPoints - 1; i++) {
        if (segmentIndex + 2 <= pathVertexStride) {
          const ptA = _pathPoints[i]
          const ptB = _pathPoints[i+1]
          const offset = (vertexOffset + segmentIndex) * 3
          pos[offset] = ptA.x
          pos[offset + 1] = ptA.y
          pos[offset + 2] = ptA.z
          pos[offset + 3] = ptB.x
          pos[offset + 4] = ptB.y
          pos[offset + 5] = ptB.z
          segmentIndex += 2
        }
      }
    }
    
    updateIndex.current = (idx + pathsToUpdate) % numPaths

    lineGeoRef.current.setDrawRange(0, maxVertices) // Keep drawing full vertices buffer
    lineGeoRef.current.attributes.position.needsUpdate = true
  })

  return (
    <lineSegments ref={lineRef} raycast={() => {}}>
      <bufferGeometry ref={lineGeoRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={maxVertices}
          itemSize={3}
        />
      </bufferGeometry>
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
  isVisibleRef,
  isEffectiveMobile,
  onHoverFragment 
}: { 
  isHovered: boolean, 
  isDeepDive: boolean,
  isVisibleRef?: React.RefObject<boolean>,
  isEffectiveMobile?: boolean,
  onHoverFragment: (rune: string | null, name: string | null, desc: string | null) => void 
}) {
  const groupRef = useRef<THREE.Group>(null)
  const ring1Ref = useRef<THREE.Group>(null)
  const ring2Ref = useRef<THREE.Group>(null)
  const ring3Ref = useRef<THREE.Group>(null)
  const ring1GlassRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const ring2GlassRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const ring3GlassRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const pyramidsGroupRef = useRef<THREE.Group>(null)

  const ring1TextRefs = useRef<(THREE.Mesh | null)[]>([])
  const ring2TextRefs = useRef<(THREE.Mesh | null)[]>([])
  const ring3TextRefs = useRef<(THREE.Mesh | null)[]>([])
  const smoothScroll = useRef(0)
  const scrollPercentRef = useRef(0)

  useEffect(() => {
    const handleScrollOrResize = () => {
      const docH = document.documentElement.scrollHeight
      const winH = window.innerHeight
      const maxScroll = docH - winH
      scrollPercentRef.current = maxScroll > 0 ? THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1) : 0
    }
    handleScrollOrResize()
    window.addEventListener("scroll", handleScrollOrResize, { passive: true })
    window.addEventListener("resize", handleScrollOrResize)

    // Notify loader that WebGL scene is ready
    const timer = setTimeout(() => {
      useSiteLoaderStore.getState().markModelReady()
    }, 150)

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize)
      window.removeEventListener("resize", handleScrollOrResize)
      clearTimeout(timer)
    }
  }, [])

  const [assemblyProgress, setAssemblyProgress] = useState(1)
  const isIgnited = useIgniteStore((state) => state.isIgnited)
  const faces = useMemo(() => getUniformHexCoreFaces(2.32) as FaceData[], [])

  useEffect(() => {
    sharedSpellState.modeProgress = isDeepDive ? 1.0 : 0.0
  }, [isDeepDive])

  const glassMaterialProps = useMemo(() => ({
    transmission: 0.98,
    ior: 1.65,
    thickness: 1.8,
    roughness: 0.04,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    color: new THREE.Color("#0e0b1f"),
    attenuationColor: new THREE.Color("#1e3a6a"),
    attenuationDistance: 0.5,
    envMapIntensity: 2.5,
    metalness: 0.0,
    roughnessMap: null
  }), [])

  const { 
    ring1Geo, ring2Geo, ring3Geo, 
    innerRing1Geo, innerRing2Geo, innerRing3Geo,
    ring1EdgeGeo, ring2EdgeGeo, ring3EdgeGeo 
  } = useMemo(() => {
    const r1 = makeRectangularTorus(1.5, 0.28, 0.45, 2.2)
    const r2 = makeRectangularTorus(1.9, 0.28, 0.45, 2.2)
    const r3 = makeRectangularTorus(2.3, 0.22, 0.45, 2.2)

    return {
      ring1Geo: r1,
      ring2Geo: r2,
      ring3Geo: r3,
      innerRing1Geo: new THREE.TorusGeometry(1.5, 0.28 * 0.84, 16, 100),
      innerRing2Geo: new THREE.TorusGeometry(1.9, 0.28 * 0.84, 16, 100),
      innerRing3Geo: new THREE.TorusGeometry(2.3, 0.22 * 0.84, 16, 100),
      ring1EdgeGeo: attachEdgeFlowAttributes(new THREE.EdgesGeometry(r1, 30)),
      ring2EdgeGeo: attachEdgeFlowAttributes(new THREE.EdgesGeometry(r2, 30)),
      ring3EdgeGeo: attachEdgeFlowAttributes(new THREE.EdgesGeometry(r3, 30))
    }
  }, [])

  // Shaders
  const edgeMaterial = useMemo(() => createEdgeGlowMaterial(), [])

  // Concentric Rings: Beautiful custom Runic Shader Materials
  const ring1Uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uRuneColor: { value: new THREE.Color(isDeepDive ? "#4AFFB4" : "#ffb44a") },
    uHoverActive: { value: 0 },
    uPulseScale: { value: 1.0 }
  }), [isDeepDive])

  const ring2Uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uRuneColor: { value: new THREE.Color(isDeepDive ? "#4AFFB4" : "#ffb44a") },
    uHoverActive: { value: 0 },
    uPulseScale: { value: 1.0 }
  }), [isDeepDive])

  const ring3Uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uRuneColor: { value: new THREE.Color(isDeepDive ? "#4AFFB4" : "#ffb44a") },
    uHoverActive: { value: 0 },
    uPulseScale: { value: 1.0 }
  }), [isDeepDive])

  const ring1Material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: SuspendedRunesShader.vertexShader,
      fragmentShader: SuspendedRunesShader.fragmentShader,
      uniforms: ring1Uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  }, [ring1Uniforms])

  const ring2Material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: SuspendedRunesShader.vertexShader,
      fragmentShader: SuspendedRunesShader.fragmentShader,
      uniforms: ring2Uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  }, [ring2Uniforms])

  const ring3Material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: SuspendedRunesShader.vertexShader,
      fragmentShader: SuspendedRunesShader.fragmentShader,
      uniforms: ring3Uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  }, [ring3Uniforms])

  // Procedural brushed black metallic texture & anisotropic micro-groove bump map
  const metallicTexture = useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#08090f'
      ctx.fillRect(0, 0, 256, 256)
      const imgData = ctx.getImageData(0, 0, 256, 256)
      const d = imgData.data
      for (let i = 0; i < d.length; i += 4) {
        const grain = (Math.random() - 0.5) * 16
        d[i] = Math.min(255, Math.max(0, 9 + grain))
        d[i + 1] = Math.min(255, Math.max(0, 11 + grain))
        d[i + 2] = Math.min(255, Math.max(0, 17 + grain))
        d[i + 3] = 255
      }
      ctx.putImageData(imgData, 0, 0)
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(2, 2)
    return tex
  }, [])

  const metallicBumpMap = useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const imgData = ctx.createImageData(256, 256)
      const d = imgData.data
      for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
          const idx = (y * 256 + x) * 4
          const streak = Math.sin(x * 1.5 + (Math.random() - 0.5) * 2.0) * 10
          const n = 128 + streak + (Math.random() - 0.5) * 12
          const val = Math.min(255, Math.max(0, n))
          d[idx] = val
          d[idx + 1] = val
          d[idx + 2] = val
          d[idx + 3] = 255
        }
      }
      ctx.putImageData(imgData, 0, 0)
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(4, 4)
    return tex
  }, [])

  // Shared single PBR material with authentic black metallic texture in Deep Dive mode
  const sharedMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(isDeepDive ? "#08090f" : "#c9a227"),
    roughness: isDeepDive ? 0.32 : 0.20,
    metalness: isDeepDive ? 0.95 : 0.92,
    map: isDeepDive ? metallicTexture : null,
    bumpMap: isDeepDive ? metallicBumpMap : null,
    bumpScale: 0.025,
    side: THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: 1.0,
    polygonOffsetUnits: 1.0
  }), [isDeepDive, metallicTexture, metallicBumpMap])

  // Wrap materials in a ref for zero-warning useFrame modification
  const materialsRef = useRef({
    edge: edgeMaterial,
    ring1: ring1Material,
    ring2: ring2Material,
    ring3: ring3Material,
    shared: sharedMaterial
  })

  // Concept 1: 54-Pyramid Magnetic Snap Assembly & Core Plasma Ignition Bloom
  const loaderPhase = useSiteLoaderStore((s) => s.phase)
  const isLoaded = useSiteLoaderStore((s) => s.isLoaded)

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReduced || useSiteLoaderStore.getState().isLoaded) {
      sharedSpellState.assemblyProgress = 1.0
      return
    }

    // Set to zero dispersal initially when loading
    sharedSpellState.assemblyProgress = 0.0
  }, [])

  useEffect(() => {
    if (loaderPhase === "igniting" || (isLoaded && sharedSpellState.assemblyProgress < 0.99)) {
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches

      if (prefersReduced) {
        sharedSpellState.assemblyProgress = 1.0
        return
      }

      // Magnetic snap assembly of 54 pyramids from zero-G dispersal
      gsap.to(sharedSpellState, {
        assemblyProgress: 1.0,
        duration: 0.65,
        ease: "expo.out",
        overwrite: "auto"
      })


    }
  }, [loaderPhase, isLoaded])

  // Clean up materials and geometries on unmount to prevent leaks
  useEffect(() => {
    return () => {
      edgeMaterial.dispose()
      ring1Material.dispose()
      ring2Material.dispose()
      ring3Material.dispose()
      sharedMaterial.dispose()
      metallicTexture?.dispose()
      metallicBumpMap?.dispose()

      ring1Geo.dispose()
      ring2Geo.dispose()
      ring3Geo.dispose()
      innerRing1Geo.dispose()
      innerRing2Geo.dispose()
      innerRing3Geo.dispose()
      ring1EdgeGeo.dispose()
      ring2EdgeGeo.dispose()
      ring3EdgeGeo.dispose()
    }
  }, [
    edgeMaterial,
    ring1Material,
    ring2Material,
    ring3Material,
    sharedMaterial,
    metallicTexture,
    metallicBumpMap,
    ring1Geo,
    ring2Geo,
    ring3Geo,
    innerRing1Geo,
    innerRing2Geo,
    innerRing3Geo,
    ring1EdgeGeo,
    ring2EdgeGeo,
  ])

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

  const ring3Runes = useMemo<RuneData[]>(() => {
    const N = 20
    const radiusRune = 2.3 + (0.22 * Math.cos(Math.PI / 4) * 0.45) + 0.015
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
      const runeIndex = (i * 13 + 7) % RUNES.length
      runesData.push({ pos, rot, rune: RUNES[runeIndex] })
    }
    return runesData
  }, [])

  // Concentric ring accumulated local spin angles
  const ring1Spin = useRef(0)
  const ring2Spin = useRef(0)
  const ring3Spin = useRef(0)

  const currentMagneticTilt = useRef(new THREE.Euler(0, 0, 0))

  // Lightweight rolling frame-time tracker for adaptive performance watchdog
  const fpsTrackerRef = useRef({
    frameCount: 0,
    elapsedTime: 0,
    isLowPower: false
  })

  useFrame((state, rawDelta) => {
    if ((isVisibleRef && !isVisibleRef.current) || !sharedSpellState.isVisible || (typeof document !== 'undefined' && document.hidden)) {
      return
    }
    const delta = Math.min(rawDelta, 0.1)
    const t = state.clock.getElapsedTime()

    // Pull directly from materialsRef.current to modify without React linter immutability triggers
    const mats = materialsRef.current

    // Adaptive performance watchdog: 2-second sampling window
    const tracker = fpsTrackerRef.current
    tracker.frameCount++
    tracker.elapsedTime += delta

    if (tracker.elapsedTime >= 2.0) {
      const averageFps = tracker.frameCount / tracker.elapsedTime
      // If client GPU struggles below 42 FPS, dynamically activate low-power shader mode
      if (averageFps < 42) {
        tracker.isLowPower = true
      }
      tracker.frameCount = 0
      tracker.elapsedTime = 0
    }



    // 1. Smooth mode transition logic: Quick Pitch (isDeepDive=false -> Gold) to Deep Dive (isDeepDive=true -> Indigo PBR)
    const targetMode = isDeepDive ? 1.0 : 0.0
    sharedSpellState.modeProgress = THREE.MathUtils.lerp(sharedSpellState.modeProgress, targetMode, delta * 3.5)

    // Drive the Zustand isIgnited into sharedSpellState.ignite
    sharedSpellState.ignite = isIgnited

    const modeProg = sharedSpellState.modeProgress

    // Dynamic ring glass casing PBR color transitions (magma overloading & EMP lockdowns)
    const targetGlassColor = _scratchColor1.set("#0e0b1f")
    const targetGlassAtten = _scratchColor2.set("#1e3a6a")
    
    if (sharedSpellState.ignite) {
      targetGlassColor.set("#3a0a0a") // Heated Magma glass
      targetGlassAtten.set("#ff4500") // Glowing attenuation
    } else if (sharedSpellState.lockdown) {
      targetGlassColor.set("#05070a") // Dead EMP slate
      targetGlassAtten.set("#000000") // No attenuation glow
    } else {
      // Smoothly transition between gold and indigo glass attenuation
      const baseGlassColor = _scratchColor3.copy(COLOR_GLASS_GOLD_BASE).lerp(COLOR_GLASS_INDIGO_BASE, modeProg)
      targetGlassColor.copy(baseGlassColor)
      
      const baseGlassAtten = _scratchColor3.copy(COLOR_GLASS_GOLD_ATTEN).lerp(COLOR_GLASS_INDIGO_ATTEN, modeProg)
      targetGlassAtten.copy(baseGlassAtten)
    }

    if (ring1GlassRef.current) {
      ring1GlassRef.current.color.lerp(targetGlassColor, delta * 6.0)
      ring1GlassRef.current.attenuationColor.lerp(targetGlassAtten, delta * 6.0)
    }
    if (ring2GlassRef.current) {
      ring2GlassRef.current.color.lerp(targetGlassColor, delta * 6.0)
      ring2GlassRef.current.attenuationColor.lerp(targetGlassAtten, delta * 6.0)
    }
    if (ring3GlassRef.current) {
      ring3GlassRef.current.color.lerp(targetGlassColor, delta * 6.0)
      ring3GlassRef.current.attenuationColor.lerp(targetGlassAtten, delta * 6.0)
    }

    sharedSpellState.heartbeatPulse = 1.0



    // Target base face material color transitions (smoothly blending modes, ignite overloads, and EMP slate lockdowns)
    const targetFaceColor = _scratchColor1.copy(COLOR_GOLD).lerp(COLOR_DEFAULT, sharedSpellState.modeProgress)
    if (sharedSpellState.ignite) {
      targetFaceColor.copy(COLOR_IGNITE_GLOW)
    } else if (sharedSpellState.lockdown) {
      targetFaceColor.copy(COLOR_LOCKDOWN_BASE)
    }
    mats.shared.color.lerp(targetFaceColor, delta * 6.0)
    
    mats.shared.roughness = THREE.MathUtils.lerp(0.20, 0.32, sharedSpellState.modeProgress)
    mats.shared.metalness = THREE.MathUtils.lerp(0.92, 0.95, sharedSpellState.modeProgress)

    // Edge glow color matches the runes identically in all modes and spell states
    const targetRuneEdgeCol = _scratchColor2.copy(COLOR_RUNE_GOLD).lerp(COLOR_RUNE_DEFAULT, sharedSpellState.modeProgress)
    if (sharedSpellState.ignite) {
      targetRuneEdgeCol.copy(COLOR_RUNE_IGNITE)
    } else if (sharedSpellState.lockdown) {
      targetRuneEdgeCol.copy(COLOR_RUNE_LOCKDOWN)
    }
    mats.edge.uniforms.uRuneColor.value.lerp(targetRuneEdgeCol, delta * 8.0)

    // Dual-tone edge gradient: Quick Pitch (gold1 / gold2) vs Deep Dive (neon green / neon electric blue)
    const targetEdgeCol1 = _scratchColor3.copy(COLOR_GOLD_EDGE1).lerp(COLOR_DEFAULT_EDGE1, sharedSpellState.modeProgress)
    const targetEdgeCol2 = _scratchColor4.copy(COLOR_GOLD_EDGE2).lerp(COLOR_DEFAULT_EDGE2, sharedSpellState.modeProgress)
    if (sharedSpellState.ignite) {
      targetEdgeCol1.copy(COLOR_RUNE_IGNITE)
      targetEdgeCol2.copy(COLOR_IGNITE_GLOW)
    } else if (sharedSpellState.lockdown) {
      targetEdgeCol1.copy(COLOR_RUNE_LOCKDOWN)
      targetEdgeCol2.copy(COLOR_LOCKDOWN_BASE)
    }
    mats.edge.uniforms.uColor1.value.lerp(targetEdgeCol1, delta * 8.0)
    mats.edge.uniforms.uColor2.value.lerp(targetEdgeCol2, delta * 8.0)
    mats.edge.uniforms.uPulseScale.value = sharedSpellState.pulseScale * (sharedSpellState.lockdown ? 0.3 : 1.0)
    mats.edge.uniforms.uHover.value = THREE.MathUtils.lerp(mats.edge.uniforms.uHover.value, (isHovered || isDeepDive) ? 1.0 : 0.0, delta * 6.0)

    // Drive Shaders Time uniform
    mats.edge.uniforms.uTime.value = t
    
    // Smooth transition for ring runic colors and uniforms
    const ringBaseColor = _scratchColor1.copy(COLOR_RUNE_GOLD)

    // Update ring 1 uniforms
    mats.ring1.uniforms.uTime.value = t
    mats.ring1.uniforms.uHoverActive.value = THREE.MathUtils.lerp(mats.ring1.uniforms.uHoverActive.value, (isHovered || isDeepDive) ? 1.0 : 0.0, delta * 6.0)
    mats.ring1.uniforms.uPulseScale.value = sharedSpellState.pulseScale
    const ring1TargetColor = _scratchColor2.copy(ringBaseColor).lerp(COLOR_RUNE_DEFAULT, modeProg)
    if (sharedSpellState.ignite) {
      ring1TargetColor.copy(COLOR_RUNE_IGNITE)
    } else if (sharedSpellState.lockdown) {
      ring1TargetColor.copy(COLOR_RUNE_LOCKDOWN)
    }
    mats.ring1.uniforms.uRuneColor.value.lerp(ring1TargetColor, delta * 6.0)

    // Update ring 2 uniforms
    mats.ring2.uniforms.uTime.value = t
    mats.ring2.uniforms.uHoverActive.value = THREE.MathUtils.lerp(mats.ring2.uniforms.uHoverActive.value, (isHovered || isDeepDive) ? 1.0 : 0.0, delta * 6.0)
    mats.ring2.uniforms.uPulseScale.value = sharedSpellState.pulseScale
    const ring2TargetColor = _scratchColor2.copy(ringBaseColor).lerp(COLOR_RUNE_DEFAULT, modeProg)
    if (sharedSpellState.ignite) {
      ring2TargetColor.copy(COLOR_RUNE_IGNITE)
    } else if (sharedSpellState.lockdown) {
      ring2TargetColor.copy(COLOR_RUNE_LOCKDOWN)
    }
    mats.ring2.uniforms.uRuneColor.value.lerp(ring2TargetColor, delta * 6.0)

    // Update ring 3 uniforms
    mats.ring3.uniforms.uTime.value = t
    mats.ring3.uniforms.uHoverActive.value = THREE.MathUtils.lerp(mats.ring3.uniforms.uHoverActive.value, (isHovered || isDeepDive) ? 1.0 : 0.0, delta * 6.0)
    mats.ring3.uniforms.uPulseScale.value = sharedSpellState.pulseScale
    const ring3TargetColor = _scratchColor2.copy(ringBaseColor).lerp(COLOR_RUNE_DEFAULT, modeProg)
    if (sharedSpellState.ignite) {
      ring3TargetColor.copy(COLOR_RUNE_IGNITE)
    } else if (sharedSpellState.lockdown) {
      ring3TargetColor.copy(COLOR_RUNE_LOCKDOWN)
    }
    mats.ring3.uniforms.uRuneColor.value.lerp(ring3TargetColor, delta * 6.0)

    // Drive special Spell states to Shaders
    mats.edge.uniforms.uIgnite.value = sharedSpellState.ignite ? 1.0 : 0.0
    mats.edge.uniforms.uLockdown.value = sharedSpellState.lockdown ? 1.0 : 0.0

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

    // Query scroll progress from our optimized ref instead of thrashing the DOM layout
    const scrollPercent = scrollPercentRef.current

    smoothScroll.current = THREE.MathUtils.lerp(smoothScroll.current, scrollPercent, delta * 4.0)
    sharedSpellState.scrollProgress = smoothScroll.current

    // Stable camera positioning with dynamic viewport-based zoom scaling to prevent horizontal clipping on narrow mobile devices
    const aspect = state.size.width / (state.size.height || 1)
    if (camera instanceof THREE.PerspectiveCamera) {
      if (Math.abs(camera.aspect - aspect) > 0.001) {
        camera.aspect = aspect
        camera.updateProjectionMatrix()
      }
    }
    const baseZ = isEffectiveMobile ? 14.2 : 12.0
    const targetZ = aspect < 1.0 ? Math.max(baseZ, (baseZ * 0.95) / Math.max(aspect, 0.62)) : baseZ
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1)

    // Gyroscopic Motion Resonance: Precession, Cursor Slerp and Harmonic Local Spin
    const p1 = _gyroPrecess1.set(1.0, 0.2 * Math.sin(0.5 * t), 0.1 * Math.cos(0.3 * t)).normalize()
    const p2 = _gyroPrecess2.set(-0.2 * Math.cos(0.4 * t), 1.0, 0.3 * Math.sin(0.6 * t)).normalize()
    const p3 = _gyroPrecess3.set(0.1 * Math.sin(0.7 * t), -0.3 * Math.cos(0.2 * t), 1.0).normalize()
    const currentPrecessedAxes = [p1, p2, p3]

    const cursorVector = _gyroCursor.set(pointer.x * 0.5, pointer.y * 0.5, 1.0).normalize()
    const hoverProgress = sharedSpellState.modeProgress

    const refs = [ring1Ref, ring2Ref, ring3Ref]
    const spinRefs = [ring1Spin, ring2Spin, ring3Spin]
    const gearRatios = [1.0, -2.0, 3.0] // Ring 2 counter-clockwise
    const baseFreq = 0.8

    refs.forEach((ref, idx) => {
      if (!ref.current) return
      
      // 1. Calculate base idle wobble precession quaternion
      const idleQuat = _scratchQuat1.setFromUnitVectors(_gyroAxisY, currentPrecessedAxes[idx])
      
      // 2. Target coplanar/flat locked orientation
      const lockedQuat = _scratchQuat2.setFromEuler(_scratchEuler.set(0, 0, 0))
      
      // 3. Slerp precession wobble down based on scroll progress (Concept A)
      const baseAlignedQuat = _scratchQuat3.slerpQuaternions(idleQuat, lockedQuat, sharedSpellState.scrollProgress)
      
      // 4. Slerp to active pointer tracking based on hoverProgress
      const targetCursorQuat = _scratchQuat1.setFromUnitVectors(_gyroAxisY, cursorVector)
      ref.current.quaternion.slerpQuaternions(baseAlignedQuat, targetCursorQuat, hoverProgress)
      
      // Smoothly coupling speed to strict integer gear ratios as scroll progress increases
      const idleSpeed = idx === 1 ? -0.5 : (idx === 2 ? 0.3 : 0.6)
      const targetSpeed = baseFreq * gearRatios[idx]
      
      // Blend speeds using scroll progress (harmonic resonance)
      const speedBlend = Math.pow(THREE.MathUtils.clamp(sharedSpellState.scrollProgress, 0.0, 1.0), 1.5)
      let currentSpeed = THREE.MathUtils.lerp(idleSpeed, targetSpeed, speedBlend)

      // Apply special spell speed overrides (EMP lockdown / Ignite overload)
      if (sharedSpellState.lockdown) currentSpeed = 0.0
      else if (sharedSpellState.ignite) currentSpeed *= 5.0

      spinRefs[idx].current += currentSpeed * delta
      
      // Post-multiply the accumulated local spin rotation onto the base orientation
      ref.current.rotateOnAxis(_gyroAxisY, spinRefs[idx].current)

      // Position drift under antigravity (floating sequence)
      if (sharedSpellState.antigravity) {
        const driftAmp = 1.0 + Math.sin(t * 1.5 + idx * 5.0) * 0.25
        ref.current.position.set(
          Math.sin(t * 0.8 + idx * 2.0) * 0.12 * driftAmp,
          Math.cos(t * 0.9 + idx * 3.0) * 0.12 * driftAmp,
          Math.sin(t * 1.1 + idx * 4.0) * 0.12 * driftAmp
        )
      } else {
        ref.current.position.lerp(_gyroZero, delta * 6.0)
      }

      // Concentric rings stay fixed at 1.0 (no expansion on hover)
      ref.current.scale.setScalar(1.0)
    })

    // Update concentric ring text colors dynamically to match their emissive shader colors
    ring1TextRefs.current.forEach(t => {
      if (t && t.material && !Array.isArray(t.material)) {
        const mat = t.material as THREE.MeshBasicMaterial
        mat.color.copy(mats.ring1.uniforms.uRuneColor.value)
      }
    })
    ring2TextRefs.current.forEach(t => {
      if (t && t.material && !Array.isArray(t.material)) {
        const mat = t.material as THREE.MeshBasicMaterial
        mat.color.copy(mats.ring2.uniforms.uRuneColor.value)
      }
    })
    ring3TextRefs.current.forEach(t => {
      if (t && t.material && !Array.isArray(t.material)) {
        const mat = t.material as THREE.MeshBasicMaterial
        mat.color.copy(mats.ring3.uniforms.uRuneColor.value)
      }
    })

    // 5.1 Hover Magnetic spring-damped Tilt
    let targetTiltX = 0
    let targetTiltY = 0
    if (isHovered || isDeepDive) {
      targetTiltX = pointer.y * 0.28 // Pitch up/down
      targetTiltY = pointer.x * 0.32 // Yaw left/right
      mats.edge.uniforms.uHover.value = THREE.MathUtils.lerp(mats.edge.uniforms.uHover.value, 0.0, delta * 6.0)
    } else {
      mats.edge.uniforms.uHover.value = THREE.MathUtils.lerp(mats.edge.uniforms.uHover.value, 0.0, delta * 6.0)
    }

    currentMagneticTilt.current.x = THREE.MathUtils.lerp(currentMagneticTilt.current.x, targetTiltX, delta * 4.0)
    currentMagneticTilt.current.y = THREE.MathUtils.lerp(currentMagneticTilt.current.y, targetTiltY, delta * 4.0)

    if (groupRef.current) {
      groupRef.current.rotation.x = currentMagneticTilt.current.x
      groupRef.current.rotation.y = t * 0.1 + currentMagneticTilt.current.y
      groupRef.current.rotation.z = t * 0.05
      groupRef.current.scale.setScalar(1.0)
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

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
        
        {/* Arcane Dodecahedron Core */}
        <DodecahedronCore isDeepDive={isDeepDive} isHovered={isHovered} />



        {/* Falling zero gravity particles */}
        <GravityParticles />

        {/* Fractal lightning arcs */}
        <LightningArcs faces={faces} pyramidsGroupRef={pyramidsGroupRef} />

        {/* Dynamic Concentric Ring GPU Particles and lightning discharges */}
        <RunicDustStreams mode={isDeepDive ? 'deep-dive' : 'quick-pitch'} />
        <RingLightningArcs 
          mode={isDeepDive ? 'deep-dive' : 'quick-pitch'} 
          ringARef={ring1Ref} 
          ringBRef={ring2Ref} 
          ringCRef={ring3Ref}
          pyramidsGroupRef={pyramidsGroupRef}
        />

        {/* Ring 1 (X-Y Diagonal) */}
        <group ref={ring1Ref} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <mesh geometry={innerRing1Geo} material={ring1Material} />
          <mesh geometry={ring1Geo}>
            <meshPhysicalMaterial ref={ring1GlassRef} {...glassMaterialProps} />
          </mesh>
          <lineSegments geometry={ring1EdgeGeo} material={edgeMaterial} />
          {ring1Runes.map((rd, i) => (
            <Text
              key={i}
              ref={(el) => { ring1TextRefs.current[i] = el as THREE.Mesh | null }}
              position={rd.pos}
              rotation={rd.rot}
              fontSize={0.20}
              font="/fonts/NotoSansRunic-Regular.ttf"
              anchorX="center"
              anchorY="middle"
            >
              <meshBasicMaterial color="#ffe875" toneMapped={false} depthWrite={false} transparent opacity={0.95} />
              {rd.rune}
            </Text>
          ))}
        </group>

        {/* Ring 2 (Y-Z Diagonal) */}
        <group ref={ring2Ref} rotation={[-Math.PI / 4, 0, Math.PI / 4]}>
          <mesh geometry={innerRing2Geo} material={ring2Material} />
          <mesh geometry={ring2Geo}>
            <meshPhysicalMaterial ref={ring2GlassRef} {...glassMaterialProps} />
          </mesh>
          <lineSegments geometry={ring2EdgeGeo} material={edgeMaterial} />
          {ring2Runes.map((rd, i) => (
            <Text
              key={i}
              ref={(el) => { ring2TextRefs.current[i] = el as THREE.Mesh | null }}
              position={rd.pos}
              rotation={rd.rot}
              fontSize={0.24}
              font="/fonts/NotoSansRunic-Regular.ttf"
              anchorX="center"
              anchorY="middle"
            >
              <meshBasicMaterial color="#ffe875" toneMapped={false} depthWrite={false} transparent opacity={0.95} />
              {rd.rune}
            </Text>
          ))}
        </group>

        {/* Ring 3 (Z-X Diagonal) */}
        <group ref={ring3Ref} rotation={[0, -Math.PI / 4, -Math.PI / 4]}>
          <mesh geometry={innerRing3Geo} material={ring3Material} />
          <mesh geometry={ring3Geo}>
            <meshPhysicalMaterial ref={ring3GlassRef} {...glassMaterialProps} />
          </mesh>
          <lineSegments geometry={ring3EdgeGeo} material={edgeMaterial} />
          {ring3Runes.map((rd, i) => (
            <Text
              key={i}
              ref={(el) => { ring3TextRefs.current[i] = el as THREE.Mesh | null }}
              position={rd.pos}
              rotation={rd.rot}
              fontSize={0.24}
              font="/fonts/NotoSansRunic-Regular.ttf"
              anchorX="center"
              anchorY="middle"
            >
              <meshBasicMaterial color="#ffe875" toneMapped={false} depthWrite={false} transparent opacity={0.95} />
              {rd.rune}
            </Text>
          ))}
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
  const currentProximity = useRef(0.0)
  const textRefs = useRef<(THREE.Mesh | null)[]>([])
  
  const stateRef = useRef<{
    currentQuat: THREE.Quaternion    // Current rendering orientation
    targetQuat: THREE.Quaternion     // Stable logical target orientation
    prevQuat: THREE.Quaternion       // Pre-move orientation quaternion
    moveTime: number                 // Seconds elapsed in current move
    isMoving: boolean                // Active rotation transition flag
    moveAxis: THREE.Vector3          // Active rotation axis
    moveAngle: number                // Active rotation angle (+PI/2 or -PI/2)
    moveCoordSign: number            // Symmetrical expansion direction (-1, 0, 1)
    lastVersion: number              // Global move sequence tracker
    currentExpansion: number
    targetExpansion: number
    tumbleRotation: THREE.Euler
    tumbleVelocity: THREE.Vector3
    shatterVal: number
  }>(null!)

  if (stateRef.current == null) {
    // Pure/deterministic seed-based LCG calculations anchored to data.center for zero-warning initialization
    let seed = data.center.x * 12.9898 + data.center.y * 78.233 + data.center.z * 43.123
    const nextRand = () => {
      seed = (Math.abs(Math.sin(seed)) * 43758.5453) % 1
      return seed
    }
    const rx = (nextRand() - 0.5) * 2
    const ry = (nextRand() - 0.5) * 2
    const rz = (nextRand() - 0.5) * 2

    stateRef.current = {
      currentQuat: new THREE.Quaternion(),
      targetQuat: new THREE.Quaternion(),
      prevQuat: new THREE.Quaternion(),
      moveTime: 0.0,
      isMoving: false,
      moveAxis: new THREE.Vector3(0, 1, 0),
      moveAngle: 0,
      moveCoordSign: 0,
      lastVersion: 0,
      currentExpansion: 0.25,
      targetExpansion: 0.25,
      tumbleRotation: new THREE.Euler(0, 0, 0),
      tumbleVelocity: new THREE.Vector3(rx, ry, rz),
      shatterVal: 0.0
    }
  }

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
      // Base (wound facing backward: normal points away from apex)
      rv[0].x, rv[0].y, rv[0].z, rv[2].x, rv[2].y, rv[2].z, rv[1].x, rv[1].y, rv[1].z,
      rv[0].x, rv[0].y, rv[0].z, rv[3].x, rv[3].y, rv[3].z, rv[2].x, rv[2].y, rv[2].z,
      // Sides
      rv[0].x, rv[0].y, rv[0].z, rv[1].x, rv[1].y, rv[1].z, apex.x, apex.y, apex.z,
      rv[1].x, rv[1].y, rv[1].z, rv[2].x, rv[2].y, rv[2].z, apex.x, apex.y, apex.z,
      rv[2].x, rv[2].y, rv[2].z, rv[3].x, rv[3].y, rv[3].z, apex.x, apex.y, apex.z,
      rv[3].x, rv[3].y, rv[3].z, rv[0].x, rv[0].y, rv[0].z, apex.x, apex.y, apex.z,
    ])
    
    const uvs = new Float32Array([
      // Base
      0, 0,  1, 1,  1, 0,
      0, 0,  0, 1,  1, 1,
      // Sides
      0, 0,  1, 0,  0.5, 1,
      0, 0,  1, 0,  0.5, 1,
      0, 0,  1, 0,  0.5, 1,
      0, 0,  1, 0,  0.5, 1,
    ])

    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
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

      const rotEuler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), faceNormal))

      return { 
        pos: faceCenter.clone().add(faceNormal.clone().multiplyScalar(0.025)), 
        normal: faceNormal, 
        rot: rotEuler, 
        rune: RUNES[runeIndex] 
      }
    })

    // Glowing rune on the back base face of the pyramid shell
    const baseCenter = new THREE.Vector3().add(rv[0]).add(rv[1]).add(rv[2]).add(rv[3]).divideScalar(4)
    const baseNormal = data.normal.clone().negate().normalize()
    const baseHash = data.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 4
    const baseRuneIndex = baseHash % RUNES.length
    const baseRotEuler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), baseNormal))

    runeData.push({
      pos: baseCenter.clone().add(baseNormal.clone().multiplyScalar(0.025)),
      normal: baseNormal,
      rot: baseRotEuler,
      rune: RUNES[baseRuneIndex]
    })

    // Explicit 8 wireframe edges with directional flow attributes
    const edgeGeo = new THREE.BufferGeometry()
    const edgeVertices = new Float32Array([
      // 4 Ridge edges (from base corners rv[0..3] to apex)
      rv[0].x, rv[0].y, rv[0].z, apex.x, apex.y, apex.z,
      rv[1].x, rv[1].y, rv[1].z, apex.x, apex.y, apex.z,
      rv[2].x, rv[2].y, rv[2].z, apex.x, apex.y, apex.z,
      rv[3].x, rv[3].y, rv[3].z, apex.x, apex.y, apex.z,
      // 4 Base perimeter edges (rv[0]->rv[1]->rv[2]->rv[3]->rv[0])
      rv[0].x, rv[0].y, rv[0].z, rv[1].x, rv[1].y, rv[1].z,
      rv[1].x, rv[1].y, rv[1].z, rv[2].x, rv[2].y, rv[2].z,
      rv[2].x, rv[2].y, rv[2].z, rv[3].x, rv[3].y, rv[3].z,
      rv[3].x, rv[3].y, rv[3].z, rv[0].x, rv[0].y, rv[0].z,
    ])
    const edgeLineCoords = new Float32Array([
      // Ridge lines: 0.0 at base, 1.0 at apex
      0.0, 1.0,
      0.0, 1.0,
      0.0, 1.0,
      0.0, 1.0,
      // Perimeter lines: 0.0 -> 1.0 -> 2.0 -> 3.0 -> 4.0
      0.0, 1.0,
      1.0, 2.0,
      2.0, 3.0,
      3.0, 4.0,
    ])
    const edgeTypes = new Float32Array([
      // Ridge lines = 0.0
      0.0, 0.0,
      0.0, 0.0,
      0.0, 0.0,
      0.0, 0.0,
      // Perimeter lines = 1.0
      1.0, 1.0,
      1.0, 1.0,
      1.0, 1.0,
      1.0, 1.0,
    ])
    edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgeVertices, 3))
    edgeGeo.setAttribute('aLineCoord', new THREE.BufferAttribute(edgeLineCoords, 1))
    edgeGeo.setAttribute('aEdgeType', new THREE.BufferAttribute(edgeTypes, 1))

    return { geometry: geo, edgeGeo, runeData }
  }, [data])

  useEffect(() => {
    return () => {
      geometry.dispose()
      edgeGeo.dispose()
    }
  }, [geometry, edgeGeo])

  const currentRuneColor = useRef(new THREE.Color(isDeepDive ? "#4AFFB4" : "#ffb44a"))

  const floatHashX = useMemo(() => (Math.abs(Math.sin(data.center.x * 12.9898 + data.center.y * 78.233)) * 43758.5453) % (Math.PI * 2), [data.center])
  const floatHashY = useMemo(() => (Math.abs(Math.cos(data.center.y * 39.346 + data.center.z * 11.135)) * 43758.5453) % (Math.PI * 2), [data.center])
  const floatHashZ = useMemo(() => (Math.abs(Math.sin(data.center.z * 71.182 + data.center.x * 93.412)) * 43758.5453) % (Math.PI * 2), [data.center])

  useFrame((state, rawDelta) => {
    if (!sharedSpellState.isVisible || (typeof document !== 'undefined' && document.hidden)) return
    const delta = Math.min(rawDelta, 0.1)
    // Proximity swell & magnetic repulsion calculation based on pointer raycast (Zero-Allocation)
    const proximityFactor = 0.0
    const tiltOffsetQuat = _scratchQuat2.identity()

    currentProximity.current = THREE.MathUtils.lerp(currentProximity.current, proximityFactor, delta * 8.0)

    // Base expansion - constant compact size without expanding or swelling on hover
    const baseExpansion = isDeepDive ? 0.26 : 0.20
    let targetExp = baseExpansion

    // Recoil Snap-back interpolation logic for clicks
    stateRef.current.shatterVal = THREE.MathUtils.lerp(
      stateRef.current.shatterVal, 
      sharedSpellState.shatterProgress, 
      delta * (7.5 - data.center.length() * 1.5)
    )

    // Base expansion + proximity + shatter offset (dramatic volumetric shatter clears core center)
    targetExp += stateRef.current.shatterVal * 4.5

    stateRef.current.targetExpansion = targetExp
    stateRef.current.currentExpansion += (stateRef.current.targetExpansion - stateRef.current.currentExpansion) * delta * 6.0

    // Transition runes color: Gold (#ffb44a) -> Default Arcane (#4AFFB4)
    const targetRuneCol = _scratchColor1.copy(COLOR_RUNE_GOLD).lerp(COLOR_RUNE_DEFAULT, sharedSpellState.modeProgress)

    // Base color or ignite/lockdown colors
    if (sharedSpellState.ignite) {
      currentRuneColor.current.lerp(COLOR_RUNE_IGNITE, delta * 8.0)
    } else if (sharedSpellState.lockdown) {
      currentRuneColor.current.lerp(COLOR_RUNE_LOCKDOWN, delta * 8.0)
    } else {
      currentRuneColor.current.lerp(targetRuneCol, delta * 8.0)
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
      
      // Project logical position using targetQuat for slice containment checking
      const currentLogicalPos = _scratchVector1.copy(data.center).applyQuaternion(stateRef.current.targetQuat)

      const coord = currentLogicalPos.dot(axis)
      const sliceThreshold = 0.5

      let inSlice = false
      if (slice === 1) inSlice = coord > sliceThreshold
      else if (slice === -1) inSlice = coord < -sliceThreshold
      else inSlice = Math.abs(coord) < sliceThreshold

      if (inSlice) {
        // 1. Capture current orientation as the start point for the spring interpolation
        stateRef.current.prevQuat.copy(stateRef.current.currentQuat)
        
        // 2. Symmetrically calculate new target orientation (apply rotation around global axis)
        stateRef.current.targetQuat.copy(stateRef.current.targetQuat).premultiply(_scratchQuat3.setFromAxisAngle(axis, angle))
        
        // 3. Trigger transition states
        stateRef.current.moveTime = 0.0
        stateRef.current.isMoving = true
        stateRef.current.moveAxis.copy(axis)
        stateRef.current.moveAngle = angle
        stateRef.current.moveCoordSign = Math.sign(coord)
      }
    }

    // Combine matrix decompositions and snap positions (100% Zero-Allocation)
    if (meshGroupRef.current) {
      const currQuat = stateRef.current.currentQuat
      const targetQuat = stateRef.current.targetQuat
      
      let springProgress = 1.0
      const expansionOffset = _scratchVector2.set(0, 0, 0)
      
      if (stateRef.current.isMoving) {
        stateRef.current.moveTime += delta
        const t = stateRef.current.moveTime
        
        // Damping ratio = 0.52, Natural Frequency = 18.0 rad/s
        const zeta = 0.52
        const omega = 18.0
        const omega_d = 15.3753 // omega * Math.sqrt(1.0 - zeta * zeta)
        const expTerm = Math.exp(-zeta * omega * t)
        
        // Second-order underdamped step response
        springProgress = 1.0 - expTerm * (Math.cos(omega_d * t) + (zeta / 0.8541) * Math.sin(omega_d * t))
        
        if (t >= 0.42) {
          stateRef.current.isMoving = false
          currQuat.copy(targetQuat)
        } else {
          // Extrapolated angle overshoot using spring progress
          const theta = stateRef.current.moveAngle * springProgress
          currQuat.copy(stateRef.current.prevQuat).premultiply(_scratchQuat3.setFromAxisAngle(stateRef.current.moveAxis, theta))
          
          // Sinusoidal seam-burst expansion with rebound squeeze
          const seamExpansion = 0.22 * Math.sin(springProgress * Math.PI)
          expansionOffset.copy(stateRef.current.moveAxis).multiplyScalar(seamExpansion * stateRef.current.moveCoordSign)
        }
      } else {
        currQuat.copy(targetQuat)
      }

      const expansionFactor = stateRef.current.currentExpansion
      const rotatedNormal = _scratchVector5.copy(data.normal).applyQuaternion(currQuat)
      
      const driftOffset = _scratchVector3.set(0, 0, 0)
      if (sharedSpellState.antigravity) {
        const driftAmp = 1.0 + Math.sin(state.clock.getElapsedTime() * 1.5 + data.center.x) * 0.25
        driftOffset.set(
          Math.sin(state.clock.getElapsedTime() * 0.8 + data.center.y) * 0.5,
          Math.cos(state.clock.getElapsedTime() * 1.1 + data.center.z) * 0.5 + driftAmp,
          Math.cos(state.clock.getElapsedTime() * 0.9 + data.center.x) * 0.5
        )
      }

      const floatDrift = _scratchVector4.set(0, 0, 0)
      if (stateRef.current.shatterVal > 0.05) {
        const floatAmp = stateRef.current.shatterVal * 0.38
        const idHash = data.id.split('-').reduce((acc, val) => acc * 31 + parseInt(val, 10), 0)
        const pieceSeed = data.center.length() + idHash
        floatDrift.set(
          Math.sin(state.clock.getElapsedTime() * 2.2 + pieceSeed) * 0.08 * floatAmp,
          Math.cos(state.clock.getElapsedTime() * 1.8 + pieceSeed) * 0.08 * floatAmp,
          Math.sin(state.clock.getElapsedTime() * 2.5 + pieceSeed) * 0.08 * floatAmp
        )
      }

      // Asymmetric zero-G micro-levitation drift
      const microLevitation = _scratchVector3.set(0, 0, 0)
      if (!sharedSpellState.lockdown && !sharedSpellState.antigravity) {
        const tTime = state.clock.getElapsedTime()
        const levAmp = (isDeepDive ? 0.045 : 0.035) * (1.0 + currentProximity.current * 0.5)
        microLevitation.set(
          Math.sin(tTime * 1.6 + floatHashX) * levAmp,
          Math.cos(tTime * 1.3 + floatHashY) * levAmp * 1.2,
          Math.sin(tTime * 1.9 + floatHashZ) * levAmp
        )
      }

      // Assemble dynamic world position using zero-allocation scratch variables
      const assembledPos = _scratchVector1.copy(data.center)
        .applyQuaternion(currQuat) // Symmetrical rotation around core origin
        .add(rotatedNormal.multiplyScalar(expansionFactor)) // Hover/Swell/Heartbeat expansion
        .add(expansionOffset) // Active mechanical seam displacement
        .add(driftOffset) // Antigravity float
        .add(floatDrift) // Click-shatter float
        .add(microLevitation) // Living zero-G micro-levitation

      const assemblyProg = sharedSpellState.assemblyProgress
      const currentPos = _scratchVector4.lerpVectors(flyInOffset, assembledPos, assemblyProg)
      meshGroupRef.current.position.copy(currentPos)
      
      // Tumble and Click Tumble rotations scaled by assembly state
      const tumbleFactor = 1.0 - assemblyProg
      const clickTumbleX = stateRef.current.tumbleVelocity.x * stateRef.current.shatterVal * 1.8
      const clickTumbleY = stateRef.current.tumbleVelocity.y * stateRef.current.shatterVal * 1.8
      const clickTumbleZ = stateRef.current.tumbleVelocity.z * stateRef.current.shatterVal * 1.8
      
      const finalTumble = _scratchEuler.set(
        (stateRef.current.tumbleRotation.x + clickTumbleX) * tumbleFactor + (stateRef.current.tumbleVelocity.x * 4.0 * tumbleFactor),
        (stateRef.current.tumbleRotation.y + clickTumbleY) * tumbleFactor + (stateRef.current.tumbleVelocity.y * 4.0 * tumbleFactor),
        (stateRef.current.tumbleRotation.z + clickTumbleZ) * tumbleFactor + (stateRef.current.tumbleVelocity.z * 4.0 * tumbleFactor)
      )
      
      const finalQuat = _scratchQuat1.copy(currQuat)
        .multiply(tiltOffsetQuat) // Magnetic repulsion tilt
        .multiply(_scratchQuat3.setFromEuler(finalTumble))
      meshGroupRef.current.quaternion.copy(finalQuat)
    }
  })

  const triggerHover = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    
    // Find active rune for HUD overlays
    const r = runeData[0]?.rune || "ᚠ"
    const fullLore = RUNE_LORES[r] || "Arcane resonance anchor"
    
    const parts = fullLore.split(":")
    const name = parts[0]?.trim() || "Runic Inscription"
    const desc = parts[1]?.trim() || "Arcane stabilizer"
    
    onHover(r, name, desc)
  }

  const triggerHoverOut = () => {
    onHover(null, null, null)
  }

  // Single click triggers a dramatic zero-g shatter, floating suspension animation, and magnetic reassembly
  const triggerClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (sharedSpellState.lockdown) return

    gsap.killTweensOf(sharedSpellState)
    gsap.fromTo(sharedSpellState, 
      { shatterProgress: 0.0 },
      {
        shatterProgress: 1.0,
        duration: 0.38,       // Fast dramatic shatter explosion
        ease: "expo.out",
        onComplete: () => {
          // Suspend shattered state for 1.1s to allow zero-G floating, then magnetically reform
          gsap.to(sharedSpellState, {
            shatterProgress: 0.0,
            delay: 1.1,         // Floating hover window
            duration: 1.5,      // Magnetic reassembly
            ease: "elastic.out(1.0, 0.62)"
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
      <lineSegments geometry={edgeGeo} renderOrder={1}>
        <primitive object={edgeMat} attach="material" />
      </lineSegments>

      {/* Glowing Runic Extrusions */}
      {runeData.map((rd, i) => (
        <Text
          key={i}
          ref={(el) => { textRefs.current[i] = el }}
          position={rd.pos}
          fontSize={0.28}
          // @ts-expect-error: Drei Text component might not expose toneMapped in some type definitions
          toneMapped={false}
          font="/fonts/NotoSansRunic-Regular.ttf"
          anchorX="center"
          anchorY="middle"
          rotation={rd.rot}
        >
          <meshBasicMaterial color={isDeepDive ? "#4AFFB4" : "#ffb44a"} toneMapped={false} />
          {rd.rune}
        </Text>
      ))}
    </group>
  )
}

/**
 * CONTAINER AND RENDER EXPORT
 */
function CameraController({ isEffectiveMobile }: { isEffectiveMobile: boolean }) {
  const { camera, size } = useThree()

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const aspect = size.width / (size.height || 1)
      // eslint-disable-next-line react-hooks/immutability
      camera.aspect = aspect
      const baseZ = isEffectiveMobile ? 14.2 : 12.0
      // eslint-disable-next-line react-hooks/immutability
      camera.position.z = aspect < 1.0 ? Math.max(baseZ, (baseZ * 0.95) / Math.max(aspect, 0.62)) : baseZ
      camera.updateProjectionMatrix()
    }
  }, [camera, size.width, size.height, isEffectiveMobile])

  return null
}

export default function PolyhedronCanvas({ 
  isHovered = false, 
  isDeepDive = false 
}: { 
  isHovered?: boolean, 
  isDeepDive?: boolean 
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isVisibleRef = useRef(true)
  const [ready, setReady] = useState(true)
  const isLoaded = useSiteLoaderStore((s) => s.isLoaded)
  const forceMobile = useContext(ForceMobileContext)
  
  // Tooltip HUD Overlay state
  const [hud, setHud] = useState<{
    rune: string | null
    runeName: string | null
    loreDesc: string | null
  }>({ rune: null, runeName: null, loreDesc: null })

  const [isMobile, setIsMobile] = useState(false)
  const isEffectiveMobile = isMobile || forceMobile

  useEffect(() => {
    let isIntersecting = true
    let isTabActive = typeof document !== "undefined" ? !document.hidden : true

    const updateVisibility = () => {
      const visible = isIntersecting && isTabActive
      isVisibleRef.current = visible
      sharedSpellState.isVisible = visible
    }

    const handleVisibilityChange = () => {
      isTabActive = typeof document !== "undefined" ? !document.hidden : true
      updateVisibility()
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    const el = containerRef.current
    let observer: IntersectionObserver | null = null

    if (el && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          isIntersecting = entry.isIntersecting
          updateVisibility()
        },
        { threshold: 0.05 }
      )
      observer.observe(el)
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (observer && el) {
        observer.unobserve(el)
        observer.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      const isWindowMobile = typeof window !== "undefined" && window.innerWidth < 768
      const isContainerMobile = containerRef.current ? containerRef.current.clientWidth < 480 : false
      setIsMobile(isWindowMobile || isContainerMobile)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)

    let resizeObserver: ResizeObserver | null = null
    if (containerRef.current && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        checkMobile()
      })
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      window.removeEventListener("resize", checkMobile)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [])

  // Ensure assembly is full and ready immediately upon load
  useEffect(() => {
    sharedSpellState.assemblyProgress = 1.0
  }, [isLoaded])

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
          duration: 0.38,
          ease: "expo.out",
          onComplete: () => {
            gsap.to(sharedSpellState, {
              shatterProgress: 0.0,
              delay: 1.1,
              duration: 1.5,
              ease: "elastic.out(1.0, 0.62)"
            })
          }
        }
      )
      return "Volumetric shatter triggered."
    }

    if (t === "ignite" || t === "ignite on") {
      if (sharedSpellState.lockdown) return "Error: Cannot ignite during lockdown."
      useIgniteStore.getState().ignite()
      return "Ignition core overload: Connected. Overheating..."
    }

    if (t === "ignite off") {
      useIgniteStore.getState().reset()
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
      useIgniteStore.getState().reset() // Shut down heat core
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
      useIgniteStore.getState().reset() // Reset heat core
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
      window.__hexcore_cmd = (cmdStr: string) => {
        const res = executeCommand(cmdStr)
        console.log(`[Hexcore CLI] ${res}`)
        return res
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.__hexcore_cmd
      }
    }
  }, [])

  const transitionPhase = useModeTransitionStore((s) => s.phase)
  const transitionDirection = useModeTransitionStore((s) => s.direction)

  useEffect(() => {
    if (transitionPhase === "covering") {
      // Smooth arcane plate separation & chromatic lock-in without brightness flash
      gsap.killTweensOf(sharedSpellState)
      gsap.fromTo(sharedSpellState, 
        { shatterProgress: 0.0 },
        {
          shatterProgress: 0.28,
          duration: 0.22,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(sharedSpellState, {
              shatterProgress: 0.0,
              duration: 0.55,
              ease: "elastic.out(1.0, 0.58)"
            })
          }
        }
      )
    }
  }, [transitionPhase, transitionDirection])

  if (!ready) return null

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <Canvas 
        camera={{ position: [0, 0, isEffectiveMobile ? 14.2 : 12], fov: 35 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, powerPreference: "high-performance" }}
        resize={{ offsetSize: true, scroll: false }}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, pointerEvents: 'auto' }}
      >
        <CameraController isEffectiveMobile={isEffectiveMobile} />
        <ambientLight intensity={0.20} />
        <pointLight position={[10, 10, 10]} intensity={0.7} />
        <directionalLight position={[-10, 8, -5]} intensity={0.45} color="#ffffff" />
        <directionalLight position={[0, -6, 6]} intensity={0.25} color={isDeepDive ? "#4AFFB4" : "#ffb44a"} />
        
        <Suspense fallback={null}>
          <PolyhedronScene 
            isHovered={isHovered} 
            isDeepDive={isDeepDive} 
            isVisibleRef={isVisibleRef}
            isEffectiveMobile={isEffectiveMobile}
            onHoverFragment={(rune, name, desc) => {
              setHud({ rune, runeName: name, loreDesc: desc })
            }}
          />
        </Suspense>

        {/* Volumetric Bloom Postprocessing - Calibrated for sleek cinematic balance */}
        <EffectComposer multisampling={0}>
          <Bloom 
            luminanceThreshold={0.22} 
            luminanceSmoothing={0.65} 
            mipmapBlur 
            intensity={0.45}
          />
        </EffectComposer>
      </Canvas>

    </div>
  )
}

