import { describe, it, expect, mock } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

mock.module("@react-three/fiber", () => ({
  useFrame: () => {},
  useThree: () => ({ camera: {}, scene: {}, gl: {} }),
}))

mock.module("@react-three/drei", () => ({
  useGLTF: Object.assign(
    () => ({ scene: { clone: () => ({ isGroup: true }) } }),
    { preload: () => {} }
  ),
}))

import { DeityGltfModel } from "../components/three/deity/DeityGltfModel"

describe("DeityGltfModel Component", () => {
  it("renders when active", () => {
    const html = renderToStaticMarkup(
      React.createElement(DeityGltfModel, { modelUrl: "/models/test.glb" })
    )
    expect(html).toContain("name=\"deity-gltf-model\"")
  })
})
