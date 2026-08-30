"use client";

import * as React from "react";
import type { EducationLocation } from "@/types/education-map";
import { TYPE_CONFIGS } from "./EducationPinSvg";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

interface EducationTimelineStripProps {
  locations: EducationLocation[];
  activeId: string | null;
  onSelectLocation: (location: EducationLocation) => void;
  className?: string;
}

export function EducationTimelineStrip({
  locations,
  activeId,
  onSelectLocation,
  className,
}: EducationTimelineStripProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const cardRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  const currentIndex = locations.findIndex((loc) => loc.id === activeId);

  // Auto-scroll active card into view
  React.useEffect(() => {
    if (activeId && cardRefs.current.has(activeId)) {
      const cardEl = cardRefs.current.get(activeId);
      if (cardEl && scrollContainerRef.current) {
        cardEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeId]);

  const handlePrev = () => {
    if (locations.length === 0) return;
    const nextIdx = currentIndex <= 0 ? locations.length - 1 : currentIndex - 1;
    onSelectLocation(locations[nextIdx]);
  };

  const handleNext = () => {
    if (locations.length === 0) return;
    const nextIdx = currentIndex >= locations.length - 1 ? 0 : currentIndex + 1;
    onSelectLocation(locations[nextIdx]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  // Format date range nicely
  const formatDateRange = (start: string, end: string) => {
    const format = (d: string) => {
      if (!d || d.toLowerCase() === "present") return "Present";
      const parts = d.split("-");
      if (parts.length >= 2) {
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1);
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
      return d;
    };
    return `${format(start)} – ${format(end)}`;
  };

  return (
    <div
      className={cn("flex flex-col gap-3 w-full", className)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Education journey chronological timeline"
    >
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-white/40 font-mono">
            Timeline Progression
          </span>
          <span className="text-xs font-mono text-lume-primary">
            {currentIndex >= 0 ? `${currentIndex + 1}/${locations.length}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            disabled={locations.length <= 1}
            aria-label="Previous educational location"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none border border-white/10"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={locations.length <= 1}
            aria-label="Next educational location"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none border border-white/10"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Timeline Strip */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x"
      >
        {locations.map((loc, idx) => {
          const isActive = loc.id === activeId;
          const config = TYPE_CONFIGS[loc.type] || TYPE_CONFIGS.degree;
          const dateRange = formatDateRange(loc.startDate, loc.endDate);

          return (
            <button
              key={loc.id}
              ref={(el) => {
                if (el) cardRefs.current.set(loc.id, el);
                else cardRefs.current.delete(loc.id);
              }}
              type="button"
              onClick={() => onSelectLocation(loc)}
              aria-selected={isActive}
              className={cn(
                "snap-start shrink-0 w-[240px] sm:w-[280px] p-3.5 rounded-xl text-left transition-all duration-300 relative group",
                "bg-white/[0.03] backdrop-blur-md border",
                isActive
                  ? "bg-white/[0.08] border-lume-primary shadow-[0_0_20px_rgba(74,255,180,0.15)] ring-1 ring-lume-primary/50"
                  : "border-white/5 hover:border-white/20 hover:bg-white/[0.05]"
              )}
            >
              {/* Step indicator tag */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className="size-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold"
                    style={{
                      backgroundColor: isActive ? config.pinColor : "rgba(255,255,255,0.1)",
                      color: isActive ? "#000000" : "#ffffff",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: config.bg,
                      color: config.text,
                      border: `1px solid ${config.border}`,
                    }}
                  >
                    {config.label}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-white/40">{dateRange}</span>
              </div>

              {/* Title & Program */}
              <div className="space-y-0.5">
                <h4
                  className={cn(
                    "text-sm font-semibold transition-colors leading-snug line-clamp-1",
                    isActive ? "text-white" : "text-white/80 group-hover:text-white"
                  )}
                >
                  {loc.name}
                </h4>
                <p className="text-xs text-white/60 line-clamp-1">{loc.program}</p>
              </div>

              {/* Location pin tag */}
              {(loc.city || loc.country) && (
                <div className="flex items-center gap-1 mt-2.5 text-[11px] text-white/40">
                  <MapPin className="size-3 shrink-0 text-white/30" />
                  <span className="truncate">
                    {loc.city ? `${loc.city}, ` : ""}
                    {loc.country || ""}
                  </span>
                </div>
              )}

              {/* Active glow indicator bar */}
              {isActive && (
                <div
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                  style={{
                    backgroundColor: config.pinColor,
                    boxShadow: `0 0 10px ${config.glow}`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
