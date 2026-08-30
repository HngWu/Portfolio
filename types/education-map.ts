import type { ParsedEducation } from "@/lib/content/portfolio";

export type EducationType = "degree" | "exchange" | "bootcamp" | "workshop" | "conference";

export interface EducationLocation {
  id: string;
  name: string;
  type: EducationType;
  program: string;
  lat: number;
  lng: number;
  startDate: string; // ISO format or "YYYY-MM"
  endDate: string;   // "YYYY-MM" or "Present"
  caption: string;
  gpa?: string;
  honours?: string;
  thumbnail?: string;
  city?: string;
  country?: string;
}

export interface EducationMapProps {
  education?: ParsedEducation[];
  locations?: EducationLocation[];
  initialActiveId?: string;
  height?: number | string;
  className?: string;
  showTimeline?: boolean;
  showLegend?: boolean;
  theme?: "light" | "dark" | "auto";
  onSelectLocation?: (location: EducationLocation) => void;
}

export interface TypeColorConfig {
  bg: string;
  text: string;
  border: string;
  glow: string;
  pinColor: string;
  label: string;
}
