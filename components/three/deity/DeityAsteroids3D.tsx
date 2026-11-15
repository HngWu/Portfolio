"use client"

import React, { useRef, useMemo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface AsteroidData {
  pos: [number, number, number]
  rot: [number, number, number]
  rotSpeed: [number, number, number]
  scale: number
}

interface EscortShipData {
  radius: number
  height: number
  speed: number
  phase: number
}

const COUNT = 48
const _dummyMatrix = new THREE.Matrix4()
const _dummyPosition = new THREE.Vector3()
const _dummyQuaternion = new THREE.Quaternion()
const _dummyEuler = new THREE.Euler()
const _dummyScale = new THREE.Vector3()

export function DeityAsteroids3D() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const shipsGroupRef = useRef<THREE.Group>(null)

  // Generate random orbital parameters for 48 asteroids
  const asteroids: AsteroidData[] = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => {
      // Golden spiral distribution around perimeter
      const theta = (i * Math.PI * (3 - Math.sqrt(5)))
      const radius = 4.2 + (i / COUNT) * 6.5
      const x = Math.cos(theta) * radius + (Math.random() - 0.5) * 1.5
      const y = (Math.random() - 0.5) * 6.5
      const z = (Math.sin(theta) * radius * 0.4) + (Math.random() - 0.5) * 3.5

      return {
        pos: [x, y, z],
        rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        rotSpeed: [
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4,
        ],
        scale: 0.12 + Math.random() * 0.38,
      }
    })
  }, [])

  // 6 micro escort starships orbiting in formation
  const ships: EscortShipData[] = useMemo(() => {
    return [
      { radius: 5.2, height: 1.2, speed: 0.28, phase: 0 },
      { radius: 5.5, height: 0.9, speed: 0.28, phase: 0.15 },
      { radius: 5.8, height: 1.5, speed: 0.28, phase: 0.08 },
      { radius: 7.2, height: -1.8, speed: -0.22, phase: 1.2 },
      { radius: 7.6, height: -2.1, speed: -0.22, phase: 1.35 },
      { radius: 8.0, height: -1.5, speed: -0.22, phase: 1.28 },
    ]
  }, [])

  useEffect(() => {
    if (!meshRef.current) return
    asteroids.forEach((ast, i) => {
      _dummyPosition.set(ast.pos[0], ast.pos[1], ast.pos[2])
      _dummyEuler.set(ast.rot[0], ast.rot[1], ast.rot[2])
      _dummyQuaternion.setFromEuler(_dummyEuler)
      _dummyScale.set(ast.scale, ast.scale, ast.scale)
      _dummyMatrix.compose(_dummyPosition, _dummyQuaternion, _dummyScale)
      meshRef.current?.setMatrixAt(i, _dummyMatrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [asteroids])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    // 1. Tumbling Asteroid Updates
    if (meshRef.current) {
      asteroids.forEach((ast, i) => {
        ast.rot[0] += ast.rotSpeed[0] * delta
        ast.rot[1] += ast.rotSpeed[1] * delta
        ast.rot[2] += ast.rotSpeed[2] * delta

        _dummyPosition.set(ast.pos[0], ast.pos[1], ast.pos[2])
        _dummyEuler.set(ast.rot[0], ast.rot[1], ast.rot[2])
        _dummyQuaternion.setFromEuler(_dummyEuler)
        _dummyScale.set(ast.scale, ast.scale, ast.scale)
        _dummyMatrix.compose(_dummyPosition, _dummyQuaternion, _dummyScale)
        meshRef.current?.setMatrixAt(i, _dummyMatrix)
      })
      meshRef.current.instanceMatrix.needsUpdate = true
    }

    // 2. Micro Escort Starships Orbital Movement
    if (shipsGroupRef.current) {
      const children = shipsGroupRef.current.children
      ships.forEach((ship, idx) => {
        const shipGroup = children[idx] as THREE.Group | undefined
        if (shipGroup) {
          const angle = t * ship.speed + ship.phase
          const x = Math.cos(angle) * ship.radius
          const z = Math.sin(angle) * ship.radius
          shipGroup.position.set(x, ship.height, z)
          shipGroup.rotation.y = -angle + (ship.speed > 0 ? -Math.PI / 2 : Math.PI / 2)
        }
      })
    }
  })

  return (
    <group name="deity-asteroids" dispose={null}>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. INSTANCED ASTEROID FIELD                                */}
      {/* ────────────────────────────────────────────────────────── */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
        <dodecahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial
          color="#16181f"
          roughness={0.88}
          metalness={0.12}
        />
      </instancedMesh>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. MICRO ESCORT STARSHIP SQUADRON                          */}
      {/* ────────────────────────────────────────────────────────── */}
      <group ref={shipsGroupRef} name="deity-escort-ships">
        {ships.map((_, i) => (
          <group key={i}>
            {/* Cruiser Body */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <coneGeometry args={[0.04, 0.22, 4]} />
              <meshStandardMaterial color="#2d3345" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Delta Wings */}
            <mesh position={[-0.04, 0, 0]}>
              <boxGeometry args={[0.01, 0.16, 0.08]} />
              <meshStandardMaterial color="#1b1f2b" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Glowing Ion Thruster Plume */}
            <mesh position={[-0.12, 0, 0]}>
              <sphereGeometry args={[0.022, 8, 8]} />
              <meshBasicMaterial color="#00F0FF" toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}
