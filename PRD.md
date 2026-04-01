# Product Requirements Document
## Cloud Security & Threat Detection System
### ASPIREX 2026

---

**Version:** 1.0  
**Date:** April 1, 2026  
**Status:** Draft  
**Deployment Target:** Vercel

---

## 1. Overview

### 1.1 Problem Statement

Organizations face growing risks from unauthorized access, anomalous cloud activity, and delayed incident response. This system provides a centralized platform to detect suspicious activities, alert administrators in real time, and maintain auditable security event logs — all from a personalized, weather-aware dashboard.

### 1.2 Product Vision

A full-stack web application that combines user identity management, real-time threat detection, AI-powered anomaly detection, and a contextual dashboard enriched with live weather data — deployed serverlessly on Vercel.

### 1.3 Success Metrics

- Auth flow completion rate ≥ 95%
- Security event log latency < 2 seconds
- Admin alert delivery time < 5 seconds
- AI anomaly detection accuracy ≥ 85%
- Lighthouse performance score ≥ 85 on dashboard

---

## 2. Users & Roles

| Role | Description |
|---|---|
| **Admin** | Full access to all logs, alerts, and user management |
| **User** | Can view their own security events and profile |
| **System** | Automated actor that generates events and triggers alerts |

---

## 3. Core Features

### 3.1 Authentication & Registration

#### 3.1.1 Registration Page

**Route:** `/register`

**Fields:**
- Full Name (required)
- Email Address (required, unique)
- Password (required, min 8 chars, strength indicator)
- Confirm Password (required)
- City (required — used for Weather API on dashboard)
- Country (required)
- Phone Number (optional)
- Profile Avatar Upload (optional)

**Behavior:**
- Real-time field validation with inline error messages
- Password strength meter (Weak / Fair / Strong / Very Strong)
- On successful registration → redirect to `/dashboard`
- Duplicate email → show inline error
- Store hashed password (bcrypt), never plaintext

**Vercel Consideration:** Registration handler runs as a Vercel Serverless Function (`/api/auth/register`).

---

#### 3.1.2 Login Page

**Route:** `/login`

**Fields:**
- Email Address
- Password
- "Remember me" checkbox (30-day session)

**Behavior:**
- JWT-based authentication, stored in `httpOnly` cookie
- Failed login attempts logged as a security event
- After 5 failed attempts → account temporarily locked (15 min) + admin alerted
- Forgot Password → `/forgot-password` flow with email OTP

**Security Events Triggered:**
- `LOGIN_SUCCESS`
- `LOGIN_FAILED`
- `ACCOUNT_LOCKED`

---

### 3.2 User Profile & Personal Details

**Route:** `/profile`

**Editable Fields:**
- Full Name
- City / Location (syncs with Weather API)
- Phone Number
- Avatar
- Notification preferences (email, in-app)
- Change Password

---

### 3.3 Dashboard

**Route:** `/dashboard`

The main hub. Displays the security posture at a glance, enriched with live context.

#### 3.3.1 Weather Widget

- Fetches weather for the user's saved city via **OpenWeatherMap API** (or WeatherAPI.com)
- Displayed in top-right of dashboard header
- Shows: city name, temperature, weather icon, short description (e.g., "Partly Cloudy")
- Dashboard background / accent colors subtly shift to reflect weather condition:
  - ☀️ Clear → warm amber tones
  - 🌧 Rain → cool blue/grey tones
  - 🌩 Storm → dark red/orange warning tones (mirrors security alert feel)
  - ❄️ Snow → icy blue/white tones
- Weather data cached per city for 30 minutes to respect API rate limits

**Vercel Consideration:** Weather fetch runs via a Vercel Serverless Function (`/api/weather?city=`) to keep the API key server-side.

---

#### 3.3.2 Security Summary Cards

Top-of-dashboard stat cards:

| Card | Description |
|---|---|
| **Total Events** | Count of all logged security events |
| **Active Threats** | Count of unresolved HIGH/CRITICAL events |
| **Alerts Sent** | Number of admin alerts dispatched (last 24 hrs) |
| **Anomalies Detected** | AI-flagged unusual activities |

---

#### 3.3.3 Security Event Log Table

A full, paginated, filterable log of all security events.

**Columns:**
- Timestamp
- Event Type (badge color-coded by severity)
- User / Actor
- IP Address
- Location (derived from IP)
- Severity (INFO / LOW / MEDIUM / HIGH / CRITICAL)
- Status (Open / Resolved / Investigating)
- Actions (View Details, Resolve, Escalate)

**Filters:**
- Date range picker
- Severity filter (multi-select)
- Event type filter
- User/Actor search
- Status filter

**Sorting:** All columns sortable.

**Export:** CSV and JSON export of filtered results.

---

#### 3.3.4 Real-Time Updates

- Security log table auto-refreshes every 30 seconds
- New HIGH/CRITICAL events surface a toast notification in-app
- Badge count on browser tab updates with unresolved alert count

---

#### 3.3.5 Activity Chart

- Line/bar chart showing event volume over time (last 7 days / 30 days toggle)
- Breakdown by severity
- Built with Recharts or Chart.js

---

### 3.4 Threat Detection Engine

Runs server-side. Evaluates incoming activity and classifies events.

#### 3.4.1 Rule-Based Detection

| Rule | Trigger | Severity |
|---|---|---|
| Brute Force | 5+ failed logins in 10 min from same IP | HIGH |
| Impossible Travel | Login from two countries within 1 hour | CRITICAL |
| Off-Hours Access | Login between 12am–5am local time | MEDIUM |
| New Device Login | First login from a new browser/device fingerprint | LOW |
| Privilege Escalation | Role change detected | HIGH |
| Mass Data Export | >500 records exported in < 5 min | HIGH |
| Account Lockout | Account locked after failed attempts | MEDIUM |

#### 3.4.2 AI-Based Anomaly Detection *(Bonus)*

- Uses a lightweight ML model (Isolation Forest or similar) trained on user behavioral baselines
- Features: login time distribution, session duration, typical IP ranges, event frequency
- Flags deviations as anomalies with a confidence score
- Model runs entirely as a Next.js Route Handler (`/api/anomaly`) using the `isolation-forest` npm package — no Python runtime needed
- Anomaly events tagged with `AI_ANOMALY` event type and displayed separately on dashboard
- Feedback loop: Admins can mark anomalies as "True Positive" or "False Positive" to improve future accuracy

---

### 3.5 Admin Alert System

**Triggers:** HIGH or CRITICAL severity events.

**Alert Channels:**
- In-app notification (bell icon in nav, with count badge)
- Email notification (via Resend or SendGrid — serverless-compatible)
- Optional: Webhook delivery to Slack or MS Teams

**Alert Payload Includes:**
- Event type
- Severity
- Affected user
- Timestamp
- IP address and location
- Direct link to event detail page

**Alert Management:**
- Admins can acknowledge, resolve, or escalate an alert
- Resolved alerts are archived, not deleted
- Alert history accessible at `/admin/alerts`

---

## 4. Pages & Routes

| Route | Description | Access |
|---|---|---|
| `/` | Landing / marketing page | Public |
| `/login` | Login form | Public |
| `/register` | Registration form | Public |
| `/forgot-password` | Password reset | Public |
| `/dashboard` | Main security dashboard | Authenticated |
| `/profile` | User profile & settings | Authenticated |
| `/logs` | Full security event log | Authenticated |
| `/logs/:id` | Event detail view | Authenticated |
| `/admin/alerts` | Admin alert management | Admin only |
| `/admin/users` | User management | Admin only |
| `/api/auth/*` | Auth serverless functions | Internal |
| `/api/events` | Event ingestion endpoint | Internal |
| `/api/weather` | Weather proxy | Internal |
| `/api/anomaly` | AI anomaly detection | Internal |

---

## 5. Tech Stack

### 5.1 Frontend

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| UI Components | shadcn/ui |
| State Management | Zustand or React Context |
| Forms | React Hook Form + Zod validation |
| Icons | Lucide React |

### 5.2 Backend (Vercel Serverless)

| Layer | Technology |
|---|---|
| API Routes | Next.js Route Handlers (`/app/api/`) |
| Auth | NextAuth.js v5 (JWT strategy) |
| Password Hashing | bcryptjs |
| Email Alerts | Resend SDK |
| AI Anomaly Detection | JS — Isolation Forest via `isolation-forest` npm package |

### 5.3 Database

| Purpose | Technology |
|---|---|
| Primary DB | PostgreSQL via Neon (serverless-compatible) |
| ORM | Prisma |
| Caching | Vercel KV (Redis) — for weather cache, rate limiting |

### 5.4 External APIs

| API | Purpose |
|---|---|
| OpenWeatherMap | Live weather by city |
| Resend | Transactional email alerts |
| ipapi.co or ipinfo.io | IP geolocation for threat detection |

### 5.5 Deployment

| Concern | Approach |
|---|---|
| Hosting | Vercel (Hobby or Pro) |
| Environment Variables | Vercel Environment Variables dashboard |
| Edge Functions | Used for auth middleware (fast JWT validation) |
| Cron Jobs | Vercel Cron — periodic anomaly model refresh or cleanup tasks |
| Build | `next build` — static + serverless hybrid |

---

## 6. Data Models

### User
```
id, email, name, passwordHash, city, country, phone,
avatarUrl, role (USER|ADMIN), createdAt, updatedAt,
lastLoginAt, failedLoginCount, lockedUntil
```

### SecurityEvent
```
id, userId, eventType, severity (INFO|LOW|MEDIUM|HIGH|CRITICAL),
ipAddress, location, deviceFingerprint, metadata (JSON),
status (OPEN|INVESTIGATING|RESOLVED), isAiAnomaly,
anomalyScore, resolvedBy, resolvedAt, createdAt
```

### Alert
```
id, eventId, channel (EMAIL|IN_APP|WEBHOOK),
sentAt, acknowledgedAt, acknowledgedBy, status
```

### Session
```
id, userId, token, deviceInfo, ipAddress, createdAt, expiresAt
```

---

## 7. Security Requirements

- All API routes protected with JWT middleware
- Role-based access control (RBAC) enforced server-side
- Passwords hashed with bcrypt (salt rounds ≥ 12)
- Rate limiting on `/api/auth/*` endpoints (Vercel KV-backed)
- All external API keys stored as Vercel Environment Variables — never in client bundle
- HTTPS enforced (automatic via Vercel)
- Content Security Policy (CSP) headers configured
- CORS restricted to own domain
- SQL injection protection via Prisma parameterized queries
- Input sanitization on all form fields

---

## 8. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load (dashboard) | < 2 seconds on 4G |
| API response time | < 500ms p95 |
| Availability | 99.9% (Vercel SLA) |
| Mobile responsiveness | Full support (320px–2560px) |
| Accessibility | WCAG 2.1 AA |
| Log retention | 90 days default, configurable |

---

## 9. Out of Scope (v1)

- Multi-tenancy / organization-level accounts
- SIEM integrations (Splunk, Datadog)
- Mobile native app
- Custom ML model training UI
- SOC2 compliance certification

---

## 10. Milestones

| Phase | Deliverable | Est. Duration |
|---|---|---|
| **Phase 1** | Auth (register, login, JWT, forgot password) | Week 1 |
| **Phase 2** | Dashboard shell + Weather widget + Profile | Week 2 |
| **Phase 3** | Security Event Log + Rule-based detection | Week 3 |
| **Phase 4** | Admin alerts + Email notifications | Week 3–4 |
| **Phase 5** | AI anomaly detection (bonus) | Week 4–5 |
| **Phase 6** | Polish, testing, Vercel deployment | Week 5 |

---

## 11. Open Questions

1. Which Weather API — OpenWeatherMap free tier or WeatherAPI.com?
2. ~~For AI anomaly detection: run entirely in JS (ONNX runtime), or use Vercel's Python runtime?~~ **Resolved: JS using `isolation-forest` npm package.**
3. Should the landing page (`/`) be a marketing page or redirect directly to `/login`?
4. Email alerts only, or also Slack/Teams webhook support in v1?
5. Database: Neon PostgreSQL (recommended for Vercel) or PlanetScale MySQL?

---

*PRD prepared for ASPIREX 2026 hackathon submission.*
