import { getPortfolioContent } from "@/lib/content/portfolio"
import { ExperienceSpellbook } from "@/components/experience/ExperienceSpellbook"

export default async function ExperiencePage() {
  const { experience } = await getPortfolioContent()

  return (
    <main className="w-screen h-[100dvh] relative overflow-hidden bg-[#050505] flex flex-col justify-center items-center select-none">
      {/* Immersive 3D Experience Book Highlight */}
      <div className="w-full h-full flex flex-col justify-center items-center px-3 sm:px-6 md:px-10 py-3 sm:py-5">
        <ExperienceSpellbook experienceList={experience} />
      </div>
    </main>
  )
}
