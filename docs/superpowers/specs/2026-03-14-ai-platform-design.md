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

**Dashboard Page:** `web/src/app/[locale]/dashboard/page.tsx`

- On mount and every 10 seconds via `setInterval` in `useEffect`, fetches `/api/counters`
- Three `CounterCard` components display the values with Tailwind styling
- Cleanup: `clearInterval` on unmount

---

### Task 2 — Mobile Approve/Reject Screen (Expo)

**File:** `mobile/src/screens/ApproveRejectScreen.tsx`

- `useState` holds `pending: Message[]` and `handled: Message[]`
- 4 hardcoded messages, each with `{ id, title, summary }`
- **Approve:** removes from `pending`, appends to `handled`
- **Reject:** removes from `pending` only (not added to `handled`)
- UI: `FlatList` for pending messages; below it a "Handled" section renders handled items in greyed style with a checkmark
- Works on iOS and Android via Expo managed workflow

---

### Task 3 — Docker Compose Stack

**Services:**

| Service | Build | Port | Depends On |
|---------|-------|------|------------|
| `db` | `postgres:16-alpine` | 5432 (internal) | — |
| `api` | `backend/Dockerfile` | 4000 | `db` (healthcheck) |
| `web` | `web/Dockerfile` | 3000 | `api` |

- All services on a shared `app-network` Docker bridge network
- `api` connects to `db` via `DATABASE_URL=postgresql://...@db:5432/aiplatform`
- `web` calls `api` via `NEXT_PUBLIC_API_URL=http://api:4000`
- Both `web` and `backend` use multi-stage `node:20-alpine` Dockerfiles
- Next.js built with `output: 'standalone'` for minimal image size
- Single command: `docker compose up`

---

### Task 4 — Multi-language + RTL (next-intl)

**Routing:** Next.js App Router locale segments — `/en/dashboard`, `/ar/dashboard`, `/fr/dashboard`

**Locale persistence:** Language switcher writes to a `NEXT_LOCALE` cookie. `next-intl` middleware reads this cookie on each request to determine active locale.

**RTL:** Root layout sets `<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>`. Tailwind CSS handles RTL layout flipping via `dir` attribute natively (logical properties where needed).

**Translation keys** (all visible UI text):
- `dashboard.title`, `dashboard.subtitle`
- `counters.requests`, `counters.tokens`, `counters.connections`
- `session.start`, `session.end`, `session.cost`, `session.duration`, `session.paymentId`
- `language.label`

**Supported locales:** `en` (English), `ar` (Arabic, RTL), `fr` (French)

---

### Task 5 — Stripe Metered Billing (Backend + Web)

**Session Panel component:** `web/src/components/SessionPanel.tsx`

- **Start Session:** records `startTime = Date.now()`, starts a `setInterval` (1s tick)
- **Live display:** `elapsed = (Date.now() - startTime) / 1000` seconds; `cost = elapsed * 0.02` displayed as `$X.XX`
- **End Session:** clears interval, POSTs `{ amount: Math.ceil(elapsed * 2) }` (cents) to `http://[API_URL]/api/stripe/create-intent`
- Displays returned `payment_intent_id` in a success banner

**Backend route:** `backend/src/routes/stripe.ts`

- `POST /api/stripe/create-intent`
- Body: `{ amount: number }` (cents)
- Creates a Stripe `PaymentIntent` in test mode: `stripe.paymentIntents.create({ amount, currency: 'usd' })`
- Returns `{ payment_intent_id: intent.id }`
- Uses `STRIPE_SECRET_KEY` from environment (test key: `sk_test_...`)

---

## Environment Variables

**`.env.example`:**
```env
# Database
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret
POSTGRES_DB=aiplatform

# Backend
DATABASE_URL=postgresql://admin:secret@db:5432/aiplatform
STRIPE_SECRET_KEY=sk_test_xxxx
PORT=4000

# Web
NEXT_PUBLIC_API_URL=http://api:4000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
```

---

## Cross-Cutting Concerns

- **TypeScript:** All web and backend code is TypeScript. Expo uses TypeScript via the default Expo template.
- **CORS:** Express backend has `cors()` middleware allowing requests from `http://localhost:3000` and the Docker `web` service origin.
- **Code quality:** Comments on non-obvious logic (counter randomization, RTL detection, Stripe amount conversion).
- **Error handling:** API routes return appropriate HTTP status codes; frontend shows error states for failed fetches.

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
