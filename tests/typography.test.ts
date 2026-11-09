import { describe, it, expect } from "bun:test"
import { getTypographyClasses } from "@/lib/utils"

describe("Typography Mode Alignment (getTypographyClasses)", () => {
  it("uses font-display for Quick Pitch (isDeepDive = false)", () => {
    const small = getTypographyClasses("1x1", false)
    expect(small.heading).toContain("font-display")
    expect(small.heading).not.toContain("font-mono")

    const medium = getTypographyClasses("2x2", false)
    expect(medium.heading).toContain("font-display")
    expect(medium.heading).not.toContain("font-mono")

    const large = getTypographyClasses("4x4", false)
    expect(large.heading).toContain("font-display")
    expect(large.heading).not.toContain("font-mono")
  })

  it("uses font-mono tracking-tight font-bold for Deep Dive (isDeepDive = true)", () => {
    const small = getTypographyClasses("1x1", true)
    expect(small.heading).toBe("text-base md:text-lg font-mono tracking-tight font-bold")

    const medium = getTypographyClasses("2x2", true)
    expect(medium.heading).toBe("text-lg md:text-xl font-mono tracking-tight font-bold")

    const large = getTypographyClasses("4x4", true)
    expect(large.heading).toBe("text-xl md:text-2xl font-mono tracking-tight font-bold")
  })

  it("handles forceMobile correctly preserving typography styles", () => {
    const mobileQuickPitch = getTypographyClasses("2x2", false, true)
    expect(mobileQuickPitch.heading).toBe("text-xl font-display")

    const mobileDeepDive = getTypographyClasses("2x2", true, true)
    expect(mobileDeepDive.heading).toBe("text-lg font-mono tracking-tight font-bold")
  })
})
