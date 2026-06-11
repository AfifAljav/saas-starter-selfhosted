# Contributing to saas-starter-selfhosted

Thank you for your interest in contributing! This guide explains how to get
involved.

---

## Code of Conduct

Be respectful and constructive. Harassment of any kind is not tolerated.

---

## How to Contribute

### Reporting Bugs

Open a [Bug Report](../issues/new?template=bug_report.md). Include as much
detail as possible: OS, Docker version, logs, and steps to reproduce.

### Requesting Features

Open a [Feature Request](../issues/new?template=feature_request.md). Check
the [roadmap](../README.md#roadmap) first to see if it is already planned.

### Submitting a Pull Request

1. **Fork** the repository and create a new branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Set up your dev environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your local values
   docker compose -f compose.yml -f compose.dev.yml up -d
   npm install
   npm run db:migrate
   ```

3. **Make your changes** following the code style guidelines below.

4. **Test locally:**
   ```bash
   npm run lint
   npm run typecheck
   # Test the full flow in the browser
   ```

5. **Commit** using conventional commit messages:
   - `feat: add Google OAuth provider`
   - `fix: correct session expiry calculation`
   - `docs: update quickstart guide`
   - `refactor: extract email sender to separate module`

6. **Open a Pull Request** using the [PR template](./PULL_REQUEST_TEMPLATE.md).

---

## Code Style Guidelines

- **TypeScript** — all code must be strongly typed. Avoid `any`.
- **No external dependencies without discussion** — keep the dep count low.
- **Self-hosted first** — new features must not require an external paid service.
- **Test your Docker setup** — changes to `compose.yml` must be tested end-to-end.
- **Keep PRs focused** — one feature or fix per PR.

---

## Project Structure

See the [README Architecture section](../README.md#architecture) for a full
explanation of the monorepo layout.

---

## Adding a New Billing Provider

1. Implement the `BillingAdapter` interface in `packages/billing/src/your-provider.ts`
2. Register it in `packages/billing/src/index.ts`
3. Document the new `BILLING_PROVIDER` value in `.env.example`
4. Add any required env vars to `packages/config/src/env.ts`

---

## Adding a New OAuth Provider

1. Add the provider in `packages/auth/src/providers/your-provider.ts` using Arctic
2. Add a new API route in `apps/web/app/api/auth/your-provider/`
3. Add the OAuth button to the login and register pages
4. Document the new env vars in `.env.example`

---

## Getting Help

Open a [Discussion](../discussions) if you have a question that is not a bug
or feature request.
