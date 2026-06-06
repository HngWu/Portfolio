-- 1. 更新 Hero Tile (Identity)
UPDATE public.tiles 
SET content = jsonb_build_object(
  'role', 'Software Engineer',
  'mark', 'HW',
  'description', 'Creative Developer / Systems Architect. Specialized in high-performance web applications and immersive interfaces. Dark minimalist, cinematic UX.'
),
order_val_mobile = 1
WHERE type = 'hero';

-- 2. 更新 Experience (DBS Bank)
UPDATE public.tiles 
SET 
  content = jsonb_build_object(
    'role', 'Software Engineer Intern',
    'company', 'DBS Bank',
    'date', 'Apr 2025 - Mar 2026',
    'highlights', jsonb_build_array(
      'Led full-stack system migrations and automated pipeline deployments',
      'Optimized data processing to speed up heavy application modules',
      'Headed front-end overhauls and A/B testing to increase click-through rates',
      'Managed database version control for seamless multi-environment deployments'
    )
  ),
  deep_dive = jsonb_build_object(
    'highlights', jsonb_build_array(
      'Migrated Martech Request Portal from MongoDB to MariaDB using Java Spring Boot APIs',
      'Automated CI/CD deployment pipelines using Jenkins on OpenShift',
      'Optimized high-data spreadsheet module performance using efficient data structures',
      'Executed front-end A/B testing and tracking via Adobe Target and Adobe Analytics',
      'Managed MariaDB schema changes and version control utilizing Liquibase scripts'
    )
  ),
  order_val_mobile = 9
WHERE type = 'experience';

-- 3. 更新 Education (NYP)
UPDATE public.tiles 
SET 
  content = jsonb_build_object(
    'institution', 'Nanyang Polytechnic',
    'degree', 'Diploma in Information Technology',
    'date', 'Apr 2023 - Apr 2026',
    'gpa', '3.91'
  ),
  deep_dive = jsonb_build_object(
    'merit', true,
    'honours', 'Diploma with Merit'
  ),
  order_val_mobile = 10
WHERE type = 'education';

-- 4. 更新 Project: TriviaDuel
UPDATE public.tiles 
SET 
  content = jsonb_build_object(
    'name', 'TriviaDuel',
    'description', 'Real-time multiplayer trivia platform with resilient AI generation.',
    'tech_stack', jsonb_build_array('Next.js 16', 'Gemini AI', 'Redis', 'Supabase'),
    'github_url', 'https://github.com',
    'featured', true
  ),
  deep_dive = jsonb_build_object(
    'notes', 'Sub-100ms synchronization for 10 players. Multi-model fallback strategy (Gemini → DeepSeek). Features Synapse V2 interactive canvas and AI-powered match roasts.'
  ),
  order_val_mobile = 6
WHERE type = 'project' AND content->>'name' ILIKE '%TriviaDuel%';

-- 5. 更新 Project: SecureAsset
UPDATE public.tiles 
SET 
  content = jsonb_build_object(
    'name', 'SecureAsset',
    'description', 'Forensic watermarking & asset protection with LiquidGlass UI.',
    'tech_stack', jsonb_build_array('React 19', 'Node.js', 'MariaDB', 'Vite'),
    'github_url', 'https://github.com',
    'featured', true
  ),
  deep_dive = jsonb_build_object(
    'notes', 'Supports LSB, DCT, and EXIF embedding layers. Features deep-scan integrity authentication and verifiable digital signatures. Architected as an npm monorepo.'
  ),
  order_val_mobile = 7
WHERE type = 'project' AND content->>'name' ILIKE '%SecureAsset%';

-- 6. 更新 Skills Tags
UPDATE public.tiles 
SET content = jsonb_build_object(
  'tags', jsonb_build_array('Java', 'Spring Boot', 'Next.js 16', 'TypeScript', 'MariaDB', 'OpenShift', 'Jenkins', 'GSAP', 'Three.js')
),
order_val_mobile = 8
WHERE type = 'skill' AND id != 'featured-expertise';

-- 7. 更新 Honours and Awards
UPDATE public.tiles 
SET content = jsonb_build_object(
  'name', 'Worldskills Singapore 2025',
  'issuer', 'WorldSkills',
  'date', 'Apr 2025',
  'desc', 'Silver Medalist in IT Software Solutions for Business.'
),
order_val_mobile = 11
WHERE type = 'award' AND content->>'name' ILIKE '%Worldskills%';

-- 7.1. 更新 Ngee Ann Kongsi Award
UPDATE public.tiles 
SET order_val_mobile = 12
WHERE type = 'award' AND content->>'name' ILIKE '%Ngee Ann Kongsi%';

-- 8. 添加 Featured Expertise (4x5)
INSERT INTO public.tiles (id, type, size, content, deep_dive, order_val, order_val_mobile)
VALUES (
  'featured-expertise',
  'skill',
  '4x5',
  jsonb_build_object(
    'tags', jsonb_build_array('System Architecture', 'Neural Engines', 'Low-Level Optimization', 'Immersive 3D', 'High-Frequency Data'),
    'label', 'Core Mastery'
  ),
  jsonb_build_object(
    'vision', 'Building the next generation of intelligent, high-performance interfaces.',
    'capabilities', jsonb_build_array(
      'Real-time data synchronization at scale',
      'Advanced GSAP & Three.js orchestration',
      'LLM integration and neural bridge architecture',
      'Enterprise-grade full-stack systems'
    )
  ),
  100,
  100
);

-- 9. 更新 Stats Tiles (GPA, Experience, Projects) 的 Deep Dive 数据
UPDATE public.tiles 
SET deep_dive = jsonb_build_object(
  'value', '3.91 / 4.00',
  'label', 'Academic Stats',
  'detail', 'Diploma with Merit (Top 10% of cohort). Special focus in Full Stack Development.'
),
order_val_mobile = 2
WHERE type = 'stat' AND content->>'label' = 'GPA';

UPDATE public.tiles 
SET deep_dive = jsonb_build_object(
  'value', '1 Year',
  'label', 'Dev Tenure',
  'detail', 'Professional experience including full-stack engineering at DBS Bank.'
),
order_val_mobile = 3
WHERE type = 'stat' AND content->>'label' = 'Experience';

UPDATE public.tiles 
SET deep_dive = jsonb_build_object(
  'value', '12+ Apps',
  'label', 'Dev Portfolio',
  'detail', 'Production web apps, multi-agent frameworks, and low-level CLI utilities.'
),
order_val_mobile = 4
WHERE type = 'stat' AND content->>'label' = 'Projects';

-- 10. 更新 Contact Tile 的 Content 和 Deep Dive PGP Block
UPDATE public.tiles 
SET 
  content = jsonb_build_object(
    'email', 'hello@hngwu.com',
    'github', 'https://github.com/HngWu',
    'linkedin', 'https://linkedin.com/in/hngwu',
    'telegram', 'https://t.me/hngwu'
  ),
  deep_dive = jsonb_build_object(
    'pgp_key', '-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: OpenPGP.js v4.10.1
Comment: https://openpgpjs.org

xjMEY5G3oBAYJKwYBBAHaRw8BAQdAsK7X8wL5U8zO/Q+pL9eP9B0h1e7h2wJ3m
z9qK8B1w8zCzA3N1c3RfZGV2ZWxvcGVyIDxzeXN0ZW1zQGhuZ3d1LmNvbT7C
OBYEEBYKADgFiEE5Y5G3oBAYJKwYBBAHaRw8BAQdAsK7X8wL5U8zO/Q+pL9e
P9B0h1e7h2wJ3mz9qK8B1w8zCzA3N1c3RfZGV2ZWxvcGVyIDxzeXN0ZW1zQG
huZ3d1LmNvbT4=
-----END PGP PUBLIC KEY BLOCK-----',
    'availability', 'Available Q3 2026',
    'timezone', 'Singapore (SST - UTC+8)'
  ),
  order_val_mobile = 13
WHERE type = 'contact';

-- 11. 更新 3D, Terminal, Easter Egg, Config Tile 的 order_val_mobile
UPDATE public.tiles SET order_val_mobile = 5 WHERE type = '3d';
UPDATE public.tiles SET order_val_mobile = 14 WHERE type = 'terminal';
UPDATE public.tiles SET order_val_mobile = 99 WHERE type = 'easter_egg';
UPDATE public.tiles SET order_val_mobile = 0 WHERE type = 'config';


