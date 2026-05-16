"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Database } from "@/types/supabase"

export async function getConfig() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("site_config").select("*")
  if (error) throw error
  return data
}

export async function updateConfig(key: string, value: Database['public']['Tables']['site_config']['Update']['value']) {
  const supabase = await createClient()
  const { error } = await supabase.from("site_config").upsert({ key, value })
  if (error) throw error
  revalidatePath("/")
  revalidatePath("/admin/config")
}
