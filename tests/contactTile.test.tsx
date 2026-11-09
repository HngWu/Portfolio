import { describe, it, expect, mock } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

// Mock BentoTile to avoid next/navigation and framer-motion dependencies
let lastBentoTileProps: any = null
mock.module("@/components/bento/BentoTile", () => {
  return {
    BentoTile: (props: any) => {
      lastBentoTileProps = props
      return React.createElement("div", { "data-testid": "bento-tile" }, props.children, props.deepContent)
    }
  }
})

import { ContactTile } from "@/components/bento/tiles/ContactTile"

describe("ContactTile", () => {
  const defaultContent = {
    email: "test@example.com",
    github: "https://github.com/testhng",
    linkedin: "https://linkedin.com/in/testhng",
    telegram: "https://t.me/testhng"
  }

  it("passes canMorph=false, canExpand=false, and canDeepDive=true to BentoTile", () => {
    lastBentoTileProps = null
    renderToStaticMarkup(
      React.createElement(ContactTile, {
        id: "contact",
        size: "4x3",
        content: defaultContent
      })
    )

    expect(lastBentoTileProps).not.toBeNull()
    expect(lastBentoTileProps.canDeepDive).toBe(true)
    expect(lastBentoTileProps.canMorph).toBe(false)
    expect(lastBentoTileProps.canExpand).toBe(false)
  })

  it("renders deepContent with matching header, email, and social capsules", () => {
    lastBentoTileProps = null
    renderToStaticMarkup(
      React.createElement(ContactTile, {
        id: "contact",
        size: "4x3",
        content: defaultContent
      })
    )

    const deepContent = lastBentoTileProps.deepContent as React.ReactElement<any>
    expect(React.isValidElement(deepContent)).toBe(true)

    // Deep content outer container has flex flex-col h-full w-full justify-between
    expect(deepContent.props.className).toContain("flex flex-col h-full w-full justify-between")

    // First section: email & header
    const [topSection, socialSection] = React.Children.toArray(deepContent.props.children) as React.ReactElement<any>[]
    expect(topSection.props.className).toContain("flex-1")

    const [headerDiv, emailDiv] = React.Children.toArray(topSection.props.children) as React.ReactElement<any>[]
    
    // Header
    const [heading, mailIcon] = React.Children.toArray(headerDiv.props.children) as React.ReactElement<any>[]
    expect(heading.props.children).toBe("Contact")
    expect(heading.props.className).toContain("font-mono tracking-tight font-bold")
    expect(heading.props.className).toContain("text-white/90")
    expect(mailIcon.props.className).toContain("text-white/20")

    // Email container
    expect(typeof emailDiv.props.onClick).toBe("function")
    expect(typeof emailDiv.props.onKeyDown).toBe("function")
    expect(emailDiv.props.role).toBe("button")
    expect(emailDiv.props.tabIndex).toBe(0)
    expect(emailDiv.props["aria-label"]).toBe("Copy email address")
    expect(emailDiv.props.className).toContain("hover:border-mode-accent/30")
    expect(emailDiv.props.className).toContain("group/email")

    const [emailTextWrapper, copyBtnWrapper] = React.Children.toArray(emailDiv.props.children) as React.ReactElement<any>[]
    const emailSpan = emailTextWrapper.props.children as React.ReactElement<any>
    expect(emailSpan.props.children).toBe("test@example.com")
    expect(emailSpan.props.className).toContain("font-mono font-medium")
    expect(emailSpan.props.className).toContain("leading-tight break-all")
    expect(emailSpan.props.className).toContain("text-sm md:text-base")
    expect(emailSpan.props.className).toContain("selection:bg-mode-accent selection:text-black")

    expect(copyBtnWrapper.props.className).toContain("group-hover/email:border-mode-accent/30")

    // Social capsules in deepContent
    const capsules = React.Children.toArray(socialSection.props.children) as React.ReactElement<any>[]
    expect(capsules).toHaveLength(3) // LinkedIn, Telegram, GitHub

    capsules.forEach((capsule) => {
      expect(capsule.props.className).toContain("font-mono text-[10px] text-white/40 hover:text-mode-accent-bright")
      expect(capsule.props.className).toContain("border border-white/5 hover:border-mode-accent/30")
      expect(typeof capsule.props.onPointerDown).toBe("function")
    })
  })

  it("updates social capsules in Quick Pitch with mode-accent theme styling", () => {
    lastBentoTileProps = null
    renderToStaticMarkup(
      React.createElement(ContactTile, {
        id: "contact",
        size: "4x3",
        content: defaultContent
      })
    )

    const children = React.Children.toArray(lastBentoTileProps.children) as React.ReactElement<any>[]
    const [, socialSection] = children

    const capsules = React.Children.toArray(socialSection.props.children) as React.ReactElement<any>[]
    expect(capsules).toHaveLength(3)

    capsules.forEach((capsule) => {
      expect(capsule.props.className).toContain("hover:border-mode-accent/30")
      expect(capsule.props.className).toContain("hover:text-mode-accent-bright")
      expect(capsule.props.className).not.toContain("hover:border-lume-primary/30")
      expect(capsule.props.className).not.toContain("hover:text-lume-primary")
    })
  })

  it("omits Telegram when not provided", () => {
    lastBentoTileProps = null
    renderToStaticMarkup(
      React.createElement(ContactTile, {
        id: "contact",
        size: "4x3",
        content: {
          email: "solo@example.com",
          github: "https://github.com/solo",
          linkedin: "https://linkedin.com/in/solo",
          telegram: undefined
        }
      })
    )

    const deepContent = lastBentoTileProps.deepContent as React.ReactElement<any>
    const [, deepSocialSection] = React.Children.toArray(deepContent.props.children) as React.ReactElement<any>[]
    const deepCapsules = React.Children.toArray(deepSocialSection.props.children) as React.ReactElement<any>[]
    expect(deepCapsules).toHaveLength(2) // Only LinkedIn and GitHub

    const [, qpSocialSection] = React.Children.toArray(lastBentoTileProps.children) as React.ReactElement<any>[]
    const qpCapsules = React.Children.toArray(qpSocialSection.props.children) as React.ReactElement<any>[]
    expect(qpCapsules).toHaveLength(2)
  })
})
