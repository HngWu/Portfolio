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
}

export default function EducationMapLeaflet({
  locations,
  activeId,
  onSelectLocation,
  theme = "dark",
}: EducationMapLeafletProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const markersRef = React.useRef<Map<string, L.Marker>>(new Map());
  const polylineRef = React.useRef<L.Polyline | null>(null);
  const tileLayerRef = React.useRef<L.TileLayer | null>(null);

  // Free, no API key required basemap configuration (Esri World Gray Canvas & OpenStreetMap)
  const getTileConfig = React.useCallback((currentTheme: "light" | "dark" | "auto") => {
    if (currentTheme === "light") {
      return {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        attribution:
          '&copy; <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Esri, DeLorme, NAVTEQ, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
        maxZoom: 16,
      };
    }
    // Dark Minimal Basemap for Lume-Glass theme
    return {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      attribution:
        '&copy; <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Esri, DeLorme, NAVTEQ, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
      maxZoom: 16,
    };
  }, []);

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

  // Generate popup HTML for location card
  const createPopupContent = (loc: EducationLocation) => {
    const config = TYPE_CONFIGS[loc.type] || TYPE_CONFIGS.degree;
    const dateRange = formatDateRange(loc.startDate, loc.endDate);

    return `
      <div class="p-4 space-y-3 font-sans text-left">
        ${
          loc.thumbnail
            ? `
          <div class="relative w-full h-28 rounded-lg overflow-hidden mb-2 bg-neutral-900 border border-white/10">
            <img 
              src="${loc.thumbnail}" 
              alt="${loc.name}" 
              class="w-full h-full object-cover" 
              loading="lazy"
              onerror="this.style.display='none'"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div class="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
              <span class="text-[10px] font-mono text-white/90 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10">
                ${loc.city ? `${loc.city}, ` : ""}${loc.country || ""}
              </span>
            </div>
          </div>
        `
            : ""
        }
        
        <div class="flex items-center justify-between gap-2">
          <span 
            class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" 
            style="background-color: ${config.bg}; color: ${config.text}; border: 1px solid ${config.border};"
          >
            ${config.label}
          </span>
          <span class="text-[11px] font-mono text-white/50">${dateRange}</span>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-white/95 leading-snug">${loc.name}</h4>
          <p class="text-xs text-white/70 mt-0.5 leading-tight font-medium">${loc.program}</p>
        </div>

        <p class="text-xs text-white/60 leading-relaxed border-t border-white/10 pt-2.5">
          ${loc.caption}
        </p>
      </div>
    `;
  };

  // Initialize Map
  React.useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Create Map instance centered initially on Singapore
    const map = L.map(containerRef.current, {
      center: [1.3521, 103.8198],
      zoom: 12,
      zoomControl: false,
      attributionControl: true,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true,
    });

    // Add subtle zoom control at top right
    L.control.zoom({ position: "topright" }).addTo(map);

    // Add Free Basemap TileLayer (No API Key required)
    const tileConfig = getTileConfig(theme);
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom || 16,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapRef.current = map;

    // Observe container resize (e.g. fullscreen toggle)
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
  }, [getTileConfig, theme]);

  // Update Tiles when theme changes
  React.useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    const tileConfig = getTileConfig(theme);
    tileLayerRef.current.setUrl(tileConfig.url);
  }, [theme, getTileConfig]);

  // Render Markers and Polyline
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || locations.length === 0) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const latLngs: L.LatLngExpression[] = [];

    // Add Markers
    locations.forEach((loc, index) => {
      const latLng: [number, number] = [loc.lat, loc.lng];
      latLngs.push(latLng);

      const isActive = loc.id === activeId;
      const customIcon = L.divIcon({
        className: "education-div-icon",
        html: createMarkerHtml(loc.type, index, isActive),
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -44],
      });

      const marker = L.marker(latLng, {
        icon: customIcon,
        riseOnHover: true,
        keyboard: true,
        title: `${loc.name} - ${loc.program}`,
      }).addTo(map);

      // Desktop Hover Tooltip
      const dateRange = formatDateRange(loc.startDate, loc.endDate);
      marker.bindTooltip(
        `<div class="font-medium text-white/90">${loc.name}</div><div class="text-[10px] text-white/60 font-mono">${dateRange}</div>`,
        {
          direction: "top",
          offset: [0, -44],
          className: "education-map-tooltip",
          opacity: 0.95,
        }
      );

      // Interactive Popup
      marker.bindPopup(createPopupContent(loc), {
        className: "education-map-popup",
        maxWidth: 320,
        minWidth: 260,
        autoPanPadding: [30, 30],
      });

      // Click Event
      marker.on("click", () => {
        onSelectLocation(loc);
      });

      markersRef.current.set(loc.id, marker);
    });

    // Draw connecting journey polyline
    if (latLngs.length > 1) {
      const polyline = L.polyline(latLngs, {
        color: "#4A8FFF",
        weight: 2.5,
        opacity: 0.85,
        lineCap: "round",
        lineJoin: "round",
        className: "education-journey-path education-journey-path-animated",
      }).addTo(map);

      polylineRef.current = polyline;
    }

    // Fit map bounds to encompass pins or center on Singapore
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, {
        padding: [70, 70],
        maxZoom: 13,
        animate: true,
      });
    }
  }, [locations, onSelectLocation]);

  // Update active marker highlight and map pan when activeId changes
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeId) return;

    const activeLoc = locations.find((l) => l.id === activeId);
    if (!activeLoc) return;

    // Update icons for all markers
    locations.forEach((loc, index) => {
      const marker = markersRef.current.get(loc.id);
      if (marker) {
        const isActive = loc.id === activeId;
        const newIcon = L.divIcon({
          className: "education-div-icon",
          html: createMarkerHtml(loc.type, index, isActive),
          iconSize: [44, 44],
          iconAnchor: [22, 44],
          popupAnchor: [0, -44],
        });
        marker.setIcon(newIcon);

        if (isActive) {
          // Open popup
          if (!marker.isPopupOpen()) {
            marker.openPopup();
          }
        }
      }
    });

    // Smoothly fly to location centered with closer zoom
    map.flyTo([activeLoc.lat, activeLoc.lng], Math.max(map.getZoom(), 13), {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [activeId, locations]);

  return (
    <div className="education-map-container w-full h-full min-h-[350px]">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
