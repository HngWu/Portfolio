"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Database } from "@/types/supabase"

export async function getProjects() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("projects").select("*").order("order_val", { ascending: true })
  if (error) throw error
  return data
}

export async function updateProject(id: string, updates: Partial<Database['public']['Tables']['projects']['Update']>) {
  const supabase = await createClient()
  const { error } = await supabase.from("projects").update(updates).eq("id", id)
  if (error) throw error
  revalidatePath("/")
  revalidatePath("/admin/projects")
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("projects").delete().eq("id", id)
  if (error) throw error
  revalidatePath("/")
  revalidatePath("/admin/projects")
}

export async function createProject(project: Database['public']['Tables']['projects']['Insert']) {
  const supabase = await createClient()
  const { error } = await supabase.from("projects").insert(project)
  if (error) throw error
  revalidatePath("/")
  revalidatePath("/admin/projects")
}
