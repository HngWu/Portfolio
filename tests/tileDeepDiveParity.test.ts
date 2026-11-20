import { describe, it, expect, mock, beforeEach } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { useViewModeStore } from "@/store/useViewModeStore"

// Mock BentoTile to capture props passed from each tile and avoid external next/navigation dependencies
let lastBentoTileProps: any = null
mock.module("@/components/bento/BentoTile", () => {
  return {
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
  }
})

import { StatTile, renderOdometerDigits } from "@/components/bento/tiles/StatTile"
import { ContactTile } from "@/components/bento/tiles/ContactTile"
import { EducationTile } from "@/components/bento/tiles/EducationTile"
import { SkillsTile } from "@/components/bento/tiles/SkillsTile"
import { ExperienceTile } from "@/components/bento/tiles/ExperienceTile"
import { ProjectTile } from "@/components/bento/tiles/ProjectTile"
import { ForceMobileContext } from "@/components/bento/ForceMobileContext"

describe("Tile Deep Dive Parity Suite", () => {
  beforeEach(() => {
    lastBentoTileProps = null
    useViewModeStore.setState({ mode: "quick" })
  })

  // =========================================================================
  // 1. StatTile Deep Dive Parity & Odometer Roll Animations
  // =========================================================================
  describe("StatTile", () => {
    const statContent = {
      value: "3.91",
      label: "Cumulative GPA",
    }
    const statDeepDive = {
      value: "4.00",
      label: "Academic Standing",
    }

    it("passes canMorph=false, canExpand=false, and canDeepDive=true to BentoTile", () => {
      renderToStaticMarkup(
        React.createElement(StatTile, {
          id: "stat-gpa",
          size: "1x1",
          content: statContent,
          deepDive: statDeepDive,
        })
      )

      expect(lastBentoTileProps).not.toBeNull()
      expect(lastBentoTileProps.canDeepDive).toBe(true)
      expect(lastBentoTileProps.canMorph).toBe(false)
      expect(lastBentoTileProps.canExpand).toBe(false)
      expect(lastBentoTileProps.className).toContain("group/stat")
    })

    it("renders renderOdometerDigits(value) on Quick Pitch face with odometer roll and staggered delays", () => {
      renderToStaticMarkup(
        React.createElement(StatTile, {
          id: "stat-gpa",
          size: "1x1",
          content: statContent,
        })
      )

      const children = React.Children.toArray(lastBentoTileProps.children) as React.ReactElement<any>[]
      const [, valueContainer] = children
      const valueWrapper = valueContainer.props.children as React.ReactElement<any>

      // Quick Pitch value container uses font-mono text-white
      expect(valueWrapper.props.className).toContain("font-mono text-white")
      expect(valueWrapper.props.className).toContain("drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]")

      // Extract odometer digits root element
      const odometerRoot = valueWrapper.props.children as React.ReactElement<any>
      expect(odometerRoot.props["aria-label"]).toBe("3.91")

      const [srOnlySpan, ariaHiddenSpan] = React.Children.toArray(odometerRoot.props.children) as React.ReactElement<any>[]
      expect(srOnlySpan.props.className).toContain("sr-only")
      expect(srOnlySpan.props.children).toBe("3.91")
      expect(ariaHiddenSpan.props["aria-hidden"]).toBe("true")

      const charElements = React.Children.toArray(ariaHiddenSpan.props.children) as React.ReactElement<any>[]
      expect(charElements).toHaveLength(4) // '3', '.', '9', '1'

      // Char 0: '3'
      const char0Translate = charElements[0].props.children as React.ReactElement<any>
      expect(char0Translate.props.style.transform).toBe("translateY(-3em)")
      const char0Roll = char0Translate.props.children as React.ReactElement<any>
      expect(char0Roll.props.className).toContain("group-hover/stat:animate-odometer-roll")
      expect(char0Roll.props.style.animationDelay).toBe("0ms")

      // Char 1: '.' (non-digit)
      expect(charElements[1].props.children).toBe(".")

      // Char 2: '9'
      const char2Translate = charElements[2].props.children as React.ReactElement<any>
      expect(char2Translate.props.style.transform).toBe("translateY(-9em)")
      const char2Roll = char2Translate.props.children as React.ReactElement<any>
      expect(char2Roll.props.className).toContain("group-hover/stat:animate-odometer-roll")
      expect(char2Roll.props.style.animationDelay).toBe("120ms") // index 2 * 60ms

      // Char 3: '1'
      const char3Translate = charElements[3].props.children as React.ReactElement<any>
      expect(char3Translate.props.style.transform).toBe("translateY(-1em)")
      const char3Roll = char3Translate.props.children as React.ReactElement<any>
      expect(char3Roll.props.className).toContain("group-hover/stat:animate-odometer-roll")
      expect(char3Roll.props.style.animationDelay).toBe("180ms") // index 3 * 60ms
    })

    it("renders renderOdometerDigits(deepValue ?? value) on Deep Dive face with text-mode-accent-bright", () => {
      renderToStaticMarkup(
        React.createElement(StatTile, {
          id: "stat-gpa",
          size: "2x2",
          content: statContent,
          deepDive: statDeepDive,
        })
      )

      const deepContent = lastBentoTileProps.deepContent as React.ReactElement<any>
      const [headerSection, valueSection] = React.Children.toArray(deepContent.props.children) as React.ReactElement<any>[]

      // Deep Dive header uses deepLabel
      const [metaDiv] = React.Children.toArray(headerSection.props.children) as React.ReactElement<any>[]
      expect(metaDiv.props.children).toBe("Academic Standing")

      // Deep Dive value wrapper has text-mode-accent-bright and glowing shadow
      const valueWrapper = valueSection.props.children as React.ReactElement<any>
      expect(valueWrapper.props.className).toContain("font-mono text-mode-accent-bright")
      expect(valueWrapper.props.className).toContain("drop-shadow-[0_0_10px_rgba(106,255,255,0.3)]")

      // Deep Dive odometer displays deepValue ("4.00")
      const odometerRoot = valueWrapper.props.children as React.ReactElement<any>
      expect(odometerRoot.props["aria-label"]).toBe("4.00")

      const [, ariaHiddenSpan] = React.Children.toArray(odometerRoot.props.children) as React.ReactElement<any>[]
      const chars = React.Children.toArray(ariaHiddenSpan.props.children) as React.ReactElement<any>[]
      expect(chars).toHaveLength(4) // '4', '.', '0', '0'

      // First char is '4' with 0ms delay
      const char0Roll = (chars[0].props.children as React.ReactElement<any>).props.children as React.ReactElement<any>
      expect(char0Roll.props.className).toContain("group-hover/stat:animate-odometer-roll")
      expect(char0Roll.props.style.animationDelay).toBe("0ms")

      // Second char is '.'
      expect(chars[1].props.children).toBe(".")

      // Third char is '0' with 120ms delay
      const char2Roll = (chars[2].props.children as React.ReactElement<any>).props.children as React.ReactElement<any>
      expect(char2Roll.props.className).toContain("group-hover/stat:animate-odometer-roll")
      expect(char2Roll.props.style.animationDelay).toBe("120ms")
    })

    it("falls back to Quick Pitch value in Deep Dive face when deepDive value is omitted", () => {
      renderToStaticMarkup(
        React.createElement(StatTile, {
          id: "stat-gpa",
          size: "1x1",
          content: statContent,
          deepDive: undefined,
        })
      )

      const deepContent = lastBentoTileProps.deepContent as React.ReactElement<any>
      const [, valueSection] = React.Children.toArray(deepContent.props.children) as React.ReactElement<any>[]
      const valueWrapper = valueSection.props.children as React.ReactElement<any>

      expect(valueWrapper.props.className).toContain("text-mode-accent-bright")
      const odometerRoot = valueWrapper.props.children as React.ReactElement<any>
      expect(odometerRoot.props["aria-label"]).toBe("3.91")
    })

    it("renderOdometerDigits adheres to strict accessibility attributes: aria-label, sr-only, and aria-hidden", () => {
      const element = renderOdometerDigits("99.9%") as React.ReactElement<any>
      expect(React.isValidElement(element)).toBe(true)
      expect(element.props["aria-label"]).toBe("99.9%")

      const [srOnlySpan, ariaHiddenSpan] = React.Children.toArray(element.props.children) as React.ReactElement<any>[]
      expect(srOnlySpan.props.className).toContain("sr-only")
      expect(srOnlySpan.props.children).toBe("99.9%")
      expect(ariaHiddenSpan.props["aria-hidden"]).toBe("true")

      const html = renderToStaticMarkup(element)
      expect(html).toContain('aria-label="99.9%"')
      expect(html).toContain('class="sr-only">99.9%</span>')
      expect(html).toContain('aria-hidden="true"')
    })

    it("handles nullish and empty inputs gracefully in renderOdometerDigits", () => {
      expect(renderOdometerDigits(null)).toBeNull()
      expect(renderOdometerDigits(undefined)).toBeNull()
      expect(renderOdometerDigits("")).toBeNull()
    })
  })

  // =========================================================================
  // 2. ContactTile Deep Dive Parity & Clean Surface
  // =========================================================================
  describe("ContactTile", () => {
    const contactContent = {
      email: "tanhngwu@example.com",
      github: "https://github.com/tanhngwu",
      linkedin: "https://linkedin.com/in/tanhngwu",
      telegram: "https://t.me/tanhngwu",
    }

    it("passes canMorph=false, canExpand=false, and canDeepDive=true to BentoTile", () => {
      renderToStaticMarkup(
        React.createElement(ContactTile, {
          id: "contact",
          size: "4x3",
          content: contactContent,
        })
      )

      expect(lastBentoTileProps).not.toBeNull()
      expect(lastBentoTileProps.canDeepDive).toBe(true)
      expect(lastBentoTileProps.canMorph).toBe(false)
      expect(lastBentoTileProps.canExpand).toBe(false)
    })

    it("renders Deep Dive face (deepContent) containing exact same info as Quick Pitch: Header, Email Box, and Social Capsules", () => {
      renderToStaticMarkup(
        React.createElement(ContactTile, {
          id: "contact",
          size: "4x3",
          content: contactContent,
        })
      )

      const deepContent = lastBentoTileProps.deepContent as React.ReactElement<any>
      expect(React.isValidElement(deepContent)).toBe(true)

      // Section breakdown
      const [topSection, socialSection] = React.Children.toArray(deepContent.props.children) as React.ReactElement<any>[]
      const [headerDiv, emailWrapper] = React.Children.toArray(topSection.props.children) as React.ReactElement<any>[]
      const emailDiv = emailWrapper.props.children as React.ReactElement<any>

      // 1. Header: "Contact" + Mail icon
      const [headerInner] = React.Children.toArray(headerDiv.props.children) as React.ReactElement<any>[]
      const [mailIcon, headerSpan] = React.Children.toArray(headerInner.props.children) as React.ReactElement<any>[]
      expect(headerSpan.props.children).toContain("Contact")
      expect(mailIcon.props["aria-hidden"]).toBe("true")

      // 2. Copiable email box with full keyboard accessibility
      expect(emailDiv.props.role).toBe("button")
      expect(emailDiv.props.tabIndex).toBe(0)
      expect(emailDiv.props["aria-label"]).toBe("Copy email address")
      expect(typeof emailDiv.props.onClick).toBe("function")
      expect(typeof emailDiv.props.onKeyDown).toBe("function")
      expect(emailDiv.props.className).toContain("hover:border-mode-accent/30")
      expect(emailDiv.props.className).toContain("focus-visible:ring-mode-accent")

      const [emailTextWrapper, copyBtnWrapper] = React.Children.toArray(emailDiv.props.children) as React.ReactElement<any>[]
      const emailSpan = emailTextWrapper.props.children as React.ReactElement<any>
      expect(emailSpan.props.children).toBe("tanhngwu@example.com")
      expect(emailSpan.props.className).toContain("selection:bg-mode-accent selection:text-black")

      // Tooltip inside copy button wrapper (wrapped in Fragment)
      const fragment = copyBtnWrapper.props.children as React.ReactElement<any>
      const [copyIcon, tooltipSpan] = React.Children.toArray(fragment.props.children) as React.ReactElement<any>[]
      expect(copyIcon.props["aria-hidden"]).toBe("true")
      expect(tooltipSpan.props.children).toBe("Click to Copy")
      expect(tooltipSpan.props.className).toContain("text-mode-accent-bright")

      // 3. Social capsules with mode-accent hover styles
      const capsules = React.Children.toArray(socialSection.props.children) as React.ReactElement<any>[]
      expect(capsules).toHaveLength(3) // LinkedIn, Telegram, GitHub

      const [linkedinLink, telegramLink, githubLink] = capsules
      expect(linkedinLink.props.href).toBe("https://linkedin.com/in/tanhngwu")
      expect(linkedinLink.props.target).toBe("_blank")
      expect(linkedinLink.props.rel).toBe("noopener noreferrer")
      expect(linkedinLink.props["aria-label"]).toBe("LinkedIn profile (opens in new tab)")
      expect(linkedinLink.props.className).toContain("hover:border-mode-accent/30")
      expect(linkedinLink.props.className).toContain("hover:text-mode-accent-bright")

      expect(telegramLink.props.href).toBe("https://t.me/tanhngwu")
      expect(telegramLink.props.target).toBe("_blank")
      expect(telegramLink.props.rel).toBe("noopener noreferrer")
      expect(telegramLink.props["aria-label"]).toBe("Telegram profile (opens in new tab)")
      expect(telegramLink.props.className).toContain("hover:border-mode-accent/30")
      expect(telegramLink.props.className).toContain("hover:text-mode-accent-bright")

      expect(githubLink.props.href).toBe("https://github.com/tanhngwu")
      expect(githubLink.props.target).toBe("_blank")
      expect(githubLink.props.rel).toBe("noopener noreferrer")
      expect(githubLink.props["aria-label"]).toBe("GitHub profile (opens in new tab)")
      expect(githubLink.props.className).toContain("hover:border-mode-accent/30")
      expect(githubLink.props.className).toContain("hover:text-mode-accent-bright")
    })

    it("asserts legacy SgtClockAnimation and availability grid are NOT in deepContent", () => {
      const html = renderToStaticMarkup(
        React.createElement(ContactTile, {
          id: "contact",
          size: "4x3",
          content: contactContent,
        })
      )

      // Asserts absence of legacy clock / availability grid widgets
      expect(html).not.toContain("SgtClockAnimation")
      expect(html).not.toContain("Singapore (SGT)")
      expect(html).not.toContain("Availability")
      expect(html).not.toContain("available-grid")
      expect(html).not.toContain("Available for hire")
      expect(html).not.toContain("Timezone")
    })

    it("omits Telegram capsule gracefully when not provided in content", () => {
      renderToStaticMarkup(
        React.createElement(ContactTile, {
          id: "contact",
          size: "4x3",
          content: {
            email: "tanhngwu@example.com",
            github: "https://github.com/tanhngwu",
            linkedin: "https://linkedin.com/in/tanhngwu",
            telegram: undefined,
          },
        })
      )

      const deepContent = lastBentoTileProps.deepContent as React.ReactElement<any>
      const [, deepSocialSection] = React.Children.toArray(deepContent.props.children) as React.ReactElement<any>[]
      const deepCapsules = React.Children.toArray(deepSocialSection.props.children) as React.ReactElement<any>[]
      expect(deepCapsules).toHaveLength(2)

      const qpContent = lastBentoTileProps.children as React.ReactElement<any>
      const [, qpSocialSection] = React.Children.toArray(qpContent.props.children) as React.ReactElement<any>[]
      const qpCapsules = React.Children.toArray(qpSocialSection.props.children) as React.ReactElement<any>[]
      expect(qpCapsules).toHaveLength(2)
    })

    it("handles Enter and Space keydown events on copiable email box", () => {
      renderToStaticMarkup(
        React.createElement(ContactTile, {
          id: "contact",
          size: "4x3",
          content: contactContent,
        })
      )

      const deepContent = lastBentoTileProps.deepContent as React.ReactElement<any>
      const [topSection] = React.Children.toArray(deepContent.props.children) as React.ReactElement<any>[]
      const [, emailWrapper] = React.Children.toArray(topSection.props.children) as React.ReactElement<any>[]
      const emailDiv = emailWrapper.props.children as React.ReactElement<any>

      let enterPrevented = false
      emailDiv.props.onKeyDown({
        key: "Enter",
        preventDefault: () => { enterPrevented = true },
        stopPropagation: () => {},
      } as any)
      expect(enterPrevented).toBe(true)

      let spacePrevented = false
      emailDiv.props.onKeyDown({
        key: " ",
        preventDefault: () => { spacePrevented = true },
        stopPropagation: () => {},
      } as any)
      expect(spacePrevented).toBe(true)

      let tabPrevented = false
      emailDiv.props.onKeyDown({
        key: "Tab",
        preventDefault: () => { tabPrevented = true },
        stopPropagation: () => {},
      } as any)
      expect(tabPrevented).toBe(false)
    })
  })

  // =========================================================================
  // 3. EducationTile Deep Dive Parity & Clutter Removal
  // =========================================================================
  describe("EducationTile", () => {
    const educationContent = {
      institution: "National University of Singapore",
      degree: "Bachelor of Computing in Computer Science",
      date: "Aug 2028 - Aug 2032",
    }

    it("passes canMorph=false, canExpand=false, and canDeepDive=true to BentoTile", () => {
      renderToStaticMarkup(
        React.createElement(EducationTile, {
          id: "education",
          size: "2x2",
          content: educationContent,
        })
      )

      expect(lastBentoTileProps).not.toBeNull()
      expect(lastBentoTileProps.canDeepDive).toBe(true)
      expect(lastBentoTileProps.canMorph).toBe(false)
      expect(lastBentoTileProps.canExpand).toBe(false)
    })

    it("renders Deep Dive face (deepContent) containing exact same info as Quick Pitch: Header, Active Card Body, and Controls", () => {
      const html = renderToStaticMarkup(
        React.createElement(EducationTile, {
          id: "education",
          size: "2x2",
          content: educationContent,
        })
      )

      const deepContent = lastBentoTileProps.deepContent as React.ReactElement<any>
      expect(React.isValidElement(deepContent)).toBe(true)

      // Carousel accessibility wrapper
      expect(deepContent.props.role).toBe("region")
      expect(deepContent.props["aria-label"]).toBe("Education history carousel")
      expect(deepContent.props.tabIndex).toBe(0)
      expect(typeof deepContent.props.onKeyDown).toBe("function")
      expect(deepContent.props.className).toContain("focus-visible:ring-mode-accent")

      const [headerDiv, stackContainer] = React.Children.toArray(deepContent.props.children) as React.ReactElement<any>[]

      // 1. Header: "Education" + GraduationCap + Level Badge + Counter + Chevron Buttons
      const [titleGroup, controlsGroup] = React.Children.toArray(headerDiv.props.children) as React.ReactElement<any>[]
      const [labelSpan, badgeSpan] = React.Children.toArray(titleGroup.props.children) as React.ReactElement<any>[]

      const [gradCapIcon, labelText] = React.Children.toArray(labelSpan.props.children) as React.ReactElement<any>[]
      expect(labelText).toBe("Education")
      expect(gradCapIcon.props.className).toContain("text-mode-accent-bright")
      expect(badgeSpan.props.className).toContain("text-mode-accent-bright")
      expect(badgeSpan.props.className).toContain("bg-mode-accent/10")

      // Controls and Counter
      const [counterSpan, buttonsWrapper] = React.Children.toArray(controlsGroup.props.children) as React.ReactElement<any>[]
      expect(counterSpan.props.children).toEqual(["01", "/", "04"])

      const [prevBtn, , nextBtn] = React.Children.toArray(buttonsWrapper.props.children) as React.ReactElement<any>[]
      expect(prevBtn.props["aria-label"]).toBe("Previous education level")
      expect(typeof prevBtn.props.onClick).toBe("function")
      expect(nextBtn.props["aria-label"]).toBe("Next education level")
      expect(typeof nextBtn.props.onClick).toBe("function")

      // 2. Active Card Body: Institution (font-mono tracking-tight font-bold), Degree, and Date
      expect(html).toContain("font-mono tracking-tight font-bold text-xl sm:text-xl md:text-2xl text-white/90 mb-1 line-clamp-2 leading-tight")
      expect(html).toContain("National University of Singapore")
      expect(html).toContain("Bachelor of Computing in Computer Science")
      expect(html).toContain("Aug 2028 - Aug 2032")
    })

    it("asserts GPA progress bar, metric box, honours box, and highlights pills are NOT in deepContent", () => {
      const html = renderToStaticMarkup(
        React.createElement(EducationTile, {
          id: "education",
          size: "2x2",
          content: educationContent,
        })
      )

      // Asserts absence of cluttered Deep Dive elements
      expect(html).not.toContain("Cumulative GPA")
      expect(html).not.toContain("Standing")
      expect(html).not.toContain("Honours Track")
      expect(html).not.toContain("Direct Honours Track")
      expect(html).not.toContain("Specialization in Enterprise Software")
      expect(html).not.toContain("Gold Medalist Awardee")
      expect(html).not.toContain("Dean's Merit Pre-admit")
      expect(html).not.toContain("bg-white/5 h-1.5") // GPA progress bar track
    })

    it("handles keyboard events correctly for accessible navigation", () => {
      renderToStaticMarkup(
        React.createElement(EducationTile, {
          id: "education",
          size: "2x2",
          content: educationContent,
        })
      )

      const deepContent = lastBentoTileProps.deepContent as React.ReactElement<any>
      expect(typeof deepContent.props.onKeyDown).toBe("function")

      let downDefaultPrevented = false
      let downPropagationStopped = false
      deepContent.props.onKeyDown({
        key: "ArrowDown",
        preventDefault: () => {
          downDefaultPrevented = true
        },
        stopPropagation: () => {
          downPropagationStopped = true
        },
      } as any)

      expect(downDefaultPrevented).toBe(true)
      expect(downPropagationStopped).toBe(true)

      let upDefaultPrevented = false
      let upPropagationStopped = false
      deepContent.props.onKeyDown({
        key: "ArrowUp",
        preventDefault: () => {
          upDefaultPrevented = true
        },
        stopPropagation: () => {
          upPropagationStopped = true
        },
      } as any)

      expect(upDefaultPrevented).toBe(true)
      expect(upPropagationStopped).toBe(true)
    })
  })

  // =========================================================================
  // 4. SkillsTile Deep Dive Parity & Static Grid Sizing
  // =========================================================================
  describe("SkillsTile", () => {
    it("passes canMorph=false, canExpand=false, and canDeepDive=true to BentoTile", () => {
      renderToStaticMarkup(
        React.createElement(SkillsTile, {
          id: "skills-parity-test",
          size: "4x4",
          content: {
            tags: ["Java", "Spring Boot", "Next.js 16", "TypeScript", "Three.js", "Docker", "Go"],
          },
        })
      )

      expect(lastBentoTileProps).not.toBeNull()
      expect(lastBentoTileProps.canMorph).toBe(false)
      expect(lastBentoTileProps.canExpand).toBe(false)
      expect(lastBentoTileProps.canDeepDive).toBe(true)
    })
  })

  // =========================================================================
  // 5. ExperienceTile Deep Dive Parity
  // =========================================================================
  describe("ExperienceTile", () => {
    it("passes canDeepDive=true to BentoTile and unifies 3D stack layout across both faces", () => {
      const html = renderToStaticMarkup(
        React.createElement(ExperienceTile, {
          id: "exp-parity-test",
          size: "4x5",
          content: {
            role: "Software Engineer Intern",
            company: "DBS Bank",
            highlights: ["Led full-stack system migrations and automated pipeline deployments"],
          },
        })
      )

      expect(lastBentoTileProps).not.toBeNull()
      expect(lastBentoTileProps.canDeepDive).toBe(true)
      expect(lastBentoTileProps.deepContent).not.toBeNull()
      expect(html).toContain("Experience")
      expect(html).toContain("DBS Bank")
    })

    it("ensures ExperienceTile mobile view deep dive mode uses standard sizing without enlargement", () => {
      const html = renderToStaticMarkup(
        React.createElement(ExperienceTile, {
          id: "exp-parity-test-2",
          size: "4x5",
          content: {
            role: "Software Engineer Intern",
            company: "DBS Bank",
            highlights: ["Led full-stack system migrations and automated pipeline deployments"],
          },
        })
      )

      // Ensure no enlarged mobile classes like xs:text-2xl or xs:text-sm exist
      expect(html).not.toContain("xs:text-2xl")
      expect(html).not.toContain("xs:text-sm")
      expect(html).not.toContain("space-y-3 sm:space-y-3.5")
    })
  })

  // =========================================================================
  // 6. ProjectTile Deep Dive Parity & Typography Mode Alignment
  // =========================================================================
  describe("ProjectTile", () => {
    const projectContent = {
      name: "TriviaDuel",
      description: "Real-time multiplayer trivia platform with resilient AI generation.",
      techStack: ["Next.js 16", "Gemini AI", "Redis", "SQLite"],
      githubUrl: "https://github.com/HngWu",
      liveUrl: "https://triviaduel.dev",
      featured: true,
    }
    const projectDeepDive = {
      notes: "Sub-100ms synchronization for 10 players. Multi-model fallback strategy.",
    }

    it("passes canMorph=false, canExpand=false, and canDeepDive=true to BentoTile and renders deepContent", () => {
      renderToStaticMarkup(
        React.createElement(ProjectTile, {
          id: "proj-test",
          size: "4x3",
          content: projectContent,
          deepDive: projectDeepDive,
        })
      )

      expect(lastBentoTileProps).not.toBeNull()
      expect(lastBentoTileProps.canDeepDive).toBe(true)
      expect(lastBentoTileProps.canMorph).toBe(false)
      expect(lastBentoTileProps.canExpand).toBe(false)
      expect(lastBentoTileProps.deepContent).not.toBeNull()
    })

    it("passes canDeepDive=true unconditionally even in mobile context (ForceMobileContext)", () => {
      renderToStaticMarkup(
        React.createElement(
          ForceMobileContext.Provider,
          { value: true },
          React.createElement(ProjectTile, {
            id: "proj-test-mobile",
            size: "4x3",
            content: projectContent,
            deepDive: projectDeepDive,
          })
        )
      )

      expect(lastBentoTileProps).not.toBeNull()
      expect(lastBentoTileProps.canDeepDive).toBe(true)
      expect(lastBentoTileProps.canMorph).toBe(false)
      expect(lastBentoTileProps.canExpand).toBe(false)
    })

    it("renders Deep Dive face with exact same layout as Quick Pitch: Header, Active Card Body, and Controls, but with font-mono typography", () => {
      useViewModeStore.setState({ mode: "deep" })

      const html = renderToStaticMarkup(
        React.createElement(ProjectTile, {
          id: "proj-test",
          size: "4x3",
          content: projectContent,
          deepDive: projectDeepDive,
        })
      )

      // Header uses font-mono tracking-tight font-bold on project name
      expect(html).toContain("font-mono tracking-tight font-bold")
      expect(html).toContain("TriviaDuel")
      expect(html).toContain("Projects")
      expect(html).toContain("Real-time multiplayer trivia platform")

      // Body and tags use font-mono
      expect(html).toContain("font-mono")
      expect(html).toContain("Next.js 16")
    })
  })
})
