import { SequelizeStorage, Umzug } from 'umzug'
import { sequelize } from '.'
import { MIGRATIONS } from './migrations'

const BASELINE_MIGRATION = '0001-baseline'

const queryInterface = sequelize.getQueryInterface()
const storage = new SequelizeStorage({ sequelize })

export const migrator = new Umzug({
  migrations: MIGRATIONS,
  context: queryInterface,
  storage,
  logger: undefined
})

async function adoptSyncedDatabase () {
  const executed = await migrator.executed()

  if (executed.length > 0 || !await queryInterface.tableExists('users')) {
    return
  }

  await storage.logMigration({ name: BASELINE_MIGRATION })
  console.log(`Existing database created by sync(): marked ${BASELINE_MIGRATION} as applied`)
}

export async function runMigrations () {
  await adoptSyncedDatabase()

  const applied = await migrator.up()

  for (const { name } of applied) {
    console.log(`Migration applied: ${name}`)
  }

  return applied
}
