import { describe, it, expect } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { DeityHaloGyroscope } from "../components/deity/DeityHaloGyroscope"
import { DeityEnergySpotlight } from "../components/deity/DeityEnergySpotlight"
import { DeityEmissionPulse } from "../components/deity/DeityEmissionPulse"
import { DeityHudHotspots } from "../components/deity/DeityHudHotspots"

describe("Deity Halo Gyroscope", () => {
  it("renders with 3D angled plane rotateX and counter-rotating rings", () => {
    const html = renderToStaticMarkup(React.createElement(DeityHaloGyroscope, { reducedMotion: false }))
    expect(html).toContain("data-deity-halo")
    expect(html).toContain("rotateX(60deg)")
  })

  it("freezes rotation when reducedMotion is true", () => {
    const html = renderToStaticMarkup(React.createElement(DeityHaloGyroscope, { reducedMotion: true }))
    expect(html).toContain("data-reduced-motion=\"true\"")
  })
})

describe("Deity Energy Spotlight", () => {
  it("renders with color-dodge mix blend mode when active", () => {
    const html = renderToStaticMarkup(
      React.createElement(DeityEnergySpotlight, {
        isHovered: true,
        cursorPixel: { x: 120, y: 250 },
      })
    )
    expect(html).toContain("mix-blend-color-dodge")
    expect(html).toContain("120px 250px")
  })

  it("renders with 0 opacity when inactive", () => {
    const html = renderToStaticMarkup(
      React.createElement(DeityEnergySpotlight, {
        isHovered: false,
        cursorPixel: { x: 0, y: 0 },
      })
    )
    expect(html).toContain("opacity-0")
  })
})

describe("Deity Emission Pulse", () => {
  it("renders emission mask with screen mix blend mode", () => {
    const html = renderToStaticMarkup(
      React.createElement(DeityEmissionPulse, {
        overdrive: false,
      })
    )
    expect(html).toContain("data-deity-emission")
    expect(html).toContain("mix-blend-screen")
    expect(html).toContain("layer-emission-mask.webp")
  })

  it("applies overdrive surge styling when overdrive is true", () => {
    const html = renderToStaticMarkup(
      React.createElement(DeityEmissionPulse, {
        overdrive: true,
      })
    )
    expect(html).toContain("data-overdrive=\"true\"")
  })
})

describe("Deity HUD Hotspots", () => {
  it("renders all 3 target nodes: halo, core, and greatsword", () => {
    const html = renderToStaticMarkup(React.createElement(DeityHudHotspots))
    expect(html).toContain("SYS.HALO")
    expect(html).toContain("CORE.REACTOR")
    expect(html).toContain("AEGIS.WEAPON")
  })

  it("renders telemetry stats for all systems", () => {
    const html = renderToStaticMarkup(React.createElement(DeityHudHotspots))
    expect(html).toContain("420 RAD/S")
    expect(html).toContain("1.21 PW")
    expect(html).toContain("440 THZ")
  })
})
