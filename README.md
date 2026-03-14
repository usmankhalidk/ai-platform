# AI Platform

A full-stack monorepo job application sample demonstrating:

- **Next.js 14** dashboard with live counters, Stripe billing, and multi-language/RTL support
- **Expo (React Native)** mobile approve/reject screen
- **Express + PostgreSQL** backend
- **Docker Compose** one-command orchestration

---

## Quick Start (Docker — recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Steps

```bash
# 1. Clone and enter the repo
git clone <repo-url> && cd ai-platform

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your Stripe test key (sk_test_...)

# 3. Start everything
docker compose up
```

- Web dashboard: http://localhost:3000/en/dashboard
- Express API: http://localhost:4000

---

## Local Development (without Docker)

### Prerequisites
- Node.js 20+
- npm 10+
- PostgreSQL 16 running locally

### Backend

```bash
cd backend
cp ../.env.example .env    # then edit DATABASE_URL to point to local Postgres
npm install
npm run dev                # starts on http://localhost:4000
```

### Web

```bash
cd web
cp ../.env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev                      # starts on http://localhost:3000
```

Visit: http://localhost:3000/en/dashboard

### Mobile (Expo)

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with the Expo Go app on your phone, or press `i` for iOS simulator / `a` for Android.

---

## Project Structure

```
ai-platform/
├── web/        Next.js 14 + TypeScript + Tailwind CSS + next-intl
├── mobile/     React Native with Expo
├── backend/    Node.js + Express + PostgreSQL
└── docker-compose.yml
```

---

## Features

### Task 1 — Live Dashboard Counters
The `/dashboard` page polls `/api/counters` every 10 seconds and updates three live counters without a page refresh.

### Task 2 — Mobile Approve/Reject
Expo screen with a list of AI-generated messages. Tap Approve to move to "Handled", Reject to dismiss.

### Task 3 — Docker Compose Stack
`docker compose up` starts all three services (web, api, db) on a shared network. No other commands needed.

### Task 4 — Multi-language + RTL
Language switcher on the dashboard toggles between English, Arabic (RTL), and French. Language preference is stored in a cookie and persists across refreshes. Arabic flips the entire layout to right-to-left.

### Task 5 — Stripe Metered Billing
Session panel with Start/End buttons. Tracks elapsed time and live cost at $0.02/second. On end, creates a Stripe PaymentIntent (test mode) via the Express backend and displays the `payment_intent_id`.

---

## Environment Variables

See [.env.example](.env.example) for all required variables with descriptions.

Key variables:
| Variable | Where | Purpose |
|---|---|---|
| `STRIPE_SECRET_KEY` | backend | Stripe test secret key (`sk_test_...`) |
| `NEXT_PUBLIC_API_URL` | web | Browser-accessible URL of the Express API |
| `DATABASE_URL` | backend | PostgreSQL connection string |
| `POSTGRES_*` | docker-compose | Database credentials |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web | Next.js 14, TypeScript, Tailwind CSS, next-intl |
| Mobile | Expo SDK 51, React Native, TypeScript |
| Backend | Node.js 20, Express 4, TypeScript, Stripe SDK |
| Database | PostgreSQL 16 |
| Infrastructure | Docker, Docker Compose |
