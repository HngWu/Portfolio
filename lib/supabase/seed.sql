-- 1. 更新 Hero Tile (Identity)
UPDATE public.tiles 
SET content = jsonb_build_object(
  'role', 'Software Engineer',
  'mark', 'HW',
  'description', 'Creative Developer / Systems Architect. Specialized in high-performance web applications and immersive interfaces. Dark minimalist, cinematic UX.'
)
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
  )
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
  )
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
  )
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
  )
WHERE type = 'project' AND content->>'name' ILIKE '%SecureAsset%';

-- 6. 更新 Skills Tags
UPDATE public.tiles 
SET content = jsonb_build_object(
  'tags', jsonb_build_array('Java', 'Spring Boot', 'Next.js 16', 'TypeScript', 'MariaDB', 'OpenShift', 'Jenkins', 'GSAP', 'Three.js')
)
WHERE type = 'skill';

-- 7. 更新 Honours and Awards
UPDATE public.tiles 
SET content = jsonb_build_object(
  'name', 'Worldskills Singapore 2025',
  'issuer', 'WorldSkills',
  'date', 'Apr 2025',
  'desc', 'Silver Medalist in IT Software Solutions for Business.'
)
WHERE type = 'award' AND content->>'name' ILIKE '%Worldskills%';

-- 8. 添加 Featured Expertise (4x5)
INSERT INTO public.tiles (id, type, size, content, deep_dive, order_val)
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
  100
);
