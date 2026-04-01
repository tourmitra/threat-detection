# ASPIREX 2026 Cloud Security Platform

Serverless threat detection dashboard built with Next.js App Router, NextAuth v5, Prisma, and PostgreSQL.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- NextAuth v5 (JWT session)
- Prisma + PostgreSQL (Neon-compatible)

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Create environment variables from template.

```bash
cp .env.example .env.local
```

3. Set `DATABASE_URL`, `AUTH_SECRET`, and `OPENWEATHER_API_KEY`.

4. Apply schema.

```bash
npx prisma db push
```

5. Run development server.

```bash
npm run dev
```

## Deployment on Vercel

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. In Vercel project settings, add all variables from `.env.example`.
4. Set Build Command to:

```bash
npm run vercel-build
```

5. Deploy.

## Required Environment Variables

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST=true`
- `NEXT_PUBLIC_APP_URL` (recommended)
- `OPENWEATHER_API_KEY`
- `CRON_SECRET` (recommended if cron is enabled)

## Cron Job

`vercel.json` includes a cron schedule that hits `/api/anomaly` once daily (Hobby-compatible).

- If `CRON_SECRET` is set, send `Authorization: Bearer <CRON_SECRET>` to `/api/anomaly`.
- If `CRON_SECRET` is not set, the route still runs for easier hackathon demos.

## Verification

```bash
npm run build
```

Build must pass before deploying.
