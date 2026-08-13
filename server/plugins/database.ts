import { sequelize } from '../database'
import '../database/models/User'

export default defineNitroPlugin(async () => {
  await sequelize.authenticate()
  await sequelize.sync()

  console.log('PostgreSQL connected and synched')
})
