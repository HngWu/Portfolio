import { createClient } from "@/lib/supabase/server"
import { BentoGrid } from "@/components/bento/BentoGrid"
import { TileRenderer } from "@/components/bento/TileRenderer"
import { EasterEggTile } from "@/components/bento/tiles/EasterEggTile"
import { ViewModeToggle } from "@/components/nav/ViewModeToggle"
import { Database } from "@/types/supabase"

type Tile = Database['public']['Tables']['tiles']['Row']

export default async function Home() {
  const supabase = await createClient()

  // Fetch tiles ordered by order_val
  const { data: tiles, error } = await supabase
    .from("tiles")
    .select("*")
    .order("order_val", { ascending: true })

  if (error) {
    console.error("Error fetching tiles:", error)
  }

  const allTiles = (tiles || []) as Tile[]

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 md:px-8 relative z-10">
      <ViewModeToggle />
      <BentoGrid>
        {allTiles.filter(t => !t.is_hidden && t.type !== 'config').map((tile) => (
          <TileRenderer key={tile.id} tile={tile} />
        ))}
        {/* The EasterEggTile is rendered separately or handled in BentoGrid */}
        {allTiles.find(t => t.type === "easter_egg") && <EasterEggTile />}
      </BentoGrid>
    </main>
  )
}