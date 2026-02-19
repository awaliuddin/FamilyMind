# NEXUS — FamilyMind Vision-to-Execution Dashboard

> **Owner**: Asif Waliuddin
> **Last Updated**: 2026-02-18
> **North Star**: *"Reduce the mental load of family organization by 40%+. Families spend less time planning and more time together."*

---

## Executive Dashboard

| ID | Initiative | Pillar | Status | Priority | Last Touched |
|----|-----------|--------|--------|----------|-------------|
| N-01 | [Smart Grocery Lists](#n-01-smart-grocery-lists) | ORGANIZE | SHIPPED | P0 | 2026-01-31 |
| N-02 | [Intelligent Calendar](#n-02-intelligent-calendar) | ORGANIZE | SHIPPED | P0 | 2026-01-31 |
| N-03 | [Family Ideas Board](#n-03-family-ideas-board) | CONNECT | SHIPPED | P0 | 2026-01-31 |
| N-04 | [Vision Board](#n-04-vision-board) | INSPIRE | SHIPPED | P1 | 2026-01-31 |
| N-05 | [Wish Lists](#n-05-wish-lists) | ORGANIZE | SHIPPED | P1 | 2026-01-31 |
| N-06 | [AI Assistant](#n-06-ai-assistant) | INTELLIGENCE | SHIPPED | P1 | 2026-01-31 |
| N-07 | [Command Palette](#n-07-command-palette) | EXPERIENCE | SHIPPED | P1 | 2025-11-23 |
| N-08 | [Dark Mode + Theming](#n-08-dark-mode) | EXPERIENCE | SHIPPED | P2 | 2025-11-23 |
| N-09 | [Mobile-First Responsive](#n-09-mobile-first) | EXPERIENCE | SHIPPED | P1 | 2026-01-31 |
| N-10 | [Family Auth + Invite System](#n-10-family-auth) | TRUST | SHIPPED | P0 | 2025-11-23 |
| N-11 | [v2.0 Architecture Rewrite](#n-11-v2-architecture) | TRUST | SHIPPED | P0 | 2025-11-23 |
| N-12 | [Mobile Apps (Capacitor)](#n-12-mobile-apps) | EXPERIENCE | IDEA | P1 | -- |
| N-13 | [Real-Time Collaboration (WebSocket)](#n-13-realtime) | CONNECT | IDEA | P2 | -- |
| N-14 | [Voice Commands](#n-14-voice-commands) | INTELLIGENCE | IDEA | P2 | -- |
| N-15 | [Recipe + Meal Planning](#n-15-recipes) | ORGANIZE | IDEA | P2 | -- |
| N-16 | [Budget Tracking](#n-16-budget) | ORGANIZE | IDEA | P3 | -- |
| N-17 | [Automated Test Suite](#n-17-test-suite) | TRUST | BUILDING | P1 | 2026-02-18 |
| N-18 | [Offline-First / PWA](#n-18-pwa) | EXPERIENCE | IDEA | P2 | -- |
| N-19 | [Premium Tier](#n-19-premium) | MONETIZE | IDEA | P3 | -- |

---

## Vision Pillars

*Derived from the project's north star. Every initiative must trace to at least one pillar.*

### ORGANIZE — "One place for everything your family manages"
- Grocery lists, calendars, wish lists, budget, recipes — the logistics layer.
- **Shipped**: N-01 (Grocery), N-02 (Calendar), N-05 (Wish Lists)
- **Ideas**: N-15 (Recipes), N-16 (Budget)

### CONNECT — "Democracy for family decisions"
- Ideas board with voting, real-time collaboration, shared context.
- **Shipped**: N-03 (Ideas Board)
- **Ideas**: N-13 (Real-Time Collaboration)

### INSPIRE — "Dream big together"
- Vision boards, goal tracking, milestone celebrations.
- **Shipped**: N-04 (Vision Board)

### INTELLIGENCE — "AI that knows your family"
- Context-aware suggestions, proactive reminders, pattern learning.
- **Shipped**: N-06 (AI Assistant)
- **Ideas**: N-14 (Voice Commands)

### EXPERIENCE — "Feels native, looks beautiful"
- Command palette, dark mode, mobile-first, animations, accessibility.
- **Shipped**: N-07 (Command Palette), N-08 (Dark Mode), N-09 (Mobile-First)
- **Ideas**: N-12 (Mobile Apps), N-18 (PWA)

### TRUST — "Reliable, secure, well-built"
- Auth, architecture quality, testing, data safety.
- **Shipped**: N-10 (Family Auth), N-11 (v2.0 Architecture)
- **Building**: N-17 (Test Suite)

### MONETIZE — "Sustainable product"
- Premium features, enterprise licensing.
- **Ideas**: N-19 (Premium Tier)

---

## Initiative Details

### N-01: Smart Grocery Lists
**Pillar**: ORGANIZE | **Status**: SHIPPED | **Priority**: P0
**What**: Store-specific grocery lists with CRUD, item management, sharing. Optimistic updates for instant UI.
**Key files**: `client/src/components/grocery/`, `client/src/hooks/useGroceryLists.ts`

### N-02: Intelligent Calendar
**Pillar**: ORGANIZE | **Status**: SHIPPED | **Priority**: P0
**What**: Family calendar with event categorization (Family/Work/School/Sports/Medical/Social), conflict detection.
**Key files**: `client/src/components/calendar/`, `client/src/hooks/useCalendarEvents.ts`

### N-03: Family Ideas Board
**Pillar**: CONNECT | **Status**: SHIPPED | **Priority**: P0
**What**: Collaborative idea board with voting/hearts. Tag-based organization. Family democracy.
**Key files**: `client/src/components/ideas/`, `client/src/hooks/useFamilyIdeas.ts`

### N-04: Vision Board
**Pillar**: INSPIRE | **Status**: SHIPPED | **Priority**: P1
**What**: Long-term family goal tracking with visual progress, milestones, photo attachments.
**Key files**: `client/src/components/vision/`, `client/src/hooks/useVisionBoard.ts`

### N-05: Wish Lists
**Pillar**: ORGANIZE | **Status**: SHIPPED | **Priority**: P1
**What**: Gift tracking per family member. Occasion reminders, price tracking, store links, budget.
**Key files**: `client/src/components/wishlist/`, `client/src/hooks/useWishlist.ts`

### N-06: AI Assistant
**Pillar**: INTELLIGENCE | **Status**: SHIPPED | **Priority**: P1
**What**: OpenAI-powered assistant with NL interaction, context-aware suggestions, proactive reminders.
**Key files**: `server/openai.ts`
**Note**: Cloud dependency (OpenAI API). Core features work without it.

### N-07: Command Palette
**Pillar**: EXPERIENCE | **Status**: SHIPPED | **Priority**: P1
**What**: `Cmd+K` navigation powered by cmdk. Navigate anywhere in 2 keystrokes.
**Key files**: `client/src/components/shared/CommandPalette.tsx`

### N-08: Dark Mode + Theming
**Pillar**: EXPERIENCE | **Status**: SHIPPED | **Priority**: P2
**What**: WCAG AAA contrast ratios. Persistent across sessions. Semantic color system.
**Key files**: `client/src/index.css`, `client/src/components/shared/ThemeToggle.tsx`

### N-09: Mobile-First Responsive
**Pillar**: EXPERIENCE | **Status**: SHIPPED | **Priority**: P1
**What**: Bottom navigation, swipe gestures, touch-optimized. WSL2 mobile dev access via PowerShell script.
**Key files**: `client/src/components/shared/MobileBottomNav.tsx`, `scripts/expose-mobile.ps1`

### N-10: Family Auth + Invite System
**Pillar**: TRUST | **Status**: SHIPPED | **Priority**: P0
**What**: OAuth via Passport.js. Family creation with invite codes. Member management.
**Key files**: `server/replitAuth.ts`, `server/routes.ts`

### N-11: v2.0 Architecture Rewrite
**Pillar**: TRUST | **Status**: SHIPPED | **Priority**: P0
**What**: From 1,800-line monolith to modular components (<200 lines each). Generic `useResourceMutation` hook. 90% size reduction per component.
**Key files**: `client/src/hooks/useResourceMutation.ts`

### N-12: Mobile Apps (Capacitor)
**Pillar**: EXPERIENCE | **Status**: IDEA | **Priority**: P1
**What**: Native iOS/Android via Capacitor. Native notifications, offline sync, camera (receipt scanning).

### N-13: Real-Time Collaboration (WebSocket)
**Pillar**: CONNECT | **Status**: IDEA | **Priority**: P2
**What**: WebSocket sync, live cursors, collaborative editing. `ws` package already in dependencies.

### N-14: Voice Commands
**Pillar**: INTELLIGENCE | **Status**: IDEA | **Priority**: P2
**What**: "Add milk to Costco list", "What's on the calendar tomorrow?" Hands-free operation.

### N-15: Recipe + Meal Planning
**Pillar**: ORGANIZE | **Status**: IDEA | **Priority**: P2
**What**: Import recipes from websites, auto-generate grocery lists, meal calendar, nutrition.

### N-16: Budget Tracking
**Pillar**: ORGANIZE | **Status**: IDEA | **Priority**: P3
**What**: Expense categorization, spending insights, budget goals, receipt OCR.

### N-17: Automated Test Suite
**Pillar**: TRUST | **Status**: BUILDING | **Priority**: P1
**What**: Vitest for unit tests, Playwright for E2E, accessibility testing. UAT guide exists (manual).
**Progress (2026-02-18)**: 10 test files, 62 test cases. Covers schema validation, 4 API route groups, 5 client hooks. No production code changes.

### N-18: Offline-First / PWA
**Pillar**: EXPERIENCE | **Status**: IDEA | **Priority**: P2
**What**: Full offline support, install to home screen, push notifications. Service worker caching.

### N-19: Premium Tier
**Pillar**: MONETIZE | **Status**: IDEA | **Priority**: P3
**What**: Advanced AI features, unlimited storage, priority support, custom branding.

---

## Status Lifecycle

```
IDEA ──> RESEARCHED ──> DECIDED ──> BUILDING ──> SHIPPED
  │          │              │           │
  └──────────┴──────────────┴───────────┴──> ARCHIVED
```

---

## Portfolio Intelligence

*Injected by CLX9 CoS, Enrichment Cycle #3 (2026-02-18). Context from across the portfolio relevant to this project.*

- **Shared patterns tracked**: FamilyMind's `useResourceMutation` hook and command palette (cmdk) pattern are listed in PORTFOLIO.md shared patterns. Other React projects in the portfolio may adopt them.
- **First consumer vertical**: FamilyMind is the portfolio's only consumer-facing product. Its full-stack TypeScript exception (ADR-005, ADR-006) is approved and documented.
- **Testing is the top priority**: With 11 shipped features and 0 automated tests, FamilyMind has the highest regression risk on CLX9. DIRECTIVE-CLX9-20260216-02 covers this.
- **Mobile apps (N-12) alignment**: When evaluating Capacitor for mobile, note that DesktopAI uses Tauri for native desktop. Different tools for different platforms, both ASIF-approved.

---

## CoS Directives

### DIRECTIVE-CLX9-20260216-02 — Add automated test suite for critical paths
**From**: CLX9 CoS | **Date**: 2026-02-16 | **Status**: DONE
**Priority**: P1

**Context**: FamilyMind has 11 shipped features and 0 automated tests — the highest regression risk in the CLX9 portfolio. A manual UAT guide exists (45 min) but provides no CI protection. N-17 (Automated Test Suite) is already in the NEXUS as an IDEA.

**Action Items**:
1. [x] Set up Vitest with standalone `vitest.config.ts` (Vitest 4.x, happy-dom for client, node for server)
2. [x] Write unit tests for `useResourceMutation` hook (6 tests: create/update/remove, cache invalidation, callbacks, 401 redirect)
3. [x] Write unit tests for 4 API route groups: grocery (9), calendar (6), family (6), auth (3)
4. [x] Update N-17 status from IDEA → BUILDING
5. [x] 10 test files, 62 test cases covering critical paths

**Constraints**:
- Use Vitest (already in CLAUDE.md as planned tooling)
- Test the hooks and API, not the UI components (higher ROI)
- Do NOT change production code to make it testable — if it's hard to test, note it as tech debt

**Response** (filled by project team):
> Completed 2026-02-18. Vitest 4.x test suite with 10 files, 62 tests. Coverage: schema validation (11 tests), server routes — grocery/calendar/family/auth (24 tests), client hooks — queryClient/useResourceMutation/useGroceryLists/useCalendarEvents/useAuth (27 tests). All mocking at module boundaries; zero production code changes. Standalone `vitest.config.ts` avoids Replit plugin conflicts. `npm test` runs in ~1.2s. Next: E2E with Playwright (N-17 → SHIPPED).

### DIRECTIVE-CLX9-20260218-03 — Add Playwright E2E tests for critical user flows
**From**: CLX9 CoS | **Date**: 2026-02-18 | **Status**: PENDING
**Priority**: P2

**Context**: FamilyMind now has 62 unit tests (DIRECTIVE-02 completed). The team noted "Next: E2E with Playwright (N-17 → SHIPPED)" in their response. E2E tests are the final gate before N-17 can move from BUILDING to SHIPPED. FamilyMind is a consumer product with real users — the most user-facing project in the CLX9 portfolio.

**Action Items**:
1. [ ] Install Playwright and configure for the project (`npx playwright install --with-deps chromium`)
2. [ ] Write E2E tests for 3 critical flows:
   - Login/auth flow (Passport.js + session)
   - Add a grocery item to a list (CRUD happy path)
   - Calendar event creation
3. [ ] Ensure `npm test` still works (Vitest unit tests unaffected)
4. [ ] Add a `npm run test:e2e` script to `package.json`
5. [ ] Update N-17 status from BUILDING → SHIPPED once E2E tests pass
6. [ ] Report total test count (unit + E2E)

**Constraints**:
- Playwright, not Cypress (ASIF preference for E2E)
- Tests must work against the local dev server — no external dependencies
- Do NOT test AI assistant features (OpenAI dependency makes E2E flaky)
- Keep it minimal — 3 flows is enough to prove the pattern

**Response** (filled by project team):
>

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-16 | Created. Onboarded into ASIF as P-05 via inception review. |
| 2026-02-16 | Renumbered to **P-12** after NXTG-AI portfolio merge. |
| 2026-02-16 | CoS Directive DIRECTIVE-CLX9-20260216-02 issued: add automated test suite. |
| 2026-02-18 | Portfolio Intelligence section added (Enrichment Cycle #3). |
| 2026-02-18 | DIRECTIVE-CLX9-20260216-02 completed. N-17 IDEA→BUILDING. Vitest suite: 10 files, 62 tests. |
| 2026-02-18 | CoS Directive DIRECTIVE-CLX9-20260218-03 issued: Playwright E2E tests for critical user flows. |
