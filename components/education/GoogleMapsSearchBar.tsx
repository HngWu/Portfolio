"use client";

import * as React from "react";
import type { EducationLocation, EducationType } from "@/types/education-map";
import { usePageTransition } from "@/hooks/usePageTransition";
import { cn } from "@/lib/utils";
import { ArrowLeft, Search, X, MapPin, GraduationCap, School } from "lucide-react";

interface GoogleMapsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  locationsCount: number;
  totalCount: number;
  className?: string;
}

const CATEGORY_CHIPS = [
  { id: "all", label: "All", icon: MapPin },
  { id: "primary", label: "Primary", icon: School },
  { id: "secondary", label: "Secondary", icon: School },
  { id: "diploma", label: "Diploma / Poly", icon: GraduationCap },
  { id: "degree", label: "University", icon: GraduationCap },
];

export function GoogleMapsSearchBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  locationsCount,
  totalCount,
  className,
}: GoogleMapsSearchBarProps) {
  const { navigateWithTransition } = usePageTransition();
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className={cn("flex flex-col gap-2.5 w-full pointer-events-auto", className)}>
      {/* Floating Main Search Box */}
      <div
        className={cn(
          "flex items-center gap-3 px-3.5 sm:px-4.5 py-3 sm:py-3.5 rounded-2xl transition-all duration-300",
          "bg-[#0a0a0a]/94 backdrop-blur-3xl border",
          "shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(74,143,255,0.08)]",
          isFocused ? "border-lume-primary/60 ring-2 ring-lume-primary/30" : "border-white/12"
        )}
      >
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigateWithTransition("/")}
          className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all group shrink-0 border border-white/5 active:scale-95 min-w-[36px] min-h-[36px] flex items-center justify-center"
          title="Back to Home"
          aria-label="Return to portfolio home"
        >
          <ArrowLeft className="size-4 sm:size-4.5 transform transition-transform group-hover:-translate-x-0.5" />
        </button>

        {/* Search Icon */}
        <Search className="size-4 sm:size-5 text-white/40 shrink-0" />

        {/* Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search milestones in Singapore..."
          className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-white/40 font-sans outline-none leading-none"
        />

        {/* Clear search or count indicator */}
        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors shrink-0 active:scale-90"
            title="Clear search"
          >
            <X className="size-4 sm:size-4.5" />
          </button>
        ) : (
          <span className="text-[11px] sm:text-xs font-mono text-white/50 px-2.5 py-1 rounded-full bg-white/5 shrink-0 border border-white/5">
            {locationsCount} {locationsCount === 1 ? "place" : "places"}
          </span>
        )}
      </div>

      {/* Quick Category Filter Chips */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 px-0.5 scrollbar-none touch-pan-x">
        {CATEGORY_CHIPS.map((chip) => {
          const isSelected = selectedCategory === chip.id;
          const Icon = chip.icon;

          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onSelectCategory(isSelected && chip.id !== "all" ? "all" : chip.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shrink-0 select-none",
                "backdrop-blur-xl border shadow-lg active:scale-95",
                isSelected
                  ? "bg-white text-black border-white font-semibold shadow-white/10"
                  : "bg-[#0a0a0a]/90 text-white/70 hover:text-white hover:bg-white/10 border-white/10"
              )}
            >
              <Icon className={cn("size-3.5 sm:size-4", isSelected ? "text-black" : "text-white/50")} />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
