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

### Migrations

The schema is versioned in `server/database/migrations` and applied with [Umzug](https://github.com/sequelize/umzug), which records what already ran in the `SequelizeMeta` table. Pending migrations run automatically when the server starts (and before `pnpm seed`), so a fresh clone needs no extra step. They can also be run by hand:

```bash
pnpm db:migrate          # apply pending migrations
pnpm db:migrate:down     # revert the last applied migration
pnpm db:migrate:status   # list applied and pending migrations
```

A database created before migrations existed (by the old `sequelize.sync()`) is detected on the first run: the baseline migration is marked as applied and only the later ones run.

To change the schema, add a new numbered file next to the others (e.g. `0003-add-supplier-to-products.ts`) exporting `up` and `down`, append it to the list in `migrations/index.ts`, and update the matching model. Never edit a migration that has already been applied; write a new one instead.

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

## Public demo

Setting `NUXT_PUBLIC_DEMO_EMAIL` to a seeded account (e.g. `carla@seed.example.com`) turns on demo mode:

- the login page shows an "Explore the demo" button that signs in to that account and opens its organization;
- every seeded account (`@seed.example.com`) is protected: password, profile, email and profile picture changes, account deletion, organization edits and deletion, ownership transfer, invites and member changes are refused, and password-reset emails aren't sent to them.

Leave it unset locally, where seed users behave like any other account.

To seed a hosted database from your machine, keep its settings in a separate file and point the seeder at it. Only that file is read, and any missing setting stops the script:

```bash
pnpm seed --env-file .env.deploy
pnpm db:migrate:status --env-file .env.deploy
```

The `reset-demo` GitHub Actions workflow runs `pnpm seed --reset` every night at 03:00 (Brasília), which undoes whatever visitors changed and moves the sales to the current dates. It needs these repository secrets: `NUXT_DATABASE_HOST`, `NUXT_DATABASE_PORT`, `NUXT_DATABASE_NAME`, `NUXT_DATABASE_USER`, `NUXT_DATABASE_PASSWORD`, `NUXT_DATABASE_SSL`, `NUXT_S3_ENDPOINT`, `NUXT_S3_REGION`, `NUXT_S3_BUCKET`, `NUXT_S3_ACCESS_KEY_ID` and `NUXT_S3_SECRET_ACCESS_KEY`. It can also be started by hand from the Actions tab. GitHub pauses scheduled workflows after 60 days without activity in the repository; re-enable it from the same tab.