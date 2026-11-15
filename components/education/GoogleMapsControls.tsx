"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Plus,
  Minus,
  Crosshair,
  Sun,
  Moon,
  Layers,
} from "lucide-react";

export interface GoogleMapsControlsProps {
  mapTheme: "light" | "dark" | "auto";
  onToggleTheme: () => void;
  mapStyle: "high-res" | "minimal";
  onToggleMapStyle: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenterSingapore: () => void;
  mode?: "all" | "layers-only" | "recenter-only" | "zoom-only";
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export function GoogleMapsControls({
  mapTheme,
  onToggleTheme,
  mapStyle,
  onToggleMapStyle,
  onZoomIn,
  onZoomOut,
  onRecenterSingapore,
  mode = "all",
  orientation = "horizontal",
  className,
}: GoogleMapsControlsProps) {
  const [isRecentering, setIsRecentering] = React.useState(false);

  const handleRecenterClick = () => {
    setIsRecentering(true);
    onRecenterSingapore();
    setTimeout(() => setIsRecentering(false), 1200);
  };

  const renderLayersAndTheme = () => (
    <div
      className={cn(
        "flex rounded-2xl bg-[#0a0a0a]/94 backdrop-blur-3xl border border-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(74,143,255,0.06)] overflow-hidden",
        orientation === "horizontal"
          ? "flex-row divide-x divide-white/10"
          : "flex-col divide-y divide-white/10"
      )}
    >
      {/* High-Resolution vs Minimal Canvas Toggle */}
      <button
        type="button"
        onClick={onToggleMapStyle}
        className={cn(
          "p-2.5 sm:p-3 transition-all duration-200 flex items-center justify-center group relative active:scale-90 min-h-[40px] min-w-[40px]",
          mapStyle === "high-res"
            ? "bg-[#4A8FFF]/20 text-[#4A8FFF]"
            : "text-white/70 hover:text-white hover:bg-white/10"
        )}
        title={
          mapStyle === "high-res"
            ? "Map Layer: High-Resolution Street Map (Click for Minimal Canvas)"
            : "Map Layer: Minimalist Canvas (Click for High-Resolution Map)"
        }
        aria-label="Toggle map resolution style"
      >
        <Layers
          className={cn(
            "size-4 sm:size-4.5 transition-transform duration-300",
            mapStyle === "high-res" ? "scale-110" : "group-hover:scale-105"
          )}
        />
        
        {mapStyle === "high-res" && (
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[#4A8FFF] shadow-[0_0_8px_#4A8FFF]" />
        )}
      </button>

      {/* Basemap Theme Toggle (Dark / Light) */}
      <button
        type="button"
        onClick={onToggleTheme}
        className="p-2.5 sm:p-3 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 flex items-center justify-center group active:scale-90 min-h-[40px] min-w-[40px]"
        title={`Switch to ${mapTheme === "dark" ? "Light Mode" : "Dark Mode"}`}
        aria-label="Toggle map theme"
      >
        <div className="relative size-4 sm:size-4.5 flex items-center justify-center transition-transform duration-500 group-hover:rotate-45">
          {mapTheme === "dark" ? (
            <Sun className="size-4 sm:size-4.5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
          ) : (
            <Moon className="size-4 sm:size-4.5 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
          )}
        </div>
      </button>
    </div>
  );

  const renderRecenter = () => (
    <button
      type="button"
      onClick={handleRecenterClick}
      className="p-3 sm:p-3.5 rounded-2xl bg-[#0a0a0a]/92 backdrop-blur-3xl border border-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(74,255,180,0.06)] text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 flex items-center justify-center group active:scale-90 min-h-[44px] min-w-[44px]"
      title="Re-center view on Singapore"
      aria-label="Re-center map to Singapore"
    >
      <Crosshair
        className={cn(
          "size-5 text-lume-primary transition-all duration-500",
          isRecentering ? "rotate-180 scale-125 text-[#4AFFB4]" : "group-hover:rotate-90 group-hover:scale-110"
        )}
      />
    </button>
  );

  const renderZoom = () => (
    <div className="hidden sm:flex flex-col rounded-2xl bg-[#0a0a0a]/92 backdrop-blur-3xl border border-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden divide-y divide-white/8">
      <button
        type="button"
        onClick={onZoomIn}
        className="p-3.5 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 flex items-center justify-center group active:scale-90"
        title="Zoom In"
        aria-label="Zoom in on map"
      >
        <Plus className="size-5 transition-transform duration-200 group-hover:scale-115" />
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className="p-3.5 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 flex items-center justify-center group active:scale-90"
        title="Zoom Out"
        aria-label="Zoom out on map"
      >
        <Minus className="size-5 transition-transform duration-200 group-hover:scale-115" />
      </button>
    </div>
  );

  if (mode === "layers-only") {
    return <div className={cn("pointer-events-auto select-none", className)}>{renderLayersAndTheme()}</div>;
  }

  if (mode === "recenter-only") {
    return <div className={cn("pointer-events-auto select-none", className)}>{renderRecenter()}</div>;
  }

  if (mode === "zoom-only") {
    return <div className={cn("pointer-events-auto select-none", className)}>{renderZoom()}</div>;
  }

  return (
    <div className={cn("flex flex-col gap-3 pointer-events-auto select-none", className)}>
      {renderLayersAndTheme()}
      {renderRecenter()}
      {renderZoom()}
    </div>
  );
}
