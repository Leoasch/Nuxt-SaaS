// Usage: pnpm seed [--reset] [--force]
//   (no flag)  seed the database, or do nothing when it was already seeded
//   --reset    delete what the seeder created earlier (only that) and seed again
//   --force    allow running with NODE_ENV=production

// Keep this import first: it installs `useRuntimeConfig` before the models are loaded.
// (A bare import, so the bundler can't drop it as unused.)
import './runtime'
import { parseArgs } from 'node:util'
import { sequelize } from '~~/server/database'
import { registerAssociations } from '~~/server/database/associations'
import { ensureBucket, s3 } from '~~/server/utils/storage'
import { imageStats } from './catalog'
import type { SeedDataset } from './dataset'
import { buildDataset } from './dataset'
import { insertDataset, isSeeded, resetSeedData } from './persist'
import { SEED_PASSWORD } from './people'

const { values: flags } = parseArgs({
  options: {
    reset: { type: 'boolean', default: false },
    force: { type: 'boolean', default: false }
  }
})

function printSummary (dataset: SeedDataset) {
  const counts: [string, number][] = [
    ['users', dataset.users.length],
    ['organizations', dataset.organizations.length],
    ['memberships', dataset.memberships.length],
    ['customers', dataset.customers.length],
    ['products', dataset.products.length],
    ['product images', dataset.productImages.length],
    ['stock movements', dataset.stockMovements.length],
    ['sales', dataset.sales.length],
    ['sale items', dataset.saleItems.length]
  ]

  console.log('\nSeeded:')

  for (const [label, count] of counts) {
    console.log(`  ${label.padEnd(16)} ${count}`)
  }

  console.log(`  (images: ${imageStats.downloaded} downloaded, ${imageStats.cached} from cache)`)
  console.log(`\nLogins (password for all of them: ${SEED_PASSWORD})`)

  for (const login of dataset.logins) {
    console.log(`  ${login.email.padEnd(30)} ${login.access.length > 0 ? login.access.join(', ') : 'no organization'}`)
  }
}

async function main () {
  if (process.env.NODE_ENV === 'production' && !flags.force) {
    throw new Error('Refusing to seed with NODE_ENV=production. Pass --force if you really mean it.')
  }

  const config = useRuntimeConfig()

  console.log(
    `Database ${config.databaseUser}@${config.databaseHost}:${config.databasePort}/${config.databaseName}, ` +
    `bucket "${config.s3Bucket}" at ${config.s3Endpoint}`
  )

  // Same initialization as server/plugins/database.ts and storage.ts, so this works on a fresh database too.
  registerAssociations()
  await sequelize.authenticate()
  await sequelize.sync({ alter: true })
  await ensureBucket()

  if (!flags.reset && await isSeeded()) {
    console.log('Already seeded. Run "pnpm seed --reset" to delete the seeded data and create it again.')
    return
  }

  // Everything that can fail on the network happens before the first write to the database.
  console.log('Building dataset…')
  const dataset = await buildDataset(new Date())

  if (flags.reset) {
    const removed = await resetSeedData()

    console.log(`Removed previous seed data (${removed.users} users, ${removed.organizations} organizations, ${removed.objects} objects).`)
  }

  await insertDataset(dataset)
  printSummary(dataset)
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await sequelize.close().catch(() => {})
  s3.destroy()
  process.exit()
}
