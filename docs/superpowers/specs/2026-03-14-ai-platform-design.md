# AI Platform Monorepo — Design Spec

**Date:** 2026-03-14
**Status:** Approved
**Purpose:** Full-stack job application sample demonstrating Next.js, Expo, Express, Docker, i18n, and Stripe integration.

---

## Overview

A monorepo called `ai-platform` containing three apps — a Next.js web dashboard, an Expo mobile app, and a Node.js/Express backend — orchestrated with Docker Compose. Five tasks are implemented across these apps.

---

## Repository Structure

```
ai-platform/
├── package.json              # npm workspaces root: ["web", "mobile", "backend"]
├── docker-compose.yml        # orchestrates web + api + db
├── .env.example              # all required env vars documented
├── README.md                 # how to run everything
├── docs/superpowers/specs/   # design docs
├── web/                      # Next.js 14 App Router + TypeScript + Tailwind + next-intl
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/
│   │   │   │   └── dashboard/    # main dashboard page (Tasks 1, 4, 5)
│   │   │   └── api/
│   │   │       └── counters/     # GET /api/counters (Task 1)
│   │   ├── components/           # CounterCard, SessionPanel, LanguageSwitcher
│   │   ├── middleware.ts         # next-intl locale routing middleware
│   │   └── i18n/                 # next-intl config + request handler
│   ├── messages/                 # en.json, ar.json, fr.json
│   └── Dockerfile
├── backend/                  # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── index.ts              # server entry, CORS, route mounting
│   │   └── routes/
│   │       └── stripe.ts         # POST /api/stripe/create-intent (Task 5)
│   └── Dockerfile
└── mobile/                   # Expo (React Native)
    └── src/
        └── screens/
            └── ApproveRejectScreen.tsx   # Task 2
```

---

## Task Designs

### Task 1 — Live Dashboard Counters (Next.js)

**Endpoint:** `GET /api/counters` — Next.js API route at `web/src/app/api/counters/route.ts`

- Module-level in-memory state holds three counters: `requestsMade`, `tokensUsed`, `activeConnections`
- Each request increments all counters by a random amount (requests: +1–5, tokens: +50–200, connections: ±1 bounded to 0–50)
- Returns `{ requestsMade, tokensUsed, activeConnections }`
- **Note:** In-memory state is intentionally ephemeral for this demo — a production implementation would use a shared store (Redis, PostgreSQL). Single-instance behavior is acceptable here.

**Dashboard Page:** `web/src/app/[locale]/dashboard/page.tsx`

- On mount and every 10 seconds via `setInterval` in `useEffect`, fetches `/api/counters` (relative URL, same Next.js process — no cross-origin issues)
- Three `CounterCard` components display the values with Tailwind styling
- Cleanup: `clearInterval` on unmount

---

### Task 2 — Mobile Approve/Reject Screen (Expo)

**File:** `mobile/src/screens/ApproveRejectScreen.tsx`

- `useState` holds `pending: Message[]` and `handled: Message[]`
- 4 hardcoded messages, each with `{ id, title, summary }` — no network calls
- **Approve:** removes from `pending`, appends to `handled`
- **Reject:** removes from `pending` only (not added to `handled`)
- UI: `ScrollView` with pending messages listed first; a "Handled" section below renders handled items in greyed style with a checkmark indicator
- When `pending` is empty, the pending section shows a "No pending messages" empty state
- Works on iOS and Android via Expo managed workflow

---

### Task 3 — Docker Compose Stack

**Services:**

| Service | Build | External Port | Internal Port | Depends On |
|---------|-------|--------------|---------------|------------|
| `db` | `postgres:16-alpine` | — | 5432 | — |
| `api` | `backend/Dockerfile` | 4000 | 4000 | `db` (healthcheck) |
| `web` | `web/Dockerfile` | 3000 | 3000 | `api` (healthcheck) |

- All services on a shared `app-network` Docker bridge network
- `db` exposes no external port (internal only for security)
- `api` exposes port 4000 externally so the browser can reach it directly at `http://localhost:4000`
- `web` exposes port 3000 externally

**URL strategy (browser vs server):**
- Browser-side fetches (SessionPanel → Express) use `NEXT_PUBLIC_API_URL=http://localhost:4000` — the publicly-exposed port that the host browser can reach
- Server-side fetches within Next.js (if any) would use `BACKEND_URL=http://api:4000` — the Docker-internal service name
- `/api/counters` is a Next.js API route (same process), so no cross-service URL is needed

**Healthchecks:**
- `db`: `pg_isready -U ${POSTGRES_USER}`
- `api`: `curl -f http://localhost:4000/health` (Express exposes a `GET /health` route returning 200)
- `web` depends on `api` being healthy before starting

**Dockerfiles:** Multi-stage builds — `node:20-alpine` for both web and backend. Backend compiles TypeScript before running. Next.js uses `output: 'standalone'` for minimal image size.

**Single command:** `docker compose up`

---

### Task 4 — Multi-language + RTL (next-intl)

**Routing:** Next.js App Router locale segments — `/en/dashboard`, `/ar/dashboard`, `/fr/dashboard`

**Middleware:** `web/src/middleware.ts` uses `next-intl`'s `createMiddleware` with:
- `locales: ['en', 'ar', 'fr']`
- `defaultLocale: 'en'`
- `localeDetection: true` (reads `NEXT_LOCALE` cookie first, then `Accept-Language` header)

**Locale persistence:** Language switcher sets the `NEXT_LOCALE` cookie (e.g., `document.cookie = 'NEXT_LOCALE=ar; path=/'`). On next request, `next-intl` middleware reads this cookie and redirects to the matching locale segment. Cookie persists across refreshes.

**RTL:** Root layout (`web/src/app/[locale]/layout.tsx`) sets:
```tsx
<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
```
Tailwind handles RTL layout via the `dir` attribute. Logical CSS properties (`start`/`end` instead of `left`/`right`) are used where explicit directional control is needed.

**Translation keys** (all visible UI text across `messages/en.json`, `messages/ar.json`, `messages/fr.json`):
- `dashboard.title`, `dashboard.subtitle`
- `counters.requests`, `counters.tokens`, `counters.connections`
- `session.start`, `session.end`, `session.cost`, `session.duration`, `session.paymentId`
- `language.label`, `language.switcher`

**Supported locales:** `en` (English, LTR), `ar` (Arabic, RTL), `fr` (French, LTR)

---

### Task 5 — Stripe Metered Billing (Backend + Web)

**Session Panel component:** `web/src/components/SessionPanel.tsx`

- **Start Session:** records `startTime = Date.now()`, starts a `setInterval` (1s tick) updating displayed elapsed time and cost
- **Live display:** `elapsed = (Date.now() - startTime) / 1000` seconds; `cost = elapsed * 0.02` displayed as `$X.XX`
- **End Session:** clears interval, POSTs to `${NEXT_PUBLIC_API_URL}/api/stripe/create-intent` with body `{ amount: Math.max(50, Math.ceil(elapsed * 2)) }` (cents — $0.02/s × elapsed = elapsed × 2 cents; minimum 50 cents to satisfy Stripe's minimum charge)
- Displays returned `payment_intent_id` in a success banner
- **Note:** This demo creates a PaymentIntent in test mode only — no Stripe.js payment confirmation flow is implemented. The PaymentIntent represents the charge intent; reviewers should understand this is a backend integration demo, not a full checkout flow.

**Backend route:** `backend/src/routes/stripe.ts`

- `POST /api/stripe/create-intent`
- Body: `{ amount: number }` (cents, minimum 50 to satisfy Stripe's minimum charge requirement)
- Creates: `stripe.paymentIntents.create({ amount, currency: 'usd' })`
- Returns: `{ payment_intent_id: intent.id }`
- Uses `STRIPE_SECRET_KEY` from environment (must be a test key: `sk_test_...`)

**Backend health route:** `GET /health` returns `{ status: 'ok' }` — used by Docker healthcheck.

---

## Environment Variables

**`.env.example`:**
```env
# Database
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret
POSTGRES_DB=aiplatform

# Backend (used by Express service)
DATABASE_URL=postgresql://admin:secret@db:5432/aiplatform
STRIPE_SECRET_KEY=sk_test_xxxx
PORT=4000

# Web (used by Next.js service)
# NEXT_PUBLIC_ variables are inlined into the browser bundle at build time
NEXT_PUBLIC_API_URL=http://localhost:4000

# Internal server-side URL for Next.js to reach the Express service within Docker
BACKEND_URL=http://api:4000
```

> **Notes:**
> - No Stripe publishable key is needed — the frontend never calls Stripe.js directly in this demo. The PaymentIntent is created entirely server-side.
> - `DATABASE_URL` is included to demonstrate a complete Docker Compose stack with a live PostgreSQL connection. The backend connects to the database on startup (connection verification) even though no queries are made in Task 5. This keeps the infrastructure realistic.

---

## CORS Configuration

Express backend allows browser requests from:
```ts
const allowedOrigins = [
  'http://localhost:3000',  // browser hitting Next.js dev server or Docker-exposed port
];
cors({ origin: allowedOrigins })
```
> **Note:** CORS applies only to browser-initiated requests. Server-side Next.js (SSR) calls to Express do not send an `Origin` header, so no additional CORS entry is needed for Docker-internal traffic.

---

## Cross-Cutting Concerns

- **TypeScript:** All web and backend code is TypeScript. Expo uses TypeScript via the default Expo template.
- **Code quality:** Comments on non-obvious logic (counter randomization, RTL detection, Stripe amount conversion, cents math).
- **Error handling:**
  - API routes return appropriate HTTP status codes with JSON error bodies
  - Frontend shows inline error messages for failed fetches (counters show last known value; session panel shows error on Stripe failure)
  - Express uses try/catch around Stripe calls, returns 500 with message on failure

---

## Technology Versions

| Tech | Version |
|------|---------|
| Next.js | 14 (App Router) |
| React | 18 |
| TypeScript | 5 |
| Tailwind CSS | 3 |
| next-intl | 3 |
| Expo SDK | 51 |
| Express | 4 |
| Stripe Node SDK | 15 |
| PostgreSQL | 16 |
| Node.js | 20 (Alpine) |
