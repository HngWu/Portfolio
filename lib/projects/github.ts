import type { GitHubRepoStats } from "./types"

export const GITHUB_LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  "C#": "#178600",
  Kotlin: "#A97BFF",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  Shell: "#89e051",
  C: "#555555",
  "C++": "#f34b7d",
}

export function getLanguageColor(language?: string): string {
  if (!language) return "var(--lume-secondary, #4A8FFF)"
  return GITHUB_LANGUAGE_COLORS[language] || "var(--lume-secondary, #4A8FFF)"
}

interface CacheEntry {
  timestamp: number
  data: GitHubRepoStats
}

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
const serverStatsCache = new Map<string, { timestamp: number; data: GitHubRepoStats }>()

/**
 * Deterministic fallback sparkline generator based on repo name.
 * Generates an aesthetically pleasing 12-point activity curve.
 */
export function generateFallbackSparkline(seedStr: string): number[] {
  let hash = 0
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i)
    hash |= 0
  }
  const points: number[] = []
  let val = Math.abs(hash % 10) + 5
  for (let i = 0; i < 12; i++) {
    const delta = ((Math.sin(i * 0.9 + hash) + Math.cos(i * 1.4)) * 3) | 0
    val = Math.max(2, Math.min(20, val + delta))
    points.push(val)
  }
  return points
}

/**
 * Fetch GitHub repository stats with client-side localStorage caching and resilient fallback.
 */
export async function fetchGitHubRepoStats(
  repoFullName: string,
  fallbackLanguage = "TypeScript"
): Promise<GitHubRepoStats> {
  const normalizedRepo = repoFullName.replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "")
  const cacheKey = `gh_repo_cache_${normalizedRepo.replace("/", "_")}`

  // 1. Try reading from server-side memory cache
  const serverCached = serverStatsCache.get(normalizedRepo)
  if (serverCached && Date.now() - serverCached.timestamp < CACHE_TTL_MS) {
    return serverCached.data
  }

  // 2. Try reading from localStorage cache if in browser
  if (typeof window !== "undefined") {
    try {
      const cached = window.localStorage.getItem(cacheKey)
      if (cached) {
        const parsed: CacheEntry = JSON.parse(cached)
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          return parsed.data
        }
      }
    } catch {
      // Ignore localStorage errors (e.g. private browsing quota)
    }
  }

  // 3. Attempt fetching from GitHub REST API with 1-hour ISR revalidation
  try {
    const response = await fetch(`https://api.github.com/repos/${normalizedRepo}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 3600 },
    })

    if (response.ok) {
      const data = await response.json()
      const lang = data.language || fallbackLanguage
      const stats: GitHubRepoStats = {
        stars: Number(data.stargazers_count) || 0,
        forks: Number(data.forks_count) || 0,
        language: lang,
        languageColor: getLanguageColor(lang),
        lastPushed: data.pushed_at || new Date().toISOString(),
        description: data.description || undefined,
        topics: Array.isArray(data.topics) ? data.topics : [],
        sparkline: generateFallbackSparkline(normalizedRepo),
      }

      // Cache the successful response on server
      serverStatsCache.set(normalizedRepo, { timestamp: Date.now(), data: stats })

      // Cache the successful response on client
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            cacheKey,
            JSON.stringify({ timestamp: Date.now(), data: stats })
          )
        } catch {
          // Ignore cache write errors
        }
      }

      return stats
    }
  } catch {
    // Offline or network error: gracefully proceed to fallback
  }

  // 4. Fallback when network failed or rate-limited
  const fallbackStats: GitHubRepoStats = {
    stars: 1,
    forks: 0,
    language: fallbackLanguage,
    languageColor: getLanguageColor(fallbackLanguage),
    lastPushed: new Date().toISOString(),
    topics: [],
    sparkline: generateFallbackSparkline(normalizedRepo),
  }

  // Cache fallback briefly (5 minutes) to avoid repeated rate-limit timeouts
  serverStatsCache.set(normalizedRepo, { timestamp: Date.now() - (CACHE_TTL_MS - 5 * 60 * 1000), data: fallbackStats })

  return fallbackStats
}
