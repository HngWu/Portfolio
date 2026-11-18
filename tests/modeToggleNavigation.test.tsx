import { GlobalRegistrator } from "@happy-dom/global-registrator"
try {
  GlobalRegistrator.register()
} catch {}

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test"
import { render, cleanup, act } from "@testing-library/react"
import * as React from "react"

mock.module("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: () => {}, prefetch: () => {} }),
}))

import { useViewModeStore } from "@/store/useViewModeStore"
import { ModeApplier } from "@/components/providers/ModeApplier"
import { TerminalTile } from "@/components/bento/tiles/TerminalTile"

describe("ModeApplier & Navigation Toggle Persistence", () => {
  beforeEach(() => {
    cleanup()
    useViewModeStore.setState({ mode: "quick" })
    window.location.href = "http://localhost:3000/?mode=deep"
  })

  afterEach(() => {
    cleanup()
  })

  it("initializes mode to deep when URL has ?mode=deep", () => {
    render(<ModeApplier />)
    expect(useViewModeStore.getState().mode).toBe("deep")
  })

  it("does not revert mode to deep when user toggles to quick", () => {
    render(<ModeApplier />)
    expect(useViewModeStore.getState().mode).toBe("deep")

    // User toggles to quick
    act(() => {
      useViewModeStore.getState().setMode("quick")
    })

    // Mode must stay "quick" and not be forced back to "deep" by ModeApplier
    expect(useViewModeStore.getState().mode).toBe("quick")
    
    // URL search param must be updated/cleared
    const params = new URLSearchParams(window.location.search)
    expect(params.get("mode")).toBeNull()
  })
})

describe("TerminalTile Input Focus", () => {
  afterEach(() => {
    cleanup()
  })

  it("does not auto-focus the input on initial mount", () => {
    const { container } = render(
      <TerminalTile id="terminal" size="4x4" />
    )
    const input = container.querySelector("input")
    expect(input).not.toBeNull()
    expect(document.activeElement).not.toBe(input)
  })
})
