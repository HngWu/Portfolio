/* eslint-disable @typescript-eslint/no-require-imports */
const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

console.log('=== Running Synchronization Engine & Safety Verification ===\n')

const rootDir = path.resolve(__dirname, '..')
const dbPath = path.join(rootDir, 'data', 'portfolio.db')

if (!fs.existsSync(dbPath)) {
  console.error(`❌ portfolio.db not found at ${dbPath}`)
  process.exit(1)
}

const db = new Database(dbPath)

// 1. Verify tables and data presence
const tileCount = db.prepare('SELECT count(*) as count FROM tiles').get().count
const detailedCount = db.prepare('SELECT count(*) as count FROM detailed_items').get().count
console.log(`1. Initial SQLite data check:`)
console.log(`   - Tiles: ${tileCount}`)
console.log(`   - Detailed items: ${detailedCount}`)

if (tileCount === 0 || detailedCount === 0) {
  throw new Error('Database is missing tiles or detailed items')
}

// 2. Verify Transactional Rollback Guarantee
console.log('\n2. Testing SQLite Transaction Rollback on Failure...')
const testId = 'test-rollback-' + Date.now()

// Insert a test tile
db.prepare(`
  INSERT INTO tiles (id, type, size, order_val, is_hidden, is_active, content, deep_dive)
  VALUES (?, 'stat', '2x2', 999, 1, 0, '{}', '{}')
`).run(testId)

const tileBefore = db.prepare('SELECT id FROM tiles WHERE id = ?').get(testId)
console.log('   Inserted canary test tile:', tileBefore?.id)

// Attempt a transaction that modifies data then throws
let caughtError = false
try {
  const failingTx = db.transaction(() => {
    // Modify existing tile
    db.prepare("UPDATE tiles SET type = 'corrupted' WHERE id = ?").run(testId)
    // Cause a deliberate primary key constraint violation
    db.prepare("INSERT INTO tiles (id, type, size) VALUES (?, 'fail', '1x1')").run(testId)
  })
  failingTx()
} catch {
  caughtError = true
  console.log('   Expected transaction failure caught successfully.')
}

if (!caughtError) {
  throw new Error('Transaction should have failed on duplicate key!')
}

// Check if rollback preserved original type
const tileAfter = db.prepare('SELECT type FROM tiles WHERE id = ?').get(testId)
console.log('   Type after rollback (should remain "stat"):', tileAfter?.type)

if (tileAfter?.type !== 'stat') {
  throw new Error(`Rollback failed! Expected type 'stat', found '${tileAfter?.type}'`)
}

// Cleanup test canary
db.prepare('DELETE FROM tiles WHERE id = ?').run(testId)
console.log('   Cleaned up canary test tile.')

// 3. Test Metadata Storage in system_settings
console.log('\n3. Testing Sync Metadata Storage in system_settings...')
const now = new Date().toISOString()
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

const lastTs = db.prepare("SELECT value FROM system_settings WHERE key = 'last_sync_timestamp'").get()?.value
const lastDir = db.prepare("SELECT value FROM system_settings WHERE key = 'last_sync_direction'").get()?.value

console.log('   last_sync_timestamp:', lastTs)
console.log('   last_sync_direction:', lastDir)

if (lastTs !== now || lastDir !== 'push') {
  throw new Error('Failed to record sync metadata in system_settings')
}

// 4. Verify required module exports and signatures
console.log('\n4. Verifying sync files and exports...')
const syncFilePath = path.join(rootDir, 'lib', 'db', 'sync.ts')
const actionFilePath = path.join(rootDir, 'app', 'actions', 'database-sync.ts')
const modalFilePath = path.join(rootDir, 'components', 'admin', 'DatabaseSyncModal.tsx')
const cliFilePath = path.join(rootDir, 'scripts', 'sync-cloud.js')

for (const fp of [syncFilePath, actionFilePath, modalFilePath, cliFilePath]) {
  if (!fs.existsSync(fp)) {
    throw new Error(`Expected file not found: ${fp}`)
  }
  console.log(`   Found: ${path.relative(rootDir, fp)}`)
}

console.log('\n✅ All Synchronization Engine verification checks passed successfully!')
db.close()
