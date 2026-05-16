export interface SearchResult {
  id: string
  title: string
  description: string
  path: string
  category: string
}

export const SEARCHABLE_CONTENT: SearchResult[] = [
  { id: "home", title: "Home", description: "The central hub of the portfolio.", path: "/", category: "Navigation" },
  { id: "projects", title: "Projects", description: "Explore the things I've built.", path: "/projects", category: "Navigation" },
  { id: "experience", title: "Experience", description: "Professional career timeline.", path: "/experience", category: "Navigation" },
  { id: "awards", title: "Awards & Honours", description: "Recognitions and scholarships.", path: "/awards", category: "Navigation" },
  { id: "skills", title: "Skills & Technologies", description: "Languages and frameworks.", path: "/skills", category: "Navigation" },
  { id: "education", title: "Education", description: "Academic foundation.", path: "/education", category: "Navigation" },
  { id: "triviaduel", title: "TriviaDuel", description: "Real-time multiplayer trivia platform using Next.js and Supabase.", path: "/projects/triviaduel", category: "Projects" },
  { id: "secureasset", title: "SecureAsset", description: "Blockchain asset tracking system using Solidity and ethers.js.", path: "/projects/secureasset", category: "Projects" },
  { id: "dbs", title: "DBS Bank", description: "Software Engineer Intern at DBS, worked on internal dashboards.", path: "/experience", category: "Experience" },
]
