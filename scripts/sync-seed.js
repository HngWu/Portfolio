/* eslint-disable @typescript-eslint/no-require-imports */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const dbPath = path.join(rootDir, 'data', 'portfolio.db');
const indexPath = path.join(rootDir, 'lib', 'db', 'index.ts');
const seedSqlPath = path.join(rootDir, 'lib', 'supabase', 'seed.sql');

if (!fs.existsSync(dbPath)) {
  console.error(`[Error] Database file not found at: ${dbPath}`);
  process.exit(1);
}

try {
  const db = new Database(dbPath);

  const tiles = db.prepare('SELECT * FROM tiles ORDER BY order_val ASC, id ASC').all();
  const detailedItems = db.prepare('SELECT * FROM detailed_items ORDER BY order_val ASC, id ASC').all();

  console.log(`[Sync] Read ${tiles.length} tiles and ${detailedItems.length} detailed_items from portfolio.db`);

  // 1. Format seedTiles TypeScript definition
  const seedTilesTs = tiles.map(t => {
    return `    {
      id: ${JSON.stringify(t.id)},
      type: ${JSON.stringify(t.type)},
      size: ${JSON.stringify(t.size)},
      col_start: ${t.col_start === null ? 'null' : t.col_start},
      row_start: ${t.row_start === null ? 'null' : t.row_start},
      order_val: ${t.order_val},
      order_val_mobile: ${t.order_val_mobile},
      is_hidden: ${t.is_hidden},
      is_active: ${t.is_active},
      content: ${JSON.stringify(t.content)},
      deep_dive: ${JSON.stringify(t.deep_dive)},
      created_at: ${JSON.stringify(t.created_at)},
      updated_at: ${JSON.stringify(t.updated_at)}
    }`;
  }).join(',\n');

  // 2. Format seedDetailed TypeScript definition
  const seedDetailedTs = detailedItems.map(item => {
    return `      {
        id: ${JSON.stringify(item.id)},
        type: ${JSON.stringify(item.type)},
        title: ${JSON.stringify(item.title)},
        subtitle: ${item.subtitle === null ? 'null' : JSON.stringify(item.subtitle)},
        date_range: ${item.date_range === null ? 'null' : JSON.stringify(item.date_range)},
        content: ${JSON.stringify(item.content)},
        deep_dive: ${JSON.stringify(item.deep_dive)},
        order_val: ${item.order_val},
        created_at: ${JSON.stringify(item.created_at)},
        updated_at: ${JSON.stringify(item.updated_at)}
      }`;
  }).join(',\n');

  // 3. Update lib/db/index.ts
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    const seedFuncRegex = /function seedDatabase\(db: InstanceType<typeof Database>\) \{[\s\S]*?seedTransaction\(\)\s*\}/;

    const newSeedFunc = `function seedDatabase(db: InstanceType<typeof Database>) {
  const insertTile = db.prepare(\`
    INSERT INTO tiles (id, type, size, col_start, row_start, order_val, order_val_mobile, is_hidden, is_active, content, deep_dive, created_at, updated_at)
    VALUES (@id, @type, @size, @col_start, @row_start, @order_val, @order_val_mobile, @is_hidden, @is_active, @content, @deep_dive, @created_at, @updated_at)
  \`)

  const seedTiles = [
${seedTilesTs}
  ]

  const seedTransaction = db.transaction(() => {
    for (const tile of seedTiles) {
      insertTile.run(tile)
    }

    const insertDetailed = db.prepare(\`
      INSERT INTO detailed_items (id, type, title, subtitle, date_range, content, deep_dive, order_val, created_at, updated_at)
      VALUES (@id, @type, @title, @subtitle, @date_range, @content, @deep_dive, @order_val, @created_at, @updated_at)
    \`)

    const seedDetailed = [
${seedDetailedTs}
    ]

    for (const item of seedDetailed) {
      insertDetailed.run(item)
    }
  })

  seedTransaction()
}`;

    if (!seedFuncRegex.test(indexContent)) {
      console.error("[Error] Could not find seedDatabase function structure in lib/db/index.ts");
    } else {
      indexContent = indexContent.replace(seedFuncRegex, newSeedFunc);
      fs.writeFileSync(indexPath, indexContent, 'utf8');
      console.log(`[Success] Updated ${indexPath}`);
    }
  }

  // 4. Update lib/supabase/seed.sql
  function escapeSql(str) {
    if (str === null || str === undefined) return 'NULL';
    return "'" + String(str).replace(/'/g, "''") + "'";
  }

  const tilesSqlValues = tiles.map(t => {
    return `(${escapeSql(t.id)}, ${escapeSql(t.type)}, ${escapeSql(t.size)}, ${t.order_val}, ${t.order_val_mobile}, ${Boolean(t.is_hidden)}, ${Boolean(t.is_active)}, ${escapeSql(t.content)}, ${escapeSql(t.created_at)}, ${escapeSql(t.updated_at)}, ${escapeSql(t.deep_dive)})`;
  }).join(',\n');

  const detailedSqlValues = detailedItems.map(item => {
    return `(${escapeSql(item.id)}, ${escapeSql(item.type)}, ${escapeSql(item.title)}, ${escapeSql(item.subtitle)}, ${escapeSql(item.date_range)}, ${escapeSql(item.content)}, ${escapeSql(item.deep_dive)}, ${item.order_val})`;
  }).join(',\n');

  const sqlContent = `-- Delete all existing tiles to prevent duplicate keys
DELETE FROM public.tiles;

-- Seed tiles with updated production-grade data
INSERT INTO public.tiles (
  id, type, size, order_val, order_val_mobile, is_hidden, is_active, content, created_at, updated_at, deep_dive
) VALUES 
${tilesSqlValues};

-- Delete all existing detailed items to prevent duplicate keys
DELETE FROM public.detailed_items;

-- Seed detailed items with updated production-grade data
INSERT INTO public.detailed_items (
  id, type, title, subtitle, date_range, content, deep_dive, order_val
) VALUES
${detailedSqlValues};
`;

  fs.writeFileSync(seedSqlPath, sqlContent, 'utf8');
  console.log(`[Success] Updated ${seedSqlPath}`);

  console.log('\n[Done] All seed data is now synchronized with data/portfolio.db!');
} catch (err) {
  console.error('[Error] Failed to sync seed data:', err);
  process.exit(1);
}
