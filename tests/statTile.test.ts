import { describe, it, expect } from "bun:test"
import React from "react"
import { renderOdometerDigits } from "@/components/bento/tiles/StatTile"

describe("StatTile renderOdometerDigits", () => {
  it("renders digits and non-digits correctly with accessibility attributes and transform offsets", () => {
    const root = renderOdometerDigits("3.8 GPA") as React.ReactElement<any>
    expect(React.isValidElement(root)).toBe(true)
    expect(root.props["aria-label"]).toBe("3.8 GPA")

    // Children of root: sr-only span and aria-hidden span
    const [srOnly, ariaHidden] = React.Children.toArray(root.props.children) as React.ReactElement<any>[]
    expect(srOnly.props.children).toBe("3.8 GPA")
    expect(srOnly.props.className).toContain("sr-only")
    expect(ariaHidden.props["aria-hidden"]).toBe("true")

    const elements = React.Children.toArray(ariaHidden.props.children) as React.ReactElement<any>[]
    expect(elements).toHaveLength(7) // '3', '.', '8', ' ', 'G', 'P', 'A'

    // First char is '3' -> digit with transform translateY(-3em)
    const first = elements[0]
    expect(first.props.className).toContain("overflow-hidden")
    const firstTranslateWrapper = first.props.children as React.ReactElement<any>
    expect(firstTranslateWrapper.props.style.transform).toBe("translateY(-3em)")

    // Second char is '.' -> non-digit
    const second = elements[1]
    expect(second.props.className).toContain("inline-block")
    expect(second.props.children).toBe(".")

    // Third char is '8' -> digit with transform translateY(-8em)
    const third = elements[2]
    expect(third.props.className).toContain("overflow-hidden")
    const thirdTranslateWrapper = third.props.children as React.ReactElement<any>
    expect(thirdTranslateWrapper.props.style.transform).toBe("translateY(-8em)")

    // Fourth char is space -> non-digit non-breaking space
    const fourth = elements[3]
    expect(fourth.props.children).toBe("\u00A0")
  })

  it("handles numeric input properly including translateY offset", () => {
    const root = renderOdometerDigits(42) as React.ReactElement<any>
    expect(root.props["aria-label"]).toBe("42")

    const [, ariaHidden] = React.Children.toArray(root.props.children) as React.ReactElement<any>[]
    const elements = React.Children.toArray(ariaHidden.props.children) as React.ReactElement<any>[]
    expect(elements).toHaveLength(2)

    const first = elements[0]
    expect(first.props.className).toContain("overflow-hidden")
    expect((first.props.children as React.ReactElement<any>).props.style.transform).toBe("translateY(-4em)")

    const second = elements[1]
    expect(second.props.className).toContain("overflow-hidden")
    expect((second.props.children as React.ReactElement<any>).props.style.transform).toBe("translateY(-2em)")
  })

  it("handles nullish and empty inputs gracefully", () => {
    expect(renderOdometerDigits(null)).toBeNull()
    expect(renderOdometerDigits(undefined)).toBeNull()
    expect(renderOdometerDigits("")).toBeNull()
  })
})
