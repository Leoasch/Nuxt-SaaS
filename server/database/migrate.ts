// Usage: pnpm db:migrate | db:migrate:down | db:migrate:status

// Keep this import first: it installs `useRuntimeConfig` before the database module is loaded.
import '../seed/runtime'
import { parseArgs } from 'node:util'
import { sequelize } from '~~/server/database'
import { migrator, runMigrations } from '~~/server/database/migrator'

const { positionals: [command = 'up'] } = parseArgs({ allowPositionals: true })

async function main () {
  await sequelize.authenticate()

  if (command === 'up') {
    const applied = await runMigrations()

    if (applied.length === 0) {
      console.log('No pending migrations.')
    }
    return
  }

  if (command === 'down') {
    const reverted = await migrator.down()

    console.log(reverted.length > 0 ? `Migration reverted: ${reverted[0]!.name}` : 'No migration to revert.')
    return
  }

  if (command === 'status') {
    const [executed, pending] = await Promise.all([migrator.executed(), migrator.pending()])

    console.log('Applied:')
    console.log(executed.length > 0 ? executed.map(({ name }) => `  ${name}`).join('\n') : '  (none)')
    console.log('Pending:')
    console.log(pending.length > 0 ? pending.map(({ name }) => `  ${name}`).join('\n') : '  (none)')
    return
  }

  throw new Error(`Unknown command "${command}". Use up, down or status.`)
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await sequelize.close().catch(() => {})
}
