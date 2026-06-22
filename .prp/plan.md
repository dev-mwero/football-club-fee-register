# Football Academy Fee Register System — Build Plan

## Overview

Build a production-ready fee management system for a football academy.
Each phase is a separate git commit, independently testable.

---

## Phase 0 — Setup + Database (Commit 1: `chore: setup project dependencies and database models`)

### Install dependencies
- Runtime: `mongoose`, `bcryptjs`, `jose`, `zod`, `react-hook-form`, `@hookform/resolvers`, `nodemailer`, `node-cron`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`
- Types: `@types/bcryptjs`, `@types/nodemailer`, `@types/node-cron`
- shadcn/ui via `npx shadcn@latest init`

### Project structure
```
src/
  lib/          db.ts, utils.ts, auth.ts, email.ts, paystack.ts
  models/       User.ts, Player.ts, FeeStructure.ts, Payment.ts, FeeRecord.ts, Notification.ts
  services/     player-service.ts, fee-service.ts, payment-service.ts, email-service.ts,
                notification-service.ts, report-service.ts
  types/        index.ts (shared TS interfaces)
  components/
    ui/         (shadcn primitives)
  app/          (Next.js routes)
```

### DB connection (`src/lib/db.ts`)
- Mongoose singleton connection with caching.
- Read MONGO_URI from env.

### Models (6 Mongoose schemas)
1. **User** — name, email, phone, password (hashed), role (ADMIN/PARENT/COACH)
2. **Player** — fullName, dateOfBirth, position, teamCategory, parent (ref User), status
3. **FeeStructure** — name, amount, frequency, description, active
4. **Payment** — player (ref), parent (ref), amount, paymentMethod, reference, status (PENDING/SUCCESS/FAILED), paymentDate
5. **FeeRecord** — player (ref), feeStructure (ref), amountDue, amountPaid, balance, status (PAID/PARTIAL/UNPAID)
6. **Notification** — recipient (ref), type, message, sent, sentAt

### Theme colors (Tailwind v4 `@theme` in globals.css)
- Primary: `#065F46` (Deep Green)
- Secondary: `#10B981` (Emerald)
- Accent: `#F59E0B` (Gold)
- Background: `#F8FAFC`
- Text: `#0F172A`
- Paid: `#16A34A`, Pending: `#F59E0B`, Overdue: `#DC2626`, Partial: `#2563EB`

---

## Phase 1 — Authentication (Commit 2: `feat: add authentication`)

### API routes
- `POST /api/auth/register` — Register parent/admin
- `POST /api/auth/login` — Login, returns JWT (using `jose`)
- `GET /api/auth/me` — Get current user from token

### Auth utilities (`src/lib/auth.ts`)
- Hash passwords with bcryptjs
- Sign/verify JWTs with jose (Edge-compatible)
- Extract user from request headers

### proxy.ts (Next.js 16 middleware equivalent)
- Protect `/api/*` and `/(dashboard)/*` routes
- Redirect unauthenticated users to `/login`
- Check role-based access for admin-only routes

### Pages
- `src/app/(auth)/login/page.tsx` — Login form (react-hook-form + zod)
- `src/app/(auth)/register/page.tsx` — Registration form
- Redirect logged-in users to dashboard

---

## Phase 2 — Dashboard + Players + Fees (Commit 3: `feat: add dashboard, players and fee management`)

### Dashboard layout
- `src/app/(dashboard)/layout.tsx` — Auth check + layout wrapper
- `src/components/dashboard-layout.tsx` — Sidebar + header
- `src/components/sidebar.tsx` — Nav items based on role

### Dashboard home (`/dashboard`)
- Stat cards: Total Players, Total Revenue, Outstanding Fees, Monthly Collections, Unpaid Accounts
- Placeholder data initially, wired up in Phase 5

### Player management
- `GET/POST /api/players` — List / Create
- `GET/PUT/DELETE /api/players/[id]` — Read / Update / Delete
- `GET /api/players/[id]/payments` — Payment history for a player
- Pages: list, create, edit, detail

### Fee management
- `GET/POST /api/fees` — List / Create fee structures
- `PUT/DELETE /api/fees/[id]` — Update / Delete
- `GET/POST /api/fee-records` — List / Assign fee to player
- `PUT /api/fee-records/[id]` — Update record
- Pages: fee structures list, create, assign to players

---

## Phase 3 — Payment System (Commit 4: `feat: add Paystack payment system`)

### Server-side
- `POST /api/payments/initialize` — Create pending payment, init Paystack transaction
- `POST /api/payments/webhook` — Paystack webhook handler, verify + update DB
- `GET /api/payments/verify?reference=XXX` — Manual verification fallback
- `src/lib/paystack.ts` — Paystack API wrapper
- `src/services/payment-service.ts` — Transaction logic, balance calculations

### Client-side
- Pay Now button on player fee status page
- Payment history view
- Fee record status display (PAID/PARTIAL/UNPAID with badges)
- Balance calculation on fee records

---

## Phase 4 — Email + Reminders (Commit 5: `feat: add email notifications and automated reminders`)

### Email setup
- `src/lib/email.ts` — Nodemailer transport config
- `src/services/email-service.ts` — Send payment confirmation, reminder emails
- HTML email templates

### Reminder system
- `POST /api/reminders/send` — Trigger manual reminders
- `src/services/notification-service.ts` — Detect unpaid/partial accounts, send reminders, save history
- `src/lib/cron.ts` — node-cron job (every Monday) for automated reminders
- `src/app/api/cron/route.ts` — Vercel Cron endpoint alternative

### Notification history
- `src/app/(dashboard)/notifications/page.tsx` — View sent notifications

---

## Phase 5 — Reports (Commit 6: `feat: add reports and analytics`)

### API
- `GET /api/reports/payments` — Aggregated payment data
- `GET /api/reports/outstanding` — Outstanding fees with player info
- `GET /api/reports/dashboard` — Stats for dashboard cards

### Pages
- `src/app/(dashboard)/reports/page.tsx` — Report overview
- `src/app/(dashboard)/reports/payments/page.tsx` — Payment report (filterable)
- `src/app/(dashboard)/reports/outstanding/page.tsx` — Outstanding report

### Dashboard — wire real data
- Replace placeholder stat cards with real aggregation queries

---

## Commit Log

```
1. chore: setup project dependencies and database models
2. feat: add authentication
3. feat: add dashboard, players and fee management
4. feat: add Paystack payment system
5. feat: add email notifications and automated reminders
6. feat: add reports and analytics
```
