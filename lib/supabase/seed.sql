-- ==========================================
-- 1. EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. TABLES
-- ==========================================

-- Bento tile definitions
CREATE TABLE IF NOT EXISTS public.tiles (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        text NOT NULL,              -- 'project' | 'experience' | 'award' | 'skill' | 'contact' | 'stat' | 'hero' | 'terminal' | '3d'
  size        text NOT NULL,              -- '1x1' | '2x2' | '4x2' | '6x4' etc.
  order_val   int DEFAULT 0,
  is_hidden   boolean DEFAULT false,
  is_active   boolean DEFAULT true,
  content     jsonb DEFAULT '{}'::jsonb,  -- flexible content payload
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Project-specific content (joined to tile)
CREATE TABLE IF NOT EXISTS public.projects (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tile_id     uuid REFERENCES public.tiles(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  tech_stack  text[],
  github_url  text,
  live_url    text,
  featured    boolean DEFAULT false,
  deep_dive   jsonb DEFAULT '{}'::jsonb,
  order_val   int DEFAULT 0
);

-- Site config
CREATE TABLE IF NOT EXISTS public.site_config (
  key   text PRIMARY KEY,
  value jsonb
);

-- ==========================================
-- 3. SEED DATA
-- ==========================================

-- SITE CONFIG
INSERT INTO public.site_config (key, value)
VALUES 
  ('theme', '{"primary": "#4AFFB4", "secondary": "#4A8FFF"}'),
  ('mode_default', '"quick"'),
  ('identity', '{"mark": "HW", "title": "Creative Developer"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- TILES
-- We'll insert these and store IDs for referencing in the projects table
WITH t_hero AS (
  INSERT INTO public.tiles (type, size, order_val, content)
  VALUES ('hero', '6x2', 1, '{"role": "Creative Developer", "mark": "HW", "description": "Bridging the gap between engineering and aesthetic design. Dark minimalist, cinematic UX."}')
  RETURNING id
),
t_3d AS (
  INSERT INTO public.tiles (type, size, order_val)
  VALUES ('3d', '6x4', 2)
  RETURNING id
),
t_proj1 AS (
  INSERT INTO public.tiles (type, size, order_val)
  VALUES ('project', '4x3', 3)
  RETURNING id
),
t_proj2 AS (
  INSERT INTO public.tiles (type, size, order_val)
  VALUES ('project', '4x3', 4)
  RETURNING id
),
t_exp1 AS (
  INSERT INTO public.tiles (type, size, order_val, content)
  VALUES ('experience', '4x2', 5, '{"role": "Software Engineer Intern", "company": "DBS Bank", "date": "2024 - Present", "bullets": ["Engineered internal dashboard for transaction monitoring.", "Reduced load times by 40% using React Server Components.", "Collaborated directly with UX researchers for accessibility.", "Wrote comprehensive unit tests yielding 95% coverage."]}')
  RETURNING id
),
t_edu AS (
  INSERT INTO public.tiles (type, size, order_val, content)
  VALUES ('education', '2x2', 6, '{"institution": "Nanyang Polytechnic", "degree": "Diploma in Information Technology", "date": "Apr 2023 - Apr 2026", "gpa": "3.91"}')
  RETURNING id
),
t_term AS (
  INSERT INTO public.tiles (type, size, order_val)
  VALUES ('terminal', '4x2', 7)
  RETURNING id
),
t_stat1 AS (
  INSERT INTO public.tiles (type, size, order_val, content)
  VALUES ('stat', '1x1', 8, '{"value": "3.91", "label": "GPA"}')
  RETURNING id
),
t_stat2 AS (
  INSERT INTO public.tiles (type, size, order_val, content)
  VALUES ('stat', '1x1', 9, '{"value": "1yr", "label": "Experience"}')
  RETURNING id
),
t_stat3 AS (
  INSERT INTO public.tiles (type, size, order_val, content)
  VALUES ('stat', '1x1', 10, '{"value": "12+", "label": "Projects"}')
  RETURNING id
),
t_skill AS (
  INSERT INTO public.tiles (type, size, order_val, content)
  VALUES ('skill', '2x4', 11, '{"tags": ["Next.js", "TypeScript", "React", "GSAP", "Three.js", "Supabase", "TailwindCSS"]}')
  RETURNING id
),
t_award1 AS (
  INSERT INTO public.tiles (type, size, order_val, content)
  VALUES ('award', '3x2', 12, '{"name": "WorldSkills Singapore 2025", "issuer": "WorldSkills", "date": "2025", "desc": "Silver Medal in Web Technologies."}')
  RETURNING id
),
t_award2 AS (
  INSERT INTO public.tiles (type, size, order_val, content)
  VALUES ('award', '3x1', 13, '{"name": "Ngee Ann Kongsi Award", "issuer": "NYP", "date": "2024", "desc": "Academic excellence scholarship."}')
  RETURNING id
),
t_contact AS (
  INSERT INTO public.tiles (type, size, order_val, content)
  VALUES ('contact', '2x2', 14, '{"email": "hello@portfolio.com", "github": "https://github.com", "linkedin": "https://linkedin.com"}')
  RETURNING id
),
t_easter AS (
  INSERT INTO public.tiles (type, size, order_val, is_hidden)
  VALUES ('easter_egg', '3x2', 99, true)
  RETURNING id
)
-- PROJECTS DATA
INSERT INTO public.projects (tile_id, name, description, tech_stack, github_url, featured, deep_dive)
SELECT id, 'TriviaDuel', 'Real-time multiplayer trivia platform.', ARRAY['Next.js', 'Supabase', 'WebSockets'], 'https://github.com', true, '{"notes": "Architected for sub-100ms latency."}' FROM t_proj1
UNION ALL
SELECT id, 'SecureAsset', 'Blockchain asset tracking system.', ARRAY['Solidity', 'React', 'Ethers.js'], 'https://github.com', true, '{"notes": "Decentralized auditing for supply chains."}' FROM t_proj2;

-- ==========================================
-- 4. RLS (Optional, for security)
-- ==========================================
ALTER TABLE public.tiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on tiles" ON public.tiles FOR SELECT USING (true);
CREATE POLICY "Allow public read access on projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access on site_config" ON public.site_config FOR SELECT USING (true);
