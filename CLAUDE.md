# KnowMind - Development Guide

## Monorepo Layout (restructured 2026-06-30; DB migrated to Prisma/Neon 2026-07-06)

Single repo, npm workspaces:

```
knowmind/
├─ apps/
│  ├─ web/      Next.js 14 frontend + console (was the repo root)
│  └─ api/      Express backend (was Knowmind-app-backend/)
└─ packages/
   ├─ shared/   @knowmind/shared — canonical EI scoring + types
   └─ db/       @knowmind/db — Prisma schema + client singleton (Neon Postgres)
```

- Run everything from the repo root: `npm install`, then `npm run build`
  (builds shared → db → api → web). Per-app: `npm run dev:web`, `npm run dev:api`.
- **`packages/shared` and `packages/db` must be built before the apps consume
  them** (`npm run build:shared`, `npm run build:db`); both ship compiled JS from
  `dist/`. `build:db` also runs `prisma generate`.
- Database is **Neon Postgres via Prisma** (migrated off Supabase). Both apps
  import the shared client: `import { prisma } from '@knowmind/db'`.
  Schema: `packages/db/prisma/schema.prisma`. Commands (from repo root):
  `npm run db:migrate` (create/apply migrations), `npm run db:seed`
  (questions v1 + admin user), `npm run db:generate` (regenerate client).
- Env files live with each app plus `packages/db`. All three need
  `DATABASE_URL` (pooled) + `DIRECT_URL` (direct). `apps/web/.env` also needs
  `AUTH_SECRET`; `packages/db/.env` also needs `ADMIN_EMAIL`/`ADMIN_PASSWORD`
  for the seed. See each `.env.example`.
- **Scoring is now defined once** in `packages/shared/src/index.ts` using the
  canonical 5/5/5/5/5/2 domain→item mapping. The old web engine used a divergent
  4/4/4/4/5/6 mapping and produced different scores for the same submission —
  that duplication is gone. `apps/web/src/lib/scoring.ts` is a thin adapter that
  maps the shared result into the numbered ({1..6}) shape the UI expects;
  `apps/api/src/lib/scoring.ts` just re-exports `@knowmind/shared`.

> Paths in the sections below are relative to **`apps/web/`** (e.g.
> `src/middleware.ts` → `apps/web/src/middleware.ts`).

## Data Access: Prisma + Neon (migrated off Supabase 2026-07-06)

All database access goes through **Prisma** against **Neon Postgres**. There is
no Supabase client and no RLS — every query runs with full DB privileges from
server code, so authorization is enforced at the app layer (public routes vs the
auth-gated console), NOT the database.

- **One client, one schema:** `import { prisma } from '@knowmind/db'`. Schema is
  `packages/db/prisma/schema.prisma`. Model fields are snake_case to match the
  JSON the frontend expects (e.g. `member_id`, `domain_scores`).
- **Prisma cannot run in the browser.** Client components (`'use client'`) must
  reach data through a server route (e.g. the assessment page POSTs to
  `/api/assessment`), never a direct DB call.
- **Nullable Json columns:** to store SQL NULL, pass `Prisma.DbNull` (not JS
  `null`) — e.g. `raw_answers: rawAnswers ?? Prisma.DbNull`.
- **`report.state` is mixed-case free text** (`Draft`/`Edited`/`Approved`/`Sent`/
  `Failed`/`Hold`, plus lowercase `sent`/`failed` from the delivery path). It is
  a `String`, deliberately not an enum — don't "normalize" it.

## Critical: Auth Pattern — Auth.js (NextAuth v5), single admin

The console (`/console/*`) is gated by a **single admin login**. Auth is Auth.js
v5 with a Credentials provider (email + bcrypt password in the `admin_user`
table) and **stateless JWT sessions**.

### Edge-split config (required):
- `src/auth.config.ts` — **edge-safe** (NO Prisma). Holds `pages.signIn` and the
  `authorized` callback that guards `/console/*`. Imported by middleware.
- `src/auth.ts` — full instance: spreads `authConfig`, adds the Credentials
  provider (uses Prisma + `verifyPassword`, runs in Node). Exports
  `{ handlers, auth, signIn, signOut }`.
- `src/app/api/auth/[...nextauth]/route.ts` — `export const { GET, POST } = handlers`.
- `src/middleware.ts` — `NextAuth(authConfig).auth` (edge; JWT only, no DB).
- `src/lib/auth.ts` — client helpers wrapping `next-auth/react`
  (`signIn`/`signOut`/`getSession`), no SessionProvider needed.
- Server routes check `const session = await auth()` (see the delivery routes).

### Why the split matters:
- Middleware runs on the **Edge runtime** — it can't import Prisma. Keep
  `auth.config.ts` free of Node/Prisma imports; put the Credentials provider only
  in `auth.ts`.
- `AUTH_SECRET` (in `apps/web/.env`) signs the session JWT — required.

### Common Auth Bugs to Watch:
- ❌ Importing `@/auth` (which pulls in Prisma) into `middleware.ts` → Edge build
  fails. Middleware must import `./auth.config` only.
- ❌ Missing `AUTH_SECRET` → sessions can't be signed/verified.
- ❌ Doing DB work in a client component → Prisma isn't available in the browser.

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
2. Middleware automatically protects it (requires the admin session)
3. To fetch data, add a server route under `src/app/api/...` that uses
   `import { prisma } from '@knowmind/db'`, and `fetch` it from the page.

### Checking Auth in a Client Component:
```typescript
'use client'
import { getSession } from '@/lib/auth'

export function MyComponent() {
  useEffect(() => {
    getSession().then((session) => console.log(session?.user?.email))
  }, [])
}
```

### Auth in a Server Route:
```typescript
import { auth } from '@/auth'
import { prisma } from '@knowmind/db'

export async function GET() {
  const session = await auth()
  if (!session?.user) return new Response('Unauthorized', { status: 401 })
  const rows = await prisma.member.findMany()
  // ...
}
```

---

## Setup Reminders

### Environment Variables:
Each of `apps/web/.env`, `apps/api/.env`, `packages/db/.env` needs the Neon
connection. See each `.env.example`. Minimum:
```
DATABASE_URL="postgresql://…-pooler…/neondb?sslmode=require"   # pooled (runtime)
DIRECT_URL="postgresql://…(no -pooler)…/neondb?sslmode=require" # direct (migrations)
# apps/web only:
AUTH_SECRET="<base64 32 bytes>"
# packages/db only (for the seed):
ADMIN_EMAIL="admin@knowmind.in"
ADMIN_PASSWORD="<strong password>"
```

### First-Time DB Setup:
```bash
npm install
npm run db:migrate    # creates tables on Neon
npm run db:seed       # question_version v1 (published) + admin user
```

### Dev Server Port:
Check console output - likely 3000, but may be 3001+ if ports busy.

### Prisma engine note:
`@knowmind/db` uses the Rust-free client (`engineType = "client"`) + the Neon
driver adapter — no native query engine binary. This is what makes it deploy
cleanly to Vercel serverless (nothing platform-specific to bundle). The Neon
driver's WebSocket needs are met by the `ws` package (set in
`packages/db/src/index.ts`), so no Node flags are required.

### Testing Credentials:
- Email: `admin@knowmind.in` (or your `ADMIN_EMAIL`)
- Password: whatever you set as `ADMIN_PASSWORD` before seeding.

---

## If Login Breaks:

1. **Redirect loop / always bounced to login** → `AUTH_SECRET` missing or changed,
   or the `authorized` callback in `auth.config.ts` is wrong.
2. **Edge build error importing Prisma** → `middleware.ts` must import
   `./auth.config` (edge-safe), never `@/auth`.
3. **"Invalid email or password" with correct creds** → admin not seeded, or the
   email case differs (seed + `authorize` both lower-case it).
4. **Dev server 404s** → Clean rebuild: `rm -rf .next && npm run build`.
