import { describe, it, expect } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MechanicalDeityCenterpiece } from "../components/deity/MechanicalDeityCenterpiece"

describe("Mechanical Deity Centerpiece Orchestrator", () => {
  it("renders with 2.5D parallax container and all composite layers", () => {
    const html = renderToStaticMarkup(React.createElement(MechanicalDeityCenterpiece))
    expect(html).toContain("data-deity-centerpiece=\"true\"")
    expect(html).toContain("data-deity-halo=\"true\"")
    expect(html).toContain("data-deity-spotlight=\"true\"")
    expect(html).toContain("data-deity-emission=\"true\"")
    expect(html).toContain("data-deity-lightning-canvas=\"true\"")
  })

  it("renders telemetry control HUD with overdrive and system badges", () => {
    const html = renderToStaticMarkup(React.createElement(MechanicalDeityCenterpiece))
    expect(html).toContain("SYS.SANCTUM")
    expect(html).toContain("OVERDRIVE")
    expect(html).toContain("TITAN TITL 2.5D")
  })

  it("includes accessible labels and ARIA attributes", () => {
    const html = renderToStaticMarkup(React.createElement(MechanicalDeityCenterpiece))
    expect(html).toContain("aria-label=\"Interactive Mechanical Deity Centerpiece\"")
  })
})
