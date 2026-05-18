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
      'Full-Stack Migration & DevOps',
      'Performance Optimization',
      'A/B Testing & Data Analytics',
      'Database Management',
      'Experimental UI Development'
    )
  ),
  deep_dive = jsonb_build_object(
    'sections', jsonb_build_array(
      jsonb_build_object(
        'title', 'Full-Stack Migration & DevOps',
        'content', 'Spearheaded the database and backend migration of the Martech Request Portal, transitioning from MongoDB to MariaDB. Developed Java Spring Boot APIs to replace direct database calls and automated deployment using Jenkins pipelines on OpenShift.'
      ),
      jsonb_build_object(
        'title', 'Performance Optimization',
        'content', 'Optimized application performance using data structures, significantly enhancing the responsiveness of high-data spreadsheet modules.'
      ),
      jsonb_build_object(
        'title', 'A/B Testing & Data Analytics',
        'content', 'Led a full-page revamp experiment for the TSP platform. Developed responsive UI using HTML/CSS/JS and integrated Adobe Target and Adobe Analytics to track user engagement and drive data-driven design decisions.'
      ),
      jsonb_build_object(
        'title', 'Database Management',
        'content', 'Managed schema changes and version control using Liquibase scripts for MariaDB, ensuring consistent and reproducible database deployments across environments.'
      ),
      jsonb_build_object(
        'title', 'Experimental UI Development',
        'content', 'Executed multiple front-end experiments, to improve user onboarding and click-through rates.'
      )
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
