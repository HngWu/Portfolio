import { describe, it, expect, mock } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GoogleMapsPlacePanel } from "@/components/education/GoogleMapsPlacePanel";
import { GoogleMapsSearchBar } from "@/components/education/GoogleMapsSearchBar";
import { GoogleMapsControls } from "@/components/education/GoogleMapsControls";
import type { EducationLocation, SheetSnapState } from "@/types/education-map";

// Mock next/image to render a standard img tag
mock.module("next/image", () => {
  return {
    default: (props: any) => {
      return React.createElement("img", { ...props, src: props.src || "" });
    },
  };
});

// Mock hooks/usePageTransition to avoid router dependency
mock.module("@/hooks/usePageTransition", () => {
  return {
    usePageTransition: () => ({
      navigateWithTransition: mock(() => {}),
    }),
  };
});

describe("GoogleMaps-Style Mobile Education Suite", () => {
  const sampleLocation: EducationLocation = {
    id: "nus-comp",
    name: "National University of Singapore",
    type: "degree",
    program: "Bachelor of Computing in Computer Science",
    lat: 1.2966,
    lng: 103.7764,
    startDate: "2028-08",
    endDate: "2032-08",
    caption: "Incoming Computer Science undergraduate.",
    gpa: "5.00",
    honours: "Direct Honours Track, Systems & AI",
    thumbnail: "/images/nus.jpg",
    city: "Singapore",
    country: "Singapore",
  };

  const sampleLocations: EducationLocation[] = [
    sampleLocation,
    {
      id: "nyp-dit",
      name: "Nanyang Polytechnic",
      type: "degree",
      program: "Diploma in Information Technology",
      lat: 1.3800,
      lng: 103.8489,
      startDate: "2023-04",
      endDate: "2026-04",
      caption: "Graduated with Merit.",
      gpa: "3.91",
      city: "Singapore",
    },
  ];

  describe("GoogleMapsPlacePanel Mobile Tri-State Bottom Sheet", () => {
    it("renders peek snap state with compact bar, milestone badge, and expand trigger", () => {
      const html = renderToStaticMarkup(
        React.createElement(GoogleMapsPlacePanel, {
          location: sampleLocation,
          currentIndex: 0,
          totalCount: 4,
          onPrev: () => {},
          onNext: () => {},
          onRecenter: () => {},
          sheetSnap: "peek" as SheetSnapState,
          isMobileSheet: true,
        })
      );

      // Verify drag handle is present
      expect(html).toContain("w-12 h-1.5 rounded-full bg-white/40");
      // Verify institution name and program are visible in peek bar
      expect(html).toContain("National University of Singapore");
      expect(html).toContain("Bachelor of Computing in Computer Science");
      // Verify milestone number
      expect(html).toContain("1");
      // Verify expand chevron is present
      expect(html).toContain("Expand place details");
      // Verify safe area bottom padding class
      expect(html).toContain("pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]");
    });

    it("renders half snap state with 48dvh height, cover photo, and metrics", () => {
      const html = renderToStaticMarkup(
        React.createElement(GoogleMapsPlacePanel, {
          location: sampleLocation,
          currentIndex: 0,
          totalCount: 4,
          onPrev: () => {},
          onNext: () => {},
          onRecenter: () => {},
          sheetSnap: "half" as SheetSnapState,
          isMobileSheet: true,
        })
      );

      // Verify 48dvh container class
      expect(html).toContain("h-[48dvh]");
      // Verify cover photo thumbnail
      expect(html).toContain("src=\"/images/nus.jpg\"");
      // Verify blue badge wording changed from Degree to Milestone
      expect(html).toContain("Milestone • 1/4");
      // Verify GPA metric badge
      expect(html).toContain("GPA / Score: 5.00");
      // Verify date range text
      expect(html).toContain("Aug 2028 – Aug 2032");
      // Verify Next Milestone navigation button
      expect(html).toContain("Next Milestone");
    });

    it("renders full snap state with 88dvh height, honours card, and narrative summary", () => {
      const html = renderToStaticMarkup(
        React.createElement(GoogleMapsPlacePanel, {
          location: sampleLocation,
          currentIndex: 0,
          totalCount: 4,
          onPrev: () => {},
          onNext: () => {},
          onRecenter: () => {},
          sheetSnap: "full" as SheetSnapState,
          isMobileSheet: true,
        })
      );

      // Verify 88dvh container class
      expect(html).toContain("h-[88dvh]");
      // Verify honours card
      expect(html).toContain("Honours &amp; Recognition");
      expect(html).toContain("Direct Honours Track, Systems &amp; AI");
      // Verify narrative summary
      expect(html).toContain("Milestone Overview");
      expect(html).toContain("Incoming Computer Science undergraduate.");
      // Verify collapse to half view button is present
      expect(html).toContain("Collapse to half view");
    });

    it("renders desktop sidebar panel when isMobileSheet is false", () => {
      const html = renderToStaticMarkup(
        React.createElement(GoogleMapsPlacePanel, {
          location: sampleLocation,
          currentIndex: 0,
          totalCount: 4,
          onPrev: () => {},
          onNext: () => {},
          onRecenter: () => {},
          isOpen: true,
          isMobileSheet: false,
        })
      );

      // Desktop layout doesn't use the mobile 48dvh/88dvh sheet heights
      expect(html).not.toContain("h-[48dvh]");
      expect(html).not.toContain("h-[88dvh]");
      expect(html).toContain("rounded-2xl border border-white/10");
      expect(html).toContain("National University of Singapore");
    });
  });

  describe("GoogleMapsSearchBar Mobile Features", () => {
    it("renders search bar with category chips and locations count", () => {
      const html = renderToStaticMarkup(
        React.createElement(GoogleMapsSearchBar, {
          searchQuery: "",
          onSearchChange: () => {},
          selectedCategory: "all",
          onSelectCategory: () => {},
          locationsCount: 2,
          totalCount: 2,
          locations: sampleLocations,
        })
      );

      expect(html).toContain("Search milestones in Singapore...");
      expect(html).toContain("2 places");
      expect(html).toContain("Primary");
      expect(html).toContain("Secondary");
      expect(html).toContain("Diploma / Poly");
      expect(html).toContain("University");
    });
  });

  describe("GoogleMapsControls Mobile Responsiveness & Modes", () => {
    it("hides zoom in/out buttons on mobile screens via hidden sm:flex", () => {
      const html = renderToStaticMarkup(
        React.createElement(GoogleMapsControls, {
          mapTheme: "dark",
          onToggleTheme: () => {},
          mapStyle: "minimal",
          onToggleMapStyle: () => {},
          onZoomIn: () => {},
          onZoomOut: () => {},
          onRecenterSingapore: () => {},
          mode: "all",
        })
      );

      // Zoom container must have hidden sm:flex to prevent cluttering mobile screens
      expect(html).toContain("hidden sm:flex flex-col");
      expect(html).toContain("Re-center view on Singapore");
      expect(html).toContain("Map Layer: Minimalist Canvas");
    });

    it("renders only layers and theme toggle when mode is layers-only", () => {
      const html = renderToStaticMarkup(
        React.createElement(GoogleMapsControls, {
          mapTheme: "dark",
          onToggleTheme: () => {},
          mapStyle: "minimal",
          onToggleMapStyle: () => {},
          onZoomIn: () => {},
          onZoomOut: () => {},
          onRecenterSingapore: () => {},
          mode: "layers-only",
        })
      );

      expect(html).toContain("Map Layer: Minimalist Canvas");
      expect(html).toContain("Switch to Light Mode");
      expect(html).not.toContain("Re-center view on Singapore");
      expect(html).not.toContain("Zoom In");
    });

    it("renders only recenter button when mode is recenter-only", () => {
      const html = renderToStaticMarkup(
        React.createElement(GoogleMapsControls, {
          mapTheme: "dark",
          onToggleTheme: () => {},
          mapStyle: "minimal",
          onToggleMapStyle: () => {},
          onZoomIn: () => {},
          onZoomOut: () => {},
          onRecenterSingapore: () => {},
          mode: "recenter-only",
        })
      );

      expect(html).toContain("Re-center view on Singapore");
      expect(html).not.toContain("Map Layer");
      expect(html).not.toContain("Zoom In");
    });
  });
});
