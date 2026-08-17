import { sequelize } from '../database'
import { registerAssociations } from '../database/associations'

export default defineNitroPlugin(async () => {
  registerAssociations()

  await sequelize.authenticate()
  await sequelize.sync({ alter: true })

  console.log('PostgreSQL connected and synched')
})
