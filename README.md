# Nuxt Starter Template

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Use this template to get started with [Nuxt UI](https://ui.nuxt.com) quickly.

- [Live demo](https://starter-template.nuxt.dev/)
- [Documentation](https://ui.nuxt.com/docs/getting-started/installation/nuxt)

<a href="https://starter-template.nuxt.dev/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://ui.nuxt.com/assets/templates/nuxt/starter-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://ui.nuxt.com/assets/templates/nuxt/starter-light.png">
    <img alt="Nuxt Starter Template" src="https://ui.nuxt.com/assets/templates/nuxt/starter-light.png" width="830" height="466">
  </picture>
</a>

> The starter template for Vue is on https://github.com/nuxt-ui-templates/starter-vue.

## Quick Start

```bash [Terminal]
npm create nuxt@latest -- -t ui
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-name=starter&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fstarter&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Fstarter-dark.png&demo-url=https%3A%2F%2Fstarter-template.nuxt.dev%2F&demo-title=Nuxt%20Starter%20Template&demo-description=A%20minimal%20template%20to%20get%20started%20with%20Nuxt%20UI.)

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Database, storage and demo data

Postgres and MinIO (S3) run from the compose file; the defaults in `.env.example` match it, so no extra configuration is needed:

```bash
cp .env.example .env
docker compose up -d
pnpm seed
```

`pnpm seed` fills the database with 10 users, 3 organizations (electronics, home & kitchen, fashion) with memberships and pending invites, ~75 customers, 90 products with real photos that match each product, and 90 days of sales, cancellations and stock movements. Product photos come from [DummyJSON](https://dummyjson.com) and are cached in `.data/seed-cache`, so only the first run needs internet access.

- Running it again does nothing while the seed data exists. `pnpm seed --reset` deletes only what the seeder created and builds it again (your own data is never touched); it is also how you refresh the dates, since the sales are generated relative to the day you run it.
- It refuses to run with `NODE_ENV=production` unless you pass `--force`.
- Every seeded user has the password `Password123!`, for example `ana@seed.example.com` (owner of TechNova), `felipe@seed.example.com` (employee), `julia@seed.example.com` (two pending invites) or `lucas@seed.example.com` (no organization). The full list is printed when the seeder finishes.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Renovate integration

Install [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) on your repository and you are good to go.
