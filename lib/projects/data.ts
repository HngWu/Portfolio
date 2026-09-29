import rawProjectsMeta from "@/data/projects.meta.json"
import type { ProjectsMetaData, ProjectItemData } from "./types"
import { fetchGitHubRepoStats, getLanguageColor, generateFallbackSparkline } from "./github"

const metaData = rawProjectsMeta as ProjectsMetaData

/**
 * Returns initial synchronous project items mapped from projects.meta.json.
 * Safe for server components and initial client hydration.
 */
export function getInitialProjectItems(): ProjectItemData[] {
  const featuredSet = new Set(metaData.featuredOrder)

  const items: ProjectItemData[] = metaData.projects.map((meta) => {
    const lang = meta.language || "TypeScript"
    return {
      ...meta,
      stars: 0,
      forks: 0,
      language: lang,
      languageColor: getLanguageColor(lang),
      lastPushed: new Date().toISOString(),
      sparkline: generateFallbackSparkline(meta.repo),
      isLiveGithub: false,
    }
  })

  // Sort: featured items first in specified featuredOrder
  return items.sort((a, b) => {
    const aFeatured = featuredSet.has(a.id)
    const bFeatured = featuredSet.has(b.id)
    if (aFeatured && !bFeatured) return -1
    if (!aFeatured && bFeatured) return 1
    if (aFeatured && bFeatured) {
      return metaData.featuredOrder.indexOf(a.id) - metaData.featuredOrder.indexOf(b.id)
    }
    return 0
  })
}

/**
 * Asynchronously enriches project items with live or cached GitHub metrics.
 */
export async function enrichProjectsWithLiveGitHub(
  items: ProjectItemData[]
): Promise<ProjectItemData[]> {
  const enriched = await Promise.all(
    items.map(async (item) => {
      try {
        const stats = await fetchGitHubRepoStats(item.repo, item.language)
        return {
          ...item,
          stars: stats.stars,
          forks: stats.forks,
          language: stats.language || item.language,
          languageColor: stats.languageColor || getLanguageColor(item.language),
          lastPushed: stats.lastPushed,
          topics: stats.topics.length > 0 ? stats.topics : (item.topics || []),
          description: stats.description || item.description,
          sparkline: stats.sparkline || item.sparkline,
          isLiveGithub: true,
        }
      } catch {
        return item
      }
    })
  )

  return enriched
}
