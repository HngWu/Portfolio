"use server"

import { revalidatePath } from "next/cache"
import { Database } from "@/types/supabase"
import {
  getTiles as getTilesFromDb,
  updateTile as updateTileInDb,
  updateTiles as updateTilesInDb,
  deleteTile as deleteTileFromDb,
  createTile as createTileInDb
} from "@/lib/db"

export async function getTiles() {
  return getTilesFromDb()
}

export async function updateTile(id: string, updates: Partial<Database['public']['Tables']['tiles']['Update']>) {
  await updateTileInDb(id, updates)
  revalidatePath("/")
  revalidatePath("/admin/tiles")
}

export async function updateTiles(tiles: Database['public']['Tables']['tiles']['Row'][]) {
  try {
    await updateTilesInDb(tiles)
    revalidatePath("/")
    revalidatePath("/admin/tiles")
  } catch (e) {
    console.error("Server Action updateTiles failed:", e)
    throw e
  }
}

export async function deleteTile(id: string) {
  await deleteTileFromDb(id)
  revalidatePath("/")
  revalidatePath("/admin/tiles")
}

export async function createTile(tile: Database['public']['Tables']['tiles']['Insert']) {
  await createTileInDb(tile)
  revalidatePath("/")
  revalidatePath("/admin/tiles")
}
