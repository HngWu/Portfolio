# Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the Next.js project, setup Supabase, apply base CSS variables, and configure global state management.

**Architecture:** We are using Next.js App Router. Supabase will be accessed via a server-side client for initial data fetches. Zustand will be used for client-side global state (View Mode and Navigation). Tailwind CSS will handle styling with custom variables for the Lume-Glass aesthetic.

**Tech Stack:** Next.js 16, TypeScript, TailwindCSS, ShadCN, Supabase, Zustand.

---

### Task 1: Initialize Next.js Project & Dependencies

**Files:**
- Create: Project scaffold

- [ ] **Step 1: Scaffold Next.js project**
Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir false --import-alias "@/*" --use-npm --yes`

- [ ] **Step 2: Install core dependencies**
Run: `npm install @supabase/supabase-js @supabase/ssr zustand lucide-react framer-motion gsap @react-three/fiber @react-three/drei three`

- [ ] **Step 3: Install ShadCN CLI and init**
Run: `npx shadcn@latest init -d`

### Task 2: Supabase Client Setup

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`

- [ ] **Step 1: Write client-side Supabase utility**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Write server-side Supabase utility**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

- [ ] **Step 3: Update `.env`**
Edit `.env` (already exists, append to it):
```env
NEXT_PUBLIC_SUPABASE_URL=https://haghfuivzyixptvvcdsc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_f1LBNrnjJq0DT8mFsD7SBw_OFZdk5QB
```

### Task 3: Global State Setup (Zustand)

**Files:**
- Create: `store/useViewModeStore.ts`
- Create: `store/useNavigationStore.ts`

- [ ] **Step 1: Create ViewMode store**
```typescript
import { create } from 'zustand'

interface ViewModeStore {
  mode: 'quick' | 'deep'
  setMode: (mode: 'quick' | 'deep') => void
}

export const useViewModeStore = create<ViewModeStore>((set) => ({
  mode: 'quick',
  setMode: (mode) => set({ mode }),
}))
```

- [ ] **Step 2: Create Navigation store**
```typescript
import { create } from 'zustand'

interface NavigationStore {
  originTileId: string | null
  setOriginTileId: (id: string | null) => void
  curtainState: 'idle' | 'covering' | 'revealing'
  setCurtainState: (state: 'idle' | 'covering' | 'revealing') => void
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  originTileId: null,
  setOriginTileId: (id) => set({ originTileId: id }),
  curtainState: 'idle',
  setCurtainState: (state) => set({ curtainState: state }),
}))
```

### Task 4: Base CSS Variables & Tailwind Config

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts` (if Next.js uses v3) or appropriate Tailwind v4 css configuration. (Next.js 16 often uses Tailwind v4 by default, so we'll configure variables in `globals.css` using standard CSS, and use `@theme` block if v4, or `tailwind.config.ts` if v3). 

- [ ] **Step 1: Update globals.css with Lume-Glass variables**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-void: #080808;
    --bg-surface: #0f0f0f;
    --bg-elevated: #141414;
    --bg-overlay: #1a1a1a;
    
    --glass-1: rgba(255, 255, 255, 0.03);
    --glass-2: rgba(255, 255, 255, 0.06);
    --glass-3: rgba(255, 255, 255, 0.09);
    --glass-border: rgba(255, 255, 255, 0.08);
    --glass-border-active: rgba(255, 255, 255, 0.18);
    
    --lume-primary: #4AFFB4;
    --lume-secondary: #4A8FFF;
    --lume-tertiary: #FF4A8F;
    --lume-warm: #FFB44A;
    
    --text-primary: rgba(255, 255, 255, 0.92);
    --text-secondary: rgba(255, 255, 255, 0.55);
    --text-muted: rgba(255, 255, 255, 0.28);
    --text-accent: #4AFFB4;
    
    --background: 0 0% 3%;
    --foreground: 0 0% 92%;
    
    /* ShadCN bases */
    --card: 0 0% 6%;
    --card-foreground: 0 0% 92%;
    --popover: 0 0% 6%;
    --popover-foreground: 0 0% 92%;
    --primary: 154 100% 64%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 12%;
    --secondary-foreground: 0 0% 92%;
    --muted: 0 0% 12%;
    --muted-foreground: 0 0% 65%;
    --accent: 0 0% 12%;
    --accent-foreground: 0 0% 92%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 12%;
    --input: 0 0% 12%;
    --ring: 154 100% 64%;
    --radius: 1rem;
  }
}

@layer base {
  body {
    background-color: var(--bg-void);
    color: var(--text-primary);
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

- [ ] **Step 2: Setup Fonts in Layout**
Modify `app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-ui",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HW | Lume-Glass Portfolio",
  description: "Creative Developer Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-[#080808]`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "feat: initialize phase 1 foundation"
```
