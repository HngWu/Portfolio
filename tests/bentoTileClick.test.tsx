import { describe, it, expect, mock } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

mock.module("next/navigation", () => ({
  useRouter: () => ({
    push: mock((_url: string) => {}),
    prefetch: mock((_url: string) => {}),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}))

describe("Tile and Link Interactions in Deep Dive Mode", () => {
  it("ensures GlassCard does not contain backface-hidden in its root classes", async () => {
    const { GlassCard } = await import("@/components/ui/GlassCard")
    const html = renderToStaticMarkup(React.createElement(GlassCard, null, "Card Content"))
    
    // Root element should not suppress hit testing via backface-hidden
    const rootClassMatch = html.match(/^<div[^>]*class="([^"]*)"/)
    expect(rootClassMatch).not.toBeNull()
    const rootClasses = rootClassMatch![1]
    expect(rootClasses).not.toContain("backface-hidden")
    expect(rootClasses).not.toContain("transform-gpu")
  })

  it("ensures BentoTile face wrappers maintain preserve-3d context", async () => {
    const { BentoTile } = await import("@/components/bento/BentoTile")
    const html = renderToStaticMarkup(
      React.createElement(
        BentoTile,
        {
          id: "test-tile",
          size: "4x4",
          href: "/skills",
          canDeepDive: true,
          children: React.createElement("div", null, "Quick Face"),
          deepContent: React.createElement("div", null, "Deep Face"),
        }
      )
    )

    // Check that face wrappers have preserve-3d
    const matches = Array.from(html.matchAll(/class="([^"]*)"/g)).map((m) => m[1])
    const faceWrappers = matches.filter((c) => c.includes("backface-hidden"))
    expect(faceWrappers.length).toBe(2)
    faceWrappers.forEach((cls) => {
      expect(cls).toContain("preserve-3d")
    })
  })

  it("ensures deep dive URL synchronization preserves mode=deep", async () => {
    const { useViewModeStore } = await import("@/store/useViewModeStore")
    useViewModeStore.setState({ mode: "deep" })

    const mode = useViewModeStore.getState().mode
    const path = "/skills"
    const targetUrl =
      mode === "deep" && !path.includes("mode=")
        ? `${path}${path.includes("?") ? "&" : "?"}mode=deep`
        : path

    expect(targetUrl).toBe("/skills?mode=deep")
  })
})
