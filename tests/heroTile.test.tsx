import { describe, it, expect, mock } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

mock.module("next/navigation", () => ({
  useRouter: () => ({
    push: mock((_url: string) => {}),
    prefetch: mock((_url: string) => {}),
  }),
  usePathname: () => "/",
}))

describe("HeroTile Headline 2-Line & Stable Height Constraints", () => {
  it("renders bigger font size, allows 2 lines, and locks height with min-h-[2.4em] and whitespace-pre-line", async () => {
    const { HeroTile } = await import("@/components/bento/tiles/HeroTile")
    const content = {
      mark: "Always Iterating · Always Improving",
      role: "Software Engineer",
      description: "Continuously refining this portfolio with modular architecture.",
    }

    const html = renderToStaticMarkup(
      React.createElement(HeroTile, {
        id: "hero",
        size: "6x4",
        content,
      })
    )

    // Check all h1 elements rendered in HeroTile (Quick-Pitch and Deep-Dive)
    const h1Matches = Array.from(html.matchAll(/<h1[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/h1>/g))
    expect(h1Matches.length).toBe(2)

    h1Matches.forEach((match) => {
      const className = match[1]
      const textContent = match[2]

      // 1. Fixed 2-line reserved height so container height does NOT change
      expect(className).toContain("min-h-[2.4em]")
      expect(className).toContain("leading-[1.2]")
      expect(className).toContain("whitespace-pre-line")

      // 2. Contains 2-line formatted text with newline break
      expect(textContent).toContain("Always Iterating ·\nAlways Improving")
    })

    // Assert Quick-Pitch face bigger font size
    const quickPitchH1 = h1Matches.find((m) => m[1].includes("font-display"))
    expect(quickPitchH1).toBeDefined()
    expect(quickPitchH1![1]).toContain("text-2xl")
    expect(quickPitchH1![1]).toContain("sm:text-3xl")

    // Assert Deep-Dive face bigger font size
    const deepDiveH1 = h1Matches.find((m) => m[1].includes("font-mono"))
    expect(deepDiveH1).toBeDefined()
    expect(deepDiveH1![1]).toContain("text-[21px]")
    expect(deepDiveH1![1]).toContain("sm:text-3xl")
  })
})
