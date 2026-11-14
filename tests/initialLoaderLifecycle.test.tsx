import { GlobalRegistrator } from "@happy-dom/global-registrator"
GlobalRegistrator.register()

import { describe, it, expect, beforeEach, mock } from "bun:test"
import React from "react"
import { render } from "@testing-library/react"
import { BentoGrid } from "@/components/bento/BentoGrid"
import { InitialLoaderOverlay } from "@/components/layout/InitialLoaderOverlay"
import { useSiteLoaderStore } from "@/store/useSiteLoaderStore"

// Mock next/navigation
let currentPathname = "/"
mock.module("next/navigation", () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({
    push: () => {},
    replace: () => {},
    prefetch: () => {},
    back: () => {},
    forward: () => {}
  })
}))

describe("Initial Loader & Bento Grid Static Occlusion Suite", () => {
  beforeEach(() => {
    currentPathname = "/"
    // Reset loader store to default booting state
    useSiteLoaderStore.setState({
      progress: 0,
      isModelReady: false,
      isBootFinished: false,
      isLoaded: false,
      phase: "booting",
      heroAnchorRect: null
    })
  })

  it("renders BentoGrid with static invisible and opacity-0 classes when isLoaded is false", () => {
    const { container } = render(
      <BentoGrid>
        <div data-id="tile-1">Tile 1</div>
      </BentoGrid>
    )

    // The gridRef container wrapping the tiles
    const gridContainer = container.querySelector('[class*="opacity-0"][class*="invisible"]')
    expect(gridContainer).not.toBeNull()
    expect(gridContainer?.className).toContain("opacity-0")
    expect(gridContainer?.className).toContain("invisible")
    expect(gridContainer?.className).toContain("pointer-events-none")
  })

  it("switches BentoGrid container to visible and opacity-100 when isLoaded is true", () => {
    useSiteLoaderStore.setState({ isLoaded: true, phase: "settled" })

    const { container } = render(
      <BentoGrid>
        <div data-id="tile-1">Tile 1</div>
      </BentoGrid>
    )

    const gridContainer = container.querySelector('[class*="opacity-100"][class*="visible"]')
    expect(gridContainer).not.toBeNull()
    expect(gridContainer?.className).toContain("opacity-100")
    expect(gridContainer?.className).toContain("visible")
    expect(gridContainer?.className).not.toContain("invisible")
  })

  it("renders InitialLoaderOverlay with solid blocking backdrop veil and HUD telemetry in booting phase", () => {
    const { container } = render(<InitialLoaderOverlay />)

    // Verify outer overlay container
    const overlay = container.querySelector(".fixed.inset-0")
    expect(overlay).not.toBeNull()
    expect(overlay?.className).toContain("z-[10002]")

    // Verify blocking veil element has solid background and opacity
    const veil = container.querySelector(".bg-\\[\\#050505\\]")
    expect(veil).not.toBeNull()
    expect(veil?.className).toContain("bg-[#050505]")
    expect(veil?.className).toContain("opacity-100")

    // Verify telemetry HUD is rendered immediately in DOM
    const hud = container.textContent
    expect(hud).toContain("INITIALIZING RUNIC ENGINE")
  })

  it("returns null on subpages when pathname is not root '/'", () => {
    currentPathname = "/cv"
    const { container } = render(<InitialLoaderOverlay />)
    expect(container.firstChild).toBeNull()
  })
})
