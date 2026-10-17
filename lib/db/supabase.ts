import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { ConnectionTestResult } from './types'
import { supabaseCircuitBreaker } from './circuit-breaker'
export { supabaseCircuitBreaker } from './circuit-breaker'

export type TileRow = Database['public']['Tables']['tiles']['Row']
export type TileInsert = Database['public']['Tables']['tiles']['Insert']
export type TileUpdate = Database['public']['Tables']['tiles']['Update']

export type DetailedItemRow = Database['public']['Tables']['detailed_items']['Row']
export type DetailedItemInsert = Database['public']['Tables']['detailed_items']['Insert']
export type DetailedItemUpdate = Database['public']['Tables']['detailed_items']['Update']

let supabaseClient: SupabaseClient<Database> | null = null
let cachedUrl: string | undefined
let cachedKey: string | undefined

export const SUPABASE_REQUEST_TIMEOUT_MS = 3500

function createTimeoutError(message: string): Error {
  if (typeof DOMException !== 'undefined') {
    return new DOMException(message, 'TimeoutError')
  }
  const err = new Error(message)
  err.name = 'TimeoutError'
  return err
}

/**
 * Fast-fail timeout fetch wrapper (3500ms).
 * Combines caller's signal (if any) with an AbortController signal using AbortSignal.any
 * or an event-listener fallback, and clears the timer in finally to avoid memory leaks.
 */
export async function timeoutFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => {
    controller.abort(createTimeoutError(`Request timed out after ${SUPABASE_REQUEST_TIMEOUT_MS}ms`))
  }, SUPABASE_REQUEST_TIMEOUT_MS)

  const incomingSignal =
    init?.signal ?? (typeof Request !== 'undefined' && input instanceof Request ? input.signal : undefined)
  let signal: AbortSignal
  let cleanupSignalListener: (() => void) | null = null

  if (incomingSignal) {
    if (typeof AbortSignal.any === 'function') {
      signal = AbortSignal.any([controller.signal, incomingSignal])
    } else {
      if (incomingSignal.aborted) {
        controller.abort((incomingSignal as any).reason)
      } else {
        const onAbort = () => {
          controller.abort((incomingSignal as any).reason)
        }
        incomingSignal.addEventListener('abort', onAbort, { once: true })
        cleanupSignalListener = () => {
          incomingSignal.removeEventListener('abort', onAbort)
        }
      }
      signal = controller.signal
    }
  } else {
    signal = controller.signal
  }

  try {
    return await fetch(input, {
      ...init,
      signal,
    })
  } finally {
    clearTimeout(timer)
    if (cleanupSignalListener) {
      cleanupSignalListener()
    }
  }
}

export function resetSupabaseClient(): void {
  supabaseClient = null
  cachedUrl = undefined
  cachedKey = undefined
}

export function getSupabaseCredentials(): { url: string | undefined; key: string | undefined } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return { url, key }
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials()
  return Boolean(url && key)
}

export function getSupabaseClient(forceFresh = false): SupabaseClient<Database> {
  const { url, key } = getSupabaseCredentials()
  if (!url || !key) {
    throw new Error("Supabase is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or API key.")
  }

  if (!supabaseClient || forceFresh || cachedUrl !== url || cachedKey !== key) {
    supabaseClient = createClient<Database>(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        fetch: timeoutFetch
      }
    })
    cachedUrl = url
    cachedKey = key
  }
  return supabaseClient
}

/**
 * Tests connection to Supabase and measures round-trip latency.
 */
export async function testSupabaseConnection(forceFresh = false): Promise<ConnectionTestResult> {
  const { url, key } = getSupabaseCredentials()
  if (!url || !key) {
    const errorMsg = "Missing NEXT_PUBLIC_SUPABASE_URL or API key in environment variables."
    supabaseCircuitBreaker.recordFailure(errorMsg)
    return {
      ok: false,
      error: errorMsg
    }
  }

  const startTime = Date.now()
  try {
    const client = getSupabaseClient(forceFresh)
    const { error } = await client
      .from('tiles')
      .select('id', { count: 'exact', head: true })

    const latencyMs = Date.now() - startTime

    if (error) {
      supabaseCircuitBreaker.recordFailure(error)
      let detailedMsg = error.message
      if (error.message && error.message.includes('fetch failed')) {
        const details = (error as any).details || ''
        detailedMsg = `Unable to reach Supabase at ${url}. ${details}`.trim()
      } else if (
        error.message &&
        (error.message.includes('timed out') ||
          error.message.includes('TimeoutError') ||
          error.message.includes('AbortError'))
      ) {
        detailedMsg = `Connection to Supabase at ${url} timed out after ${SUPABASE_REQUEST_TIMEOUT_MS}ms.`
      }
      return {
        ok: false,
        latencyMs,
        error: detailedMsg || "Failed to query tiles table in Supabase."
      }
    }

    supabaseCircuitBreaker.recordSuccess()
    return {
      ok: true,
      latencyMs
    }
  } catch (err) {
    supabaseCircuitBreaker.recordFailure(err)
    const latencyMs = Date.now() - startTime
    const message = err instanceof Error ? err.message : "Connection to Supabase timed out or failed."
    let formattedError = message
    if (message.includes('fetch failed')) {
      formattedError = `Unable to reach Supabase at ${url}. Please verify internet connection or host reachability.`
    } else if (
      message.includes('timed out') ||
      message.includes('TimeoutError') ||
      message.includes('AbortError')
    ) {
      formattedError = `Connection to Supabase at ${url} timed out after ${SUPABASE_REQUEST_TIMEOUT_MS}ms.`
    }

    return {
      ok: false,
      latencyMs,
      error: formattedError
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
