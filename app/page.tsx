import { createClient } from "@/lib/supabase/server"
import { BentoGrid } from "@/components/bento/BentoGrid"
import { ProjectTile } from "@/components/bento/tiles/ProjectTile"
import { ExperienceTile } from "@/components/bento/tiles/ExperienceTile"
import { StatTile } from "@/components/bento/tiles/StatTile"
import { Hero3DTile } from "@/components/bento/tiles/Hero3DTile"
import { TerminalTile } from "@/components/bento/tiles/TerminalTile"
import { EasterEggTile } from "@/components/bento/tiles/EasterEggTile"
import { ViewModeToggle } from "@/components/nav/ViewModeToggle"
import { Badge } from "@/components/ui/Badge"
import { BentoTile } from "@/components/bento/BentoTile"
import { Database } from "@/types/supabase"

type Tile = Database['public']['Tables']['tiles']['Row']

export default async function Home() {
  const supabase = await createClient()
  
  // Fetch tiles and projects in parallel
  const [tilesResponse, projectsResponse] = await Promise.all([
    supabase.from("tiles").select("*").order("order_val", { ascending: true }),
    supabase.from("projects").select("*")
  ])

  const tiles = (tilesResponse.data || []) as Tile[]
  const projects = projectsResponse.data || []

  // Helper to render tile based on type
  const renderTile = (tile: Tile) => {
    const content = tile.content as Record<string, unknown>
    switch (tile.type) {
      case "hero":
        return (
          <BentoTile key={tile.id} id={tile.id} size={tile.size} className="bg-white/[0.02] border border-white/5 p-8 flex flex-col justify-center">
            <div className="text-[0.6875rem] font-mono tracking-widest text-lume-primary uppercase mb-4">{content.role as string}</div>
            <h1 className="text-5xl md:text-7xl font-display text-white/90 leading-tight">{content.mark as string}</h1>
            <p className="mt-6 text-white/50 max-w-md">{content.description as string}</p>
          </BentoTile>
        )
      case "3d":
        return <Hero3DTile key={tile.id} id={tile.id} size={tile.size} />
      case "project":
        const project = projects.find(p => p.tile_id === tile.id)
        if (!project) return null
        return (
          <ProjectTile 
            key={tile.id}
            id={project.id} 
            size={tile.size} 
            name={project.name} 
            description={project.description}
            tags={project.tech_stack}
            deepDiveContent={project.deep_dive?.notes}
          />
        )
      case "experience":
        return (
          <ExperienceTile
            key={tile.id}
            id={tile.id}
            size={tile.size}
            role={content.role as string}
            company={content.company as string}
            date={content.date as string}
            bullets={content.bullets as string[]}
          />
        )
      case "education":
        return (
          <BentoTile key={tile.id} id={tile.id} size={tile.size} href="/education" glowColor="blue">
             <div className="text-[0.6875rem] font-mono text-white/30 uppercase mb-4 text-left">Education</div>
             <h3 className="text-xl font-display text-white/90 mb-1">{content.institution as string}</h3>
             <p className="text-sm text-white/50">{content.degree as string}</p>
             <div className="mt-auto pt-4 flex justify-between items-end">
                <span className="text-xs font-mono text-white/30">{content.date as string}</span>
                <span className="text-2xl font-mono text-lume-primary">{content.gpa as string}</span>
             </div>
          </BentoTile>
        )
      case "terminal":
        return <TerminalTile key={tile.id} id={tile.id} size={tile.size} />
      case "stat":
        return <StatTile key={tile.id} id={tile.id} size={tile.size} value={content.value as string} label={content.label as string} />
      case "skill":
        return (
          <BentoTile key={tile.id} id={tile.id} size={tile.size} href="/skills" glowColor="blue">
            <div className="text-[0.6875rem] font-mono text-white/30 uppercase mb-4">Capabilities</div>
            <div className="flex flex-wrap gap-2">
              {(content.tags as string[]).map((tag: string) => (
                <Badge key={tag} variant="lume">{tag}</Badge>
              ))}
            </div>
          </BentoTile>
        )
      case "award":
        return (
          <BentoTile key={tile.id} id={tile.id} size={tile.size} href="/awards" glowColor="amber" className="border-l-2 border-l-[var(--lume-warm)]/50">
            <h3 className="text-lg font-medium text-white/90 leading-tight">{content.name as string}</h3>
            <p className="text-xs font-mono text-white/40 mt-2">{content.issuer as string} · {content.date as string}</p>
            <p className="text-sm text-white/60 mt-4 line-clamp-2">{content.desc as string}</p>
          </BentoTile>
        )
      case "contact":
        return (
          <BentoTile key={tile.id} id={tile.id} size={tile.size} className="justify-between">
            <div className="text-[0.6875rem] font-mono text-white/30 uppercase mb-4">Contact</div>
            <div className="text-xl font-medium text-white/90 break-all">{content.email as string}</div>
            <div className="flex gap-4 mt-6">
              <a href={content.github as string} target="_blank" className="text-white/40 hover:text-lume-primary transition-colors font-mono text-xs">GitHub</a>
              <a href={content.linkedin as string} target="_blank" className="text-white/40 hover:text-lume-primary transition-colors font-mono text-xs">LinkedIn</a>
            </div>
          </BentoTile>
        )
      case "easter_egg":
        return <EasterEggTile key={tile.id} />
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 md:px-8 relative z-10">
      <ViewModeToggle />
      <BentoGrid>
        {tiles.filter(t => !t.is_hidden).map(renderTile)}
        {/* The EasterEggTile is rendered separately or handled in BentoGrid */}
        {tiles.find(t => t.type === "easter_egg") && <EasterEggTile />}
      </BentoGrid>
    </main>
  )
}