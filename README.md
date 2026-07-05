# Football Academy Fee Register

A production-ready fee management system for youth football academies. Built with Next.js 16 (App Router), React 19, TypeScript, MongoDB, and Paystack.

---

## Features

- **Authentication** — JWT-based auth via `jose`, passwords hashed with `bcryptjs` (12 rounds), httpOnly session cookies
- **Role-based access** — Admin, Parent, and Coach roles with per-route protection
- **Player management** — Full CRUD with team categories, positions, and status tracking (ACTIVE / INACTIVE / GRADUATED)
- **Fee structures** — Create one-time, monthly, termly, or yearly fees with custom amounts
- **Fee records & auto-billing** — Assign fees to individual players or bill all active players with deduplication by period key
- **Paystack payments** — Initialize transactions, verify payments, and handle HMAC-signed webhooks
- **Manual payments** — Record offline/cash payments with FIFO allocation across unpaid fee records
- **Email notifications** — Payment confirmations and reminders via Nodemailer (gracefully disabled if SMTP is unconfigured)
- **Automated reminders** — Weekly cron job (Mondays 8 AM) via `node-cron`; also triggerable manually
- **Reports & analytics** — Aggregated dashboard stats, payment reports, and outstanding fees reports
- **Rate limiting** — In-memory per-key limiter on auth endpoints (login: 10/min, register: 5/hr)
- **Input validation** — Zod schemas on all API inputs with consistent error responses
- **Dark mode** — Theme support via `next-themes`

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19, TypeScript) |
| Database | MongoDB with Mongoose 9 |
| Auth | `jose` (JWT) + `bcryptjs` |
| Payments | Paystack (initialize, verify, webhook) |
| Email | Nodemailer (SMTP) |
| Scheduling | `node-cron` |
| Styling | Tailwind CSS v4 + shadcn/ui + `lucide-react` |
| Validation | Zod 4 |
| Testing | Vitest, Testing Library |

---

## Quickstart

```bash
git clone <repo-url>
cd fee-register
npm install
cp .env.example .env.local     # then edit with your values
npm run seed                    # seed sample data (optional)
npm run dev                     # start dev server at http://localhost:3000
```

### Seed credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@academy.com | admin123 |
| Parent (4 accounts) | jane.mwangi@email.com, peter.otieno@email.com, grace.kimani@email.com, samuel.wanjala@email.com | parent123 |

The seed script creates 4 fee structures, 4 parents, 8 players, and mixed-status fee records.

---

## Environment variables

All variables are validated at startup via a Zod schema in `src/env.ts`.

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs (min 32 characters) |
| `PAYSTACK_SECRET_KEY` | Yes | Paystack secret key (server-side) |
| `PAYSTACK_PUBLIC_KEY` | Yes | Paystack public key (client-side) |
| `SMTP_HOST` | No | SMTP server host (email skipped if unset) |
| `SMTP_PORT` | No | SMTP server port |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `EMAIL_FROM` | No | From address for emails |

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run seed` | Seed database with sample data |
| `npm run lint` | Run Biome checks |
| `npm run format` | Format code with Biome |
| `npm test` | Run Vitest (watch mode) |
| `npm run test:run` | Run Vitest once |
| `npm run test:coverage` | Run Vitest with coverage |

---

## Project structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/login              # Login page
│   ├── (auth)/register           # Registration page
│   ├── dashboard/                # Protected dashboard
│   │   ├── fees/                 # Fee structure CRUD & assignment
│   │   ├── players/              # Player CRUD & detail
│   │   ├── payments/             # Payment history & manual entry
│   │   ├── notifications/        # Notification history
│   │   └── reports/              # Payment & outstanding reports
│   └── api/v1/                   # REST API routes
├── components/                   # UI components
│   ├── sidebar.tsx               # Role-aware dashboard sidebar
│   ├── page-layout.tsx           # Dashboard layout wrapper
│   ├── pay-now-button.tsx        # Paystack payment button
│   ├── send-reminders-button.tsx # Manual reminder trigger
│   └── ui/                       # shadcn/ui primitives
├── lib/                          # Shared utilities
│   ├── auth.ts                   # JWT sign/verify, password hashing, session cookies
│   ├── db.ts                     # Mongoose singleton connection
│   ├── env.ts                    # Zod-validated environment
│   ├── email.ts                  # Nodemailer transport & HTML templates
│   ├── paystack.ts               # Paystack API wrapper
│   ├── validations.ts            # Zod schemas for API inputs
│   ├── errors.ts                 # ApiError class
│   ├── rate-limit.ts             # In-memory rate limiter
│   ├── cron.ts                   # Weekly reminder scheduler
│   ├── logger.ts                 # Structured JSON logger
│   ├── constants.ts              # Enums, currencies, page sizes
│   └── utils.ts                  # cn() Tailwind class merger
├── models/                       # Mongoose models
│   ├── User.ts                   # name, email, phone, password, role
│   ├── Player.ts                 # fullName, teamCategory, parent ref, status
│   ├── FeeStructure.ts           # name, amount, frequency, active
│   ├── FeeRecord.ts              # player ref, feeStructure ref, balance, status
│   ├── Payment.ts                # amount, reference, status, paymentMethod
│   └── Notification.ts           # recipient ref, type, message, sent
├── services/                     # Business logic
│   ├── fee-service.ts            # Fee structures, records, auto-billing
│   ├── player-service.ts         # Player CRUD with cascading deletes
│   ├── payment-service.ts        # Paystack flow, manual payments, FIFO allocation
│   ├── report-service.ts         # Aggregated dashboard/report queries
│   ├── notification-service.ts   # Create, send, and batch reminders
│   └── email-service.ts          # Email sending wrappers
├── scripts/
│   └── seed.ts                   # Database seeder
└── proxy.ts                      # Next.js 16 proxy (auth middleware)
```

---

## API reference

All API routes are under `src/app/api/v1/` unless otherwise noted.

### Auth

| Method | Path | Description | Auth | Rate limit |
|---|---|---|---|---|
| POST | `/api/v1/auth/login` | Login with email/password | No | 10/min/IP |
| POST | `/api/v1/auth/register` | Register new user | No | 5/hr/IP |
| POST | `/api/v1/auth/logout` | Clear session cookie | Yes | — |
| GET | `/api/v1/auth/me` | Get current user | Yes | — |

### Players

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/players` | List all players |
| POST | `/api/v1/players` | Create a player |
| GET | `/api/v1/players/[id]` | Get player by ID |
| PUT | `/api/v1/players/[id]` | Update player |
| DELETE | `/api/v1/players/[id]` | Delete player (cascades fee records & payments) |

### Fees

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/fees` | List fee structures |
| POST | `/api/v1/fees` | Create fee structure |
| GET | `/api/v1/fees/[id]` | Get fee structure |
| PUT | `/api/v1/fees/[id]` | Update fee structure |
| DELETE | `/api/v1/fees/[id]` | Delete fee structure |
| GET | `/api/v1/fee-records` | List fee records |
| POST | `/api/v1/fee-records` | Assign fee to player or auto-bill active players |
| PUT | `/api/v1/fee-records/[id]` | Update fee record amount paid |

### Payments

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/payments/initialize` | Initiate Paystack transaction | Yes |
| GET | `/api/v1/payments/verify` | Verify payment by reference | Yes |
| POST | `/api/payments/webhook` | Paystack webhook (HMAC-verified) | Signature |
| POST | `/api/v1/admin/payments/manual` | Record manual/offline payment | Admin |
| GET | `/api/v1/admin/payments/manual/players` | Players with outstanding balances | Admin |

### Reminders & Cron

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/reminders/send` | Trigger manual payment reminders |
| GET | `/api/v1/cron` | Cron-triggered batch reminder processing |

### Reports

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/reports/dashboard` | Aggregated dashboard stats |
| GET | `/api/v1/reports/payments` | Payment report |
| GET | `/api/v1/reports/outstanding` | Outstanding fees report |

### Other

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/health` | Database health check |

---

## Key design decisions

- **Auth** — JWT stored in an httpOnly `session` cookie, signed with `jose` (Edge-compatible), 7-day expiry
- **Security** — All API inputs validated with Zod; webhook HMAC-signed; rate-limited auth endpoints; `helmet`-style security headers in `next.config.ts`
- **Fee allocation** — Payments are allocated to fee records via FIFO within a MongoDB transaction, ensuring balance accuracy
- **Auto-billing** — `autoBillActivePlayers()` creates fee records for all active players (optionally filtered) with deduplication by `(player, feeStructure, periodKey)`
- **Email** — Nodemailer via SMTP; if `SMTP_HOST` is not configured, all email operations gracefully skip
- **Cascading deletes** — Deleting a player removes their fee records and payments; deleting a fee structure is safe (fee records keep the reference)
- **Styling** — Deep green (`#065F46`) / emerald (`#10B981`) / gold (`#F59E0B`) palette with Tailwind CSS v4

---

## Testing

```bash
npm test                # watch mode
npm run test:run        # single run
npm run test:coverage   # with coverage (lines ≥70%, functions ≥70%, branches ≥60%)
```

Tests use Vitest with jsdom. Test setup includes jest-dom matchers and `next/navigation` mocks. Existing tests cover Zod validation schemas (`src/lib/validations.test.ts`) and the `cn()` utility (`src/lib/utils.test.ts`).

---

## Deployment

Compatible with any Node.js 20+ hosting platform.

```bash
npm run build
npm run start
```

For Vercel deployment, configure a cron job or scheduled function as an alternative to `node-cron` (which relies on a long-running process).

---

## Contributing

1. Fork the repo and create a feature branch
2. Write tests where applicable
3. Open a PR with a clear description

See `./.prp/plan.md` for the phased build roadmap.

---

## License

This project does not include a license file. Add one if you intend to open-source.
