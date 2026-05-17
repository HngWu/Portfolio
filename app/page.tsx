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
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-lg text-center space-y-4">
          <h2 className="text-xl font-display text-white/90">Database Connection Issue</h2>
          <p className="text-sm text-white/50 leading-relaxed">
            We encountered an error while retrieving the grid content. Please ensure your Supabase tables are initialized and environment variables are set correctly in Vercel.
          </p>
          <div className="pt-4 font-mono text-[10px] text-red-400 uppercase tracking-widest">
            Code: {error.code || 'UNKNOWN_ERROR'}
          </div>
        </div>
      </div>
    )
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