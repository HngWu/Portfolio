import { getPortfolioContent } from "@/lib/content/portfolio"
import { EducationMap } from "@/components/education/EducationMap"

export default async function EducationPage() {
  const { education } = await getPortfolioContent()

  return (
    <main className="w-screen h-[100dvh] relative overflow-hidden bg-[#050505]">
      {/* Full-Viewport Interactive Geographic Education Journey Map */}
      <EducationMap education={education} fullViewport={true} />
    </main>
  )
}
