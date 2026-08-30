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
} from "lucide-react";

interface EducationMapCardHUDProps {
  location: EducationLocation | null;
  currentIndex: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}

export function EducationMapCardHUD({
  location,
  currentIndex,
  totalCount,
  onPrev,
  onNext,
  className,
}: EducationMapCardHUDProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

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

  if (isCollapsed) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-2xl",
          "bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10",
          "shadow-[0_16px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(74,143,255,0.1)]",
          "transition-all duration-300 animate-in fade-in select-none",
          className
        )}
      >
        <span
          className="size-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0"
          style={{
            backgroundColor: config.pinColor,
            color: "#000000",
            boxShadow: `0 0 10px ${config.glow}`,
          }}
        >
          {currentIndex + 1}
        </span>

        <div className="flex flex-col min-w-0 pr-2">
          <span className="text-xs font-semibold text-white/90 truncate max-w-[160px] sm:max-w-[200px]">
            {location.name}
          </span>
          <span className="text-[10px] text-white/50 truncate max-w-[160px] sm:max-w-[200px]">
            {location.program}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 border-l border-white/10 pl-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={totalCount <= 1}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 transition-colors disabled:opacity-30"
            aria-label="Previous milestone"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={totalCount <= 1}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 transition-colors disabled:opacity-30"
            aria-label="Next milestone"
          >
            <ChevronRight className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors ml-1"
            title="Expand milestone details"
            aria-label="Expand milestone details"
          >
            <ChevronUp className="size-3.5 text-lume-primary" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full max-w-[340px] sm:max-w-[380px] md:max-w-[400px] rounded-2xl overflow-hidden",
        "bg-[#080808]/92 backdrop-blur-2xl border border-white/12",
        "shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(74,143,255,0.08)]",
        "transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
        className
      )}
      role="region"
      aria-label={`Milestone ${currentIndex + 1} of ${totalCount}: ${location.name}`}
    >
      {/* Top Accent Line */}
      <div
        className="h-1 w-full"
        style={{
          backgroundColor: config.pinColor,
          boxShadow: `0 0 12px ${config.glow}`,
        }}
      />

      <div className="p-4 sm:p-4.5 space-y-3">
        {/* Header Badges, Stepper, and Collapse button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="size-6 rounded-full flex items-center justify-center text-xs font-mono font-bold"
              style={{
                backgroundColor: config.pinColor,
                color: "#000000",
                boxShadow: `0 0 10px ${config.glow}`,
              }}
            >
              {currentIndex + 1}
            </span>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: config.bg,
                color: config.text,
                border: `1px solid ${config.border}`,
              }}
            >
              {config.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
              {currentIndex + 1} / {totalCount}
            </span>
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-colors"
              title="Collapse card to minimize view obstruction"
              aria-label="Collapse milestone card"
            >
              <ChevronDown className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Institution & Degree */}
        <div className="space-y-0.5">
          <h3 className="text-sm sm:text-base font-display font-medium text-white/95 leading-snug">
            {location.name}
          </h3>
          <p className="text-xs text-white/70 font-medium leading-tight">
            {location.program}
          </p>
        </div>

        {/* Meta Stats & Highlights (GPA, Date, Location) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {dateText && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-white/60 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/5">
              <Calendar className="size-2.5 text-white/40" />
              <span>{dateText}</span>
            </div>
          )}

          {location.gpa && location.gpa !== "-" && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-lume-primary bg-lume-primary/10 px-2 py-0.5 rounded-md border border-lume-primary/20">
              <GraduationCap className="size-2.5 text-lume-primary" />
              <span>Score: {location.gpa}</span>
            </div>
          )}

          {(location.city || location.country) && (
            <div className="flex items-center gap-1 text-[11px] text-white/50 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/5">
              <MapPin className="size-2.5 text-white/30" />
              <span>
                {location.city ? `${location.city}, ` : ""}
                {location.country || "Singapore"}
              </span>
            </div>
          )}
        </div>

        {/* Honours / Awards if present */}
        {location.honours && location.honours !== "-" && (
          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
            <Award className="size-3 shrink-0 mt-0.5 text-amber-400" />
            <span className="leading-tight">{location.honours}</span>
          </div>
        )}

        {/* Caption */}
        {location.caption && (
          <p className="text-[11px] text-white/60 leading-relaxed pt-0.5 border-t border-white/5">
            {location.caption}
          </p>
        )}

        {/* Navigation Action Buttons (Previous & Next) */}
        <div className="pt-1.5 flex items-center justify-between gap-2.5 border-t border-white/10">
          <button
            type="button"
            onClick={onPrev}
            disabled={totalCount <= 1}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-mono text-xs font-medium transition-all duration-200",
              "bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 active:scale-[0.98]",
              "disabled:opacity-30 disabled:pointer-events-none"
            )}
            aria-label="Navigate to previous educational milestone"
          >
            <ChevronLeft className="size-3.5" />
            <span>Prev</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={totalCount <= 1}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-mono text-xs font-semibold transition-all duration-200",
              "bg-lume-primary text-black hover:bg-lume-primary/90 shadow-[0_0_16px_rgba(74,255,180,0.2)] active:scale-[0.98]",
              "disabled:opacity-30 disabled:pointer-events-none"
            )}
            aria-label="Navigate to next educational milestone"
          >
            <span>Next</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
