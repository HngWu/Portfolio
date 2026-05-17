-- ==========================================
-- 1. EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. TABLES
-- ==========================================

-- Consolidated Bento tile system
-- Stores all content, structure, and configuration
CREATE TABLE IF NOT EXISTS public.tiles (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        text NOT NULL,              -- 'project' | 'experience' | 'award' | 'skill' | 'contact' | 'stat' | 'hero' | 'terminal' | '3d' | 'config'
  size        text NOT NULL,              -- '1x1' | '2x2' | '4x2' | '6x4' etc.
  col_start   int DEFAULT NULL,
  row_start   int DEFAULT NULL,
  order_val   int DEFAULT 0,
  is_hidden   boolean DEFAULT false,
  is_active   boolean DEFAULT true,
  content     jsonb DEFAULT '{}'::jsonb,  -- flexible content payload
  deep_dive   jsonb DEFAULT '{}'::jsonb,  -- flippable back-face content
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ==========================================
-- 3. RLS POLICIES
-- ==========================================
ALTER TABLE public.tiles ENABLE ROW LEVEL SECURITY;

-- Public Read Access
CREATE POLICY "Allow public read access on tiles" 
ON public.tiles FOR SELECT USING (true);

-- Admin Full Access (Session-based)
CREATE POLICY "Admin full access on tiles" 
ON public.tiles 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==========================================
-- 4. SEED DATA
-- ==========================================

-- GLOBAL CONFIG TILE
INSERT INTO public.tiles (type, size, order_val, is_hidden, content)
VALUES ('config', '0x0', 0, true, '{"theme": {"primary": "#4AFFB4", "secondary": "#4A8FFF"}, "identity": {"mark": "HW", "title": "Creative Developer"}}');

-- HERO TILE
INSERT INTO public.tiles (type, size, order_val, content)
VALUES ('hero', '6x2', 1, '{"role": "Creative Developer", "mark": "HW", "description": "Bridging the gap between engineering and aesthetic design. Dark minimalist, cinematic UX."}');

-- 3D TILE
INSERT INTO public.tiles (type, size, order_val)
VALUES ('3d', '6x4', 2);

-- PROJECTS
INSERT INTO public.tiles (type, size, order_val, content, deep_dive)
VALUES 
  ('project', '4x3', 3, '{"name": "TriviaDuel", "description": "Real-time multiplayer trivia platform.", "tech_stack": ["Next.js", "Supabase", "WebSockets"], "github_url": "https://github.com", "featured": true}', '{"notes": "Architected for sub-100ms latency."}'),
  ('project', '4x3', 4, '{"name": "SecureAsset", "description": "Blockchain asset tracking system.", "tech_stack": ["Solidity", "React", "Ethers.js"], "github_url": "https://github.com", "featured": true}', '{"notes": "Decentralized auditing for supply chains."}');

-- EXPERIENCE
INSERT INTO public.tiles (type, size, order_val, content)
VALUES ('experience', '4x2', 5, '{"role": "Software Engineer Intern", "company": "DBS Bank", "date": "2024 - Present", "bullets": ["Engineered internal dashboard for transaction monitoring.", "Reduced load times by 40% using React Server Components.", "Collaborated directly with UX researchers for accessibility.", "Wrote comprehensive unit tests yielding 95% coverage."]}');

-- EDUCATION
INSERT INTO public.tiles (type, size, order_val, content)
VALUES ('education', '2x2', 6, '{"institution": "Nanyang Polytechnic", "degree": "Diploma in Information Technology", "date": "Apr 2023 - Apr 2026", "gpa": "3.91"}');

-- TERMINAL
INSERT INTO public.tiles (type, size, order_val)
VALUES ('terminal', '4x2', 7);

-- STATS
INSERT INTO public.tiles (type, size, order_val, content)
VALUES 
  ('stat', '1x1', 8, '{"value": "3.91", "label": "GPA"}'),
  ('stat', '1x1', 9, '{"value": "1yr", "label": "Experience"}'),
  ('stat', '1x1', 10, '{"value": "12+", "label": "Projects"}');

-- SKILLS
INSERT INTO public.tiles (type, size, order_val, content)
VALUES ('skill', '2x4', 11, '{"tags": ["Next.js", "TypeScript", "React", "GSAP", "Three.js", "Supabase", "TailwindCSS"]}');

-- AWARDS
INSERT INTO public.tiles (type, size, order_val, content)
VALUES 
  ('award', '3x2', 12, '{"name": "WorldSkills Singapore 2025", "issuer": "WorldSkills", "date": "2025", "desc": "Silver Medal in Web Technologies."}'),
  ('award', '3x1', 13, '{"name": "Ngee Ann Kongsi Award", "issuer": "NYP", "date": "2024", "desc": "Academic excellence scholarship."}');

-- CONTACT
INSERT INTO public.tiles (type, size, order_val, content)
VALUES ('contact', '2x2', 14, '{"email": "hello@portfolio.com", "github": "https://github.com", "linkedin": "https://linkedin.com"}');

-- EASTER EGG
INSERT INTO public.tiles (type, size, order_val, is_hidden)
VALUES ('easter_egg', '3x2', 99, true);
