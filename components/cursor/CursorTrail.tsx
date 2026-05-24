import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  size: number
  opacity: number
  age: number
  maxAge: number
  char: string
}

interface CursorTrailProps {
  cursorPos: { x: number; y: number }
  cursorVel: { x: number; y: number }
  mode: 'quick' | 'deep'
}

const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ"]
const BINARY = ["0", "1"]

export default function CursorTrail({ cursorPos, cursorVel, mode }: CursorTrailProps) {
  const containerRef = useRef<THREE.Group>(null)
  
  // Track unique particle counter to avoid ID conflicts
  const nextId = useRef(0)

  // Maintain a fixed-size pre-allocated pool of particles to prevent GC thrashing
  const maxParticles = 35
  const particlesRef = useRef<Particle[]>([])

  // Store the last coordinates where a particle was spawned to regulate density
  const lastSpawnPos = useRef({ x: 0, y: 0 })

  // Trigger state check to know what characters to use
  const isDeep = mode === 'deep'

  // Pre-allocated colors to avoid runtime allocations (Gold for magic, Blue for tech)
  const magicColor = useMemo(() => new THREE.Color("#FFB44A").getStyle(), [])
  const techColor = useMemo(() => new THREE.Color("#0066FF").getStyle(), [])

  useFrame((state, delta) => {
    // 1. Particle pool update loop
    particlesRef.current.forEach((p) => {
      p.age += delta
      p.opacity = 1.0 - p.age / p.maxAge

      // Apply drag / friction to velocities
      p.vx *= 0.95
      p.vy *= 0.95

      // Magic mode: organic, undulating drift (plasma noise simulation)
      if (!isDeep) {
        p.x += p.vx + Math.sin(state.clock.getElapsedTime() * 8.0 + p.id) * 0.4
        p.y += p.vy + Math.cos(state.clock.getElapsedTime() * 8.0 + p.id) * 0.4
        p.rotation += p.rotationSpeed * delta
      } else {
        // Tech mode: rigid, linear drift with high inertia
        p.x += p.vx
        p.y += p.vy
      }
    })

    // Remove expired particles
    particlesRef.current = particlesRef.current.filter(p => p.age < p.maxAge)

    // 2. Conditional particle spawning based on travel distance
    const dist = Math.hypot(cursorPos.x - lastSpawnPos.current.x, cursorPos.y - lastSpawnPos.current.y)
    
    // Spawn threshold: 10px of cursor travel
    if (dist > 10 && particlesRef.current.length < maxParticles) {
      nextId.current += 1
      
      const charPool = isDeep ? BINARY : RUNES
      const randomChar = charPool[Math.floor(Math.random() * charPool.length)]
      
      // Spawn at cursor position with inverse velocity inertia
      const newParticle: Particle = {
        id: nextId.current,
        x: cursorPos.x,
        y: cursorPos.y,
        vx: -cursorVel.x * 0.25 + (Math.random() - 0.5) * 1.5,
        vy: -cursorVel.y * 0.25 + (Math.random() - 0.5) * 1.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 2.5,
        size: isDeep ? 6 + Math.random() * 4 : 8 + Math.random() * 5,
        opacity: 1.0,
        age: 0,
        maxAge: isDeep ? 0.7 + Math.random() * 0.4 : 1.0 + Math.random() * 0.5,
        char: randomChar
      }

      particlesRef.current.push(newParticle)
      lastSpawnPos.current = { x: cursorPos.x, y: cursorPos.y }
    }
  })

  // Synchronously update refs during render to achieve high-performance updates
  return (
    <group ref={containerRef}>
      {particlesRef.current.map((p) => (
        <group key={p.id} position={[p.x, p.y, 0]}>
          <Text
            fontSize={p.size}
            font={isDeep ? undefined : "/fonts/NotoSansRunic-Regular.ttf"}
            anchorX="center"
            anchorY="middle"
            rotation={[0, 0, isDeep ? 0 : p.rotation]}
            fillOpacity={p.opacity}
          >
            <meshBasicMaterial 
              color={isDeep ? techColor : magicColor} 
              toneMapped={false} 
              transparent 
              opacity={p.opacity}
              depthWrite={false}
            />
            {p.char}
          </Text>
        </group>
      ))}
    </group>
  )
}
