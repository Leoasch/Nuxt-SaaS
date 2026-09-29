# Nuxt SaaS

[Português](README.md) | **English**

Management system for small stores: products, stock, sales and customers, with several organizations per account and role-based permissions.

**Live demo:** [nuxt-saas.onrender.com](https://nuxt-saas.onrender.com). Click **Explore the demo** to sign in to the sample account (Carla, owner of Moda Urbana Boutique). The data is restored every day at 03:00 (Brasília time). The free server sleeps when idle, so the first visit can take about a minute.

## Features

- **Accounts:** sign-up with email and password, email confirmation, password reset and Google sign-in.
- **Organizations:** several per account, email invites, roles (Owner, Admin, Manager, Employee) and ownership transfer.
- **Products:** SKU, barcode, cost and sale price, minimum stock and up to 10 photos per product.
- **Stock:** stock in and out with a reason and history, and low-stock alerts.
- **Sales:** several products per sale, adjustable price per item, payment method, cancellation that returns the stock, and filters by product and period.
- **Customers:** with email, phone and document.
- **Dashboard:** revenue, sales, average order value and active customers, a revenue chart, and best-selling and most profitable products.
- **Interface:** in Portuguese and English, with light and dark themes.

## Tech stack

- [Nuxt 4](https://nuxt.com), [Nuxt UI 4](https://ui.nuxt.com) (Tailwind CSS 4), [@nuxtjs/i18n](https://i18n.nuxtjs.org) and [Chart.js](https://www.chartjs.org)
- API on Nuxt's server (Nitro), with [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils) sessions, [Zod](https://zod.dev) validation and [nuxt-api-shield](https://github.com/rrd108/nuxt-api-shield) rate limiting
- PostgreSQL with [Sequelize](https://sequelize.org) and [Umzug](https://github.com/sequelize/umzug) migrations
- S3-compatible storage for images (MinIO in development)
- Email with [Nodemailer](https://nodemailer.com) ([Mailpit](https://mailpit.axllent.org) in development)
- Demo hosting: [Render](https://render.com) (app), [Neon](https://neon.com) (Postgres) and [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/) (images)

## Running locally

Requirements: Node.js 22 or newer, [pnpm](https://pnpm.io) and Docker.

1. Install the dependencies:

   ```bash
   pnpm install
   ```

2. Create the `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

   The defaults already match `docker-compose.yml`. Only set `NUXT_SESSION_PASSWORD` to a random string of at least 32 characters, for example the output of `openssl rand -hex 32`. Without it, the development server makes up a new password every time it starts, and everyone gets signed out.

3. Start Postgres, MinIO and Mailpit:

   ```bash
   docker compose up -d
   ```

   | Service | Address |
   | --- | --- |
   | Postgres | `localhost:5432` |
   | MinIO (S3) | `localhost:9000`, console at [localhost:9001](http://localhost:9001) (user and password `minioadmin`) |
   | Mailpit | SMTP on `localhost:1025`, inbox at [localhost:8025](http://localhost:8025) |

   The image bucket is created automatically when the server starts. Every email sent locally (confirmation, password reset and invites) shows up in the Mailpit inbox.

4. Fill the database with demo data (optional, see below):

   ```bash
   pnpm seed
   ```

5. Start the development server on `http://localhost:3000`:

   ```bash
   pnpm dev
   ```

### Google sign-in (optional)

Create an OAuth client of type "Web application" in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), add `http://localhost:3000/auth/google` as an authorized redirect URI, and set `NUXT_OAUTH_GOOGLE_CLIENT_ID` and `NUXT_OAUTH_GOOGLE_CLIENT_SECRET` in `.env`. Without them, the rest of the app works normally.

## Demo data

`pnpm seed` creates 10 users, 3 organizations (electronics, home & kitchen, fashion) with members and pending invites, 75 customers, 90 products with real photos of each product, and 90 days of sales, cancellations and stock movements. The photos come from [DummyJSON](https://dummyjson.com) and are cached in `.data/seed-cache`, so only the first run needs internet access.

- Running it again does nothing while the seed data exists. `pnpm seed --reset` deletes only what the seeder created and builds it again (your own data is never touched). It is also how you refresh the dates, since the sales are generated relative to the day you run it.
- It refuses to run with `NODE_ENV=production` unless you pass `--force`.
- Every seeded user has the password `Password123!`, for example `ana@seed.example.com` (owner of TechNova), `felipe@seed.example.com` (employee), `julia@seed.example.com` (two pending invites) or `lucas@seed.example.com` (no organization). The full list is printed when the seeder finishes.

## Migrations

The schema is versioned in `server/database/migrations` and applied with [Umzug](https://github.com/sequelize/umzug), which records what already ran in the `SequelizeMeta` table. Pending migrations run automatically when the server starts (and before `pnpm seed`), so a fresh clone needs no extra step. They can also be run by hand:

```bash
pnpm db:migrate          # apply pending migrations
pnpm db:migrate:down     # revert the last applied migration
pnpm db:migrate:status   # list applied and pending migrations
```

A database created before migrations existed (by the old `sequelize.sync()`) is detected on the first run: the baseline migration is marked as applied and only the later ones run.

To change the schema, add a new numbered file next to the others (e.g. `0004-add-supplier-to-products.ts`) exporting `up` and `down`, append it to the list in `migrations/index.ts`, and update the matching model. Never edit a migration that has already been applied; write a new one instead.

## Checks

```bash
pnpm lint
pnpm typecheck
```

Both run on GitHub Actions on every push.

## Production

Build the application for production:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

In production, set every variable from `.env.example` with that environment's values. Use `NUXT_DATABASE_SSL=true` for a Postgres that requires TLS (such as Neon), and set `NUXT_APP_URL` to the public address, which is used in email links. See the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more.

## Public demo

Setting `NUXT_PUBLIC_DEMO_EMAIL` to a seeded account (e.g. `carla@seed.example.com`) turns on demo mode:

- the login page shows an "Explore the demo" button that signs in to that account and opens its organization;
- every seeded account (`@seed.example.com`) is protected: password, profile, email and profile picture changes, account deletion, organization edits and deletion, ownership transfer, invites and member changes are refused, and password-reset emails aren't sent to them.

Leave it empty in development, where seed users behave like any other account.

To seed a hosted database from your machine, keep its settings in a separate file and point the seeder at it. Only that file is read, and any missing setting stops the script:

```bash
pnpm seed --env-file .env.deploy
pnpm db:migrate:status --env-file .env.deploy
```

The `reset-demo` GitHub Actions workflow runs `pnpm seed --reset` every night at 03:00 (Brasília time), which undoes whatever visitors changed and moves the sales to the current dates. It needs these repository secrets: `NUXT_DATABASE_HOST`, `NUXT_DATABASE_PORT`, `NUXT_DATABASE_NAME`, `NUXT_DATABASE_USER`, `NUXT_DATABASE_PASSWORD`, `NUXT_DATABASE_SSL`, `NUXT_S3_ENDPOINT`, `NUXT_S3_REGION`, `NUXT_S3_BUCKET`, `NUXT_S3_ACCESS_KEY_ID` and `NUXT_S3_SECRET_ACCESS_KEY`. It can also be started by hand from the Actions tab. GitHub pauses scheduled workflows after 60 days without activity in the repository; re-enable it from the same tab.

## License

[MIT](LICENSE)
