import { User } from '~~/server/database/models/User'

export default defineEventHandler(async (event) => {
  const { user: userAuth } = await requireUserSession(event)

  if (!userAuth?.id) {
    throw createError({
      statusCode: 400,
      data: {
        code: 'INVALID_ID',
      },
    })
  }

  const user = await User.findOne({
    where: { id: userAuth.id },
    attributes: ['id', 'name', 'email', 'avatarUrl', 'updatedAt']
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found.',
      data: {
        code: 'USER.NOT_FOUND',
      },
    })
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl
    }
  }
})
