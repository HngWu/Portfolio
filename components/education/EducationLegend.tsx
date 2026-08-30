"use client";

import * as React from "react";
import type { EducationLocation, EducationType } from "@/types/education-map";
import { TYPE_CONFIGS } from "./EducationPinSvg";
import { cn } from "@/lib/utils";

interface EducationLegendProps {
  locations: EducationLocation[];
  selectedType: EducationType | "all";
  onSelectType: (type: EducationType | "all") => void;
  className?: string;
}

export function EducationLegend({
  locations,
  selectedType,
  onSelectType,
  className,
}: EducationLegendProps) {
  // Count per type
  const typeCounts = React.useMemo(() => {
    const counts: Partial<Record<EducationType, number>> = {};
    locations.forEach((loc) => {
      counts[loc.type] = (counts[loc.type] || 0) + 1;
    });
    return counts;
  }, [locations]);

  const availableTypes = (Object.keys(TYPE_CONFIGS) as EducationType[]).filter(
    (type) => (typeCounts[type] || 0) > 0
  );

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-md",
        className
      )}
      role="toolbar"
      aria-label="Filter education milestones by category"
    >
      <button
        type="button"
        onClick={() => onSelectType("all")}
        className={cn(
          "px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-200 flex items-center gap-1.5",
          selectedType === "all"
            ? "bg-white/15 text-white shadow-sm border border-white/20"
            : "text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent"
        )}
        aria-pressed={selectedType === "all"}
      >
        <span>All</span>
        <span className="text-[10px] opacity-60 font-sans">({locations.length})</span>
      </button>

      {availableTypes.map((type) => {
        const config = TYPE_CONFIGS[type];
        const count = typeCounts[type] || 0;
        const isSelected = selectedType === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelectType(isSelected ? "all" : type)}
            style={{
              borderColor: isSelected ? config.border : "transparent",
              backgroundColor: isSelected ? config.bg : undefined,
            }}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border",
              isSelected
                ? "shadow-sm"
                : "text-white/60 hover:text-white/90 hover:bg-white/5 border-transparent"
            )}
            aria-pressed={isSelected}
          >
            <span
              className="size-2 rounded-full"
              style={{
                backgroundColor: config.pinColor,
                boxShadow: isSelected ? `0 0 8px ${config.glow}` : "none",
              }}
            />
            <span style={{ color: isSelected ? config.text : undefined }}>
              {config.label}
            </span>
            <span className="text-[10px] opacity-60 font-mono">({count})</span>
          </button>
        );
      })}
    </div>
  );
}
