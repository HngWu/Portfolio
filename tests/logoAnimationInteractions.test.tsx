import { GlobalRegistrator } from "@happy-dom/global-registrator"
try {
  GlobalRegistrator.register()
} catch {}

import { describe, it, expect, beforeEach } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { render } from "@testing-library/react"
import { Logo } from "@/components/ui/Logo"
import { DynamicFavicon } from "@/components/ui/DynamicFavicon"
import { useViewModeStore } from "@/store/useViewModeStore"

describe("Logo Animations & Interactions Test Suite", () => {
  beforeEach(() => {
    useViewModeStore.setState({ mode: "quick" })
  })

  // =========================================================================
  // 1. Logo Facet Geometry and Mode Adaptability
  // =========================================================================
  describe("Logo Component Facets & Gradients", () => {
    it("renders all four geometric facets: top specular, left obsidian, right energy, and nexus seed", () => {
      const html = renderToStaticMarkup(<Logo />)
      expect(html).toContain('data-facet="top"')
      expect(html).toContain('data-facet="left"')
      expect(html).toContain('data-facet="right"')
      expect(html).toContain('data-facet="nexus"')
      expect(html).toContain('fill="var(--mode-accent, #4AFFB4)"')
    })

    it("renders Quick Pitch mode with solar gold energy gradient and amber nexus core", () => {
      const html = renderToStaticMarkup(<Logo mode="quick" />)
      expect(html).toContain("energy-facet-grad-quick")
      expect(html).toContain("hexprism-core-glow-quick")
      expect(html).toContain("#FFB44A")
    })

    it("renders Deep Dive mode with cyan energy gradient and electric cyan nexus core", () => {
      const html = renderToStaticMarkup(<Logo mode="deep" />)
      expect(html).toContain("energy-facet-grad-deep")
      expect(html).toContain("hexprism-core-glow-deep")
      expect(html).toContain("#6AFFFF")
    })

    it("enhances nexus seed fill-opacity and expands ambient halo on hover", () => {
      const normalHtml = renderToStaticMarkup(<Logo isHovered={false} />)
      const hoveredHtml = renderToStaticMarkup(<Logo isHovered={true} />)

      // Hovered state scales halo radius to 5.5 and boosts fill-opacity
      expect(hoveredHtml).toContain('r="5.5"')
      expect(normalHtml).toContain('r="4"')
      expect(hoveredHtml).toContain('fill-opacity="1"')
    })

    it("inherits mode from useViewModeStore when prop is omitted", () => {
      useViewModeStore.setState({ mode: "deep" })
      const html = renderToStaticMarkup(<Logo />)
      expect(html).toContain("hexprism-core-glow-deep")
      expect(html).toContain("#6AFFFF")
    })
  })

  // =========================================================================
  // 2. Dynamic Browser Tab Favicon
  // =========================================================================
  describe("DynamicFavicon Synchronization", () => {
    it("updates link rel='icon' href to /icon-quick.svg in quick mode", () => {
      render(<DynamicFavicon />)
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
      expect(link).not.toBeNull()
      expect(link.getAttribute("href")).toBe("/icon-quick.svg")
    })
  })
})
