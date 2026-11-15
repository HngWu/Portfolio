export interface SearchResult {
  id: string
  title: string
  description: string
  path: string
  category: string
}

export const SEARCHABLE_CONTENT: SearchResult[] = [
  { id: "home", title: "Home", description: "The central hub and 3D HexCore bento matrix.", path: "/", category: "Navigation" },
  { id: "projects", title: "Projects", description: "Explore featured software engineering projects & case studies.", path: "/projects", category: "Navigation" },
  { id: "experience", title: "Experience", description: "Interactive arcane spellbook career timeline & positions.", path: "/experience", category: "Navigation" },
  { id: "about", title: "About", description: "Background, design philosophy, and technical architecture.", path: "/about", category: "Navigation" },
  { id: "skills", title: "Skills & Technologies", description: "Languages, frameworks, systems, and tools matrix.", path: "/skills", category: "Navigation" },
  { id: "awards", title: "Awards & Honours", description: "Recognitions, hackathons, and academic scholarships.", path: "/awards", category: "Navigation" },
  { id: "education", title: "Education", description: "Academic foundation, degree, and certifications.", path: "/education", category: "Navigation" },
  { id: "cv", title: "Curriculum Vitae", description: "Full executive résumé and downloadable curriculum vitae.", path: "/cv", category: "Navigation" },
  { id: "triviaduel", title: "TriviaDuel", description: "Real-time multiplayer trivia platform using Next.js and Supabase.", path: "/projects/triviaduel", category: "Projects" },
  { id: "secureasset", title: "SecureAsset", description: "Blockchain asset tracking system using Solidity and ethers.js.", path: "/projects/secureasset", category: "Projects" },
  { id: "dbs", title: "DBS Bank", description: "Software Engineer Intern at DBS Bank, internal systems & dashboards.", path: "/experience", category: "Experience" },
]
