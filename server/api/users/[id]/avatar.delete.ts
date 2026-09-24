import { User } from '~~/server/database/models/User'
import { deleteObject } from '~~/server/utils/storage'

export default defineEventHandler(async (event) => {
  const { user: sessionUser } = await requireUserSession(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      data: {
        code: 'INVALID_ID',
      },
    })
  }

  if (id !== sessionUser.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You can only update your own avatar.',
      data: {
        code: 'USER.NOT_ALLOWED',
      },
    })
  }

  const user = await User.findOne({ where: { id } })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found.',
      data: {
        code: 'USER.NOT_FOUND',
      },
    })
  }

  if (user.avatarKey) {
    await deleteObject(user.avatarKey)
    user.avatarKey = null
    await user.save()
  }

  await replaceUserSession(event, {
    user: { ...sessionUser, avatarUrl: null }
  })

  return { avatarUrl: null }
})
