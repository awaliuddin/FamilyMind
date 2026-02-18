# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ASIF Portfolio Context

This project is **P-12** in the [ASIF portfolio](~/ASIF/PORTFOLIO.md) — the first consumer vertical.

- **NEXUS**: `.asif/NEXUS.md` — 19 initiatives, 7 vision pillars. Open this at the start of every session.
- **Reusable modules**: `useResourceMutation` hook, command palette (cmdk), shadcn/ui integration, mobile-first patterns.
- **Key governance rules** (from ASIF):
  - Full-stack TypeScript is an **approved exception** to the Python-brain rule (ADR-005, ADR-006)
  - Cloud services (Neon, OpenAI, SendGrid) are approved for consumer products (ADR-006)
  - AGPL dependencies are **blocked** — check `~/ASIF/standards/tech-stack-registry.md`
  - Test counts never decrease (note: no automated tests yet — priority gap)
- **Cross-project patterns**: Scheduling intelligence could share patterns with P-02 (GoPMO).
- **Handoff notes**: Check `~/ASIF/machines/HANDOFF.md` for cross-machine coordination notes.

### ASIF Governance
This project is governed by the ASIF portfolio. On every session:
1. Read `.asif/NEXUS.md` — check for `## CoS Directives` section
2. Execute any PENDING directives before other work (unless Asif overrides)
3. Write your response inline under each directive
4. Update initiative statuses in NEXUS if your work changes them
5. If you have questions for the CoS, add them under `## Team Questions` in NEXUS

## Project Overview

**FamilyMind** is an AI-powered family command center. Reduce the mental load of family organization by 40%+.

**North Star**: *"Families spend less time planning and more time together."*

## Architecture

Full-stack TypeScript monorepo (single `package.json`, no workspaces):

```
client/src/          → React 18 + Vite frontend
  components/        → Domain views (grocery, calendar, ideas, vision, wishlist)
  components/shared/ → CommandPalette, ThemeToggle, MobileBottomNav, Skeletons
  components/ui/     → 48 shadcn/ui components (Radix-based, accessible)
  hooks/             → 7 custom hooks (useResourceMutation is the key one)
  pages/             → landing.tsx, home.tsx, not-found.tsx
  lib/               → queryClient, utils, authUtils

server/              → Node.js + Express backend
  index.ts           → Express app, middleware, port 5000
  routes.ts          → 30+ API endpoints (680 lines)
  storage.ts         → DatabaseStorage (IStorage interface, Drizzle ORM)
  db.ts              → Drizzle connection (Neon PostgreSQL)
  replitAuth.ts      → Passport.js + OpenID Connect auth
  openai.ts          → AI features (chat, grocery predictions, conflict detection)

shared/
  schema.ts          → Drizzle + Zod schemas (13 tables, single source of truth)
```

## Development Commands

```bash
# Setup
npm install
cp .env.example .env  # Edit with DATABASE_URL and SESSION_SECRET

# Database
npm run db:push       # Apply Drizzle schema to PostgreSQL

# Development (Vite HMR + Express on port 5000)
npm run dev

# Build
npm run build         # Vite client → dist/public, esbuild server → dist/index.js

# Production
npm run start

# Type checking
npm run check
```

## Tech Stack

- **Frontend**: React 18.3, TypeScript 5.6, Vite 5.4, Tailwind CSS, shadcn/ui (48 components), TanStack Query, Wouter (1.5KB router), cmdk (Cmd+K), Framer Motion
- **Backend**: Express 4.21, Drizzle ORM, PostgreSQL (Neon serverless), Passport.js, Zod
- **AI**: OpenAI API (optional — core works without it)
- **Email**: SendGrid (optional — invites work without it)

## Key Patterns

- **`useResourceMutation`**: Generic CRUD hook eliminating 300+ lines of duplication per resource. Handles POST/PATCH/DELETE with optimistic updates and toast notifications.
- **Database schema in `shared/schema.ts`**: Single source of truth. Drizzle for ORM, Zod for runtime validation. Types shared between client and server.
- **Dev auth fallback**: When `REPL_ID` is not set (local dev), uses hardcoded dev user. No OAuth needed locally.
- **OpenAI optional**: If no `OPENAI_API_KEY`, AI features silently disabled.
- **Mobile-first**: Bottom nav on mobile, sidebar on desktop. PowerShell scripts for WSL2 LAN access.
- **Dark mode**: Class-based via CSS variables. All components support both themes.

## Path Aliases

```
@/     → client/src/
@shared → shared/
@assets → attached_assets/
```

## Gotchas

- **Port 5000** (not 3000) — only port not firewalled on Replit
- **Monorepo layout**: Single root `package.json`. Client, server, shared compiled together.
- **Drizzle `push` not `migrate`**: Schema applied directly via `db:push`, not migration files
- **Session storage**: PostgreSQL `sessions` table. Requires `DATABASE_URL` to create sessions.
- **WSL2 mobile dev**: Run `powershell -ExecutionPolicy Bypass -File .\scripts\expose-mobile.ps1` to expose to LAN
- **No automated tests**: Manual UAT guide exists (`UAT-TEST-GUIDE.md`, 45 min). Vitest/Playwright planned.
