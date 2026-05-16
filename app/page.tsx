import { BentoGrid } from "@/components/bento/BentoGrid"
import { ProjectTile } from "@/components/bento/tiles/ProjectTile"
import { ExperienceTile } from "@/components/bento/tiles/ExperienceTile"
import { StatTile } from "@/components/bento/tiles/StatTile"
import { ViewModeToggle } from "@/components/nav/ViewModeToggle"

export default async function Home() {
  // In a full implementation, we fetch from Supabase here.
  // For Phase 2 validation, we'll mount the grid with sample data based on DESIGN.md
  
  return (
    <main className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <ViewModeToggle />
      
      <BentoGrid>
        {/* Hero Tile Placeholder (6x4) */}
        <div className="col-span-2 row-span-4 md:col-span-6 xl:col-span-6 bg-white/[0.02] border border-white/5 rounded-2xl p-8 flex flex-col justify-center">
          <div className="text-[0.6875rem] font-mono tracking-widest text-[#4AFFB4] uppercase mb-4">Creative Developer</div>
          <h1 className="text-5xl md:text-7xl font-display text-white/90 leading-tight">HW</h1>
          <p className="mt-6 text-white/50 max-w-md">Bridging the gap between engineering and aesthetic design. Dark minimalist, cinematic UX.</p>
        </div>

        <ProjectTile 
          id="triviaduel" 
          size="4x3" 
          name="TriviaDuel" 
          description="Real-time multiplayer trivia platform with resilient AI question generation."
          deepDiveContent="Architected with Next.js App Router and Supabase Realtime for sub-100ms latency across 5 global edge regions."
          tags={["Next.js", "Supabase", "WebSockets", "Tailwind", "OpenAI"]}
        />

        <ExperienceTile
          id="dbs"
          size="4x2"
          role="Software Engineer Intern"
          company="DBS Bank"
          date="2024 - Present"
          bullets={[
            "Engineered internal dashboard for transaction monitoring.",
            "Reduced load times by 40% using React Server Components.",
            "Collaborated directly with UX researchers for accessibility.",
            "Wrote comprehensive unit tests yielding 95% coverage."
          ]}
        />

        <StatTile id="gpa" size="1x1" value="3.91" label="GPA" />
        <StatTile id="exp" size="1x1" value="1yr" label="Experience" />
        <StatTile id="proj" size="1x1" value="12+" label="Projects" />
      </BentoGrid>
    </main>
  )
}
