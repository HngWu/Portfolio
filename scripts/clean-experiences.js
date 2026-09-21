/* eslint-disable @typescript-eslint/no-require-imports */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const dbPath = path.join(rootDir, 'data', 'portfolio.db');

if (!fs.existsSync(dbPath)) {
  console.error(`[Error] Database file not found at: ${dbPath}`);
  process.exit(1);
}

const db = new Database(dbPath);

const tileId = '00864e8e-0331-4c86-8b8e-a8d3266749d7';
const row = db.prepare('SELECT * FROM tiles WHERE id = ?').get(tileId);

if (!row) {
  console.error('[Error] Experience tile not found in portfolio.db');
  process.exit(1);
}

console.log('[Clean] Found experience tile. Processing items...');

const content = JSON.parse(row.content);
const deepDive = JSON.parse(row.deep_dive);

// Filter items to only dbs-bank and ttp-support
const allowedIds = new Set(['dbs-bank', 'ttp-support', 'ttp']);

if (Array.isArray(content.items)) {
  content.items = content.items.filter(item => allowedIds.has(item.id));
}

if (Array.isArray(deepDive.items)) {
  deepDive.items = deepDive.items.filter(item => allowedIds.has(item.id));
}

const updatedContent = JSON.stringify(content);
const updatedDeepDive = JSON.stringify(deepDive);
const now = new Date().toISOString();

db.prepare('UPDATE tiles SET content = ?, deep_dive = ?, updated_at = ? WHERE id = ?').run(
  updatedContent,
  updatedDeepDive,
  now,
  tileId
);

console.log('[Clean] Updated portfolio.db experience tile to 2 items.');

// Also clean detailed_items table where type = 'experience'
const allowedDetailedExpIds = ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'];
const deleteStmt = db.prepare("DELETE FROM detailed_items WHERE type = 'experience' AND id NOT IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002')");
const info = deleteStmt.run();
console.log(`[Clean] Deleted ${info.changes} non-existent experience records from detailed_items.`);

// Trigger sync-seed.js to update seed.sql, init.sql, and lib/db/index.ts
require('./sync-seed.js');
console.log('[Clean] Synced all seed files successfully.');

