# Football Academy Fee Register

A production-ready fee management system for a youth football academy. This repository contains a Next.js (v16) application with an admin dashboard, player management, fee structures, Paystack payment integration, automated reminders, and reporting.

## Overview

The app tracks players, fee structures, fee records, and payments. Admins can create fee items, assign them to players, view outstanding balances, and trigger reminders. Parents can pay fees via Paystack and view payment history.

This README is based on the project plan at `./.prp/plan.md` — see that file for phased milestones and detailed design decisions.

## Features

- User authentication (JWT via `jose`, password hashing with `bcryptjs`)
- Role-based dashboard (ADMIN / PARENT / COACH)
- Player CRUD and payment history
- Fee structures and per-player fee records (balance tracking)
- Paystack integration (initialize, webhook, verify)
- Email notifications and automated reminders (nodemailer + node-cron)
- Reports and analytics endpoints for dashboard metrics

## Tech stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Mongoose (MongoDB)
- Paystack (payments)
- Nodemailer (email)
- node-cron (scheduled reminders)
- Tailwind CSS + shadcn UI primitives

Key dependencies are listed in `package.json`.

## Quickstart

1. Clone the repository

   git clone <repo-url>
   cd fee-register

2. Install dependencies

   npm install

3. Create environment variables

   Create a file named `.env.local` in the project root and set the variables below.

4. Seed sample data (optional)

   npm run seed

5. Run the dev server

   npm run dev

Open http://localhost:3000 in your browser.

## Environment variables

Create `.env.local` with the following (example names — adapt to your provider):

- `MONGO_URI` — MongoDB connection string
- `NEXT_PUBLIC_BASE_URL` — e.g. `http://localhost:3000`
- `JWT_SECRET` — secret used to sign JWTs
- `PAYSTACK_SECRET_KEY` — Paystack secret key (server side)
- `NEXT_PUBLIC_PAYSTACK_KEY` — Paystack public key (client side)
- `SMTP_HOST` — SMTP server host for email
- `SMTP_PORT` — SMTP server port
- `SMTP_USER` — SMTP username
- `SMTP_PASS` — SMTP password
- `NODE_ENV` — `development` or `production`

Notes:
- Keep secret keys out of source control.
- The `seed` script uses `.env.local` by default when run with `npm run seed`.

## Available npm scripts

- `npm run dev` — Run Next.js in development
- `npm run build` — Build for production
- `npm run start` — Start built app
- `npm run seed` — Run `src/scripts/seed.ts` to populate sample data
- `npm run lint` — Run biome checks
- `npm run format` — Format with biome

## Project structure (high level)

src/
- app/ — Next.js routes and pages (auth, dashboard, API handlers)
- components/ — UI components and shadcn primitives
- lib/ — shared utilities (`db.ts`, `auth.ts`, `paystack.ts`, `email.ts`, `cron.ts`)
- models/ — Mongoose models (User, Player, Payment, FeeRecord, FeeStructure, Notification)
- services/ — business logic (player-service, payment-service, email-service, etc.)
- scripts/ — helper scripts (e.g., `seed.ts`)

Refer to `./.prp/plan.md` for a phase-by-phase breakdown of features and implementation notes.

## API endpoints (summary)

Key API routes exist under `src/app/api/` and include (non-exhaustive):

- `/api/auth/*` — register, login, me
- `/api/players/*` — players CRUD and payments
- `/api/fees/*` — fee structures and fee records
- `/api/payments/*` — initialize, verify, webhook
- `/api/reminders/send` — trigger reminders
- `/api/reports/*` — aggregated reports for the dashboard

Explore the `src/app/api` folder for full details and route implementations.

## Deployment

This project is compatible with platforms that support Next.js 16 (Node.js environment). Typical deploy steps:

1. Set environment variables in your hosting provider.
2. Build: `npm run build`
3. Start: `npm run start` (or use platform-specific start)

If deploying to Vercel, ensure any serverless cron alternative or scheduled function is set up for automated reminders.

## Contributing

1. Fork the repo and create a feature branch
2. Write tests where applicable
3. Open a PR with a clear description of changes

See `./.prp/plan.md` for suggested commit milestones and phase ordering.

## License

This project does not include a license file. Add a license if you intend to open-source this repo.

---

If you'd like, I can also:

- Add an `ENV.example` file with the variables above
- Add a short CONTRIBUTING.md or templates
- Update the `seed` script to generate admin/test credentials and document them here

Please tell me which of the above you'd like next.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
