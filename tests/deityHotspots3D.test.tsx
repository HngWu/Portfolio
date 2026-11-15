import { describe, it, expect, mock } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

mock.module("@react-three/fiber", () => ({
  useFrame: () => {},
  useThree: () => ({ camera: {}, scene: {}, gl: {} }),
}))

mock.module("@react-three/drei", () => ({
  Html: ({ children, position }: any) =>
    React.createElement("div", { "data-drei-html": "true", "data-pos": JSON.stringify(position) }, children),
}))

import { DeityHotspots3D } from "../components/three/deity/DeityHotspots3D"

describe("DeityHotspots3D Component", () => {
  it("renders 3D world-space hotspots for Crown, Core, and Claymore", () => {
    const html = renderToStaticMarkup(React.createElement(DeityHotspots3D))
    expect(html).toContain("name=\"deity-hotspots\"")
    expect(html).toContain("SYS.HALO")
    expect(html).toContain("CORE.REACTOR")
    expect(html).toContain("AEGIS.WEAPON")
  })
})
