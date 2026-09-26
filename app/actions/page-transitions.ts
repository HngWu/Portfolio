"use server"

import { revalidatePath } from "next/cache"
import { getTilesByType, updateTile, createTile } from "@/lib/db"
import { DEFAULT_PAGE_TRANSITIONS, type PageTransitionRule } from "@/types/transitions"

const CONFIG_KEY = "page_transitions"

export async function getPageTransitions(): Promise<PageTransitionRule[]> {
  try {
    const tiles = await getTilesByType("config")
    if (tiles.length === 0) {
      return DEFAULT_PAGE_TRANSITIONS
    }

    const content = (tiles[0].content || {}) as Record<string, unknown>
    const rules = content[CONFIG_KEY] as PageTransitionRule[] | undefined

    if (!rules || !Array.isArray(rules) || rules.length === 0) {
      return DEFAULT_PAGE_TRANSITIONS
    }

    return rules
  } catch {
    return DEFAULT_PAGE_TRANSITIONS
  }
}

export async function savePageTransitions(rules: PageTransitionRule[]) {
  const tiles = await getTilesByType("config")
  const existing = tiles[0]

  if (existing) {
    const newContent = {
      ...(existing.content as object),
      [CONFIG_KEY]: rules,
    } as any
    await updateTile(existing.id, { content: newContent })
  } else {
    await createTile({
      type: "config",
      size: "0x0",
      is_hidden: true,
      content: { [CONFIG_KEY]: rules } as any,
    })
  }

  revalidatePath("/")
  revalidatePath("/admin/transitions")
  return { success: true }
}

export async function resetPageTransitionsToDefaults() {
  return await savePageTransitions(DEFAULT_PAGE_TRANSITIONS)
}
