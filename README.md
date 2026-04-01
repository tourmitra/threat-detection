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


