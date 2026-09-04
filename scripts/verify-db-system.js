/* eslint-disable @typescript-eslint/no-require-imports */
const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

console.log('=== Running Database System Verification ===\n')

const rootDir = path.resolve(__dirname, '..')
const dbPath = path.join(rootDir, 'data', 'portfolio.db')

if (!fs.existsSync(dbPath)) {
  console.error(`❌ portfolio.db not found at ${dbPath}`)
  process.exit(1)
}

const db = new Database(dbPath)

// 1. Check system_settings table
const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='system_settings'").get()
console.log('1. system_settings table exists:', Boolean(tableCheck))
if (!tableCheck) {
  console.log('   Creating system_settings table...')
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `)
}

// 2. Test reading/writing provider setting
console.log('2. Testing write to system_settings...')
db.prepare(`
  INSERT INTO system_settings (key, value, updated_at)
  VALUES ('database_provider', 'supabase', datetime('now'))
  ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
`).run()

let setting = db.prepare("SELECT value FROM system_settings WHERE key = 'database_provider'").get()
console.log('   Read after setting to supabase:', setting?.value)
if (setting?.value !== 'supabase') {
  throw new Error('Failed to set database_provider to supabase')
}

db.prepare(`
  INSERT INTO system_settings (key, value, updated_at)
  VALUES ('database_provider', 'sqlite', datetime('now'))
  ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
`).run()

setting = db.prepare("SELECT value FROM system_settings WHERE key = 'database_provider'").get()
console.log('   Read after setting to sqlite:', setting?.value)
if (setting?.value !== 'sqlite') {
  throw new Error('Failed to set database_provider to sqlite')
}

// 3. Test deleting override (reverting to env default)
db.prepare("DELETE FROM system_settings WHERE key = 'database_provider'").run()
setting = db.prepare("SELECT value FROM system_settings WHERE key = 'database_provider'").get()
console.log('   Read after deleting override (should be undefined):', setting)
if (setting !== undefined) {
  throw new Error('Failed to clear database_provider override')
}

// 4. Verify tiles and detailed_items rows
const tileCount = db.prepare("SELECT count(*) as count FROM tiles").get().count
const detailedCount = db.prepare("SELECT count(*) as count FROM detailed_items").get().count
const adminCount = db.prepare("SELECT count(*) as count FROM admin_users").get().count

console.log(`3. Verified local data counts:`)
console.log(`   - Tiles: ${tileCount}`)
console.log(`   - Detailed items: ${detailedCount}`)
console.log(`   - Admin users: ${adminCount}`)

if (tileCount === 0 || detailedCount === 0 || adminCount === 0) {
  throw new Error('Expected tiles, detailed_items, and admin_users to have records')
}

// 5. Verify .env configuration
const envPath = path.join(rootDir, '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const hasDefaultDb = envContent.includes('DEFAULT_DATABASE="sqlite"')
console.log('4. .env contains DEFAULT_DATABASE="sqlite":', hasDefaultDb)
if (!hasDefaultDb) {
  throw new Error('.env is missing DEFAULT_DATABASE="sqlite"')
}

console.log('\n✅ All Database System verification checks passed!')
db.close()
