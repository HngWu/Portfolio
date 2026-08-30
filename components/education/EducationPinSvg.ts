import type { EducationType, TypeColorConfig } from "@/types/education-map";

export const TYPE_CONFIGS: Record<EducationType, TypeColorConfig> = {
  degree: {
    bg: "rgba(74, 143, 255, 0.15)",
    text: "#4A8FFF",
    border: "rgba(74, 143, 255, 0.5)",
    glow: "rgba(74, 143, 255, 0.4)",
    pinColor: "#4A8FFF",
    label: "Degree",
  },
  exchange: {
    bg: "rgba(168, 85, 247, 0.15)",
    text: "#A855F7",
    border: "rgba(168, 85, 247, 0.5)",
    glow: "rgba(168, 85, 247, 0.4)",
    pinColor: "#A855F7",
    label: "Exchange",
  },
  bootcamp: {
    bg: "rgba(255, 180, 74, 0.15)",
    text: "#FFB44A",
    border: "rgba(255, 180, 74, 0.5)",
    glow: "rgba(255, 180, 74, 0.4)",
    pinColor: "#FFB44A",
    label: "Bootcamp",
  },
  workshop: {
    bg: "rgba(74, 255, 180, 0.15)",
    text: "#4AFFB4",
    border: "rgba(74, 255, 180, 0.5)",
    glow: "rgba(74, 255, 180, 0.4)",
    pinColor: "#4AFFB4",
    label: "Workshop",
  },
  conference: {
    bg: "rgba(45, 212, 191, 0.15)",
    text: "#2DD4BF",
    border: "rgba(45, 212, 191, 0.5)",
    glow: "rgba(45, 212, 191, 0.4)",
    pinColor: "#2DD4BF",
    label: "Conference",
  },
};

export function getTypeIconSvg(type: EducationType): string {
  switch (type) {
    case "degree":
      // Graduation cap icon
      return `<path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    case "exchange":
      // Compass / Arrows icon
      return `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor"/>`;
    case "bootcamp":
      // Terminal / Code bracket icon
      return `<polyline points="16 18 22 12 16 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><polyline points="8 6 2 12 8 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    case "workshop":
      // Sparkle / Lightbulb icon
      return `<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>`;
    case "conference":
      // Presentation / Users icon
      return `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>`;
    default:
      return `<circle cx="12" cy="12" r="4" fill="currentColor"/>`;
  }
}

export function createMarkerHtml(
  type: EducationType,
  index: number,
  isActive: boolean = false
): string {
  const config = TYPE_CONFIGS[type] || TYPE_CONFIGS.degree;
  const pinColor = config.pinColor;
  const glowColor = config.glow;
  const innerIcon = getTypeIconSvg(type);

  return `
    <div class="education-custom-marker ${isActive ? "is-active" : ""}" data-type="${type}" style="--pin-color: ${pinColor}; --glow-color: ${glowColor};">
      <div class="marker-pulse-ring"></div>
      <div class="marker-pin-body">
        <div class="marker-index-badge">${index + 1}</div>
        <div class="marker-icon-wrapper">
          <svg viewBox="0 0 24 24" class="marker-svg-icon" style="color: ${pinColor};">
            ${innerIcon}
          </svg>
        </div>
      </div>
      <div class="marker-pointer"></div>
    </div>
  `;
}
