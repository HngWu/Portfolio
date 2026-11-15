import { describe, it, expect, mock } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

mock.module("@react-three/fiber", () => ({
  useFrame: () => {},
  useThree: () => ({ camera: {}, scene: {}, gl: {} }),
}))

import { ShoulderOrdnance3D } from "../components/three/deity/robot/ShoulderOrdnance3D"

describe("ShoulderOrdnance3D Component", () => {
  const dummyMaterial = {} as any

  it("renders the 3D shoulder ordnance pod for both left and right sides", () => {
    const htmlLeft = renderToStaticMarkup(
      React.createElement(ShoulderOrdnance3D, {
        side: "left",
        titaniumMaterial: dummyMaterial,
        crownGoldMaterial: dummyMaterial,
        chromeMaterial: dummyMaterial,
        visorGlowMaterial: dummyMaterial,
        isOverdrive: false,
      })
    )
    expect(htmlLeft).toContain("name=\"shoulder-ordnance-left\"")

    const htmlRight = renderToStaticMarkup(
      React.createElement(ShoulderOrdnance3D, {
        side: "right",
        titaniumMaterial: dummyMaterial,
        crownGoldMaterial: dummyMaterial,
        chromeMaterial: dummyMaterial,
        visorGlowMaterial: dummyMaterial,
        isOverdrive: true,
      })
    )
    expect(htmlRight).toContain("name=\"shoulder-ordnance-right\"")
  })
})
