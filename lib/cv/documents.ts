export type DocumentCategory =
  | "resume"
  | "hackathons"
  | "scholarships"
  | "honours"
  | "grades"

export type DocumentFormat = "pdf" | "docx"

export interface VaultDocument {
  id: string
  title: string
  subtitle: string
  filename: string
  url: string
  category: DocumentCategory
  format: DocumentFormat
  sizeLabel: string
  date?: string
  badge?: string
  previewPages?: string[]
}

export interface DocumentFolder {
  id: DocumentCategory
  name: string
  iconType: "resume" | "hackathons" | "scholarships" | "honours" | "grades"
  documents: VaultDocument[]
}

export const VAULT_DOCUMENTS: VaultDocument[] = [
  // Primary Resume
  {
    id: "resume",
    title: "Curriculum Vitae",
    subtitle: "Official Resume & Technical Profile",
    filename: "resume.pdf",
    url: "/resume.pdf",
    category: "resume",
    format: "pdf",
    sizeLabel: "145 KB",
    badge: "Primary",
  },

  // Competitions & Hackathons
  {
    id: "world-skills-cert",
    title: "WorldSkills Singapore 2025",
    subtitle: "Silver Medalist — Web Technologies & IT",
    filename: "World Skills Cert.pdf",
    url: "/Awards/World Skills Cert.pdf",
    category: "hackathons",
    format: "pdf",
    sizeLabel: "289 KB",
    date: "2025",
    badge: "Silver Medal",
  },
  {
    id: "polyfintech-hackathon",
    title: "PolyFintech 100 API Hackathon",
    subtitle: "Fintech Innovation & API Engineering Award",
    filename: "PolyFintech Hackathon.pdf",
    url: "/Awards/PolyFintech Hackathon.pdf",
    category: "hackathons",
    format: "pdf",
    sizeLabel: "139 KB",
    date: "2024",
    badge: "Hackathon",
  },
  {
    id: "certificates-of-appreciation",
    title: "Certificate of Appreciation",
    subtitle: "WorldSkills ASEAN & National Representation",
    filename: "Tan Hng Wu_Certificates of Appreciation.pdf",
    url: "/Awards/Tan Hng Wu_Certificates of Appreciation.pdf",
    category: "hackathons",
    format: "pdf",
    sizeLabel: "681 KB",
    badge: "National",
  },

  // Scholarships & Testimonials
  {
    id: "ngee-ann-kong-si",
    title: "Ngee Ann Kongsi Scholarship",
    subtitle: "Tertiary Merit Scholarship Certificate",
    filename: "Ngee Ann Kong Si Certificate.pdf",
    url: "/Awards/Ngee Ann Kong Si Certificate.pdf",
    category: "scholarships",
    format: "pdf",
    sizeLabel: "227 KB",
    badge: "Scholarship",
  },
  {
    id: "testimonial-tan-hng-wu",
    title: "Testimonial (DBS)",
    subtitle: "Character, Leadership & Technical Commendation",
    filename: "Testimonial for Hng Wu Tan.pdf",
    url: "/Awards/Testimonial for Hng Wu Tan.pdf",
    category: "scholarships",
    format: "pdf",
    sizeLabel: "376 KB",
    badge: "Testimonial",
  },

  // Director's Honours Lists
  {
    id: "directors-list-2024-sem1",
    title: "Director's Honour List — 24/25 Sem 1",
    subtitle: "Academic Excellence Top Tier Standing",
    filename: "2024-2025 Sem 1.pdf",
    url: "/Awards/2024-2025 Sem 1.pdf",
    category: "honours",
    format: "pdf",
    sizeLabel: "273 KB",
    date: "2024-2025",
    badge: "Honours",
  },
  {
    id: "directors-list-2023-sem2",
    title: "Director's Honour List — 23/24 Sem 2",
    subtitle: "Academic Excellence Top Tier Standing",
    filename: "2023-2024 Sem 2.pdf",
    url: "/Awards/2023-2024 Sem 2.pdf",
    category: "honours",
    format: "pdf",
    sizeLabel: "276 KB",
    date: "2023-2024",
    badge: "Honours",
  },

  // Academic Records & Transcripts
  {
    id: "nyp-results",
    title: "NYP Official Transcript",
    subtitle: "Diploma in IT with Merit Cumulative Results",
    filename: "NYP results.pdf",
    url: "/Grades/NYP results.pdf",
    category: "grades",
    format: "pdf",
    sizeLabel: "292 KB",
    badge: "GPA 3.91",
  },
]

export const VAULT_FOLDERS: DocumentFolder[] = [
  {
    id: "resume",
    name: "Curriculum Vitae",
    iconType: "resume",
    documents: VAULT_DOCUMENTS.filter((d) => d.category === "resume"),
  },
  {
    id: "hackathons",
    name: "Competitions & Hackathons",
    iconType: "hackathons",
    documents: VAULT_DOCUMENTS.filter((d) => d.category === "hackathons"),
  },
  {
    id: "scholarships",
    name: "Scholarships & Testimonials",
    iconType: "scholarships",
    documents: VAULT_DOCUMENTS.filter((d) => d.category === "scholarships"),
  },
  {
    id: "honours",
    name: "Director's Honours Lists",
    iconType: "honours",
    documents: VAULT_DOCUMENTS.filter((d) => d.category === "honours"),
  },
  {
    id: "grades",
    name: "Academic Credentials",
    iconType: "grades",
    documents: VAULT_DOCUMENTS.filter((d) => d.category === "grades"),
  },
]

export interface VaultFileSetting {
  id: string
  visible: boolean
  order: number
}

export interface VaultFolderSetting {
  id: DocumentCategory
  visible: boolean
  order: number
  files: VaultFileSetting[]
}

export interface VaultConfig {
  folders: VaultFolderSetting[]
}

export function getDefaultVaultConfig(): VaultConfig {
  return {
    folders: VAULT_FOLDERS.map((folder, folderIdx) => ({
      id: folder.id,
      visible: true,
      order: folderIdx + 1,
      files: folder.documents.map((doc, docIdx) => ({
        id: doc.id,
        visible: true,
        order: docIdx + 1,
      })),
    })),
  }
}

export function applyVaultConfig(
  baseFolders: DocumentFolder[],
  config?: VaultConfig | null
): DocumentFolder[] {
  if (!config || !Array.isArray(config.folders) || config.folders.length === 0) {
    return baseFolders
  }

  const folderMap = new Map(baseFolders.map((f) => [f.id, f]))
  const docMap = new Map(VAULT_DOCUMENTS.map((d) => [d.id, d]))

  // Sort folder settings by order
  const sortedFolderSettings = [...config.folders].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const resultFolders: DocumentFolder[] = []

  for (const fSetting of sortedFolderSettings) {
    // If folder is hidden, skip it completely
    if (fSetting.visible === false) continue

    const baseFolder = folderMap.get(fSetting.id)
    if (!baseFolder) continue

    // Sort files within folder
    const sortedFileSettings = [...(fSetting.files || [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    )

    const folderDocs: VaultDocument[] = []
    for (const fileSetting of sortedFileSettings) {
      if (fileSetting.visible === false) continue
      const doc = docMap.get(fileSetting.id)
      if (doc) {
        folderDocs.push(doc)
      }
    }

    // Only include folder if it has visible documents or it's not hidden
    if (folderDocs.length > 0) {
      resultFolders.push({
        ...baseFolder,
        documents: folderDocs,
      })
    }
  }

  return resultFolders.length > 0 ? resultFolders : baseFolders
}

