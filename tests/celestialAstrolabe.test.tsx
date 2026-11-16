import { describe, it, expect, mock } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

// Mock next/navigation
mock.module("next/navigation", () => ({
  usePathname: () => "/skills",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: () => {},
    replace: () => {},
    prefetch: () => {},
    back: () => {},
    forward: () => {},
  }),
}))

import { CelestialAstrolabe } from "@/components/skills/CelestialAstrolabe"
import { SkillTree } from "@/components/skills/SkillTree"
import skillTreeData from "@/lib/data/skill-tree-data.json"
import type { SkillTreeData } from "@/types/skill-tree"

describe("CelestialAstrolabe Component", () => {
  const data = skillTreeData as SkillTreeData

  it("renders without error using renderToStaticMarkup", () => {
    const html = renderToStaticMarkup(React.createElement(CelestialAstrolabe, { data }))
    expect(html).toContain("Celestial Astrolabe Controls")
    expect(html).toContain("Celestial Astrolabe Canvas")
    expect(html).toContain("POLARIS ALIGNMENT: 0.00°")
  })

  it("renders concentric azimuth ticks and outer degree markings", () => {
    const html = renderToStaticMarkup(React.createElement(CelestialAstrolabe, { data }))
    // Cardinal degree labels
    expect(html).toContain("000° N")
    expect(html).toContain("090° E")
    expect(html).toContain("180° S")
    expect(html).toContain("270° W")
    // Rotating reticles classes
    expect(html).toContain("animate-astrolabe-orbit-cw")
    expect(html).toContain("animate-astrolabe-orbit-ccw")
  })

  it("renders all star nodes with accessibility roles and labels", () => {
    const html = renderToStaticMarkup(React.createElement(CelestialAstrolabe, { data }))
    for (const node of data.nodes) {
      // In HTML static markup, & is escaped to &amp;
      const expectedText = node.label.replace(/&/g, "&amp;")
      expect(html).toContain(expectedText)
      expect(html).toContain(`aria-label="${expectedText}`)
    }
  })

  it("renders Project Sigil marker jewel on nodes that have linkedProject", () => {
    const html = renderToStaticMarkup(React.createElement(CelestialAstrolabe, { data }))
    const nodesWithSigils = data.nodes.filter((n) => Boolean(n.linkedProject))
    expect(nodesWithSigils.length).toBeGreaterThan(0)
    for (const node of nodesWithSigils) {
      expect(html).toContain(`Project Sigil: ${node.linkedProject!.title}`)
    }
  })

  it("renders conduit paths with starlight pulse dual layers", () => {
    const html = renderToStaticMarkup(React.createElement(CelestialAstrolabe, { data }))
    expect(html).toContain("conduits-layer")
    expect(html).toContain("astrolabe-filament-glow")
    expect(html).toContain("animate-celestial-flow")
  })

  it("SkillTree re-exports CelestialAstrolabe and renders identically", () => {
    const htmlTree = renderToStaticMarkup(React.createElement(SkillTree, { data }))
    const htmlAstrolabe = renderToStaticMarkup(React.createElement(CelestialAstrolabe, { data }))
    expect(htmlTree).toBe(htmlAstrolabe)
  })
})
