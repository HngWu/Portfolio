import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { randomUUID } from 'crypto'
import type { Database as DatabaseTypes } from '@/types/supabase'

export type TileRow = DatabaseTypes['public']['Tables']['tiles']['Row']
export type TileInsert = DatabaseTypes['public']['Tables']['tiles']['Insert']
export type TileUpdate = DatabaseTypes['public']['Tables']['tiles']['Update']

export type DetailedItemRow = DatabaseTypes['public']['Tables']['detailed_items']['Row']
export type DetailedItemInsert = DatabaseTypes['public']['Tables']['detailed_items']['Insert']
export type DetailedItemUpdate = DatabaseTypes['public']['Tables']['detailed_items']['Update']

export interface AdminUserRow {
  id: string
  email: string
  password_hash: string
  salt: string
  failed_attempts: number
  lockout_until: string | null
  created_at: string
  updated_at: string
}

export interface ActiveSessionRow {
  id: string
  user_id: string
  token_hash: string
  expires_at: string
  created_at: string
}

let dbInstance: InstanceType<typeof Database> | null = null

export function getDb(): InstanceType<typeof Database> {
  if (!dbInstance) {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
    let dbPath: string

    if (isServerless) {
      const tmpDir = os.tmpdir()
      dbPath = path.join(tmpDir, 'portfolio.db')
      const sourceDbPath = path.join(/*turbopackIgnore: true*/ process.cwd(), 'data', 'portfolio.db')

      if (!fs.existsSync(dbPath) && fs.existsSync(sourceDbPath)) {
        try {
          fs.copyFileSync(sourceDbPath, dbPath)
        } catch (e) {
          console.warn("[DB] Failed to copy seed portfolio.db to /tmp:", e)
        }
      }
    } else {
      const dataDir = path.join(/*turbopackIgnore: true*/ process.cwd(), 'data')
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      dbPath = path.join(dataDir, 'portfolio.db')
    }

    dbInstance = new Database(dbPath)
    try {
      dbInstance.pragma('journal_mode = WAL')
    } catch {
      // In certain environments/filesystems WAL might not be supported, ignore gracefully
    }
    initSchema(dbInstance)
  }
  return dbInstance
}

function initSchema(db: InstanceType<typeof Database>) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tiles (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      size TEXT NOT NULL,
      col_start INTEGER DEFAULT NULL,
      row_start INTEGER DEFAULT NULL,
      order_val INTEGER DEFAULT 0,
      order_val_mobile INTEGER DEFAULT 0,
      is_hidden INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      content TEXT DEFAULT '{}',
      deep_dive TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS detailed_items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      date_range TEXT,
      content TEXT DEFAULT '{}',
      deep_dive TEXT DEFAULT '{}',
      order_val INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      failed_attempts INTEGER DEFAULT 0,
      lockout_until TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS active_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );
  `)

  const tileCount = (db.prepare('SELECT count(*) as count FROM tiles').get() as { count: number }).count
  if (tileCount === 0) {
    seedDatabase(db)
  }
}

function seedDatabase(db: InstanceType<typeof Database>) {
  const insertTile = db.prepare(`
    INSERT INTO tiles (id, type, size, col_start, row_start, order_val, order_val_mobile, is_hidden, is_active, content, deep_dive, created_at, updated_at)
    VALUES (@id, @type, @size, @col_start, @row_start, @order_val, @order_val_mobile, @is_hidden, @is_active, @content, @deep_dive, @created_at, @updated_at)
  `)

  const seedTiles = [
    {
      id: "c0ffeeee-c0ff-c0ff-c0ff-c0ffeeeeeeee",
      type: "config",
      size: "0x0",
      col_start: null,
      row_start: null,
      order_val: 0,
      order_val_mobile: 0,
      is_hidden: 1,
      is_active: 1,
      content: "{\"theme\":{\"primary\":\"#4AFFB4\",\"secondary\":\"#4A8FFF\"},\"identity\":{\"mark\":\"\",\"title\":\"Creative Developer\"}}",
      deep_dive: "{}",
      created_at: "2026-08-15T04:15:26.772Z",
      updated_at: "2026-08-15T04:15:26.773Z"
    },
    {
      id: "4c37c16b-3500-401f-88cb-bf839071a48c",
      type: "hero",
      size: "6x4",
      col_start: null,
      row_start: null,
      order_val: 1,
      order_val_mobile: 1,
      is_hidden: 0,
      is_active: 1,
      content: "{\"mark\":\"Work In progress\",\"role\":\"Software Engineer\",\"description\":\"Creative Developer / Systems Architect. Specialized in high-performance web applications and immersive interfaces. Dark minimalist, cinematic UX.\"}",
      deep_dive: "{\"mark\":\"Work In progress\",\"role\":\"Software Engineer\",\"description\":\"Creative Developer / Systems Architect. Specialized in high-performance web applications and immersive interfaces. Dark minimalist, cinematic UX.\"}",
      created_at: "2026-08-15T04:15:26.773Z",
      updated_at: "2026-08-15T04:15:26.773Z"
    },
    {
      id: "06dec249-48d0-49fd-a4d6-0f515a6c2cc2",
      type: "3d",
      size: "6x6",
      col_start: null,
      row_start: null,
      order_val: 2,
      order_val_mobile: 5,
      is_hidden: 0,
      is_active: 1,
      content: "{}",
      deep_dive: "{}",
      created_at: "2026-08-15T04:15:26.773Z",
      updated_at: "2026-08-15T04:15:26.773Z"
    },
    {
      id: "00864e8e-0331-4c86-8b8e-a8d3266749d7",
      type: "experience",
      size: "4x5",
      col_start: null,
      row_start: null,
      order_val: 3,
      order_val_mobile: 9,
      is_hidden: 0,
      is_active: 1,
      content: "{\"date\":\"Apr 2025 - Mar 2026\",\"role\":\"Software Engineer Intern\",\"company\":\"DBS Bank\",\"highlights\":[\"Led full-stack system migrations and automated pipeline deployments\",\"Optimized data processing to speed up heavy application modules\",\"Headed front-end overhauls and A/B testing to increase click-through rates\",\"Managed database version control for seamless multi-environment deployments\"],\"items\":[{\"id\":\"dbs-bank\",\"role\":\"Software Engineer Intern\",\"company\":\"DBS Bank\",\"date\":\"Apr 2025 - Mar 2026\",\"category\":\"Enterprise & Fintech\",\"highlights\":[\"Led full-stack system migrations and automated pipeline deployments\",\"Optimized data processing to speed up heavy application modules\",\"Headed front-end overhauls and A/B testing to increase click-through rates\",\"Managed database version control for seamless multi-environment deployments\"],\"deepDiveHighlights\":[\"Migrated Martech Request Portal from MongoDB to MariaDB using Java Spring Boot APIs\",\"Automated CI/CD deployment pipelines using Jenkins on OpenShift\",\"Optimized high-data spreadsheet module performance using efficient data structures\",\"Executed front-end A/B testing and tracking via Adobe Target and Adobe Analytics\",\"Managed MariaDB schema changes and version control utilizing Liquibase scripts\"]},{\"id\":\"freelance-dev\",\"role\":\"Full-Stack & Creative Developer\",\"company\":\"Freelance / Client Projects\",\"date\":\"Jan 2024 - Present\",\"category\":\"Web & 3D Engineering\",\"highlights\":[\"Engineered high-performance Next.js web applications and 3D WebGL interfaces\",\"Built scalable RESTful & realtime database integrations with Supabase & Redis\",\"Designed dark minimalist aesthetics with GSAP timelines and Tailwind CSS v4\",\"Optimized Core Web Vitals achieving 98+ Lighthouse scores across client sites\"],\"deepDiveHighlights\":[\"Architected interactive client portals utilizing Next.js 16 App Router and Turbopack\",\"Implemented hardware-accelerated 3D viewports utilizing Three.js and custom GLSL shaders\",\"Integrated Stripe payments, OAuth auth flows, and automated edge cron pipelines\",\"Delivered maintainable component systems with comprehensive TypeScript coverage\"]},{\"id\":\"nyp-ta\",\"role\":\"Teaching Assistant & Student Developer\",\"company\":\"Nanyang Polytechnic\",\"date\":\"Apr 2023 - Mar 2025\",\"category\":\"Academic & Mentorship\",\"highlights\":[\"Mentored junior peers in Data Structures, Algorithms, and Object-Oriented Programming\",\"Built internal lab assessment scripts and automated test suites\",\"Facilitated hands-on workshops on modern Web technologies and Git version control\"],\"deepDiveHighlights\":[\"Conducted weekly lab consultation sessions for over 60+ computing students per semester\",\"Created automated grading test suites in Java and Python, reducing grading turnaround by 40%\",\"Authored interactive step-by-step developer guides for modern Git version control workflows\"]},{\"id\":\"open-source\",\"role\":\"Open Source Contributor\",\"company\":\"Independent & Community\",\"date\":\"2023 - Present\",\"category\":\"Open Source & Labs\",\"highlights\":[\"Developed and published full-stack developer tools and UI starter templates\",\"Contributed bug fixes and documentation enhancements to modern JS ecosystems\",\"Authored open-source real-time multiplayer and graphics experiments\"],\"deepDiveHighlights\":[\"Built TriviaDuel (real-time multiplayer AI platform) and SecureAsset (watermarking engine)\",\"Engineered custom React hooks and Zustand middleware for cross-tab state syncing\",\"Maintained active GitHub repositories with CI/CD automated test workflows\"]}]}",
      deep_dive: "{\"highlights\":[\"Migrated Martech Request Portal from MongoDB to MariaDB using Java Spring Boot APIs\",\"Automated CI/CD deployment pipelines using Jenkins on OpenShift\",\"Optimized high-data spreadsheet module performance using efficient data structures\",\"Executed front-end A/B testing and tracking via Adobe Target and Adobe Analytics\",\"Managed MariaDB schema changes and version control utilizing Liquibase scripts\"],\"items\":[{\"id\":\"dbs-bank\",\"role\":\"Software Engineer Intern\",\"company\":\"DBS Bank\",\"date\":\"Apr 2025 - Mar 2026\",\"category\":\"Enterprise & Fintech\",\"highlights\":[\"Led full-stack system migrations and automated pipeline deployments\",\"Optimized data processing to speed up heavy application modules\",\"Headed front-end overhauls and A/B testing to increase click-through rates\",\"Managed database version control for seamless multi-environment deployments\"],\"deepDiveHighlights\":[\"Migrated Martech Request Portal from MongoDB to MariaDB using Java Spring Boot APIs\",\"Automated CI/CD deployment pipelines using Jenkins on OpenShift\",\"Optimized high-data spreadsheet module performance using efficient data structures\",\"Executed front-end A/B testing and tracking via Adobe Target and Adobe Analytics\",\"Managed MariaDB schema changes and version control utilizing Liquibase scripts\"]},{\"id\":\"freelance-dev\",\"role\":\"Full-Stack & Creative Developer\",\"company\":\"Freelance / Client Projects\",\"date\":\"Jan 2024 - Present\",\"category\":\"Web & 3D Engineering\",\"highlights\":[\"Engineered high-performance Next.js web applications and 3D WebGL interfaces\",\"Built scalable RESTful & realtime database integrations with Supabase & Redis\",\"Designed dark minimalist aesthetics with GSAP timelines and Tailwind CSS v4\",\"Optimized Core Web Vitals achieving 98+ Lighthouse scores across client sites\"],\"deepDiveHighlights\":[\"Architected interactive client portals utilizing Next.js 16 App Router and Turbopack\",\"Implemented hardware-accelerated 3D viewports utilizing Three.js and custom GLSL shaders\",\"Integrated Stripe payments, OAuth auth flows, and automated edge cron pipelines\",\"Delivered maintainable component systems with comprehensive TypeScript coverage\"]},{\"id\":\"nyp-ta\",\"role\":\"Teaching Assistant & Student Developer\",\"company\":\"Nanyang Polytechnic\",\"date\":\"Apr 2023 - Mar 2025\",\"category\":\"Academic & Mentorship\",\"highlights\":[\"Mentored junior peers in Data Structures, Algorithms, and Object-Oriented Programming\",\"Built internal lab assessment scripts and automated test suites\",\"Facilitated hands-on workshops on modern Web technologies and Git version control\"],\"deepDiveHighlights\":[\"Conducted weekly lab consultation sessions for over 60+ computing students per semester\",\"Created automated grading test suites in Java and Python, reducing grading turnaround by 40%\",\"Authored interactive step-by-step developer guides for modern Git version control workflows\"]},{\"id\":\"open-source\",\"role\":\"Open Source Contributor\",\"company\":\"Independent & Community\",\"date\":\"2023 - Present\",\"category\":\"Open Source & Labs\",\"highlights\":[\"Developed and published full-stack developer tools and UI starter templates\",\"Contributed bug fixes and documentation enhancements to modern JS ecosystems\",\"Authored open-source real-time multiplayer and graphics experiments\"],\"deepDiveHighlights\":[\"Built TriviaDuel (real-time multiplayer AI platform) and SecureAsset (watermarking engine)\",\"Engineered custom React hooks and Zustand middleware for cross-tab state syncing\",\"Maintained active GitHub repositories with CI/CD automated test workflows\"]}]}",
      created_at: "2026-08-15T04:15:26.773Z",
      updated_at: "2026-08-15T04:15:26.773Z"
    },
    {
      id: "be785d85-53cc-4056-b82f-c6d760e8dcfe",
      type: "terminal",
      size: "4x4",
      col_start: null,
      row_start: null,
      order_val: 4,
      order_val_mobile: 14,
      is_hidden: 0,
      is_active: 1,
      content: "{}",
      deep_dive: "{}",
      created_at: "2026-08-15T04:15:26.773Z",
      updated_at: "2026-08-15T04:15:26.773Z"
    },
    {
      id: "ed2cd7ef-4d2c-4ebd-98be-70eb116c7db2",
      type: "project",
      size: "4x3",
      col_start: null,
      row_start: null,
      order_val: 5,
      order_val_mobile: 6,
      is_hidden: 0,
      is_active: 1,
      content: "{\"name\":\"TriviaDuel\",\"featured\":true,\"github_url\":\"https://github.com\",\"tech_stack\":[\"Next.js 16\",\"Gemini AI\",\"Redis\",\"SQLite\"],\"description\":\"Real-time multiplayer trivia platform with resilient AI generation.\"}",
      deep_dive: "{\"notes\":\"Sub-100ms synchronization for 10 players. Multi-model fallback strategy (Gemini → DeepSeek). Features Synapse V2 interactive canvas and AI-powered match roasts.\"}",
      created_at: "2026-08-15T04:15:26.773Z",
      updated_at: "2026-08-15T04:15:26.773Z"
    },
    {
      id: "3f7e4572-aa64-4447-b00b-84edb8c5fa8c",
      type: "education",
      size: "4x3",
      col_start: null,
      row_start: null,
      order_val: 6,
      order_val_mobile: 10,
      is_hidden: 0,
      is_active: 1,
      content: "{\"gpa\":\"3.91\",\"date\":\"Apr 2023 - Apr 2026\",\"degree\":\"Diploma in Information Technology with Merit\",\"institution\":\"Nanyang Polytechnic\",\"items\":[{\"id\":\"nus-bcomp\",\"level\":\"university\",\"levelLabel\":\"University\",\"institution\":\"National University of Singapore\",\"degree\":\"Bachelor of Computing in Computer Science\",\"date\":\"Aug 2028 - Aug 2032\",\"gpa\":\"-\",\"honours\":\"Direct Honours Track\",\"highlights\":[\"Distributed Systems & AI Track\",\"Dean's Merit Pre-admit\"],\"caption\":\"Incoming Computer Science undergraduate.\"},{\"id\":\"nyp-dit\",\"level\":\"polytechnic\",\"levelLabel\":\"Diploma\",\"institution\":\"Nanyang Polytechnic\",\"degree\":\"Diploma in Information Technology with Merit\",\"date\":\"Apr 2023 - Apr 2026\",\"gpa\":\"3.91\",\"honours\":\"Gold Medalist & Ngee Ann Kongsi Tertiary Award\",\"highlights\":[\"Cumulative GPA 3.91 / 4.00\",\"Specialization in Enterprise Software\",\"Gold Medalist Awardee\"],\"caption\":\"Graduated with Merit and Gold Medalist recognition.\"},{\"id\":\"cchy-olevel\",\"level\":\"secondary\",\"levelLabel\":\"Secondary\",\"institution\":\"Chung Cheng High School (Yishun)\",\"degree\":\"Singapore-Cambridge GCE O-Level\",\"date\":\"Jan 2019 - Dec 2022\",\"gpa\":\"-\",\"honours\":\"Distinction in Computing & Mathematics\",\"highlights\":[\"Computing Distinction\",\"Math Olympiad Delegate\"],\"caption\":\"Strong foundational STEM & computing background.\"},{\"id\":\"peiying-psle\",\"level\":\"primary\",\"levelLabel\":\"Primary\",\"institution\":\"Peiying Primary School\",\"degree\":\"Primary School Leaving Examination (PSLE)\",\"date\":\"Jan 2013 - Dec 2018\",\"gpa\":\"251\",\"honours\":\"Top in Cohort in Mathematics\",\"highlights\":[\"Score: 251 / 300\",\"Top in Cohort in Math\"],\"caption\":\"Early academic excellence award.\"}]}",
      deep_dive: "{\"gpa\":\"3.91\",\"date\":\"Apr 2023 - Apr 2026\",\"degree\":\"Diploma in Information Technology with Merit\",\"institution\":\"Nanyang Polytechnic\",\"honours\":\"Gold Medalist & Ngee Ann Kongsi Tertiary Award\",\"items\":[{\"id\":\"nus-bcomp\",\"level\":\"university\",\"levelLabel\":\"University\",\"institution\":\"National University of Singapore\",\"degree\":\"Bachelor of Computing in Computer Science\",\"date\":\"Aug 2028 - Aug 2032\",\"gpa\":\"-\",\"honours\":\"Direct Honours Track\",\"highlights\":[\"Distributed Systems & AI Track\",\"Dean's Merit Pre-admit\"],\"caption\":\"Incoming Computer Science undergraduate.\"},{\"id\":\"nyp-dit\",\"level\":\"polytechnic\",\"levelLabel\":\"Diploma\",\"institution\":\"Nanyang Polytechnic\",\"degree\":\"Diploma in Information Technology with Merit\",\"date\":\"Apr 2023 - Apr 2026\",\"gpa\":\"3.91\",\"honours\":\"Gold Medalist & Ngee Ann Kongsi Tertiary Award\",\"highlights\":[\"Cumulative GPA 3.91 / 4.00\",\"Specialization in Enterprise Software\",\"Gold Medalist Awardee\"],\"caption\":\"Graduated with Merit and Gold Medalist recognition.\"},{\"id\":\"cchy-olevel\",\"level\":\"secondary\",\"levelLabel\":\"Secondary\",\"institution\":\"Chung Cheng High School (Yishun)\",\"degree\":\"Singapore-Cambridge GCE O-Level\",\"date\":\"Jan 2019 - Dec 2022\",\"gpa\":\"-\",\"honours\":\"Distinction in Computing & Mathematics\",\"highlights\":[\"Computing Distinction\",\"Math Olympiad Delegate\"],\"caption\":\"Strong foundational STEM & computing background.\"},{\"id\":\"peiying-psle\",\"level\":\"primary\",\"levelLabel\":\"Primary\",\"institution\":\"Peiying Primary School\",\"degree\":\"Primary School Leaving Examination (PSLE)\",\"date\":\"Jan 2013 - Dec 2018\",\"gpa\":\"251\",\"honours\":\"Top in Cohort in Mathematics\",\"highlights\":[\"Score: 251 / 300\",\"Top in Cohort in Math\"],\"caption\":\"Early academic excellence award.\"}]}",
      created_at: "2026-08-15T04:15:26.773Z",
      updated_at: "2026-08-15T04:15:26.773Z"
    },
    {
      id: "f23beffe-536e-495f-b1b0-4ad5cb32411c",
      type: "project",
      size: "4x3",
      col_start: null,
      row_start: null,
      order_val: 7,
      order_val_mobile: 7,
      is_hidden: 0,
      is_active: 1,
      content: "{\"name\":\"SecureAsset\",\"featured\":true,\"github_url\":\"https://github.com\",\"tech_stack\":[\"React 19\",\"Node.js\",\"MariaDB\",\"Vite\"],\"description\":\"Forensic watermarking & asset protection with LiquidGlass UI.\"}",
      deep_dive: "{\"notes\":\"Supports LSB, DCT, and EXIF embedding layers. Features deep-scan integrity authentication and verifiable digital signatures. Architected as an npm monorepo.\"}",
      created_at: "2026-08-15T04:15:26.773Z",
      updated_at: "2026-08-15T04:15:26.773Z"
    },
    {
      id: "7677aac8-2bc8-4b10-afae-2e412e7fbd67",
      type: "stat",
      size: "2x2",
      col_start: null,
      row_start: null,
      order_val: 8,
      order_val_mobile: 3,
      is_hidden: 0,
      is_active: 1,
      content: "{\"label\":\"Experience\",\"value\":\"1yr\"}",
      deep_dive: "{\"label\":\"Experience\",\"value\":\"1yr\"}",
      created_at: "2026-08-15T04:15:26.773Z",
      updated_at: "2026-08-15T04:15:26.773Z"
    },
    {
      id: "89c3dfb7-d275-44cf-a983-ebc14e2fea4d",
      type: "stat",
      size: "2x2",
      col_start: null,
      row_start: null,
      order_val: 9,
      order_val_mobile: 2,
      is_hidden: 0,
      is_active: 1,
      content: "{\"label\":\"Repos\",\"value\":\"20+\"}",
      deep_dive: "{\"label\":\"Repositories\",\"value\":\"20+\"}",
      created_at: "2026-08-15T04:15:26.773Z",
      updated_at: "2026-08-15T04:15:26.773Z"
    },
    {
      id: "63e410d8-2f2b-4ef6-8585-ce77dae36d1d",
      type: "stat",
      size: "2x2",
      col_start: null,
      row_start: null,
      order_val: 10,
      order_val_mobile: 4,
      is_hidden: 0,
      is_active: 1,
      content: "{\"label\":\"Projects\",\"value\":\"12+\"}",
      deep_dive: "{}",
      created_at: "2026-08-15T04:15:26.773Z",
      updated_at: "2026-08-15T04:15:26.773Z"
    },
    {
      id: "f2935ab8-63d6-4451-96f3-fb0c67cfe2b4",
      type: "contact",
      size: "4x3",
      col_start: null,
      row_start: null,
      order_val: 11,
      order_val_mobile: 13,
      is_hidden: 0,
      is_active: 1,
      content: "{\"email\":\"hngwudev@gmail.com\",\"github\":\"https://github.com/HngWu\",\"linkedin\":\"https://linkedin.com/in/hngwu\",\"telegram\":\"https://t.me/hngwu\"}",
      deep_dive: "{\"timezone\":\"Singapore (SST - UTC+8)\",\"availability\":\"Available Q3 2026\"}",
      created_at: "2026-08-15T04:15:26.773Z",
      updated_at: "2026-08-15T04:15:26.773Z"
    },
    {
      id: "43c1c71b-78d5-4795-9a13-bf011c0f00b4",
      type: "skill",
      size: "4x3",
      col_start: null,
      row_start: null,
      order_val: 12,
      order_val_mobile: 8,
      is_hidden: 0,
      is_active: 1,
      content: "{\"tags\":[\"Java\",\"Spring Boot\",\"Next.js 16\",\"TypeScript\",\"MariaDB\",\"OpenShift\",\"Jenkins\",\"GSAP\",\"Three.js\"]}",
      deep_dive: "{}",
      created_at: "2026-08-15T04:15:26.773Z",
      updated_at: "2026-08-15T04:15:26.773Z"
    },
    {
      id: "a899769a-d97c-4ace-90b5-0a6ccc62271b",
      type: "award",
      size: "3x3",
      col_start: null,
      row_start: null,
      order_val: 13,
      order_val_mobile: 12,
      is_hidden: 1,
      is_active: 1,
      content: "{\"date\":\"Aug 2025\",\"desc\":\"Academic excellence scholarship for AY 2025/26.\",\"name\":\"Ngee Ann Kongsi Tertiary Award\",\"issuer\":\"NYP\"}",
      deep_dive: "{}",
      created_at: "2026-08-15T04:15:26.773Z",
      updated_at: "2026-08-15T04:15:26.773Z"
    },
    {
      id: "bcf40014-b29c-4c60-818f-f3e5d283b7f0",
      type: "easter_egg",
      size: "3x2",
      col_start: null,
      row_start: null,
      order_val: 14,
      order_val_mobile: 99,
      is_hidden: 1,
      is_active: 1,
      content: "{}",
      deep_dive: "{}",
      created_at: "2026-08-15T04:15:26.773Z",
      updated_at: "2026-08-15T04:15:26.773Z"
    },
    {
      id: "f90f7424-251e-47c5-80b4-d93b127f4861",
      type: "award",
      size: "3x2",
      col_start: null,
      row_start: null,
      order_val: 15,
      order_val_mobile: 11,
      is_hidden: 1,
      is_active: 1,
      content: "{\"date\":\"Apr 2025\",\"desc\":\"Silver Medalist in IT Software Solutions for Business.\",\"name\":\"Worldskills Singapore 2025\",\"issuer\":\"WorldSkills\"}",
      deep_dive: "{}",
      created_at: "2026-08-15T04:15:26.773Z",
      updated_at: "2026-08-15T04:15:26.773Z"
    }
  ]

  const seedTransaction = db.transaction(() => {
    for (const tile of seedTiles) {
      insertTile.run(tile)
    }

    const insertDetailed = db.prepare(`
      INSERT INTO detailed_items (id, type, title, subtitle, date_range, content, deep_dive, order_val, created_at, updated_at)
      VALUES (@id, @type, @title, @subtitle, @date_range, @content, @deep_dive, @order_val, @created_at, @updated_at)
    `)

    const seedDetailed = [
      {
        id: "00000000-0000-0000-0000-000000000003",
        type: "education",
        title: "Diploma in Information Technology with Merit",
        subtitle: "Nanyang Polytechnic",
        date_range: "Apr 2023 - Apr 2026",
        content: "{\"gpa\":\"3.91\"}",
        deep_dive: "{\"gpa\":\"3.91\",\"degree\":\"Diploma in Information Technology with Merit\",\"institution\":\"Nanyang Polytechnic\",\"honours\":\"Gold Medalist & Ngee Ann Kongsi Tertiary Award\"}",
        order_val: 0,
        created_at: "2026-08-15T04:15:26.774Z",
        updated_at: "2026-08-30T13:08:13.154Z"
      },
      {
        id: "4e0d4deb-e74f-4db4-adf0-1e20ab65a0fa",
        type: "education",
        title: "PSLE",
        subtitle: "Peiying Primary School",
        date_range: "Jan 2013 - Dec 2018",
        content: "{\"gpa\":\"251\"}",
        deep_dive: "{\"gpa\":\"251\",\"degree\":\"PSLE\",\"institution\":\"Peiying\",\"honours\":\"Top in cohort in Math\"}",
        order_val: 0,
        created_at: "2026-08-30T12:39:51.876Z",
        updated_at: "2026-08-30T12:39:51.876Z"
      },
      {
        id: "f38c634d-6439-47b2-a72a-c0afa06023c8",
        type: "education",
        title: "Bachelor Degree in Computer Science",
        subtitle: "National University of Singapore",
        date_range: "Aug 2028 - Aug 2032",
        content: "{\"gpa\":\"-\"}",
        deep_dive: "{\"gpa\":\"-\",\"degree\":\"Bachelor Degree in Computer Science\",\"institution\":\"National University of Singapore\",\"honours\":\"-\"}",
        order_val: 0,
        created_at: "2026-08-30T12:42:56.138Z",
        updated_at: "2026-08-30T12:42:56.138Z"
      },
      {
        id: "00000000-0000-0000-0000-000000000001",
        type: "experience",
        title: "Software Engineer Intern",
        subtitle: "DBS Bank",
        date_range: "Apr 2025 - Mar 2026",
        content: "{\"highlights\":[\"Led full-stack system migrations and automated pipeline deployments\",\"Optimized data processing to speed up heavy application modules\",\"Headed front-end overhauls and A/B testing to increase click-through rates\",\"Managed database version control for seamless multi-environment deployments\"]}",
        deep_dive: "{\"highlights\":[\"Migrated Martech Request Portal from MongoDB to MariaDB using Java Spring Boot APIs\",\"Automated CI/CD deployment pipelines using Jenkins on OpenShift\",\"Optimized high-data spreadsheet module performance using efficient data structures\",\"Executed front-end A/B testing and tracking via Adobe Target and Adobe Analytics\",\"Managed MariaDB schema changes and version control utilizing Liquibase scripts\"]}",
        order_val: 1,
        created_at: "2026-08-15T04:15:26.774Z",
        updated_at: "2026-08-15T04:15:26.774Z"
      },
      {
        id: "00000000-0000-0000-0000-000000000005",
        type: "project",
        title: "TriviaDuel",
        subtitle: "Real-time multiplayer trivia platform with resilient AI generation.",
        date_range: "2025",
        content: "{\"tech_stack\":[\"Next.js 16\",\"Gemini AI\",\"Redis\",\"SQLite\"],\"github_url\":\"https://github.com\",\"live_url\":\"https://triviaduel.dev\",\"featured\":true}",
        deep_dive: "{\"notes\":\"Sub-100ms synchronization for 10 players. Multi-model fallback strategy (Gemini → DeepSeek). Features Synapse V2 interactive canvas and AI-powered match roasts.\"}",
        order_val: 1,
        created_at: "2026-08-15T04:15:26.774Z",
        updated_at: "2026-08-15T04:15:26.774Z"
      },
      {
        id: "00000000-0000-0000-0000-000000000006",
        type: "project",
        title: "SecureAsset",
        subtitle: "Forensic watermarking & asset protection with LiquidGlass UI.",
        date_range: "2025",
        content: "{\"tech_stack\":[\"React 19\",\"Node.js\",\"MariaDB\",\"Vite\"],\"github_url\":\"https://github.com\",\"live_url\":\"https://secureasset.dev\",\"featured\":true}",
        deep_dive: "{\"notes\":\"Supports LSB, DCT, and EXIF embedding layers. Features deep-scan integrity authentication and verifiable digital signatures. Architected as an npm monorepo.\"}",
        order_val: 2,
        created_at: "2026-08-15T04:15:26.775Z",
        updated_at: "2026-08-15T04:15:26.775Z"
      },
      {
        id: "00000000-0000-0000-0000-000000000007",
        type: "project",
        title: "LumeGlass Portfolio",
        subtitle: "Cinematic, dark minimalist portfolio showing modern animations and 3D visual elements.",
        date_range: "2026",
        content: "{\"tech_stack\":[\"Next.js 16\",\"Tailwind CSS v4\",\"React Three Fiber\",\"GSAP\"],\"github_url\":\"https://github.com\",\"live_url\":\"https://portfolio.dev\",\"featured\":false}",
        deep_dive: "{\"notes\":\"Implements custom GSAP timelines for bento grid navigation and R3F interactive canvas layers.\"}",
        order_val: 3,
        created_at: "2026-08-15T04:15:26.775Z",
        updated_at: "2026-08-15T04:15:26.775Z"
      },
      {
        id: "bc55590b-7a12-40e4-97f1-c21526c97488",
        type: "education",
        title: "O Level",
        subtitle: "Chung Cheng High School (Yishun)",
        date_range: "Jan 2019 - Dec 2022",
        content: "{\"gpa\":\"\"}",
        deep_dive: "{\"gpa\":\"\",\"degree\":\"\",\"institution\":\"\",\"honours\":\"\"}",
        order_val: 3,
        created_at: "2026-08-30T12:33:38.792Z",
        updated_at: "2026-08-30T13:08:00.194Z"
      },
      {
        id: "00000000-0000-0000-0000-000000000008",
        type: "project",
        title: "Arcturus Engine",
        subtitle: "WebGL-based real-time voxel graphics engine featuring volumetric lightning.",
        date_range: "2025",
        content: "{\"tech_stack\":[\"Three.js\",\"GLSL Shaders\",\"TypeScript\",\"Vite\"],\"github_url\":\"https://github.com\",\"live_url\":\"https://arcturus.dev\",\"featured\":true}",
        deep_dive: "{\"notes\":\"Volumetric rays are rendered using a custom screen-space post-processing shader. Multi-threaded octave chunking maps geometry in parallel.\"}",
        order_val: 4,
        created_at: "2026-08-15T04:15:26.775Z",
        updated_at: "2026-08-15T04:15:26.775Z"
      }
    ]

    for (const item of seedDetailed) {
      insertDetailed.run(item)
    }
  })

  seedTransaction()
}

// Helpers to serialize / deserialize SQLite rows into standard TileRow structure
function mapRowToTile(row: any): TileRow {
  return {
    id: row.id,
    type: row.type,
    size: row.size,
    col_start: row.col_start,
    row_start: row.row_start,
    order_val: row.order_val ?? 0,
    order_val_mobile: row.order_val_mobile ?? 0,
    is_hidden: Boolean(row.is_hidden),
    is_active: Boolean(row.is_active),
    content: typeof row.content === 'string' ? JSON.parse(row.content || '{}') : row.content,
    deep_dive: typeof row.deep_dive === 'string' ? JSON.parse(row.deep_dive || '{}') : row.deep_dive,
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}

function mapRowToDetailedItem(row: any): DetailedItemRow {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    subtitle: row.subtitle,
    date_range: row.date_range,
    content: typeof row.content === 'string' ? JSON.parse(row.content || '{}') : row.content,
    deep_dive: typeof row.deep_dive === 'string' ? JSON.parse(row.deep_dive || '{}') : row.deep_dive,
    order_val: row.order_val ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}

// Data access APIs
export function getTilesDb(): TileRow[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM tiles ORDER BY order_val ASC').all()
  return rows.map(mapRowToTile)
}

export function getTileByIdDb(id: string): TileRow | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM tiles WHERE id = ?').get(id)
  return row ? mapRowToTile(row) : null
}

export function getTilesByTypeDb(type: string): TileRow[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM tiles WHERE type = ? ORDER BY order_val ASC').all(type)
  return rows.map(mapRowToTile)
}

export function createTileDb(tile: TileInsert): TileRow {
  const db = getDb()
  const id = tile.id || randomUUID()
  const now = new Date().toISOString()
  const contentStr = typeof tile.content === 'object' ? JSON.stringify(tile.content) : (tile.content || '{}')
  const deepDiveStr = typeof tile.deep_dive === 'object' ? JSON.stringify(tile.deep_dive) : (tile.deep_dive || '{}')

  db.prepare(`
    INSERT INTO tiles (id, type, size, col_start, row_start, order_val, order_val_mobile, is_hidden, is_active, content, deep_dive, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    tile.type,
    tile.size,
    tile.col_start ?? null,
    tile.row_start ?? null,
    tile.order_val ?? 0,
    tile.order_val_mobile ?? 0,
    tile.is_hidden ? 1 : 0,
    tile.is_active !== undefined ? (tile.is_active ? 1 : 0) : 1,
    contentStr,
    deepDiveStr,
    tile.created_at || now,
    tile.updated_at || now
  )

  return getTileByIdDb(id)!
}

export function updateTileDb(id: string, updates: TileUpdate): TileRow {
  const db = getDb()
  const existing = getTileByIdDb(id)
  if (!existing) {
    throw new Error(`Tile with id ${id} not found`)
  }

  const now = new Date().toISOString()
  const type = updates.type !== undefined ? updates.type : existing.type
  const size = updates.size !== undefined ? updates.size : existing.size
  const col_start = updates.col_start !== undefined ? updates.col_start : existing.col_start
  const row_start = updates.row_start !== undefined ? updates.row_start : existing.row_start
  const order_val = updates.order_val !== undefined ? updates.order_val : existing.order_val
  const order_val_mobile = updates.order_val_mobile !== undefined ? updates.order_val_mobile : existing.order_val_mobile
  const is_hidden = updates.is_hidden !== undefined ? (updates.is_hidden ? 1 : 0) : (existing.is_hidden ? 1 : 0)
  const is_active = updates.is_active !== undefined ? (updates.is_active ? 1 : 0) : (existing.is_active ? 1 : 0)

  const content = updates.content !== undefined
    ? (typeof updates.content === 'object' ? JSON.stringify(updates.content) : updates.content)
    : (typeof existing.content === 'object' ? JSON.stringify(existing.content) : existing.content)

  const deep_dive = updates.deep_dive !== undefined
    ? (typeof updates.deep_dive === 'object' ? JSON.stringify(updates.deep_dive) : updates.deep_dive)
    : (typeof existing.deep_dive === 'object' ? JSON.stringify(existing.deep_dive) : existing.deep_dive)

  db.prepare(`
    UPDATE tiles
    SET type = ?, size = ?, col_start = ?, row_start = ?, order_val = ?, order_val_mobile = ?, is_hidden = ?, is_active = ?, content = ?, deep_dive = ?, updated_at = ?
    WHERE id = ?
  `).run(
    type,
    size,
    col_start,
    row_start,
    order_val,
    order_val_mobile,
    is_hidden,
    is_active,
    content,
    deep_dive,
    now,
    id
  )

  return getTileByIdDb(id)!
}

export function updateTilesDb(tiles: TileRow[]): void {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO tiles (id, type, size, col_start, row_start, order_val, order_val_mobile, is_hidden, is_active, content, deep_dive, created_at, updated_at)
    VALUES (@id, @type, @size, @col_start, @row_start, @order_val, @order_val_mobile, @is_hidden, @is_active, @content, @deep_dive, @created_at, @updated_at)
    ON CONFLICT(id) DO UPDATE SET
      type = excluded.type,
      size = excluded.size,
      col_start = excluded.col_start,
      row_start = excluded.row_start,
      order_val = excluded.order_val,
      order_val_mobile = excluded.order_val_mobile,
      is_hidden = excluded.is_hidden,
      is_active = excluded.is_active,
      content = excluded.content,
      deep_dive = excluded.deep_dive,
      updated_at = excluded.updated_at
  `)

  const upsertTx = db.transaction((tileRows: TileRow[]) => {
    for (const t of tileRows) {
      stmt.run({
        id: t.id,
        type: t.type,
        size: t.size,
        col_start: t.col_start,
        row_start: t.row_start,
        order_val: t.order_val,
        order_val_mobile: t.order_val_mobile,
        is_hidden: t.is_hidden ? 1 : 0,
        is_active: t.is_active ? 1 : 0,
        content: typeof t.content === 'object' ? JSON.stringify(t.content) : t.content,
        deep_dive: typeof t.deep_dive === 'object' ? JSON.stringify(t.deep_dive) : t.deep_dive,
        created_at: t.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
  })

  upsertTx(tiles)
}

export function deleteTileDb(id: string): void {
  const db = getDb()
  db.prepare('DELETE FROM tiles WHERE id = ?').run(id)
}

export function getDetailedItemsDb(): DetailedItemRow[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM detailed_items ORDER BY order_val ASC').all()
  return rows.map(mapRowToDetailedItem)
}

export function getDetailedItemByIdDb(id: string): DetailedItemRow | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM detailed_items WHERE id = ?').get(id)
  return row ? mapRowToDetailedItem(row) : null
}

export function getDetailedItemsByTypeDb(type: string): DetailedItemRow[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM detailed_items WHERE type = ? ORDER BY order_val ASC').all(type)
  return rows.map(mapRowToDetailedItem)
}

export function createDetailedItemDb(item: DetailedItemInsert): DetailedItemRow {
  const db = getDb()
  const id = item.id || randomUUID()
  const now = new Date().toISOString()
  const contentStr = typeof item.content === 'object' ? JSON.stringify(item.content) : (item.content || '{}')
  const deepDiveStr = typeof item.deep_dive === 'object' ? JSON.stringify(item.deep_dive) : (item.deep_dive || '{}')

  db.prepare(`
    INSERT INTO detailed_items (id, type, title, subtitle, date_range, content, deep_dive, order_val, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    item.type,
    item.title,
    item.subtitle ?? null,
    item.date_range ?? null,
    contentStr,
    deepDiveStr,
    item.order_val ?? 0,
    item.created_at || now,
    item.updated_at || now
  )

  return getDetailedItemByIdDb(id)!
}

export function updateDetailedItemDb(id: string, updates: DetailedItemUpdate): DetailedItemRow {
  const db = getDb()
  const existing = getDetailedItemByIdDb(id)
  if (!existing) {
    throw new Error(`Detailed item with id ${id} not found`)
  }

  const now = new Date().toISOString()
  const type = updates.type !== undefined ? updates.type : existing.type
  const title = updates.title !== undefined ? updates.title : existing.title
  const subtitle = updates.subtitle !== undefined ? updates.subtitle : existing.subtitle
  const date_range = updates.date_range !== undefined ? updates.date_range : existing.date_range
  const order_val = updates.order_val !== undefined ? updates.order_val : existing.order_val

  const content = updates.content !== undefined
    ? (typeof updates.content === 'object' ? JSON.stringify(updates.content) : updates.content)
    : (typeof existing.content === 'object' ? JSON.stringify(existing.content) : existing.content)

  const deep_dive = updates.deep_dive !== undefined
    ? (typeof updates.deep_dive === 'object' ? JSON.stringify(updates.deep_dive) : updates.deep_dive)
    : (typeof existing.deep_dive === 'object' ? JSON.stringify(existing.deep_dive) : existing.deep_dive)

  db.prepare(`
    UPDATE detailed_items
    SET type = ?, title = ?, subtitle = ?, date_range = ?, content = ?, deep_dive = ?, order_val = ?, updated_at = ?
    WHERE id = ?
  `).run(
    type,
    title,
    subtitle,
    date_range,
    content,
    deep_dive,
    order_val,
    now,
    id
  )

  return getDetailedItemByIdDb(id)!
}

export function deleteDetailedItemDb(id: string): void {
  const db = getDb()
  db.prepare('DELETE FROM detailed_items WHERE id = ?').run(id)
}

export function getAdminUserByEmailDb(email: string): AdminUserRow | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email.toLowerCase().trim())
  return row ? (row as AdminUserRow) : null
}

export function getAdminUserByIdDb(id: string): AdminUserRow | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(id)
  return row ? (row as AdminUserRow) : null
}

export function createAdminUserDb(user: { id?: string; email: string; password_hash: string; salt: string }): AdminUserRow {
  const db = getDb()
  const id = user.id || randomUUID()
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO admin_users (id, email, password_hash, salt, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, user.email.toLowerCase().trim(), user.password_hash, user.salt, now, now)
  return getAdminUserByIdDb(id)!
}

export function updateAdminUserLockoutDb(id: string, failedAttempts: number, lockoutUntil: string | null): void {
  const db = getDb()
  const now = new Date().toISOString()
  db.prepare(`
    UPDATE admin_users
    SET failed_attempts = ?, lockout_until = ?, updated_at = ?
    WHERE id = ?
  `).run(failedAttempts, lockoutUntil, now, id)
}

export function getAllAdminUsersDb(): AdminUserRow[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM admin_users ORDER BY created_at DESC').all()
  return rows as AdminUserRow[]
}

export function updateAdminUserPasswordDb(id: string, passwordHash: string, salt: string): void {
  const db = getDb()
  const now = new Date().toISOString()
  db.prepare(`
    UPDATE admin_users
    SET password_hash = ?, salt = ?, updated_at = ?
    WHERE id = ?
  `).run(passwordHash, salt, now, id)
}

export function unlockAdminUserDb(id: string): void {
  const db = getDb()
  const now = new Date().toISOString()
  db.prepare(`
    UPDATE admin_users
    SET failed_attempts = 0, lockout_until = NULL, updated_at = ?
    WHERE id = ?
  `).run(now, id)
}

export function deleteAdminUserDb(id: string): void {
  const db = getDb()
  db.prepare('DELETE FROM admin_users WHERE id = ?').run(id)
}

export function createActiveSessionDb(session: { id?: string; user_id: string; token_hash: string; expires_at: string }): ActiveSessionRow {
  const db = getDb()
  const id = session.id || randomUUID()
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO active_sessions (id, user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, session.user_id, session.token_hash, session.expires_at, now)
  return { id, user_id: session.user_id, token_hash: session.token_hash, expires_at: session.expires_at, created_at: now }
}

export function getActiveSessionByTokenHashDb(tokenHash: string): ActiveSessionRow | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM active_sessions WHERE token_hash = ?').get(tokenHash)
  return row ? (row as ActiveSessionRow) : null
}

export function deleteActiveSessionDb(tokenHash: string): void {
  const db = getDb()
  db.prepare('DELETE FROM active_sessions WHERE token_hash = ?').run(tokenHash)
}

export function deleteUserActiveSessionsDb(userId: string): void {
  const db = getDb()
  db.prepare('DELETE FROM active_sessions WHERE user_id = ?').run(userId)
}


