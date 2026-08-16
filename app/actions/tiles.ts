"use server"

import { revalidatePath } from "next/cache"
import { Database } from "@/types/supabase"
import {
  getTilesDb,
  updateTileDb,
  updateTilesDb,
  deleteTileDb,
  createTileDb
} from "@/lib/db"

export async function getTiles() {
  return getTilesDb()
}

export async function updateTile(id: string, updates: Partial<Database['public']['Tables']['tiles']['Update']>) {
  updateTileDb(id, updates)
  revalidatePath("/")
  revalidatePath("/admin/tiles")
}

export async function updateTiles(tiles: Database['public']['Tables']['tiles']['Row'][]) {
  try {
    updateTilesDb(tiles)
    revalidatePath("/")
    revalidatePath("/admin/tiles")
  } catch (e) {
    console.error("Server Action updateTiles failed:", e)
    throw e
  }
}

export async function deleteTile(id: string) {
  deleteTileDb(id)
  revalidatePath("/")
  revalidatePath("/admin/tiles")
}

export async function createTile(tile: Database['public']['Tables']['tiles']['Insert']) {
  createTileDb(tile)
  revalidatePath("/")
  revalidatePath("/admin/tiles")
}
