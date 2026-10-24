import ClientBentoGrid from "@/components/bento/ClientBentoGrid"
import { getTiles } from "@/lib/db"

export const revalidate = 3600

type Tile = Awaited<ReturnType<typeof getTiles>>[number]

export default async function Home() {
  let visibleTiles: Tile[] = []
  let showEasterEgg = false
  let hasError = false

  try {
    const tiles = await getTiles()
    visibleTiles = tiles.filter(t => !t.is_hidden && t.type !== 'config')
    showEasterEgg = tiles.some(t => t.type === 'easter_egg')
  } catch (error) {
    console.error("Error fetching tiles from database:", error)
    hasError = true
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-lg text-center space-y-4">
          <h2 className="text-xl font-display text-white/90">Database Connection Issue</h2>
          <p className="text-sm text-white/50 leading-relaxed">
            We encountered an error while retrieving the grid content from the database.
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center py-20 px-4 md:px-8 relative z-10">
      <div className="w-full max-w-[1400px]">
        <ClientBentoGrid initialTiles={visibleTiles} showEasterEgg={showEasterEgg} />
      </div>
    </main>
  )
}
