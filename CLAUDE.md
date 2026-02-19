# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ASIF Portfolio Context

This project is **P-12** in the [ASIF portfolio](~/ASIF/PORTFOLIO.md) — the first consumer vertical.

- **NEXUS**: `.asif/NEXUS.md` — 19 initiatives, 7 vision pillars. Open this at the start of every session.
- **Key governance rules** (from ASIF):
  - Full-stack TypeScript is an **approved exception** to the Python-brain rule (ADR-005, ADR-006)
  - Cloud services (Neon, OpenAI, SendGrid) are approved for consumer products (ADR-006)
  - AGPL dependencies are **blocked** — check `~/ASIF/standards/tech-stack-registry.md`
  - Test counts never decrease (note: no automated tests yet — priority gap)
- **Handoff notes**: Check `~/ASIF/machines/HANDOFF.md` for cross-machine coordination notes.

### ASIF Governance
On every session:
1. Read `.asif/NEXUS.md` — check for `## CoS Directives` section
2. Execute any PENDING directives before other work (unless Asif overrides)
3. Write your response inline under each directive
4. Update initiative statuses in NEXUS if your work changes them
5. If you have questions for the CoS, add them under `## Team Questions` in NEXUS

## Project Overview

**FamilyMind** — AI-powered family command center. Reduce the mental load of family organization by 40%+.

## Development Commands

```bash
npm install              # Install dependencies
cp .env.example .env     # First-time setup: configure DATABASE_URL and SESSION_SECRET
npm run db:push          # Apply Drizzle schema directly to PostgreSQL (no migration files)
npm run dev              # Dev server: tsx runs Express on port 5000, Vite HMR via middleware
npm run build            # Vite builds client → dist/public, esbuild bundles server → dist/index.js
npm run start            # Production: NODE_ENV=production node dist/index.js
npm run check            # TypeScript type-check only (tsc --noEmit)
```

No linter or formatter is configured. No automated tests exist yet (manual UAT guide: `UAT-TEST-GUIDE.md`).

## Architecture

Full-stack TypeScript monorepo — single `package.json`, ESM (`"type": "module"`), no workspaces.

### Request flow

1. **Single server on port 5000** — Express serves both API and client. In dev, Vite runs as Express middleware (`server/vite.ts`) with HMR over the same HTTP server. In production, `dist/public` is served as static files with SPA fallback.
2. **API routes** (`server/routes.ts`, ~680 lines) — All endpoints under `/api/*`. Every mutating route validates with Zod insert schemas from `shared/schema.ts`. Auth check via `isAuthenticated` middleware.
3. **Storage layer** (`server/storage.ts`) — `IStorage` interface with `DatabaseStorage` implementation using Drizzle ORM. All DB access goes through the exported `storage` singleton.
4. **Database** — Neon PostgreSQL via `@neondatabase/serverless` with WebSocket transport (`server/db.ts`). Schema managed by `drizzle-kit push` (no migration files in normal workflow).

### Client data flow

- **`queryClient.ts`** — The `queryFn` default uses the TanStack Query `queryKey` array **as the fetch URL** (joined with `/`). So `useQuery({ queryKey: ["/api/grocery-lists"] })` fetches `GET /api/grocery-lists` automatically.
- **`apiRequest(method, url, data)`** — Central HTTP helper for mutations. Always sends `credentials: "include"` for session cookies.
- **`useResourceMutation<T>`** — Generic CRUD hook wrapping TanStack mutations for POST/PATCH/DELETE. Invalidates query cache on success, handles 401 redirects. Used by all domain hooks (`useGroceryLists`, `useCalendarEvents`, `useFamilyIdeas`, `useVisionBoard`, `useWishlist`).
- **`useAuth`** — Queries `/api/auth/user`; `isAuthenticated` is simply `!!user`.

### Authentication

Dual-mode auth in `server/replitAuth.ts`:
- **Replit (production)**: OpenID Connect via Passport.js. Sessions stored in PostgreSQL `sessions` table via `connect-pg-simple`. Requires `REPLIT_DOMAINS`, `REPL_ID`, and `SESSION_SECRET`.
- **Local dev**: When those env vars are absent, every request is auto-authenticated as a hardcoded dev user (configurable via `DEV_USER_ID`, `DEV_USER_EMAIL` env vars). No OAuth needed locally.

New users get sample data seeded automatically (`server/seed-data.ts`).

### Schema

`shared/schema.ts` is the single source of truth — Drizzle table definitions, Zod insert schemas (via `drizzle-zod`), and TypeScript types (via `$inferSelect`/`$inferInsert`). 13 tables: `sessions`, `families`, `familyInvitations`, `users`, `familyMembers`, `groceryLists`, `groceryItems`, `calendarEvents`, `familyIdeas`, `ideaLikes`, `visionItems`, `wishListItems`, `chatMessages`.

### Frontend structure

- **SPA routing**: Wouter — `Landing` (unauthenticated) or `Home` (authenticated) at `/`, plus 404.
- **Main app shell**: `FamilyCommandCenter` — tab-based UI (dashboard, grocery, calendar, ideas, vision, wishlist). Views except grocery are lazy-loaded. Swipe gestures for mobile tab navigation.
- **UI components**: 48 shadcn/ui components in `client/src/components/ui/`. Domain views in `client/src/components/{grocery,calendar,ideas,vision,wishlist,dashboard}/`.
- **Shared components**: `CommandPalette` (cmdk, Cmd+K), `ThemeToggle`, `MobileBottomNav`, skeleton loaders.
- **Dark mode**: Class-based via CSS variables, toggle in header.

### AI features (optional)

`server/openai.ts` — GPT-4o for family chat assistant, grocery predictions, schedule conflict detection. All features silently disabled when `OPENAI_API_KEY` is absent.

## Path Aliases

```
@/      → client/src/
@shared → shared/
@assets → attached_assets/
```

Configured in both `tsconfig.json` (paths) and `vite.config.ts` (resolve.alias).

## Gotchas

- **Port 5000** is hardcoded as default — only port not firewalled on Replit.
- **`db:push` not `migrate`** — Schema applied directly, no migration files in normal workflow.
- **`staleTime: Infinity`** — TanStack Query never auto-refetches; data updates only via mutation cache invalidation.
- **`queryKey` = URL** — Adding a query like `["/api/foo"]` will auto-fetch that URL. Don't use arbitrary keys.
- **WSL2 mobile dev**: `powershell -ExecutionPolicy Bypass -File .\scripts\expose-mobile.ps1` to expose to LAN.
- **No ESLint/Prettier config** — despite README mentions, no config files exist in the repo.
- **Tailwind v3** with v4's `@tailwindcss/vite` plugin in devDeps — config is in `tailwind.config.ts`.
