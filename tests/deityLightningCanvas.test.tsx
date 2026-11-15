import { describe, it, expect } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { DeityLightningCanvas } from "../components/deity/DeityLightningCanvas"

describe("Deity Lightning Canvas", () => {
  it("renders a transparent canvas element with proper accessibility attributes", () => {
    const html = renderToStaticMarkup(React.createElement(DeityLightningCanvas))
    expect(html).toContain("<canvas")
    expect(html).toContain("data-deity-lightning-canvas=\"true\"")
    expect(html).toContain("aria-hidden=\"true\"")
  })

  it("applies pointer-events-none so it does not block interactions", () => {
    const html = renderToStaticMarkup(React.createElement(DeityLightningCanvas))
    expect(html).toContain("pointer-events-none")
  })
})
