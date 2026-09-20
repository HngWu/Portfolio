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
      const isRetina = typeof window !== "undefined" && window.devicePixelRatio > 1;

      if (currentStyle === "minimal") {
        if (currentTheme === "light") {
          return {
            url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
            attribution:
              '&copy; <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Esri, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
            maxNativeZoom: isRetina ? 15 : 16,
            maxZoom: 20,
            subdomains: "abc",
            detectRetina: true,
          };
        }
        return {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          attribution:
            '&copy; <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Esri, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
          maxNativeZoom: isRetina ? 15 : 16,
          maxZoom: 20,
          subdomains: "abc",
          detectRetina: true,
        };
      }

      // High-Resolution OpenStreetMap engine with full zoom levels up to 19
      return {
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxNativeZoom: 19,
        maxZoom: 20,
        subdomains: "abc",
        detectRetina: true,
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

    // Create Map instance starting at high-altitude overview with full zoom range 2-20
    const map = L.map(containerRef.current, {
      center: [1.3521, 103.8198],
      zoom: 11,
      zoomControl: false,
      attributionControl: true,
      minZoom: 2,
      maxZoom: 20,
      worldCopyJump: true,
    });

    // Add Initial Basemap TileLayer with native zoom, subdomains, and retina support
    const tileConfig = getTileConfig(theme, mapStyle);
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      subdomains: tileConfig.subdomains || "abc",
      maxZoom: tileConfig.maxZoom || 20,
      maxNativeZoom: tileConfig.maxNativeZoom ?? 16,
      detectRetina: Boolean(tileConfig.detectRetina),
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapRef.current = map;

    // Smooth entrance fly-in zoom into Singapore with desktop sidebar compensation
    if (!hasAnimatedEntry.current) {
      hasAnimatedEntry.current = true;
      setTimeout(() => {
        if (mapRef.current) {
          const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
          const zoom = 12;
          const targetPoint = mapRef.current.project([1.3521, 103.8198], zoom);
          const pixelOffsetX = isDesktop ? -240 : 0;
          const offsetLatLng = mapRef.current.unproject(targetPoint.add([pixelOffsetX, 0]), zoom);

          mapRef.current.flyTo(offsetLatLng, zoom, {
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

  // 2. Seamlessly update TileLayer URL and options when Theme or MapStyle changes
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const tileConfig = getTileConfig(theme, mapStyle);

    const newLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      subdomains: tileConfig.subdomains || "abc",
      maxZoom: tileConfig.maxZoom || 20,
      maxNativeZoom: tileConfig.maxNativeZoom ?? 16,
      detectRetina: Boolean(tileConfig.detectRetina),
    }).addTo(map);

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }
    tileLayerRef.current = newLayer;
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

  // 5. Handle Recenter trigger with sidebar compensation
  React.useEffect(() => {
    const map = mapRef.current;
    if (recenterTrigger > 0 && map) {
      const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
      const zoom = 12;
      const targetPoint = map.project([1.3521, 103.8198], zoom);
      const pixelOffsetX = isDesktop ? -240 : 0;
      const offsetLatLng = map.unproject(targetPoint.add([pixelOffsetX, 0]), zoom);

      map.flyTo(offsetLatLng, zoom, {
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

    // Smart Camera Pan: Zoom-invariant pixel projection offset
    // On desktop: offset camera left by 240px so landmark is centered in open right canvas
    // On mobile: offset camera down by 110px if place panel is open so landmark is centered above bottom sheet
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    const targetZoom = Math.max(map.getZoom(), 14);
    const pixelOffsetX = isDesktop ? -240 : 0;
    const pixelOffsetY = !isDesktop && isPanelOpen ? 110 : 0;

    const targetPoint = map.project([activeLoc.lat, activeLoc.lng], targetZoom);
    const offsetPoint = targetPoint.add([pixelOffsetX, pixelOffsetY]);
    const offsetLatLng = map.unproject(offsetPoint, targetZoom);

    map.flyTo(offsetLatLng, targetZoom, {
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
