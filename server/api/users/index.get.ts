import { User } from '~~/server/database/models/User'

export default defineEventHandler(async () => {
  const users = await User.findAll()

  return {
    status: 'ok',
    users: users ?? []
  }
})
