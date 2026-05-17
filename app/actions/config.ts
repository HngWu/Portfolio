"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface ConfigItem {
  key: string
  value: unknown
}

export async function getConfig(): Promise<ConfigItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tiles")
    .select("content")
    .eq("type", "config")
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') { // Not found
      return []
    }
    throw error
  }

  const content = data.content as Record<string, unknown>
  return Object.entries(content).map(([key, value]) => ({ key, value }))
}

export async function updateConfig(key: string, value: unknown) {
  const supabase = await createClient()
  
  const { data: existing } = await supabase
    .from("tiles")
    .select("id, content")
    .eq("type", "config")
    .single()

  if (existing) {
    const newContent = {
      ...(existing.content as object),
      [key]: value
    }
    const { error } = await supabase
      .from("tiles")
      .update({ content: newContent })
      .eq("id", existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from("tiles")
      .insert({
        type: "config",
        size: "0x0",
        is_hidden: true,
        content: { [key]: value }
      })
    if (error) throw error
  }

  revalidatePath("/")
  revalidatePath("/admin/config")
}
