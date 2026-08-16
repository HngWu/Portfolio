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
          content.education.push({
            id: item.id,
            institution: item.subtitle || "",
            degree: item.title,
            date: item.date_range || "",
            gpa: contentVal.gpa || "",
            deepDiveDegree: deepDiveVal.degree || undefined,
            deepDiveInstitution: deepDiveVal.institution || undefined,
            deepDiveDate: deepDiveVal.date || undefined,
            deepDiveGpa: deepDiveVal.gpa || undefined,
            honours: deepDiveVal.honours || undefined,
          })
          break
        }
      }
    }
  }

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
