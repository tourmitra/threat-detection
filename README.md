# ASPIREX 2026 Cloud Security Platform

ASPIREX is a cloud security and threat detection web application that tracks authentication events, highlights suspicious behavior, and provides an admin workflow for alert review and user account control.

It is built for serverless deployment on Vercel and combines real-time security visibility with role-based access for users and administrators.

## Project Overview

This project provides:

- Secure credentials authentication with login failure tracking
- Security event logging for registration, login success/failure, lockout, and logout
- Dashboard metrics for total events, active threats, and AI anomalies
- Admin alert feed with reason-level context for medium/high/critical issues
- Admin user management to manually lock/unlock user accounts
- Weather-aware contextual dashboard widget
- Optional anomaly scoring endpoint to flag unusual event behavior

## Tech Stack Used

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- NextAuth v5 (JWT strategy)
- Prisma ORM
- PostgreSQL (Neon)
- Vercel Serverless deployment

## Deployment Link

- Production: https://threat-detection-system-hazel.vercel.app

## GitHub Link

- Repository: https://github.com/tourmitra/threat-detection

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Create local environment file from template.

```bash
cp .env.example .env.local
```

3. Set required values in `.env.local`:

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `NEXTAUTH_SECRET` (same value as `AUTH_SECRET`)
- `AUTH_TRUST_HOST=true`
- `OPENWEATHER_API_KEY`

4. Push schema to database.

```bash
npx prisma db push
```

5. Start development server.

```bash
npm run dev
```

## Vercel Deployment

1. Push latest code to GitHub.
2. Import the repository in Vercel.
3. Add all required environment variables in Vercel Project Settings.
4. Use the build command:

```bash
npm run vercel-build
```

5. Redeploy.

## Required Environment Variables

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `NEXTAUTH_SECRET`
- `AUTH_TRUST_HOST=true`
- `NEXT_PUBLIC_APP_URL` (recommended)
- `OPENWEATHER_API_KEY`
- `CRON_SECRET` (optional)

## Cron Job (Hobby-Compatible)

`vercel.json` schedules `/api/anomaly` once daily.

- If `CRON_SECRET` is set, authorize calls with `Authorization: Bearer <CRON_SECRET>`.
- If `CRON_SECRET` is unset, the route can still run for demo usage.

## Verification

```bash
npm run build
```

Build should pass before deployment.

## Documentation Requirement Checklist

- Project overview: Included
- Tech stack used: Included
- Deployment link: Included
- GitHub link: Included

This README is intended to satisfy project documentation requirements for submission and internal company/project documentation.
