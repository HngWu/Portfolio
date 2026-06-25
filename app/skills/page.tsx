import { DetailShell } from "@/components/detail/DetailShell"
import { GlassCard } from "@/components/ui/GlassCard"
import { Badge } from "@/components/ui/Badge"
import { getPortfolioContent } from "@/lib/content/portfolio"

const CATEGORY_MAP: Record<string, string> = {
  // Languages
  "Java": "Languages",
  "TypeScript": "Languages",
  "JavaScript": "Languages",
  "Python": "Languages",
  "Kotlin": "Languages",
  "C#": "Languages",
  "SQL": "Languages",
  "Solidity": "Languages",

  // Frameworks & Libraries
  "Spring Boot": "Frameworks & Libraries",
  "Next.js": "Frameworks & Libraries",
  "Next.js 16": "Frameworks & Libraries",
  "React": "Frameworks & Libraries",
  "React 19": "Frameworks & Libraries",
  "React.js": "Frameworks & Libraries",
  "Node.js": "Frameworks & Libraries",
  "GSAP": "Frameworks & Libraries",
  "Three.js": "Frameworks & Libraries",
  "TailwindCSS": "Frameworks & Libraries",
  "Vite": "Frameworks & Libraries",
  "ethers.js": "Frameworks & Libraries",

  // Databases & DevOps
  "MariaDB": "Databases & DevOps",
  "MongoDB": "Databases & DevOps",
  "MSSQL": "Databases & DevOps",
  "MySQL": "Databases & DevOps",
  "Redis": "Databases & DevOps",
  "OpenShift": "Databases & DevOps",
  "Jenkins": "Databases & DevOps",
  "Supabase": "Databases & DevOps",
  "Gemini AI": "Databases & DevOps",
}

export default async function SkillsPage() {
  const { skills } = await getPortfolioContent()
  
  // Extract all unique tags
  const tags = Array.from(new Set(skills.flatMap(s => s.tags)))

  // Group tags by category
  const groups: Record<string, string[]> = {
    "Languages": [],
    "Frameworks & Libraries": [],
    "Databases & DevOps": [],
    "Tools & Others": []
  }

  for (const tag of tags) {
    const cat = CATEGORY_MAP[tag] || "Tools & Others"
    groups[cat].push(tag)
  }

  return (
    <DetailShell typeLabel="CAPABILITIES" title="Skills & Technologies" descriptor="Languages, frameworks, tools, and methodologies.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groups).map(([category, items]) => {
          if (items.length === 0) return null
          return (
            <GlassCard key={category} className="p-6">
              <h3 className="text-lg font-medium text-white/90 mb-4">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {items.map(item => (
                  <Badge key={item} variant="lume">{item}</Badge>
                ))}
              </div>
            </GlassCard>
          )
        })}
      </div>
    </DetailShell>
  )
}

