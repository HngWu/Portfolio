"use client"

import React, { useMemo } from "react"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

interface DeityGltfModelProps {
  modelUrl?: string
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export function DeityGltfModel({
  modelUrl = "/models/mechanical-deity.glb",
  scale = 1.0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: DeityGltfModelProps) {
  const gltf = useGLTF(modelUrl)

  const clonedScene = useMemo(() => {
    if (!gltf?.scene) return null
    const cloned = gltf.scene.clone(true)

    // Traverse and enhance materials for metallic gold & cyan glow
    if (typeof cloned.traverse === "function") {
      cloned.traverse((node: any) => {
        if (node.isMesh && node.material) {
          node.castShadow = true
          node.receiveShadow = true

          if (node.material.isMeshStandardMaterial) {
            node.material.envMapIntensity = 1.5
            // Enhance emissive bloom
            if (node.material.emissive && node.material.emissive.getHex() > 0) {
              node.material.emissiveIntensity = 2.0
              node.material.toneMapped = false
            }
          }
        }
      })
    }

    return cloned
  }, [gltf])

  if (!clonedScene) return null

  return (
    <primitive
      object={clonedScene}
      name="deity-gltf-model"
      userData={{ gltfModel: true }}
      scale={scale}
      position={position}
      rotation={rotation}
    />
  )
}

// Preload helper (client-side only)
if (typeof window !== "undefined" && typeof useGLTF?.preload === "function") {
  try {
    useGLTF.preload("/models/mechanical-deity.glb")
  } catch {
    // Ignore preload errors if asset not present
  }
}
