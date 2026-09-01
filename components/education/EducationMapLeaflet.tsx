"use client";

import * as React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./education-map.css";
import type { EducationLocation } from "@/types/education-map";
import { TYPE_CONFIGS, createMarkerHtml } from "./EducationPinSvg";

interface EducationMapLeafletProps {
  locations: EducationLocation[];
  activeId: string | null;
  onSelectLocation: (location: EducationLocation) => void;
  theme?: "light" | "dark" | "auto";
  mapStyle?: "high-res" | "minimal";
  isPanelOpen?: boolean;
  zoomInTrigger?: number;
  zoomOutTrigger?: number;
  recenterTrigger?: number;
}

export default function EducationMapLeaflet({
  locations,
  activeId,
  onSelectLocation,
  theme = "dark",
  mapStyle = "minimal",
  isPanelOpen = true,
  zoomInTrigger = 0,
  zoomOutTrigger = 0,
  recenterTrigger = 0,
}: EducationMapLeafletProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const markersRef = React.useRef<Map<string, L.Marker>>(new Map());
  const tileLayerRef = React.useRef<L.TileLayer | null>(null);
  const hasAnimatedEntry = React.useRef<boolean>(false);

  // Basemap configuration: Default Minimalist Gray Canvas vs High-Resolution Street Map
  const getTileConfig = React.useCallback(
    (currentTheme: "light" | "dark" | "auto", currentStyle: "high-res" | "minimal") => {
      if (currentStyle === "minimal") {
        if (currentTheme === "light") {
          return {
            url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
            attribution:
              '&copy; <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Esri, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
            maxZoom: 16,
          };
        }
        return {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          attribution:
            '&copy; <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Esri, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
          maxZoom: 16,
        };
      }

      // High-Resolution OpenStreetMap engine with full zoom level 19
      return {
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
      };
    },
    []
  );

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

  // Generate lightweight tooltip
  const createTooltipContent = (loc: EducationLocation, index: number) => {
    const dateRange = formatDateRange(loc.startDate, loc.endDate);
    return `
      <div class="space-y-0.5 text-left font-sans">
        <div class="flex items-center gap-1.5">
          <span class="size-4 rounded-full bg-blue-500/20 text-[#4A8FFF] text-[9px] font-mono font-bold flex items-center justify-center">${index + 1}</span>
          <span class="font-semibold text-white/95 text-xs">${loc.name}</span>
        </div>
        <div class="text-[10px] text-white/60 font-medium pl-5">${loc.program}</div>
        <div class="text-[9px] text-white/40 font-mono pl-5">${dateRange}</div>
      </div>
    `;
  };

  // 1. Initialize Map instance ONCE on mount
  React.useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Create Map instance starting at high-altitude overview
    const map = L.map(containerRef.current, {
      center: [1.3521, 103.8198],
      zoom: 10.5,
      zoomControl: false,
      attributionControl: true,
      minZoom: 2,
      maxZoom: 19,
      worldCopyJump: true,
    });

    // Add Initial Basemap TileLayer (Defaulting to previous minimalist canvas)
    const tileConfig = getTileConfig(theme, mapStyle);
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom || 16,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapRef.current = map;

    // Smooth entrance fly-in zoom into Singapore
    if (!hasAnimatedEntry.current) {
      hasAnimatedEntry.current = true;
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.flyTo([1.3521, 103.8198], 12.5, {
            duration: 1.5,
            easeLinearity: 0.25,
          });
        }
      }, 250);
    }

    // Observe container resize (e.g. fullscreen toggle / window resize)
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [getTileConfig]);

  // 2. Seamlessly update TileLayer URL when Theme or MapStyle changes
  React.useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    const tileConfig = getTileConfig(theme, mapStyle);
    tileLayerRef.current.setUrl(tileConfig.url);
    tileLayerRef.current.options.maxZoom = tileConfig.maxZoom;
  }, [theme, mapStyle, getTileConfig]);

  // 3. Handle Zoom In trigger
  React.useEffect(() => {
    if (zoomInTrigger > 0 && mapRef.current) {
      mapRef.current.zoomIn();
    }
  }, [zoomInTrigger]);

  // 4. Handle Zoom Out trigger
  React.useEffect(() => {
    if (zoomOutTrigger > 0 && mapRef.current) {
      mapRef.current.zoomOut();
    }
  }, [zoomOutTrigger]);

  // 5. Handle Recenter trigger
  React.useEffect(() => {
    if (recenterTrigger > 0 && mapRef.current) {
      mapRef.current.flyTo([1.3521, 103.8198], 12.5, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [recenterTrigger]);

  // 6. Render & Manage Markers (permanently visible across all layer styles and themes)
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || locations.length === 0) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add landmark markers with school image thumbnail and theme
    locations.forEach((loc, index) => {
      const latLng: [number, number] = [loc.lat, loc.lng];
      const isActive = loc.id === activeId;
      const customIcon = L.divIcon({
        className: "education-div-icon",
        html: createMarkerHtml(loc.type, index, isActive, loc.thumbnail, theme),
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48],
      });

      const marker = L.marker(latLng, {
        icon: customIcon,
        riseOnHover: true,
        keyboard: true,
        title: `${loc.name} - ${loc.program}`,
      }).addTo(map);

      // Desktop Hover Tooltip
      marker.bindTooltip(createTooltipContent(loc, index), {
        direction: "top",
        offset: [0, -48],
        className: "education-map-tooltip",
        opacity: 0.95,
      });

      // Click Event
      marker.on("click", () => {
        onSelectLocation(loc);
      });

      markersRef.current.set(loc.id, marker);
    });
  }, [locations, onSelectLocation]);

  // 7. Update active marker highlight, theme colors, and map camera
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Update icons for all markers whenever activeId or theme changes
    locations.forEach((loc, index) => {
      const marker = markersRef.current.get(loc.id);
      if (marker) {
        const isActive = loc.id === activeId;
        const newIcon = L.divIcon({
          className: "education-div-icon",
          html: createMarkerHtml(loc.type, index, isActive, loc.thumbnail, theme),
          iconSize: [48, 48],
          iconAnchor: [24, 48],
          popupAnchor: [0, -48],
        });
        marker.setIcon(newIcon);
      }
    });

    if (!activeId) return;
    const activeLoc = locations.find((l) => l.id === activeId);
    if (!activeLoc) return;

    // Smart Camera Pan: Offset on desktop (to open right canvas) and mobile (above bottom sheet)
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    const lngOffset = isDesktop ? 0.016 : 0;
    const latOffset = !isDesktop && isPanelOpen ? -0.005 : 0;
    const targetLng = activeLoc.lng - lngOffset;
    const targetLat = activeLoc.lat + latOffset;

    map.flyTo([targetLat, targetLng], Math.max(map.getZoom(), 13), {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [activeId, locations, isPanelOpen, theme]);

  const containerClasses = [
    "education-map-container",
    "w-full",
    "h-full",
    theme === "light" ? "education-map-theme-light" : "",
    mapStyle === "minimal" ? "education-map-style-minimal" : "education-map-style-highres",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
