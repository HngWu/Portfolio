import { describe, it, expect, mock } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

mock.module("@react-three/fiber", () => ({
  useFrame: () => {},
  useThree: () => ({ camera: {}, scene: {}, gl: {} }),
}))

import { DeityAsteroids3D } from "../components/three/deity/DeityAsteroids3D"

describe("DeityAsteroids3D Component", () => {
  it("renders 3D asteroid field and micro escort ships", () => {
    const html = renderToStaticMarkup(React.createElement(DeityAsteroids3D))
    expect(html).toContain("name=\"deity-asteroids\"")
    expect(html).toContain("name=\"deity-escort-ships\"")
  })
})
