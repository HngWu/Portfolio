import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { RunicPlasmaShader } from './CursorShaders'

interface RuneCursorLayerProps {
  isHovered: boolean
  active: boolean
  scale: number
}

const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ"]

export default function RuneCursorLayer({ isHovered, active, scale }: RuneCursorLayerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const ring1Ref = useRef<THREE.Group>(null)
  const ring2Ref = useRef<THREE.Group>(null)
  
  // Custom Shader Material lazy-init
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  if (!materialRef.current) {
    materialRef.current = new THREE.ShaderMaterial({
      vertexShader: RunicPlasmaShader.vertexShader,
      fragmentShader: RunicPlasmaShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 2.5 },
        uWobble: { value: 1.2 },
        uColorMagic: { value: new THREE.Color("#FF9F00") }, // Warm Amber/Gold base
        uColorCore: { value: new THREE.Color("#FFE066") },  // Bright Golden Core
        uIntensity: { value: 1.0 },
        uGlow: { value: 1.8 }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  }

  // Create the stylized magic arrowhead shape
  const arrowGeo = useMemo(() => {
    const shape = new THREE.Shape()
    
    // Shifted down by 16 units so the click tip is exactly at local origin (0, 0)
    shape.moveTo(0, 0)                      // Arrowhead tip at local hotspot
    shape.quadraticCurveTo(6, -10, 12, -20) // Right outer prong tip
    shape.lineTo(4, -18)                    // Inner flare
    shape.lineTo(0, -26)                    // Inner notch at spine base
    shape.lineTo(-4, -18)                   // Inner flare left
    shape.lineTo(-12, -20)                  // Left outer prong tip
    shape.quadraticCurveTo(-6, -10, 0, 0)   // Left outer sweep back to tip
    shape.closePath()

    // Extrude slightly to give a 3D glassmorphic look
    return new THREE.ExtrudeGeometry(shape, {
      depth: 2,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.8,
      bevelThickness: 0.8
    })
  }, [])

  // Create two concentric rings of runes
  const ring1Runes = useMemo(() => {
    const count = 6
    const radius = 24
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i * 2 * Math.PI) / count
      const rune = RUNES[i % RUNES.length]
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, rune, angle }
    })
  }, [])

  const ring2Runes = useMemo(() => {
    const count = 8
    const radius = 38
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i * 2 * Math.PI) / count + Math.PI / 8
      const rune = RUNES[(i + 4) % RUNES.length]
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, rune, angle }
    })
  }, [])

  // Ref variables to interpolate state changes smoothly in useFrame
  const currentScale = useRef(active ? 1.0 : 0.0)
  const currentRing1Scale = useRef(1.0)
  const currentRing2Scale = useRef(1.0)
  const ring1Speed = useRef(0.4)
  const ring2Speed = useRef(-0.3)

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    
    // Smoothly interpolate scale inside useFrame based on active state!
    const targetScale = active ? 1.0 : 0.0
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, delta * 9.0)

    // Early exit only if fully collapsed to zero and inactive to preserve CPU!
    if (!active && currentScale.current < 0.005) {
      if (groupRef.current) groupRef.current.scale.setScalar(0)
      return
    }

    // Update time in plasma shader
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t
      // Pulse glow intensity slightly
      const pulse = 1.6 + Math.sin(t * 8.0) * 0.25
      materialRef.current.uniforms.uGlow.value = pulse
      
      // Make it slightly more unstable (wobbly) when hovering
      const targetWobble = isHovered ? 2.5 : 1.2
      materialRef.current.uniforms.uWobble.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uWobble.value,
        targetWobble,
        delta * 5.0
      )
    }

    // Hover dynamic scaling & spinning for rune rings
    const targetRing1Scale = isHovered ? 1.25 : 1.0
    const targetRing2Scale = isHovered ? 1.35 : 1.0
    currentRing1Scale.current = THREE.MathUtils.lerp(currentRing1Scale.current, targetRing1Scale, delta * 6.0)
    currentRing2Scale.current = THREE.MathUtils.lerp(currentRing2Scale.current, targetRing2Scale, delta * 6.0)

    const target1Speed = isHovered ? 1.8 : 0.4
    const target2Speed = isHovered ? -1.4 : -0.3
    ring1Speed.current = THREE.MathUtils.lerp(ring1Speed.current, target1Speed, delta * 4.0)
    ring2Speed.current = THREE.MathUtils.lerp(ring2Speed.current, target2Speed, delta * 4.0)

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += ring1Speed.current * delta
      ring1Ref.current.scale.setScalar(currentRing1Scale.current)
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z += ring2Speed.current * delta
      ring2Ref.current.scale.setScalar(currentRing2Scale.current)
    }

    if (groupRef.current) {
      // Scale dynamic breathing scaled by our smooth transition scalar
      const breathe = 1.0 + Math.sin(t * 3.5) * 0.04
      groupRef.current.scale.setScalar(scale * currentScale.current * breathe)
      
      // Default OS-like tilt to the left (+0.4 radians) plus a gentle breathing tilt wobble
      groupRef.current.rotation.z = 0.4 + Math.sin(t * 1.5) * 0.04
    }
  })


  if (!active) return null

  return (
    <group ref={groupRef}>
      {/* 3D Plasma Arrowhead */}
      <mesh geometry={arrowGeo} material={materialRef.current!}>
        {/* Draw a subtle bright glowing core line inside the arrow */}
        <lineSegments>
          <edgesGeometry args={[arrowGeo]} />
          <lineBasicMaterial color="#FFD700" opacity={0.6} transparent depthWrite={false} />
        </lineSegments>
      </mesh>

      {/* Concentric Runic Circle 1 (Inner) */}
      <group ref={ring1Ref}>
        {/* Thin gold/purple helper ring */}
        <mesh>
          <ringGeometry args={[23.5, 24.5, 32]} />
          <meshBasicMaterial color="#FFB44A" opacity={0.15} transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
        {ring1Runes.map((r, i) => (
          <Text
            key={i}
            position={[r.x, r.y, 0.5]}
            rotation={[0, 0, r.angle - Math.PI / 2]}
            fontSize={4.5}
            font="/fonts/NotoSansRunic-Regular.ttf"
            anchorX="center"
            anchorY="middle"
          >
            <meshBasicMaterial color="#FFE066" toneMapped={false} depthWrite={false} />
            {r.rune}
          </Text>
        ))}
      </group>

      {/* Concentric Runic Circle 2 (Outer) */}
      <group ref={ring2Ref}>
        <mesh>
          <ringGeometry args={[37.5, 38.5, 32]} />
          <meshBasicMaterial color="#FFE066" opacity={0.1} transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
        {ring2Runes.map((r, i) => (
          <Text
            key={i}
            position={[r.x, r.y, 0.5]}
            rotation={[0, 0, r.angle - Math.PI / 2]}
            fontSize={5.0}
            font="/fonts/NotoSansRunic-Regular.ttf"
            anchorX="center"
            anchorY="middle"
          >
            <meshBasicMaterial color="#FFB44A" toneMapped={false} depthWrite={false} />
            {r.rune}
      </Text>
    ))}
  </group>
</group>
)
}
