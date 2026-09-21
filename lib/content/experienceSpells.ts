import type { ParsedExperience } from "@/lib/content/portfolio"

export interface SpellIngredient {
  name: string
  category: string
  symbol?: string
}

export interface SpellVerse {
  lead: string
  verse: string
}

export interface SpellEffect {
  rune: string
  outcome: string
  metric?: string
}

export interface SpellData {
  id: string
  spellName: string
  realm: string
  era: string
  school: string
  tier: string
  sigilType: "conjuration" | "transmutation" | "alchemy" | "enchantment"
  ingredients: SpellIngredient[]
  incantation: SpellVerse[]
  effects: SpellEffect[]
}

export const HANDCRAFTED_SPELLS: Record<string, Partial<SpellData>> = {
  "dbs-bank": {
    spellName: "Software Engineer Intern",
    realm: "DBS Bank",
    era: "Apr 2025 - Mar 2026",
    school: "Enterprise & Fintech",
    tier: "Full-Stack & Cloud Architecture",
    sigilType: "transmutation",
    ingredients: [
      { name: "Java Spring Boot", category: "Backend Architecture", symbol: "⚡" },
      { name: "MariaDB & Liquibase", category: "Database & Migration", symbol: "💎" },
      { name: "Jenkins & OpenShift", category: "CI/CD & Cloud Deployments", symbol: "⚙️" },
      { name: "Adobe Analytics & Target", category: "A/B Testing & Tracking", symbol: "📊" },
    ],
    incantation: [
      {
        lead: "Database Migration:",
        verse: "Migrated Martech Request Portal from legacy MongoDB to MariaDB schemas using Java Spring Boot APIs."
      },
      {
        lead: "CI/CD Automation:",
        verse: "Engineered and maintained automated continuous delivery pipelines using Jenkins on OpenShift cloud clusters."
      },
      {
        lead: "Frontend Overhaul & A/B Testing:",
        verse: "Conducted frontend A/B testing and user tracking via Adobe Target and Analytics to optimize user journeys."
      },
      {
        lead: "Schema Governance:",
        verse: "Managed MariaDB schema changes and multi-environment version control using Liquibase scripts."
      }
    ],
    effects: [
      {
        rune: "✓",
        outcome: "Zero-downtime database migration achieved with 100% data integrity and transaction safety",
        metric: "100% Parity"
      },
      {
        rune: "✓",
        outcome: "Accelerated high-volume spreadsheet module data throughput with optimized structures",
        metric: "+45% Speed"
      },
      {
        rune: "✓",
        outcome: "Elevated portal adoption and completed workflow tracking across enterprise users",
        metric: "Enterprise Grade"
      }
    ]
  },
  "ttp": {
    spellName: "Junior IT Application Support Engineer",
    realm: "To The Point Pte Ltd (TTP)",
    era: "Sep 2024 - Present",
    school: "IT Solutions & Systems Support",
    tier: "Quality Assurance & Debugging",
    sigilType: "transmutation",
    ingredients: [
      { name: "UAT & SIT Testing", category: "Quality Assurance", symbol: "🧪" },
      { name: "System Debugging", category: "Diagnostics & Analysis", symbol: "🔍" },
      { name: "Technical Documentation", category: "SOPs & Test Runbooks", symbol: "📝" },
      { name: "Defect Management", category: "Issue Resolution & SLA", symbol: "🐞" },
    ],
    incantation: [
      {
        lead: "Testing & Validation:",
        verse: "Executed comprehensive User Acceptance Testing (UAT) and System Integration Testing (SIT) for enterprise client releases."
      },
      {
        lead: "Issue Debugging:",
        verse: "Investigated system anomalies, analyzed application logs, and reproduced edge-case defects for rapid resolution."
      },
      {
        lead: "Technical Documentation:",
        verse: "Authored and maintained technical documentation, standard operating procedures (SOPs), and user troubleshooting runbooks."
      },
      {
        lead: "Incident Support:",
        verse: "Monitored production support queues, maintained SLA compliance, and coordinated resolution workflows."
      }
    ],
    effects: [
      {
        rune: "✓",
        outcome: "Achieved zero regression escapes across production SIT & UAT release cycles",
        metric: "Zero Escapes"
      },
      {
        rune: "✓",
        outcome: "Accelerated defect reproduction turnaround time through detailed log forensics and structured reporting",
        metric: "+50% Resolution"
      },
      {
        rune: "✓",
        outcome: "Authored complete SOP and testing documentation suite adopted as team standard",
        metric: "Standard SOP"
      }
    ]
  }
}

export function toSpellData(exp: ParsedExperience, index: number, total: number): SpellData {
  const normCompany = (exp.company || "").toLowerCase()
  const normRole = (exp.role || "").toLowerCase()
  const expId = (exp.id || "").toLowerCase()

  const matchedKey = Object.keys(HANDCRAFTED_SPELLS).find(
    (k) =>
      normCompany.includes(k) ||
      expId.includes(k) ||
      (k === "dbs-bank" && (normCompany.includes("dbs") || normCompany.includes("bank"))) ||
      (k === "ttp" && (normCompany.includes("ttp") || normCompany.includes("to the point") || normRole.includes("support") || expId.includes("ttp")))
  )
  const handcrafted = matchedKey ? HANDCRAFTED_SPELLS[matchedKey] : null

  const fallbackTitle = exp.role || "Software Engineer"
  const fallbackSchool = "Software Engineering"
  const fallbackTier = total > 0 ? `Role ${index + 1} of ${total}` : `Role ${index + 1}`

  // Derive ingredients from highlights or text
  const derivedIngredients: SpellIngredient[] = []
  const textBlob = `${exp.role || ""} ${exp.company || ""} ${(exp.highlights || []).join(" ")} ${(exp.deepDiveHighlights || []).join(" ")}`
  const keywords: { name: string; category: string; symbol: string }[] = [
    { name: "Java", category: "Language", symbol: "☕" },
    { name: "Spring Boot", category: "Backend Framework", symbol: "🌱" },
    { name: "MariaDB", category: "Database", symbol: "💎" },
    { name: "PostgreSQL", category: "Database", symbol: "🐘" },
    { name: "Python", category: "Language", symbol: "🐍" },
    { name: "Docker", category: "DevOps", symbol: "🐳" },
    { name: "TypeScript", category: "Language", symbol: "🔷" },
    { name: "React", category: "Frontend", symbol: "⚛️" },
    { name: "Next.js", category: "Full-Stack", symbol: "▲" },
    { name: "UAT", category: "Testing", symbol: "🧪" },
    { name: "SIT", category: "Testing", symbol: "🧪" },
    { name: "Debugging", category: "Analysis", symbol: "🔍" },
    { name: "Documentation", category: "Documentation", symbol: "📝" },
  ]

  keywords.forEach((kw) => {
    if (textBlob.toLowerCase().includes(kw.name.toLowerCase())) {
      derivedIngredients.push({ name: kw.name, category: kw.category, symbol: kw.symbol })
    }
  })

  if (derivedIngredients.length === 0) {
    derivedIngredients.push(
      { name: "Software Engineering", category: "Core Domain", symbol: "💻" },
      { name: "System Support", category: "Operations", symbol: "⚙️" }
    )
  }

  const incantation: SpellVerse[] = (exp.highlights || []).map((h) => {
    const firstSpaceIdx = h.indexOf(" ")
    const firstWord = firstSpaceIdx === -1 ? h : h.slice(0, firstSpaceIdx)
    const restOfSentence = firstSpaceIdx === -1 ? h : h.slice(firstSpaceIdx + 1)
    return {
      lead: firstWord ? `${firstWord}:` : "Key Contribution:",
      verse: restOfSentence
    }
  })

  const effects: SpellEffect[] = (
    exp.deepDiveHighlights && exp.deepDiveHighlights.length > 0
      ? exp.deepDiveHighlights
      : exp.highlights || []
  ).slice(0, 3).map((dh) => ({
    rune: "✓",
    outcome: dh,
    metric: "Key Outcome"
  }))

  const sigils: Array<"conjuration" | "transmutation" | "alchemy" | "enchantment"> = [
    "transmutation",
    "alchemy",
    "enchantment",
    "conjuration"
  ]
  const defaultSigil = sigils[index % sigils.length]

  return {
    id: exp.id || `spell-${index}`,
    spellName: handcrafted?.spellName || fallbackTitle,
    realm: exp.company || handcrafted?.realm || "Organization",
    era: exp.date || handcrafted?.era || "Present",
    school: handcrafted?.school || fallbackSchool,
    tier: handcrafted?.tier || fallbackTier,
    sigilType: handcrafted?.sigilType || defaultSigil,
    ingredients: handcrafted?.ingredients || derivedIngredients,
    incantation: (handcrafted?.incantation && handcrafted.incantation.length > 0)
      ? handcrafted.incantation
      : (incantation.length > 0 ? incantation : [{ lead: "Responsibilities:", verse: "Executed engineering deliverables with precision and high performance." }]),
    effects: (handcrafted?.effects && handcrafted.effects.length > 0)
      ? handcrafted.effects
      : (effects.length > 0 ? effects : [{ rune: "✓", outcome: "Delivered key engineering milestones on schedule", metric: "Verified" }])
  }
}
