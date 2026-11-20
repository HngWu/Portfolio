import { describe, it, expect, mock } from "bun:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { GoogleMapsPlacePanel, getMilestoneLevel } from "@/components/education/GoogleMapsPlacePanel"
import type { EducationLocation, SheetSnapState } from "@/types/education-map"

// Mock next/image to render a standard img tag
mock.module("next/image", () => {
  return {
    default: (props: any) => {
      return React.createElement("img", { ...props, src: props.src || "" })
    },
  }
})

describe("Education Milestone Transitions & University Level Detection", () => {
  const primaryMilestone: EducationLocation = {
    id: "peiying-psle",
    name: "Peiying Primary School",
    type: "degree",
    program: "Primary School Leaving Examination (PSLE)",
    lat: 1.417416,
    lng: 103.830143,
    startDate: "2013-01",
    endDate: "2018-12",
    caption: "Early STEM foundation and math distinction.",
    gpa: "251",
    honours: "Top in Cohort in Mathematics",
    thumbnail: "/images/education/peiying-primary.jpg",
    city: "Yishun",
    country: "Singapore",
  }

  const secondaryMilestone: EducationLocation = {
    id: "cchy-olevel",
    name: "Chung Cheng High School (Yishun)",
    type: "degree",
    program: "Singapore-Cambridge GCE O-Level",
    lat: 1.419226,
    lng: 103.837391,
    startDate: "2019-01",
    endDate: "2022-12",
    caption: "Distinction in Computing & Mathematics.",
    thumbnail: "/images/education/chung-cheng-yishun.jpg",
    city: "Yishun",
    country: "Singapore",
  }

  const polytechnicMilestone: EducationLocation = {
    id: "nyp-dit",
    name: "Nanyang Polytechnic",
    type: "degree",
    program: "Diploma in Information Technology with Merit",
    lat: 1.38027,
    lng: 103.848618,
    startDate: "2023-04",
    endDate: "2026-04",
    caption: "Graduated with Merit and Gold Medalist recognition.",
    gpa: "3.91",
    honours: "Gold Medalist & Tertiary Award",
    thumbnail: "/images/education/nanyang-polytechnic.jpg",
    city: "Ang Mo Kio",
    country: "Singapore",
  }

  const universityMilestone: EducationLocation = {
    id: "nus-bcomp",
    name: "National University of Singapore",
    type: "degree",
    program: "Bachelor of Computing in Computer Science",
    lat: 1.29497,
    lng: 103.7738,
    startDate: "2028-08",
    endDate: "2032-08",
    caption: "Incoming Computer Science undergraduate.",
    gpa: "-",
    honours: "Direct Honours Track",
    thumbnail: "/images/education/national-university-singapore.jpg",
    city: "Kent Ridge",
    country: "Singapore",
  }

  // =========================================================================
  // 1. Level Detection Logic (getMilestoneLevel)
  // =========================================================================
  describe("getMilestoneLevel Helper", () => {
    it("correctly identifies Primary level education", () => {
      const level = getMilestoneLevel(primaryMilestone)
      expect(level.label).toBe("Primary Education")
      expect(level.shortLabel).toBe("Primary")
      expect(level.isUniversity).toBe(false)
      expect(level.badgeColor).toBe("#F59E0B")
    })

    it("correctly identifies Secondary level education", () => {
      const level = getMilestoneLevel(secondaryMilestone)
      expect(level.label).toBe("Secondary Education")
      expect(level.shortLabel).toBe("Secondary")
      expect(level.isUniversity).toBe(false)
      expect(level.badgeColor).toBe("#38BDF8")
    })

    it("correctly identifies Diploma / Polytechnic level education", () => {
      const level = getMilestoneLevel(polytechnicMilestone)
      expect(level.label).toBe("Diploma / Polytechnic")
      expect(level.shortLabel).toBe("Diploma")
      expect(level.isUniversity).toBe(false)
      expect(level.badgeColor).toBe("#A855F7")
    })

    it("correctly identifies University level education with distinct isUniversity flag", () => {
      const level = getMilestoneLevel(universityMilestone)
      expect(level.label).toBe("University Level")
      expect(level.shortLabel).toBe("University")
      expect(level.isUniversity).toBe(true)
      expect(level.badgeColor).toBe("#4A8FFF")
    })
  })

  // =========================================================================
  // 2. GoogleMapsPlacePanel University Milestone Transitions
  // =========================================================================
  describe("GoogleMapsPlacePanel Transitions", () => {
    it("renders University Level header badge and graduation icon on desktop view", () => {
      const html = renderToStaticMarkup(
        React.createElement(GoogleMapsPlacePanel, {
          location: universityMilestone,
          currentIndex: 3,
          totalCount: 4,
          onPrev: () => {},
          onNext: () => {},
          onRecenter: () => {},
          isMobileSheet: false,
        })
      )

      expect(html).toContain("University Level • Milestone 4/4")
      expect(html).toContain("National University of Singapore")
      expect(html).toContain("Bachelor of Computing in Computer Science")
    })

    it("renders Primary Education header badge on desktop view when transitioning to primary", () => {
      const html = renderToStaticMarkup(
        React.createElement(GoogleMapsPlacePanel, {
          location: primaryMilestone,
          currentIndex: 0,
          totalCount: 4,
          onPrev: () => {},
          onNext: () => {},
          onRecenter: () => {},
          isMobileSheet: false,
        })
      )

      expect(html).toContain("Primary Education • Milestone 1/4")
      expect(html).toContain("Peiying Primary School")
      expect(html).toContain("Score: 251")
    })

    it("renders Diploma / Polytechnic header badge on desktop view when transitioning to polytechnic", () => {
      const html = renderToStaticMarkup(
        React.createElement(GoogleMapsPlacePanel, {
          location: polytechnicMilestone,
          currentIndex: 2,
          totalCount: 4,
          onPrev: () => {},
          onNext: () => {},
          onRecenter: () => {},
          isMobileSheet: false,
        })
      )

      expect(html).toContain("Diploma / Polytechnic • Milestone 3/4")
      expect(html).toContain("Nanyang Polytechnic")
      expect(html).toContain("3.91")
    })

    it("renders mobile view university milestone badge properly", () => {
      const html = renderToStaticMarkup(
        React.createElement(GoogleMapsPlacePanel, {
          location: universityMilestone,
          currentIndex: 3,
          totalCount: 4,
          onPrev: () => {},
          onNext: () => {},
          onRecenter: () => {},
          sheetSnap: "half" as SheetSnapState,
          isMobileSheet: true,
        })
      )

      expect(html).toContain("Milestone • 4/4")
      expect(html).toContain("National University of Singapore")
      expect(html).toContain("Direct Honours Track")
    })
  })
})
