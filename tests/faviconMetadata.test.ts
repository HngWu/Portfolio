import { describe, it, expect, mock } from "bun:test"
import fs from "fs"

mock.module("next/font/google", () => ({
  Geist: () => ({ variable: "--font-ui" }),
  Geist_Mono: () => ({ variable: "--font-mono" }),
  Playfair_Display: () => ({ variable: "--font-display" }),
}))

mock.module("@/app/actions/page-transitions", () => ({
  getPageTransitions: async () => [],
}))

mock.module("@/lib/content/portfolio", () => ({
  getPortfolioContent: async () => ({}),
  getSearchableContent: () => [],
}))

describe("RootLayout Metadata & Favicon Assets", () => {
  it("registers SVG icon in layout metadata", async () => {
    const { metadata } = await import("@/app/layout")
    expect(metadata.icons).toBeDefined()
    const icons = metadata.icons as { icon: Array<{ url: string; type: string }> }
    expect(icons.icon).toBeDefined()
    expect(icons.icon[0].url).toBe("/icon.svg")
    expect(icons.icon[0].type).toBe("image/svg+xml")
  })

  it("provides valid app/icon.svg and public/icon.svg with HexPrism geometry and gradients", () => {
    expect(fs.existsSync("app/icon.svg")).toBe(true)
    expect(fs.existsSync("public/icon.svg")).toBe(true)

    const iconSvg = fs.readFileSync("app/icon.svg", "utf-8")
    expect(iconSvg).toContain("<svg")
    expect(iconSvg).toContain("viewBox=\"0 0 32 32\"")
    expect(iconSvg).toContain("lume-energy")
    expect(iconSvg).toContain("#4AFFB4")
    expect(iconSvg).toContain("#4A8FFF")
  })
})
