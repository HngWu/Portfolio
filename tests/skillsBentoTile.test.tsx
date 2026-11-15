import { describe, it, expect, mock } from "bun:test"
// @ts-ignore - bun:sqlite is runtime-provided by Bun
import { Database } from "bun:sqlite"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

// Mock next/navigation
mock.module("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: () => {},
    replace: () => {},
    prefetch: () => {},
    back: () => {},
    forward: () => {},
  }),
}))

let lastBentoTileProps: any = null
mock.module("@/components/bento/BentoTile", () => ({
  BentoTile: (props: any) => {
    lastBentoTileProps = props
    return React.createElement(
      "div",
      {
        "data-testid": "bento-tile",
        "data-id": props.id,
        "data-size": props.size,
        className: props.className,
      },
      props.children,
      props.deepContent
    )
  },
}))

import { MiniAstrolabeGraphic } from "@/components/bento/tiles/MiniAstrolabeGraphic"
import { SkillsTile } from "@/components/bento/tiles/SkillsTile"

describe("Skills Bento Tile Database Sizing", () => {
  it("has size 4x4 configured in the database for the skill tile", () => {
    const db = new Database("data/portfolio.db")
    const tile = db.query<{ size: string }, [string]>(
      "SELECT size FROM tiles WHERE type = ? LIMIT 1"
    ).get("skill")

    expect(tile).not.toBeNull()
    expect(tile?.size).toBe("4x4")
  })
})

describe("MiniAstrolabeGraphic Density & Sizing", () => {
  it("renders with responsive height classes h-28 sm:h-30 md:h-32", () => {
    const html = renderToStaticMarkup(React.createElement(MiniAstrolabeGraphic))
    expect(html).toContain("h-28 sm:h-30 md:h-32")
    expect(html).toContain("viewBox=\"0 0 320 160\"")
  })

  it("renders brass ticks, center glow, and constellation stars", () => {
    const html = renderToStaticMarkup(React.createElement(MiniAstrolabeGraphic))
    expect(html).toContain("astrolabe-center-glow")
    expect(html).toContain("animate-astrolabe-orbit-cw")
    expect(html).toContain("Core CS")
    expect(html).toContain("Web Arch")
    expect(html).toContain("Enterprise")
  })
})

describe("SkillsTile 4x4 Density & Component Integration", () => {
  it("renders with custom compact padding p-4 sm:p-5 md:p-5 and 4x4 layout", () => {
    lastBentoTileProps = null
    const html = renderToStaticMarkup(
      React.createElement(SkillsTile, {
        id: "skills-test",
        size: "4x4",
        content: {
          tags: ["Java", "Spring Boot", "Next.js 16", "TypeScript", "Three.js", "Docker", "Go", "OpenShift", "Jenkins"],
        },
      })
    )

    expect(lastBentoTileProps?.size).toBe("4x4")
    expect(lastBentoTileProps?.className).toBe("p-4 sm:p-5 md:p-5")
    expect(html).toContain("Technical Skills")
    expect(html).not.toContain("CORE DISCIPLINES")
    expect(html).toContain("SYSTEM TOPOLOGY")
    expect(html).not.toContain("Interactive Telemetry")
  })
})


