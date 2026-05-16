# Phase 6: Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a protected Admin Panel at `/admin` to manage Tiles, Projects, and Site Configuration.

**Architecture:** Use Supabase Auth for protection. Middleware will guard `/admin/*`. The panel will use a split layout with a sidebar. Content management will involve direct CRUD on Supabase tables with JSON editors for flexible data structures.

**Tech Stack:** Next.js (App Router), Supabase Auth, Tailwind CSS, ShadCN.

---

### Task 1: Auth & Middleware Protection

**Files:**
- Create: `middleware.ts`
- Create: `app/admin/login/page.tsx`
- Create: `app/actions/auth.ts`

- [ ] **Step 1: Implement Supabase middleware**
Create `middleware.ts` to protect `/admin` and refresh sessions.

- [ ] **Step 2: Create Login page**
Simple dark-minimalist login form at `/admin/login`.

- [ ] **Step 3: Create Auth actions**
Server actions for login/logout using Supabase.

### Task 2: Admin Layout & Sidebar

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `components/admin/AdminSidebar.tsx`

- [ ] **Step 1: Implement Admin Layout**
Split layout: 240px sidebar + main content area. Apply slightly higher surface brightness as per DESIGN.md.

- [ ] **Step 2: Create Sidebar Navigation**
Links to Tiles, Projects, Site Config, and a Preview (iframe).

### Task 3: Tiles Manager

**Files:**
- Create: `app/admin/tiles/page.tsx`
- Create: `components/admin/TileEditor.tsx`

- [ ] **Step 1: Implement Tiles Listing**
Fetch and display all tiles in a table or mini-grid.

- [ ] **Step 2: Implement Tile CRUD**
Add/Edit/Delete functionality. Include a text-area-based JSON editor for the `content` field.

### Task 4: Projects & Site Config Managers

**Files:**
- Create: `app/admin/projects/page.tsx`
- Create: `app/admin/config/page.tsx`

- [ ] **Step 1: Implement Projects Manager**
CRUD for the `projects` table.

- [ ] **Step 2: Implement Site Config Manager**
Manage key-value pairs in `site_config` (theme colors, default mode).
