<div align="center">

# 🚀 Remix + Neon AI App Template

A production-ready Remix template for building **AI-generated web applications** with:

- **Email verification login**
- **JWT-based authentication**
- **Neon / PostgreSQL**
- **Drizzle ORM**
- **Tailwind CSS**
- **Hosted payment integration**
- **AI-friendly deployment conventions**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Remix](https://img.shields.io/badge/Remix-000000?logo=remix&logoColor=white)](https://remix.run/)
[![Neon](https://img.shields.io/badge/Neon-00E5A7?logo=neon&logoColor=white)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Template-first** • **Payment-ready** • **AI-deployment-friendly**

</div>

---

## What this repository is for

This repository is not just a demo app.

It is designed to be a **template project** that your AI-powered deployment platform can read, modify, and turn into a real application implementation.

Typical usage looks like this:

1. Start from this template
2. Let AI adapt the app for a business scenario
3. Inject environment variables from your platform
4. Run migrations
5. Deploy the Remix app
6. Verify auth and payment flows

That makes this repository a good foundation for:

- SaaS products
- AI tools
- membership apps
- subscription products
- internal platforms
- MVPs that need fast delivery

---

## Key features

### Authentication

- Passwordless email verification login
- JWT-based authenticated sessions
- Same-origin API auth conventions
- Server-friendly auth helpers

### Database

- Neon / PostgreSQL compatible
- Drizzle ORM schema + migrations
- API-based migration and seed workflow supported

### Payments

- Hosted checkout integration
- Product listing via `/pricing`
- Server-side checkout link creation
- Success and cancel return pages
- Environment-based payment configuration

### DX / Platform fit

- TypeScript-first
- Clear route/service separation
- AI-friendly repository layout
- Centralized environment handling
- Documentation for deployment, API, env, FAQ, and project structure

---

## Built-in routes

### Pages

| Route          | Purpose                         |
| -------------- | ------------------------------- |
| `/`            | Landing page / app entry        |
| `/login`       | Email verification login        |
| `/pricing`     | Product list and checkout entry |
| `/pay/success` | Payment success page            |
| `/pay/cancel`  | Payment cancellation page       |

### API routes

| Method | Route                    | Purpose                        |
| ------ | ------------------------ | ------------------------------ |
| `POST` | `/api/auth/send-code`    | Send login verification code   |
| `POST` | `/api/auth/verify-login` | Verify code and sign in        |
| `POST` | `/api/auth/logout`       | Logout current user            |
| `GET`  | `/api/auth/me`           | Get current authenticated user |
| `POST` | `/api/pay/create`        | Create hosted payment link     |

---

## Payment flow overview

The current template already includes a basic hosted checkout flow:

1. The app loads products from the payment provider
2. The user logs in
3. The user visits `/pricing`
4. The user clicks **Buy now**
5. The server creates a hosted checkout link
6. The user is redirected to the payment page
7. After checkout, the user returns to:
   - `/pay/success`, or
   - `/pay/cancel`

Important: this template handles **payment initiation**, but real production fulfillment usually still needs:

- order persistence
- webhook verification
- entitlement granting
- subscription activation
- billing reconciliation

---

## Quick start

### Prerequisites

- Node.js `20+`
- `pnpm`
- PostgreSQL / Neon database
- Optional: Resend account for email delivery
- Optional: payment service credentials for checkout integration

### 1) Install dependencies

```bash
pnpm install
```

### 2) Copy environment variables

```bash
cp .env.example .env
```

### 3) Configure minimum local environment

At minimum, configure:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
APP_URL=http://localhost:5173
```

Optional email:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxx
```

Optional payment:

```env
PAY_BASE_URL=https://pay.d1v.ai/api
PAY_API_TOKEN=your_payment_api_token
PAY_SUCCESS_URL=http://localhost:5173/pay/success
PAY_CANCEL_URL=http://localhost:5173/pay/cancel
```

### 4) Run database migration

Preferred workflow:

```bash
pnpm run db:migrate:api
```

If you intentionally want direct DB mode:

```bash
pnpm run db:migrate
```

### 5) Start development server

```bash
pnpm run dev
```

### 6) Type check after changes

```bash
pnpm run typecheck
```

---

## Database workflow

This repository defaults to **API-based migration mode**.

### Recommended

```bash
pnpm run db:migrate:api
pnpm run db:seed:api
```

### Optional direct DB mode

```bash
pnpm run db:migrate
pnpm run db:seed
```

### Why API mode is preferred

It helps avoid exposing raw database credentials to every local or automation process and aligns better with managed deployment workflows.

### API mode environment

Required:

- `PROJECT_ID`
- `OPCODE_API_BASE` or `BACKEND_ADMIN_API_BASE`
- `AUTH_TOKEN`

Optional:

- `MIGRATIONS_FOLDER`
- `SEED_FILE`

---

## Environment variables

### Core

- `DATABASE_URL`
- `JWT_SECRET`
- `APP_URL`
- `NODE_ENV`
- `LOG_LEVEL`

### Email

- `RESEND_API_KEY`

### Payment

- `PAY_BASE_URL`
- `PAY_API_TOKEN`
- `PAY_SUCCESS_URL`
- `PAY_CANCEL_URL`

For full details, see:

- `docs/ENVIRONMENT.md`

---

## Available scripts

```bash
pnpm run dev
pnpm run build
pnpm run start

pnpm run typecheck
pnpm run typecheck:watch

pnpm run lint
pnpm run lint:fix

pnpm run format
pnpm run format:fix

pnpm run db:migrate
pnpm run db:migrate:api
pnpm run db:seed
pnpm run db:seed:api
```

---

## AI deployment platform usage

This template is especially suitable for an AI-driven application deployment platform.

### Recommended platform responsibilities

Your platform should ideally:

1. Clone or generate from this template
2. Update branding, copy, schema, and business logic
3. Inject environment variables securely
4. Run migrations
5. Run type checks
6. Build and deploy the Remix app
7. Validate auth and payment flows

### Recommended platform-managed values

- `APP_URL`
- `JWT_SECRET`
- `DATABASE_URL`
- `RESEND_API_KEY` when email is enabled
- `PAY_BASE_URL` and `PAY_API_TOKEN` when payment is enabled
- payment success/cancel URLs when custom domains are used

### Why this template works well for AI

- Predictable route structure
- Centralized service layer
- Explicit env management
- Minimal hidden conventions
- Docs written for extension and deployment

---

## Project structure

```text
remix-neon-auth-template/
├── app/
│   ├── components/
│   ├── constants/
│   ├── db/
│   ├── routes/
│   │   ├── _index.tsx
│   │   ├── login.tsx
│   │   ├── pricing.tsx
│   │   ├── pay.success.tsx
│   │   ├── pay.cancel.tsx
│   │   ├── api.auth.send-code.ts
│   │   ├── api.auth.verify-login.ts
│   │   ├── api.auth.logout.ts
│   │   ├── api.auth.me.ts
│   │   └── api.pay.create.ts
│   ├── services/
│   │   ├── jwt.server.ts
│   │   ├── verification.server.ts
│   │   └── payment.server.ts
│   ├── utils/
│   │   ├── auth.server.ts
│   │   ├── env.server.ts
│   │   └── logger.server.ts
│   ├── entry.client.tsx
│   ├── entry.server.tsx
│   ├── root.tsx
│   └── tailwind.css
├── docs/
├── drizzle/
├── public/
├── scripts/
├── AGENTS.md
├── package.json
└── README.md
```

For more detail, see:

- `docs/PROJECT_STRUCTURE.md`

---

## Deployment

### Standard app deployment flow

1. Set environment variables
2. Run migrations
3. Run type check
4. Build the app
5. Start the app
6. Verify login and payment flows

### Build

```bash
pnpm run build
```

### Start

```bash
pnpm run start
```

### Production checks

Before considering deployment complete, verify:

- homepage loads
- login works
- verification email flow works
- `/pricing` loads products
- checkout link creation works
- success redirect works
- cancel redirect works
- environment warnings are resolved
- type check passes

For more detail, see:

- `docs/DEPLOYMENT.md`

---

## What to customize first

If you are adapting this template into a real product, the usual first changes are:

1. App name and branding
2. Homepage copy
3. Login UX details
4. Database schema for business data
5. Pricing presentation
6. Post-payment fulfillment logic
7. Dashboard / protected areas
8. Documentation for the generated project

---

## Recommended next payment improvements

The current integration is a strong starting point, but most production apps should eventually add:

- webhook verification
- order table
- subscription table
- entitlement management
- transaction history UI
- retry-safe fulfillment
- admin billing visibility

---

## Documentation index

- `docs/API.md` — API behavior and examples
- `docs/ENVIRONMENT.md` — environment variable reference
- `docs/DEPLOYMENT.md` — deployment and operational guide
- `docs/FAQ.md` — common questions and troubleshooting
- `docs/PROJECT_STRUCTURE.md` — repository architecture
- `docs/CONTRIBUTING.md` — contribution conventions

---

## Security notes

- Never commit real secrets
- Keep `DATABASE_URL` server-side
- Keep `JWT_SECRET` private
- Keep `PAY_API_TOKEN` server-side only
- Keep return URLs aligned with the deployed domain
- Treat redirect pages as UX only, not as full payment verification

---

## Final summary

This repository gives you a practical foundation for:

- auth-enabled apps
- payment-enabled apps
- AI-generated app delivery
- platform-managed deployments

It is intentionally structured so that both **engineers** and **AI systems** can understand it quickly, modify it safely, and deploy it predictably.

If you are using this as a base template, the simplest mindset is:

**keep the template stable, inject configuration through the platform, and let AI customize the business layer on top.**
