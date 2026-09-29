import { DetailShell } from "@/components/detail/DetailShell"
import { getInitialProjectItems, enrichProjectsWithLiveGitHub } from "@/lib/projects/data"
import { Infinite3DCarousel } from "@/components/projects/Infinite3DCarousel"
import Link from "next/link"

export const metadata = {
  title: "Projects Showcase | HngWu",
  description:
    "Explore an infinite 3D carousel of open-source projects, real-time architectures, and full-stack systems built by HngWu.",
}

export default async function ProjectsPage() {
  const initialProjects = getInitialProjectItems()
  const projects = await enrichProjectsWithLiveGitHub(initialProjects)

  return (
    <DetailShell
      typeLabel="WORK"
      title="Projects Showcase"
      descriptor="An interactive 3D spatial ring of GitHub repositories, real-time architectures, and high-performance systems."
      hideHero
      maxWidth="max-w-[1400px]"
    >
      {/* 
        Semantic HTML crawlability & no-JS fallback list:
        Crawlers and non-JS clients read this clean semantic list while modern browsers
        render the interactive 3D carousel.
      */}
      <noscript>
        <section className="my-8 space-y-4">
          <h2 className="text-xl font-bold text-white">All Projects</h2>
          <ul className="space-y-4">
            {projects.map((p) => (
              <li key={p.id} className="p-4 rounded-xl border border-white/10 bg-white/5">
                <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                <p className="text-sm text-white/70">{p.description}</p>
                <div className="mt-2 flex gap-4 text-xs font-mono text-white/50">
                  <span>Language: {p.language}</span>
                  <span>Status: {p.status}</span>
                  {p.githubUrl && <a href={p.githubUrl} className="underline">Repository</a>}
                  {p.liveUrl && <a href={p.liveUrl} className="underline">Live Demo</a>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </noscript>

      {/* Interactive 3D GitHub Carousel */}
      <Infinite3DCarousel initialProjects={projects} />
    </DetailShell>
  )
}
