import { DetailShell } from "@/components/detail/DetailShell"
import { getPortfolioContent } from "@/lib/content/portfolio"
import { ExperienceScrollyContainer } from "@/components/experience/ExperienceScrollyContainer"

export default async function ExperiencePage() {
  const { experience } = await getPortfolioContent()

  return (
    <DetailShell
      typeLabel="CAREER"
      title="Experience"
      descriptor="Cinematic journey through my professional engineering roles."
    >
      <ExperienceScrollyContainer experienceList={experience} />
    </DetailShell>
  )
}
