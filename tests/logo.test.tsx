import { GlobalRegistrator } from "@happy-dom/global-registrator"
try {
  GlobalRegistrator.register()
} catch {}

import { describe, it, expect } from "bun:test"
import { render } from "@testing-library/react"
import * as React from "react"
import { Logo } from "@/components/ui/Logo"

describe("Logo Component", () => {
  it("renders an SVG with the isometric HexPrism viewBox and accessibility attributes", () => {
    const { container } = render(<Logo className="size-6" />)
    const svg = container.querySelector("svg")
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24")
    expect(svg?.classList.contains("size-6")).toBe(true)
    expect(svg?.getAttribute("aria-hidden")).toBe("true")
  })

  it("renders all three isometric facets (top, left, right) and central nexus", () => {
    const { container } = render(<Logo />)
    const topFacet = container.querySelector("[data-facet='top']")
    const leftFacet = container.querySelector("[data-facet='left']")
    const rightFacet = container.querySelector("[data-facet='right']")
    const nexus = container.querySelector("[data-facet='nexus']")

    expect(topFacet).not.toBeNull()
    expect(leftFacet).not.toBeNull()
    expect(rightFacet).not.toBeNull()
    expect(nexus).not.toBeNull()

    expect(topFacet?.getAttribute("d")).toBe("M12 2 L21 7 L12 12 L3 7 Z")
    expect(leftFacet?.getAttribute("d")).toBe("M3 7 L12 12 L12 22 L3 17 Z")
    expect(rightFacet?.getAttribute("d")).toBe("M12 12 L21 7 L21 17 L12 22 Z")
    expect(nexus?.getAttribute("d")).toBe("M12 9.5 L14.5 12 L12 14.5 L9.5 12 Z")
  })

  it("applies mode-accent styling to the right facet and supports custom size prop", () => {
    const { container } = render(<Logo size={32} />)
    const svg = container.querySelector("svg")
    expect(svg?.getAttribute("width")).toBe("32")
    expect(svg?.getAttribute("height")).toBe("32")

    const rightFacet = container.querySelector("[data-facet='right']")
    expect(rightFacet?.getAttribute("fill")).toBe("var(--mode-accent, #4AFFB4)")
  })
})
