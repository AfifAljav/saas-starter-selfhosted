# saas-starter-selfhosted

> **Open-source, self-hostable SaaS boilerplate — auth, billing, multi-tenancy, Docker Compose.**  
> No Vercel. No Supabase. One `docker compose up`.

[![CI](https://github.com/AfifAljav/saas-starter-selfhosted/actions/workflows/ci.yml/badge.svg)](https://github.com/AfifAljav/saas-starter-selfhosted/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)

---

## Why?

Every popular SaaS starter makes the same trade: convenience for vendor dependency.

- Vercel bills $20–200/month before you have paying users
- Supabase free tier limits force premature upgrades
- Resend, Loops, and similar services add $20–50/month for email
- User data, analytics, and emails all flow through servers you don't control
- Paid alternatives (Shipfast, Supastarter, Makerkit) cost $100–300 and are not open source

**This starter runs entirely on a $6 VPS. Everything is on your servers.**

---

## What's Included

| Feature | Implementation |
|---|---|
| Email + password auth | Lucia v3 (self-hosted, no third-party) |
| OAuth | GitHub + Google (Arctic, extensible) |
| Password security | Argon2id |
| Rate limiting | Redis-based, 5 attempts / 15 min / IP |
| Multi-tenant organizations | Owner / Admin / Member roles |
| Member invites | Email invite with token + expiry |
| Subscription billing | Stripe (Paddle adapter available) |
| Self-serve billing portal | Stripe Customer Portal |
| Transactional email | Nodemailer + React Email templates |
| Email providers | SMTP (self-hosted), Resend, AWS SES |
| Analytics | Umami (self-hosted, no cookies, GDPR) |
| Database | PostgreSQL 16 + Drizzle ORM |
| Cache / queue | Redis 7 |
| Reverse proxy | Caddy (automatic HTTPS) |
| Containerization | Docker Compose (single command) |
| Dark mode | next-themes |
| Monorepo | Turborepo |

---

## Quick Start

### Prerequisites

- Docker and Docker Compose v2
- A domain name (for production TLS)

### 1 — Clone and configure

```bash
git clone https://github.com/AfifAljav/saas-starter-selfhosted.git
cd saas-starter-selfhosted
cp .env.example .env
```

Open `.env` and set at minimum:

```env
DB_PASSWORD=your-secure-password
AUTH_SECRET=your-32-char-secret   # openssl rand -base64 32
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=mailhog                  # use mailhog in dev
```

### 2 — Start the stack (development)

```bash
docker compose -f compose.yml -f compose.dev.yml up
```

| Service | URL |
|---|---|
| Next.js app | http://localhost:3000 |
| Umami analytics | http://localhost:3001 |
| React Email preview | http://localhost:3002 |
| Mailhog (email UI) | http://localhost:8025 |

### 3 — Run migrations

```bash
npm install
npm run db:migrate
```

### 4 — Production deployment

```bash
# Edit .env — set your real domain, SMTP, Stripe keys, etc.
# Edit Caddyfile — replace yourdomain.com

docker compose up -d
```

Caddy automatically provisions a Let's Encrypt TLS certificate.

---

## Architecture

```
saas-starter-selfhosted/
├── apps/
│   └── web/                          # Next.js 15 (App Router)
│       ├── app/
│       │   ├── (auth)/               # login, register, reset-password
│       │   ├── (dashboard)/          # protected routes
│       │   │   ├── dashboard/
│       │   │   ├── settings/profile/
│       │   │   ├── settings/team/
│       │   │   ├── settings/billing/
│       │   │   └── onboarding/
│       │   └── api/
│       │       ├── auth/[...lucia]/   # login, register, logout, OAuth
│       │       └── webhooks/stripe/   # Stripe webhook handler
│       └── components/
│           ├── ui/                    # shadcn/ui base components
│           └── app/                   # Sidebar, UserNav, etc.
├── packages/
│   ├── config/                        # Zod env validation + plan config
│   ├── db/                            # Drizzle schema + migrations
│   ├── auth/                          # Lucia v3 + OAuth providers
│   ├── billing/                       # Stripe + Paddle adapter interface
│   └── email/                         # React Email templates + Nodemailer
├── compose.yml                        # Production stack
├── compose.dev.yml                    # Dev overrides (Mailhog, hot reload)
├── Caddyfile                          # Reverse proxy + HTTPS
└── .env.example                       # All variables documented
```

### Service topology

```
Internet
    │
    ▼
Caddy (80/443) ── automatic HTTPS
    │
    ▼
Next.js app (3000) ── PostgreSQL (5432)
         │          └── Redis (6379)
         │
         ├── Stripe webhook receiver
         ├── Lucia session management
         └── Nodemailer → SMTP / Resend / SES

Umami (3001) ── PostgreSQL (shared)
```

---

## Configuration Reference

All variables are documented in [`.env.example`](.env.example).

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `AUTH_SECRET` | ✅ | 32+ char secret for session signing |
| `EMAIL_PROVIDER` | ✅ | `smtp` \| `resend` \| `ses` |
| `BILLING_PROVIDER` | ✅ | `stripe` \| `paddle` |
| `STRIPE_SECRET_KEY` | If using Stripe | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | If using Stripe | Webhook signing secret |
| `GITHUB_CLIENT_ID` | Optional | Enable GitHub OAuth |
| `GOOGLE_CLIENT_ID` | Optional | Enable Google OAuth |

---

## Email Templates

All templates are React Email components, previewed at `localhost:3002` in dev.

```bash
npm run email:dev
```

| Template | Trigger |
|---|---|
| `verify-email` | New registration |
| `reset-password` | Password reset request |
| `invite-member` | Organization invite |
| `welcome` | Email verified, first login |
| `subscription-active` | Successful payment |
| `subscription-failed` | Invoice payment failed |
| `subscription-cancelled` | Subscription cancelled |

---

## Billing

### Swap providers

Set `BILLING_PROVIDER=paddle` in `.env`. The Paddle adapter implements the
same `BillingAdapter` interface — no changes needed in the app code.

### Stripe setup

1. Create a Stripe account and get your API keys
2. Set `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
3. Create products and prices in Stripe dashboard
4. Set `STRIPE_PRICE_ID_PRO_MONTHLY` etc. in `.env`
5. Configure webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`

Webhook events handled:
- `checkout.session.completed` — activate subscription
- `customer.subscription.updated` — plan change
- `customer.subscription.deleted` — downgrade to free
- `invoice.payment_failed` — mark as past due, notify owner

---

## Database Schema

Core tables (see `packages/db/src/schema/` for full definitions):

```
users           — email, hashed_password, name, avatar_url
sessions        — Lucia sessions (expires_at)
oauth_accounts  — GitHub / Google accounts linked to users
organizations   — name, slug, owner_id
memberships     — org_id, user_id, role (owner | admin | member)
invites         — org_id, email, role, token_hash, expires_at
subscriptions   — org_id (unique), plan, status, period_end
billing_events  — audit log of all webhook events
```

---

## Roadmap

| Phase | Target | Features |
|---|---|---|
| v1.0 | Month 1 | Auth, orgs, Stripe billing, dashboard, email, Umami, Docker |
| v1.1 | Month 2 | Paddle adapter, E2E tests (Playwright), GitHub Actions |
| v2.0 | Month 4 | API-only mode, usage-based billing |
| v2.1 | Month 6 | Kubernetes Helm chart, audit log |

---

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md).

Pull requests are welcome! Please check the [open issues](../../issues) and
the [roadmap](#roadmap) before starting work on a large feature.

---

## License

[MIT](LICENSE) — free to use for commercial and personal projects.

---

*Built with ❤️ for indie hackers, solo founders, and teams who want full data ownership.*
