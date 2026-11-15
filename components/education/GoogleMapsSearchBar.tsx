"use client";

import * as React from "react";
import type { EducationLocation } from "@/types/education-map";
import { TYPE_CONFIGS } from "./EducationPinSvg";
import { usePageTransition } from "@/hooks/usePageTransition";
import { cn } from "@/lib/utils";
import { ArrowLeft, Search, X, MapPin, GraduationCap, School } from "lucide-react";

export interface GoogleMapsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  locationsCount: number;
  totalCount: number;
  locations?: EducationLocation[];
  onSelectLocation?: (loc: EducationLocation) => void;
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
  locations = [],
  onSelectLocation,
  className,
}: GoogleMapsSearchBarProps) {
  const { navigateWithTransition } = usePageTransition();
  const [isFocused, setIsFocused] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Filter matching suggestions when typing
  const searchSuggestions = React.useMemo(() => {
    if (!searchQuery.trim() || locations.length === 0) return [];
    const q = searchQuery.toLowerCase().trim();
    return locations.filter((loc) => {
      const matchName = (loc.name || "").toLowerCase().includes(q);
      const matchProg = (loc.program || "").toLowerCase().includes(q);
      const matchCity = (loc.city || "").toLowerCase().includes(q);
      return matchName || matchProg || matchCity;
    }).slice(0, 5);
  }, [searchQuery, locations]);

  // Handle clicking outside to dismiss suggestions dropdown
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-col gap-2.5 w-full pointer-events-auto", className)}
    >
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
          placeholder="Search milestones in Singapore..."
          className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-white/40 font-sans outline-none leading-none"
        />

        {/* Clear search or count indicator */}
        {searchQuery ? (
          <button
            type="button"
            onClick={() => {
              onSearchChange("");
              setIsFocused(false);
            }}
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

      {/* Mobile Instant Search Suggestions Dropdown */}
      {isFocused && searchSuggestions.length > 0 && (
        <div className="absolute top-[calc(100%-0.25rem)] left-0 right-0 z-50 rounded-2xl bg-[#0a0a0a]/96 backdrop-blur-3xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden divide-y divide-white/5 p-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {searchSuggestions.map((loc, idx) => {
            const config = TYPE_CONFIGS[loc.type] || TYPE_CONFIGS.degree;
            return (
              <button
                key={loc.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectLocation?.(loc);
                  setIsFocused(false);
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 active:bg-white/15 text-left transition-colors cursor-pointer group"
              >
                <span
                  className="size-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0"
                  style={{
                    backgroundColor: config.pinColor,
                    color: "#000000",
                    boxShadow: `0 0 10px ${config.glow}`,
                  }}
                >
                  {idx + 1}
                </span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-lume-primary transition-colors truncate">
                    {loc.name}
                  </span>
                  <span className="text-[11px] text-white/50 truncate">
                    {loc.program} • {config.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Quick Category Filter Chips */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 px-0.5 pr-24 sm:pr-0.5 scrollbar-none touch-pan-x">
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
