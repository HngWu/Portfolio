import { parseTileContent, parseTileDeepDive } from "@/lib/tiles/schemas"
import type { Database } from "@/types/supabase"
import type { SearchResult } from "@/lib/search"
import { getTilesDb, getDetailedItemsDb } from "@/lib/db"

type Tile = Database["public"]["Tables"]["tiles"]["Row"]

export interface ParsedProject {
  id: string
  slug: string
  name: string
  description: string
  techStack: string[]
  githubUrl: string
  liveUrl: string
  featured: boolean
  notes?: string
}

export interface ParsedExperience {
  id: string
  role: string
  company: string
  date: string
  highlights: string[]
  deepDiveHighlights?: string[]
}

export interface ParsedEducation {
  id: string
  institution: string
  degree: string
  date: string
  gpa: string
  deepDiveDegree?: string
  deepDiveInstitution?: string
  deepDiveDate?: string
  deepDiveGpa?: string
  honours?: string
  lat?: number
  lng?: number
  type?: "degree" | "exchange" | "bootcamp" | "workshop" | "conference"
  city?: string
  country?: string
  caption?: string
  thumbnail?: string
  startDate?: string
  endDate?: string
}

export interface ParsedAward {
  id: string
  name: string
  issuer: string
  date: string
  desc: string
}

export interface ParsedStat {
  id: string
  label: string
  value: string
  deepDiveValue?: string
  deepDiveLabel?: string
}

export interface ParsedSkill {
  id: string
  tags: string[]
}

export interface ParsedContact {
  id: string
  email: string
  github: string
  linkedin: string
  telegram?: string
  timezone?: string
  availability?: string
  pgpKey?: string
}

export interface PortfolioContent {
  hero?: {
    mark: string
    role: string
    description: string
  }
  projects: ParsedProject[]
  experience: ParsedExperience[]
  education: ParsedEducation[]
  awards: ParsedAward[]
  stats: ParsedStat[]
  skills: ParsedSkill[]
  contact?: ParsedContact
}

export const MONTH_MAP: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12"
}

export function parseDateRangeParts(dateRange: string): { startDate: string; endDate: string } {
  if (!dateRange) return { startDate: "2020-01", endDate: "Present" }
  const parts = dateRange.split(/\s*[-–—]\s*/)
  
  const parsePart = (p: string, defaultMonth = "01"): string => {
    if (!p || p.toLowerCase().includes("present")) return "Present"
    const matchMonthYear = p.match(/([a-zA-Z]{3,})\s*(\d{4})/)
    if (matchMonthYear) {
      const monthPrefix = matchMonthYear[1].toLowerCase().slice(0, 3)
      const m = MONTH_MAP[monthPrefix] || defaultMonth
      return `${matchMonthYear[2]}-${m}`
    }
    const matchYear = p.match(/(\d{4})/)
    if (matchYear) {
      return `${matchYear[1]}-${defaultMonth}`
    }
    return p
  }

  const start = parsePart(parts[0], "01")
  const end = parts.length > 1 ? parsePart(parts[1], "12") : "Present"
  return { startDate: start, endDate: end }
}

export const SINGAPORE_INSTITUTION_GEOS: Record<string, { lat: number; lng: number; city: string; country: string; type?: "degree" | "exchange" | "bootcamp" | "workshop" | "conference"; thumbnail?: string }> = {
  "peiying primary school": { lat: 1.4178, lng: 103.8329, city: "Yishun", country: "Singapore", type: "degree", thumbnail: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80" },
  "peiying": { lat: 1.4178, lng: 103.8329, city: "Yishun", country: "Singapore", type: "degree", thumbnail: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80" },
  "chung cheng high school (yishun)": { lat: 1.4230, lng: 103.8340, city: "Yishun", country: "Singapore", type: "degree", thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80" },
  "chung cheng high school": { lat: 1.4230, lng: 103.8340, city: "Yishun", country: "Singapore", type: "degree", thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80" },
  "nanyang polytechnic": { lat: 1.3801, lng: 103.8489, city: "Ang Mo Kio", country: "Singapore", type: "degree", thumbnail: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80" },
  "nyp": { lat: 1.3801, lng: 103.8489, city: "Ang Mo Kio", country: "Singapore", type: "degree", thumbnail: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80" },
  "national university of singapore": { lat: 1.2966, lng: 103.7764, city: "Kent Ridge", country: "Singapore", type: "degree", thumbnail: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80" },
  "nus": { lat: 1.2966, lng: 103.7764, city: "Kent Ridge", country: "Singapore", type: "degree", thumbnail: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80" },
  "nanyang technological university": { lat: 1.3483, lng: 103.6831, city: "Jurong West", country: "Singapore", type: "degree" },
  "ntu": { lat: 1.3483, lng: 103.6831, city: "Jurong West", country: "Singapore", type: "degree" },
  "singapore management university": { lat: 1.2963, lng: 103.8502, city: "Bras Basah", country: "Singapore", type: "degree" },
  "smu": { lat: 1.2963, lng: 103.8502, city: "Bras Basah", country: "Singapore", type: "degree" },
  "singapore polytechnic": { lat: 1.3098, lng: 103.7775, city: "Dover", country: "Singapore", type: "degree" },
  "ngee ann polytechnic": { lat: 1.3323, lng: 103.7747, city: "Clementi", country: "Singapore", type: "degree" },
  "temasek polytechnic": { lat: 1.3533, lng: 103.9329, city: "Tampines", country: "Singapore", type: "degree" },
  "republic polytechnic": { lat: 1.4447, lng: 103.7858, city: "Woodlands", country: "Singapore", type: "degree" },
}

export function resolveEducationGeo(institution: string, degree: string, contentVal: any, deepDiveVal: any) {
  const normInst = (institution || "").trim().toLowerCase()
  const lookup = SINGAPORE_INSTITUTION_GEOS[normInst] || Object.entries(SINGAPORE_INSTITUTION_GEOS).find(([k]) => normInst.includes(k))?.[1]

  const lat = typeof contentVal?.lat === 'number' ? contentVal.lat : (typeof deepDiveVal?.lat === 'number' ? deepDiveVal.lat : lookup?.lat ?? 1.3521)
  const lng = typeof contentVal?.lng === 'number' ? contentVal.lng : (typeof deepDiveVal?.lng === 'number' ? deepDiveVal.lng : lookup?.lng ?? 103.8198)
  const city = contentVal?.city || deepDiveVal?.city || lookup?.city || "Singapore"
  const country = contentVal?.country || deepDiveVal?.country || lookup?.country || "Singapore"
  const type = contentVal?.type || deepDiveVal?.type || lookup?.type || "degree"
  const thumbnail = contentVal?.thumbnail || deepDiveVal?.thumbnail || lookup?.thumbnail || undefined
  const caption = contentVal?.caption || deepDiveVal?.caption || deepDiveVal?.notes || (deepDiveVal?.honours ? `${degree} at ${institution}. Honours: ${deepDiveVal.honours}.` : `${degree} at ${institution}.`)

  return { lat, lng, city, country, type, thumbnail, caption }
}

export function parseTilesToPortfolioContent(tiles: Tile[]): PortfolioContent {
  const content: PortfolioContent = {
    projects: [],
    experience: [],
    education: [],
    awards: [],
    stats: [],
    skills: [],
  }

  for (const tile of tiles) {
    if (tile.is_hidden) continue

    switch (tile.type) {
      case "hero": {
        const parsed = parseTileContent("hero", tile.content)
        if (parsed.ok) {
          content.hero = parsed.data
        }
        break
      }
      case "project": {
        const parsed = parseTileContent("project", tile.content)
        if (parsed.ok) {
          const dd = parseTileDeepDive("project", tile.deep_dive)
          content.projects.push({
            id: tile.id,
            slug: parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, ""),
            name: parsed.data.name,
            description: parsed.data.description,
            techStack: parsed.data.techStack,
            githubUrl: parsed.data.githubUrl,
            liveUrl: parsed.data.liveUrl,
            featured: parsed.data.featured,
            notes: dd.notes,
          })
        }
        break
      }
      case "experience": {
        const parsed = parseTileContent("experience", tile.content)
        if (parsed.ok) {
          const dd = parseTileDeepDive("experience", tile.deep_dive)
          content.experience.push({
            id: tile.id,
            role: parsed.data.role,
            company: parsed.data.company,
            date: parsed.data.date,
            highlights: parsed.data.highlights,
            deepDiveHighlights: dd.highlights,
          })
        }
        break
      }
      case "education": {
        const parsed = parseTileContent("education", tile.content)
        if (parsed.ok) {
          const dd = parseTileDeepDive("education", tile.deep_dive)
          const { startDate, endDate } = parseDateRangeParts(parsed.data.date)
          const geo = resolveEducationGeo(parsed.data.institution, parsed.data.degree, parsed.data, dd)
          content.education.push({
            id: tile.id,
            institution: parsed.data.institution,
            degree: parsed.data.degree,
            date: parsed.data.date,
            gpa: parsed.data.gpa,
            deepDiveDegree: dd.degree,
            deepDiveInstitution: dd.institution,
            deepDiveDate: dd.date,
            deepDiveGpa: dd.gpa,
            honours: dd.honours,
            lat: geo.lat,
            lng: geo.lng,
            type: geo.type,
            city: geo.city,
            country: geo.country,
            caption: geo.caption,
            thumbnail: geo.thumbnail,
            startDate,
            endDate,
          })
        }
        break
      }
      case "award": {
        const parsed = parseTileContent("award", tile.content)
        if (parsed.ok) {
          content.awards.push({
            id: tile.id,
            name: parsed.data.name,
            issuer: parsed.data.issuer,
            date: parsed.data.date,
            desc: parsed.data.desc,
          })
        }
        break
      }
      case "stat": {
        const parsed = parseTileContent("stat", tile.content)
        if (parsed.ok) {
          const dd = parseTileDeepDive("stat", tile.deep_dive)
          content.stats.push({
            id: tile.id,
            label: parsed.data.label,
            value: parsed.data.value,
            deepDiveValue: dd.value,
            deepDiveLabel: dd.label,
          })
        }
        break
      }
      case "skill": {
        const parsed = parseTileContent("skill", tile.content)
        if (parsed.ok) {
          content.skills.push({
            id: tile.id,
            tags: parsed.data.tags,
          })
        }
        break
      }
      case "contact": {
        const parsed = parseTileContent("contact", tile.content)
        if (parsed.ok) {
          const dd = parseTileDeepDive("contact", tile.deep_dive)
          content.contact = {
            id: tile.id,
            email: parsed.data.email,
            github: parsed.data.github,
            linkedin: parsed.data.linkedin,
            telegram: parsed.data.telegram,
            timezone: dd.timezone,
            availability: dd.availability,
            pgpKey: dd.pgpKey,
          }
        }
        break
      }
    }
  }

  return content
}

export async function getPortfolioContent(): Promise<PortfolioContent> {
  const tilesData = getTilesDb()
  const detailedData = getDetailedItemsDb()

  const content = parseTilesToPortfolioContent(tilesData || [])

  // Populate projects, experience, and education from detailed_items if available
  if (detailedData && detailedData.length > 0) {
    content.projects = []
    content.experience = []
    content.education = []

    for (const item of detailedData) {
      switch (item.type) {
        case "project": {
          const contentVal = (item.content || {}) as any
          const deepDiveVal = (item.deep_dive || {}) as any
          content.projects.push({
            id: item.id,
            slug: item.title.toLowerCase().replace(/[^a-z0-9]+/g, ""),
            name: item.title,
            description: item.subtitle || "",
            techStack: contentVal.techStack || contentVal.tech_stack || [],
            githubUrl: contentVal.githubUrl || contentVal.github_url || "",
            liveUrl: contentVal.liveUrl || contentVal.live_url || "",
            featured: contentVal.featured || false,
            notes: deepDiveVal.notes || "",
          })
          break
        }
        case "experience": {
          const contentVal = (item.content || {}) as any
          const deepDiveVal = (item.deep_dive || {}) as any
          content.experience.push({
            id: item.id,
            role: item.title,
            company: item.subtitle || "",
            date: item.date_range || "",
            highlights: contentVal.highlights || [],
            deepDiveHighlights: deepDiveVal.highlights || [],
          })
          break
        }
        case "education": {
          const contentVal = (item.content || {}) as any
          const deepDiveVal = (item.deep_dive || {}) as any
          const institution = item.subtitle || ""
          const degree = item.title
          const dateRange = item.date_range || ""
          const { startDate, endDate } = parseDateRangeParts(dateRange)
          const geo = resolveEducationGeo(institution, degree, contentVal, deepDiveVal)

          content.education.push({
            id: item.id,
            institution,
            degree,
            date: dateRange,
            gpa: contentVal.gpa || "",
            deepDiveDegree: deepDiveVal.degree || undefined,
            deepDiveInstitution: deepDiveVal.institution || undefined,
            deepDiveDate: deepDiveVal.date || undefined,
            deepDiveGpa: deepDiveVal.gpa || undefined,
            honours: deepDiveVal.honours || undefined,
            lat: geo.lat,
            lng: geo.lng,
            type: geo.type,
            city: geo.city,
            country: geo.country,
            caption: geo.caption,
            thumbnail: geo.thumbnail,
            startDate,
            endDate,
          })
          break
        }
      }
    }
  }

  // Sort education chronologically by startDate
  content.education.sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""))

  return content
}

export function getSearchableContent(content: PortfolioContent): SearchResult[] {
  const list: SearchResult[] = [
    { id: "home", title: "Home", description: "The central hub of the portfolio.", path: "/", category: "Navigation" },
    { id: "projects", title: "Projects", description: "Explore the things I've built.", path: "/projects", category: "Navigation" },
    { id: "experience", title: "Experience", description: "Professional career timeline.", path: "/experience", category: "Navigation" },
    { id: "awards", title: "Awards & Honours", description: "Recognitions and scholarships.", path: "/awards", category: "Navigation" },
    { id: "skills", title: "Skills & Technologies", description: "Languages and frameworks.", path: "/skills", category: "Navigation" },
    { id: "education", title: "Education", description: "Academic foundation.", path: "/education", category: "Navigation" },
  ]

  // Add projects
  for (const p of content.projects) {
    list.push({
      id: p.slug,
      title: p.name,
      description: p.description,
      path: `/projects/${p.slug}`,
      category: "Projects",
    })
  }

  // Add experiences (companies)
  for (const e of content.experience) {
    list.push({
      id: e.id,
      title: e.company,
      description: `${e.role} (${e.date})`,
      path: "/experience",
      category: "Experience",
    })
  }

  // Add education
  for (const edu of content.education) {
    list.push({
      id: edu.id,
      title: edu.institution,
      description: `${edu.degree} (${edu.date})`,
      path: "/education",
      category: "Education",
    })
  }

  // Add awards
  for (const a of content.awards) {
    list.push({
      id: a.id,
      title: a.name,
      description: `${a.issuer} (${a.date})`,
      path: "/awards",
      category: "Awards",
    })
  }

  return list
}
