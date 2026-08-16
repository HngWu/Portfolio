"use server"

import { revalidatePath } from "next/cache"
import { Database } from "@/types/supabase"
import {
  getDetailedItemsDb,
  getDetailedItemByIdDb,
  getDetailedItemsByTypeDb,
  createDetailedItemDb,
  updateDetailedItemDb,
  deleteDetailedItemDb
} from "@/lib/db"

export type DetailedItemRow = Database['public']['Tables']['detailed_items']['Row']
export type DetailedItemInsert = Database['public']['Tables']['detailed_items']['Insert']
export type DetailedItemUpdate = Database['public']['Tables']['detailed_items']['Update']

export async function getDetailedItems(type?: string): Promise<DetailedItemRow[]> {
  if (type && type !== "all") {
    return getDetailedItemsByTypeDb(type)
  }
  return getDetailedItemsDb()
}

export async function getDetailedItem(id: string): Promise<DetailedItemRow | null> {
  return getDetailedItemByIdDb(id)
}

export async function createDetailedItem(item: DetailedItemInsert): Promise<DetailedItemRow> {
  const created = createDetailedItemDb(item)
  revalidatePath("/")
  revalidatePath("/admin/detailed-items")
  return created
}

export async function updateDetailedItem(id: string, updates: DetailedItemUpdate): Promise<DetailedItemRow> {
  const updated = updateDetailedItemDb(id, updates)
  revalidatePath("/")
  revalidatePath("/admin/detailed-items")
  return updated
}

export async function deleteDetailedItem(id: string): Promise<void> {
  deleteDetailedItemDb(id)
  revalidatePath("/")
  revalidatePath("/admin/detailed-items")
}
