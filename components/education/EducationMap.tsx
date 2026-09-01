"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { EducationLocation, EducationMapProps, EducationType } from "@/types/education-map";
import type { ParsedEducation } from "@/lib/content/portfolio";
import rawEducationLocations from "@/data/education-locations.json";
import { GoogleMapsSearchBar } from "./GoogleMapsSearchBar";
import { GoogleMapsPlacePanel } from "./GoogleMapsPlacePanel";
import { GoogleMapsControls } from "./GoogleMapsControls";
import { cn } from "@/lib/utils";
import { Compass } from "lucide-react";

// Client-only dynamic import of the Leaflet Map Engine with cinematic shimmer skeleton
const EducationMapLeaflet = dynamic(() => import("./EducationMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-full bg-[#050505] overflow-hidden flex flex-col items-center justify-center">
      {/* Animated Subtle Grid Lines matching Lume-Glass theme */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(var(--lume-primary)_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Shimmer Pulse Auras */}
      <div className="relative flex flex-col items-center gap-4 z-10">
        <div className="relative size-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[var(--lume-primary)]/20 animate-ping" />
          <div className="size-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-[0_0_30px_rgba(74,255,180,0.25)]">
            <Compass className="size-6 text-[var(--lume-primary)] animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-xs font-mono font-medium tracking-widest text-white/90 uppercase">
            Loading Geographic Map...
          </span>
          <span className="text-[10px] font-mono text-white/40">
            Singapore Academic Journey Atlas
          </span>
        </div>
      </div>
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
  className,
  theme: initialTheme = "dark",
  fullViewport = true,
  onSelectLocation,
}: FullEducationMapProps) {
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

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [activeId, setActiveId] = React.useState<string | null>(
    initialActiveId || (allLocations.length > 0 ? allLocations[0].id : null)
  );
  const [isPlacePanelOpen, setIsPlacePanelOpen] = React.useState(true);
  const [mapTheme, setMapTheme] = React.useState<"light" | "dark" | "auto">(initialTheme);
  
  // Default to previous minimalist map
  const [mapStyle, setMapStyle] = React.useState<"high-res" | "minimal">("minimal");

  // Zoom and recenter triggers
  const [zoomInTrigger, setZoomInTrigger] = React.useState(0);
  const [zoomOutTrigger, setZoomOutTrigger] = React.useState(0);
  const [recenterTrigger, setRecenterTrigger] = React.useState(0);

  // Robust Filtered locations matching name, program, caption, honours, and category
  const filteredLocations = React.useMemo(() => {
    return allLocations.filter((loc) => {
      const normProg = (loc.program || "").toLowerCase();
      const normName = (loc.name || "").toLowerCase();
      const normCaption = (loc.caption || "").toLowerCase();
      const fullText = `${normName} ${normProg} ${normCaption} ${loc.type || ""}`;

      // Category filter
      if (selectedCategory !== "all") {
        if (selectedCategory === "primary") {
          const isPrimary =
            fullText.includes("primary") ||
            fullText.includes("psle") ||
            fullText.includes("peiying") ||
            fullText.includes("elementary");
          if (!isPrimary) return false;
        } else if (selectedCategory === "secondary") {
          const isSecondary =
            fullText.includes("secondary") ||
            fullText.includes("o level") ||
            fullText.includes("o-level") ||
            fullText.includes("high school") ||
            fullText.includes("chung cheng") ||
            fullText.includes("gce");
          if (!isSecondary) return false;
        } else if (selectedCategory === "diploma") {
          const isDiploma =
            fullText.includes("diploma") ||
            fullText.includes("polytechnic") ||
            fullText.includes("poly") ||
            fullText.includes("nyp") ||
            fullText.includes("nanyang poly");
          if (!isDiploma) return false;
        } else if (selectedCategory === "degree") {
          const isUniversity =
            fullText.includes("university") ||
            fullText.includes("bachelor") ||
            fullText.includes("degree") ||
            fullText.includes("nus") ||
            fullText.includes("bcomp") ||
            fullText.includes("undergraduate");
          if (!isUniversity) return false;
        }
      }

      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = normName.includes(q);
        const matchProg = normProg.includes(q);
        const matchCity = (loc.city || "").toLowerCase().includes(q);
        const matchHonours = (loc.honours || "").toLowerCase().includes(q);
        const matchCaption = normCaption.includes(q);
        if (!matchName && !matchProg && !matchCity && !matchHonours && !matchCaption) return false;
      }

      return true;
    });
  }, [allLocations, selectedCategory, searchQuery]);

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
      setIsPlacePanelOpen(true);
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

  const handleRecenter = () => {
    setRecenterTrigger((prev) => prev + 1);
  };

  const handleToggleMapStyle = () => {
    setMapStyle((prev) => (prev === "minimal" ? "high-res" : "minimal"));
  };

  return (
    <div
      className={cn(
        "relative w-full h-[100dvh] overflow-hidden bg-[#050505] select-none",
        fullViewport ? "w-screen fixed inset-0 z-30" : "h-[650px] rounded-3xl border border-white/10",
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

      {/* Fullscreen Leaflet Map Canvas */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <EducationMapLeaflet
          locations={filteredLocations}
          activeId={activeId}
          onSelectLocation={handleSelectLocation}
          theme={mapTheme}
          mapStyle={mapStyle}
          isPanelOpen={isPlacePanelOpen}
          zoomInTrigger={zoomInTrigger}
          zoomOutTrigger={zoomOutTrigger}
          recenterTrigger={recenterTrigger}
        />
      </div>

      {/* DESKTOP & TABLET MODE: Full Viewport Height Left Sidebar */}
      <div className="hidden sm:flex fixed left-0 top-0 bottom-0 z-[450] w-full sm:w-[420px] md:w-[480px] lg:w-[520px] xl:w-[540px] flex-col p-4 sm:p-5 gap-3.5 bg-[#080808]/94 backdrop-blur-3xl border-r border-white/10 shadow-[24px_0_60px_rgba(0,0,0,0.92)]">
        {/* Top Search & Category Filter Bar */}
        <GoogleMapsSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          locationsCount={filteredLocations.length}
          totalCount={allLocations.length}
          className="w-full shrink-0"
        />

        {/* Full-Height Place Details Card Body */}
        {activeLocation ? (
          <GoogleMapsPlacePanel
            location={activeLocation}
            currentIndex={activeIndex}
            totalCount={filteredLocations.length}
            onPrev={handlePrev}
            onNext={handleNext}
            onRecenter={handleRecenter}
            isOpen={isPlacePanelOpen}
            onToggleOpen={() => setIsPlacePanelOpen((prev) => !prev)}
            className="w-full flex-1 min-h-0"
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5">
            <Compass className="size-10 text-white/30 mb-3" />
            <p className="text-sm text-white/60 font-medium">No educational institutions found</p>
            <p className="text-xs text-white/40 mt-1">Try clearing your search filter</p>
          </div>
        )}
      </div>

      {/* MOBILE MODE: Floating Top Search Bar */}
      <div className="sm:hidden fixed top-3 left-3 right-3 z-[450] pointer-events-auto">
        <GoogleMapsSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          locationsCount={filteredLocations.length}
          totalCount={allLocations.length}
          className="w-full"
        />
      </div>

      {/* MOBILE MODE: Strictly Positioned at Bottom of Screen as Bottom Sheet */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[450] pointer-events-auto">
        {activeLocation && (
          <GoogleMapsPlacePanel
            location={activeLocation}
            currentIndex={activeIndex}
            totalCount={filteredLocations.length}
            onPrev={handlePrev}
            onNext={handleNext}
            onRecenter={handleRecenter}
            isOpen={isPlacePanelOpen}
            onToggleOpen={() => setIsPlacePanelOpen((prev) => !prev)}
            className="w-full"
          />
        )}
      </div>

      {/* Floating Map Controls in the Bottom Right-Hand Corner of the Screen */}
      <div className="fixed bottom-5 sm:bottom-6 right-5 sm:right-6 z-[450] pointer-events-auto">
        <GoogleMapsControls
          mapTheme={mapTheme}
          onToggleTheme={() => setMapTheme((prev) => (prev === "dark" ? "light" : "dark"))}
          mapStyle={mapStyle}
          onToggleMapStyle={handleToggleMapStyle}
          onZoomIn={() => setZoomInTrigger((prev) => prev + 1)}
          onZoomOut={() => setZoomOutTrigger((prev) => prev + 1)}
          onRecenterSingapore={handleRecenter}
        />
      </div>
    </div>
  );
}

export default EducationMap;
