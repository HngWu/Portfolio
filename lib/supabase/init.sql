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
  ('c0ffeeee-c0ff-c0ff-c0ff-c0ffeeeeeeee', 'config', '0x0', NULL, NULL, 0, 0, true, true, '{"theme":{"primary":"#4AFFB4","secondary":"#4A8FFF"},"identity":{"mark":"","title":"Creative Developer"},"vault":{"folders":[{"id":"resume","visible":true,"order":1,"files":[{"id":"resume","visible":true,"order":1}]},{"id":"hackathons","visible":true,"order":2,"files":[{"id":"world-skills-cert","visible":true,"order":1},{"id":"polyfintech-hackathon","visible":true,"order":2},{"id":"certificates-of-appreciation","visible":true,"order":3}]},{"id":"scholarships","visible":true,"order":3,"files":[{"id":"ngee-ann-kong-si","visible":true,"order":1},{"id":"testimonial-tan-hng-wu","visible":true,"order":2}]},{"id":"honours","visible":true,"order":4,"files":[{"id":"directors-list-2024-sem1","visible":true,"order":1},{"id":"directors-list-2023-sem2","visible":true,"order":2}]},{"id":"grades","visible":true,"order":5,"files":[{"id":"nyp-results","visible":true,"order":1}]}]}}'::jsonb, '{}'::jsonb, '2026-08-15T04:15:26.772Z', '2026-09-03T04:14:32.933Z'),
  ('4c37c16b-3500-401f-88cb-bf839071a48c', 'hero', '6x4', NULL, NULL, 1, 1, false, true, '{"mark":"Work In progress","role":"Software Engineer","description":"Creative Developer / Systems Architect. Specialized in high-performance web applications and immersive interfaces. Dark minimalist, cinematic UX."}'::jsonb, '{"mark":"Work In progress","role":"Software Engineer","description":"Creative Developer / Systems Architect. Specialized in high-performance web applications and immersive interfaces. Dark minimalist, cinematic UX."}'::jsonb, '2026-08-15T04:15:26.773Z', '2026-08-15T04:15:26.773Z'),
  ('06dec249-48d0-49fd-a4d6-0f515a6c2cc2', '3d', '6x6', NULL, NULL, 2, 5, false, true, '{}'::jsonb, '{}'::jsonb, '2026-08-15T04:15:26.773Z', '2026-08-15T04:15:26.773Z'),
  ('00864e8e-0331-4c86-8b8e-a8d3266749d7', 'experience', '4x5', NULL, NULL, 3, 9, false, true, '{"date":"Apr 2025 - Mar 2026","role":"Software Engineer Intern","company":"DBS Bank","highlights":["Led full-stack system migrations and automated pipeline deployments","Optimized data processing to speed up heavy application modules","Headed front-end overhauls and A/B testing to increase click-through rates","Managed database version control for seamless multi-environment deployments"],"items":[{"id":"dbs-bank","role":"Software Engineer Intern","company":"DBS Bank","date":"Apr 2025 - Mar 2026","category":"Enterprise & Fintech","highlights":["Led full-stack system migrations and automated pipeline deployments","Optimized data processing to speed up heavy application modules","Headed front-end overhauls and A/B testing to increase click-through rates","Managed database version control for seamless multi-environment deployments"],"deepDiveHighlights":["Migrated Martech Request Portal from MongoDB to MariaDB using Java Spring Boot APIs","Automated CI/CD deployment pipelines using Jenkins on OpenShift","Optimized high-data spreadsheet module performance using efficient data structures","Executed front-end A/B testing and tracking via Adobe Target and Adobe Analytics","Managed MariaDB schema changes and version control utilizing Liquibase scripts"]},{"id":"freelance-dev","role":"Full-Stack & Creative Developer","company":"Freelance / Client Projects","date":"Jan 2024 - Present","category":"Web & 3D Engineering","highlights":["Engineered high-performance Next.js web applications and 3D WebGL interfaces","Built scalable RESTful & realtime database integrations with Supabase & Redis","Designed dark minimalist aesthetics with GSAP timelines and Tailwind CSS v4","Optimized Core Web Vitals achieving 98+ Lighthouse scores across client sites"],"deepDiveHighlights":["Architected interactive client portals utilizing Next.js 16 App Router and Turbopack","Implemented hardware-accelerated 3D viewports utilizing Three.js and custom GLSL shaders","Integrated Stripe payments, OAuth auth flows, and automated edge cron pipelines","Delivered maintainable component systems with comprehensive TypeScript coverage"]},{"id":"nyp-ta","role":"Teaching Assistant & Student Developer","company":"Nanyang Polytechnic","date":"Apr 2023 - Mar 2025","category":"Academic & Mentorship","highlights":["Mentored junior peers in Data Structures, Algorithms, and Object-Oriented Programming","Built internal lab assessment scripts and automated test suites","Facilitated hands-on workshops on modern Web technologies and Git version control"],"deepDiveHighlights":["Conducted weekly lab consultation sessions for over 60+ computing students per semester","Created automated grading test suites in Java and Python, reducing grading turnaround by 40%","Authored interactive step-by-step developer guides for modern Git version control workflows"]},{"id":"open-source","role":"Open Source Contributor","company":"Independent & Community","date":"2023 - Present","category":"Open Source & Labs","highlights":["Developed and published full-stack developer tools and UI starter templates","Contributed bug fixes and documentation enhancements to modern JS ecosystems","Authored open-source real-time multiplayer and graphics experiments"],"deepDiveHighlights":["Built TriviaDuel (real-time multiplayer AI platform) and SecureAsset (watermarking engine)","Engineered custom React hooks and Zustand middleware for cross-tab state syncing","Maintained active GitHub repositories with CI/CD automated test workflows"]}]}'::jsonb, '{"highlights":["Migrated Martech Request Portal from MongoDB to MariaDB using Java Spring Boot APIs","Automated CI/CD deployment pipelines using Jenkins on OpenShift","Optimized high-data spreadsheet module performance using efficient data structures","Executed front-end A/B testing and tracking via Adobe Target and Adobe Analytics","Managed MariaDB schema changes and version control utilizing Liquibase scripts"],"items":[{"id":"dbs-bank","role":"Software Engineer Intern","company":"DBS Bank","date":"Apr 2025 - Mar 2026","category":"Enterprise & Fintech","highlights":["Led full-stack system migrations and automated pipeline deployments","Optimized data processing to speed up heavy application modules","Headed front-end overhauls and A/B testing to increase click-through rates","Managed database version control for seamless multi-environment deployments"],"deepDiveHighlights":["Migrated Martech Request Portal from MongoDB to MariaDB using Java Spring Boot APIs","Automated CI/CD deployment pipelines using Jenkins on OpenShift","Optimized high-data spreadsheet module performance using efficient data structures","Executed front-end A/B testing and tracking via Adobe Target and Adobe Analytics","Managed MariaDB schema changes and version control utilizing Liquibase scripts"]},{"id":"freelance-dev","role":"Full-Stack & Creative Developer","company":"Freelance / Client Projects","date":"Jan 2024 - Present","category":"Web & 3D Engineering","highlights":["Engineered high-performance Next.js web applications and 3D WebGL interfaces","Built scalable RESTful & realtime database integrations with Supabase & Redis","Designed dark minimalist aesthetics with GSAP timelines and Tailwind CSS v4","Optimized Core Web Vitals achieving 98+ Lighthouse scores across client sites"],"deepDiveHighlights":["Architected interactive client portals utilizing Next.js 16 App Router and Turbopack","Implemented hardware-accelerated 3D viewports utilizing Three.js and custom GLSL shaders","Integrated Stripe payments, OAuth auth flows, and automated edge cron pipelines","Delivered maintainable component systems with comprehensive TypeScript coverage"]},{"id":"nyp-ta","role":"Teaching Assistant & Student Developer","company":"Nanyang Polytechnic","date":"Apr 2023 - Mar 2025","category":"Academic & Mentorship","highlights":["Mentored junior peers in Data Structures, Algorithms, and Object-Oriented Programming","Built internal lab assessment scripts and automated test suites","Facilitated hands-on workshops on modern Web technologies and Git version control"],"deepDiveHighlights":["Conducted weekly lab consultation sessions for over 60+ computing students per semester","Created automated grading test suites in Java and Python, reducing grading turnaround by 40%","Authored interactive step-by-step developer guides for modern Git version control workflows"]},{"id":"open-source","role":"Open Source Contributor","company":"Independent & Community","date":"2023 - Present","category":"Open Source & Labs","highlights":["Developed and published full-stack developer tools and UI starter templates","Contributed bug fixes and documentation enhancements to modern JS ecosystems","Authored open-source real-time multiplayer and graphics experiments"],"deepDiveHighlights":["Built TriviaDuel (real-time multiplayer AI platform) and SecureAsset (watermarking engine)","Engineered custom React hooks and Zustand middleware for cross-tab state syncing","Maintained active GitHub repositories with CI/CD automated test workflows"]}]}'::jsonb, '2026-08-15T04:15:26.773Z', '2026-08-15T04:15:26.773Z'),
  ('be785d85-53cc-4056-b82f-c6d760e8dcfe', 'terminal', '4x4', NULL, NULL, 4, 14, false, true, '{}'::jsonb, '{}'::jsonb, '2026-08-15T04:15:26.773Z', '2026-08-15T04:15:26.773Z'),
  ('ed2cd7ef-4d2c-4ebd-98be-70eb116c7db2', 'project', '4x3', NULL, NULL, 5, 6, false, true, '{"name":"TriviaDuel","featured":true,"github_url":"https://github.com","tech_stack":["Next.js 16","Gemini AI","Redis","SQLite"],"description":"Real-time multiplayer trivia platform with resilient AI generation."}'::jsonb, '{"notes":"Sub-100ms synchronization for 10 players. Multi-model fallback strategy (Gemini → DeepSeek). Features Synapse V2 interactive canvas and AI-powered match roasts."}'::jsonb, '2026-08-15T04:15:26.773Z', '2026-08-15T04:15:26.773Z'),
  ('3f7e4572-aa64-4447-b00b-84edb8c5fa8c', 'education', '4x3', NULL, NULL, 6, 10, false, true, '{"gpa":"3.91","date":"Apr 2023 - Apr 2026","degree":"Diploma in Information Technology with Merit","institution":"Nanyang Polytechnic","items":[{"id":"nus-bcomp","level":"university","levelLabel":"University","institution":"National University of Singapore","degree":"Bachelor of Computing in Computer Science","date":"Aug 2028 - Aug 2032","gpa":"-","honours":"Direct Honours Track","highlights":["Distributed Systems & AI Track","Dean''s Merit Pre-admit"],"caption":"Incoming Computer Science undergraduate."},{"id":"nyp-dit","level":"polytechnic","levelLabel":"Diploma","institution":"Nanyang Polytechnic","degree":"Diploma in Information Technology with Merit","date":"Apr 2023 - Apr 2026","gpa":"3.91","honours":"Gold Medalist & Ngee Ann Kongsi Tertiary Award","highlights":["Cumulative GPA 3.91 / 4.00","Specialization in Enterprise Software","Gold Medalist Awardee"],"caption":"Graduated with Merit and Gold Medalist recognition."},{"id":"cchy-olevel","level":"secondary","levelLabel":"Secondary","institution":"Chung Cheng High School (Yishun)","degree":"Singapore-Cambridge GCE O-Level","date":"Jan 2019 - Dec 2022","gpa":"-","honours":"Distinction in Computing & Mathematics","highlights":["Computing Distinction","Math Olympiad Delegate"],"caption":"Strong foundational STEM & computing background."},{"id":"peiying-psle","level":"primary","levelLabel":"Primary","institution":"Peiying Primary School","degree":"Primary School Leaving Examination (PSLE)","date":"Jan 2013 - Dec 2018","gpa":"251","honours":"Top in Cohort in Mathematics","highlights":["Score: 251 / 300","Top in Cohort in Math"],"caption":"Early academic excellence award."}]}'::jsonb, '{"gpa":"3.91","date":"Apr 2023 - Apr 2026","degree":"Diploma in Information Technology with Merit","institution":"Nanyang Polytechnic","honours":"Gold Medalist & Ngee Ann Kongsi Tertiary Award","items":[{"id":"nus-bcomp","level":"university","levelLabel":"University","institution":"National University of Singapore","degree":"Bachelor of Computing in Computer Science","date":"Aug 2028 - Aug 2032","gpa":"-","honours":"Direct Honours Track","highlights":["Distributed Systems & AI Track","Dean''s Merit Pre-admit"],"caption":"Incoming Computer Science undergraduate."},{"id":"nyp-dit","level":"polytechnic","levelLabel":"Diploma","institution":"Nanyang Polytechnic","degree":"Diploma in Information Technology with Merit","date":"Apr 2023 - Apr 2026","gpa":"3.91","honours":"Gold Medalist & Ngee Ann Kongsi Tertiary Award","highlights":["Cumulative GPA 3.91 / 4.00","Specialization in Enterprise Software","Gold Medalist Awardee"],"caption":"Graduated with Merit and Gold Medalist recognition."},{"id":"cchy-olevel","level":"secondary","levelLabel":"Secondary","institution":"Chung Cheng High School (Yishun)","degree":"Singapore-Cambridge GCE O-Level","date":"Jan 2019 - Dec 2022","gpa":"-","honours":"Distinction in Computing & Mathematics","highlights":["Computing Distinction","Math Olympiad Delegate"],"caption":"Strong foundational STEM & computing background."},{"id":"peiying-psle","level":"primary","levelLabel":"Primary","institution":"Peiying Primary School","degree":"Primary School Leaving Examination (PSLE)","date":"Jan 2013 - Dec 2018","gpa":"251","honours":"Top in Cohort in Mathematics","highlights":["Score: 251 / 300","Top in Cohort in Math"],"caption":"Early academic excellence award."}]}'::jsonb, '2026-08-15T04:15:26.773Z', '2026-08-15T04:15:26.773Z'),
  ('f23beffe-536e-495f-b1b0-4ad5cb32411c', 'project', '4x3', NULL, NULL, 7, 7, false, true, '{"name":"SecureAsset","featured":true,"github_url":"https://github.com","tech_stack":["React 19","Node.js","MariaDB","Vite"],"description":"Forensic watermarking & asset protection with LiquidGlass UI."}'::jsonb, '{"notes":"Supports LSB, DCT, and EXIF embedding layers. Features deep-scan integrity authentication and verifiable digital signatures. Architected as an npm monorepo."}'::jsonb, '2026-08-15T04:15:26.773Z', '2026-08-15T04:15:26.773Z'),
  ('7677aac8-2bc8-4b10-afae-2e412e7fbd67', 'stat', '2x2', NULL, NULL, 8, 3, false, true, '{"label":"Experience","value":"1yr"}'::jsonb, '{"label":"Experience","value":"1yr"}'::jsonb, '2026-08-15T04:15:26.773Z', '2026-08-15T04:15:26.773Z'),
  ('89c3dfb7-d275-44cf-a983-ebc14e2fea4d', 'stat', '2x2', NULL, NULL, 9, 2, false, true, '{"label":"Repos","value":"20+"}'::jsonb, '{"label":"Repositories","value":"20+"}'::jsonb, '2026-08-15T04:15:26.773Z', '2026-08-15T04:15:26.773Z'),
  ('63e410d8-2f2b-4ef6-8585-ce77dae36d1d', 'stat', '2x2', NULL, NULL, 10, 4, false, true, '{"label":"Projects","value":"12+"}'::jsonb, '{}'::jsonb, '2026-08-15T04:15:26.773Z', '2026-08-15T04:15:26.773Z'),
  ('f2935ab8-63d6-4451-96f3-fb0c67cfe2b4', 'contact', '4x3', NULL, NULL, 11, 13, false, true, '{"email":"hngwudev@gmail.com","github":"https://github.com/HngWu","linkedin":"https://linkedin.com/in/hngwu","telegram":"https://t.me/hngwu"}'::jsonb, '{"timezone":"Singapore (SST - UTC+8)","availability":"Available Q3 2026"}'::jsonb, '2026-08-15T04:15:26.773Z', '2026-08-15T04:15:26.773Z'),
  ('43c1c71b-78d5-4795-9a13-bf011c0f00b4', 'skill', '4x3', NULL, NULL, 12, 8, false, true, '{"tags":["Java","Spring Boot","Next.js 16","TypeScript","MariaDB","OpenShift","Jenkins","GSAP","Three.js"]}'::jsonb, '{}'::jsonb, '2026-08-15T04:15:26.773Z', '2026-08-15T04:15:26.773Z'),
  ('a899769a-d97c-4ace-90b5-0a6ccc62271b', 'award', '3x3', NULL, NULL, 13, 12, true, true, '{"date":"Aug 2025","desc":"Academic excellence scholarship for AY 2025/26.","name":"Ngee Ann Kongsi Tertiary Award","issuer":"NYP"}'::jsonb, '{}'::jsonb, '2026-08-15T04:15:26.773Z', '2026-08-15T04:15:26.773Z'),
  ('bcf40014-b29c-4c60-818f-f3e5d283b7f0', 'easter_egg', '3x2', NULL, NULL, 14, 99, true, true, '{}'::jsonb, '{}'::jsonb, '2026-08-15T04:15:26.773Z', '2026-08-15T04:15:26.773Z'),
  ('f90f7424-251e-47c5-80b4-d93b127f4861', 'award', '3x2', NULL, NULL, 15, 11, true, true, '{"date":"Apr 2025","desc":"Silver Medalist in IT Software Solutions for Business.","name":"Worldskills Singapore 2025","issuer":"WorldSkills"}'::jsonb, '{}'::jsonb, '2026-08-15T04:15:26.773Z', '2026-08-15T04:15:26.773Z');

-- Seed detailed items
INSERT INTO public.detailed_items (
  id, type, title, subtitle, date_range, content, deep_dive, order_val, created_at, updated_at
) VALUES
  ('00000000-0000-0000-0000-000000000003', 'education', 'Diploma in Information Technology with Merit', 'Nanyang Polytechnic', 'Apr 2023 - Apr 2026', '{"gpa":"3.91"}'::jsonb, '{"gpa":"3.91","degree":"Diploma in Information Technology with Merit","institution":"Nanyang Polytechnic","honours":"Gold Medalist & Ngee Ann Kongsi Tertiary Award"}'::jsonb, 0, '2026-08-15T04:15:26.774Z', '2026-08-30T13:08:13.154Z'),
  ('4e0d4deb-e74f-4db4-adf0-1e20ab65a0fa', 'education', 'PSLE', 'Peiying Primary School', 'Jan 2013 - Dec 2018', '{"gpa":"251"}'::jsonb, '{"gpa":"251","degree":"PSLE","institution":"Peiying","honours":"Top in cohort in Math"}'::jsonb, 0, '2026-08-30T12:39:51.876Z', '2026-08-30T12:39:51.876Z'),
  ('f38c634d-6439-47b2-a72a-c0afa06023c8', 'education', 'Bachelor Degree in Computer Science', 'National University of Singapore', 'Aug 2028 - Aug 2032', '{"gpa":"-"}'::jsonb, '{"gpa":"-","degree":"Bachelor Degree in Computer Science","institution":"National University of Singapore","honours":"-"}'::jsonb, 0, '2026-08-30T12:42:56.138Z', '2026-08-30T12:42:56.138Z'),
  ('00000000-0000-0000-0000-000000000001', 'experience', 'Software Engineer Intern', 'DBS Bank', 'Apr 2025 - Mar 2026', '{"highlights":["Led full-stack system migrations and automated pipeline deployments","Optimized data processing to speed up heavy application modules","Headed front-end overhauls and A/B testing to increase click-through rates","Managed database version control for seamless multi-environment deployments"]}'::jsonb, '{"highlights":["Migrated Martech Request Portal from MongoDB to MariaDB using Java Spring Boot APIs","Automated CI/CD deployment pipelines using Jenkins on OpenShift","Optimized high-data spreadsheet module performance using efficient data structures","Executed front-end A/B testing and tracking via Adobe Target and Adobe Analytics","Managed MariaDB schema changes and version control utilizing Liquibase scripts"]}'::jsonb, 1, '2026-08-15T04:15:26.774Z', '2026-08-15T04:15:26.774Z'),
  ('00000000-0000-0000-0000-000000000005', 'project', 'TriviaDuel', 'Real-time multiplayer trivia platform with resilient AI generation.', '2025', '{"tech_stack":["Next.js 16","Gemini AI","Redis","SQLite"],"github_url":"https://github.com","live_url":"https://triviaduel.dev","featured":true}'::jsonb, '{"notes":"Sub-100ms synchronization for 10 players. Multi-model fallback strategy (Gemini → DeepSeek). Features Synapse V2 interactive canvas and AI-powered match roasts."}'::jsonb, 1, '2026-08-15T04:15:26.774Z', '2026-08-15T04:15:26.774Z'),
  ('00000000-0000-0000-0000-000000000006', 'project', 'SecureAsset', 'Forensic watermarking & asset protection with LiquidGlass UI.', '2025', '{"tech_stack":["React 19","Node.js","MariaDB","Vite"],"github_url":"https://github.com","live_url":"https://secureasset.dev","featured":true}'::jsonb, '{"notes":"Supports LSB, DCT, and EXIF embedding layers. Features deep-scan integrity authentication and verifiable digital signatures. Architected as an npm monorepo."}'::jsonb, 2, '2026-08-15T04:15:26.775Z', '2026-08-15T04:15:26.775Z'),
  ('00000000-0000-0000-0000-000000000007', 'project', 'LumeGlass Portfolio', 'Cinematic, dark minimalist portfolio showing modern animations and 3D visual elements.', '2026', '{"tech_stack":["Next.js 16","Tailwind CSS v4","React Three Fiber","GSAP"],"github_url":"https://github.com","live_url":"https://portfolio.dev","featured":false}'::jsonb, '{"notes":"Implements custom GSAP timelines for bento grid navigation and R3F interactive canvas layers."}'::jsonb, 3, '2026-08-15T04:15:26.775Z', '2026-08-15T04:15:26.775Z'),
  ('bc55590b-7a12-40e4-97f1-c21526c97488', 'education', 'O Level', 'Chung Cheng High School (Yishun)', 'Jan 2019 - Dec 2022', '{"gpa":""}'::jsonb, '{"gpa":"","degree":"","institution":"","honours":""}'::jsonb, 3, '2026-08-30T12:33:38.792Z', '2026-08-30T13:08:00.194Z'),
  ('00000000-0000-0000-0000-000000000008', 'project', 'Arcturus Engine', 'WebGL-based real-time voxel graphics engine featuring volumetric lightning.', '2025', '{"tech_stack":["Three.js","GLSL Shaders","TypeScript","Vite"],"github_url":"https://github.com","live_url":"https://arcturus.dev","featured":true}'::jsonb, '{"notes":"Volumetric rays are rendered using a custom screen-space post-processing shader. Multi-threaded octave chunking maps geometry in parallel."}'::jsonb, 4, '2026-08-15T04:15:26.775Z', '2026-08-15T04:15:26.775Z');

-- Seed initial default system settings
INSERT INTO public.system_settings (key, value, updated_at)
VALUES ('database_provider', 'sqlite', now())
ON CONFLICT (key) DO NOTHING;
