import { User } from '~~/server/database/models/User'

type UserType = {
  name: string
  email: string
}

export default defineEventHandler(async () => {
  const users = await User.findAll() as UserType[]

  return {
    status: 'ok',
    users: users ?? []
  }
})
