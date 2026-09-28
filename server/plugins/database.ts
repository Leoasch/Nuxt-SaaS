import { sequelize } from '../database'
import { registerAssociations } from '../database/associations'
import { runMigrations } from '../database/migrator'

export default defineNitroPlugin(async () => {
  registerAssociations()

  await sequelize.authenticate()
  await runMigrations()

  console.log('PostgreSQL connected')
})
