"use client";

import * as React from "react";
import type { EducationLocation } from "@/types/education-map";
import { TYPE_CONFIGS } from "./EducationPinSvg";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Award,
  GraduationCap,
  Sparkles,
  Compass,
  X,
} from "lucide-react";

interface GoogleMapsPlacePanelProps {
  location: EducationLocation | null;
  currentIndex: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
  onRecenter: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  className?: string;
}

export function GoogleMapsPlacePanel({
  location,
  currentIndex,
  totalCount,
  onPrev,
  onNext,
  onRecenter,
  isOpen,
  onToggleOpen,
  className,
}: GoogleMapsPlacePanelProps) {
  if (!location) return null;

  const config = TYPE_CONFIGS[location.type] || TYPE_CONFIGS.degree;

  // Format date range nicely
  const formatDateRange = (start?: string, end?: string) => {
    if (!start) return "";
    const format = (d: string) => {
      if (!d || d.toLowerCase() === "present") return "Present";
      const parts = d.split("-");
      if (parts.length >= 2) {
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1);
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
      return d;
    };
    return `${format(start)} – ${format(end || "Present")}`;
  };

  const dateText = formatDateRange(location.startDate, location.endDate);

  // Minimized Compact Bar (Mobile Bottom Pill / Desktop Collapsed State)
  if (!isOpen) {
    return (
      <div
        className={cn(
          "w-full pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl",
          "bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/15",
          "shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(74,143,255,0.08)]",
          "transition-all duration-300 animate-in fade-in select-none",
          className
        )}
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <span
            className="size-9 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0"
            style={{
              backgroundColor: config.pinColor,
              color: "#000000",
              boxShadow: `0 0 14px ${config.glow}`,
            }}
          >
            {currentIndex + 1}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-base font-semibold text-white truncate">
              {location.name}
            </span>
            <span className="text-xs text-white/50 truncate">
              {location.program}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 border-l border-white/10 pl-2.5">
          <button
            type="button"
            onClick={onPrev}
            disabled={totalCount <= 1}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 transition-colors disabled:opacity-30 active:scale-95 min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Previous milestone"
            aria-label="Previous milestone"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={totalCount <= 1}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 transition-colors disabled:opacity-30 active:scale-95 min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Next milestone"
            aria-label="Next milestone"
          >
            <ChevronRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={onToggleOpen}
            className="p-2 rounded-xl bg-lume-primary/10 hover:bg-lume-primary/20 text-lume-primary transition-colors border border-lume-primary/20 ml-1 active:scale-95 min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Expand place details"
            aria-label="Expand place details"
          >
            <ChevronUp className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "pointer-events-auto transition-all duration-300 w-full flex flex-col min-h-0",
        className
      )}
    >
      {/* Main Place Panel Card - Full Viewport Height Container */}
      <div
        className={cn(
          "relative w-full overflow-hidden flex flex-col flex-1 min-h-0",
          "bg-[#0a0a0a]/95 backdrop-blur-3xl",
          // Mobile bottom-sheet styling
          "max-h-[60dvh] rounded-t-3xl border-t border-white/15 shadow-[0_-20px_60px_rgba(0,0,0,0.95)]",
          // Desktop sidebar integration styling
          "sm:max-h-none sm:rounded-2xl sm:border sm:border-white/10 sm:shadow-[0_24px_60px_rgba(0,0,0,0.92)]"
        )}
      >
        {/* Mobile Pull Handle */}
        <div
          className="w-full flex items-center justify-center pt-2.5 pb-1 sm:hidden shrink-0 cursor-pointer"
          onClick={onToggleOpen}
        >
          <div className="w-12 h-1.5 rounded-full bg-white/30" />
        </div>

        {/* Header Cover Photo */}
        <div className="relative w-full h-40 sm:h-52 md:h-56 lg:h-64 bg-neutral-900 overflow-hidden shrink-0">
          {location.thumbnail ? (
            <img
              src={location.thumbnail}
              alt={location.name}
              className="w-full h-full object-cover"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-black flex items-center justify-center">
              <GraduationCap className="size-16 sm:size-20 text-white/20" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/45 to-transparent" />

          {/* Top Panel Actions: Milestone Badge, Recenter, Collapse */}
          <div className="absolute top-3 left-3 right-3 sm:top-3.5 sm:left-3.5 sm:right-3.5 flex items-center justify-between pointer-events-auto">
            <span
              className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border shadow-lg"
              style={{
                borderColor: config.border,
                color: config.text,
              }}
            >
              {config.label} • Milestone {currentIndex + 1}/{totalCount}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onRecenter}
                className="p-2 rounded-full bg-black/80 hover:bg-black text-white/80 hover:text-white transition-all backdrop-blur-md border border-white/10 shadow-lg active:scale-95 min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Focus on Campus"
                aria-label="Focus on Campus"
              >
                <Compass className="size-4 text-lume-primary" />
              </button>

              <button
                type="button"
                onClick={onToggleOpen}
                className="p-2 rounded-full bg-black/80 hover:bg-black text-white/80 hover:text-white transition-all backdrop-blur-md border border-white/10 shadow-lg active:scale-95 min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Minimize Place Details"
                aria-label="Minimize place details"
              >
                <ChevronDown className="size-4 sm:hidden" />
                <ChevronUp className="size-4 hidden sm:block" />
              </button>
            </div>
          </div>

          {/* Bottom Title on Header Photo */}
          <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-5 sm:right-5 space-y-1">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-display font-medium text-white leading-tight drop-shadow-md">
              {location.name}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-white/85 font-medium leading-tight drop-shadow-sm">
              {location.program}
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 min-h-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {location.gpa && location.gpa !== "-" && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-lume-primary/10 border border-lume-primary/30 text-lume-primary text-xs sm:text-sm font-mono font-semibold shadow-[0_0_15px_rgba(74,255,180,0.1)]">
                <GraduationCap className="size-4" />
                <span>GPA / Score: {location.gpa}</span>
              </div>
            )}

            {dateText && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/80 text-xs sm:text-sm font-mono">
                <Calendar className="size-3.5 text-white/40" />
                <span>{dateText}</span>
              </div>
            )}

            {(location.city || location.country) && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 text-xs sm:text-sm">
                <MapPin className="size-3.5 text-white/40" />
                <span>
                  {location.city ? `${location.city}, ` : ""}
                  {location.country || "Singapore"}
                </span>
              </div>
            )}
          </div>

          {/* Honours / Recognition Highlight Card */}
          {location.honours && location.honours !== "-" && (
            <div className="p-3.5 sm:p-4 md:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1.5 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                <Award className="size-4" />
                <span>Academic Honours & Awards</span>
              </div>
              <p className="text-xs sm:text-sm md:text-base leading-relaxed text-amber-200 font-medium">
                {location.honours}
              </p>
            </div>
          )}

          {/* Narrative Summary / Description */}
          {location.caption && (
            <div className="space-y-1.5 sm:space-y-2">
              <span className="text-[11px] sm:text-xs uppercase font-mono tracking-widest text-white/45 block">
                Milestone Overview
              </span>
              <p className="text-xs sm:text-sm md:text-base text-white/80 leading-relaxed bg-white/[0.02] p-3.5 sm:p-4 md:p-5 rounded-2xl border border-white/5 font-sans">
                {location.caption}
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar (Previous & Next Milestone) */}
        <div className="p-3.5 sm:p-4 bg-black/70 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onPrev}
            disabled={totalCount <= 1}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 rounded-xl font-mono text-xs sm:text-sm font-medium transition-all duration-200",
              "bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 active:scale-[0.98]",
              "disabled:opacity-30 disabled:pointer-events-none min-h-[44px]"
            )}
            aria-label="Previous milestone"
          >
            <ChevronLeft className="size-4" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={totalCount <= 1}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 rounded-xl font-mono text-xs sm:text-sm font-semibold transition-all duration-200",
              "bg-lume-primary text-black hover:bg-lume-primary/90 shadow-[0_0_20px_rgba(74,255,180,0.25)] active:scale-[0.98]",
              "disabled:opacity-30 disabled:pointer-events-none min-h-[44px]"
            )}
            aria-label="Next milestone"
          >
            <span>Next Milestone</span>
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
