"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { EducationLocation, EducationMapProps, EducationType } from "@/types/education-map";
import type { ParsedEducation } from "@/lib/content/portfolio";
import rawEducationLocations from "@/data/education-locations.json";
import { EducationTimelineStrip } from "./EducationTimelineStrip";
import { EducationLegend } from "./EducationLegend";
import { EducationMapCardHUD } from "./EducationMapCardHUD";
import { cn } from "@/lib/utils";
import { usePageTransition } from "@/hooks/usePageTransition";
import {
  Globe,
  Compass,
  Sun,
  Moon,
  RotateCcw,
  ArrowLeft,
  SlidersHorizontal,
  Layers,
} from "lucide-react";

// Client-only dynamic import of the Leaflet Map Engine
const EducationMapLeaflet = dynamic(() => import("./EducationMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#080808] space-y-3">
      <div className="size-9 rounded-full border-2 border-lume-primary/30 border-t-lume-primary animate-spin" />
      <span className="text-xs font-mono text-white/50 tracking-widest uppercase">
        Initializing Singapore Geographic Atlas...
      </span>
    </div>
  ),
});

export interface FullEducationMapProps extends EducationMapProps {
  fullViewport?: boolean;
}

export function EducationMap({
  education: dbEducation,
  locations: customLocations,
  initialActiveId,
  height = "100%",
  className,
  showTimeline = true,
  showLegend = true,
  theme: initialTheme = "dark",
  fullViewport = true,
  onSelectLocation,
}: FullEducationMapProps) {
  const { navigateWithTransition } = usePageTransition();

  // Transform dbEducation or customLocations to EducationLocation array
  const allLocations: EducationLocation[] = React.useMemo(() => {
    if (dbEducation && dbEducation.length > 0) {
      return dbEducation.map((edu, idx) => ({
        id: edu.id || `edu-${idx}`,
        name: edu.institution || "Educational Institution",
        program: edu.degree || "Academic Milestone",
        type: (edu.type as EducationType) || "degree",
        lat: edu.lat ?? 1.3521,
        lng: edu.lng ?? 103.8198,
        startDate: edu.startDate || "2020-01",
        endDate: edu.endDate || "Present",
        gpa: edu.gpa,
        honours: edu.honours,
        city: edu.city || "Singapore",
        country: edu.country || "Singapore",
        caption:
          edu.caption ||
          (edu.honours && edu.honours !== "-"
            ? `${edu.degree} at ${edu.institution} (${edu.honours}).`
            : `${edu.degree} foundations at ${edu.institution}.`),
        thumbnail: edu.thumbnail,
      })).sort((a, b) => a.startDate.localeCompare(b.startDate));
    }

    if (customLocations && customLocations.length > 0) {
      return [...customLocations].sort((a, b) => a.startDate.localeCompare(b.startDate));
    }

    return (rawEducationLocations as EducationLocation[]).sort((a, b) =>
      a.startDate.localeCompare(b.startDate)
    );
  }, [dbEducation, customLocations]);

  const [selectedType, setSelectedType] = React.useState<EducationType | "all">("all");
  const [activeId, setActiveId] = React.useState<string | null>(
    initialActiveId || (allLocations.length > 0 ? allLocations[0].id : null)
  );
  const [mapTheme, setMapTheme] = React.useState<"light" | "dark" | "auto">(initialTheme);
  const [showFilters, setShowFilters] = React.useState(false);

  // Filtered locations based on legend selection
  const filteredLocations = React.useMemo(() => {
    if (selectedType === "all") return allLocations;
    return allLocations.filter((l) => l.type === selectedType);
  }, [allLocations, selectedType]);

  // Keep activeId valid within filtered locations
  React.useEffect(() => {
    if (filteredLocations.length > 0) {
      const exists = filteredLocations.some((l) => l.id === activeId);
      if (!exists) {
        setActiveId(filteredLocations[0].id);
      }
    } else {
      setActiveId(null);
    }
  }, [filteredLocations, activeId]);

  const handleSelectLocation = React.useCallback(
    (loc: EducationLocation) => {
      setActiveId(loc.id);
      onSelectLocation?.(loc);
    },
    [onSelectLocation]
  );

  const activeIndex = filteredLocations.findIndex((l) => l.id === activeId);
  const activeLocation = activeIndex >= 0 ? filteredLocations[activeIndex] : null;

  const handlePrev = React.useCallback(() => {
    if (filteredLocations.length === 0) return;
    const nextIdx = activeIndex <= 0 ? filteredLocations.length - 1 : activeIndex - 1;
    handleSelectLocation(filteredLocations[nextIdx]);
  }, [activeIndex, filteredLocations, handleSelectLocation]);

  const handleNext = React.useCallback(() => {
    if (filteredLocations.length === 0) return;
    const nextIdx = activeIndex >= filteredLocations.length - 1 ? 0 : activeIndex + 1;
    handleSelectLocation(filteredLocations[nextIdx]);
  }, [activeIndex, filteredLocations, handleSelectLocation]);

  // Keyboard navigation (Arrow keys for prev/next)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  const handleReset = () => {
    setSelectedType("all");
    if (allLocations.length > 0) {
      setActiveId(allLocations[0].id);
    }
  };

  const toggleTheme = () => {
    setMapTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-[#050505]",
        fullViewport ? "h-[100dvh] w-screen fixed inset-0 z-30" : "h-[600px] rounded-3xl border border-white/10",
        className
      )}
    >
      {/* Screen Reader Accessible Fallback List */}
      <div className="sr-only">
        <h2>Chronological Education Journey in Singapore</h2>
        <ul>
          {allLocations.map((loc, idx) => (
            <li key={loc.id}>
              <h3>
                {idx + 1}. {loc.name} - {loc.program} ({loc.type})
              </h3>
              <p>
                Period: {loc.startDate} to {loc.endDate}
              </p>
              <p>
                Location: {loc.city}, {loc.country}
              </p>
              <p>{loc.caption}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Background Fullscreen Leaflet Map */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <EducationMapLeaflet
          locations={filteredLocations}
          activeId={activeId}
          onSelectLocation={handleSelectLocation}
          theme={mapTheme}
        />
      </div>

      {/* Floating Top Header Bar */}
      <div className="absolute top-20 sm:top-24 left-4 right-4 sm:left-6 sm:right-6 z-[450] pointer-events-none flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back Link & Title */}
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateWithTransition("/")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 text-xs font-mono text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 shadow-xl group"
            aria-label="Return to portfolio home"
          >
            <ArrowLeft className="size-3.5 transform transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 shadow-xl">
            <div className="size-2 rounded-full bg-lume-primary animate-pulse" />
            <span className="text-xs font-mono font-medium text-white/90 tracking-wide uppercase">
              Education Journey
            </span>
            <span className="text-[10px] font-mono text-white/40 hidden md:inline">
              • Singapore
            </span>
          </div>
        </div>

        {/* Right: Controls (Theme, Reset, Filter toggle) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Filter Pills Toggle on mobile/tablet */}
          {showLegend && (
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className={cn(
                "p-2 rounded-xl border text-xs font-mono transition-all backdrop-blur-xl shadow-xl flex items-center gap-1.5",
                showFilters
                  ? "bg-lume-primary text-black border-lume-primary font-medium"
                  : "bg-[#0a0a0a]/80 hover:bg-white/10 text-white/70 hover:text-white border-white/10"
              )}
              title="Toggle milestone category filters"
              aria-label="Toggle category filter toolbar"
            >
              <SlidersHorizontal className="size-3.5" />
              <span className="hidden md:inline text-[11px]">Filters</span>
            </button>
          )}

          {/* Basemap Tile Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[#0a0a0a]/80 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/10 backdrop-blur-xl shadow-xl flex items-center gap-1.5 text-xs font-mono"
            title={`Switch to ${mapTheme === "dark" ? "Light Gray Base" : "Dark Gray Base"} tiles`}
            aria-label="Toggle map tile theme"
          >
            {mapTheme === "dark" ? (
              <Sun className="size-3.5 text-amber-400" />
            ) : (
              <Moon className="size-3.5 text-blue-400" />
            )}
          </button>

          {/* Reset / Center View Button */}
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl bg-[#0a0a0a]/80 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/10 backdrop-blur-xl shadow-xl flex items-center gap-1.5 text-xs font-mono"
            title="Reset Singapore view and active milestone"
            aria-label="Reset map view"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Dropdown / Floating Category Filter Bar */}
      {showLegend && showFilters && (
        <div className="absolute top-32 sm:top-36 left-4 right-4 sm:left-6 sm:right-auto z-[450] pointer-events-auto animate-in fade-in slide-in-from-top-2">
          <EducationLegend
            locations={allLocations}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            className="bg-[#0a0a0a]/90 shadow-2xl border-white/12"
          />
        </div>
      )}

      {/* Floating On-Map Popup HUD Card with Prev / Next Buttons (Positioned to avoid blocking Singapore view) */}
      {activeLocation && (
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:right-8 z-[420] pointer-events-auto">
          <EducationMapCardHUD
            location={activeLocation}
            currentIndex={activeIndex}
            totalCount={filteredLocations.length}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      )}

      {/* Floating Timeline Strip (Positioned at bottom-left, non-obstructive) */}
      {showTimeline && (
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 max-w-[calc(100vw-32px)] sm:max-w-md lg:max-w-lg z-[410] pointer-events-auto hidden md:block">
          <div className="p-2.5 rounded-2xl bg-[#0a0a0a]/75 backdrop-blur-xl border border-white/10 shadow-2xl">
            <EducationTimelineStrip
              locations={filteredLocations}
              activeId={activeId}
              onSelectLocation={handleSelectLocation}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default EducationMap;
