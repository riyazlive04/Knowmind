# KnowMind Frontend - Development Guide

## Critical: SSR Auth Pattern (Session Cookies)

**Issue Solved (2026-06-29):** Login redirect loop - client authenticated but middleware couldn't see session.

**Root Cause:** Session stored client-side only; middleware reads server-side cookies.

**Solution:** Supabase SSR pattern with @supabase/ssr:
1. **Browser client** (`src/lib/supabase/client.ts`) - Login page uses `createBrowserClient`
2. **Server client** (`src/lib/supabase/server.ts`) - Middleware uses `createServerClient` with cookie handlers
3. **Login flow** - After `signIn()`, call `router.refresh()` then `router.push('/console')`
4. **Middleware** - Reads session from request cookies via `supabase.auth.getUser()`

### Key Files:
- `src/lib/supabase/client.ts` - Browser client (createBrowserClient)
- `src/lib/supabase/server.ts` - Server client (createServerClient with cookies)
- `src/middleware.ts` - Auth guard (getUser() from cookies)
- `src/app/console/login/page.tsx` - Login with router.refresh()
- `src/lib/auth.ts` - Auth helpers using browser client

### Why This Matters:
- **Never use** `createClient()` from `@supabase/supabase-js` in Next.js App Router (doesn't handle SSR cookies)
- **Always use** `@supabase/ssr` with separate client/server modules
- **Router.refresh()** syncs server state before redirect - CRITICAL for middleware to see cookies
- **getUser()** reads from cookies (server-safe), NOT getSession() (client-only)

### Testing Auth Changes:
1. Login should succeed
2. Redirect to /console (no bounce back to /console/login)
3. Refresh page keeps you logged in
4. Middleware never redirects authenticated users back to login
5. Logout clears session and returns to login

### Common Auth Bugs to Watch:
- ❌ Removing `router.refresh()` from login handler → redirect loop returns
- ❌ Using `getSession()` in middleware → session always null (client-side only)
- ❌ Using `createClient()` from old package → cookies not persisted
- ❌ Middleware checking client-side session context → won't work in Next.js

---

## Critical: Anon INSERT with RLS (Assessment Submission)

**Issue Solved (2026-06-29):** Assessment submission failed 403 "violates RLS for submission" even though anon INSERT policy existed.

**Root Cause:** Code used `.insert(payload).select()` - the `.select()` tried to read the inserted row back, but anon has no SELECT permission on submission, so the entire operation failed.

**Solution:** Never chain `.select()` after `.insert()` for anon-write tables.
- ✅ Correct: `.insert(payload)` (insert only)
- ❌ Wrong: `.insert(payload).select()` (insert + read = fails on read)
- Build result from payload & computed scores, not from DB response

### Key Files:
- `src/app/assessment/page.tsx` - Client-side submission insert (line 105)
- `src/app/api/assessment/route.ts` - Server-side submission insert (line 88)

### Why This Matters:
- Anon can only INSERT submissions (not SELECT)
- `.select()` tries to read rows immediately after insert
- RLS blocks the SELECT, failing the whole operation
- Results page renders from `scores` computed client-side, not from DB

### Common RLS INSERT Bugs to Watch:
- ❌ Using `.insert().select()` on anon-write tables → fails on SELECT
- ❌ Creating row with FK to restricted table → FK verification might fail if target is unreadable
- ❌ Assuming INSERT-only tables need `.select()` → they don't; build result from payload

---

## Architecture

### Routes:
- `/` - Redirects based on auth (root page.tsx)
- `/console/login` - Public login page (no sidebar)
- `/console/*` - Protected pages (sidebar + header)
- `/landing` - Public marketing page
- `/assessment` - Public assessment page

### Authentication Flow:
1. User visits `/console/*`
2. Middleware checks `supabase.auth.getUser()` (reads cookies)
3. If no session → redirect to `/console/login`
4. If session exists → allow access
5. Login page: signIn() → router.refresh() → router.push('/console')

### Styling:
- Tailwind CSS with CSS variables for theme
- Colors locked in `src/app/globals.css` (violet primary, golden secondary)
- Dark/light mode via next-themes
- Design system uses semantic color tokens (primary, secondary, success, error, etc.)

---

## Common Tasks

### Adding a New Protected Page:
1. Create `src/app/console/[feature]/page.tsx`
2. Middleware automatically protects it (requires session)
3. Use `createClient()` from `@/lib/supabase/client` if you need to fetch data
4. For server-side queries, create separate server component with server client

### Checking Auth in Components:
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

export function MyComponent() {
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log(user?.email)
    })
  }, [])
}
```

### Server-Side Auth (for data fetching):
Create separate server component, then import into client:
```typescript
// app/console/data.tsx (server component)
import { createClient } from '@/lib/supabase/server'

export async function DataFetcher() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  // Fetch data...
}
```

---

## Setup Reminders

### Environment Variables (.env.local):
```
NEXT_PUBLIC_SUPABASE_URL=https://nzdqxupssyvhgkuyqynq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Install Dependencies:
```bash
npm install @supabase/ssr next-themes
```

### Dev Server Port:
Check console output - likely 3000, but may be 3001+ if ports busy.

### Testing Credentials:
- Email: `admin@knowmind.in`
- Password: Set in Supabase admin console (currently: SecurePass123!@)

---

## If Login Breaks Again:

1. **Redirect loop** (login → console → login) → Missing `router.refresh()` in login handler
2. **403 on /console** → Middleware can't read session cookies (check cookie storage)
3. **Session null in component** → Using wrong client (use `createClient()` from `/supabase/client`)
4. **Dev server 404s** → Clean rebuild: `rm -rf .next && npm run build`

Check commit `1154e8b` for the full SSR auth fix.
