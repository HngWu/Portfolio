import { describe, it, expect, mock } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

mock.module("@react-three/fiber", () => ({
  useFrame: () => {},
  useThree: () => ({ camera: {}, scene: {}, gl: {} }),
}))

import { CelestialClaymore3D } from "../components/three/deity/robot/CelestialClaymore3D"

describe("CelestialClaymore3D Component", () => {
  const dummyMaterial = {} as any

  it("renders the 3D claymore group with blade, crossguard, and hilt", () => {
    const html = renderToStaticMarkup(
      React.createElement(CelestialClaymore3D, {
        titaniumMaterial: dummyMaterial,
        crownGoldMaterial: dummyMaterial,
        chromeMaterial: dummyMaterial,
        visorGlowMaterial: dummyMaterial,
        isOverdrive: false,
      })
    )
    expect(html).toContain("name=\"celestial-claymore\"")
  })

  it("renders with valid materials in overdrive mode", () => {
    const html = renderToStaticMarkup(
      React.createElement(CelestialClaymore3D, {
        titaniumMaterial: dummyMaterial,
        crownGoldMaterial: dummyMaterial,
        chromeMaterial: dummyMaterial,
        visorGlowMaterial: dummyMaterial,
        isOverdrive: true,
      })
    )
    expect(html).toContain("name=\"celestial-claymore\"")
  })
})
