import {
  getDb,
  getTilesDb,
  getDetailedItemsDb,
  setSystemSettingDb,
  getSystemSettingDb,
  TileRow,
  DetailedItemRow
} from './index'
import {
  getSupabaseClient,
  testSupabaseConnection,
  getTilesSupabase,
  getDetailedItemsSupabase
} from './supabase'

import type { SyncSummary, SyncResult, SyncStatus } from './types'
export type { SyncSummary, SyncResult, SyncStatus }

/**
 * Returns the recorded timestamp and direction of the last successful sync.
 */
export function getLastSyncStatus(): SyncStatus {
  const lastSyncTimestamp = getSystemSettingDb('last_sync_timestamp') || null
  const lastSyncDirection = (getSystemSettingDb('last_sync_direction') as 'push' | 'pull') || null
  return { lastSyncTimestamp, lastSyncDirection }
}

/**
 * Pushes local SQLite records (tiles and detailed_items) to Supabase.
 * Uses upsert on remote tables and prunes any remote rows that do not exist locally.
 */
export async function pushSqliteToSupabase(): Promise<SyncResult> {
  const test = await testSupabaseConnection()
  if (!test.ok) {
    return {
      success: false,
      error: `Cannot connect to Supabase: ${test.error || 'Connection failed'}`
    }
  }

  try {
    const client = getSupabaseClient()
    const localTiles = getTilesDb()
    const localDetailed = getDetailedItemsDb()

    // 1. Format and upsert tiles to Supabase
    if (localTiles.length > 0) {
      const formattedTiles = localTiles.map(t => ({
        id: t.id,
        type: t.type,
        size: t.size,
        col_start: t.col_start ?? null,
        row_start: t.row_start ?? null,
        order_val: t.order_val,
        order_val_mobile: t.order_val_mobile,
        is_hidden: Boolean(t.is_hidden),
        is_active: Boolean(t.is_active),
        content: typeof t.content === 'string' ? JSON.parse(t.content || '{}') : t.content,
        deep_dive: typeof t.deep_dive === 'string' ? JSON.parse(t.deep_dive || '{}') : t.deep_dive,
        created_at: t.created_at,
        updated_at: t.updated_at
      }))

      const { error: upsertTilesErr } = await (client.from('tiles') as any).upsert(formattedTiles)
      if (upsertTilesErr) {
        throw new Error(`Failed to upsert tiles into Supabase: ${upsertTilesErr.message}`)
      }
    }

    // 2. Format and upsert detailed_items to Supabase
    if (localDetailed.length > 0) {
      const formattedDetailed = localDetailed.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        subtitle: item.subtitle ?? null,
        date_range: item.date_range ?? null,
        content: typeof item.content === 'string' ? JSON.parse(item.content || '{}') : item.content,
        deep_dive: typeof item.deep_dive === 'string' ? JSON.parse(item.deep_dive || '{}') : item.deep_dive,
        order_val: item.order_val,
        created_at: item.created_at,
        updated_at: item.updated_at
      }))

      const { error: upsertDetailedErr } = await (client.from('detailed_items') as any).upsert(formattedDetailed)
      if (upsertDetailedErr) {
        throw new Error(`Failed to upsert detailed items into Supabase: ${upsertDetailedErr.message}`)
      }
    }

    // 3. Mirror prune: remove any rows from Supabase that were deleted locally
    const { data: remoteTiles } = await (client.from('tiles') as any).select('id')
    const remoteTilesList = (remoteTiles as Array<{ id: string }>) || []
    const localTileIdSet = new Set(localTiles.map(t => t.id))
    const tilesToDelete = remoteTilesList.filter(r => !localTileIdSet.has(r.id)).map(r => r.id)
    if (tilesToDelete.length > 0) {
      await (client.from('tiles') as any).delete().in('id', tilesToDelete)
    }

    const { data: remoteDetailed } = await (client.from('detailed_items') as any).select('id')
    const remoteDetailedList = (remoteDetailed as Array<{ id: string }>) || []
    const localDetailedIdSet = new Set(localDetailed.map(i => i.id))
    const detailedToDelete = remoteDetailedList.filter(r => !localDetailedIdSet.has(r.id)).map(r => r.id)
    if (detailedToDelete.length > 0) {
      await (client.from('detailed_items') as any).delete().in('id', detailedToDelete)
    }

    // 4. Save metadata
    const timestamp = new Date().toISOString()
    setSystemSettingDb('last_sync_timestamp', timestamp)
    setSystemSettingDb('last_sync_direction', 'push')

    return {
      success: true,
      summary: {
        direction: 'push',
        tilesCount: localTiles.length,
        detailedItemsCount: localDetailed.length,
        timestamp
      }
    }
  } catch (err) {
    console.error('[Sync] Error pushing SQLite to Supabase:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown push error'
    }
  }
}

/**
 * Pulls remote Supabase records (tiles and detailed_items) down to SQLite.
 * Uses an atomic SQLite db.transaction to prevent partial updates or corruption.
 */
export async function pullSupabaseToSqlite(options?: { allowEmpty?: boolean }): Promise<SyncResult> {
  const test = await testSupabaseConnection()
  if (!test.ok) {
    return {
      success: false,
      error: `Cannot connect to Supabase: ${test.error || 'Connection failed'}`
    }
  }

  try {
    const remoteTiles = await getTilesSupabase()
    const remoteDetailed = await getDetailedItemsSupabase()

    // Safety guard: if Supabase has 0 tiles, do not wipe local database unless explicitly allowed
    if (remoteTiles.length === 0 && !options?.allowEmpty) {
      return {
        success: false,
        error: 'Remote Supabase database returned 0 tiles. Pull aborted to safeguard local SQLite data.'
      }
    }

    const db = getDb()
    const runTransaction = db.transaction(() => {
      // 1. Clear local tables
      db.prepare('DELETE FROM tiles').run()
      db.prepare('DELETE FROM detailed_items').run()

      // 2. Insert incoming remote tiles
      const insertTile = db.prepare(`
        INSERT INTO tiles (
          id, type, size, col_start, row_start, order_val, order_val_mobile, is_hidden, is_active, content, deep_dive, created_at, updated_at
        ) VALUES (
          @id, @type, @size, @col_start, @row_start, @order_val, @order_val_mobile, @is_hidden, @is_active, @content, @deep_dive, @created_at, @updated_at
        )
      `)

      for (const t of remoteTiles) {
        insertTile.run({
          id: t.id,
          type: t.type,
          size: t.size,
          col_start: t.col_start ?? null,
          row_start: t.row_start ?? null,
          order_val: t.order_val ?? 0,
          order_val_mobile: t.order_val_mobile ?? 0,
          is_hidden: t.is_hidden ? 1 : 0,
          is_active: t.is_active ? 1 : 0,
          content: typeof t.content === 'object' ? JSON.stringify(t.content) : (t.content || '{}'),
          deep_dive: typeof t.deep_dive === 'object' ? JSON.stringify(t.deep_dive) : (t.deep_dive || '{}'),
          created_at: t.created_at || new Date().toISOString(),
          updated_at: t.updated_at || new Date().toISOString()
        })
      }

      // 3. Insert incoming remote detailed items
      const insertItem = db.prepare(`
        INSERT INTO detailed_items (
          id, type, title, subtitle, date_range, content, deep_dive, order_val, created_at, updated_at
        ) VALUES (
          @id, @type, @title, @subtitle, @date_range, @content, @deep_dive, @order_val, @created_at, @updated_at
        )
      `)

      for (const item of remoteDetailed) {
        insertItem.run({
          id: item.id,
          type: item.type,
          title: item.title,
          subtitle: item.subtitle ?? null,
          date_range: item.date_range ?? null,
          content: typeof item.content === 'object' ? JSON.stringify(item.content) : (item.content || '{}'),
          deep_dive: typeof item.deep_dive === 'object' ? JSON.stringify(item.deep_dive) : (item.deep_dive || '{}'),
          order_val: item.order_val ?? 0,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        })
      }
    })

    runTransaction()

    // 4. Save metadata
    const timestamp = new Date().toISOString()
    setSystemSettingDb('last_sync_timestamp', timestamp)
    setSystemSettingDb('last_sync_direction', 'pull')

    return {
      success: true,
      summary: {
        direction: 'pull',
        tilesCount: remoteTiles.length,
        detailedItemsCount: remoteDetailed.length,
        timestamp
      }
    }
  } catch (err) {
    console.error('[Sync] Error pulling Supabase to SQLite:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown pull error'
    }
  }
}
