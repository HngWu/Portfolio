"use server"

import { revalidatePath } from "next/cache"
import { Database } from "@/types/supabase"
import {
  getDetailedItems as getDetailedItemsFromDb,
  getDetailedItemById as getDetailedItemByIdFromDb,
  createDetailedItem as createDetailedItemInDb,
  updateDetailedItem as updateDetailedItemInDb,
  deleteDetailedItem as deleteDetailedItemFromDb
} from "@/lib/db"

export type DetailedItemRow = Database['public']['Tables']['detailed_items']['Row']
export type DetailedItemInsert = Database['public']['Tables']['detailed_items']['Insert']
export type DetailedItemUpdate = Database['public']['Tables']['detailed_items']['Update']

export async function getDetailedItems(type?: string): Promise<DetailedItemRow[]> {
  return getDetailedItemsFromDb(type)
}

export async function getDetailedItem(id: string): Promise<DetailedItemRow | null> {
  return getDetailedItemByIdFromDb(id)
}

export async function createDetailedItem(item: DetailedItemInsert): Promise<DetailedItemRow> {
  const created = await createDetailedItemInDb(item)
  revalidatePath("/")
  revalidatePath("/admin/detailed-items")
  return created
}

export async function updateDetailedItem(id: string, updates: DetailedItemUpdate): Promise<DetailedItemRow> {
  const updated = await updateDetailedItemInDb(id, updates)
  revalidatePath("/")
  revalidatePath("/admin/detailed-items")
  return updated
}

export async function deleteDetailedItem(id: string): Promise<void> {
  await deleteDetailedItemFromDb(id)
  revalidatePath("/")
  revalidatePath("/admin/detailed-items")
}
