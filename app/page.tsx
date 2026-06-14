import { createClient } from "@/lib/supabase/server"
import ClientBentoGrid from "@/components/bento/ClientBentoGrid"
import { ViewModeToggle } from "@/components/nav/ViewModeToggle"
import { SearchButton } from "@/components/nav/SearchButton"
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
  const visibleTiles = allTiles.filter(t => !t.is_hidden && t.type !== 'config')
  const showEasterEgg = allTiles.some(t => t.type === 'easter_egg')

  return (
    <main className="min-h-screen flex flex-col justify-center items-center py-20 px-4 md:px-8 relative z-10">
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <SearchButton />
        <ViewModeToggle />
      </div>
      <div className="w-full max-w-[1400px]">
        <ClientBentoGrid initialTiles={visibleTiles} showEasterEgg={showEasterEgg} />
      </div>
    </main>
  )
}