"use server"

import { revalidatePath } from "next/cache"
import { getTilesByTypeDb, updateTileDb, createTileDb } from "@/lib/db"

export interface ConfigItem {
  key: string
  value: unknown
}

export async function getConfig(): Promise<ConfigItem[]> {
  const tiles = getTilesByTypeDb("config")
  if (tiles.length === 0) {
    return []
  }

  const content = (tiles[0].content || {}) as Record<string, unknown>
  return Object.entries(content).map(([key, value]) => ({ key, value }))
}

export async function updateConfig(key: string, value: unknown) {
  const tiles = getTilesByTypeDb("config")
  const existing = tiles[0]

  if (existing) {
    const newContent = {
      ...(existing.content as object),
      [key]: value
    } as any
    updateTileDb(existing.id, { content: newContent })
  } else {
    createTileDb({
      type: "config",
      size: "0x0",
      is_hidden: true,
      content: { [key]: value } as any
    })
  }

  revalidatePath("/")
  revalidatePath("/admin/config")
}
