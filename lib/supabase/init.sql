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
  order_val_mobile int DEFAULT 0,
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

DELETE FROM public.tiles;

INSERT INTO public.tiles (
  id, type, size, order_val, order_val_mobile, is_hidden, is_active, content, created_at, updated_at, deep_dive
) VALUES 
('c0ffeeee-c0ff-c0ff-c0ff-c0ffeeeeeeee', 'config', '0x0', 0, 0, true, true, '{"theme": {"primary": "#4AFFB4", "secondary": "#4A8FFF"}, "identity": {"mark": "HW", "title": "Creative Developer"}}', '2026-05-16 17:45:49.238036+00', '2026-05-16 17:45:49.238036+00', '{}'),
('00864e8e-0331-4c86-8b8e-a8d3266749d7', 'experience', '4x5', 3, 9, false, true, '{"date":"Apr 2025 - Mar 2026","role":"Software Engineer Intern","company":"DBS Bank","highlights":["Led full-stack system migrations and automated pipeline deployments","Optimized data processing to speed up heavy application modules","Headed front-end overhauls and A/B testing to increase click-through rates","Managed database version control for seamless multi-environment deployments"]}', '2026-05-16 17:45:49.238036+00', '2026-05-16 17:45:49.238036+00', '{"highlights":["Migrated Martech Request Portal from MongoDB to MariaDB using Java Spring Boot APIs","Automated CI/CD deployment pipelines using Jenkins on OpenShift","Optimized high-data spreadsheet module performance using efficient data structures","Executed front-end A/B testing and tracking via Adobe Target and Adobe Analytics","Managed MariaDB schema changes and version control utilizing Liquibase scripts"]}'),
('06dec249-48d0-49fd-a4d6-0f515a6c2cc2', '3d', '6x6', 2, 5, false, true, '{}', '2026-05-16 17:45:49.238036+00', '2026-05-16 17:45:49.238036+00', '{}'),
('3f7e4572-aa64-4447-b00b-84edb8c5fa8c', 'education', '4x3', 6, 10, false, true, '{"gpa":"3.91","date":"Apr 2023 - Apr 2026","degree":"Diploma in Information Technology with Merit","institution":"Nanyang Polytechnic"}', '2026-05-16 17:45:49.238036+00', '2026-05-16 17:45:49.238036+00', '{"gpa":"3","date":"Apr 2023 - Apr 2026","degree":"Diploma in Information Technology with merit","institution":"Nanyang Polytechnic"}'),
('43c1c71b-78d5-4795-9a13-bf011c0f00b4', 'skill', '4x3', 12, 8, false, true, '{"tags":["Java","Spring Boot","Next.js 16","TypeScript","MariaDB","OpenShift","Jenkins","GSAP","Three.js"]}', '2026-05-16 17:45:49.238036+00', '2026-05-16 17:45:49.238036+00', '{}'),
('4c37c16b-3500-401f-88cb-bf839071a48c', 'hero', '6x4', 1, 1, false, true, '{"mark":"Work In progress","role":"Software Engineer","description":"Creative Developer / Systems Architect. Specialized in high-performance web applications and immersive interfaces. Dark minimalist, cinematic UX."}', '2026-05-16 17:45:49.238036+00', '2026-05-16 17:45:49.238036+00', '{"mark":"Work In progress","role":"Software Engineer","description":"Creative Developer / Systems Architect. Specialized in high-performance web applications and immersive interfaces. Dark minimalist, cinematic UX."}'),
('63e410d8-2f2b-4ef6-8585-ce77dae36d1d', 'stat', '2x2', 10, 4, false, true, '{"label":"Projects","value":"12+"}', '2026-05-16 17:45:49.238036+00', '2026-05-16 17:45:49.238036+00', '{}'),
('7677aac8-2bc8-4b10-afae-2e412e7fbd67', 'stat', '2x2', 8, 3, false, true, '{"label":"Experience","value":"1yr"}', '2026-05-16 17:45:49.238036+00', '2026-05-16 17:45:49.238036+00', '{"label":"Experience","value":"1yr"}'),
('89c3dfb7-d275-44cf-a983-ebc14e2fea4d', 'stat', '2x2', 9, 2, false, true, '{"label":"Repos","value":"20+"}', '2026-05-16 17:45:49.238036+00', '2026-05-16 17:45:49.238036+00', '{"label":"Repositories","value":"20+"}'),
('a899769a-d97c-4ace-90b5-0a6ccc62271b', 'award', '3x3', 13, 12, true, true, '{"date":"Aug 2025","desc":"Academic excellence scholarship for AY 2025/26.","name":"Ngee Ann Kongsi Tertiary Award","issuer":"NYP"}', '2026-05-16 17:45:49.238036+00', '2026-05-16 17:45:49.238036+00', '{}'),
('bcf40014-b29c-4c60-818f-f3e5d283b7f0', 'easter_egg', '3x2', 14, 99, true, true, '{}', '2026-05-16 17:45:49.238036+00', '2026-05-16 17:45:49.238036+00', '{}'),
('be785d85-53cc-4056-b82f-c6d760e8dcfe', 'terminal', '4x4', 4, 14, false, true, '{}', '2026-05-16 17:45:49.238036+00', '2026-05-16 17:45:49.238036+00', '{}'),
('ed2cd7ef-4d2c-4ebd-98be-70eb116c7db2', 'project', '4x3', 5, 6, false, true, '{"name":"TriviaDuel","featured":true,"github_url":"https://github.com","tech_stack":["Next.js 16","Gemini AI","Redis","Supabase"],"description":"Real-time multiplayer trivia platform with resilient AI generation."}', '2026-05-16 17:45:49.238036+00', '2026-05-16 17:45:49.238036+00', '{"notes":"Sub-100ms synchronization for 10 players. Multi-model fallback strategy (Gemini → DeepSeek). Features Synapse V2 interactive canvas and AI-powered match roasts."}'),
('f23beffe-536e-495f-b1b0-4ad5cb32411c', 'project', '4x3', 7, 7, false, true, '{"name":"SecureAsset","featured":true,"github_url":"https://github.com","tech_stack":["React 19","Node.js","MariaDB","Vite"],"description":"Forensic watermarking & asset protection with LiquidGlass UI."}', '2026-05-16 17:45:49.238036+00', '2026-05-16 17:45:49.238036+00', '{"notes":"Supports LSB, DCT, and EXIF embedding layers. Features deep-scan integrity authentication and verifiable digital signatures. Architected as an npm monorepo."}'),
('f2935ab8-63d6-4451-96f3-fb0c67cfe2b4', 'contact', '4x3', 11, 13, false, true, '{"email":"hngwudev@gmail.com","github":"https://github.com/HngWu","linkedin":"https://linkedin.com/in/hngwu","telegram":"https://t.me/hngwu"}', '2026-05-16 17:45:49.238036+00', '2026-05-16 17:45:49.238036+00', '{"timezone":"Singapore (SST - UTC+8)","availability":"Available Q3 2026"}'),
('f90f7424-251e-47c5-80b4-d93b127f4861', 'award', '3x2', 15, 11, true, true, '{"date":"Apr 2025","desc":"Silver Medalist in IT Software Solutions for Business.","name":"Worldskills Singapore 2025","issuer":"WorldSkills"}', '2026-05-16 17:45:49.238036+00', '2026-05-16 17:45:49.238036+00', '{}');
