import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface TechCursorLayerProps {
  isHovered: boolean
  active: boolean
  scale: number
}

export default function TechCursorLayer({ isHovered, active, scale }: TechCursorLayerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bracketsRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)

  // 1. PBR Materials using standard physical materials to get premium metallic reflection
  const brassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#C5A059"), // Hextech Brass
    metalness: 1.0,
    roughness: 0.15,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.5
  }), [])

  const steelMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#4F5D6B"), // Dark Polished Steel
    metalness: 1.0,
    roughness: 0.25,
    clearcoat: 0.2,
    envMapIntensity: 1.0
  }), [])

  const crystalMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#0066FF"),     // Deep Blue Arcane Crystal
    emissive: new THREE.Color("#0022FF"),
    emissiveIntensity: 7.0,
    toneMapped: false
  }), [])


  const bracketMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color("#0066FF"),     // Electric Blue brackets
    transparent: true,
    opacity: 0.75,
    depthWrite: false
  }), [])


  // 2. Extruded Geometries for the physical segmented arrow parts
  const brassCasingGeo = useMemo(() => {
    const shape = new THREE.Shape()
    // Shifted down by 18 units so the tip is exactly at the local origin (0, 0)
    shape.moveTo(0, 0)
    shape.lineTo(13, -23)
    shape.lineTo(9, -25)
    shape.lineTo(5, -22)
    shape.lineTo(0, -27)
    shape.lineTo(-5, -22)
    shape.lineTo(-9, -25)
    shape.lineTo(-13, -23)
    shape.lineTo(0, 0)
    shape.closePath()

    return new THREE.ExtrudeGeometry(shape, {
      depth: 2.5,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.6,
      bevelThickness: 0.6
    })
  }, [])

  const steelCoreGeo = useMemo(() => {
    const shape = new THREE.Shape()
    // Smaller, nested inner core (shifted down by 18 units to align perfectly)
    shape.moveTo(0, -6)
    shape.lineTo(8, -21)
    shape.lineTo(4, -19)
    shape.lineTo(0, -23)
    shape.lineTo(-4, -19)
    shape.lineTo(-8, -21)
    shape.lineTo(0, -6)
    shape.closePath()


    return new THREE.ExtrudeGeometry(shape, {
      depth: 1.8,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.4,
      bevelThickness: 0.4
    })
  }, [])

  // 3. Brackets geometry: L-shaped corners for diagnostic locking HUD
  const bracketGeos = useMemo(() => {
    const geos: THREE.BufferGeometry[] = []
    const createLBracket = (dirX: number, dirY: number) => {
      const shape = new THREE.Shape()
      const size = 6
      const thickness = 1.2
      
      const x0 = dirX * 16
      const y0 = dirY * 16
      
      shape.moveTo(x0, y0)
      shape.lineTo(x0 + dirX * size, y0)
      shape.lineTo(x0 + dirX * size, y0 - dirY * thickness)
      shape.lineTo(x0 + dirX * thickness, y0 - dirY * thickness)
      shape.lineTo(x0 + dirX * thickness, y0 - dirY * size)
      shape.lineTo(x0, y0 - dirY * size)
      shape.closePath()
      
      return new THREE.ShapeGeometry(shape)
    }

    geos.push(createLBracket(1, 1))   // Top-Right
    geos.push(createLBracket(-1, 1))  // Top-Left
    geos.push(createLBracket(-1, -1)) // Bottom-Left
    geos.push(createLBracket(1, -1))  // Bottom-Right
    return geos
  }, [])

  // Ref variables to smooth out target locking and state transition animations
  const currentScale = useRef(active ? 1.0 : 0.0)
  const bracketScale = useRef(1.0)
  const bracketRotation = useRef(0.0)
  const bracketOpacity = useRef(0.7)

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

    // Cyan crystal core breathing intensity
    if (coreRef.current) {
      const breath = 1.0 + Math.sin(t * 12.0) * 0.08
      coreRef.current.scale.setScalar(breath)
      
      // Flickering cyan light emission
      if (crystalMaterial) {
        crystalMaterial.emissiveIntensity = 6.0 + Math.sin(t * 20.0) * 1.5 * (isHovered ? 1.5 : 1.0)
      }
    }

    // Diagnostic HUD brackets morph: shrink and rotate on target hover
    const targetBracketScale = isHovered ? 0.78 : 1.0
    const targetBracketRotation = isHovered ? Math.PI / 4 : 0.0
    const targetBracketOpacity = isHovered ? 1.0 : 0.65

    bracketScale.current = THREE.MathUtils.lerp(bracketScale.current, targetBracketScale, delta * 8.0)
    bracketRotation.current = THREE.MathUtils.lerp(bracketRotation.current, targetBracketRotation, delta * 8.0)
    bracketOpacity.current = THREE.MathUtils.lerp(bracketOpacity.current, targetBracketOpacity, delta * 8.0)

    if (bracketsRef.current) {
      bracketsRef.current.scale.setScalar(bracketScale.current)
      bracketsRef.current.rotation.z = bracketRotation.current
      bracketMaterial.opacity = bracketOpacity.current
    }

    if (groupRef.current) {
      // Very rigid, responsive scaling using the smooth transition scale
      groupRef.current.scale.setScalar(scale * currentScale.current)
      // Tilt cursor slightly to the left (+0.4 radians) like a real OS cursor
      groupRef.current.rotation.z = 0.4


      
      // Digital micro-jitter glitch simulation
      if (isHovered && Math.random() < 0.12) {
        groupRef.current.position.x += (Math.random() - 0.5) * 1.2
        groupRef.current.position.y += (Math.random() - 0.5) * 1.2
      } else {
        groupRef.current.position.set(0, 0, 0)
      }
    }
  })

  if (!active) return null

  return (
    <group>
      {/* Dynamic Jitter Group */}
      <group ref={groupRef}>
        {/* Outer segmented shell - Hextech Brass casing */}
        <mesh geometry={brassCasingGeo} material={brassMaterial} position={[0, 0, 0.5]} />

        {/* Inner core - Polished Steel plate */}
        <mesh geometry={steelCoreGeo} material={steelMaterial} position={[0, 0, 1.5]} />

        {/* Central Luminous Hextech Crystal Core */}
        <mesh ref={coreRef} position={[0, -17, 2.5]}>
          <sphereGeometry args={[2.5, 16, 16]} />
          <meshBasicMaterial color="#E0F2FF" />

          <mesh>
            <sphereGeometry args={[2.8, 16, 16]} />

            <meshStandardMaterial 
              color="#0066FF" 
              emissive="#0022FF" 
              emissiveIntensity={5.0} 
              transparent 
              opacity={0.7} 
              depthWrite={false} 
            />
          </mesh>
        </mesh>
      </group>

      {/* Target-Locking Diagnostic brackets HUD */}
      <group ref={bracketsRef}>
        {bracketGeos.map((geo, i) => (
          <mesh key={i} geometry={geo} material={bracketMaterial} />
        ))}
      </group>
    </group>
  )
}
