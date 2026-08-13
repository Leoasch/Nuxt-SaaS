import { sequelize } from '../database'

export default defineEventHandler(async () => {
  await sequelize.authenticate()

  return {
    status: 'ok',
    database: 'connected'
  }
})
