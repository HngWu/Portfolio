import { GlobalRegistrator } from "@happy-dom/global-registrator"
try {
  GlobalRegistrator.register()
} catch {}

import { describe, it, expect, mock } from "bun:test"
import { render } from "@testing-library/react"
import * as React from "react"

// Mock Next.js navigation and page transitions
mock.module("next/navigation", () => ({
  usePathname: () => "/",
}))

mock.module("@/hooks/usePageTransition", () => ({
  usePageTransition: () => ({
    navigateWithTransition: () => {},
  }),
}))

mock.module("@/store/useSiteLoaderStore", () => ({
  useSiteLoaderStore: (selector: any) => selector({ isLoaded: true }),
}))

mock.module("@/components/nav/ViewModeToggle", () => ({
  ViewModeToggle: () => React.createElement("div", { "data-testid": "view-mode-toggle" }),
}))

mock.module("@/components/nav/PerformanceToggle", () => ({
  PerformanceToggle: () => React.createElement("div", { "data-testid": "perf-toggle" }),
}))

import { Navbar } from "@/components/nav/Navbar"

describe("Navbar Home Button Logo Integration", () => {
  it("renders the HexPrism Logo when on the home route", () => {
    const { container } = render(<Navbar />)
    const logoSvg = container.querySelector("svg[viewBox='0 0 24 24']")
    expect(logoSvg).not.toBeNull()

    const topFacet = logoSvg?.querySelector("[data-facet='top']")
    const rightFacet = logoSvg?.querySelector("[data-facet='right']")
    expect(topFacet).not.toBeNull()
    expect(rightFacet).not.toBeNull()
  })

  it("links to / with accessible home labels", () => {
    const { container } = render(<Navbar />)
    const link = container.querySelector("a[href='/']")
    expect(link).not.toBeNull()
    expect(link?.getAttribute("aria-label")).toBe("Home")
  })
})
