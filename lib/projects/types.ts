export type ProjectStatus = "Shipped" | "In progress" | "Archived"

export interface ProjectCaseStudy {
  problem?: string
  approach?: string
  keyTechnicalDecision?: string
  result?: string
  whatIdDoDifferently?: string
  architectureDiagram?: string
}

export interface ProjectMetaItem {
  id: string
  slug: string
  name: string
  repo: string // e.g. "HngWu/Trivia" or "Trivia"
  status: ProjectStatus
  featured: boolean
  description: string
  techStack: string[]
  liveUrl?: string
  githubUrl?: string
  previewImage?: string
  previewVideo?: string
  caseStudy?: ProjectCaseStudy
  language?: string
  topics?: string[]
}

export interface ProjectsMetaData {
  username: string
  featuredOrder: string[]
  projects: ProjectMetaItem[]
}

export interface GitHubRepoStats {
  stars: number
  forks: number
  language: string
  languageColor: string
  lastPushed: string
  description?: string
  topics: string[]
  sparkline?: number[]
}

export interface ProjectItemData extends ProjectMetaItem {
  stars: number
  forks: number
  languageColor: string
  lastPushed: string
  sparkline: number[]
  isLiveGithub?: boolean
}

export type LayoutType = "ring" | "helix" | "grid"

export type SortOption = "featured" | "stars" | "recent"
