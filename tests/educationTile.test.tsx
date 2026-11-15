import { describe, it, expect, mock, beforeEach } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { useViewModeStore } from "@/store/useViewModeStore"

// Mock BentoTile to capture props and avoid next/navigation dependencies
let lastBentoTileProps: any = null
mock.module("@/components/bento/BentoTile", () => {
  return {
    BentoTile: (props: any) => {
      lastBentoTileProps = props
      return React.createElement("div", { "data-testid": "bento-tile" }, props.children, props.deepContent)
    }
  }
})

import { EducationTile } from "@/components/bento/tiles/EducationTile"

describe("EducationTile", () => {
  const defaultContent = {
    institution: "National University of Singapore",
    degree: "Bachelor of Computing in Computer Science",
    date: "Aug 2028 - Aug 2032"
  }

  beforeEach(() => {
    useViewModeStore.setState({ mode: "quick" })
  })

  it("passes canMorph=false, canExpand=false, and canDeepDive=true to BentoTile", () => {
    lastBentoTileProps = null
    renderToStaticMarkup(
      React.createElement(EducationTile, {
        id: "education",
        size: "2x2",
        content: defaultContent
      })
    )

    expect(lastBentoTileProps).not.toBeNull()
    expect(lastBentoTileProps.canDeepDive).toBe(true)
    expect(lastBentoTileProps.canMorph).toBe(false)
    expect(lastBentoTileProps.canExpand).toBe(false)
  })

  it("renders deepContent matching Quick Pitch parity with mode-accent theme and Deep Dive typography", () => {
    lastBentoTileProps = null
    useViewModeStore.setState({ mode: "deep" })

    const html = renderToStaticMarkup(
      React.createElement(EducationTile, {
        id: "education",
        size: "2x2",
        content: defaultContent
      })
    )

    const deepContent = lastBentoTileProps.deepContent as React.ReactElement<any>
    expect(React.isValidElement(deepContent)).toBe(true)

    // Outer container has role, keyboard handling, tabIndex=0 when in deep mode, and focus outline
    expect(deepContent.props.role).toBe("region")
    expect(deepContent.props["aria-label"]).toBe("Education history carousel")
    expect(deepContent.props.tabIndex).toBe(0)
    expect(typeof deepContent.props.onKeyDown).toBe("function")
    expect(deepContent.props.className).toContain("relative flex flex-col h-full w-full outline-none")
    expect(deepContent.props.className).toContain("focus-visible:ring-1 focus-visible:ring-mode-accent")

    const [headerDiv, stackContainer] = React.Children.toArray(deepContent.props.children) as React.ReactElement<any>[]
    expect(headerDiv.props.className).toContain("flex items-center justify-between mb-2")

    // Deep Dive Header elements
    const [titleGroup, controlsGroup] = React.Children.toArray(headerDiv.props.children) as React.ReactElement<any>[]
    const [labelSpan, badgeSpan] = React.Children.toArray(titleGroup.props.children) as React.ReactElement<any>[]

    // Label with GraduationCap
    expect(labelSpan.props.className).toContain("uppercase tracking-widest")
    const [gradCapIcon, labelText] = React.Children.toArray(labelSpan.props.children) as React.ReactElement<any>[]
    expect(labelText).toBe("Education")
    expect(gradCapIcon.props.className).toContain("text-mode-accent-bright")

    // Academic level badge
    expect(badgeSpan.props.className).toContain("font-mono text-[9px] px-2 py-0.5 rounded-full bg-mode-accent/10 border border-mode-accent/20 text-mode-accent-bright font-semibold uppercase tracking-wider")

    // Controls & Counter
    const [counterSpan, buttonsWrapper] = React.Children.toArray(controlsGroup.props.children) as React.ReactElement<any>[]
    expect(counterSpan.props.children).toEqual(["01", "/", "04"])
    const [prevBtn, , nextBtn] = React.Children.toArray(buttonsWrapper.props.children) as React.ReactElement<any>[]
    expect(typeof prevBtn.props.onClick).toBe("function")
    expect(typeof nextBtn.props.onClick).toBe("function")

    // Deep Dive active card typography in HTML
    expect(html).toContain("font-mono tracking-tight font-bold text-xl sm:text-xl md:text-2xl text-white/90 mb-1 line-clamp-2 leading-tight")
    expect(html).toContain("National University of Singapore")
    expect(html).toContain("Bachelor of Computing in Computer Science")
    expect(html).toContain("Aug 2028 - Aug 2032")

    // Clutter removal verification: Metric box, GPA bar, Honours box, and Highlights are NOT present
    expect(html).not.toContain("Cumulative GPA")
    expect(html).not.toContain("Standing")
    expect(html).not.toContain("Honours Track")
    expect(html).not.toContain("Specialization in Enterprise Software")
  })

  it("renders Quick Pitch face with font-display and blue accent", () => {
    lastBentoTileProps = null
    const html = renderToStaticMarkup(
      React.createElement(EducationTile, {
        id: "education",
        size: "2x2",
        content: defaultContent
      })
    )

    const qpContent = lastBentoTileProps.children as React.ReactElement<any>
    expect(React.isValidElement(qpContent)).toBe(true)

    // Quick Pitch header badge has blue theme
    const [headerDiv] = React.Children.toArray(qpContent.props.children) as React.ReactElement<any>[]
    const [titleGroup] = React.Children.toArray(headerDiv.props.children) as React.ReactElement<any>[]
    const [labelSpan, badgeSpan] = React.Children.toArray(titleGroup.props.children) as React.ReactElement<any>[]

    const [gradCapIcon] = React.Children.toArray(labelSpan.props.children) as React.ReactElement<any>[]
    expect(gradCapIcon.props.className).toContain("text-[#4A8FFF]")
    expect(badgeSpan.props.className).toContain("text-[#4A8FFF]")
    expect(badgeSpan.props.className).toContain("bg-blue-500/10")

    // Quick Pitch heading typography
    expect(html).toContain("font-display text-xl sm:text-xl md:text-2xl font-medium text-white/90 tracking-tight mb-1 line-clamp-2 leading-tight")
  })

  it("handles keyboard events and chevron click triggers", () => {
    lastBentoTileProps = null
    renderToStaticMarkup(
      React.createElement(EducationTile, {
        id: "education",
        size: "2x2",
        content: defaultContent
      })
    )

    const qpContent = lastBentoTileProps.children as React.ReactElement<any>
    expect(typeof qpContent.props.onKeyDown).toBe("function")

    let defaultPrevented = false
    let propagationStopped = false
    const fakeEvent = {
      key: "ArrowDown",
      preventDefault: () => { defaultPrevented = true },
      stopPropagation: () => { propagationStopped = true }
    }

    qpContent.props.onKeyDown(fakeEvent as any)
    expect(defaultPrevented).toBe(true)
    expect(propagationStopped).toBe(true)
  })
})
