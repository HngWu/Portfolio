"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Database } from "@/types/supabase"

export async function getTiles() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("tiles").select("*").order("order_val", { ascending: true })
  if (error) throw error
  return data
}

export async function updateTile(id: string, updates: Partial<Database['public']['Tables']['tiles']['Update']>) {
  const supabase = await createClient()
  const { error } = await supabase.from("tiles").update(updates).eq("id", id)
  if (error) throw error
  revalidatePath("/")
  revalidatePath("/admin/tiles")
}

export async function deleteTile(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("tiles").delete().eq("id", id)
  if (error) throw error
  revalidatePath("/")
  revalidatePath("/admin/tiles")
}

export async function createTile(tile: Database['public']['Tables']['tiles']['Insert']) {
  const supabase = await createClient()
  const { error } = await supabase.from("tiles").insert(tile)
  if (error) throw error
  revalidatePath("/")
  revalidatePath("/admin/tiles")
}
