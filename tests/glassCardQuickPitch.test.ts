import { describe, it, expect } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { GlassCard } from "@/components/ui/GlassCard"

describe("GlassCard Quick Pitch Hover Overlays", () => {
  it("renders diagonal refractive glass sheen sweep in Quick Pitch mode", () => {
    const html = renderToStaticMarkup(
      React.createElement(GlassCard, { interactive: true }, "Content")
    )

    // Verify diagonal refractive glass sheen sweep container and elements
    expect(html).toContain("group-hover:animate-sheen-sweep")
    expect(html).toContain("motion-reduce:animate-none")
    expect(html).toContain("-rotate-45")
    expect(html).toContain(
      "linear-gradient(90deg, transparent 0%, rgba(255, 232, 117, 0.1) 35%, rgba(255, 255, 255, 0.28) 50%, rgba(255, 232, 117, 0.1) 65%, transparent 100%)"
    )
  })

  it("renders 4 enhanced gold filigree corner brackets with diamond nodes", () => {
    const html = renderToStaticMarkup(
      React.createElement(GlassCard, { interactive: true }, "Content")
    )

    // Diamond nodes styling
    const diamondClass =
      "fill-[#C9A227] transition-all duration-300 group-hover:fill-[#FFE875] group-hover:drop-shadow-[0_0_6px_#FFE875] drop-shadow-[0_0_2px_rgba(201,162,39,0.4)]"
    
    // Count diamond occurrences (one for each of the 4 corners)
    const matches = html.split(diamondClass).length - 1
    expect(matches).toBe(4)

    // Verify corner translation classes
    expect(html).toContain("group-hover:translate-x-[2px] group-hover:translate-y-[2px]")
    expect(html).toContain("group-hover:-translate-x-[2px] group-hover:translate-y-[2px]")
    expect(html).toContain("group-hover:translate-x-[2px] group-hover:-translate-y-[2px]")
    expect(html).toContain("group-hover:-translate-x-[2px] group-hover:-translate-y-[2px]")
  })

  it("preserves liquid gold-amethyst border beam, spotlight, specular reveal, watermark, and embers", () => {
    const html = renderToStaticMarkup(
      React.createElement(GlassCard, { interactive: true }, "Content")
    )

    // Border beam
    expect(html).toContain("animate-border-beam")
    expect(html).toContain("conic-gradient(from 0deg, transparent 0deg, #FFD95A 60deg, #8E44AD 120deg, transparent 180deg)")
    expect(html).toContain("mask-composite:exclude")

    // Caustic spotlight
    expect(html).toContain("radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 217, 90, 0.08) 0%, rgba(142, 68, 173, 0.04) 40%, transparent 70%)")

    // Radial specular border reveal
    expect(html).toContain("radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), #FFD95A 0%, #8E44AD 50%, transparent 75%)")

    // Watermark
    expect(html).toContain("animate-[border-beam-rotate_60s_linear_infinite]")

    // Embers
    expect(html).toContain("animate-ember-float")
  })
})
