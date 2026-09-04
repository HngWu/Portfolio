/* eslint-disable @typescript-eslint/no-require-imports */
const Database = require('better-sqlite3')
const { createClient } = require('@supabase/supabase-js')
const path = require('path')
const fs = require('fs')

// 1. Parse arguments
const args = process.argv.slice(2)
const isPush = args.includes('--push')
const isPull = args.includes('--pull')
const isForce = args.includes('--force')

if (!isPush && !isPull) {
  console.log(`
Usage:
  node scripts/sync-cloud.js --push   # Upload local SQLite to Supabase
  node scripts/sync-cloud.js --pull   # Download remote Supabase to SQLite

Optional flags:
  --force                            # Allow pulling even if remote has 0 tiles
`)
  process.exit(0)
}

// 2. Load .env manually
const rootDir = path.resolve(__dirname, '..')
const envPath = path.join(rootDir, '.env')

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim()
      let val = trimmed.slice(eqIdx + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) {
        process.env[key] = val
      }
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing NEXT_PUBLIC_SUPABASE_URL or API key in .env')
  process.exit(1)
}

const dbPath = path.join(rootDir, 'data', 'portfolio.db')
if (!fs.existsSync(dbPath)) {
  console.error(`❌ Error: Database file not found at ${dbPath}`)
  process.exit(1)
}

const db = new Database(dbPath)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
})

async function run() {
  console.log(`=== SQLite ↔ Supabase Database Sync CLI ===`)
  console.log(`Direction: ${isPush ? 'Push (SQLite → Supabase)' : 'Pull (Supabase → SQLite)'}\n`)

  // Pre-flight check
  process.stdout.write('Testing Supabase connection... ')
  const startTime = Date.now()
  const { error: pingErr } = await supabase.from('tiles').select('id', { count: 'exact', head: true })
  if (pingErr) {
    console.log('FAILED')
    console.error(`❌ Supabase error: ${pingErr.message}`)
    process.exit(1)
  }
  console.log(`OK (${Date.now() - startTime}ms)`)

  const now = new Date().toISOString()

  if (isPush) {
    // --- PUSH OPERATION ---
    const localTiles = db.prepare('SELECT * FROM tiles ORDER BY order_val ASC, id ASC').all()
    const localDetailed = db.prepare('SELECT * FROM detailed_items ORDER BY order_val ASC, id ASC').all()

    console.log(`Read ${localTiles.length} tiles and ${localDetailed.length} detailed_items from local SQLite.`)

    // Format tiles
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

    // Upsert tiles
    if (formattedTiles.length > 0) {
      process.stdout.write('Upserting tiles into Supabase... ')
      const { error: tilesErr } = await supabase.from('tiles').upsert(formattedTiles)
      if (tilesErr) {
        console.log('FAILED')
        console.error('❌', tilesErr.message)
        process.exit(1)
      }
      console.log('Done')
    }

    // Format detailed items
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

    // Upsert detailed items
    if (formattedDetailed.length > 0) {
      process.stdout.write('Upserting detailed_items into Supabase... ')
      const { error: detailedErr } = await supabase.from('detailed_items').upsert(formattedDetailed)
      if (detailedErr) {
        console.log('FAILED')
        console.error('❌', detailedErr.message)
        process.exit(1)
      }
      console.log('Done')
    }

    // Mirror prune remote deletions
    process.stdout.write('Pruning obsolete remote rows... ')
    const { data: remoteTiles } = await supabase.from('tiles').select('id')
    const localTileIdSet = new Set(localTiles.map(t => t.id))
    const tilesToDelete = (remoteTiles || []).filter(r => !localTileIdSet.has(r.id)).map(r => r.id)
    if (tilesToDelete.length > 0) {
      await supabase.from('tiles').delete().in('id', tilesToDelete)
    }

    const { data: remoteDetailed } = await supabase.from('detailed_items').select('id')
    const localDetailedIdSet = new Set(localDetailed.map(i => i.id))
    const detailedToDelete = (remoteDetailed || []).filter(r => !localDetailedIdSet.has(r.id)).map(r => r.id)
    if (detailedToDelete.length > 0) {
      await supabase.from('detailed_items').delete().in('id', detailedToDelete)
    }
    console.log('Done')

    // Update metadata
    db.prepare(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES ('last_sync_timestamp', ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).run(now)

    db.prepare(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES ('last_sync_direction', 'push', datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).run()

    console.log(`\n✅ Push completed successfully!`)
    console.log(`- Tiles synced: ${localTiles.length}`)
    console.log(`- Detailed items synced: ${localDetailed.length}`)
    console.log(`- Pruned remote tiles: ${tilesToDelete.length}`)
    console.log(`- Pruned remote detailed items: ${detailedToDelete.length}`)
  } else if (isPull) {
    // --- PULL OPERATION ---
    process.stdout.write('Fetching tiles from Supabase... ')
    const { data: remoteTiles, error: tilesFetchErr } = await supabase
      .from('tiles')
      .select('*')
      .order('order_val', { ascending: true })

    if (tilesFetchErr) {
      console.log('FAILED')
      console.error('❌', tilesFetchErr.message)
      process.exit(1)
    }
    console.log(`Fetched ${remoteTiles ? remoteTiles.length : 0} tiles`)

    process.stdout.write('Fetching detailed_items from Supabase... ')
    const { data: remoteDetailed, error: detailedFetchErr } = await supabase
      .from('detailed_items')
      .select('*')
      .order('order_val', { ascending: true })

    if (detailedFetchErr) {
      console.log('FAILED')
      console.error('❌', detailedFetchErr.message)
      process.exit(1)
    }
    console.log(`Fetched ${remoteDetailed ? remoteDetailed.length : 0} detailed items`)

    if ((!remoteTiles || remoteTiles.length === 0) && !isForce) {
      console.error('❌ Aborted: Remote Supabase returned 0 tiles. Use --force to override.')
      process.exit(1)
    }

    process.stdout.write('Executing atomic SQLite transaction... ')
    const runTransaction = db.transaction(() => {
      db.prepare('DELETE FROM tiles').run()
      db.prepare('DELETE FROM detailed_items').run()

      const insertTile = db.prepare(`
        INSERT INTO tiles (
          id, type, size, col_start, row_start, order_val, order_val_mobile, is_hidden, is_active, content, deep_dive, created_at, updated_at
        ) VALUES (
          @id, @type, @size, @col_start, @row_start, @order_val, @order_val_mobile, @is_hidden, @is_active, @content, @deep_dive, @created_at, @updated_at
        )
      `)

      for (const t of (remoteTiles || [])) {
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
          created_at: t.created_at || now,
          updated_at: t.updated_at || now
        })
      }

      const insertItem = db.prepare(`
        INSERT INTO detailed_items (
          id, type, title, subtitle, date_range, content, deep_dive, order_val, created_at, updated_at
        ) VALUES (
          @id, @type, @title, @subtitle, @date_range, @content, @deep_dive, @order_val, @created_at, @updated_at
        )
      `)

      for (const item of (remoteDetailed || [])) {
        insertItem.run({
          id: item.id,
          type: item.type,
          title: item.title,
          subtitle: item.subtitle ?? null,
          date_range: item.date_range ?? null,
          content: typeof item.content === 'object' ? JSON.stringify(item.content) : (item.content || '{}'),
          deep_dive: typeof item.deep_dive === 'object' ? JSON.stringify(item.deep_dive) : (item.deep_dive || '{}'),
          order_val: item.order_val ?? 0,
          created_at: item.created_at || now,
          updated_at: item.updated_at || now
        })
      }
    })

    runTransaction()
    console.log('Done')

    // Update metadata
    db.prepare(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES ('last_sync_timestamp', ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).run(now)

    db.prepare(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES ('last_sync_direction', 'pull', datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).run()

    console.log(`\n✅ Pull completed successfully!`)
    console.log(`- Tiles written to SQLite: ${remoteTiles ? remoteTiles.length : 0}`)
    console.log(`- Detailed items written to SQLite: ${remoteDetailed ? remoteDetailed.length : 0}`)
  }

  db.close()
}

run().catch(err => {
  console.error('\n❌ Fatal error:', err)
  process.exit(1)
})
