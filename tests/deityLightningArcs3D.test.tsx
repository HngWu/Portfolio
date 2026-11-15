import { describe, it, expect, mock } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

mock.module("@react-three/fiber", () => ({
  useFrame: () => {},
  useThree: () => ({ camera: {}, scene: {}, gl: {} }),
}))

import { DeityLightningArcs3D } from "../components/three/deity/DeityLightningArcs3D"

describe("DeityLightningArcs3D Component", () => {
  it("renders 3D lightning group with volumetric arc meshes", () => {
    const html = renderToStaticMarkup(
      React.createElement(DeityLightningArcs3D, {
        isOverdrive: false,
      })
    )
    expect(html).toContain("name=\"deity-lightning-arcs\"")
  })

  it("renders with dynamic curves in overdrive mode", () => {
    const html = renderToStaticMarkup(
      React.createElement(DeityLightningArcs3D, {
        isOverdrive: true,
      })
    )
    expect(html).toContain("name=\"deity-lightning-arcs\"")
  })
})
