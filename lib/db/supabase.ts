import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { ConnectionTestResult } from './types'

export type TileRow = Database['public']['Tables']['tiles']['Row']
export type TileInsert = Database['public']['Tables']['tiles']['Insert']
export type TileUpdate = Database['public']['Tables']['tiles']['Update']

export type DetailedItemRow = Database['public']['Tables']['detailed_items']['Row']
export type DetailedItemInsert = Database['public']['Tables']['detailed_items']['Insert']
export type DetailedItemUpdate = Database['public']['Tables']['detailed_items']['Update']

let supabaseClient: SupabaseClient<Database> | null = null

export function getSupabaseCredentials(): { url: string | undefined; key: string | undefined } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return { url, key }
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials()
  return Boolean(url && key)
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseClient) {
    const { url, key } = getSupabaseCredentials()
    if (!url || !key) {
      throw new Error("Supabase is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or API key.")
    }
    supabaseClient = createClient<Database>(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  }
  return supabaseClient
}

/**
 * Tests connection to Supabase and measures round-trip latency.
 */
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  const { url, key } = getSupabaseCredentials()
  if (!url || !key) {
    return {
      ok: false,
      error: "Missing NEXT_PUBLIC_SUPABASE_URL or API key in environment variables."
    }
  }

  const startTime = Date.now()
  try {
    const client = getSupabaseClient()
    const { error } = await client
      .from('tiles')
      .select('id', { count: 'exact', head: true })

    const latencyMs = Date.now() - startTime

    if (error) {
      return {
        ok: false,
        latencyMs,
        error: error.message || "Failed to query tiles table in Supabase."
      }
    }

    return {
      ok: true,
      latencyMs
    }
  } catch (err) {
    const latencyMs = Date.now() - startTime
    return {
      ok: false,
      latencyMs,
      error: err instanceof Error ? err.message : "Connection to Supabase timed out or failed."
    }
  }
}

// -------------------------------------------------------------
// Tiles Supabase Operations
// -------------------------------------------------------------

export async function getTilesSupabase(): Promise<TileRow[]> {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('tiles')
    .select('*')
    .order('order_val', { ascending: true })

  if (error) {
    throw new Error(`[Supabase] getTiles failed: ${error.message}`)
  }

  return ((data as unknown as TileRow[]) || []).map(row => ({
    ...row,
    content: typeof row.content === 'string' ? JSON.parse(row.content || '{}') : row.content,
    deep_dive: typeof row.deep_dive === 'string' ? JSON.parse(row.deep_dive || '{}') : row.deep_dive,
  }))
}

export async function getTileByIdSupabase(id: string): Promise<TileRow | null> {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('tiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`[Supabase] getTileById failed: ${error.message}`)
  }

  if (!data) return null

  const row = data as unknown as TileRow
  return {
    ...row,
    content: typeof row.content === 'string' ? JSON.parse((row.content as string) || '{}') : row.content,
    deep_dive: typeof row.deep_dive === 'string' ? JSON.parse((row.deep_dive as string) || '{}') : row.deep_dive,
  }
}

export async function getTilesByTypeSupabase(type: string): Promise<TileRow[]> {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('tiles')
    .select('*')
    .eq('type', type)
    .order('order_val', { ascending: true })

  if (error) {
    throw new Error(`[Supabase] getTilesByType failed: ${error.message}`)
  }

  return ((data as unknown as TileRow[]) || []).map(row => ({
    ...row,
    content: typeof row.content === 'string' ? JSON.parse((row.content as string) || '{}') : row.content,
    deep_dive: typeof row.deep_dive === 'string' ? JSON.parse((row.deep_dive as string) || '{}') : row.deep_dive,
  }))
}

export async function createTileSupabase(tile: TileInsert): Promise<TileRow> {
  const client = getSupabaseClient()
  const { data, error } = await (client.from('tiles') as any)
    .insert(tile)
    .select('*')
    .single()

  if (error) {
    throw new Error(`[Supabase] createTile failed: ${error.message}`)
  }

  const row = data as unknown as TileRow
  return {
    ...row,
    content: typeof row.content === 'string' ? JSON.parse((row.content as string) || '{}') : row.content,
    deep_dive: typeof row.deep_dive === 'string' ? JSON.parse((row.deep_dive as string) || '{}') : row.deep_dive,
  }
}

export async function updateTileSupabase(id: string, updates: TileUpdate): Promise<TileRow> {
  const client = getSupabaseClient()
  const now = new Date().toISOString()
  const payload = {
    ...updates,
    updated_at: now
  }

  const { data, error } = await (client.from('tiles') as any)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(`[Supabase] updateTile failed: ${error.message}`)
  }

  const row = data as unknown as TileRow
  return {
    ...row,
    content: typeof row.content === 'string' ? JSON.parse((row.content as string) || '{}') : row.content,
    deep_dive: typeof row.deep_dive === 'string' ? JSON.parse((row.deep_dive as string) || '{}') : row.deep_dive,
  }
}

export async function updateTilesSupabase(tiles: TileRow[]): Promise<void> {
  const client = getSupabaseClient()
  const now = new Date().toISOString()
  const rows = tiles.map(t => ({
    ...t,
    updated_at: now
  }))

  const { error } = await (client.from('tiles') as any)
    .upsert(rows)

  if (error) {
    throw new Error(`[Supabase] updateTiles (upsert) failed: ${error.message}`)
  }
}

export async function deleteTileSupabase(id: string): Promise<void> {
  const client = getSupabaseClient()
  const { error } = await client
    .from('tiles')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`[Supabase] deleteTile failed: ${error.message}`)
  }
}

// -------------------------------------------------------------
// Detailed Items Supabase Operations
// -------------------------------------------------------------

export async function getDetailedItemsSupabase(type?: string): Promise<DetailedItemRow[]> {
  const client = getSupabaseClient()
  let query = client.from('detailed_items').select('*').order('order_val', { ascending: true })

  if (type && type !== 'all') {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`[Supabase] getDetailedItems failed: ${error.message}`)
  }

  return ((data as unknown as DetailedItemRow[]) || []).map(row => ({
    ...row,
    content: typeof row.content === 'string' ? JSON.parse((row.content as string) || '{}') : row.content,
    deep_dive: typeof row.deep_dive === 'string' ? JSON.parse((row.deep_dive as string) || '{}') : row.deep_dive,
  }))
}

export async function getDetailedItemByIdSupabase(id: string): Promise<DetailedItemRow | null> {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('detailed_items')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`[Supabase] getDetailedItemById failed: ${error.message}`)
  }

  if (!data) return null

  const row = data as unknown as DetailedItemRow
  return {
    ...row,
    content: typeof row.content === 'string' ? JSON.parse((row.content as string) || '{}') : row.content,
    deep_dive: typeof row.deep_dive === 'string' ? JSON.parse((row.deep_dive as string) || '{}') : row.deep_dive,
  }
}

export async function createDetailedItemSupabase(item: DetailedItemInsert): Promise<DetailedItemRow> {
  const client = getSupabaseClient()
  const { data, error } = await (client.from('detailed_items') as any)
    .insert(item)
    .select('*')
    .single()

  if (error) {
    throw new Error(`[Supabase] createDetailedItem failed: ${error.message}`)
  }

  const row = data as unknown as DetailedItemRow
  return {
    ...row,
    content: typeof row.content === 'string' ? JSON.parse((row.content as string) || '{}') : row.content,
    deep_dive: typeof row.deep_dive === 'string' ? JSON.parse((row.deep_dive as string) || '{}') : row.deep_dive,
  }
}

export async function updateDetailedItemSupabase(id: string, updates: DetailedItemUpdate): Promise<DetailedItemRow> {
  const client = getSupabaseClient()
  const now = new Date().toISOString()
  const payload = {
    ...updates,
    updated_at: now
  }

  const { data, error } = await (client.from('detailed_items') as any)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(`[Supabase] updateDetailedItem failed: ${error.message}`)
  }

  const row = data as unknown as DetailedItemRow
  return {
    ...row,
    content: typeof row.content === 'string' ? JSON.parse((row.content as string) || '{}') : row.content,
    deep_dive: typeof row.deep_dive === 'string' ? JSON.parse((row.deep_dive as string) || '{}') : row.deep_dive,
  }
}

export async function deleteDetailedItemSupabase(id: string): Promise<void> {
  const client = getSupabaseClient()
  const { error } = await client
    .from('detailed_items')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`[Supabase] deleteDetailedItem failed: ${error.message}`)
  }
}
