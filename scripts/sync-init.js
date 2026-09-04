/* eslint-disable @typescript-eslint/no-require-imports */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const dbPath = path.join(rootDir, 'data', 'portfolio.db');
const initSqlPath = path.join(rootDir, 'lib', 'supabase', 'init.sql');

if (!fs.existsSync(dbPath)) {
  console.error(`[Error] Database file not found at: ${dbPath}`);
  process.exit(1);
}

try {
  const db = new Database(dbPath);

  const tiles = db.prepare('SELECT * FROM tiles ORDER BY order_val ASC, id ASC').all();
  const detailedItems = db.prepare('SELECT * FROM detailed_items ORDER BY order_val ASC, id ASC').all();

  console.log(`[Sync] Read ${tiles.length} tiles and ${detailedItems.length} detailed_items from portfolio.db`);

  function escapeSql(str) {
    if (str === null || str === undefined) return 'NULL';
    return "'" + String(str).replace(/'/g, "''") + "'";
  }

  const tilesSqlValues = tiles.map(t => {
    return `  (${escapeSql(t.id)}, ${escapeSql(t.type)}, ${escapeSql(t.size)}, ${t.col_start === null ? 'NULL' : t.col_start}, ${t.row_start === null ? 'NULL' : t.row_start}, ${t.order_val}, ${t.order_val_mobile}, ${Boolean(t.is_hidden)}, ${Boolean(t.is_active)}, ${escapeSql(t.content)}::jsonb, ${escapeSql(t.deep_dive)}::jsonb, ${escapeSql(t.created_at)}, ${escapeSql(t.updated_at)})`;
  }).join(',\n');

  const detailedSqlValues = detailedItems.map(item => {
    return `  (${escapeSql(item.id)}, ${escapeSql(item.type)}, ${escapeSql(item.title)}, ${escapeSql(item.subtitle)}, ${escapeSql(item.date_range)}, ${escapeSql(item.content)}::jsonb, ${escapeSql(item.deep_dive)}::jsonb, ${item.order_val}, ${escapeSql(item.created_at)}, ${escapeSql(item.updated_at)})`;
  }).join(',\n');

  const sqlContent = `-- ==========================================
-- 1. EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. TABLES
-- ==========================================

-- Consolidated Bento tile system
-- Stores all content, structure, and configuration
CREATE TABLE IF NOT EXISTS public.tiles (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type             text NOT NULL,              -- 'project' | 'experience' | 'award' | 'skill' | 'contact' | 'stat' | 'hero' | 'terminal' | '3d' | 'config'
  size             text NOT NULL,              -- '1x1' | '2x2' | '4x2' | '6x4' etc.
  col_start        int DEFAULT NULL,
  row_start        int DEFAULT NULL,
  order_val        int DEFAULT 0,
  order_val_mobile int DEFAULT 0,
  is_hidden        boolean DEFAULT false,
  is_active        boolean DEFAULT true,
  content          jsonb DEFAULT '{}'::jsonb,  -- flexible content payload
  deep_dive        jsonb DEFAULT '{}'::jsonb,  -- flippable back-face content
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- Unified detailed items table for career, education, and projects details
CREATE TABLE IF NOT EXISTS public.detailed_items (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        text NOT NULL,              -- 'project' | 'experience' | 'education'
  title       text NOT NULL,              -- e.g. project name, experience role, education degree
  subtitle    text,                       -- e.g. company, institution
  date_range  text,                       -- e.g. "Apr 2025 - Mar 2026"
  content     jsonb DEFAULT '{}'::jsonb,  -- flexible content payload
  deep_dive   jsonb DEFAULT '{}'::jsonb,  -- deep dive details
  order_val   int DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Application system settings table (e.g. active database provider override)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key         text PRIMARY KEY,
  value       text NOT NULL,
  updated_at  timestamptz DEFAULT now()
);

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public.tiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detailed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist so this script is idempotent
DROP POLICY IF EXISTS "Allow public read access on tiles" ON public.tiles;
DROP POLICY IF EXISTS "Admin full access on tiles" ON public.tiles;
DROP POLICY IF EXISTS "Allow public read access on detailed_items" ON public.detailed_items;
DROP POLICY IF EXISTS "Admin full access on detailed_items" ON public.detailed_items;
DROP POLICY IF EXISTS "Allow public read access on system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admin full access on system_settings" ON public.system_settings;

-- Public Read Access Policies
CREATE POLICY "Allow public read access on tiles" 
ON public.tiles FOR SELECT USING (true);

CREATE POLICY "Allow public read access on detailed_items" 
ON public.detailed_items FOR SELECT USING (true);

CREATE POLICY "Allow public read access on system_settings" 
ON public.system_settings FOR SELECT USING (true);

-- Authenticated / Service Role Full Access Policies
CREATE POLICY "Admin full access on tiles" 
ON public.tiles 
FOR ALL 
TO authenticated, service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Admin full access on detailed_items" 
ON public.detailed_items 
FOR ALL 
TO authenticated, service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Admin full access on system_settings" 
ON public.system_settings 
FOR ALL 
TO authenticated, service_role 
USING (true) 
WITH CHECK (true);

-- ==========================================
-- 4. SEED DATA (Synchronized from portfolio.db)
-- ==========================================

-- Clean existing data
DELETE FROM public.tiles;
DELETE FROM public.detailed_items;
DELETE FROM public.system_settings;

-- Seed tiles
INSERT INTO public.tiles (
  id, type, size, col_start, row_start, order_val, order_val_mobile, is_hidden, is_active, content, deep_dive, created_at, updated_at
) VALUES 
${tilesSqlValues};

-- Seed detailed items
INSERT INTO public.detailed_items (
  id, type, title, subtitle, date_range, content, deep_dive, order_val, created_at, updated_at
) VALUES
${detailedSqlValues};

-- Seed initial default system settings
INSERT INTO public.system_settings (key, value, updated_at)
VALUES ('database_provider', 'sqlite', now())
ON CONFLICT (key) DO NOTHING;
`;

  fs.writeFileSync(initSqlPath, sqlContent, 'utf8');
  console.log(`[Success] Updated ${initSqlPath}`);
  console.log('[Done] lib/supabase/init.sql is now fully synchronized with data/portfolio.db!');
} catch (err) {
  console.error('[Error] Failed to generate init.sql:', err);
  process.exit(1);
}
